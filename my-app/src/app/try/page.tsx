"use client";

import { useCallback, useState } from "react";
import { ImageDropzone } from "@/components/upload/ImageDropzone";
import { FormView } from "@/components/form/FormView";
import { PlanView } from "@/components/plan/PlanView";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { Spinner } from "@/components/ui/Spinner";
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

  const handleImagesReady = useCallback(
    async (blobs: Blob[]) => {
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
            text:
              blobs.length > 1
                ? "Here are photos of my robotic arm. Please analyze them and help me figure out how to control it."
                : "Here is a photo of my robotic arm. Please analyze it and help me figure out how to control it.",
          },
        ],
      };

      const formData = new FormData();
      blobs.forEach((blob, i) => formData.append("file", blob, `arm-${i}.jpg`));

      try {
        const result = await agent.send("/api/classify", { method: "POST", body: formData });
        applyResult(result, [initialMessage]);
      } catch {
        // agent.error already holds the message
      }
    },
    [agent, applyResult]
  );

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
          <ImageDropzone onImagesReady={handleImagesReady} disabled={agent.isStreaming} />
          {agent.error && <ErrorBanner message={agent.error} />}
        </>
      )}

      {phase === "interview" && (
        <div className="flex flex-1 flex-col gap-5">
          {agent.error && <ErrorBanner message={agent.error} />}

          {agent.isStreaming && !currentForm && (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          )}

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

          {formCount >= 2 && currentForm && (
            <button
              onClick={() => void handleGeneratePlanNow()}
              disabled={agent.isStreaming}
              className="self-center rounded-full border border-black/15 px-4 py-2 text-xs font-medium text-black/60 hover:border-black/30 hover:text-black disabled:opacity-40 dark:border-white/15 dark:text-white/60 dark:hover:border-white/30 dark:hover:text-white"
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
