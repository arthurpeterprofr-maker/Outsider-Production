import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLang, asset } from "../lib/i18n";
import { SmoothScroll } from "../lib/smooth";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { MaskLines, Reveal, Label, EASE } from "../components/motion";

const FilterRow = ({ items, active, onPick, lang, i }) => (
  <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
    {items.map((f) => (
      <button key={f.key} onClick={() => onPick(f.key)} data-testid={`artist-filter-${f.key}`}
        className={`font-mono text-[11px] uppercase tracking-[0.25em] transition-colors duration-300 ${active === f.key ? "text-white" : "text-zinc-500 hover:text-zinc-200"}`}>
        {f[lang] || f.key}
      </button>
    ))}
  </div>
);

const Preview = ({ artist, pos }) => (
  <AnimatePresence>
    {artist?.photos?.[0] && (
      <motion.img
        key={artist.slug}
        src={asset(artist.photos[0])}
        alt=""
        className="pointer-events-none fixed z-40 hidden h-64 w-48 object-cover lg:block"
        style={{ left: pos.x + 24, top: pos.y - 128 }}
        initial={{ opacity: 0, scale: 0.9, rotate: -4 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.35, ease: EASE }}
      />
    )}
  </AnimatePresence>
);

export default function Artists() {
  const { t, lang, site } = useLang();
  const a = t.artists;
  const artists = Array.isArray(site.artists) ? site.artists : [];
  const filters = Array.isArray(site.artistFilters) ? site.artistFilters : [];
  const [active, setActive] = useState("all");
  const [hover, setHover] = useState(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => { document.title = `${a.label} — Outsiders Production`; }, [a.label]);

  const matches = (ar) => active === "all" || (ar.tags || []).includes(active);
  const count = artists.filter(matches).length;

  return (
    <main className="min-h-screen bg-[#050505] text-white" data-testid="artists-page" onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}>
      <SmoothScroll />
      <Nav />
      <section className="mx-auto max-w-[1500px] px-5 pb-28 pt-36 sm:px-10 sm:pt-44">
        <div className="text-center">
          <Reveal className="flex justify-center"><Label>Outsiders Production</Label></Reveal>
          <MaskLines key={lang} as="h1" onLoad lines={[a.label]} className="mt-6 font-display text-5xl italic text-white sm:text-7xl lg:text-8xl" />
          <Reveal delay={0.2}><p className="mx-auto mt-6 max-w-md font-body text-base text-zinc-300">{a.intro}</p></Reveal>
        </div>

        <Reveal delay={0.3} className="mt-16 space-y-5" data-testid="artist-filters">
          <FilterRow items={[{ key: "all", fr: a.all, en: a.all }]} active={active} onPick={setActive} lang={lang} />
          {filters.map((row, i) => <FilterRow key={i} i={i} items={Array.isArray(row) ? row : []} active={active} onPick={setActive} lang={lang} />)}
        </Reveal>

        <div className="mx-auto mt-20 grid max-w-6xl grid-cols-1 gap-y-6 text-center sm:grid-cols-2 lg:grid-cols-4" data-testid="artists-grid">
          {artists.map((ar, i) => {
            const on = matches(ar);
            return (
              <motion.div key={ar.slug || i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.04, duration: 0.6, ease: EASE }}>
                <Link
                  to={`/artistes/${ar.slug}`}
                  onMouseEnter={() => on && setHover(ar)}
                  onMouseLeave={() => setHover(null)}
                  className={`inline-block py-2 font-display text-2xl uppercase tracking-wide transition-[color,transform] duration-500 sm:text-3xl ${on ? "text-white hover:translate-x-1 hover:italic" : "pointer-events-none text-zinc-700"}`}
                  data-testid={`artist-link-${ar.slug}`}
                  aria-disabled={!on}
                >
                  {ar.name}
                </Link>
              </motion.div>
            );
          })}
        </div>
        {count === 0 && <p className="mt-10 text-center font-body text-sm text-zinc-400">{a.none}</p>}
      </section>
      <Preview artist={hover} pos={pos} />
      <Footer />
    </main>
  );
}
