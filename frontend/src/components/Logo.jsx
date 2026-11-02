export const LogoMark = ({ className = "h-6" }) => (
  <img src="/logo-mark.png" alt="" aria-hidden="true" className={`w-auto select-none ${className}`} draggable="false" />
);

export const LogoFull = ({ className = "h-16" }) => (
  <img src="/logo-full.png" alt="Outsiders Production — Crafting Dreams" className={`w-auto select-none ${className}`} draggable="false" />
);

export const Logo = ({ onClick }) => (
  <button onClick={onClick} data-testid="nav-logo" className="group flex items-center gap-3 text-white" aria-label="Outsiders Production">
    <LogoMark className="h-6 transition-transform duration-700 group-hover:scale-110" />
    <span className="op-label whitespace-nowrap !text-[11px] !tracking-[0.35em] text-white">Outsiders<span className="hidden sm:inline"> Production</span></span>
  </button>
);
