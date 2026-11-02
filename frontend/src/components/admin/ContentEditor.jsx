import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Save, RotateCcw } from "lucide-react";
import { useLang } from "../../lib/i18n";
import { FieldEditor } from "./FieldEditor";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SECTIONS = [
  { key: "fr", label: "Textes FR" },
  { key: "en", label: "Textes EN" },
  { key: "films", label: "Cinéma" },
  { key: "commercials", label: "Publicités" },
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
  const dirty = draft !== site;

  useEffect(() => { setDraft(site); }, [site]);

  const save = async () => {
    setBusy(true);
    try {
      await axios.put(`${API}/admin/content`, { content: draft }, { withCredentials: true });
      setSite(draft);
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
          <button onClick={save} disabled={busy || !dirty} className="op-btn !py-3" data-testid="cms-save-btn"><Save className="h-4 w-4" /><span>{busy ? "…" : "Enregistrer"}</span></button>
        </div>
      </div>
      <p className="mt-6 font-body text-sm text-zinc-400">Les modifications sont visibles sur le site dès l'enregistrement. Pour les images, importez un fichier (max 6 Mo) ou collez un lien.</p>
      <div className="mt-8 space-y-4 pb-24">
        <FieldEditor k={tab} value={draft[tab]} path={tab} depth={0} onChange={(nv) => setDraft({ ...draft, [tab]: nv })} />
      </div>
    </div>
  );
};
