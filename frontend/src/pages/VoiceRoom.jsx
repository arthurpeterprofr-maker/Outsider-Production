import { useLang } from "../lib/i18n";
import { PageShell, PageHero, PageCta, usePageTitle } from "../components/PageParts";
import { VideoTile } from "../components/VideoTile";
import { MaskLines, Reveal, Label } from "../components/motion";

const arr = (v) => (Array.isArray(v) ? v : []);

const Manifesto = ({ s }) => {
  const [first, ...rest] = arr(s.paragraphs);
  return (
    <section className="mx-auto max-w-[1500px] px-5 py-24 sm:px-10 sm:py-36" data-testid="voice-manifesto">
      <Reveal><p className="max-w-5xl font-display text-3xl leading-tight text-white sm:text-5xl">{first}</p></Reveal>
      <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2 lg:ml-[33%] lg:max-w-3xl">
        {rest.map((p, i) => <Reveal key={i} delay={i * 0.12}><p className="font-body text-base leading-[1.9] text-zinc-300">{p}</p></Reveal>)}
      </div>
      <MaskLines lines={arr(s.closing)} className="mt-24 text-right font-display text-4xl italic leading-[1.05] text-white sm:text-6xl lg:text-7xl" />
    </section>
  );
};

const Featured = ({ f, capsules, lang, watch }) => (
  <section className="border-t border-white/10" data-testid="voice-featured">
    <div className="mx-auto max-w-[1500px] px-5 py-24 sm:px-10 sm:py-32">
      <Reveal><Label>{f.label}</Label></Reveal>
      <MaskLines lines={[f.title || ""]} className="mt-8 font-display text-4xl uppercase leading-[0.95] text-white sm:text-6xl lg:text-8xl" />
      <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-5"><p className="font-body text-lg leading-relaxed text-zinc-200" data-testid="voice-featured-text">{f.text}</p></Reveal>
        <Reveal delay={0.12} className="lg:col-span-5 lg:col-start-8"><p className="font-body text-base leading-[1.9] text-zinc-300">{f.role}</p></Reveal>
      </div>
      <Reveal delay={0.1} className="mt-14 flex flex-col gap-2 border-l border-white/30 pl-5" data-testid="voice-credits">
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-400">{f.creditsLabel}</span>
        <span className="font-display text-2xl text-white sm:text-3xl">{f.credits}</span>
      </Reveal>
      <Reveal className="mt-24"><Label>{f.capsules}</Label></Reveal>
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {capsules.map((c, i) => (
          <Reveal key={i} delay={(i % 3) * 0.1}>
            <VideoTile image={c.image} video={c.video} title={c.title?.[lang]} watch={watch} testId={`voice-capsule-${i}`} className="aspect-[4/5]">
              <span className="absolute bottom-0 left-0 p-5 font-display text-2xl text-white">{c.title?.[lang]}</span>
            </VideoTile>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export default function VoiceRoom() {
  const { t, lang, site } = useLang();
  const s = t.voiceRoom || {};
  const m = site.voiceRoomMedia || {};
  usePageTitle(s.label);
  return (
    <PageShell testId="voice-room-page">
      <PageHero cover={m.cover} label={s.label} title={s.title} watch={s.watch} testId="voice-hero" />
      <Manifesto s={s} />
      <Featured f={s.featured || {}} capsules={arr(m.capsules)} lang={lang} watch={s.watch} />
      <PageCta label={s.cta} testId="voice-cta" />
    </PageShell>
  );
}
