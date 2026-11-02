import { createContext, useContext, useEffect, useState } from "react";
import { content } from "./content";

const LangContext = createContext({ lang: "fr", t: content.fr, setLang: () => {} });

export const LangProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem("op-lang") || "fr");
  useEffect(() => {
    localStorage.setItem("op-lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);
  return <LangContext.Provider value={{ lang, setLang, t: content[lang] }}>{children}</LangContext.Provider>;
};

export const useLang = () => useContext(LangContext);
