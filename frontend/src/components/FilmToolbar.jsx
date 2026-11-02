import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";

const norm = (s) => (s || "").toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

// Text search on title + director, then sort by year (or keep the studio's order).
export const useFilmQuery = (films) => {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("default");
  const list = useMemo(() => {
    const needle = norm(q.trim());
    const hit = needle ? films.filter((f) => norm(`${f.title} ${f.director}`).includes(needle)) : films;
    if (sort === "default") return hit;
    const year = (f) => parseInt(f.year, 10) || 0;
    return [...hit].sort((a, b) => (sort === "new" ? year(b) - year(a) : year(a) - year(b)));
  }, [films, q, sort]);
  return { q, setQ, sort, setSort, list };
};

export const FilmToolbar = ({ q, setQ, sort, setSort, t }) => (
  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    <label className="group flex w-full items-center gap-3 border-b border-white/20 pb-3 transition-colors focus-within:border-white md:max-w-md">
      <Search className="h-4 w-4 shrink-0 text-zinc-400 group-focus-within:text-white" />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.search} aria-label={t.search} data-testid="film-search-input"
        className="w-full bg-transparent font-body text-base text-white placeholder:text-zinc-500 focus:outline-none" />
      {q && <button type="button" onClick={() => setQ("")} aria-label="clear" data-testid="film-search-clear" className="text-zinc-400 hover:text-white"><X className="h-4 w-4" /></button>}
    </label>
    <div className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.2em]" data-testid="film-sort">
      {[["default", t.sortDefault], ["new", t.sortNew], ["old", t.sortOld]].map(([k, l]) => (
        <button key={k} type="button" onClick={() => setSort(k)} data-testid={`film-sort-${k}`}
          className={`whitespace-nowrap px-2 py-2 transition-colors duration-300 sm:px-3 ${sort === k ? "text-white underline decoration-1 underline-offset-8" : "text-zinc-400 hover:text-white"}`}>
          {l}
        </button>
      ))}
    </div>
  </div>
);
