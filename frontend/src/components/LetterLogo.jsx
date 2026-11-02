import { useState } from "react";
import { motion } from "framer-motion";
import { sliceLogo } from "../lib/logoSlices";

const EASE = [0.22, 1, 0.36, 1];

const withDelays = ({ pieces, bands }) => {
  const hasMark = bands >= 3;
  let t = 0.35;
  let band = hasMark ? 0 : -1;
  return pieces.map((p) => {
    if (hasMark && p.band === 0) return { ...p, mark: true, delay: 0 };
    if (p.band !== band) { t += 0.15; band = p.band; }
    const delay = t;
    t += p.band <= 1 ? 0.045 : 0.03;
    return { ...p, delay };
  });
};

const Piece = ({ src, p }) => (
  <span className="absolute overflow-hidden" style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%`, width: `${p.w * 100}%`, height: `${p.h * 100}%` }}>
    <motion.img
      src={src}
      alt=""
      draggable="false"
      className="absolute max-w-none"
      style={{ width: `${100 / p.w}%`, left: `${(-p.x / p.w) * 100}%`, top: `${(-p.y / p.h) * 100}%` }}
      initial={p.mark ? { opacity: 0, scale: 0.6, rotate: -20 } : { y: "110%", opacity: 0 }}
      animate={p.mark ? { opacity: 1, scale: 1, rotate: 0 } : { y: "0%", opacity: 1 }}
      transition={{ duration: p.mark ? 0.9 : 0.55, ease: EASE, delay: p.delay }}
    />
  </span>
);

export const LetterLogo = ({ src, className = "" }) => {
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  const onLoad = (e) => {
    try {
      const s = sliceLogo(e.currentTarget);
      if (s.pieces.length) setData({ ratio: s.ratio, pieces: withDelays(s) });
      else setFailed(true);
    } catch {
      setFailed(true);
    }
  };
  if (failed) {
    return <motion.img src={src} alt="Outsiders Production" className={`h-auto ${className}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: EASE }} data-testid="intro-logo" />;
  }
  return (
    <div className={`relative ${className}`} style={{ aspectRatio: data?.ratio ?? 3.7 }} data-testid="intro-logo" role="img" aria-label="Outsiders Production — Crafting Dreams">
      {!data && <img src={src} alt="" crossOrigin="anonymous" onLoad={onLoad} onError={() => setFailed(true)} className="absolute h-0 w-0 opacity-0" />}
      {data?.pieces.map((p, i) => <Piece key={i} src={src} p={p} />)}
    </div>
  );
};
