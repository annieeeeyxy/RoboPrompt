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
}
