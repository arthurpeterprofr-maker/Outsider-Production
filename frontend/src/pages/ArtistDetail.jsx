import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Play } from "lucide-react";
import { useLang, asset } from "../lib/i18n";
import { VideoPlayer, toPlayable } from "../components/VideoPlayer";
import { SmoothScroll } from "../lib/smooth";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { MaskLines, Reveal, EASE } from "../components/motion";

const FilmBlock = ({ film, a, name, big = false, n = 0 }) => {
  const [playing, setPlaying] = useState(false);
  const media = toPlayable(film?.link ? asset(film.link) : "");
  const external = film?.link && !media;
  const Tag = external ? "a" : media ? "button" : "div";
  const props = external ? { href: film.link, target: "_blank", rel: "noreferrer" } : media ? { type: "button", onClick: () => setPlaying(true) } : {};
  return (
    <>
    <Tag {...props} className={`group relative block aspect-video w-full overflow-hidden bg-zinc-900 text-left ${big ? "sm:aspect-[21/9]" : ""}`} data-testid={`artist-film-${n}`}>
      {film?.image && <img src={asset(film.image)} alt={film.title || name} className="h-full w-full object-cover transition-transform duration-[1.6s] group-hover:scale-105" />}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10" />
      {film?.link && (
        <span className="absolute inset-0 flex items-center justify-center gap-4 font-mono text-[11px] uppercase tracking-[0.3em] text-white">
          <span className={`flex items-center justify-center rounded-full bg-white text-black transition-transform duration-500 group-hover:scale-110 ${big ? "h-16 w-16" : "h-12 w-12"}`}><Play className="ml-1 h-5 w-5 fill-current" /></span>
          {big && a.watch}
        </span>
      )}
      {film?.title && <span className="absolute bottom-0 left-0 p-5 font-display text-2xl text-white sm:p-8 sm:text-3xl">{film.title}</span>}
    </Tag>
    <AnimatePresence>
      {playing && media && <VideoPlayer media={media} title={film.title || name} onClose={() => setPlaying(false)} />}
    </AnimatePresence>
    </>
  );
};

// First film large, the others in a two-column grid.
const FilmList = ({ videos, a, name }) => (
  <div className="space-y-4 px-4" data-testid="artist-films">
    <FilmBlock film={videos[0]} a={a} name={name} big />
    {videos.length > 1 && (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {videos.slice(1).map((v, i) => (
          <Reveal key={`${v.link}-${i}`} delay={(i % 2) * 0.08}><FilmBlock film={v} a={a} name={name} n={i + 1} /></Reveal>
        ))}
      </div>
    )}
  </div>
);

const PhotoGrid = ({ photos, name }) => (
  <div className="columns-1 gap-4 px-4 sm:columns-2 lg:columns-3" data-testid="artist-photos">
    {photos.map((p, i) => (
      <motion.div key={`${p}-${i}`} className="mb-4 break-inside-avoid overflow-hidden"
        initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.9, ease: EASE, delay: (i % 3) * 0.08 }}>
        <img src={asset(p)} alt={`${name} ${i + 1}`} className="w-full object-cover transition-transform duration-[1.2s] hover:scale-[1.03]" loading="lazy" />
      </motion.div>
    ))}
  </div>
);

