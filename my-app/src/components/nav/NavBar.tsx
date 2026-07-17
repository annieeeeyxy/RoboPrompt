"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { RobotLogo } from "./RobotLogo";

export function NavBar() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const LINKS = [
    { href: "/", label: t("home") },
    { href: "/about", label: t("about") },
    { href: "/kinova", label: t("kinova") },
    { href: "/diary", label: t("diary") },
    { href: "/try", label: t("tryIt") },
  ];

  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <RobotLogo className="h-7 w-7" />
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
                        ? "bg-pink-500/15 font-medium text-pink-400"
                        : "text-white/60 hover:text-foreground"
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
