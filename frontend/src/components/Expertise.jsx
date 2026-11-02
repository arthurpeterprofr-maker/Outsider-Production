import { useLang } from "../lib/i18n";
import { MaskLines, Reveal, Label } from "./motion";

export const Expertise = () => {
  const { t, lang } = useLang();
  return (
    <section id="expertise" className="relative border-t border-white/10 bg-[#050505] py-24 sm:py-36" data-testid="expertise-section">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-10">
        <Reveal><Label>{t.expertise.label}</Label></Reveal>
        <MaskLines key={lang} lines={[t.expertise.title]} className="mt-6 font-display text-6xl text-white sm:text-7xl lg:text-8xl" />
        <div className="mt-16 grid grid-cols-1 border-t border-white/15 md:grid-cols-3">
          {t.expertise.columns.map((c, i) => (
            <Reveal
              key={c.title}
              delay={i * 0.12}
              className="group relative overflow-hidden border-b border-white/15 py-10 md:border-b-0 md:border-r md:px-8 md:py-14 md:first:pl-0 md:last:border-r-0"
              data-testid={`expertise-col-${i}`}
            >
              <span className="font-mono text-xs text-zinc-400">0{i + 1}</span>
              <h3 className="mt-6 font-display text-3xl text-white sm:text-4xl">{c.title}</h3>
              <ul className="mt-8 space-y-4">
                {c.items.map((it) => (
                  <li key={it} className="flex items-center gap-4 font-body text-sm text-zinc-300 sm:text-base">
                    <span className="h-px w-5 bg-white/50 transition-[width] duration-500 group-hover:w-9" />
                    {it}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
