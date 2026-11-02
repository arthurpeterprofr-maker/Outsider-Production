import { useEffect } from "react";
import Lenis from "lenis";
import { getIntroDelay } from "./intro";

let lenisInstance = null;

export const scrollToId = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenisInstance) lenisInstance.scrollTo(el, { offset: id === "home" ? 0 : -60, duration: 1.6 });
  else el.scrollIntoView({ behavior: "smooth" });
};

let locks = 0;
export const lockScroll = (locked) => {
  locks = Math.max(0, locks + (locked ? 1 : -1));
  const on = locks > 0;
  document.documentElement.style.overflow = on ? "hidden" : "";
  if (!lenisInstance) return;
  if (on) lenisInstance.stop();
  else lenisInstance.start();
};

export const SmoothScroll = ({ intro = false }) => {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.25, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenisInstance = lenis;
    let raf;
    const loop = (time) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    let unlock;
    const introDelay = intro ? getIntroDelay() : 0;
    if (introDelay) {
      lockScroll(true);
      unlock = setTimeout(() => lockScroll(false), (introDelay - 0.4) * 1000);
    }
    return () => {
      clearTimeout(unlock);
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisInstance = null;
    };
  }, [intro]);
  return null;
};
