import { ArrowUpRight } from "lucide-react";

export const NetflixLink = ({ href, label, soon, testId, className = "" }) =>
  href ? (
    <a href={href} target="_blank" rel="noreferrer" className={`op-btn ${className}`} data-testid={testId} onClick={(e) => e.stopPropagation()}>
      <span className="font-display text-sm normal-case tracking-normal">N</span>
      <span>{label}</span>
      <ArrowUpRight className="h-4 w-4" />
    </a>
  ) : (
    <span className={`inline-flex items-center gap-3 rounded-full border border-white/15 px-6 py-4 font-mono text-[11px] uppercase tracking-[0.25em] text-zinc-400 ${className}`} data-testid={`${testId}-soon`}>
      {soon}
    </span>
  );
