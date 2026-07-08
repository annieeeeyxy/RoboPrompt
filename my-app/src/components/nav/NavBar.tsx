"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/members", label: "Members" },
  { href: "/diary", label: "Diary" },
  { href: "/try", label: "Try it" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-semibold tracking-tight">
          RoboPrompt
        </Link>
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
      </nav>
    </header>
  );
}
