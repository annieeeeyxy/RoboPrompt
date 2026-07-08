import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient, toAnthropicMessages } from "@/lib/anthropic";
import { getSystemPrompt } from "@/lib/systemPrompt";
import { streamToSSEResponse } from "@/lib/sse";
import { processImage, UnsupportedImageError } from "@/lib/image";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_BYTES,
  MAX_TOKENS,
  MODEL_ID,
} from "@/lib/constants";
import type { ChatMessage } from "@/types/chat";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing 'file' field" }, { status: 400 });
  }
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
    return NextResponse.json(
      { error: `Unsupported file type: ${file.type || "unknown"}` },
      { status: 400 }
    );
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "File too large" }, { status: 400 });
  }

  const rawBuffer = Buffer.from(await file.arrayBuffer());

  let image: { base64: string; mediaType: "image/jpeg" };
  try {
    image = await processImage(rawBuffer);
  } catch (err) {
    if (err instanceof UnsupportedImageError) {
      return NextResponse.json(
        { error: "Could not read this image. Try a JPEG, PNG, or WebP file." },
        { status: 400 }
      );
    }
    throw err;
  }

  const initialMessage: ChatMessage = {
    role: "user",
    content: [
      { type: "image", mediaType: image.mediaType, base64: image.base64 },
      {
        type: "text",
        text: "Here is a photo of my robotic arm. Please analyze it and help me figure out how to control it.",
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
    messages: toAnthropicMessages([initialMessage]),
  });

  return streamToSSEResponse(stream, { detectSentinel: true });
}
