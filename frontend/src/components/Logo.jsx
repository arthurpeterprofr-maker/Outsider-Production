import { useLang, asset } from "../lib/i18n";

const useLogo = (key, fallback) => {
  const { site } = useLang();
  return asset(site.media?.[key]) || fallback;
};

export const LogoMark = ({ className = "h-6" }) => (
  <img src={useLogo("logoMark", "/logo-mark.png")} alt="" aria-hidden="true" className={`w-auto select-none ${className}`} draggable="false" />
);

export const LogoFull = ({ className = "h-16" }) => (
  <img src={useLogo("logoFull", "/logo-full.png")} alt="Outsiders Production — Crafting Dreams" className={`w-auto select-none ${className}`} draggable="false" data-testid="footer-logo" />
);

export const Logo = ({ onClick }) => (
  <button onClick={onClick} data-testid="nav-logo" className="group flex items-center gap-3 text-white" aria-label="Outsiders Production">
    <LogoMark className="h-6 transition-transform duration-700 group-hover:scale-110" />
    <span className="op-label whitespace-nowrap !text-[11px] !tracking-[0.35em] text-white">Outsiders<span className="hidden sm:inline xl:hidden 2xl:inline"> Production</span></span>
  </button>
);
