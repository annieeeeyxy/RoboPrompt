import Anthropic from "@anthropic-ai/sdk";
import { getEnv } from "@/lib/env";
import type { ChatMessage } from "@/types/chat";

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: getEnv().ANTHROPIC_API_KEY });
  }
  return client;
}

// The system prompt is identical for every user, so caching it (plus the tool
// schema that renders before it) lets requests share a prefix cache across the
// whole site. The volatile instruction (language policy, doc language) must
// stay in a separate block AFTER the breakpoint — anything before it that
// changes per request would invalidate the cache.
export function buildSystemBlocks(
  stablePrompt: string,
  volatileInstruction: string
): Anthropic.TextBlockParam[] {
  return [
    { type: "text", text: stablePrompt, cache_control: { type: "ephemeral" } },
    { type: "text", text: volatileInstruction },
  ];
}

export function toAnthropicMessages(
  messages: ChatMessage[],
  options?: { cacheLastBlock?: boolean }
): Anthropic.MessageParam[] {
  const converted = messages.map((message) => ({
    role: message.role,
    content: message.content.map((block): Anthropic.ContentBlockParam => {
      switch (block.type) {
        case "text":
          return { type: "text", text: block.text };
        case "image":
          return {
            type: "image",
            source: { type: "base64", media_type: block.mediaType, data: block.base64 },
          };
        case "document":
          return {
            type: "document",
            source: { type: "base64", media_type: block.mediaType, data: block.base64 },
            title: block.filename,
            context: block.description,
          };
        case "tool_use":
          return { type: "tool_use", id: block.id, name: block.name, input: block.input };
        case "tool_result":
          return { type: "tool_result", tool_use_id: block.toolUseId, content: block.content };
      }
    }),
  }));

  // Mark the newest content block so the next turn can reuse the whole
  // conversation prefix from cache instead of re-processing it.
  if (options?.cacheLastBlock) {
    const lastBlocks = converted[converted.length - 1]?.content;
    if (Array.isArray(lastBlocks) && lastBlocks.length > 0) {
      const last = lastBlocks[lastBlocks.length - 1];
      if (last.type !== "thinking" && last.type !== "redacted_thinking") {
        last.cache_control = { type: "ephemeral" };
      }
    }
  }

  return converted;
}
