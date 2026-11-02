import os
import re
import ipaddress
import logging
import httpx
import resend
import secrets
from html import escape
from html.parser import HTMLParser
from urllib.parse import urlparse

logger = logging.getLogger(__name__)

EMAIL_BASE_URL = "https://integrations.emergentagent.com"
EMAIL_PROVIDER = os.environ.get("EMAIL_PROVIDER", "managed").lower()
EMAIL_FROM_NAME = os.environ["EMAIL_FROM_NAME"]
EMAIL_REPLY_TO = os.environ.get("EMAIL_REPLY_TO")

_SHORTENERS = ("bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "goo.gl", "rebrand.ly")
_CRED_ASK = ("reply with your password", "reply with the code", "send your password", "cvv",
             "send us your password", "enter your password below", "confirm your card number",
             "your full card number", "seed phrase", "recovery phrase", "verify your card",
             "social security number", "confirm your bank details")
_HOSTISH = re.compile(r"\b(?:https?://)?((?:[a-z0-9-]+\.)+[a-z]{2,})", re.I)


def _host_ok(host: str) -> bool:
    if not host or "xn--" in host:
        return False
    try:
        ipaddress.ip_address(host)
        return False
    except ValueError:
        pass
    return not any(host == s or host.endswith("." + s) for s in _SHORTENERS)


def _same_site(shown: str, real: str) -> bool:
    return shown == real or real.endswith("." + shown) or shown.endswith("." + real)


class _EmailScan(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags, self.urls, self.anchors = set(), [], []
        self._href, self._text = None, []

    def handle_starttag(self, tag, attrs):
        self.tags.add(tag.lower())
        self.urls += [v for k, v in attrs if k.lower() in ("href", "src") and v]
        if tag.lower() == "a":
            self._href = dict((k.lower(), v) for k, v in attrs).get("href")
            self._text = []

    def handle_data(self, data):
        if self._href is not None:
            self._text.append(data)

    def handle_endtag(self, tag):
        if tag.lower() == "a" and self._href is not None:
            self.anchors.append((self._href, "".join(self._text)))
            self._href, self._text = None, []


def _assert_safe_email(subject: str, html: str) -> None:
    scan = _EmailScan()
    scan.feed(html)
    if scan.tags & {"form", "input", "textarea", "select"}:
        raise ValueError("No forms or input fields in email (G2)")
    body = f"{subject}\n{html}".lower()
    for p in _CRED_ASK:
        if p in body:
            raise ValueError(f"Email asks the recipient for credentials: {p!r} (G2)")
    for url in scan.urls:
        low = url.strip().lower()
        if low.startswith(("mailto:", "tel:", "cid:", "#")):
            continue
        if not low.startswith("https://"):
            raise ValueError(f"Email links/assets must be absolute https: {url!r} (G3)")
        host = urlparse(low).hostname or ""
        if not _host_ok(host) or urlparse(low).username is not None:
            raise ValueError(f"Shortened, numeric-host or credential-bearing URL: {url!r} (G3)")
    for href, text in scan.anchors:
        real = urlparse(href.strip().lower()).hostname or ""
        if not real:
            continue
        for m in _HOSTISH.finditer(text):
            if not _same_site(m.group(1).lower(), real):
                raise ValueError(f"Anchor text {m.group(1)!r} != real link host {real!r} (G3)")


async def send_email(*, to: str, subject: str, html: str) -> str:
    _assert_safe_email(subject, html)
    if EMAIL_PROVIDER == "resend":
        return await _send_resend(to=to, subject=subject, html=html)
    return await _send_managed(to=to, subject=subject, html=html)


async def _send_resend(*, to: str, subject: str, html: str) -> str:
    resend.api_key = os.environ["RESEND_API_KEY"]
    params = {
        "from": os.environ["EMAIL_FROM"],
        "to": [to],
        "subject": subject,
        "html": html,
        "text": re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html)).strip(),
    }
    if EMAIL_REPLY_TO:
        params["reply_to"] = [EMAIL_REPLY_TO]
    try:
        result = await resend.Emails.send_async(params, {"idempotency_key": secrets.token_hex(16)})
    except resend.exceptions.ResendError as e:
        logger.warning(f"Resend refused: {type(e).__name__}")
        raise RuntimeError("resend_error")
    return result["id"]


