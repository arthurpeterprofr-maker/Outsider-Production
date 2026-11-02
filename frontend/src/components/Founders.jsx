import { motion } from "framer-motion";
import { useLang } from "../lib/i18n";
import { MaskLines, Reveal, Label, EASE } from "./motion";

const FounderCard = ({ p, i }) => (
  <motion.article
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, amount: 0.1 }}
    className={`group ${i === 1 ? "md:mt-40" : ""}`}
    data-testid={`founder-card-${i}`}
  >
    <motion.div
      className="relative aspect-[3/4] overflow-hidden bg-zinc-900"
      variants={{ hidden: { clipPath: "inset(100% 0% 0% 0%)" }, show: { clipPath: "inset(0% 0% 0% 0%)", transition: { duration: 1.4, ease: EASE, delay: i * 0.15 } } }}
    >
      <img src={p.img} alt={p.name} className="h-full w-full object-cover object-top transition-transform duration-[1.6s] ease-out group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80 transition-opacity duration-700 group-hover:opacity-40" />
      <span className="absolute left-5 top-5 font-mono text-xs text-white/80">0{i + 1}</span>
    </motion.div>
    <Reveal delay={0.2 + i * 0.1} className="mt-8">
      <h3 className="font-display text-4xl text-white sm:text-5xl" data-testid={`founder-name-${i}`}>{p.name}</h3>
      <p className="op-label mt-3 !text-zinc-300">{p.role}</p>
      <p className="mt-5 max-w-md font-body text-sm leading-relaxed text-zinc-400 sm:text-base">{p.bio}</p>
    </Reveal>
  </motion.article>
);

export const Founders = () => {
  const { t, lang } = useLang();
  return (
    <section id="founders" className="relative bg-[#050505] py-24 sm:py-36" data-testid="founders-section">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Reveal><Label>{t.founders.label}</Label></Reveal>
            <MaskLines key={lang} lines={[t.founders.title]} className="mt-6 font-display text-6xl text-white sm:text-7xl lg:text-8xl" />
          </div>
          <Reveal><p className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-400">Casablanca — MA</p></Reveal>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-16 md:grid-cols-2 md:gap-10 lg:gap-24">
          {t.founders.people.map((p, i) => <FounderCard key={p.name} p={p} i={i} />)}
        </div>
      </div>
    </section>
  );
};
