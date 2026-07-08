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

export function toAnthropicMessages(
  messages: ChatMessage[]
): Anthropic.MessageParam[] {
  return messages.map((message) => ({
    role: message.role,
    content: message.content.map((block) =>
      block.type === "text"
        ? { type: "text" as const, text: block.text }
        : {
            type: "image" as const,
            source: {
              type: "base64" as const,
              media_type: block.mediaType,
              data: block.base64,
            },
          }
    ),
  }));
}
