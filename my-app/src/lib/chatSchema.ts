import { z } from "zod";

export const ChatContentBlockSchema = z.union([
  z.object({ type: z.literal("text"), text: z.string() }),
  z.object({
    type: z.literal("image"),
    mediaType: z.enum(["image/jpeg", "image/png", "image/webp"]),
    base64: z.string(),
  }),
  z.object({
    type: z.literal("document"),
    mediaType: z.literal("application/pdf"),
    base64: z.string(),
    filename: z.string().optional(),
    description: z.string().optional(),
  }),
  z.object({ type: z.literal("tool_use"), id: z.string(), name: z.string(), input: z.unknown() }),
  z.object({ type: z.literal("tool_result"), toolUseId: z.string(), content: z.string() }),
]);

export const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.array(ChatContentBlockSchema),
});
