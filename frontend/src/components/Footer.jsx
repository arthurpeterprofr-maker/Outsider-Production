import { Instagram, Linkedin, Mail } from "lucide-react";
import { useLang } from "../lib/i18n";
import { useGoTo } from "../lib/nav";
import { LogoFull } from "./Logo";

export const Footer = () => {
  const { t, site } = useLang();
  const scrollToId = useGoTo();
  const contactInfo = site.contact;
  return (
    <footer className="relative overflow-hidden bg-[#050505] pt-20" data-testid="site-footer">
      <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-12 px-5 sm:px-10 md:grid-cols-12">
        <div className="md:col-span-6">
          <LogoFull className="h-14 sm:h-16" />
          <p className="mt-6 max-w-sm font-body text-sm leading-relaxed text-zinc-400">{t.footer.blurb}</p>
        </div>
        <div className="md:col-span-3">
          <p className="op-label !text-[10px] !text-zinc-400">{t.footer.explore}</p>
          <ul className="mt-5 space-y-3">
            {t.footer.links.map((n) => (
              <li key={n.id}>
                <button onClick={() => scrollToId(n.id)} className="op-underline font-body text-sm text-zinc-200" data-testid={`footer-link-${n.id}`}>{n.label}</button>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-3">
          <p className="op-label !text-[10px] !text-zinc-400">{t.footer.connect}</p>
          <a href={`mailto:${contactInfo.email}`} className="op-underline mt-5 inline-block font-body text-sm text-zinc-200" data-testid="footer-email">{contactInfo.email}</a>
          <div className="mt-5 flex gap-3">
            <a href={contactInfo.instagram} target="_blank" rel="noreferrer" className="op-icon-btn" aria-label="Instagram" data-testid="footer-instagram"><Instagram className="h-4 w-4" /></a>
            <a href={contactInfo.linkedin} target="_blank" rel="noreferrer" className="op-icon-btn" aria-label="LinkedIn" data-testid="footer-linkedin"><Linkedin className="h-4 w-4" /></a>
            <a href={`mailto:${contactInfo.email}`} className="op-icon-btn" aria-label="Email" data-testid="footer-mail"><Mail className="h-4 w-4" /></a>
          </div>
        </div>
      </div>
      <p className="pointer-events-none mt-16 select-none whitespace-nowrap text-center font-display text-[19vw] uppercase leading-[0.8] text-white/[0.06]" aria-hidden="true">Outsiders</p>
      <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-2 border-t border-white/10 px-5 py-6 font-mono text-xs text-zinc-400 sm:flex-row sm:px-10">
        <span>© {new Date().getFullYear()} Outsiders Production. {t.footer.rights}</span>
        <span>Casablanca, Morocco</span>
      </div>
    </footer>
  );
};