export default function ArtistDetail() {
  const { slug } = useParams();
  const { t, lang, site } = useLang();
  const a = t.artists;
  const list = Array.isArray(site.artists) ? site.artists : [];
  const idx = list.findIndex((x) => x.slug === slug);
  const ar = list[idx];
  const [tab, setTab] = useState("film");
  const photos = Array.isArray(ar?.photos) ? ar.photos.filter(Boolean) : [];
  const videos = Array.isArray(ar?.videos) ? ar.videos.filter((v) => v?.image || v?.link) : [];
  const tabs = [
    ar?.showFilms !== false && videos.length > 0 && "film",
    ar?.showPhotos !== false && photos.length > 0 && "photo",
  ].filter(Boolean);
  const current = tabs.includes(tab) ? tab : tabs[0];

  useEffect(() => { setTab("film"); window.scrollTo(0, 0); }, [slug]);
  useEffect(() => { if (ar) document.title = `${ar.name} — Outsiders Production`; }, [ar]);

  if (!ar) {
    return (
      <main className="min-h-screen bg-[#050505] text-white"><Nav />
        <div className="pt-48 text-center"><Link to="/artistes" className="op-underline font-mono text-xs uppercase tracking-[0.25em] text-zinc-300" data-testid="artist-notfound-back">{a.back}</Link></div>
      </main>
    );
  }
  const prev = list[(idx - 1 + list.length) % list.length];
  const next = list[(idx + 1) % list.length];

  return (
    <main className="min-h-screen bg-[#050505] text-white" data-testid="artist-detail-page">
      <SmoothScroll />
      <Nav />
      <section className="mx-auto max-w-[1500px] px-5 pb-16 pt-36 sm:px-10 sm:pt-44">
        <Link to="/artistes" className="op-underline font-mono text-[11px] uppercase tracking-[0.25em] text-zinc-400" data-testid="artist-back-link">← {a.back}</Link>
        <div className="mt-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          <Link to={`/artistes/${prev.slug}`} className="group hidden items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-zinc-400 hover:text-white xl:col-span-1 xl:flex" data-testid="artist-prev-link">
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />{a.previous}
          </Link>
          <div className="lg:col-span-6 xl:col-span-5">
            <MaskLines key={`${slug}-${lang}`} as="h1" onLoad lines={[ar.name]} className="font-display text-5xl uppercase leading-[0.95] sm:text-7xl" />
            <div className="mt-4 flex flex-wrap gap-2">
              {(ar.tags || []).map((tg) => {
                const f = (site.artistFilters || []).flat().find((x) => x?.key === tg);
                return <span key={tg} className="rounded-full border border-white/15 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-300">{f?.[lang] || tg}</span>;
              })}
            </div>
          </div>
          <Reveal delay={0.2} className="lg:col-span-6 xl:col-span-5">
            <p className="font-body text-sm leading-[1.9] text-zinc-300 sm:text-base" data-testid="artist-bio">{ar.bio?.[lang]}</p>
          </Reveal>
          <Link to={`/artistes/${next.slug}`} className="group hidden items-center justify-end gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-zinc-400 hover:text-white xl:col-span-1 xl:flex" data-testid="artist-next-link">
            {a.next}<ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="mt-10 flex justify-between xl:hidden">
          <Link to={`/artistes/${prev.slug}`} className="font-mono text-[11px] uppercase tracking-[0.25em] text-zinc-300" data-testid="artist-prev-link-mobile">← {a.previous}</Link>
          <Link to={`/artistes/${next.slug}`} className="font-mono text-[11px] uppercase tracking-[0.25em] text-zinc-300" data-testid="artist-next-link-mobile">{a.next} →</Link>
        </div>
        {tabs.length > 0 && (
        <div className="mt-16 flex justify-center gap-16" data-testid="artist-tabs">
          {tabs.map((k) => (
            <button key={k} onClick={() => setTab(k)} data-testid={`artist-tab-${k}`}
              className={`relative pb-2 font-mono text-[11px] uppercase tracking-[0.3em] transition-colors ${current === k ? "text-white" : "text-zinc-500 hover:text-zinc-200"}`}>
              {k === "film" ? a.film : a.photo}{current === k && <motion.span layoutId="artist-tab-line" className="absolute inset-x-0 bottom-0 h-px bg-white" />}
            </button>
          ))}
        </div>
        )}
      </section>
      <section className="pb-24">
        {current === "film" && <FilmList videos={videos} a={a} name={ar.name} />}
        {current === "photo" && <PhotoGrid photos={photos} name={ar.name} />}
      </section>
      <Footer />
    </main>
  );
}
