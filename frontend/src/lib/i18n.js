import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { defaultContent } from "./content";

const BACKEND = process.env.REACT_APP_BACKEND_URL;
const LangContext = createContext(null);

const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);
export const deepMerge = (base, over) => {
  if (!isObj(base) || !isObj(over)) return over === undefined ? base : over;
  const out = { ...base };
  Object.keys(over).forEach((k) => { out[k] = deepMerge(base[k], over[k]); });
  return out;
};

export const asset = (url) => (url && url.startsWith("/api/") ? `${BACKEND}${url}` : url);

export const LangProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem("op-lang") || "fr");
  const [site, setSite] = useState(defaultContent);

  const reload = useCallback(async () => {
    if (!BACKEND) return;
    try {
      const { data } = await axios.get(`${BACKEND}/api/content`);
      if (isObj(data?.content)) setSite(deepMerge(defaultContent, data.content));
    } catch {
      setSite(defaultContent);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);
  useEffect(() => {
    localStorage.setItem("op-lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t: site[lang] || defaultContent[lang], site, setSite, reload }), [lang, site, reload]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
};

export const useLang = () => useContext(LangContext);
