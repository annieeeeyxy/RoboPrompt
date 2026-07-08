"use client";

import { useCallback, useState } from "react";
import type { FormField, SSEEvent } from "@/types/chat";

export type FormRequest = { toolUseId: string; prompt: string; fields: FormField[] };

export type SendResult =
  | { kind: "text"; text: string; phase: "interview" | "plan" }
  | { kind: "form"; form: FormRequest };

export function useAgentStream() {
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"interview" | "plan">("interview");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(
    async (input: RequestInfo, init?: RequestInit): Promise<SendResult> => {
      setIsStreaming(true);
      setError(null);
      setText("");
      let finalText = "";
      let resolvedPhase: "interview" | "plan" = "interview";
      let form: FormRequest | null = null;
      try {
        const res = await fetch(input, init);
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error ?? `Request failed (${res.status})`);
        }
        if (!res.body) throw new Error("No response body");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const frames = buffer.split("\n\n");
          buffer = frames.pop() ?? "";

          for (const frame of frames) {
            const line = frame.trim();
            if (!line.startsWith("data:")) continue;
            const event: SSEEvent = JSON.parse(line.slice("data:".length).trim());

            if (event.type === "delta") {
              setText((prev) => prev + event.text);
            } else if (event.type === "phase") {
              resolvedPhase = event.phase;
              setPhase(event.phase);
            } else if (event.type === "form") {
              form = { toolUseId: event.toolUseId, prompt: event.prompt, fields: event.fields };
            } else if (event.type === "done") {
              finalText = event.text;
            } else if (event.type === "error") {
              throw new Error(event.message);
            }
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Something went wrong";
        setError(message);
        throw err;
      } finally {
        setIsStreaming(false);
      }
      return form
        ? { kind: "form", form }
        : { kind: "text", text: finalText, phase: resolvedPhase };
    },
    []
  );

  const resetPhase = useCallback(() => setPhase("interview"), []);

  return { text, phase, isStreaming, error, send, resetPhase };
}
