"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";

function formatDate(iso: string, language: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat(language, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

const MAX_BAR_HEIGHT = 96;

export function ActivityChart({
  data,
}: {
  data: { date: string; commits: number }[];
}) {
  const { language } = useLanguage();
  const { t } = useTranslation();
  const max = Math.max(...data.map((d) => d.commits));

  return (
    <div className="rounded-2xl border border-black/10 p-5 dark:border-white/10">
      <p className="text-xs font-medium uppercase tracking-wide text-black/40 dark:text-white/40">
        {t("commitActivity")}
      </p>
      <div className="mt-4 flex items-end gap-6 border-b border-black/15 pb-2 dark:border-white/15">
        {data.map((d) => {
          const height = Math.max(4, (d.commits / max) * MAX_BAR_HEIGHT);
          return (
            <div key={d.date} className="flex w-6 flex-col items-center gap-1.5">
              <span className="text-xs font-medium text-black/60 dark:text-white/70">
                {d.commits}
              </span>
              <div
                className="w-6 rounded-t-[4px] bg-[#2a78d6] transition-opacity hover:opacity-80 dark:bg-[#3987e5]"
                style={{ height }}
                title={`${formatDate(d.date, language)}: ${d.commits}`}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-6">
        {data.map((d) => (
          <span key={d.date} className="w-6 text-center text-xs text-black/40 dark:text-white/40">
            {formatDate(d.date, language)}
          </span>
        ))}
      </div>
    </div>
  );
}
