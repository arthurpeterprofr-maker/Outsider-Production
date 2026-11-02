import { useMemo, useState } from "react";
import { motion } from "framer-motion";

// Filter chips built from the items themselves, so new categories appear without any admin setup.
export const useChips = (items, keyOf) => {
  const [picked, setActive] = useState("all");
  const keys = useMemo(() => [...new Set(items.map(keyOf).filter(Boolean))], [items, keyOf]);
  const active = keys.includes(picked) ? picked : "all";
  const shown = active === "all" ? items : items.filter((it) => keyOf(it) === active);
  return { keys, active, setActive, shown };
};

export const Chips = ({ keys, active, onPick, allLabel, testId }) => {
  if (keys.length < 2) return null;
  return (
    <div className="flex flex-wrap gap-2" data-testid={testId}>
      {["all", ...keys].map((k) => (
        <button key={k} type="button" onClick={() => onPick(k)} data-testid={`${testId}-${k === "all" ? "all" : keys.indexOf(k)}`}
          className={`relative rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors duration-300 ${active === k ? "border-white text-black" : "border-white/20 text-zinc-300 hover:border-white/50 hover:text-white"}`}>
          {active === k && <motion.span layoutId={`${testId}-pill`} className="absolute inset-0 rounded-full bg-white" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
          <span className="relative">{k === "all" ? allLabel : k}</span>
        </button>
      ))}
    </div>
  );
};
