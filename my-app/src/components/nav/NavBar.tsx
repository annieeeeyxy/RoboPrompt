"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function NavBar() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const LINKS = [
    { href: "/", label: t("home") },
    { href: "/about", label: t("about") },
    { href: "/members", label: t("members") },
    { href: "/diary", label: t("diary") },
    { href: "/try", label: t("tryIt") },
  ];

  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-semibold tracking-tight">
          RoboPrompt
        </Link>
        <div className="flex items-center gap-2">
          <ul className="flex gap-1 text-sm">
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
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <LanguageSwitcher />
        </div>
      </nav>
    </header>
  );
}
