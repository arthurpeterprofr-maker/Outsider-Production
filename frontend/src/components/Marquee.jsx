import { useLang } from "../lib/i18n";

const Row = ({ items, outline }) => (
  <div className="flex shrink-0 items-center">
    {items.map((w, i) => (
      <span key={`${w}-${i}`} className="flex items-center">
        <span className={`px-6 font-display text-6xl italic sm:px-10 sm:text-8xl lg:text-[9rem] ${outline && i % 2 ? "op-outline" : "text-white"}`}>{w}</span>
        <span className="font-mono text-lg text-zinc-500">✦</span>
      </span>
    ))}
  </div>
);

export const Marquee = () => {
  const { t } = useLang();
  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-[#050505] py-10 sm:py-14" data-testid="marquee-section" aria-hidden="true">
      <div className="op-marquee flex w-max">
        <Row items={t.marquee} outline />
        <Row items={t.marquee} outline />
      </div>
    </section>
  );
};
