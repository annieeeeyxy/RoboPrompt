"use client";

import type { ValidationItem } from "@/lib/kortex/types";

const STYLES = {
  ok: { dot: "bg-emerald-400", text: "text-emerald-200", border: "border-emerald-500/25 bg-emerald-500/5" },
  warning: { dot: "bg-amber-400", text: "text-amber-200", border: "border-amber-500/25 bg-amber-500/5" },
  error: { dot: "bg-red-400", text: "text-red-200", border: "border-red-500/30 bg-red-500/5" },
} as const;

export function SafetyCheckList({ items }: { items: ValidationItem[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, i) => {
        const style = STYLES[item.level];
        return (
          <li key={i} className={`flex items-start gap-2.5 rounded-lg border px-3 py-2.5 ${style.border}`}>
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${style.dot}`} />
            <span className={`text-xs leading-5 ${style.text}`}>{item.message}</span>
          </li>
        );
      })}
    </ul>
  );
}
