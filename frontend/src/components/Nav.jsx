import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useLang } from "../lib/i18n";
import { useGoTo } from "../lib/nav";
import { useLocation } from "react-router-dom";
import { Logo } from "./Logo";
import { getIntroDelay } from "../lib/intro";

const LangToggle = ({ testId }) => {
  const { lang, setLang } = useLang();
  return (
    <div className="flex items-center gap-1 rounded-full border border-white/20 p-1 font-mono text-[11px]" data-testid={testId}>
      {["fr", "en"].map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          data-testid={`${testId}-${l}`}
          className={`rounded-full px-3 py-1 uppercase tracking-widest transition-colors duration-300 ${lang === l ? "bg-white text-black" : "text-zinc-300 hover:text-white"}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
};

export const Nav = () => {
  const { t } = useLang();
  const goTo = useGoTo();
  const { pathname } = useLocation();
  const [delay] = useState(() => (pathname === "/" ? getIntroDelay() : 0));
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id) => {
    setOpen(false);
    goTo(id);
  };

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: delay + 0.9, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,padding] duration-500 ${scrolled ? "border-b border-white/10 bg-black/60 py-3 backdrop-blur-xl" : "border-b border-transparent py-5"}`}
        data-testid="site-nav"
      >
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 sm:px-10">
          <Logo onClick={() => go("home")} />
          <nav className="hidden items-center gap-5 xl:flex 2xl:gap-9">
            {t.nav.map((n) => (
              <button key={n.id} onClick={() => go(n.id)} data-testid={`nav-link-${n.id}`} className="op-navlink">
                {n.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <LangToggle testId="lang-toggle" />
            <button className="text-white xl:hidden" onClick={() => setOpen(true)} data-testid="mobile-menu-open" aria-label="Menu">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col bg-[#050505] px-6 py-6 xl:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
            data-testid="mobile-menu"
          >
            <div className="flex items-center justify-between">
              <Logo onClick={() => go("home")} />
              <button onClick={() => setOpen(false)} className="text-white" data-testid="mobile-menu-close" aria-label="Close">
                <X className="h-7 w-7" />
              </button>
            </div>
            <div className="mt-16 flex flex-1 flex-col gap-4">
              {t.nav.map((n, i) => (
                <motion.button
                  key={n.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.07, duration: 0.6 }}
                  onClick={() => go(n.id)}
                  data-testid={`mobile-nav-link-${n.id}`}
                  className="flex items-baseline gap-4 text-left font-display text-5xl text-white"
                >
                  <span className="font-mono text-xs text-zinc-400">0{i + 1}</span>
                  {n.label}
                </motion.button>
              ))}
            </div>
            <LangToggle testId="mobile-lang-toggle" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
