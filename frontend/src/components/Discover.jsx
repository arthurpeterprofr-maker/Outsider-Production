import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useLang } from "../lib/i18n";
import { LoopMedia } from "./VideoTile";
import { Label, EASE } from "./motion";

const Panel = ({ item, cover, i }) => (
  <motion.div className="group relative min-h-[70svh] overflow-hidden lg:min-h-[85vh] lg:flex-1 lg:transition-[flex-grow] lg:duration-700 lg:hover:flex-[1.35]"
    initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 1, ease: EASE, delay: i * 0.12 }}>
    <Link to={item.route || "/"} className="absolute inset-0 block" data-testid={`discover-${i}`} onClick={() => window.scrollTo(0, 0)}>
      <LoopMedia image={cover?.image} video={cover?.video} className="transition-transform duration-[1.8s] group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10 transition-colors duration-700 group-hover:via-black/20" />
      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
        <span className="font-mono text-[11px] tracking-[0.2em] text-zinc-300">{String(i + 1).padStart(2, "0")}</span>
        <h3 className="mt-3 font-display text-4xl leading-[0.95] text-white sm:text-6xl">{item.title}</h3>
        <p className="mt-4 max-w-sm font-body text-base text-zinc-200">{item.text}</p>
        <span className="mt-8 inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.28em] text-white">
          {item.cta}
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 transition-[background-color,color,transform] duration-500 group-hover:rotate-45 group-hover:bg-white group-hover:text-black">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </span>
      </div>
    </Link>
  </motion.div>
);

export const Discover = () => {
  const { t, site } = useLang();
  const d = t.discover || {};
  const items = Array.isArray(d.items) ? d.items : [];
  const covers = { "/ai-studio": site.aiStudioMedia?.cover, "/voice-room": site.voiceRoomMedia?.cover };
  if (!items.length) return null;
  return (
    <section id="discover" className="py-24 sm:py-32" data-testid="discover-section">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-10"><Label>{d.label}</Label></div>
      <div className="mt-12 flex flex-col gap-3 px-3 sm:px-5 lg:flex-row">
        {items.map((item, i) => <Panel key={item.route || i} item={item} cover={covers[item.route]} i={i} />)}
      </div>
    </section>
  );
};
