import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAnthropicClient, toAnthropicMessages } from "@/lib/anthropic";
import { getSystemPrompt } from "@/lib/systemPrompt";
import { streamToSSEResponse } from "@/lib/sse";
import { ASK_FORM_TOOL } from "@/lib/tools";
import { EARLY_GENERATION_SIGNAL, MAX_TOKENS, MODEL_ID } from "@/lib/constants";
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

const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.array(ChatContentBlockSchema),
});

const RequestSchema = z
  .object({
    history: z.array(ChatMessageSchema),
    message: z.string().min(1).optional(),
    formAnswer: z
      .object({ toolUseId: z.string(), values: z.record(z.string(), z.string()) })
      .optional(),
    earlyGeneration: z.object({ toolUseId: z.string() }).optional(),
  })
  .refine(
    (data) => Boolean(data.message) || Boolean(data.formAnswer) || Boolean(data.earlyGeneration),
    { message: "One of 'message', 'formAnswer', or 'earlyGeneration' is required" }
  );

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

  const nextMessage: ChatMessage = body.earlyGeneration
    ? {
        role: "user",
        content: [
          {
            type: "tool_result",
            toolUseId: body.earlyGeneration.toolUseId,
            content: EARLY_GENERATION_SIGNAL,
          },
        ],
      }
    : body.formAnswer
      ? {
          role: "user",
          content: [
            {
              type: "tool_result",
              toolUseId: body.formAnswer.toolUseId,
              content: JSON.stringify(body.formAnswer.values),
            },
          ],
        }
      : { role: "user", content: [{ type: "text", text: body.message! }] };

  const messages: ChatMessage[] = [...body.history, nextMessage];

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
    tools: [ASK_FORM_TOOL],
    messages: toAnthropicMessages(messages),
  });

  return streamToSSEResponse(stream, { detectSentinel: true });
}
