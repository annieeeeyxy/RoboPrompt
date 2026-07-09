"use client";

import { useCallback, useState } from "react";
import { ImageDropzone } from "@/components/upload/ImageDropzone";
import { ReferenceFileUpload, type ReferenceFileEntry } from "@/components/upload/ReferenceFileUpload";
import { FormView } from "@/components/form/FormView";
import { PlanView } from "@/components/plan/PlanView";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { ThinkingIndicator } from "@/components/ui/ThinkingIndicator";
import { useAgentStream, type FormRequest, type SendResult } from "@/hooks/useAgentStream";
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
  const [phase, setPhase] = useState<Phase>("upload");
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [currentForm, setCurrentForm] = useState<FormRequest | null>(null);
  const [fallbackText, setFallbackText] = useState<string | null>(null);
  const [formCount, setFormCount] = useState(0);
  const [planMarkdown, setPlanMarkdown] = useState("");
  const [selectedImages, setSelectedImages] = useState<Blob[]>([]);
  const [refEntries, setRefEntries] = useState<ReferenceFileEntry[]>([]);
  const agent = useAgentStream();

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

  const handleImagesReady = useCallback((blobs: Blob[]) => {
    setSelectedImages((prev) => [...prev, ...blobs]);
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
        // Full extraction (zip contents, text files) happens server-side for
        // the actual analysis call — this is just a lightweight mirror so
        // later turns' history still show the file was provided.
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
          text:
            blobs.length > 1
              ? "Here are photos of my robotic arm. Please analyze them and help me figure out how to control it."
              : "Here is a photo of my robotic arm. Please analyze it and help me figure out how to control it.",
        },
      ],
    };

    const formData = new FormData();
    blobs.forEach((blob, i) => formData.append("file", blob, `arm-${i}.jpg`));
    refEntries.forEach((entry) => {
      formData.append("refFile", entry.file, entry.file.name);
      formData.append("refDescription", entry.description);
    });

    try {
      const result = await agent.send("/api/classify", { method: "POST", body: formData });
      applyResult(result, [initialMessage]);
    } catch {
      // agent.error already holds the message
    }
  }, [agent, applyResult, selectedImages, refEntries]);

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
            formAnswer: { toolUseId: currentForm.toolUseId, values },
          }),
        });
        applyResult(result, [...history, userMessage]);
      } catch {
        // agent.error already holds the message
      }
    },
    [agent, applyResult, currentForm, history]
  );

  const submitFallbackReply = useCallback(
    async (text: string) => {
      const userMessage: ChatMessage = { role: "user", content: [{ type: "text", text }] };
      try {
        const result = await agent.send("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ history, message: text }),
        });
        applyResult(result, [...history, userMessage]);
      } catch {
        // agent.error already holds the message
      }
    },
    [agent, applyResult, history]
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
        body: JSON.stringify({ history, earlyGeneration: { toolUseId: currentForm.toolUseId } }),
      });
      applyResult(result, [...history, userMessage]);
    } catch {
      // agent.error already holds the message
    }
  }, [agent, applyResult, currentForm, history]);

  const handleStartOver = useCallback(() => {
    setPhase("upload");
    setHistory([]);
    setCurrentForm(null);
    setFallbackText(null);
    setFormCount(0);
    setPlanMarkdown("");
    setSelectedImages([]);
    setRefEntries([]);
    agent.resetPhase();
  }, [agent]);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-10">
      {phase === "upload" && (
        <>
          <header className="text-center">
            <h1 className="text-2xl font-semibold">Upload your robot arm</h1>
            <p className="mt-1 text-sm text-black/50 dark:text-white/50">
              We&apos;ll analyze it and ask what we can&apos;t tell from the photo.
            </p>
          </header>
          {agent.isStreaming ? (
            <ThinkingIndicator label="Analyzing your photo…" />
          ) : (
            <>
              <ImageDropzone onImagesReady={handleImagesReady} disabled={agent.isStreaming} />

              {selectedImages.length > 0 && (
                <p className="text-center text-sm text-black/50 dark:text-white/50">
                  {selectedImages.length} photo{selectedImages.length > 1 ? "s" : ""} ready.
                </p>
              )}

              <ReferenceFileUpload
                entries={refEntries}
                onChange={setRefEntries}
                disabled={agent.isStreaming}
              />

              {selectedImages.length > 0 && (
                <button
                  onClick={() => void handleAnalyze()}
                  className="self-center rounded-full bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500"
                >
                  Analyze
                </button>
              )}
            </>
          )}
          {agent.error && <ErrorBanner message={agent.error} />}
        </>
      )}

      {phase === "interview" && (
        <div className="flex flex-1 flex-col gap-5">
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
              fields={[{ id: "reply", label: "Your reply", type: "textarea" }]}
              onSubmit={(values) => void submitFallbackReply(values.reply ?? "")}
              disabled={agent.isStreaming}
            />
          )}

          {!agent.isStreaming && formCount >= 2 && currentForm && (
            <button
              onClick={() => void handleGeneratePlanNow()}
              className="self-center rounded-full border border-black/15 px-4 py-2 text-xs font-medium text-black/60 hover:border-black/30 hover:text-black dark:border-white/15 dark:text-white/60 dark:hover:border-white/30 dark:hover:text-white"
            >
              Generate my plan now
            </button>
          )}
        </div>
      )}

      {phase === "plan" && (
        <>
          {agent.error && <ErrorBanner message={agent.error} />}
          <PlanView
            markdown={agent.isStreaming ? agent.text : planMarkdown}
            isStreaming={agent.isStreaming}
            onStartOver={handleStartOver}
          />
        </>
      )}
    </main>
  );
}
