"use client";

import Link from "next/link";
import {
  UploadIcon,
  ChatIcon,
  DocumentIcon,
  SmallArmIcon,
  LargeArmIcon,
} from "@/components/icons";
import { useLanguage } from "@/components/language/LanguageProvider";

const STEP_ICONS = [UploadIcon, ChatIcon, DocumentIcon] as const;
const CATEGORY_ICONS = [SmallArmIcon, LargeArmIcon] as const;

export default function Home() {
  const { t } = useLanguage();
  const steps = t.home.steps.map((step, index) => ({ ...step, icon: STEP_ICONS[index] }));
  const categories = t.home.categories.map((category, index) => ({
    ...category,
    icon: CATEGORY_ICONS[index],
  }));

  return (
    <main className="flex flex-1 flex-col">
      <section className="relative overflow-hidden px-4 pt-24 pb-20 text-center sm:pt-32 sm:pb-28">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 flex justify-center">
          <div className="h-[420px] w-[420px] rounded-full bg-blue-500/20 blur-[100px] dark:bg-blue-500/25" />
        </div>
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6">
          <span className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-black/60 dark:border-white/15 dark:text-white/60">
            {t.home.eyebrow}
          </span>
          <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl md:text-7xl">
            RoboPrompt
          </h1>
          <p className="max-w-xl text-lg text-black/60 sm:text-xl dark:text-white/60">
            {t.home.tagline}
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/try"
              className="rounded-full bg-blue-600 px-7 py-3.5 text-base font-medium text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-500 hover:shadow-blue-500/30"
            >
              {t.home.primaryCta}
            </Link>
            <Link
              href="/about"
              className="rounded-full border border-black/15 px-7 py-3.5 text-base font-medium transition-colors hover:border-black/30 dark:border-white/15 dark:hover:border-white/30"
            >
              {t.home.secondaryCta}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl px-4 py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.title}
              className="flex flex-col gap-3 rounded-2xl border border-black/10 p-6 dark:border-white/10"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
                <step.icon className="h-6 w-6" />
              </div>
              <h2 className="font-medium">{step.title}</h2>
              <p className="text-sm text-black/60 dark:text-white/60">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl px-4 py-16">
        <h2 className="text-center text-2xl font-semibold">{t.home.robotHeading}</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-black/60 dark:text-white/60">
          {t.home.robotBody}
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {categories.map((category) => (
            <div
              key={category.name}
              className="flex items-start gap-4 rounded-2xl border border-black/10 p-6 dark:border-white/10"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black/5 dark:bg-white/10">
                <category.icon className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-medium">{category.name}</h3>
                <p className="mt-1 text-sm text-black/60 dark:text-white/60">{category.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-2xl px-4 py-20 text-center">
        <h2 className="text-2xl font-semibold sm:text-3xl">{t.home.finalHeading}</h2>
        <p className="mt-2 text-sm text-black/60 dark:text-white/60">{t.home.finalBody}</p>
        <Link
          href="/try"
          className="mt-6 inline-block rounded-full bg-blue-600 px-7 py-3.5 text-base font-medium text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-500 hover:shadow-blue-500/30"
        >
          {t.home.primaryCta}
        </Link>
      </section>
    </main>
  );
}
