import { motion } from "framer-motion";
import { useLang } from "../lib/i18n";
import { Reveal, Label, EASE } from "./motion";

export const Vision = () => {
  const { t, lang } = useLang();
  const words = t.vision.quote.split(" ");
  return (
    <section className="relative bg-[#050505] py-28 sm:py-44" data-testid="vision-section">
      <div className="mx-auto max-w-5xl px-5 text-center sm:px-10">
        <Reveal className="flex justify-center"><Label>{t.vision.label}</Label></Reveal>
        <motion.blockquote
          key={lang}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          transition={{ staggerChildren: 0.035 }}
          className="mt-10 font-display text-3xl leading-[1.15] text-white sm:text-5xl lg:text-6xl"
          data-testid="vision-quote"
        >
          {words.map((w, i) => (
            <motion.span
              key={`${w}-${i}`}
              className="inline-block pr-[0.25em]"
              variants={{ hidden: { opacity: 0.15, filter: "blur(6px)" }, show: { opacity: 1, filter: "blur(0px)", transition: { duration: 0.8, ease: EASE } } }}
            >
              {w}
            </motion.span>
          ))}
        </motion.blockquote>
        <Reveal delay={0.4} className="mt-12">
          {t.vision.tail.map((l) => (
            <p key={l} className="font-body text-base text-zinc-300 sm:text-lg">{l}</p>
          ))}
        </Reveal>
      </div>
    </section>
  );
};
