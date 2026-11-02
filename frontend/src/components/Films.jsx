import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useLang } from "../lib/i18n";
import { MaskLines, Reveal, Label } from "./motion";
import { FilmGrid } from "./FilmGrid";

export const HOME_LIMIT = 6;

export const SeeAll = ({ to, label, count, testId }) => (
  <Reveal className="mt-16 flex justify-center">
    <Link to={to} onClick={() => window.scrollTo(0, 0)} data-testid={testId}
      className="group inline-flex items-center gap-4 rounded-full border border-white/25 py-3 pl-7 pr-3 font-mono text-[11px] uppercase tracking-[0.25em] text-white transition-colors duration-500 hover:bg-white hover:text-black">
      {label}{count ? <span className="text-zinc-400 group-hover:text-zinc-600">({count})</span> : null}
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black transition-transform duration-500 group-hover:rotate-45 group-hover:bg-black group-hover:text-white"><ArrowUpRight className="h-4 w-4" /></span>
    </Link>
  </Reveal>
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

export const Films = () => {
  const { t, site } = useLang();
  const films = Array.isArray(site.films) ? site.films : [];
  const f = t.films;
  return (
    <section id="films" className="relative border-t border-white/10 bg-[#050505] py-24 sm:py-36" data-testid="films-section">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-10">
        <SectionHead label={f.label} title={(f.title || []).join(" ")} intro={f.intro} italic />
        <div className="mt-16"><FilmGrid films={films.slice(0, HOME_LIMIT)} /></div>
        <SeeAll to="/cinema" label={f.viewAll} count={films.length > HOME_LIMIT ? films.length : 0} testId="films-see-all" />
      </div>
    </section>
  );
};
