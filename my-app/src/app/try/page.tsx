"use client";

import { useCallback, useEffect, useState } from "react";
import { ImageDropzone } from "@/components/upload/ImageDropzone";
import { ImageThumbnails } from "@/components/upload/ImageThumbnails";
import { ReferenceFileUpload, type ReferenceFileEntry } from "@/components/upload/ReferenceFileUpload";
import { FormView } from "@/components/form/FormView";
import { PlanView } from "@/components/plan/PlanView";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { ThinkingIndicator } from "@/components/ui/ThinkingIndicator";
import { useAgentStream, type FormRequest, type SendResult } from "@/hooks/useAgentStream";
import { useTranslation } from "@/hooks/useTranslation";
import {
  clearSession,
  loadSession,
  previewUrlsFromHistory,
  saveSession,
} from "@/lib/sessionPersistence";
import type { ChatMessage } from "@/types/chat";

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
  const { t, language } = useTranslation();
  const [phase, setPhase] = useState<Phase>("upload");
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [currentForm, setCurrentForm] = useState<FormRequest | null>(null);
  const [fallbackText, setFallbackText] = useState<string | null>(null);
  const [formCount, setFormCount] = useState(0);
  const [planMarkdown, setPlanMarkdown] = useState("");
  const [selectedImages, setSelectedImages] = useState<Blob[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [refEntries, setRefEntries] = useState<ReferenceFileEntry[]>([]);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [revisionText, setRevisionText] = useState("");
  const agent = useAgentStream();

  // Restore a saved interview after a refresh, so mid-interview progress
  // (and a finished plan) survives reloads. Photo thumbnails are rebuilt
  // from the base64 images already embedded in the restored history.
  useEffect(() => {
    const saved = loadSession();
    if (!saved) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- restoring persisted state from localStorage, not derivable during SSR render
    setPhase(saved.phase);
    setHistory(saved.history);
    setCurrentForm(saved.currentForm);
    setFallbackText(saved.fallbackText);
    setFormCount(saved.formCount);
    setPlanMarkdown(saved.planMarkdown);
    setImagePreviewUrls(previewUrlsFromHistory(saved.history));
  }, []);

  // Keep the saved session in sync once the interview has started.
  useEffect(() => {
    if (phase === "upload") return;
    saveSession({
      v: 1,
      phase,
      history,
      currentForm,
      fallbackText,
      formCount,
      planMarkdown,
    });
  }, [phase, history, currentForm, fallbackText, formCount, planMarkdown]);

  const applyResult = useCallback((result: SendResult, priorMessages: ChatMessage[]) => {
    if (result.kind === "form") {
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: [
          {
            type: "tool_use",
            id: result.form.toolUseId,
            name: "ask_form",
            input: { prompt: result.form.prompt, fields: result.form.fields },
          },
        ],
      };
      setHistory([...priorMessages, assistantMessage]);
      setCurrentForm(result.form);
      setFallbackText(null);
      setFormCount((n) => n + 1);
      setPhase("interview");
      return;
    }

    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: [{ type: "text", text: result.text }],
    };
    setHistory([...priorMessages, assistantMessage]);
    if (result.phase === "plan") {
      setPlanMarkdown(result.text);
      setCurrentForm(null);
      setPhase("plan");
    } else {
      // Defensive fallback: the model replied with prose instead of calling ask_form.
      setCurrentForm(null);
      setFallbackText(result.text);
      setPhase("interview");
    }
  }, []);

  const handleImagesReady = useCallback((blobs: Blob[], previewUrls: string[]) => {
    setSelectedImages((prev) => [...prev, ...blobs]);
    setImagePreviewUrls((prev) => [...prev, ...previewUrls]);
  }, []);

  const handleRemoveImage = useCallback((index: number) => {
    setImagePreviewUrls((prev) => {
      const url = prev[index];
      if (url) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== index);
    });
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleAnalyze = useCallback(async () => {
    const blobs = selectedImages;
    const base64s = await Promise.all(blobs.map(blobToBase64));

    const referenceBlocks: ChatMessage["content"] = await Promise.all(
      refEntries.map(async (entry): Promise<ChatMessage["content"][number]> => {
        const ext = entry.file.name.split(".").pop()?.toLowerCase() ?? "";
        if (ext === "pdf" || entry.file.type === "application/pdf") {
          return {
            type: "document",
            mediaType: "application/pdf",
            base64: await blobToBase64(entry.file),
            filename: entry.file.name,
            description: entry.description,
          };
        }
        return {
          type: "text",
          text: `Reference file "${entry.file.name}"${
            entry.description ? ` — user says: ${entry.description}` : ""
          } (uploaded alongside the photo).`,
        };
      })
    );

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
        ...referenceBlocks,
        {
          type: "text",
          text: blobs.length > 1 ? t("herePhotosOfArm") : t("herePhotoOfArm"),
        },
      ],
    };

    const formData = new FormData();
    blobs.forEach((blob, i) => formData.append("file", blob, `arm-${i}.jpg`));
    refEntries.forEach((entry) => {
      formData.append("refFile", entry.file, entry.file.name);
      formData.append("refDescription", entry.description);
    });
    formData.append("uiLanguage", language);

    try {
      const result = await agent.send("/api/classify", { method: "POST", body: formData });
      applyResult(result, [initialMessage]);
    } catch {
      // agent.error already holds the message
    }
  }, [agent, applyResult, selectedImages, refEntries, language, t]);

  const submitFormAnswer = useCallback(
    async (values: Record<string, string>) => {
      if (!currentForm) return;
      const userMessage: ChatMessage = {
        role: "user",
        content: [
          { type: "tool_result", toolUseId: currentForm.toolUseId, content: JSON.stringify(values) },
        ],
      };
      try {
        const result = await agent.send("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            history,
            uiLanguage: language,
            formAnswer: { toolUseId: currentForm.toolUseId, values },
          }),
        });
        applyResult(result, [...history, userMessage]);
      } catch {
        // agent.error already holds the message
      }
    },
    [agent, applyResult, currentForm, history, language]
  );

  const submitFallbackReply = useCallback(
    async (text: string) => {
      const userMessage: ChatMessage = { role: "user", content: [{ type: "text", text }] };
      try {
        const result = await agent.send("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ history, uiLanguage: language, message: text }),
        });
        applyResult(result, [...history, userMessage]);
      } catch {
        // agent.error already holds the message
      }
    },
    [agent, applyResult, history, language]
  );

  const handleGeneratePlanNow = useCallback(async () => {
    if (!currentForm) return;
    const userMessage: ChatMessage = {
      role: "user",
      content: [
        {
          type: "tool_result",
          toolUseId: currentForm.toolUseId,
          content: "USER_REQUESTED_EARLY_GENERATION",
        },
      ],
    };
    try {
      const result = await agent.send("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history,
          uiLanguage: language,
          earlyGeneration: { toolUseId: currentForm.toolUseId },
        }),
      });
      applyResult(result, [...history, userMessage]);
    } catch {
      // agent.error already holds the message
    }
  }, [agent, applyResult, currentForm, history, language]);

  const handleDownloadCode = useCallback(async () => {
    setIsGeneratingCode(true);
    setGenerateError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history, uiLanguage: language }),
      });
      if (!res.ok) {
        if (res.status === 504) throw new Error(t("generateTimeout"));
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match?.[1] ?? "robot-arm-project.zip";

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsGeneratingCode(false);
    }
  }, [history, language, t]);

  const handleRequestRevision = useCallback(async () => {
    const text = revisionText.trim();
    if (!text) return;
    setRevisionText("");
    await submitFallbackReply(text);
  }, [revisionText, submitFallbackReply]);

  const handleStartOver = useCallback(() => {
    clearSession();
    setPhase("upload");
    setHistory([]);
    setCurrentForm(null);
    setFallbackText(null);
    setFormCount(0);
    setPlanMarkdown("");
    setSelectedImages([]);
    imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    setImagePreviewUrls([]);
    setRefEntries([]);
    agent.resetPhase();
  }, [agent, imagePreviewUrls]);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-10 sm:py-14">
      {phase === "upload" && (
        <>
          <header className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-pink-500">
              {t("onboardingStepOne")}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{t("uploadYourArm")}</h1>
            <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-black/55 dark:text-white/55">
              {t("analyzeAskPhoto")}
            </p>
          </header>
          {agent.isStreaming ? (
            <ThinkingIndicator label={t("analyzingPhoto")} />
          ) : (
            <div className="flex flex-col gap-5">
              <div className="grid items-stretch gap-5 md:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.65fr)]">
                <ImageDropzone onImagesReady={handleImagesReady} disabled={agent.isStreaming} />
                <aside className="rounded-2xl border border-black/10 bg-black/[0.02] p-6 dark:border-white/10 dark:bg-white/[0.03]">
                  <h2 className="font-semibold">{t("photoTipsTitle")}</h2>
                  <ol className="mt-4 space-y-4">
                    {[t("photoTipOne"), t("photoTipTwo"), t("photoTipThree")].map((tip, index) => (
                      <li key={tip} className="flex gap-3 text-sm leading-6 text-black/65 dark:text-white/65">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-600 text-xs font-semibold text-white">
                          {index + 1}
                        </span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ol>
                </aside>
              </div>

              {imagePreviewUrls.length > 0 && (
                <ImageThumbnails
                  urls={imagePreviewUrls}
                  onRemove={handleRemoveImage}
                  disabled={agent.isStreaming}
                />
              )}

              <ReferenceFileUpload
                entries={refEntries}
                onChange={setRefEntries}
                disabled={agent.isStreaming}
              />

              <section className="grid gap-3 rounded-2xl border border-pink-500/15 bg-pink-500/[0.04] px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <h2 className="text-sm font-semibold">{t("whatHappensNext")}</h2>
                  <p className="mt-1 text-sm leading-6 text-black/60 dark:text-white/60">{t("whatHappensNextDesc")}</p>
                </div>
                <p className="text-xs text-black/45 dark:text-white/45">🔒 {t("privacyNote")}</p>
              </section>

              {selectedImages.length > 0 && (
                <button
                  onClick={() => void handleAnalyze()}
                  className="self-center rounded-full bg-pink-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-pink-500"
                >
                  {t("analyze")}
                </button>
              )}
            </div>
          )}
          {agent.error && <ErrorBanner message={agent.error} />}
        </>
      )}

      {phase === "interview" && (
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5">
          <header className="border-b border-black/10 pb-4 dark:border-white/10">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-pink-500">{t("interviewStep")}</p>
            <p className="mt-1 text-sm text-black/50 dark:text-white/50">{t("interviewHint")}</p>
          </header>
          {imagePreviewUrls.length > 0 && <ImageThumbnails urls={imagePreviewUrls} />}

          {agent.error && <ErrorBanner message={agent.error} />}

          {agent.isStreaming && agent.phase === "plan" && (
            <PlanView markdown={agent.text} isStreaming onStartOver={handleStartOver} />
          )}

          {agent.isStreaming && agent.phase === "interview" && <ThinkingIndicator />}

          {!agent.isStreaming && currentForm && (
            <FormView
              key={currentForm.toolUseId}
              prompt={currentForm.prompt}
              fields={currentForm.fields}
              onSubmit={submitFormAnswer}
              disabled={agent.isStreaming}
            />
          )}

          {!agent.isStreaming && !currentForm && fallbackText && (
            <FormView
              prompt={fallbackText}
              fields={[{ id: "reply", label: t("replyLabel"), type: "textarea" }]}
              onSubmit={(values) => void submitFallbackReply(values.reply ?? "")}
              disabled={agent.isStreaming}
            />
          )}

          {!agent.isStreaming && (
            <div className="flex flex-wrap items-center justify-center gap-4">
              {formCount >= 2 && currentForm && (
                <button
                  onClick={() => void handleGeneratePlanNow()}
                  className="rounded-full bg-pink-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-pink-500"
                >
                  {t("generatePlanNow")}
                </button>
              )}
              <button
                onClick={handleStartOver}
                className="rounded-full border border-pink-500/40 px-4 py-2 text-xs font-medium text-pink-400 transition-colors hover:border-pink-500 hover:text-pink-300"
              >
                {t("startOverWithNewArm")}
              </button>
            </div>
          )}
        </div>
      )}

      {phase === "plan" && (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-pink-500">{t("planStep")}</p>
          {agent.error && <ErrorBanner message={agent.error} />}
          {generateError && <ErrorBanner message={generateError} />}
          <PlanView
            markdown={agent.isStreaming ? agent.text : planMarkdown}
            isStreaming={agent.isStreaming}
            onStartOver={handleStartOver}
            actions={
              <button
                onClick={() => void handleDownloadCode()}
                disabled={isGeneratingCode}
                className="rounded-full bg-pink-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-pink-500 disabled:opacity-40"
              >
                {isGeneratingCode ? t("generatingCode") : t("downloadCode")}
              </button>
            }
          />
          {!agent.isStreaming && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleRequestRevision();
              }}
              className="flex flex-col gap-2 rounded-2xl border border-white/10 p-4"
            >
              <label className="text-sm font-medium">{t("requestChanges")}</label>
              <textarea
                value={revisionText}
                onChange={(e) => setRevisionText(e.target.value)}
                placeholder={t("requestChangesPlaceholder")}
                rows={3}
                disabled={isGeneratingCode}
                className="w-full resize-none rounded-xl border border-black/15 bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-pink-500 disabled:opacity-50 dark:border-white/15"
              />
              <button
                type="submit"
                disabled={isGeneratingCode || revisionText.trim() === ""}
                className="self-start rounded-full bg-pink-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-pink-500 disabled:opacity-40"
              >
                {t("revisePlan")}
              </button>
            </form>
          )}
        </div>
      )}
    </main>
  );
}
