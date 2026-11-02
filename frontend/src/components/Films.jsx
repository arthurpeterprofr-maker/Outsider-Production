import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Award, Play, X } from "lucide-react";
import { useLang } from "../lib/i18n";
import { filmItems, toEmbedUrl } from "../lib/content";
import { lockScroll } from "../lib/smooth";
import { MaskLines, Reveal, Label, EASE } from "./motion";

const useIsDesktop = () => {
  const [d, setD] = useState(() => window.matchMedia("(min-width: 1024px)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const on = () => setD(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return d;
};

const Sprockets = () => <div className="op-sprockets h-4 w-full shrink-0" aria-hidden="true" />;

const FilmFrame = ({ f, i, onOpen, lang, t }) => (
  <button
    type="button"
    onClick={onOpen}
    className="group flex w-[78vw] shrink-0 snap-start flex-col gap-5 text-left sm:w-[56vw] lg:h-[52vh] lg:w-auto lg:flex-row lg:gap-8"
    data-testid={`film-card-${i}`}
  >
    <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-900 lg:h-full lg:w-auto">
      <img src={f.poster} alt={f.title} className="h-full w-full object-cover grayscale transition-transform duration-[1.4s] ease-out group-hover:scale-[1.07]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
      <span className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-black transition-transform duration-500 lg:scale-0 lg:group-hover:scale-100">
        <Play className="ml-0.5 h-4 w-4 fill-current" />
      </span>
    </div>
    <div className="flex flex-col justify-between lg:w-[300px] lg:py-2">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-zinc-400">{String(i + 1).padStart(2, "0")} — {f.year}</p>
        <h3 className="mt-4 font-display text-3xl leading-[1.02] text-white sm:text-4xl">{f.title}</h3>
        <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-300">{f.type[lang]}</p>
        <ul className="mt-6 space-y-2">
          {f.festivals.map((fe) => (
            <li key={fe} className="flex items-center gap-2 font-body text-sm text-zinc-300"><Award className="h-3.5 w-3.5 shrink-0 text-zinc-400" />{fe}</li>
          ))}
        </ul>
      </div>
      <p className="mt-6 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-zinc-300 transition-colors duration-300 group-hover:text-white">
        <span className="h-px w-6 bg-current transition-[width] duration-500 group-hover:w-12" />{t.view}
        <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </p>
    </div>
  </button>
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
  const isDesktop = useIsDesktop();
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const [shift, setShift] = useState(0);
  const [vh, setVh] = useState(window.innerHeight);

  useLayoutEffect(() => {
    const measure = () => {
      const el = trackRef.current;
      setVh(window.innerHeight);
      setShift(el ? Math.max(0, el.scrollWidth - window.innerWidth) : 0);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    window.addEventListener("resize", measure);
    return () => { ro.disconnect(); window.removeEventListener("resize", measure); };
  }, [isDesktop, lang]);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, (v) => -v * shift);
  const pinned = isDesktop && shift > 0;

  return (
    <section
      id="films"
      ref={sectionRef}
      style={pinned ? { height: shift + vh } : undefined}
      className="relative border-t border-white/10 bg-[#050505]"
      data-testid="films-section"
    >
      <div className={`flex flex-col justify-center overflow-hidden ${pinned ? "sticky top-0 h-screen pt-14" : "py-24"}`}>
        <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6 px-5 sm:px-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Reveal><Label>{t.films.label}</Label></Reveal>
            <MaskLines key={lang} lines={[t.films.title.join(" ")]} className="mt-5 font-display text-5xl italic leading-[0.95] text-white sm:text-7xl" />
          </div>
          <Reveal delay={0.2} className="max-w-sm">
            <p className="font-body text-base leading-relaxed text-zinc-300">{t.films.intro}</p>
            {pinned && (
              <div className="mt-6 h-px w-full bg-white/15" data-testid="films-progress">
                <motion.div className="h-px origin-left bg-white" style={{ scaleX: scrollYProgress }} />
              </div>
            )}
          </Reveal>
        </div>

        <div className="mt-12 border-y border-white/10 bg-black py-3 lg:mt-14">
          <Sprockets />
          <div className={`py-6 ${pinned ? "" : "overflow-x-auto snap-x snap-mandatory op-noscrollbar"}`}>
            <motion.div ref={trackRef} style={pinned ? { x } : undefined} className="flex w-max gap-10 px-5 sm:px-10 lg:gap-16" data-testid="films-track">
              {filmItems.map((f, i) => (
                <FilmFrame key={f.title} f={f} i={i} lang={lang} t={t.films} onOpen={() => setActive(f)} />
              ))}
              <div className="flex w-[60vw] shrink-0 snap-start flex-col justify-center sm:w-[40vw] lg:h-[52vh] lg:w-[340px]">
                <p className="font-display text-4xl italic leading-tight text-white sm:text-5xl">{t.films.more}</p>
                <a href="#contact" className="op-underline mt-6 self-start font-mono text-[11px] uppercase tracking-[0.25em] text-zinc-300" data-testid="films-more-link">{t.films.moreCta}</a>
              </div>
            </motion.div>
          </div>
          <Sprockets />
        </div>
      </div>
      <AnimatePresence>
        {active && <FilmModal f={active} lang={lang} t={t.films} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </section>
  );
};
