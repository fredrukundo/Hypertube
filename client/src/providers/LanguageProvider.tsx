"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getTranslation } from "@/lib/i18n";

type LanguageContextType = {
  lang: string;
  setLang: (lang: string) => void;
  t: any;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    const savedLang = localStorage.getItem("app_language");
    if (savedLang) {
      setLang(savedLang);
    }
  }, []);

  useEffect(() => {

}, [lang]);

  const t = getTranslation(lang);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}