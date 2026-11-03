import { useState } from "react";
import { ChevronDown, ChevronUp, Eye, EyeOff, GripVertical } from "lucide-react";
import { useAdminLang, useAT } from "../../lib/adminI18n";
import { HOME_SECTIONS_EN } from "../../lib/adminLabels";

export const HOME_SECTION_LABELS = {
  about: "À propos", founders: "Fondateurs", films: "Cinéma", commercials: "Publicités", dna: "ADN (manifeste)",
  vision: "Vision", expertise: "Savoir-faire", discover: "À découvrir (AI Studio, Voice Room)", press: "Sélections & presse", contact: "Contact",
};

// Drag-and-drop order of home sections, with a show/hide toggle (contact always visible).
export const HomeOrderEditor = ({ value, onChange }) => {
  const list = Array.isArray(value) ? value : [];
  const lang = useAdminLang();
  const a = useAT();
  const names = lang === "en" ? HOME_SECTIONS_EN : HOME_SECTION_LABELS;
  const [from, setFrom] = useState(null);
  const [over, setOver] = useState(null);
  const move = (a, b) => {
    if (a === b || b < 0 || b >= list.length) return;
    const next = [...list];
    const [it] = next.splice(a, 1);
    next.splice(b, 0, it);
    onChange(next);
  };
  const toggle = (i) => onChange(list.map((s, j) => (j === i ? { ...s, show: s.show === false } : s)));
  return (
    <div data-testid="home-order-editor">
      <p className="mb-6 font-body text-sm text-zinc-400">{a.homeOrderHelp}</p>
      <ol className="space-y-2">
        {list.map((s, i) => (
          <li key={s.id} draggable onDragStart={(e) => { setFrom(i); e.dataTransfer.effectAllowed = "move"; }}
            onDragOver={(e) => { if (from !== null) { e.preventDefault(); setOver(i); } }}
            onDrop={(e) => { e.preventDefault(); if (from !== null) move(from, i); setFrom(null); setOver(null); }}
            onDragEnd={() => { setFrom(null); setOver(null); }}
            className={`flex cursor-grab items-center gap-4 border border-white/10 bg-white/[0.02] px-4 py-4 transition-[opacity,border-color] active:cursor-grabbing ${from === i ? "opacity-40" : ""} ${over === i && from !== i ? "border-white/70" : ""} ${s.show === false ? "text-zinc-500" : "text-white"}`}
            data-testid={`home-order-item-${s.id}`}>
            <GripVertical className="h-4 w-4 shrink-0 text-zinc-500" />
            <span className="w-6 font-mono text-[11px] text-zinc-500">{String(i + 1).padStart(2, "0")}</span>
            <span className={`flex-1 font-display text-lg ${s.show === false ? "line-through" : ""}`}>{names[s.id] || s.id}</span>
            <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} className="text-zinc-400 hover:text-white disabled:opacity-20" aria-label="monter" data-testid={`home-order-up-${s.id}`}><ChevronUp className="h-4 w-4" /></button>
            <button type="button" onClick={() => move(i, i + 1)} disabled={i === list.length - 1} className="text-zinc-400 hover:text-white disabled:opacity-20" aria-label="descendre" data-testid={`home-order-down-${s.id}`}><ChevronDown className="h-4 w-4" /></button>
            {s.id !== "contact" && (
              <button type="button" onClick={() => toggle(i)} className="text-zinc-400 hover:text-white" aria-label={s.show === false ? "afficher" : "masquer"} data-testid={`home-order-toggle-${s.id}`}>
                {s.show === false ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
};
