import type Anthropic from "@anthropic-ai/sdk";
import type { SSEEvent, FormField } from "@/types/chat";
import { FINAL_PLAN_SENTINEL, ASK_FORM_TOOL_NAME } from "@/lib/constants";

type MessageStream = ReturnType<Anthropic["messages"]["stream"]>;

/**
 * Wraps an Anthropic MessageStream into a text/event-stream Response.
 *
 * If `detectSentinel` is set, buffers leading text until it can tell whether
 * the reply opens with FINAL_PLAN_SENTINEL. If it does, the sentinel is
 * stripped and a {type:'phase', phase:'plan'} event is emitted before the
 * remaining text — this is how the client knows to switch from chat view to
 * plan view mid-stream, without breaking token-level streaming.
 */
export function streamToSSEResponse(
  stream: MessageStream,
  options?: { detectSentinel?: boolean }
): Response {
  const encoder = new TextEncoder();
  const detectSentinel = options?.detectSentinel ?? false;

  const body = new ReadableStream({
    start(controller) {
      let closed = false;
      const send = (event: SSEEvent) => {
        if (closed) return;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      let buffer = "";
      let sentinelResolved = !detectSentinel;

      stream.on("text", (delta: string) => {
        if (sentinelResolved) {
          send({ type: "delta", text: delta });
          return;
        }
        buffer += delta;
        const trimmed = buffer.replace(/^\s+/, "");
        if (trimmed.length < FINAL_PLAN_SENTINEL.length) {
          return; // not enough to decide yet
        }
        sentinelResolved = true;
        if (trimmed.startsWith(FINAL_PLAN_SENTINEL)) {
          send({ type: "phase", phase: "plan" });
          const rest = trimmed.slice(FINAL_PLAN_SENTINEL.length).replace(/^\s+/, "");
          if (rest) send({ type: "delta", text: rest });
        } else {
          send({ type: "delta", text: buffer });
        }
        buffer = "";
      });

      stream.on("contentBlock", (content: Anthropic.ContentBlock) => {
        if (content.type === "tool_use" && content.name === ASK_FORM_TOOL_NAME) {
          const input = content.input as { prompt?: string; fields?: FormField[] };
          send({
            type: "form",
            toolUseId: content.id,
            prompt: input.prompt ?? "",
            fields: input.fields ?? [],
          });
        }
      });

      stream.on("error", (err: Error) => {
        send({ type: "error", message: err instanceof Error ? err.message : "stream failed" });
        closed = true;
        controller.close();
      });

      stream.on("end", () => {
        if (closed) return;
        (async () => {
          try {
            // finalText() throws when the reply has no text block at all (a
            // tool-only turn, i.e. every ask_form call) — read the message
            // directly and default to "" instead.
            const message = await stream.finalMessage();
            const content = message.content as Anthropic.ContentBlock[];
            const finalText = content
              .filter((block): block is Anthropic.TextBlock => block.type === "text")
              .map((block) => block.text)
              .join("");
            send({ type: "done", text: finalText.replace(FINAL_PLAN_SENTINEL, "").trim() });
          } catch (err) {
            send({ type: "error", message: err instanceof Error ? err.message : "stream failed" });
          } finally {
            closed = true;
            controller.close();
          }
        })();
      });
    },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
