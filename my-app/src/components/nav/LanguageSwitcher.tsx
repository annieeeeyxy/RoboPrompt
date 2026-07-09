"use client";

import { useLanguage } from "@/context/LanguageContext";
import type { Language } from "@/context/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";

const LANGUAGES: { code: Language; name: string; flag: string }[] = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
];

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <div className="relative group">
      <button
        className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/10"
        title={t("changeLanguage")}
      >
        <span className="text-sm">
          {LANGUAGES.find((l) => l.code === language)?.flag || "🌐"}
        </span>
      </button>
      <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute right-0 mt-1 w-32 rounded-lg border border-black/10 bg-white shadow-lg transition-all dark:border-white/10 dark:bg-gray-950 z-50">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`block w-full px-3 py-2 text-left text-xs transition-colors ${
              language === lang.code
                ? "bg-pink-500/10 font-medium text-pink-600 dark:text-pink-400"
                : "text-black/70 hover:bg-black/5 dark:text-white/70 dark:hover:bg-white/10"
            }`}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.name}
          </button>
        ))}
      </div>
    </div>
  );
}
