import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { introPending, markIntroSeen, markIntroPlayed } from "../lib/intro";

const CURTAIN = [0.76, 0, 0.24, 1];

const Counter = () => {
  const [n, setN] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setN((v) => (v >= 100 ? 100 : v + 4)), 60);
    return () => clearInterval(id);
  }, []);
  return <span className="font-mono text-xs tabular-nums text-zinc-400" data-testid="intro-counter">{String(n).padStart(3, "0")}</span>;
};

export const Intro = () => {
  const [show] = useState(introPending);
  const [visible, setVisible] = useState(show);
  useEffect(() => {
    if (!show) return undefined;
    markIntroSeen();
    const t = setTimeout(() => { setVisible(false); markIntroPlayed(); }, 1900);
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
            <svg viewBox="0 0 64 64" className="h-16 w-16" fill="none">
              <motion.circle cx="28" cy="34" r="20" stroke="currentColor" strokeWidth="2"
                initial={{ pathLength: 0, rotate: -90 }} animate={{ pathLength: 1, rotate: 0 }} transition={{ duration: 1.2, ease: [0.65, 0, 0.35, 1] }} />
              <motion.circle cx="52" cy="12" r="6" fill="currentColor"
                initial={{ scale: 0, x: -24, y: 22 }} animate={{ scale: 1, x: 0, y: 0 }} transition={{ delay: 1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }} />
            </svg>
            <span className="block overflow-hidden">
              <motion.span className="op-label block !text-white" initial={{ y: "110%" }} animate={{ y: "0%" }} transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
                Outsiders Production
              </motion.span>
            </span>
            <Counter />
          </motion.div>
          <div className="op-grain" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
