"use client";

import { Spinner } from "@/components/ui/Spinner";
import { useTranslation } from "@/hooks/useTranslation";

export function ThinkingIndicator({ label }: { label?: string }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-black/50 dark:text-white/50">
      <span className="relative flex h-8 w-8 items-center justify-center">
        <span className="absolute h-full w-full animate-ping rounded-full bg-pink-500/30" />
        <Spinner className="relative h-4 w-4 border-pink-500" ariaLabel={t("loading")} />
      </span>
      <p className="text-sm">{label ?? t("thinking")}</p>
    </div>
  );
}
