"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import {
  UploadIcon,
  ChatIcon,
  DocumentIcon,
  SmallArmIcon,
  LargeArmIcon,
} from "@/components/icons";

export default function Home() {
  const { t } = useTranslation();

  const STEPS = [
    {
      icon: UploadIcon,
      title: t("uploadPhoto"),
      body: t("uploadPhotoDesc"),
    },
    {
      icon: ChatIcon,
      title: t("answerQuestions"),
      body: t("answerQuestionsDesc"),
    },
    {
      icon: DocumentIcon,
      title: t("getPlan"),
      body: t("getPlanDesc"),
    },
  ];

  const CATEGORIES = [
    {
      icon: SmallArmIcon,
      name: t("smallServo"),
      body: t("smallServoDesc"),
    },
    {
      icon: LargeArmIcon,
      name: t("largeIndustrial"),
      body: t("largeIndustrialDesc"),
    },
  ];

  return (
    <main className="flex flex-1 flex-col">
      <section className="relative overflow-hidden px-4 pt-24 pb-20 text-center sm:pt-32 sm:pb-28">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 flex justify-center">
          <div className="h-[420px] w-[420px] rounded-full bg-pink-500/20 blur-[100px] dark:bg-pink-500/25" />
        </div>
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6">
          <span className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-black/60 dark:border-white/15 dark:text-white/60">
            {t("aiRoboticsAssistant")}
          </span>
          <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl md:text-7xl">
            RoboPrompt
          </h1>
          <p className="max-w-xl text-lg text-black/60 sm:text-xl dark:text-white/60">
            {t("turnPhoto")}
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/try"
              className="rounded-full bg-pink-600 px-7 py-3.5 text-base font-medium text-white shadow-lg shadow-pink-600/25 transition-all hover:bg-pink-500 hover:shadow-pink-500/30"
            >
              {t("tryNow")}
            </Link>
            <Link
              href="/about"
              className="rounded-full border border-black/15 px-7 py-3.5 text-base font-medium transition-colors hover:border-black/30 dark:border-white/15 dark:hover:border-white/30"
            >
              {t("howItWorks")}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl px-4 py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div
              key={step.title}
              className="flex flex-col gap-3 rounded-2xl border border-black/10 p-6 dark:border-white/10"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-600/10 text-pink-600 dark:bg-pink-500/15 dark:text-pink-400">
                <step.icon className="h-6 w-6" />
              </div>
              <h2 className="font-medium">{step.title}</h2>
              <p className="text-sm text-black/60 dark:text-white/60">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl px-4 py-8">
        <Link
          href="/agent"
          className="group flex flex-col items-start gap-2 rounded-2xl border border-cyan-500/25 bg-cyan-500/[0.04] p-6 transition-colors hover:border-cyan-400/50 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h2 className="text-lg font-semibold">{t("visionCtaTitle")}</h2>
            <p className="mt-1 text-sm text-black/60 dark:text-white/60">{t("visionCtaDesc")}</p>
          </div>
          <span className="shrink-0 rounded-full border border-cyan-500/40 px-5 py-2.5 text-sm font-medium text-cyan-600 transition-colors group-hover:bg-cyan-500/10 dark:text-cyan-300">
            {t("visionCtaButton")} →
          </span>
        </Link>
      </section>

      <section className="mx-auto w-full max-w-4xl px-4 py-16">
        <h2 className="text-center text-2xl font-semibold">{t("builtForAny")}</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-black/60 dark:text-white/60">
          {t("buildsRightQuestions")}
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {CATEGORIES.map((category) => (
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
        <h2 className="text-2xl font-semibold sm:text-3xl">{t("readyToSee")}</h2>
        <p className="mt-2 text-sm text-black/60 dark:text-white/60">
          {t("uploadGetStarted")}
        </p>
        <Link
          href="/try"
          className="mt-6 inline-block rounded-full bg-pink-600 px-7 py-3.5 text-base font-medium text-white shadow-lg shadow-pink-600/25 transition-all hover:bg-pink-500 hover:shadow-pink-500/30"
        >
          {t("tryNow")}
        </Link>
      </section>
    </main>
  );
}
