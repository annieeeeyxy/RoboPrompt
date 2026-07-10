"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTranslation } from "@/hooks/useTranslation";

type PlanSection = { title: string | null; body: string };

/** Split the plan markdown into sections at "## " headings. */
function splitSections(markdown: string): PlanSection[] {
  const lines = markdown.split("\n");
  const sections: PlanSection[] = [];
  let title: string | null = null;
  let buffer: string[] = [];
  const flush = () => {
    const body = buffer.join("\n").trim();
    if (body || title) sections.push({ title, body });
    buffer = [];
  };
  for (const line of lines) {
    const match = line.match(/^##\s+(.+)$/);
    if (match) {
      flush();
      title = match[1].trim();
    } else {
      buffer.push(line);
    }
  }
  flush();
  return sections;
}

/** Pick an icon by heading keywords — works across en/es/fr/zh plans. */
function iconFor(title: string | null): React.ReactNode {
  const s = (title ?? "").toLowerCase();
  const has = (...words: string[]) => words.some((w) => s.includes(w));

  if (has("summary", "resumen", "résumé", "resume", "摘要", "总结", "概述"))
    return (
      // document lines
      <path d="M6 3h9l4 4v14H6V3zm9 0v4h4M9 11h7M9 15h7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    );
  if (has("architecture", "arquitectura", "架构", "结构"))
    return (
      // stacked layers
      <path d="M12 3l9 5-9 5-9-5 9-5zm-9 9l9 5 9-5m-18 4l9 5 9-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    );
  if (has("hardware", "firmware", "parts", "bom", "material", "matériel", "equipo", "硬件", "固件", "材料", "清单"))
    return (
      // chip
      <path d="M8 8h8v8H8V8zm-4 3v2m16-2v2M11 4h2m-2 16h2M6 4v2m12-2v2M6 18v2m12-2v2M4 7h2m12 0h2M4 15h2m12 0h2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    );
  if (has("build", "montage", "construcción", "construccion", "搭建", "构建", "步骤", "组装"))
    return (
      // wrench
      <path d="M14.5 6.5a4 4 0 0 0-5.3 5L4 16.7V20h3.3l5.2-5.2a4 4 0 0 0 5-5.3l-2.7 2.7-2.8-2.8 2.5-2.9z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    );
  if (has("test", "prueba", "测试", "校准", "验证"))
    return (
      // check in circle
      <path d="M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18zm-4-9l3 3 5-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    );
  if (has("safety", "seguridad", "sécurité", "securite", "安全"))
    return (
      // shield
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3zm-3 9l2.5 2.5L16 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    );
  if (has("assumption", "question", "supuesto", "hypothèse", "hypothese", "pregunta", "假设", "问题", "待定"))
    return (
      // alert triangle
      <path d="M12 4l9 16H3L12 4zm0 6v4m0 3v.01" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    );
  return (
    // sparkles (default)
    <path d="M12 4l1.8 4.2L18 10l-4.2 1.8L12 16l-1.8-4.2L6 10l4.2-1.8L12 4zm7 10l.9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  );
}

const proseClass =
  "prose prose-sm dark:prose-invert max-w-none prose-headings:font-semibold prose-pre:bg-black/5 dark:prose-pre:bg-white/10";

export function PlanView({
  markdown,
  isStreaming,
  onStartOver,
  actions,
}: {
  markdown: string;
  isStreaming: boolean;
  onStartOver: () => void;
  actions?: React.ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6">
      {isStreaming ? (
        // While streaming, render plain markdown — sections become cards
        // once the plan is complete.
        <div className={proseClass}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
          <span className="animate-pulse">▍</span>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {splitSections(markdown).map((section, i) => (
            <section
              key={`${section.title ?? "intro"}-${i}`}
              className="rounded-2xl border border-black/10 bg-black/[0.02] p-5 dark:border-white/10 dark:bg-white/[0.03]"
            >
              {section.title && (
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-600/10 text-pink-600 dark:bg-pink-500/15 dark:text-pink-400">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                      {iconFor(section.title)}
                    </svg>
                  </span>
                  <h2 className="text-lg font-semibold">{section.title}</h2>
                </div>
              )}
              <div className={proseClass}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{section.body}</ReactMarkdown>
              </div>
            </section>
          ))}
        </div>
      )}
      {!isStreaming && (
        <div className="flex flex-wrap items-center gap-3">
          {actions}
          <button
            onClick={onStartOver}
            className="rounded-full border border-pink-500/40 px-4 py-2 text-xs font-medium text-pink-400 transition-colors hover:border-pink-500 hover:text-pink-300"
          >
            {t("startOverWithNewArm")}
          </button>
        </div>
      )}
    </div>
  );
}
