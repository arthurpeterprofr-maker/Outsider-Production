import { motion } from "framer-motion";
import { useLang } from "../lib/i18n";
import { PageShell, PageHero, PageCta, usePageTitle } from "../components/PageParts";
import { VideoTile } from "../components/VideoTile";
import { Reveal, Label, EASE } from "../components/motion";

const arr = (v) => (Array.isArray(v) ? v : []);

const Services = ({ s }) => (
  <section className="mx-auto max-w-[1500px] px-5 py-24 sm:px-10 sm:py-32" data-testid="ai-services">
    <Reveal><Label>{s.servicesLabel}</Label></Reveal>
    <ul className="mt-12 border-b border-white/10">
      {arr(s.services).map((item, i) => (
        <motion.li key={`${item}-${i}`} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.8, ease: EASE, delay: i * 0.06 }}
          className="group flex items-baseline gap-6 border-t border-white/10 py-6 sm:gap-12 sm:py-8" data-testid={`ai-service-${i}`}>
          <span className="w-8 shrink-0 font-mono text-[11px] tracking-[0.2em] text-zinc-400">{String(i + 1).padStart(2, "0")}</span>
          <span className="font-display text-3xl text-white transition-transform duration-700 group-hover:translate-x-3 group-hover:italic sm:text-5xl lg:text-6xl">{item}</span>
        </motion.li>
      ))}
    </ul>
  </section>
);

const Works = ({ works, s, lang }) => (
  <section className="mx-auto max-w-[1500px] px-5 pb-8 sm:px-10" data-testid="ai-works">
    <Reveal><Label>{s.worksLabel}</Label></Reveal>
    <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
      {works.map((w, i) => (
        <Reveal key={i} delay={(i % 2) * 0.1} className={i === 0 ? "md:col-span-2" : ""}>
          <VideoTile image={w.image} video={w.video} title={w.title?.[lang]} watch={s.watch} testId={`ai-work-${i}`}
            className={i === 0 ? "aspect-video lg:aspect-[21/9]" : "aspect-[4/3]"}>
            <span className="absolute bottom-0 left-0 p-5 sm:p-8">
              <span className="block font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-300">{w.category?.[lang]}</span>
              <span className="mt-2 block font-display text-2xl text-white sm:text-4xl">{w.title?.[lang]}</span>
            </span>
          </VideoTile>
        </Reveal>
      ))}
    </div>
  </section>
);

export default function AiStudio() {
  const { t, lang, site } = useLang();
  const s = t.aiStudio || {};
  const m = site.aiStudioMedia || {};
  usePageTitle(s.label);
  return (
    <PageShell testId="ai-studio-page">
      <PageHero cover={m.cover} label={s.label} title={s.title} sub={s.lead} watch={s.watch} testId="ai-hero" />
      <section className="mx-auto grid max-w-[1500px] grid-cols-1 gap-10 px-5 pt-24 sm:px-10 sm:pt-32 lg:grid-cols-12">
        <Reveal className="lg:col-span-7"><p className="font-display text-3xl leading-tight text-white sm:text-5xl" data-testid="ai-lead">{s.lead}</p></Reveal>
        <Reveal delay={0.15} className="lg:col-span-4 lg:col-start-9 lg:pt-3"><p className="font-body text-base leading-[1.9] text-zinc-300" data-testid="ai-text">{s.text}</p></Reveal>
      </section>
      <Services s={s} />
      <Works works={arr(m.works)} s={s} lang={lang} />
      <PageCta label={s.cta} testId="ai-cta" />
    </PageShell>
  );
}
