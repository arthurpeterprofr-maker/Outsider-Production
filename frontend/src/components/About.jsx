import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLang, asset } from "../lib/i18n";
import { MaskLines, Reveal, Label, EASE } from "./motion";

export const About = () => {
  const { t, lang, site } = useLang();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section id="about" ref={ref} className="relative bg-[#050505] py-24 sm:py-36" data-testid="about-section">
      <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-12 px-5 sm:px-10 lg:grid-cols-12 lg:gap-20">
        <motion.div
          className="lg:col-span-6"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
          <motion.div
            className="relative aspect-[4/5] overflow-hidden"
            variants={{ hidden: { clipPath: "inset(12% 12% 12% 12%)" }, show: { clipPath: "inset(0% 0% 0% 0%)", transition: { duration: 1.6, ease: EASE } } }}
          >
            <motion.img style={{ y, scale: 1.18 }} src={asset(site.media?.about)} alt="Film set with spotlight" className="h-full w-full object-cover" data-testid="about-image" />
            <div className="op-grain" />
          </motion.div>
        </motion.div>

        <div className="flex flex-col justify-center lg:col-span-6">
          <Reveal><Label>{t.about.label}</Label></Reveal>
          <MaskLines key={lang} lines={t.about.title} className="mt-6 font-display text-6xl leading-[0.95] text-white sm:text-7xl lg:text-8xl" />
          <div className="mt-10 max-w-xl space-y-6">
            {t.about.paragraphs.map((p, i) => (
              <Reveal key={p} delay={i * 0.1}>
                <p className="font-body text-base leading-relaxed text-zinc-300 sm:text-lg" data-testid={`about-paragraph-${i}`}>{p}</p>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.3} className="mt-12 border-l border-white/30 pl-6">
            {t.about.closing.map((c) => (
              <p key={c} className="font-display text-2xl italic leading-snug text-white sm:text-3xl">{c}</p>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
};
