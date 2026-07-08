import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAnthropicClient, toAnthropicMessages } from "@/lib/anthropic";
import { getSystemPrompt } from "@/lib/systemPrompt";
import { streamToSSEResponse } from "@/lib/sse";
import { MAX_TOKENS, MODEL_ID } from "@/lib/constants";
import type { ChatMessage } from "@/types/chat";

export const runtime = "nodejs";
export const maxDuration = 120;

const ChatContentBlockSchema = z.union([
  z.object({ type: z.literal("text"), text: z.string() }),
  z.object({
    type: z.literal("image"),
    mediaType: z.enum(["image/jpeg", "image/png", "image/webp"]),
    base64: z.string(),
  }),
]);

const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.array(ChatContentBlockSchema),
});

const RequestSchema = z.object({
  history: z.array(ChatMessageSchema),
  message: z.string().min(1),
});

export async function POST(req: NextRequest) {
  let body: z.infer<typeof RequestSchema>;
  try {
    body = RequestSchema.parse(await req.json());
  } catch (err) {
    const message =
      err instanceof z.ZodError
        ? err.issues.map((issue) => issue.message).join("; ")
        : "Invalid request body";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const messages: ChatMessage[] = [
    ...body.history,
    { role: "user", content: [{ type: "text", text: body.message }] },
  ];

  let client: ReturnType<typeof getAnthropicClient>;
  let systemPrompt: string;
  try {
    client = getAnthropicClient();
    systemPrompt = getSystemPrompt();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server misconfigured" },
      { status: 500 }
    );
  }

  const stream = client.messages.stream({
    model: MODEL_ID,
    max_tokens: MAX_TOKENS,
    system: systemPrompt,
    messages: toAnthropicMessages(messages),
  });

  return streamToSSEResponse(stream, { detectSentinel: true });
}
