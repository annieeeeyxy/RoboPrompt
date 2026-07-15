import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { buildSystemBlocks, getAnthropicClient, toAnthropicMessages } from "@/lib/anthropic";
import { getSystemPrompt } from "@/lib/systemPrompt";
import { ChatMessageSchema } from "@/lib/chatSchema";
import { enforceRateLimit } from "@/lib/rateLimit";
import { UI_LANGUAGES } from "@/lib/languagePolicy";
import { GENERATE_FILES_TOOL } from "@/lib/tools";
import { buildZip, normalizeGeneratedFiles } from "@/lib/zip";
import { loadTemplateFiles, mergeTemplateFiles, resolveTemplateId } from "@/lib/codegen/templates";
import { GENERATE_FILES_TOOL_NAME, GENERATE_MAX_TOKENS, GENERATE_MODEL_ID } from "@/lib/constants";
import type { ChatMessage } from "@/types/chat";

export const runtime = "nodejs";
// Code generation streams up to GENERATE_MAX_TOKENS from the model, which
// regularly takes 2+ minutes for multi-file scaffolds — 120s caused real
// 504s in production. 300 is the Vercel Hobby-plan ceiling.
export const maxDuration = 300;

const GENERATE_RATE_LIMIT = { windowMs: 10 * 60 * 1000, maxRequests: 8 } as const;

const RequestSchema = z.object({
  history: z.array(ChatMessageSchema),
  uiLanguage: z.enum(UI_LANGUAGES).default("en"),
});

const DOC_LANGUAGE_NAMES: Record<(typeof UI_LANGUAGES)[number], string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
  zh: "Chinese",
};

function sanitizeProjectName(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9-_]/g, "-").toLowerCase();
  return cleaned || "robot-arm-project";
}

export async function POST(req: NextRequest) {
  const limit = enforceRateLimit(req, "api:generate", GENERATE_RATE_LIMIT);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many code generation requests. Please try again later." },
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

  const messages: ChatMessage[] = [
    ...body.history,
    {
      role: "user",
      content: [
        {
          type: "text",
          text: "Please generate the code scaffold now for the plan we just confirmed.",
        },
      ],
    },
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

  let message;
  try {
    // Non-streaming .create() refuses requests that could run long at this
    // max_tokens budget ("Streaming is required for operations that may
    // take longer than 10 minutes") — use .stream() and just await the
    // complete result; the client still gets a single zip response, this
    // only changes how we talk to Anthropic internally.
    const docLanguage = DOC_LANGUAGE_NAMES[body.uiLanguage];
    const stream = client.messages.stream({
      model: GENERATE_MODEL_ID,
      max_tokens: GENERATE_MAX_TOKENS,
      system: buildSystemBlocks(
        systemPrompt,
        `Documentation language: write README.md, SETUP-style docs, and the "notes" field in ${docLanguage}. Keep code, code comments, file paths, and protocol strings in English.`
      ),
      tools: [GENERATE_FILES_TOOL],
      tool_choice: { type: "tool", name: GENERATE_FILES_TOOL_NAME },
      // cacheLastBlock: generation sometimes times out and gets retried —
      // the retry then reads the whole interview history from cache.
      messages: toAnthropicMessages(messages, { cacheLastBlock: true }),
    });
    message = await stream.finalMessage();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Code generation failed" },
      { status: 502 }
    );
  }

  const toolUse = message.content.find(
    (block): block is Extract<typeof block, { type: "tool_use" }> => block.type === "tool_use"
  );

  if (!toolUse || message.stop_reason === "max_tokens") {
    return NextResponse.json(
      {
        error:
          "The generated scaffold was too large and got cut off mid-response. Try again — it usually completes, or ask for a smaller subset of files first.",
      },
      { status: 502 }
    );
  }

  const input = toolUse.input as {
    projectName?: unknown;
    template?: unknown;
    files?: unknown;
    notes?: unknown;
  };
  // Tool output is model-generated and occasionally malformed (e.g. files
  // as a double-encoded JSON string) — normalize instead of trusting it.
  let files = normalizeGeneratedFiles(input.files);
  if (!files) {
    return NextResponse.json({ error: "No files were generated. Try again." }, { status: 502 });
  }

  // When the model picked a pre-built scaffold, it only generated the small
  // per-project files (configs, README) — fill in the rest from the template.
  const templateId = resolveTemplateId(input.template);
  if (templateId) {
    try {
      files = mergeTemplateFiles(loadTemplateFiles(templateId), files);
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Template assets unavailable" },
        { status: 500 }
      );
    }
  }

  const projectName = sanitizeProjectName(
    typeof input.projectName === "string" ? input.projectName : "robot-arm-project"
  );
  const notes = typeof input.notes === "string" ? input.notes : "";
  let zipBuffer: Buffer;
  try {
    zipBuffer = await buildZip(files, notes);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to package the generated files" },
      { status: 502 }
    );
  }

  return new Response(new Uint8Array(zipBuffer), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${projectName}.zip"`,
    },
  });
}
