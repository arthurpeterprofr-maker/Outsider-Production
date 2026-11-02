import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Save, RotateCcw, Eye, History } from "lucide-react";
import { useLang, deepMerge } from "../../lib/i18n";
import { defaultContent } from "../../lib/content";
import { Versions } from "./Versions";
import { PREVIEW_KEY } from "../../lib/preview";
import { FieldEditor } from "./FieldEditor";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SECTIONS = [
  { key: "fr", label: "Textes FR" },
  { key: "en", label: "Textes EN" },
  { key: "films", label: "Cinéma" },
  { key: "commercials", label: "Publicités" },
  { key: "artists", label: "Artistes" },
  { key: "artistFilters", label: "Filtres artistes" },
  { key: "people", label: "Fondateurs" },
  { key: "laurels", label: "Lauriers" },
  { key: "contact", label: "Coordonnées" },
  { key: "media", label: "Images du site" },
];

export const ContentEditor = () => {
  const { site, setSite } = useLang();
  const [draft, setDraft] = useState(site);
  const [tab, setTab] = useState("fr");
  const [busy, setBusy] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [versionsKey, setVersionsKey] = useState(0);
  const dirty = draft !== site;

  useEffect(() => { setDraft(site); }, [site]);
  useEffect(() => {
    const t = setTimeout(() => localStorage.setItem(PREVIEW_KEY, JSON.stringify(draft)), 300);
    return () => clearTimeout(t);
  }, [draft]);

  const openPreview = () => {
    localStorage.setItem(PREVIEW_KEY, JSON.stringify(draft));
    window.open("/?preview=1", "op-preview");
  };

  const save = async () => {
    setBusy(true);
    try {
      await axios.put(`${API}/admin/content`, { content: draft }, { withCredentials: true });
      setSite(draft);
      setVersionsKey((k) => k + 1);
      toast.success("Contenu enregistré — le site est à jour");
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Échec de l'enregistrement");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-testid="content-editor">
      <div className="sticky top-0 z-10 -mx-5 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-[#050505]/95 px-5 py-4 backdrop-blur sm:-mx-10 sm:px-10">
        <div className="flex flex-wrap gap-2">
          {SECTIONS.map((s) => (
            <button key={s.key} onClick={() => setTab(s.key)} data-testid={`cms-tab-${s.key}`}
              className={`rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors ${tab === s.key ? "bg-white text-black" : "border border-white/15 text-zinc-300 hover:text-white"}`}>
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {dirty && <button onClick={() => setDraft(site)} className="op-icon-btn" aria-label="annuler" data-testid="cms-reset-btn"><RotateCcw className="h-4 w-4" /></button>}
          <button onClick={() => setShowVersions((s) => !s)} className="op-icon-btn" aria-label="historique" data-testid="cms-history-btn"><History className="h-4 w-4" /></button>
          <button onClick={openPreview} className="op-btn !py-3" data-testid="cms-preview-btn"><Eye className="h-4 w-4" /><span>Aperçu</span></button>
          <button onClick={save} disabled={busy || !dirty} className="op-btn !py-3" data-testid="cms-save-btn"><Save className="h-4 w-4" /><span>{busy ? "…" : "Enregistrer"}</span></button>
        </div>
      </div>
      <p className="mt-6 font-body text-sm text-zinc-400">Les modifications ne sont visibles par le public qu'après « Enregistrer ». Le bouton « Aperçu » ouvre le site avec vos changements non publiés (mis à jour en direct). Pour les images, importez un fichier (max 6 Mo) ou collez un lien.</p>
      {showVersions && (
        <Versions
          key={versionsKey}
          onClose={() => setShowVersions(false)}
          onRestored={(c) => { if (c && typeof c === "object") setSite(deepMerge(defaultContent, c)); }}
        />
      )}
      <div className="mt-8 space-y-4 pb-24">
        <FieldEditor k={tab} value={draft[tab]} path={tab} depth={0} onChange={(nv) => setDraft({ ...draft, [tab]: nv })} />
      </div>
    </div>
  );
};
