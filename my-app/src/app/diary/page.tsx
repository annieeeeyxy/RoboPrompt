"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ActivityChart } from "@/components/diary/ActivityChart";
import { useLanguage } from "@/context/LanguageContext";
import { DIARY_ACTIVITY } from "@/content/diary-activity";
import { DIARY_CONTENT } from "@/content/diary-content";

export default function DiaryPage() {
  const { language } = useLanguage();
  const markdown = DIARY_CONTENT[language] ?? DIARY_CONTENT.en;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-16">
      <ActivityChart data={DIARY_ACTIVITY} />
      <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-semibold">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
      </div>
    </main>
  );
}
