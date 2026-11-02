import { useRef, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, GripVertical, ImageUp, Plus, Trash2 } from "lucide-react";
import { asset } from "../../lib/i18n";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const LABELS = {
  title: "Titre", label: "Sur-titre", lines: "Lignes", paragraphs: "Paragraphes", closing: "Phrases de fin",
  bio: "Biographie", role: "Rôle", name: "Nom", items: "Éléments", columns: "Colonnes", quote: "Citation",
  tail: "Phrases finales", note: "Texte", values: "Valeurs", intro: "Introduction", synopsis: "Synopsis",
  festivals: "Festivals", year: "Année", director: "Réalisation", poster: "Affiche", netflix: "Lien Netflix",
  type: "Type", fr: "Français", en: "Anglais", img: "Photo", image: "Image", email: "Email", phone: "Téléphone",
  instagram: "Lien Instagram", linkedin: "Lien LinkedIn", client: "Client", nav: "Menu", hero: "Accueil",
  about: "À propos", founders: "Fondateurs", films: "Cinéma", commercials: "Publicités", press: "Sélections & presse",
  manifesto: "Manifeste (Wild & Free)", vision: "Vision", expertise: "Ce que nous faisons", contact: "Contact",
  footer: "Pied de page", marquee: "Bandeau défilant", people: "Personnes", quotes: "Citations", source: "Source",
  detail: "Détail", links: "Liens", form: "Formulaire", labels: "Libellés", location: "Adresse", eyebrow: "Sur-titre",
  scroll: "Texte défiler", text: "Texte", id: "Ancre (ne pas modifier)", projectTypes: "Types de projet", blurb: "Description",
  artists: "Artistes résidents", artistFilters: "Filtres", slug: "Identifiant d'URL (sans espaces)", tags: "Catégories (clés des filtres)",
  logoMark: "Logo miniature — menu, admin (PNG blanc sur fond transparent)", logoFull: "Logo entier — ouverture animée et pied de page (PNG blanc sur fond transparent)",
  laurels: "Lauriers (festivals)", laurelTag: "Mention sous les lauriers",
  aiStudio: "AI Studio", voiceRoom: "The Voice Room", aiStudioMedia: "AI Studio — vidéos", voiceRoomMedia: "Voice Room — vidéos",
  lead: "Accroche", servicesLabel: "Titre « Ce que nous créons »", services: "Prestations", worksLabel: "Titre de la sélection", watch: "Bouton vidéo", cta: "Appel à l'action (vers le contact)",
  featured: "Collaboration à la une", creditsLabel: "Intitulé des crédits", credits: "Crédits", capsules: "Capsules",
  cover: "Vidéo d'ouverture (plein écran)", works: "Projets", category: "Catégorie",
  trailer: "Bande-annonce (lien YouTube, Vimeo ou .mp4 — lue dans la fiche du film)",
  partners: "Partenaires", url: "Site web (optionnel)", partnersLabel: "Titre des partenaires", logo: "Logo (PNG transparent, idéalement blanc ; sans logo, le nom s'affiche)",
  discover: "Bandeaux « À découvrir » (accueil)",
  video: "Vidéo (lien YouTube, Vimeo ou .mp4 — aperçu muet en boucle, plein écran au clic)", photos: "Photos", film: "Film", link: "Lien vidéo (YouTube, Vimeo ou fichier .mp4 — lu sur le site ; Netflix s'ouvre dans un nouvel onglet)", key: "Clé", route: "Page (ne pas modifier)",
};
const IMAGE_KEYS = ["img", "image", "poster", "hero", "about", "manifesto", "logoMark", "logoFull", "logo"];
const LONG_KEYS = ["bio", "synopsis", "quote", "intro", "note", "blurb", "text", "paragraphs", "success"];

const labelOf = (k) => (typeof k === "number" ? `#${k + 1}` : LABELS[k] || k);

const blank = (v) => {
  if (typeof v === "string") return "";
  if (Array.isArray(v)) return [];
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, blank(x)]));
  return v;
};

const ImageField = ({ value, onChange, path }) => {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await axios.post(`${API}/admin/media`, fd, { withCredentials: true });
      onChange(data.url);
      toast.success("Image importée — pensez à enregistrer");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Échec de l'import");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };
  return (
    <div className="flex items-center gap-4">
      {value && <img src={asset(value)} alt="" className={`h-16 w-16 shrink-0 ${path.includes("logo") ? "bg-zinc-900 object-contain p-1" : "object-cover"}`} />}
      <input className="op-admin-input flex-1" value={value} onChange={(e) => onChange(e.target.value)} data-testid={`cms-${path}`} />
      <input ref={ref} type="file" accept="image/*" hidden onChange={upload} />
      <button type="button" onClick={() => ref.current?.click()} className="op-icon-btn shrink-0" disabled={busy} aria-label="upload" data-testid={`cms-upload-${path}`}>
        <ImageUp className="h-4 w-4" />
      </button>
    </div>
  );
};

