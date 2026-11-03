import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Play, X } from "lucide-react";
import { useLang, asset } from "../lib/i18n";
import { NetflixLink } from "./NetflixLink";
import { VideoPlayer, toPlayable } from "./VideoPlayer";
import { lockScroll } from "../lib/smooth";
import { Chips, useChips } from "./Chips";
import { EASE } from "./motion";
import { StripRow } from "./Strip";

const AdCard = ({ c, n, onOpen, className = "" }) => (
  <motion.button layout type="button" onClick={onOpen} data-testid={`commercial-card-${n}`}
    initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} exit={{ opacity: 0, scale: 0.96 }}
    transition={{ duration: 0.7, ease: EASE }} className={`group block text-left ${className}`}>
    <div className="relative aspect-[16/10] overflow-hidden bg-zinc-900">
      <img src={asset(c.image)} alt={c.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <span className="absolute right-4 top-4 hidden h-11 w-11 items-center justify-center rounded-full bg-white text-black transition-transform duration-500 lg:flex lg:scale-0 lg:group-hover:scale-100"><Play className="ml-0.5 h-4 w-4 fill-current" /></span>
    </div>
    <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-400">{c.client} — {c.year}</p>
    <h3 className="mt-2 font-display text-2xl leading-tight text-white transition-transform duration-500 group-hover:translate-x-1 sm:text-3xl">{c.title}</h3>
  </motion.button>
);

const AdModal = ({ c, onClose, t }) => {
  const [playing, setPlaying] = useState(false);
  const media = toPlayable(asset(c.netflix));
  useEffect(() => {
    lockScroll(true);
    const onKey = (e) => { if (e.key === "Escape" && !playing) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { lockScroll(false); window.removeEventListener("keydown", onKey); };
  }, [onClose, playing]);
  return (
    <motion.div className="fixed inset-0 z-[80] overflow-y-auto bg-black/90 backdrop-blur-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }} onClick={onClose} data-lenis-prevent data-testid="commercial-modal">
      <button onClick={onClose} className="op-icon-btn fixed right-5 top-5 z-10 bg-black/40" aria-label={t.close} data-testid="commercial-modal-close"><X className="h-4 w-4" /></button>
      <motion.div className="mx-auto max-w-6xl px-5 py-20 sm:px-10" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.7, ease: EASE }} onClick={(e) => e.stopPropagation()}>
        <button type="button" disabled={!media} onClick={() => setPlaying(true)} className="group relative block aspect-video w-full overflow-hidden bg-zinc-900" data-testid="commercial-modal-play">
          <img src={asset(c.image)} alt={c.title} className="h-full w-full object-cover transition-transform duration-[1.4s] group-hover:scale-105" />
          {media && <span className="absolute inset-0 flex items-center justify-center bg-black/25"><span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-black transition-transform duration-500 group-hover:scale-110"><Play className="ml-1 h-5 w-5 fill-current" /></span></span>}
        </button>
        <div className="mt-10 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="op-label">{c.client} — {c.year}</p>
            <h3 className="mt-4 font-display text-4xl leading-[1] text-white sm:text-6xl" data-testid="commercial-modal-title">{c.title}</h3>
          </div>
          {!media && <NetflixLink href={c.netflix} label={t.watch} soon={t.soon} testId="commercial-link" />}
        </div>
      </motion.div>
      <div onClick={(e) => e.stopPropagation()}>
        <AnimatePresence>{playing && <VideoPlayer media={media} title={c.title} onClose={() => setPlaying(false)} closeLabel={t.close} />}</AnimatePresence>
      </div>
    </motion.div>
  );
};

export const AdGrid = ({ items, filters = false, cols = "lg:grid-cols-2", strip = null }) => {
  const { t } = useLang();
  const c = t.commercials;
  const [active, setActive] = useState(null);
  const keyOf = useCallback((it) => (it.client || "").trim(), []);
  const chips = useChips(items, keyOf);
  const list = filters ? chips.shown : items;
  return (
    <>
      {filters && <div className="mb-12"><Chips keys={chips.keys} active={chips.active} onPick={chips.setActive} allLabel={c.all} testId="commercial-filter" /></div>}
      {strip ? (
        <StripRow strip={strip} testId="commercials-strip">
          {items.map((it, n) => <AdCard key={`${it.title}-${n}`} c={it} n={n} onOpen={() => setActive(it)} className="w-[78vw] shrink-0 snap-start sm:w-[360px] lg:w-[400px]" />)}
        </StripRow>
      ) : (
      <motion.div layout className={`grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 ${cols}`} data-testid="commercials-grid">
        <AnimatePresence initial={false}>
          {list.map((it) => {
            const n = items.indexOf(it);
            return <AdCard key={`${it.title}-${n}`} c={it} n={n} onOpen={() => setActive(it)} />;
          })}
        </AnimatePresence>
      </motion.div>
      )}
      <AnimatePresence>{active && <AdModal c={active} t={c} onClose={() => setActive(null)} />}</AnimatePresence>
    </>
  );
};
