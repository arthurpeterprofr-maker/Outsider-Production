import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Award, Play, X } from "lucide-react";
import { useLang } from "../lib/i18n";
import { filmItems, toEmbedUrl } from "../lib/content";
import { lockScroll } from "../lib/smooth";
import { MaskLines, Reveal, Label, EASE } from "./motion";

const PosterCard = ({ f, i, onOpen, lang, label }) => (
  <motion.button
    type="button"
    onClick={onOpen}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, amount: 0.1 }}
    className={`group block text-left ${i % 2 ? "lg:mt-24" : ""}`}
    data-testid={`film-card-${i}`}
  >
    <motion.div
      className="relative aspect-[2/3] overflow-hidden bg-zinc-900"
      variants={{ hidden: { clipPath: "inset(0% 0% 100% 0%)" }, show: { clipPath: "inset(0% 0% 0% 0%)", transition: { duration: 1.3, ease: EASE, delay: (i % 4) * 0.12 } } }}
    >
      <img src={f.poster} alt={f.title} className="h-full w-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.07]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/30" />
      <span className="absolute left-4 top-4 font-mono text-[11px] text-white/80">{f.year}</span>
      <span className="absolute right-4 top-4 flex h-11 w-11 scale-75 items-center justify-center rounded-full bg-white text-black opacity-0 transition-[opacity,transform] duration-500 group-hover:scale-100 group-hover:opacity-100">
        <Play className="ml-0.5 h-4 w-4 fill-current" />
      </span>
      <div className="absolute inset-x-4 bottom-4">
        <p className="font-display text-xl leading-tight text-white sm:text-2xl lg:text-3xl">{f.title}</p>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-300">{f.type[lang]}</p>
      </div>
    </motion.div>
    <p className="mt-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-zinc-400 transition-colors duration-300 group-hover:text-white">
      <span className="h-px w-6 bg-current transition-[width] duration-500 group-hover:w-10" />{label}
    </p>
  </motion.button>
);

const TrailerBlock = ({ f, t }) => {
  const [play, setPlay] = useState(false);
  const src = toEmbedUrl(f.trailer);
  if (!src) {
    return (
      <div className="flex aspect-video items-center justify-center border border-white/15 font-mono text-xs uppercase tracking-[0.25em] text-zinc-400" data-testid="film-trailer-soon">
        {t.soon}
      </div>
    );
  }
  return play ? (
    <iframe title={f.title} src={src} className="aspect-video w-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen data-testid="film-trailer-player" />
  ) : (
    <button onClick={() => setPlay(true)} className="group relative block aspect-video w-full overflow-hidden" data-testid="film-trailer-play">
      <img src={f.poster} alt="" className="h-full w-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105" />
      <span className="absolute inset-0 flex items-center justify-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-white">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black"><Play className="ml-0.5 h-5 w-5 fill-current" /></span>{t.trailer}
      </span>
    </button>
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
    <motion.div
      className="fixed inset-0 z-[80] overflow-y-auto bg-black/90 backdrop-blur-xl"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
      onClick={onClose} data-lenis-prevent data-testid="film-modal"
    >
      <button onClick={onClose} className="op-icon-btn fixed right-5 top-5 z-10 bg-black/40" aria-label={t.close} data-testid="film-modal-close"><X className="h-4 w-4" /></button>
      <motion.div
        className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-5 py-20 sm:px-10 md:grid-cols-12 md:gap-14"
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ duration: 0.7, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto w-2/3 max-w-xs md:col-span-4 md:w-full">
          <img src={f.poster} alt={f.title} className="aspect-[2/3] w-full object-cover" />
        </div>
        <div className="md:col-span-8">
          <p className="op-label">{f.type[lang]} — {f.year}</p>
          <h3 className="mt-4 font-display text-4xl leading-[1] text-white sm:text-6xl" data-testid="film-modal-title">{f.title}</h3>
          <p className="mt-3 font-body text-sm text-zinc-400">{t.directed} {f.director}</p>
          <p className="mt-8 max-w-xl font-body text-base leading-relaxed text-zinc-200 sm:text-lg">{f.synopsis[lang]}</p>
          <div className="mt-10">
            <p className="op-label !text-[10px]">{t.festivals}</p>
            <ul className="mt-4 space-y-3" data-testid="film-modal-festivals">
              {f.festivals.map((fe) => (
                <li key={fe} className="flex items-center gap-3 font-display text-lg text-white sm:text-xl"><Award className="h-4 w-4 shrink-0 text-zinc-400" />{fe}</li>
              ))}
            </ul>
          </div>
          <div className="mt-10"><TrailerBlock f={f} t={t} /></div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const Films = () => {
  const { t, lang } = useLang();
  const [active, setActive] = useState(null);
  return (
    <section id="films" className="relative border-t border-white/10 bg-[#050505] py-24 sm:py-36" data-testid="films-section">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Reveal><Label>{t.films.label}</Label></Reveal>
            <MaskLines key={lang} lines={t.films.title} className="mt-6 font-display text-6xl italic leading-[0.95] text-white sm:text-7xl lg:text-8xl" />
          </div>
          <Reveal delay={0.2} className="lg:col-span-5">
            <p className="max-w-md font-body text-base leading-relaxed text-zinc-300">{t.films.intro}</p>
          </Reveal>
        </div>
        <div className="mt-16 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-8 lg:grid-cols-4">
          {filmItems.map((f, i) => (
            <PosterCard key={f.title} f={f} i={i} lang={lang} label={t.films.view} onOpen={() => setActive(f)} />
          ))}
        </div>
      </div>
      <AnimatePresence>
        {active && <FilmModal f={active} lang={lang} t={t.films} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </section>
  );
};
