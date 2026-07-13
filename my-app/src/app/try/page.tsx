"use client";

import { useCallback, useState } from "react";
import { ImageDropzone } from "@/components/upload/ImageDropzone";
import { ChatThread } from "@/components/chat/ChatThread";
import { ChatInput } from "@/components/chat/ChatInput";
import { GeneratePlanButton } from "@/components/chat/GeneratePlanButton";
import { PlanView } from "@/components/plan/PlanView";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { useLanguage } from "@/components/language/LanguageProvider";
import { useAgentStream } from "@/hooks/useAgentStream";
import { MAX_IMAGE_FILES } from "@/lib/constants";
import type { ChatMessage, DisplayMessage } from "@/types/chat";

type Phase = "upload" | "interview" | "plan";

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(",")[1] ?? "");
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function TryPage() {
  const { language, t } = useLanguage();
  const [phase, setPhase] = useState<Phase>("upload");
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [displayMessages, setDisplayMessages] = useState<DisplayMessage[]>([]);
  const [planMarkdown, setPlanMarkdown] = useState("");
  const agent = useAgentStream();

  const assistantTurnCount = displayMessages.filter((m) => m.role === "assistant").length;

  const handleImagesReady = useCallback(
    async (blobs: Blob[], previewUrls: string[]) => {
      setPhase("interview");
      setDisplayMessages([
        {
          role: "user",
          text: blobs.length > 1 ? t.try.uploadedMultiple(blobs.length) : t.try.uploadedSingle,
          imageUrls: previewUrls,
        },
      ]);

      const base64s = await Promise.all(blobs.map(blobToBase64));
      const initialMessage: ChatMessage = {
        role: "user",
        content: [
          ...base64s.map(
            (base64): ChatMessage["content"][number] => ({
              type: "image",
              mediaType: "image/jpeg",
              base64,
            })
          ),
          {
            type: "text",
            text: blobs.length > 1 ? t.try.initialMultiple : t.try.initialSingle,
          },
        ],
      };

      const formData = new FormData();
      blobs.forEach((blob, i) => formData.append("file", blob, `arm-${i}.jpg`));
      formData.append("language", language);

      try {
        const result = await agent.send("/api/classify", { method: "POST", body: formData });
        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: [{ type: "text", text: result.text }],
        };
        setHistory([initialMessage, assistantMessage]);
        setDisplayMessages((prev) => [...prev, { role: "assistant", text: result.text }]);
        if (result.phase === "plan") {
          setPlanMarkdown(result.text);
          setPhase("plan");
        }
      } catch {
        // agent.error already holds the message; stay on the interview screen so it renders
      }
    },
    [agent, language, t.try]
  );

  const sendChatMessage = useCallback(
    async (text: string) => {
      setDisplayMessages((prev) => [...prev, { role: "user", text }]);
      try {
        const result = await agent.send("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ history, message: text, language }),
        });
        const userMessage: ChatMessage = { role: "user", content: [{ type: "text", text }] };
        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: [{ type: "text", text: result.text }],
        };
        setHistory((prev) => [...prev, userMessage, assistantMessage]);
        setDisplayMessages((prev) => [...prev, { role: "assistant", text: result.text }]);
        if (result.phase === "plan") {
          setPlanMarkdown(result.text);
          setPhase("plan");
        }
      } catch {
        // agent.error already holds the message
      }
    },
    [agent, history, language]
  );

  const handleGeneratePlanNow = useCallback(() => {
    void sendChatMessage(t.try.generatePlanNow);
  }, [sendChatMessage, t]);

  const handleStartOver = useCallback(() => {
    setPhase("upload");
    setHistory([]);
    setDisplayMessages([]);
    setPlanMarkdown("");
    agent.resetPhase();
  }, [agent]);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-10 sm:py-14">
      {phase === "upload" && (
        <>
          <header className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">
              {t.try.stepLabel}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{t.try.uploadHeading}</h1>
            <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-black/55 dark:text-white/55">
              {t.try.uploadBody}
            </p>
          </header>
          <div className="grid items-stretch gap-5 md:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.65fr)]">
            <ImageDropzone
              onImagesReady={handleImagesReady}
              disabled={agent.isStreaming}
              preparingLabel={t.try.preparing}
              title={t.try.dropzoneTitle}
              hint={t.try.dropzoneHint(MAX_IMAGE_FILES)}
              buttonLabel={t.try.choosePhotos}
            />
            <aside className="rounded-2xl border border-black/10 bg-black/[0.02] p-6 dark:border-white/10 dark:bg-white/[0.03]">
              <h2 className="font-semibold">{t.try.photoTipsHeading}</h2>
              <ol className="mt-4 space-y-4">
                {t.try.photoTips.map((tip, index) => (
                  <li key={tip} className="flex gap-3 text-sm leading-6 text-black/65 dark:text-white/65">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                      {index + 1}
                    </span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ol>
            </aside>
          </div>
          <section className="mx-auto grid max-w-3xl gap-3 rounded-2xl border border-blue-600/15 bg-blue-600/[0.04] px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center dark:border-blue-400/15 dark:bg-blue-400/[0.05]">
            <div>
              <h2 className="text-sm font-semibold">{t.try.whatNextHeading}</h2>
              <p className="mt-1 text-sm leading-6 text-black/60 dark:text-white/60">{t.try.whatNextBody}</p>
            </div>
            <p className="text-xs text-black/45 dark:text-white/45">🔒 {t.try.privacyNote}</p>
          </section>
        </>
      )}

      {phase === "interview" && (
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4">
          <header className="border-b border-black/10 pb-4 dark:border-white/10">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-600 dark:text-blue-400">{t.try.interviewStep}</p>
            <p className="mt-1 text-sm text-black/50 dark:text-white/50">{t.try.interviewHint}</p>
          </header>
          <ChatThread
            messages={displayMessages}
            streamingText={agent.text}
            isStreaming={agent.isStreaming}
          />
          {agent.error && <ErrorBanner message={agent.error} />}
          <ChatInput
            onSend={sendChatMessage}
            disabled={agent.isStreaming}
            placeholder={t.try.inputPlaceholder}
            sendLabel={t.try.send}
          />
          {assistantTurnCount >= 3 && (
            <GeneratePlanButton onClick={handleGeneratePlanNow} disabled={agent.isStreaming} label={t.try.generatePlanButton} />
          )}
        </div>
      )}

      {phase === "plan" && (
        <div className="mx-auto w-full max-w-2xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-blue-600 dark:text-blue-400">{t.try.planStep}</p>
          {agent.error && <ErrorBanner message={agent.error} />}
          <PlanView
            markdown={agent.isStreaming ? agent.text : planMarkdown}
            isStreaming={agent.isStreaming}
            onStartOver={handleStartOver}
            startOverLabel={t.try.startOver}
          />
        </div>
      )}
    </main>
  );
}
