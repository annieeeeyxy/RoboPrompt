import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type Anthropic from "@anthropic-ai/sdk";
import { getAnthropicClient } from "@/lib/anthropic";
import { enforceRateLimit } from "@/lib/rateLimit";
import { INTERVIEW_MODEL_ID } from "@/lib/constants";

export const runtime = "nodejs";
export const maxDuration = 30;

const PARSE_RATE_LIMIT = { windowMs: 60 * 1000, maxRequests: 30 } as const;

const RequestSchema = z.object({ command: z.string().min(1).max(500) });

const PARSE_TOOL: Anthropic.Tool = {
  name: "parse_command",
  description: "Turn the operator's natural-language robot command into a structured task.",
  input_schema: {
    type: "object",
    properties: {
      action: {
        type: "string",
        enum: ["pick_and_place", "pick", "unsupported"],
        description:
          "'pick_and_place' when both an object and a destination are stated; 'pick' when only an object is stated; 'unsupported' for anything that is not a pick/move/place task.",
      },
      object: {
        type: "string",
        description: "The object to pick up, as a short lowercase noun phrase. Omit if none stated.",
      },
      destination: {
        type: "string",
        description: "Where to place it, short lowercase noun phrase. Omit if none stated.",
      },
      clarification: {
        type: "string",
        description:
          "The single follow-up question to ask when information is missing or the request is unsupported. Omit when the task is complete.",
      },
    },
    required: ["action"],
  },
};

const SYSTEM = `You parse operator commands for a pick-and-place robot console. Extract only what the operator actually said — never invent an object or destination they did not mention. If the destination is missing, set action to "pick" and write a clarification question like "Where should I place the apple?". If the request is not a pick/move/place task, use "unsupported" and explain what you can do in the clarification.`;

export async function POST(req: NextRequest) {
  const limit = enforceRateLimit(req, "api:agent-parse", PARSE_RATE_LIMIT);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  let body: z.infer<typeof RequestSchema>;
  try {
    body = RequestSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const client = getAnthropicClient();
    const response = await client.messages.create({
      model: INTERVIEW_MODEL_ID,
      max_tokens: 512,
      system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
      tools: [PARSE_TOOL],
      tool_choice: { type: "tool", name: PARSE_TOOL.name },
      messages: [{ role: "user", content: [{ type: "text", text: body.command }] }],
    });

    const toolUse = response.content.find(
      (b): b is Extract<typeof b, { type: "tool_use" }> => b.type === "tool_use"
    );
    const input = (toolUse?.input ?? {}) as {
      action?: string;
      object?: string;
      destination?: string;
      clarification?: string;
    };
    const action = ["pick_and_place", "pick", "unsupported"].includes(input.action ?? "")
      ? (input.action as "pick_and_place" | "pick" | "unsupported")
      : "unsupported";
    return NextResponse.json({
      action,
      object: typeof input.object === "string" && input.object.trim() ? input.object.trim() : null,
      destination:
        typeof input.destination === "string" && input.destination.trim()
          ? input.destination.trim()
          : null,
      clarification:
        typeof input.clarification === "string" && input.clarification.trim()
          ? input.clarification.trim()
          : null,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Command parsing failed" },
      { status: 502 }
    );
  }
}
