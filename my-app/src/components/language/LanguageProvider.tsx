"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { copy } from "@/lib/i18n";
import { DEFAULT_LANGUAGE, isLanguageCode, type LanguageCode } from "@/lib/languages";

const STORAGE_KEY = "roboprompt-language";

type LanguageContextValue = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: (typeof copy)[LanguageCode];
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("roboprompt-language-change", onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("roboprompt-language-change", onStoreChange);
  };
}

function getLanguageSnapshot() {
  const savedLanguage = window.localStorage.getItem(STORAGE_KEY);
  return isLanguageCode(savedLanguage) ? savedLanguage : DEFAULT_LANGUAGE;
}

function getServerLanguageSnapshot() {
  return DEFAULT_LANGUAGE;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const language = useSyncExternalStore(
    subscribe,
    getLanguageSnapshot,
    getServerLanguageSnapshot
  );

  const setLanguage = useCallback((nextLanguage: LanguageCode) => {
    window.localStorage.setItem(STORAGE_KEY, nextLanguage);
    window.dispatchEvent(new Event("roboprompt-language-change"));
    document.documentElement.lang = nextLanguage;
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(
    () => ({ language, setLanguage, t: copy[language] }),
    [language, setLanguage]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
