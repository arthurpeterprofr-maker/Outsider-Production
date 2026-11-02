import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Play } from "lucide-react";
import { useLang, asset } from "../lib/i18n";
import { useGoTo } from "../lib/nav";
import { SmoothScroll } from "../lib/smooth";
import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { LoopMedia } from "./VideoTile";
import { VideoPlayer, toPlayable } from "./VideoPlayer";
import { MaskLines, Label, EASE } from "./motion";

export const usePageTitle = (title) => {
  useEffect(() => { document.title = `${title} — Outsiders Production`; window.scrollTo(0, 0); }, [title]);
};

// Full-screen opening of a page: looping cover, title, optional "watch" button opening the full video.
export const PageHero = ({ cover, label, title, sub, watch, testId }) => {
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const media = toPlayable(asset(cover?.video));
  return (
    <section className="relative flex min-h-[100svh] items-end overflow-hidden" data-testid={testId}>
      <motion.div className="absolute inset-0" initial={{ scale: 1.12 }} animate={{ scale: 1 }} transition={{ duration: 2.4, ease: EASE }}>
        <LoopMedia image={cover?.image} video={cover?.video} />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/40 to-black/30" />
      <div className="relative mx-auto w-full max-w-[1500px] px-5 pb-16 sm:px-10 sm:pb-24">
        <Label className="text-zinc-200">{label}</Label>
        <MaskLines key={lang} as="h1" onLoad delay={0.2} lines={title || []}
          className="mt-6 font-display text-5xl leading-[0.95] text-white sm:text-7xl lg:text-[7.5rem]" />
        <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          {sub && <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.9, ease: EASE }}
            className="max-w-md font-body text-base leading-relaxed text-zinc-200 sm:text-lg">{sub}</motion.p>}
          {media && (
            <motion.button type="button" onClick={() => setOpen(true)} data-testid={`${testId}-watch-btn`}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1, duration: 0.8 }}
              className="group flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.3em] text-white">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black transition-transform duration-500 group-hover:scale-110"><Play className="ml-0.5 h-4 w-4 fill-current" /></span>
              {watch}
            </motion.button>
          )}
        </div>
      </div>
      <AnimatePresence>{open && <VideoPlayer media={media} title={label} onClose={() => setOpen(false)} />}</AnimatePresence>
    </section>
  );
};

export const PageCta = ({ label, testId }) => {
  const go = useGoTo();
  return (
    <section className="mx-auto max-w-[1500px] px-5 py-28 sm:px-10 sm:py-40">
      <button type="button" onClick={() => go("contact")} data-testid={testId}
        className="group flex w-full items-center justify-between gap-6 border-y border-white/15 py-10 text-left">
        <span className="font-display text-4xl italic text-white transition-transform duration-700 group-hover:translate-x-3 sm:text-6xl lg:text-7xl">{label}</span>
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/30 transition-[background-color,color,transform] duration-500 group-hover:rotate-45 group-hover:bg-white group-hover:text-black sm:h-20 sm:w-20">
          <ArrowUpRight className="h-5 w-5 sm:h-6 sm:w-6" />
        </span>
      </button>
    </section>
  );
};

export const PageShell = ({ children, testId }) => (
  <main className="min-h-screen bg-[#050505] text-white" data-testid={testId}>
    <SmoothScroll />
    <Nav />
    {children}
    <Footer />
  </main>
);
