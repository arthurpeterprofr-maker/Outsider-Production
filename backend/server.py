from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import logging
import json
import re
from datetime import datetime, timezone, timedelta
from typing import Annotated, Optional, List, Any, Dict

import bcrypt
import jwt
from bson import ObjectId
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, BackgroundTasks, UploadFile, File
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, BeforeValidator, ConfigDict
from starlette.middleware.cors import CORSMiddleware

from email_service import send_email, contact_notification_html, password_reset_html
from video_storage import build_video_router
import hashlib
import secrets

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]

app = FastAPI()
api = APIRouter(prefix="/api")

JWT_ALGORITHM = "HS256"
PyObjectId = Annotated[str, BeforeValidator(lambda v: str(v) if isinstance(v, ObjectId) else v)]


class BaseDocument(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")
    id: Optional[PyObjectId] = Field(default=None, alias="_id")

    @classmethod
    def from_mongo(cls, doc: dict):
        return cls.model_validate(doc)

    def to_mongo(self) -> dict:
        data = self.model_dump(by_alias=True, exclude={"id"})
        return data


class ContactIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    company: str = Field(default="", max_length=160)
    project_type: str = Field(default="", max_length=80)
    message: str = Field(min_length=1, max_length=5000)


class Message(BaseDocument):
    name: str
    email: str
    company: str = ""
    project_type: str = ""
    message: str
    read: bool = False
    email_status: str = "pending"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class MessagePatch(BaseModel):
    read: bool


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class PasswordChangeIn(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8, max_length=128)


class ForgotIn(BaseModel):
    email: EmailStr


class ResetIn(BaseModel):
    token: str = Field(min_length=10, max_length=200)
    new_password: str = Field(min_length=8, max_length=128)


class EditorIn(BaseModel):
    email: EmailStr
    name: str = Field(default="", max_length=120)
    password: str = Field(min_length=8, max_length=128)


class ContentIn(BaseModel):
    content: Dict[str, Any]


MAX_UPLOAD = 6 * 1024 * 1024


def hash_password(p: str) -> str:
    return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()


def verify_password(p: str, h: str) -> bool:
    return bcrypt.checkpw(p.encode(), h.encode())


def make_token(user_id: str, email: str, kind: str, delta: timedelta) -> str:
    payload = {"sub": user_id, "email": email, "type": kind, "exp": datetime.now(timezone.utc) + delta}
    return jwt.encode(payload, os.environ["JWT_SECRET"], algorithm=JWT_ALGORITHM)


def set_auth_cookies(response: Response, user_id: str, email: str):
    access = make_token(user_id, email, "access", timedelta(hours=2))
    refresh = make_token(user_id, email, "refresh", timedelta(days=7))
    response.set_cookie("access_token", access, httponly=True, secure=True, samesite="none", max_age=7200, path="/")
    response.set_cookie("refresh_token", refresh, httponly=True, secure=True, samesite="none", max_age=604800, path="/")


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    auth = request.headers.get("Authorization", "")
    if not token and auth.startswith("Bearer "):
        token = auth[7:]
    if not token:
        raise HTTPException(401, "Not authenticated")
    try:
        payload = jwt.decode(token, os.environ["JWT_SECRET"], algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")
    if payload.get("type") != "access":
        raise HTTPException(401, "Invalid token type")
    user = await db.users.find_one({"_id": ObjectId(payload["sub"])}, {"password_hash": 0})
    if not user:
        raise HTTPException(401, "User not found")
    return {"id": str(user["_id"]), "email": user["email"], "name": user.get("name", ""), "role": user.get("role", "")}


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user["role"] != "admin":
        raise HTTPException(403, "Forbidden")
    return user


async def require_editor(user: dict = Depends(get_current_user)) -> dict:
    if user["role"] not in ("admin", "editor"):
        raise HTTPException(403, "Forbidden")
    return user


def client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for", "")
    return fwd.split(",")[0].strip() if fwd else (request.client.host if request.client else "unknown")


# ---------- Auth ----------
@api.post("/auth/login")
async def login(body: LoginIn, request: Request, response: Response):
    email = body.email.lower()
    ident = f"{client_ip(request)}:{email}"
    attempt = await db.login_attempts.find_one({"identifier": ident})
    now = datetime.now(timezone.utc)
    if attempt and attempt.get("count", 0) >= 5:
        locked_until = datetime.fromisoformat(attempt["last"]) + timedelta(minutes=15)
        if now < locked_until:
            raise HTTPException(429, "Too many attempts. Try again in 15 minutes.")
        await db.login_attempts.delete_one({"identifier": ident})
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        await db.login_attempts.update_one({"identifier": ident},
                                           {"$inc": {"count": 1}, "$set": {"last": now.isoformat()}}, upsert=True)
        raise HTTPException(401, "Invalid email or password")
    await db.login_attempts.delete_one({"identifier": ident})
    set_auth_cookies(response, str(user["_id"]), email)
    return {"id": str(user["_id"]), "email": email, "name": user.get("name", ""), "role": user.get("role", "")}


@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/", secure=True, samesite="none")
    response.delete_cookie("refresh_token", path="/", secure=True, samesite="none")
    return {"ok": True}


@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user


@api.post("/auth/refresh")
async def refresh(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(401, "No refresh token")
    try:
        payload = jwt.decode(token, os.environ["JWT_SECRET"], algorithms=[JWT_ALGORITHM])
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid refresh token")
    if payload.get("type") != "refresh":
        raise HTTPException(401, "Invalid token type")
    set_auth_cookies(response, payload["sub"], payload.get("email", ""))
    return {"ok": True}


@api.post("/auth/change-password")
async def change_password(body: PasswordChangeIn, user: dict = Depends(get_current_user)):
    doc = await db.users.find_one({"_id": ObjectId(user["id"])})
    if not verify_password(body.current_password, doc["password_hash"]):
        raise HTTPException(400, "Mot de passe actuel incorrect / Current password is incorrect")
    await db.users.update_one({"_id": doc["_id"]}, {"$set": {"password_hash": hash_password(body.new_password),
                                                         "password_changed_at": datetime.now(timezone.utc).isoformat()}})
    return {"ok": True}


# ---------- Password reset ----------
def token_hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


async def send_reset_email(email: str, name: str, token: str):
    link = f"{os.environ['FRONTEND_URL'].rstrip('/')}/admin/reset?token={token}"
    try:
        await send_email(to=email, subject="Réinitialisation de votre mot de passe — Outsiders Production",
                         html=password_reset_html(link, name))
    except Exception as e:
        logger.error(f"Reset email failed: {e}")


@api.post("/auth/forgot-password")
async def forgot_password(body: ForgotIn, background: BackgroundTasks):
    email = body.email.lower()
    user = await db.users.find_one({"email": email})
    if user:
        since = (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()
        recent = await db.password_reset_tokens.count_documents({"user_id": str(user["_id"]), "created_at": {"$gte": since}})
        if recent < 3:
            token = secrets.token_urlsafe(32)
            now = datetime.now(timezone.utc)
            await db.password_reset_tokens.insert_one({
                "token_hash": token_hash(token), "user_id": str(user["_id"]), "used": False,
                "created_at": now.isoformat(), "expires_at": now + timedelta(hours=1)})
            background.add_task(send_reset_email, email, user.get("name", ""), token)
    return {"ok": True}


@api.post("/auth/reset-password")
async def reset_password(body: ResetIn):
    rec = await db.password_reset_tokens.find_one({"token_hash": token_hash(body.token)})
    expires = rec["expires_at"].replace(tzinfo=timezone.utc) if rec else None
    if not rec or rec.get("used") or expires < datetime.now(timezone.utc):
        raise HTTPException(400, "Lien invalide ou expiré / Invalid or expired link")
    await db.users.update_one({"_id": ObjectId(rec["user_id"])},
                              {"$set": {"password_hash": hash_password(body.new_password),
                                        "password_changed_at": datetime.now(timezone.utc).isoformat()}})
    await db.password_reset_tokens.update_one({"_id": rec["_id"]}, {"$set": {"used": True}})
    return {"ok": True}


# ---------- Editor accounts (admin only) ----------
def public_user(u: dict) -> dict:
    return {"id": str(u["_id"]), "email": u["email"], "name": u.get("name", ""), "role": u.get("role", ""),
            "created_at": str(u.get("created_at", ""))}


@api.get("/admin/users")
async def list_users(_: dict = Depends(require_admin)):
    docs = await db.users.find({}, {"password_hash": 0}).sort("created_at", 1).to_list(200)
    return [public_user(d) for d in docs]


@api.post("/admin/users", status_code=201)
async def create_editor(body: EditorIn, _: dict = Depends(require_admin)):
    email = body.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(409, "Cet email existe déjà / Email already exists")
    doc = {"email": email, "name": body.name, "role": "editor", "password_hash": hash_password(body.password),
           "created_at": datetime.now(timezone.utc).isoformat()}
    res = await db.users.insert_one(doc)
    doc["_id"] = res.inserted_id
    return public_user(doc)


@api.delete("/admin/users/{user_id}")
async def delete_editor(user_id: str, _: dict = Depends(require_admin)):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(404, "Not found")
    res = await db.users.delete_one({"_id": ObjectId(user_id), "role": "editor"})
    if not res.deleted_count:
        raise HTTPException(404, "Not found")
    return {"ok": True}


# ---------- Contact ----------
async def notify_owner(message_id: str, doc: dict):
    recipient = os.environ.get("CONTACT_NOTIFY_EMAIL", "").strip()
    if not recipient:
        await db.messages.update_one({"_id": ObjectId(message_id)}, {"$set": {"email_status": "skipped"}})
        return
    try:
        await send_email(to=recipient, subject=f"Nouveau message — {doc['name']}", html=contact_notification_html(doc))
        status = "sent"
    except Exception as e:
        logger.error(f"Contact notification failed: {e}")
        status = "failed"
    await db.messages.update_one({"_id": ObjectId(message_id)}, {"$set": {"email_status": status}})


@api.post("/contact", status_code=201)
async def create_contact(body: ContactIn, request: Request, background: BackgroundTasks):
    ip = client_ip(request)
    since = (datetime.now(timezone.utc) - timedelta(minutes=10)).isoformat()
    if await db.messages.count_documents({"ip": ip, "created_at": {"$gte": since}}) >= 5:
        raise HTTPException(429, "Too many messages. Please try again later.")
    msg = Message(**body.model_dump())
    doc = msg.to_mongo()
    doc["ip"] = ip
    res = await db.messages.insert_one(doc)
    background.add_task(notify_owner, str(res.inserted_id), doc)
    return {"ok": True, "id": str(res.inserted_id)}


@api.get("/admin/messages", response_model=List[Message], response_model_by_alias=False)
async def list_messages(_: dict = Depends(require_admin)):
    docs = await db.messages.find({}).sort("created_at", -1).to_list(1000)
    return [Message.from_mongo(d) for d in docs]


@api.patch("/admin/messages/{message_id}", response_model=Message, response_model_by_alias=False)
async def patch_message(message_id: str, body: MessagePatch, _: dict = Depends(require_admin)):
    if not ObjectId.is_valid(message_id):
        raise HTTPException(404, "Not found")
    doc = await db.messages.find_one_and_update({"_id": ObjectId(message_id)}, {"$set": {"read": body.read}},
                                                return_document=True)
    if not doc:
        raise HTTPException(404, "Not found")
    return Message.from_mongo(doc)


@api.delete("/admin/messages/{message_id}")
async def delete_message(message_id: str, _: dict = Depends(require_admin)):
    if not ObjectId.is_valid(message_id):
        raise HTTPException(404, "Not found")
    res = await db.messages.delete_one({"_id": ObjectId(message_id)})
    if not res.deleted_count:
        raise HTTPException(404, "Not found")
    return {"ok": True}


# ---------- Site content (CMS) ----------
@api.get("/content")
async def get_content():
    doc = await db.site_content.find_one({"key": "site"}, {"_id": 0})
    return {"content": doc.get("data") if doc else None, "updated_at": doc.get("updated_at") if doc else None}


@api.put("/admin/content")
async def put_content(body: ContentIn, user: dict = Depends(require_editor)):
    if len(json.dumps(body.content)) > 1_000_000:
        raise HTTPException(413, "Content too large")
    now = datetime.now(timezone.utc).isoformat()
    await db.site_content.update_one({"key": "site"},
                                     {"$set": {"data": body.content, "updated_at": now, "updated_by": user["email"]}},
                                     upsert=True)
    await save_version(body.content, user["email"], now)
    return {"ok": True, "updated_at": now}


async def save_version(data: dict, email: str, now: str, note: str = ""):
    await db.content_versions.insert_one({"data": data, "saved_at": now, "saved_by": email, "note": note})
    old = await db.content_versions.find({}, {"_id": 1}).sort("saved_at", -1).skip(10).to_list(100)
    if old:
        await db.content_versions.delete_many({"_id": {"$in": [o["_id"] for o in old]}})


@api.get("/admin/content/versions")
async def list_versions(_: dict = Depends(require_editor)):
    docs = await db.content_versions.find({}, {"data": 0}).sort("saved_at", -1).to_list(10)
    return [{"id": str(d["_id"]), "saved_at": d["saved_at"], "saved_by": d.get("saved_by", ""), "note": d.get("note", "")} for d in docs]


@api.post("/admin/content/versions/{version_id}/restore")
async def restore_version(version_id: str, user: dict = Depends(require_editor)):
    if not ObjectId.is_valid(version_id):
        raise HTTPException(404, "Not found")
    ver = await db.content_versions.find_one({"_id": ObjectId(version_id)})
    if not ver:
        raise HTTPException(404, "Not found")
    now = datetime.now(timezone.utc).isoformat()
    await db.site_content.update_one({"key": "site"},
                                     {"$set": {"data": ver["data"], "updated_at": now, "updated_by": user["email"]}},
                                     upsert=True)
    await save_version(ver["data"], user["email"], now, note=f"restored:{ver['saved_at']}")
    return {"ok": True, "content": ver["data"]}


@api.post("/admin/media")
async def upload_media(file: UploadFile = File(...), _: dict = Depends(require_editor)):
    if not (file.content_type or "").startswith("image/"):
        raise HTTPException(400, "Images only")
    data = await file.read()
    if len(data) > MAX_UPLOAD:
        raise HTTPException(413, "Image too large (max 6 MB)")
    res = await db.media.insert_one({"content_type": file.content_type, "data": data, "filename": file.filename,
                                     "created_at": datetime.now(timezone.utc).isoformat()})
    return {"url": f"/api/media/{res.inserted_id}"}


@api.get("/media/{media_id}")
async def get_media(media_id: str):
    if not ObjectId.is_valid(media_id):
        raise HTTPException(404, "Not found")
    doc = await db.media.find_one({"_id": ObjectId(media_id)})
    if not doc:
        raise HTTPException(404, "Not found")
    return Response(content=bytes(doc["data"]), media_type=doc["content_type"],
                    headers={"Cache-Control": "public, max-age=31536000, immutable"})


@api.get("/")
async def root():
    return {"message": "Outsiders Production API"}


api.include_router(build_video_router(db, require_editor))
app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    await db.messages.create_index("created_at")
    await db.content_versions.create_index("saved_at")
    await db.password_reset_tokens.create_index("token_hash")
    await db.password_reset_tokens.create_index("expires_at", expireAfterSeconds=0)
    admin_email = os.environ["ADMIN_EMAIL"].lower()
    existing = await db.users.find_one({"email": admin_email})
    if existing and os.environ.get("ADMIN_FORCE_RESET") == "1":
        await db.users.update_one({"_id": existing["_id"]}, {"$set": {
            "password_hash": hash_password(os.environ["ADMIN_PASSWORD"]), "role": "admin"}})
        await db.login_attempts.delete_many({"identifier": {"$regex": f":{re.escape(admin_email)}$"}})
        logger.info("Admin password reset from ADMIN_PASSWORD")
    if not existing:
        await db.users.insert_one({"email": admin_email, "password_hash": hash_password(os.environ["ADMIN_PASSWORD"]),
                                   "name": "Admin", "role": "admin",
                                   "created_at": datetime.now(timezone.utc).isoformat()})


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
