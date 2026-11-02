import { useRef, useState } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useLang, asset } from "../lib/i18n";
import { scrollToId } from "../lib/smooth";
import { MaskLines, EASE } from "./motion";
import { getIntroDelay } from "../lib/intro";

export const Hero = () => {
  const { t, lang, site } = useLang();
  const [D] = useState(getIntroDelay);
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "-40%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotX = useSpring(useTransform(my, [0, 1], [6, -6]), { stiffness: 60, damping: 18 });
  const rotY = useSpring(useTransform(mx, [0, 1], [-8, 8]), { stiffness: 60, damping: 18 });
  const spotX = useTransform(mx, (v) => `${v * 100}%`);
  const spotY = useTransform(my, (v) => `${v * 100}%`);
  const spot = useTransform([spotX, spotY], ([x, y]) => `radial-gradient(520px circle at ${x} ${y}, rgba(255,255,255,0.14), transparent 60%)`);

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };

  return (
    <section id="home" ref={ref} onMouseMove={onMove} className="relative h-[100svh] min-h-[620px] overflow-hidden bg-black" data-testid="hero-section">
      <motion.div style={{ y: imgY }} className="absolute inset-0">
        <motion.img
          src={asset(site.media?.hero)}
          alt="Lone figure in a desert"
          className="h-full w-full object-cover object-center"
          initial={{ scale: 1.3, opacity: 0 }}
          animate={{ scale: 1.05, opacity: 0.75 }}
          transition={{ duration: 2.8, ease: EASE, delay: D * 0.75 }}
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/10 to-[#050505]" />
      <motion.div className="pointer-events-none absolute inset-0 hidden md:block" style={{ background: spot }} />
      <div className="op-grain" />

      <motion.div style={{ y: titleY, opacity: fade }} className="relative z-10 flex h-full flex-col items-center justify-center px-5 text-center" >
        <motion.p
          initial={{ opacity: 0, letterSpacing: "0.8em" }}
          animate={{ opacity: 1, letterSpacing: "0.4em" }}
          transition={{ duration: 1.6, ease: EASE, delay: D + 0.3 }}
          className="op-label mb-8 !text-zinc-300"
          data-testid="hero-eyebrow"
        >
          {t.hero.eyebrow}
        </motion.p>
        <motion.div style={{ rotateX: rotX, rotateY: rotY, transformPerspective: 1200 }}>
          <MaskLines
            key={lang}
            as="h1"
            onLoad
            delay={D}
            lines={t.hero.title}
            className="font-display uppercase leading-[0.86] tracking-[-0.02em] text-white text-[15vw] sm:text-[12vw] lg:text-[9.5vw]"
            lineClassName="op-hero-line"
          />
        </motion.div>
        <div className="mt-10 space-y-1" data-testid="hero-lines">
          {t.hero.lines.map((l, i) => (
            <span key={`${lang}-${l}`} className="block overflow-hidden">
              <motion.span
                className="block font-body text-base text-zinc-200 sm:text-lg"
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 1, ease: EASE, delay: D + 0.9 + i * 0.14 }}
              >
                {l}
              </motion.span>
            </span>
          ))}
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: D + 1.8, duration: 1 }}
        onClick={() => scrollToId("about")}
        className="group absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 text-zinc-300"
        data-testid="hero-scroll-btn"
      >
        <span className="op-label !text-[10px]">{t.hero.scroll}</span>
        <span className="relative block h-12 w-px overflow-hidden bg-white/20">
          <span className="op-scroll-dot absolute left-0 top-0 h-4 w-px bg-white" />
        </span>
        <ArrowDown className="h-3 w-3 transition-transform duration-500 group-hover:translate-y-1" />
      </motion.button>
    </section>
  );
};
