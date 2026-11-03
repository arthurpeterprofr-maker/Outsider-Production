import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Award, Play, X } from "lucide-react";
import { useLang, asset } from "../lib/i18n";
import { NetflixLink } from "./NetflixLink";
import { lockScroll } from "../lib/smooth";
import { Chips, useChips } from "./Chips";
import { FilmToolbar, useFilmQuery } from "./FilmToolbar";
import { toPlayable } from "./VideoPlayer";
import { StripRow } from "./Strip";
import { EASE } from "./motion";

const FilmCard = ({ f, n, onOpen, lang, t, className = "" }) => (
  <motion.button layout type="button" onClick={onOpen} data-testid={`film-card-${n}`}
    initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} exit={{ opacity: 0, scale: 0.96 }}
    transition={{ duration: 0.7, ease: EASE }} className={`group block text-left ${className}`}>
    <div className="relative aspect-[2/3] overflow-hidden bg-zinc-900">
      <img src={asset(f.poster)} alt={f.title} loading="lazy" className="h-full w-full object-cover grayscale transition-[transform,filter] duration-[1.2s] ease-out group-hover:scale-[1.05] group-hover:grayscale-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
      <span className="absolute right-4 top-4 hidden h-11 w-11 items-center justify-center rounded-full bg-white text-black transition-transform duration-500 lg:flex lg:scale-0 lg:group-hover:scale-100"><Play className="ml-0.5 h-4 w-4 fill-current" /></span>
      {(f.festivals || []).length > 0 && (
        <span className="absolute bottom-4 left-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-200"><Award className="h-3.5 w-3.5" />{f.festivals.length}<span className="hidden sm:inline">{t.festivals}</span></span>
      )}
    </div>
    <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-400">{f.year} · {f.type?.[lang]}</p>
    <h3 className="mt-2 font-display text-2xl leading-tight text-white transition-transform duration-500 group-hover:translate-x-1 sm:text-3xl">{f.title}</h3>
  </motion.button>
);

const Trailer = ({ f, t }) => {
  const [on, setOn] = useState(false);
  const media = toPlayable(asset(f.trailer));
  if (!media) return null;
  return (
    <div className="mt-10" data-testid="film-trailer">
      <p className="op-label !text-[10px]">{t.trailer}</p>
      <div className="relative mt-4 aspect-video w-full overflow-hidden bg-zinc-900">
        {on ? (
          media.kind === "iframe"
            ? <iframe title={`${f.title} — ${t.trailer}`} src={media.src} className="h-full w-full border-0" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowFullScreen data-testid="film-trailer-iframe" />
            : <video src={media.src} className="h-full w-full" controls autoPlay playsInline data-testid="film-trailer-video" />
        ) : (
          <button type="button" onClick={() => setOn(true)} className="group absolute inset-0" data-testid="film-trailer-play" aria-label={t.trailer}>
            <img src={asset(f.poster)} alt="" className="h-full w-full scale-110 object-cover opacity-60 blur-sm transition-transform duration-[1.4s] group-hover:scale-[1.15]" />
            <span className="absolute inset-0 flex items-center justify-center gap-4 font-mono text-[11px] uppercase tracking-[0.3em] text-white">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-black transition-transform duration-500 group-hover:scale-110"><Play className="ml-1 h-5 w-5 fill-current" /></span>
              {t.trailer}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

const FilmModal = ({ f, onClose, lang, t }) => {
  useEffect(() => {
    lockScroll(true);
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { lockScroll(false); window.removeEventListener("keydown", onKey); };
  }, [onClose]);
  return (
    <motion.div className="fixed inset-0 z-[80] overflow-y-auto bg-black/90 backdrop-blur-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }} onClick={onClose} data-lenis-prevent data-testid="film-modal">
      <button onClick={onClose} className="op-icon-btn fixed right-5 top-5 z-10 bg-black/40" aria-label={t.close} data-testid="film-modal-close"><X className="h-4 w-4" /></button>
      <motion.div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-5 py-20 sm:px-10 md:grid-cols-12 md:gap-14"
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ duration: 0.7, ease: EASE }} onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto w-2/3 max-w-xs md:col-span-4 md:w-full"><img src={asset(f.poster)} alt={f.title} className="aspect-[2/3] w-full object-cover" /></div>
        <div className="md:col-span-8">
          <p className="op-label">{f.type?.[lang]} — {f.year}</p>
          <h3 className="mt-4 font-display text-4xl leading-[1] text-white sm:text-6xl" data-testid="film-modal-title">{f.title}</h3>
          <p className="mt-3 font-body text-sm text-zinc-400">{t.directed} {f.director}</p>
          <p className="mt-8 max-w-xl font-body text-base leading-relaxed text-zinc-200 sm:text-lg">{f.synopsis?.[lang]}</p>
          {(f.festivals || []).length > 0 && (
            <div className="mt-10">
              <p className="op-label !text-[10px]">{t.festivals}</p>
              <ul className="mt-4 space-y-3" data-testid="film-modal-festivals">
                {f.festivals.map((fe, k) => <li key={`${fe}-${k}`} className="flex items-center gap-3 font-display text-lg text-white sm:text-xl"><Award className="h-4 w-4 shrink-0 text-zinc-400" />{fe}</li>)}
              </ul>
            </div>
          )}
          <Trailer f={f} t={t} />
          <div className="mt-10"><NetflixLink href={f.netflix} label={t.watch} soon={t.soon} testId="film-netflix-link" /></div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// First part of the "type" field ("Long métrage · Fiction" -> "Long métrage") is the filter category.
export const filmCategory = (lang) => (f) => (f.type?.[lang] || "").split("·")[0].trim();

export const FilmGrid = ({ films, filters = false, cols = "lg:grid-cols-3", strip = null }) => {
  const { t, lang } = useLang();
  const [active, setActive] = useState(null);
  const keyOf = useCallback((f) => filmCategory(lang)(f), [lang]);
  const query = useFilmQuery(films);
  const chips = useChips(films, keyOf);
  const list = filters ? query.list.filter((f) => chips.active === "all" || keyOf(f) === chips.active) : films;
  return (
    <>
      {filters && (
        <div className="mb-12 space-y-8">
          <FilmToolbar {...query} t={t.films} />
          <Chips keys={chips.keys} active={chips.active} onPick={chips.setActive} allLabel={t.films.all} testId="film-filter" />
        </div>
      )}
      {filters && list.length === 0 && <p className="py-16 font-body text-base text-zinc-400" data-testid="film-no-result">{t.films.noResult}</p>}
      {strip ? (
        <StripRow strip={strip} testId="films-strip">
          {films.map((f, n) => <FilmCard key={`${f.title}-${n}`} f={f} n={n} lang={lang} t={t.films} onOpen={() => setActive(f)} className="w-[44vw] shrink-0 snap-start sm:w-[210px] lg:w-[230px]" />)}
        </StripRow>
      ) : (
      <motion.div layout className={`grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-8 md:grid-cols-3 ${cols}`} data-testid="films-grid">
        <AnimatePresence initial={false}>
          {list.map((f) => {
            const n = films.indexOf(f);
            return <FilmCard key={`${f.title}-${n}`} f={f} n={n} lang={lang} t={t.films} onOpen={() => setActive(f)} />;
          })}
        </AnimatePresence>
      </motion.div>
      )}
      <AnimatePresence>{active && <FilmModal f={active} lang={lang} t={t.films} onClose={() => setActive(null)} />}</AnimatePresence>
    </>
  );
};
