import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { introPending, markIntroSeen, markIntroPlayed, INTRO_MS } from "../lib/intro";
import { useLang, asset } from "../lib/i18n";
import { LetterLogo } from "./LetterLogo";

const CURTAIN = [0.76, 0, 0.24, 1];

const Counter = () => {
  const [n, setN] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setN((v) => Math.min(100, v + 3)), 100);
    return () => clearInterval(id);
  }, []);
  return <span className="font-mono text-xs tabular-nums text-zinc-400" data-testid="intro-counter">{String(n).padStart(3, "0")}</span>;
};

export const Intro = () => {
  const [show] = useState(introPending);
  const [visible, setVisible] = useState(show);
  const { site } = useLang();
  useEffect(() => {
    if (!show) return undefined;
    markIntroSeen();
    const t = setTimeout(() => { setVisible(false); markIntroPlayed(); }, INTRO_MS);
    return () => clearTimeout(t);
  }, [show]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div className="fixed inset-0 z-[100]" exit={{ pointerEvents: "none" }} data-testid="intro-screen">
          <motion.div className="absolute inset-x-0 top-0 h-1/2 bg-[#050505]" exit={{ y: "-100%" }} transition={{ duration: 0.9, ease: CURTAIN }} />
          <motion.div className="absolute inset-x-0 bottom-0 h-1/2 bg-[#050505]" exit={{ y: "100%" }} transition={{ duration: 0.9, ease: CURTAIN }} />
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center gap-6 text-white"
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.4 }}
          >
            <LetterLogo src={asset(site.media?.logoFull) || "/logo-full.png"} className="w-[78vw] max-w-[520px]" />
            <Counter />
          </motion.div>
          <div className="op-grain" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
