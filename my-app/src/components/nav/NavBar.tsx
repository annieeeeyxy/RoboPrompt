"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/language/LanguageProvider";
import { LANGUAGES, isLanguageCode } from "@/lib/languages";

const LINKS = [
  { href: "/", labelKey: "home" },
  { href: "/about", labelKey: "about" },
  { href: "/members", labelKey: "members" },
  { href: "/diary", labelKey: "diary" },
  { href: "/try", labelKey: "try" },
] as const;

export function NavBar() {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <nav className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <Link href="/" className="font-semibold tracking-tight">
          RoboPrompt
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <ul className="flex flex-wrap gap-1 text-sm">
            {LINKS.map((link) => {
              const isActive =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`rounded-full px-3 py-1.5 transition-colors ${
                      isActive
                        ? "bg-black/10 font-medium text-foreground dark:bg-white/15"
                        : "text-black/60 hover:text-foreground dark:text-white/60 dark:hover:text-foreground"
                    }`}
                  >
                    {t.nav[link.labelKey]}
                  </Link>
                </li>
              );
            })}
          </ul>
          <label className="sr-only" htmlFor="language-select">
            {t.nav.language}
          </label>
          <select
            id="language-select"
            value={language}
            onChange={(event) => {
              if (isLanguageCode(event.target.value)) setLanguage(event.target.value);
            }}
            className="rounded-full border border-black/15 bg-transparent px-3 py-1.5 text-sm text-black/70 outline-none transition-colors hover:border-black/30 focus:border-blue-500 dark:border-white/15 dark:text-white/70 dark:hover:border-white/30"
            aria-label={t.nav.language}
          >
            {LANGUAGES.map((option) => (
              <option key={option.code} value={option.code}>
                {option.nativeLabel}
              </option>
            ))}
          </select>
        </div>
      </nav>
    </header>
  );
}
