import { useEffect } from "react";
import Lenis from "lenis";
import { SHOW_INTRO, INTRO_DELAY } from "./intro";

let lenisInstance = null;

export const scrollToId = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenisInstance) lenisInstance.scrollTo(el, { offset: id === "home" ? 0 : -60, duration: 1.6 });
  else el.scrollIntoView({ behavior: "smooth" });
};

export const lockScroll = (locked) => {
  document.documentElement.style.overflow = locked ? "hidden" : "";
  if (!lenisInstance) return;
  if (locked) lenisInstance.stop();
  else lenisInstance.start();
};

export const SmoothScroll = () => {
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
    if (SHOW_INTRO) {
      lockScroll(true);
      unlock = setTimeout(() => lockScroll(false), (INTRO_DELAY - 0.4) * 1000);
    }
    return () => {
      clearTimeout(unlock);
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);
  return null;
};
