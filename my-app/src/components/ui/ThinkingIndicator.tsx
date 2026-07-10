"use client";

import { RobotLogo } from "@/components/nav/RobotLogo";
import { useTranslation } from "@/hooks/useTranslation";

export function ThinkingIndicator({ label }: { label?: string }) {
  const { t } = useTranslation();

  return (
    <div
      className="flex flex-col items-center justify-center gap-4 py-14"
      role="status"
      aria-label={label ?? t("thinking")}
    >
      <div className="relative flex h-24 w-24 items-center justify-center">
        <span className="absolute h-16 w-16 animate-pulse rounded-full bg-pink-500/20 blur-xl" />
        <svg
          viewBox="0 0 100 100"
          className="absolute h-full w-full animate-spin [animation-duration:1.4s]"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="thinking-trail" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ec4899" stopOpacity="0" />
              <stop offset="70%" stopColor="#ec4899" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="url(#thinking-trail)"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeDasharray="200 89"
          />
          <circle cx="96" cy="50" r="4.5" fill="#ec4899" />
        </svg>
        <RobotLogo className="h-12 w-12" />
      </div>
      <p className="text-sm font-medium text-black/60 dark:text-white/60">
        {label ?? t("thinking")}
      </p>
    </div>
  );
}
