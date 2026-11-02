import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLang } from "../lib/i18n";
import { MaskLines, Reveal, Label } from "./motion";

export const Manifesto = () => {
  const { t, lang } = useLang();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1.25, 1]);
  const rotate = useTransform(scrollYProgress, [0, 1], [-4, 4]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-black py-24 sm:py-40" data-testid="manifesto-section">
      <motion.img style={{ scale, rotate }} src="/images/eye.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-black/40 to-[#050505]" />
      <div className="op-grain" />
      <div className="relative mx-auto max-w-[1500px] px-5 sm:px-10">
        <Reveal><Label>{t.manifesto.label}</Label></Reveal>
        <MaskLines key={lang} lines={[t.manifesto.title]} className="mt-6 font-display text-[22vw] italic leading-[0.9] text-white sm:text-[16vw] lg:text-[13rem]" />

        <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="space-y-2 lg:col-span-7">
            {t.manifesto.lines.map((l, i) => (
              <Reveal key={l} delay={i * 0.08}>
                <p className={`font-display leading-tight text-white ${i === 0 ? "text-3xl sm:text-4xl" : "text-2xl text-zinc-200 sm:text-4xl"}`}>{l}</p>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.3} className="flex items-end lg:col-span-5">
            <p className="max-w-sm font-body text-base leading-relaxed text-zinc-300">{t.manifesto.note}</p>
          </Reveal>
        </div>

        <div className="mt-20 grid grid-cols-2 border-t border-white/15 sm:grid-cols-3 lg:grid-cols-5" data-testid="manifesto-values">
          {t.manifesto.values.map((v, i) => (
            <Reveal key={v} delay={i * 0.08} className="group relative border-b border-white/15 p-6 sm:border-r lg:border-b-0 [&:last-child]:border-r-0">
              <span className="font-mono text-xs text-zinc-400">0{i + 1}</span>
              <p className="mt-10 font-display text-2xl text-white transition-transform duration-500 group-hover:translate-x-2">{v}</p>
              <span className="absolute bottom-0 left-0 h-px w-0 bg-white transition-[width] duration-700 group-hover:w-full" />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
