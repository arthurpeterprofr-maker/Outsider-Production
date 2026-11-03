import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useLang } from "../lib/i18n";
import { MaskLines, Reveal, Label } from "./motion";
import { FilmGrid } from "./FilmGrid";
import { useStrip, StripArrows } from "./Strip";

export const HOME_LIMIT = 6;

export const SeeAll = ({ to, label, count, testId }) => (
  <Link to={to} onClick={() => window.scrollTo(0, 0)} data-testid={testId}
    className="group inline-flex items-center gap-3 rounded-full border border-white/25 py-2 pl-5 pr-2 font-mono text-[11px] uppercase tracking-[0.22em] text-white transition-colors duration-500 hover:bg-white hover:text-black">
    {label}{count ? <span className="text-zinc-400 group-hover:text-zinc-600">({count})</span> : null}
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black transition-transform duration-500 group-hover:rotate-45 group-hover:bg-black group-hover:text-white"><ArrowUpRight className="h-3.5 w-3.5" /></span>
  </Link>
);

export const SectionHead = ({ label, title, intro, italic = false, as = "h2", onLoad = false }) => {
  const { lang } = useLang();
  return (
    <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
      <div>
        <Reveal><Label>{label}</Label></Reveal>
        <MaskLines key={lang} as={as} onLoad={onLoad} lines={[title]} className={`mt-5 font-display text-5xl leading-[0.95] text-white sm:text-7xl ${italic ? "italic" : ""}`} />
      </div>
      {intro && <Reveal delay={0.2} className="max-w-sm"><p className="font-body text-base leading-relaxed text-zinc-300">{intro}</p></Reveal>}
    </div>
  );
};

// Compact home row: title, arrows and "see all" on one line, then a horizontal strip.
export const HomeStrip = ({ id, label, title, italic, to, viewAll, count, testId, children }) => {
  const { lang } = useLang();
  const strip = useStrip();
  return (
    <section id={id} className="relative border-t border-white/10 bg-[#050505] py-20 sm:py-24" data-testid={testId}>
      <div className="mx-auto max-w-[1500px] px-5 sm:px-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Reveal><Label>{label}</Label></Reveal>
            <MaskLines key={lang} lines={[title]} className={`mt-4 font-display text-4xl leading-[0.95] text-white sm:text-6xl ${italic ? "italic" : ""}`} />
          </div>
          <div className="flex items-center gap-4">
            <StripArrows strip={strip} testId={`${testId}-arrows`} />
            <SeeAll to={to} label={viewAll} count={count} testId={`${id}-see-all`} />
          </div>
        </div>
        <div className="mt-10">{children(strip)}</div>
      </div>
    </section>
  );
};

export const Films = () => {
  const { t, site } = useLang();
  const films = Array.isArray(site.films) ? site.films : [];
  const f = t.films;
  return (
    <HomeStrip id="films" testId="films-section" label={f.label} title={(f.title || []).join(" ")} italic to="/cinema"
      viewAll={f.viewAll} count={films.length > HOME_LIMIT ? films.length : 0}>
      {(strip) => <FilmGrid films={films.slice(0, HOME_LIMIT)} strip={strip} />}
    </HomeStrip>
  );
};
