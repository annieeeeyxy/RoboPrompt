import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAnthropicClient, toAnthropicMessages } from "@/lib/anthropic";
import { getSystemPrompt } from "@/lib/systemPrompt";
import { streamToSSEResponse } from "@/lib/sse";
import { ASK_FORM_TOOL } from "@/lib/tools";
import { enforceRateLimit } from "@/lib/rateLimit";
import { ChatMessageSchema } from "@/lib/chatSchema";
import {
  buildLanguagePolicyInstruction,
  resolveResponseLanguage,
  UI_LANGUAGES,
  type UiLanguage,
} from "@/lib/languagePolicy";
import { EARLY_GENERATION_SIGNAL, INTERVIEW_MODEL_ID, MAX_TOKENS } from "@/lib/constants";
import type { ChatMessage } from "@/types/chat";

export const runtime = "nodejs";
export const maxDuration = 120;

const CHAT_RATE_LIMIT = { windowMs: 60 * 1000, maxRequests: 40 } as const;

const RequestSchema = z
  .object({
    history: z.array(ChatMessageSchema),
    uiLanguage: z.enum(UI_LANGUAGES).default("en"),
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
  const limit = enforceRateLimit(req, "api:chat", CHAT_RATE_LIMIT);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please wait and try again." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      }
    );
  }

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

  const latestUserText = body.message ?? Object.values(body.formAnswer?.values ?? {}).join(" ");
  const responseLanguage = resolveResponseLanguage(
    body.uiLanguage as UiLanguage,
    latestUserText
  );

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
    model: INTERVIEW_MODEL_ID,
    max_tokens: MAX_TOKENS,
    system: `${systemPrompt}\n\n${buildLanguagePolicyInstruction(
      body.uiLanguage as UiLanguage,
      responseLanguage,
      latestUserText
    )}`,
    tools: [ASK_FORM_TOOL],
    messages: toAnthropicMessages(messages),
  });

  return streamToSSEResponse(stream, { detectSentinel: true });
}
