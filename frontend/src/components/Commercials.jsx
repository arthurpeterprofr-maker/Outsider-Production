import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useLang, asset } from "../lib/i18n";
import { MaskLines, Reveal, Label, EASE } from "./motion";

const AdCard = ({ c, i, t }) => {
  const Tag = c.netflix ? "a" : "div";
  const linkProps = c.netflix ? { href: c.netflix, target: "_blank", rel: "noreferrer" } : {};
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      className={i % 3 === 0 ? "md:col-span-7" : i % 3 === 1 ? "md:col-span-5" : "md:col-span-12"}
    >
      <Tag {...linkProps} className="group block" data-testid={`commercial-card-${i}`}>
        <motion.div
          className={`relative overflow-hidden bg-zinc-900 ${i % 3 === 2 ? "aspect-[21/9]" : "aspect-[16/10] md:aspect-auto md:h-[440px]"}`}
          variants={{ hidden: { clipPath: "inset(0% 100% 0% 0%)" }, show: { clipPath: "inset(0% 0% 0% 0%)", transition: { duration: 1.3, ease: EASE } } }}
        >
          <img src={asset(c.image)} alt={c.title} className="h-full w-full object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4 sm:inset-x-8 sm:bottom-7">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-zinc-300">{c.client} — {c.year}</p>
              <h3 className="mt-2 font-display text-3xl leading-none text-white sm:text-5xl">{c.title}</h3>
            </div>
            <span className="hidden shrink-0 items-center gap-2 rounded-full border border-white/40 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.25em] text-white transition-colors duration-500 group-hover:bg-white group-hover:text-black sm:inline-flex">
              {c.netflix ? t.watch : t.soon}{c.netflix && <ArrowUpRight className="h-3.5 w-3.5" />}
            </span>
          </div>
        </motion.div>
        <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.25em] text-zinc-400 sm:hidden">{c.netflix ? t.watch : t.soon}</p>
      </Tag>
    </motion.div>
  );
};

export const Commercials = () => {
  const { t, lang, site } = useLang();
  const items = site.commercials || [];
  const c = t.commercials;
  return (
    <section id="commercials" className="relative border-t border-white/10 bg-[#050505] py-24 sm:py-36" data-testid="commercials-section">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-10">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <Reveal><Label>{c.label}</Label></Reveal>
            <MaskLines key={lang} lines={c.title} className="mt-6 font-display text-5xl leading-[0.98] text-white sm:text-7xl" />
          </div>
          <Reveal delay={0.2}><p className="max-w-sm font-body text-base leading-relaxed text-zinc-300">{c.intro}</p></Reveal>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-12">
          {items.map((it, i) => <AdCard key={`${it.title}-${i}`} c={it} i={i} t={c} />)}
        </div>
      </div>
    </section>
  );
};
