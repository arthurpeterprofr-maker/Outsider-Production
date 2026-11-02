export const LogoMark = ({ className = "h-7 w-7" }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
    <circle cx="28" cy="34" r="20" stroke="currentColor" strokeWidth="3" />
    <circle cx="52" cy="12" r="6" fill="currentColor" />
  </svg>
);

export const Logo = ({ onClick }) => (
  <button onClick={onClick} data-testid="nav-logo" className="group flex items-center gap-3 text-white" aria-label="Outsiders Production">
    <LogoMark className="h-7 w-7 transition-transform duration-700 group-hover:rotate-[-25deg]" />
    <span className="op-label !text-[11px] !tracking-[0.35em] text-white">Outsiders<span className="hidden sm:inline"> Production</span></span>
  </button>
);
