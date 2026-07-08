"use client";

import { useCallback, useState } from "react";
import { ImageDropzone } from "@/components/upload/ImageDropzone";
import { ChatThread } from "@/components/chat/ChatThread";
import { ChatInput } from "@/components/chat/ChatInput";
import { GeneratePlanButton } from "@/components/chat/GeneratePlanButton";
import { PlanView } from "@/components/plan/PlanView";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { useAgentStream } from "@/hooks/useAgentStream";
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
          text:
            blobs.length > 1
              ? `Uploaded ${blobs.length} photos of my robot arm.`
              : "Uploaded a photo of my robot arm.",
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
    [agent]
  );

  const sendChatMessage = useCallback(
    async (text: string) => {
      setDisplayMessages((prev) => [...prev, { role: "user", text }]);
      try {
        const result = await agent.send("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ history, message: text }),
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
    [agent, history]
  );

  const handleGeneratePlanNow = useCallback(() => {
    void sendChatMessage(
      "Please generate the final architecture, build, and test plan now based on everything you know so far."
    );
  }, [sendChatMessage]);

  const handleStartOver = useCallback(() => {
    setPhase("upload");
    setHistory([]);
    setDisplayMessages([]);
    setPlanMarkdown("");
    agent.resetPhase();
  }, [agent]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
      {phase === "upload" && (
        <>
          <header className="text-center">
            <h1 className="text-2xl font-semibold">Upload your robot arm</h1>
            <p className="mt-1 text-sm text-black/50 dark:text-white/50">
              We&apos;ll analyze it and ask what we can&apos;t tell from the photo.
            </p>
          </header>
          <ImageDropzone onImagesReady={handleImagesReady} disabled={agent.isStreaming} />
        </>
      )}

      {phase === "interview" && (
        <div className="flex flex-1 flex-col gap-4">
          <ChatThread
            messages={displayMessages}
            streamingText={agent.text}
            isStreaming={agent.isStreaming}
          />
          {agent.error && <ErrorBanner message={agent.error} />}
          <ChatInput onSend={sendChatMessage} disabled={agent.isStreaming} />
          {assistantTurnCount >= 3 && (
            <GeneratePlanButton onClick={handleGeneratePlanNow} disabled={agent.isStreaming} />
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
