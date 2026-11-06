import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { defaultContent } from "./content";
import { PREVIEW_KEY, isPreview, readPreview } from "./preview";

const BACKEND = process.env.REACT_APP_BACKEND_URL ?? "";
const LangContext = createContext(null);

const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);
export const deepMerge = (base, over) => {
  if (!isObj(base) || !isObj(over)) return over === undefined ? base : over;
  const out = { ...base };
  Object.keys(over).forEach((k) => { out[k] = deepMerge(base[k], over[k]); });
  return out;
};

export const asset = (url) => (url && url.startsWith("/api/") ? `${BACKEND}${url}` : url);

// Saved menus predate new pages: insert any default page link that is missing, before "contact".
const withNewPages = (site) => {
  ["fr", "en"].forEach((l) => {
    const nav = Array.isArray(site[l]?.nav) ? site[l].nav.map((n) => {
      const d = (defaultContent[l].nav || []).find((x) => x.id === n?.id);
      return d?.route && !n.route ? { ...n, route: d.route } : n;
    }) : null;
    if (!nav) return;
    (defaultContent[l].nav || []).filter((d) => d.route && !nav.some((n) => n.id === d.id)).forEach((d) => {
      const at = nav.findIndex((n) => n.id === "contact");
      nav.splice(at < 0 ? nav.length : at, 0, d);
    });
    site[l] = { ...site[l], nav };
  });
  // Films saved before the trailer field existed: add it so the admin shows it.
  if (Array.isArray(site.films)) site.films = site.films.map((f) => (f && typeof f === "object" && !("trailer" in f) ? { ...f, trailer: "" } : f));
  // Artists saved with a single "film": move it into the "videos" list and add the show/hide switches.
  if (Array.isArray(site.artists)) {
    site.artists = site.artists.map((ar) => {
      if (!ar || typeof ar !== "object") return ar;
      const { film, ...rest } = ar;
      const videos = Array.isArray(ar.videos) ? ar.videos : film ? [{ title: "", image: film.image || "", link: film.link || "" }] : [];
      return { ...rest, showFilms: ar.showFilms !== false, videos, showPhotos: ar.showPhotos !== false, photos: Array.isArray(ar.photos) ? ar.photos : [] };
    });
  }
  // Home order: keep saved order of known sections, append sections added since.
  const known = defaultContent.homeSections.map((s) => s.id);
  const saved = (Array.isArray(site.homeSections) ? site.homeSections : []).filter((s, i, a) => known.includes(s?.id) && a.findIndex((x) => x?.id === s.id) === i);
  site.homeSections = [...saved, ...defaultContent.homeSections.filter((d) => !saved.some((s) => s.id === d.id))];
  return site;
};
const build = (over) => withNewPages(deepMerge(defaultContent, over));

export const LangProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem("op-lang") || "fr");
  const [site, setSite] = useState(defaultContent);

  const reload = useCallback(async () => {
    if (isPreview()) {
      const draft = readPreview();
      if (isObj(draft)) { setSite(build(draft)); return; }
    }
    try {
      const { data } = await axios.get(`${BACKEND}/api/content`);
      if (isObj(data?.content)) setSite(build(data.content));
    } catch {
      setSite(defaultContent);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);
  useEffect(() => {
    if (!isPreview()) return undefined;
    const onStorage = (e) => { if (e.key === PREVIEW_KEY) reload(); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [reload]);
  useEffect(() => {
    localStorage.setItem("op-lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t: site[lang] || defaultContent[lang], site, setSite, reload }), [lang, site, reload]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
};

export const useLang = () => useContext(LangContext);