async def _send_managed(*, to: str, subject: str, html: str) -> str:
    payload = {"to": [to], "subject": subject, "html": html, "from_name": EMAIL_FROM_NAME}
    if EMAIL_REPLY_TO:
        payload["contact_email"] = EMAIL_REPLY_TO
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(f"{EMAIL_BASE_URL}/api/v1/email/send",
                                 headers={"X-Email-Key": os.environ["EMERGENT_EMAIL_KEY"]}, json=payload)
    if resp.status_code >= 400:
        try:
            info = resp.json()
        except ValueError:
            info = {}
        logger.warning(f"Email send refused ({resp.status_code}) {info.get('code', '')}: {info.get('message', resp.text)}")
        raise RuntimeError(info.get("code") or f"http_{resp.status_code}")
    return resp.json().get("id", "")


def password_reset_html(link: str, name: str) -> str:
    return (f'<table role="presentation" width="100%" style="background:#f4f4f4"><tr><td style="padding:32px">'
            f'<table role="presentation" width="100%" style="max-width:600px;margin:0 auto;background:#ffffff">'
            f'<tr><td style="background:#050505;padding:24px 32px;color:#ffffff;font-family:Georgia,serif;font-size:22px;letter-spacing:2px">'
            f'OUTSIDERS PRODUCTION</td></tr>'
            f'<tr><td style="padding:32px;font-family:Arial,sans-serif;color:#111">'
            f'<p style="font-size:16px;margin:0 0 16px">Bonjour {escape(name or "")},</p>'
            f'<p style="font-size:14px;line-height:1.6;margin:0 0 24px">Une demande de réinitialisation a été faite pour votre accès à l\'espace admin du site. '
            f'Ce lien est valable 1 heure et ne peut servir qu\'une fois.</p>'
            f'<p style="margin:0 0 24px"><a href="{escape(link)}" style="display:inline-block;background:#050505;color:#ffffff;padding:14px 28px;'
            f'text-decoration:none;font-size:13px;letter-spacing:2px">CHOISIR UN NOUVEAU MOT DE PASSE</a></p>'
            f'<p style="font-size:12px;color:#888;line-height:1.6;margin:0">Si vous n\'êtes pas à l\'origine de cette demande, ignorez simplement cet email : '
            f'votre mot de passe actuel reste inchangé.</p>'
            f'</td></tr></table></td></tr></table>')


def contact_notification_html(msg: dict) -> str:
    rows = [("Nom / Name", msg["name"]), ("Email", msg["email"]), ("Société / Company", msg.get("company") or "—"),
            ("Projet / Project", msg.get("project_type") or "—")]
    cells = "".join(
        f'<tr><td style="padding:6px 0;color:#888;font-size:12px;width:160px">{escape(k)}</td>'
        f'<td style="padding:6px 0;color:#111;font-size:14px">{escape(v)}</td></tr>' for k, v in rows)
    message = escape(msg["message"]).replace("\n", "<br>")
    return (f'<table role="presentation" width="100%" style="background:#f4f4f4"><tr><td style="padding:32px">'
            f'<table role="presentation" width="100%" style="max-width:600px;margin:0 auto;background:#ffffff">'
            f'<tr><td style="background:#050505;padding:24px 32px;color:#ffffff;font-family:Georgia,serif;font-size:22px;letter-spacing:2px">'
            f'OUTSIDERS PRODUCTION</td></tr>'
            f'<tr><td style="padding:32px;font-family:Arial,sans-serif">'
            f'<p style="font-size:16px;color:#111;margin:0 0 20px">Nouveau message depuis le site / New website message</p>'
            f'<table role="presentation" width="100%">{cells}</table>'
            f'<p style="margin:24px 0 6px;color:#888;font-size:12px">Message</p>'
            f'<p style="margin:0;color:#111;font-size:14px;line-height:1.6">{message}</p>'
            f'<p style="margin-top:32px;font-size:11px;color:#999">Envoyé par {escape(EMAIL_FROM_NAME)}. '
            f'Retrouvez tous les messages dans votre espace admin.</p>'
            f'</td></tr></table></td></tr></table>')
