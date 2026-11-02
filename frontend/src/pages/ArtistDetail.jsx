import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Play } from "lucide-react";
import { useLang, asset } from "../lib/i18n";
import { SmoothScroll } from "../lib/smooth";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { MaskLines, Reveal, EASE } from "../components/motion";

const FilmBlock = ({ film, a, name }) => {
  const Tag = film?.link ? "a" : "div";
  const props = film?.link ? { href: film.link, target: "_blank", rel: "noreferrer" } : {};
  return (
    <Tag {...props} className="group relative block aspect-video w-full overflow-hidden bg-zinc-900 sm:aspect-[21/9]" data-testid="artist-film">
      {film?.image && <img src={asset(film.image)} alt={name} className="h-full w-full object-cover transition-transform duration-[1.6s] group-hover:scale-105" />}
      <div className="absolute inset-0 bg-black/30" />
      {film?.link && (
        <span className="absolute inset-0 flex items-center justify-center gap-4 font-mono text-[11px] uppercase tracking-[0.3em] text-white">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-black transition-transform duration-500 group-hover:scale-110"><Play className="ml-1 h-5 w-5 fill-current" /></span>
          {a.watch}
        </span>
      )}
    </Tag>
  );
};

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

  useEffect(() => { setTab(ar?.film?.image ? "film" : "photo"); window.scrollTo(0, 0); }, [slug, ar?.film?.image]);
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
  const photos = Array.isArray(ar.photos) ? ar.photos.filter(Boolean) : [];

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
        <div className="mt-16 flex justify-center gap-16" data-testid="artist-tabs">
          {[["film", a.film], ["photo", a.photo]].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} data-testid={`artist-tab-${k}`}
              className={`relative pb-2 font-mono text-[11px] uppercase tracking-[0.3em] transition-colors ${tab === k ? "text-white" : "text-zinc-500 hover:text-zinc-200"}`}>
              {l}{tab === k && <motion.span layoutId="artist-tab-line" className="absolute inset-x-0 bottom-0 h-px bg-white" />}
            </button>
          ))}
        </div>
      </section>
      <section className="pb-24">
        {tab === "film" ? <FilmBlock film={ar.film} a={a} name={ar.name} /> : <PhotoGrid photos={photos} name={ar.name} />}
      </section>
      <Footer />
    </main>
  );
}
