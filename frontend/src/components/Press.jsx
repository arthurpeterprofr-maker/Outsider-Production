import { useLang } from "../lib/i18n";
import { MaskLines, Reveal, Label } from "./motion";

const LEAVES = Array.from({ length: 7 }, (_, k) => k);

const Branch = ({ flip }) => (
  <svg viewBox="0 0 40 100" className={`h-20 w-8 shrink-0 text-zinc-300 sm:h-24 ${flip ? "-scale-x-100" : ""}`} fill="currentColor" aria-hidden="true">
    <path d="M30 96 C 10 80, 6 40, 22 6" stroke="currentColor" strokeWidth="1.2" fill="none" />
    {LEAVES.map((k) => {
      const tt = k / 7;
      const y = 90 - tt * 80;
      const xx = 26 - Math.sin(tt * Math.PI) * 14;
      return <ellipse key={k} cx={xx - 6} cy={y} rx="7" ry="2.6" transform={`rotate(${-35 - tt * 25} ${xx - 6} ${y})`} />;
    })}
  </svg>
);

const Laurel = ({ l, tag, i }) => (
  <Reveal delay={i * 0.06} className="group flex items-center justify-center gap-2 py-5 sm:py-8" data-testid={`laurel-${i}`}>
    <Branch />
    <div className="min-w-[96px] text-center transition-transform duration-500 group-hover:-translate-y-1">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">{tag}</p>
      <p className="mt-1 font-display text-2xl leading-none text-white sm:text-3xl">{l.name}</p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-300">{l.detail}</p>
    </div>
    <Branch flip />
  </Reveal>
);

export const Press = () => {
  const { t, lang, site } = useLang();
  const laurels = site.laurels || [];
  const p = t.press;
  return (
    <section className="relative border-t border-white/10 bg-[#050505] py-24 sm:py-36" data-testid="press-section">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-10">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <Reveal><Label>{p.label}</Label></Reveal>
            <MaskLines key={lang} lines={p.title} className="mt-6 font-display text-5xl leading-[0.98] text-white sm:text-7xl" />
          </div>
          <Reveal delay={0.2}><p className="max-w-sm font-body text-base leading-relaxed text-zinc-300">{p.note}</p></Reveal>
        </div>

        <div className="mt-16 grid grid-cols-1 border-y border-white/10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6" data-testid="laurels-grid">
          {laurels.map((l, i) => <Laurel key={`${l.name}-${i}`} l={l} tag={p.laurelTag} i={i} />)}
        </div>

        <div className="mt-20 grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-10" data-testid="press-quotes">
          {p.quotes.map((q, i) => (
            <Reveal key={`${q.text}-${i}`} delay={i * 0.12} className={`border-l border-white/20 pl-6 ${i === 1 ? "md:mt-16" : ""}`}>
              <span className="font-display text-6xl leading-none text-zinc-500">“</span>
              <p className="-mt-4 font-display text-2xl italic leading-snug text-white sm:text-3xl" data-testid={`press-quote-${i}`}>{q.text}</p>
              <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.25em] text-zinc-400">— {q.source}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
