import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient, toAnthropicMessages } from "@/lib/anthropic";
import { getSystemPrompt } from "@/lib/systemPrompt";
import { streamToSSEResponse } from "@/lib/sse";
import { processImage, UnsupportedImageError, ImageProcessingUnavailableError } from "@/lib/image";
import { processReferenceFile } from "@/lib/referenceFiles";
import { ASK_FORM_TOOL } from "@/lib/tools";
import {
  buildLanguagePolicyInstruction,
  UI_LANGUAGES,
  type UiLanguage,
} from "@/lib/languagePolicy";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_BYTES,
  MAX_IMAGE_FILES,
  MAX_REFERENCE_FILES,
  MAX_REFERENCE_FILE_BYTES,
  MAX_TOKENS,
  INTERVIEW_MODEL_ID,
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

  const rawUiLanguage = formData.get("uiLanguage");
  const uiLanguage =
    typeof rawUiLanguage === "string" && UI_LANGUAGES.includes(rawUiLanguage as UiLanguage)
      ? (rawUiLanguage as UiLanguage)
      : "en";

  const initialTextByLanguage: Record<UiLanguage, { one: string; many: string }> = {
    en: {
      one: "Here is a photo of my robotic arm. Please analyze it and help me figure out how to control it.",
      many: "Here are photos of my robotic arm. Please analyze them and help me figure out how to control it.",
    },
    es: {
      one: "Aqui hay una foto de mi brazo robotico. Analizala y ayudame a entender como controlarlo.",
      many: "Aqui hay fotos de mi brazo robotico. Analizalas y ayudame a entender como controlarlo.",
    },
    fr: {
      one: "Voici une photo de mon bras robotique. Analyse-la et aide-moi a comprendre comment le controler.",
      many: "Voici des photos de mon bras robotique. Analyse-les et aide-moi a comprendre comment le controler.",
    },
    zh: {
      one: "这是我机械臂的一张照片。请分析并帮助我了解如何控制它。",
      many: "这是我机械臂的多张照片。请分析并帮助我了解如何控制它。",
    },
  };

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

  const refFiles = formData.getAll("refFile").filter((f): f is File => f instanceof File);
  const refDescriptions = formData.getAll("refDescription").map((d) => String(d));
  if (refFiles.length > MAX_REFERENCE_FILES) {
    return NextResponse.json(
      { error: `Too many reference files — upload at most ${MAX_REFERENCE_FILES}.` },
      { status: 400 }
    );
  }
  for (const file of refFiles) {
    if (file.size > MAX_REFERENCE_FILE_BYTES) {
      return NextResponse.json(
        { error: `Reference file "${file.name}" is too large (max ${MAX_REFERENCE_FILE_BYTES / 1024 / 1024}MB).` },
        { status: 400 }
      );
    }
  }

  const referenceBlocks: ChatContentBlock[] = [];
  for (let i = 0; i < refFiles.length; i++) {
    referenceBlocks.push(await processReferenceFile(refFiles[i], refDescriptions[i] ?? ""));
  }

  const initialMessage: ChatMessage = {
    role: "user",
    content: [
      ...imageBlocks,
      ...referenceBlocks,
      {
        type: "text",
        text:
          imageBlocks.length > 1
            ? initialTextByLanguage[uiLanguage].many
            : initialTextByLanguage[uiLanguage].one,
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
    model: INTERVIEW_MODEL_ID,
    max_tokens: MAX_TOKENS,
    system: `${systemPrompt}\n\n${buildLanguagePolicyInstruction(uiLanguage, uiLanguage)}`,
    tools: [ASK_FORM_TOOL],
    // The first turn is always questions, never a plan — forcing the tool
    // keeps faster models from drifting into prose (the form-less chat UX).
    tool_choice: { type: "tool", name: ASK_FORM_TOOL.name },
    messages: toAnthropicMessages([initialMessage]),
  });

  return streamToSSEResponse(stream, { detectSentinel: true });
}
