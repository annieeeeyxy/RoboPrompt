"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Language = "en" | "es" | "fr" | "zh";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    // Load language from localStorage on mount
    const saved = localStorage.getItem("language") as Language | null;
    if (saved && ["en", "es", "fr", "zh"].includes(saved)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading persisted language from localStorage, not derivable during SSR render
      setLanguageState(saved);
    } else {
      // Default to browser language if supported
      const browserLang = navigator.language.split("-")[0];
      if (["es", "fr", "zh"].includes(browserLang)) {
        setLanguageState(browserLang as Language);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("language", lang);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