export const FieldEditor = ({ k, value, onChange, path, depth = 0 }) => {
  const key = typeof k === "number" ? "" : k;
  if (typeof value === "string") {
    const long = LONG_KEYS.includes(key) || value.length > 90 || LONG_KEYS.some((l) => path.includes(`${l}.`));
    return (
      <label className="block">
        <span className="op-label !text-[10px] !tracking-[0.2em]">{labelOf(k)}</span>
        <div className="mt-2">
          {IMAGE_KEYS.includes(key) || /\.photos\.\d+$/.test(path) ? <ImageField value={value} onChange={onChange} path={path} />
            : long ? <textarea rows={3} className="op-admin-input" value={value} onChange={(e) => onChange(e.target.value)} data-testid={`cms-${path}`} />
            : <input className="op-admin-input" value={value} onChange={(e) => onChange(e.target.value)} readOnly={key === "id" || key === "route"} data-testid={`cms-${path}`} />}
        </div>
      </label>
    );
  }
  if (Array.isArray(value)) return <ArrayEditor k={k} value={value} onChange={onChange} path={path} depth={depth} />;
  if (value && typeof value === "object") {
    const body = (
      <div className="space-y-5">
        {Object.entries(value).map(([ck, cv]) => (
          <FieldEditor key={ck} k={ck} value={cv} path={`${path}.${ck}`} depth={depth + 1} onChange={(nv) => onChange({ ...value, [ck]: nv })} />
        ))}
      </div>
    );
    if (depth === 0) return body;
    const raw = value.title || value.name || value.label;
    const name = typeof raw === "object" ? raw?.fr || raw?.en : raw;
    return (
      <details className="group border border-white/10 bg-white/[0.02]" open={depth > 1}>
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 font-display text-lg text-white">
          {labelOf(k)}{typeof k === "number" && name ? ` — ${name}` : ""}<ChevronDown className="h-4 w-4 text-zinc-400 transition-transform group-open:rotate-180" />
        </summary>
        <div className="border-t border-white/10 p-4">{body}</div>
      </details>
    );
  }
  return null;
};

const ArrayEditor = ({ k, value, onChange, path, depth }) => {
  const template = value.length ? blank(value[value.length - 1]) : "";
  const set = (i, nv) => onChange(value.map((x, j) => (j === i ? nv : x)));
  const [armed, setArmed] = useState(null);
  const [dragFrom, setDragFrom] = useState(null);
  const [over, setOver] = useState(null);
  const move = (from, to) => {
    if (from === to || to < 0 || to >= value.length) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };
  const canReorder = value.length > 1;
  return (
    <div className={depth > 0 ? "border border-white/10 p-4" : ""}>
      <div className="mb-4 flex items-center justify-between">
        <span className="font-display text-lg text-white">{labelOf(k)}</span>
        <button type="button" onClick={() => onChange([...value, template])} className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-300 hover:text-white" data-testid={`cms-add-${path}`}>
          <Plus className="h-3.5 w-3.5" />Ajouter
        </button>
      </div>
      <div className="space-y-4">
        {value.map((item, i) => (
          <div
            key={i}
            draggable={armed === i}
            onDragStart={(e) => { setDragFrom(i); e.dataTransfer.effectAllowed = "move"; }}
            onDragOver={(e) => { if (dragFrom !== null) { e.preventDefault(); setOver(i); } }}
            onDrop={(e) => { e.preventDefault(); if (dragFrom !== null) move(dragFrom, i); setDragFrom(null); setOver(null); setArmed(null); }}
            onDragEnd={() => { setDragFrom(null); setOver(null); setArmed(null); }}
            className={`flex items-start gap-3 transition-opacity ${dragFrom === i ? "opacity-40" : ""} ${over === i && dragFrom !== i ? "outline outline-1 outline-white/60" : ""}`}
            data-testid={`cms-item-${path}.${i}`}
          >
            {canReorder && (
              <div className="mt-5 flex flex-col items-center text-zinc-500">
                <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} className="hover:text-white disabled:opacity-20" aria-label="monter" data-testid={`cms-up-${path}.${i}`}><ChevronUp className="h-3.5 w-3.5" /></button>
                <span onMouseDown={() => setArmed(i)} onMouseUp={() => setArmed(null)} onTouchStart={() => setArmed(i)} className="cursor-grab py-1 hover:text-white active:cursor-grabbing" title="Glisser pour réordonner" data-testid={`cms-drag-${path}.${i}`}><GripVertical className="h-4 w-4" /></span>
                <button type="button" onClick={() => move(i, i + 1)} disabled={i === value.length - 1} className="hover:text-white disabled:opacity-20" aria-label="descendre" data-testid={`cms-down-${path}.${i}`}><ChevronDown className="h-3.5 w-3.5" /></button>
              </div>
            )}
            <div className="flex-1">
              <FieldEditor k={i} value={item} path={`${path}.${i}`} depth={depth + 1} onChange={(nv) => set(i, nv)} />
            </div>
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="mt-6 text-zinc-500 hover:text-red-400" aria-label="remove" data-testid={`cms-remove-${path}.${i}`}>
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
