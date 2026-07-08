import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient, toAnthropicMessages } from "@/lib/anthropic";
import { getSystemPrompt } from "@/lib/systemPrompt";
import { streamToSSEResponse } from "@/lib/sse";
import { processImage, UnsupportedImageError, ImageProcessingUnavailableError } from "@/lib/image";
import { ASK_FORM_TOOL } from "@/lib/tools";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_BYTES,
  MAX_IMAGE_FILES,
  MAX_TOKENS,
  MODEL_ID,
} from "@/lib/constants";
import type { ChatContentBlock, ChatMessage } from "@/types/chat";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  const files = formData.getAll("file").filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ error: "Missing 'file' field" }, { status: 400 });
  }
  if (files.length > MAX_IMAGE_FILES) {
    return NextResponse.json(
      { error: `Too many files — upload at most ${MAX_IMAGE_FILES}.` },
      { status: 400 }
    );
  }
  for (const file of files) {
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type || "unknown"}` },
        { status: 400 }
      );
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "File too large" }, { status: 400 });
    }
  }

  const imageBlocks: ChatContentBlock[] = [];
  try {
    for (const file of files) {
      const rawBuffer = Buffer.from(await file.arrayBuffer());
      const image = await processImage(rawBuffer);
      imageBlocks.push({ type: "image", mediaType: image.mediaType, base64: image.base64 });
    }
  } catch (err) {
    if (err instanceof UnsupportedImageError) {
      return NextResponse.json(
        { error: "Could not read one of these images. Try a JPEG, PNG, or WebP file." },
        { status: 400 }
      );
    }
    if (err instanceof ImageProcessingUnavailableError) {
      return NextResponse.json(
        { error: `Image processing is unavailable on the server: ${err.message}` },
        { status: 500 }
      );
    }
    throw err;
  }

  const initialMessage: ChatMessage = {
    role: "user",
    content: [
      ...imageBlocks,
      {
        type: "text",
        text:
          imageBlocks.length > 1
            ? "Here are photos of my robotic arm. Please analyze them and help me figure out how to control it."
            : "Here is a photo of my robotic arm. Please analyze it and help me figure out how to control it.",
      },
    ],
  };

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
    messages: toAnthropicMessages([initialMessage]),
  });

  return streamToSSEResponse(stream, { detectSentinel: true });
}
