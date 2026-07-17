import { NextRequest, NextResponse } from "next/server";
import type Anthropic from "@anthropic-ai/sdk";
import { getAnthropicClient } from "@/lib/anthropic";
import { processImage, UnsupportedImageError, ImageProcessingUnavailableError } from "@/lib/image";
import { enforceRateLimit } from "@/lib/rateLimit";
import { INTERVIEW_MODEL_ID, ALLOWED_IMAGE_MIME_TYPES, MAX_IMAGE_BYTES } from "@/lib/constants";

export const runtime = "nodejs";
export const maxDuration = 60;

const DETECT_RATE_LIMIT = { windowMs: 60 * 1000, maxRequests: 20 } as const;

const DETECT_TOOL: Anthropic.Tool = {
  name: "report_detections",
  description:
    "Report every distinct physical object clearly visible on the work surface in the image.",
  input_schema: {
    type: "object",
    properties: {
      objects: {
        type: "array",
        items: {
          type: "object",
          properties: {
            label: {
              type: "string",
              description: "Short lowercase noun phrase, e.g. 'apple', 'blue box', 'red block'.",
            },
            confidence: {
              type: "number",
              description: "0..1 — how certain you are the object is what you labeled it.",
            },
            box: {
              type: "object",
              description:
                "Approximate bounding box in NORMALIZED coordinates (0..1 of image width/height).",
              properties: {
                x: { type: "number" },
                y: { type: "number" },
                w: { type: "number" },
                h: { type: "number" },
              },
              required: ["x", "y", "w", "h"],
            },
          },
          required: ["label", "confidence", "box"],
        },
      },
    },
    required: ["objects"],
  },
};

const SYSTEM = `You are the vision module of a robot pick-and-place console. Report objects that are clearly visible on the work surface — graspable items and containers/target areas (boxes, trays, bowls).

Rules:
- Only report what you can actually see. Never invent an object because the operator might want it.
- Use honest confidence values; below 0.5 means you are genuinely unsure.
- Boxes are approximate, in normalized 0..1 image coordinates, origin top-left.
- Label duplicates with the same base label (the app numbers them).
- Ignore the robot arm itself, cables, and the background.`;

export async function POST(req: NextRequest) {
  const limit = enforceRateLimit(req, "api:agent-detect", DETECT_RATE_LIMIT);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many detection requests. Please wait." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }
  const file = formData.get("frame");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing 'frame' image" }, { status: 400 });
  }
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
    return NextResponse.json({ error: `Unsupported image type: ${file.type || "unknown"}` }, { status: 400 });
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "Image too large" }, { status: 400 });
  }

  let image;
  try {
    image = await processImage(Buffer.from(await file.arrayBuffer()));
  } catch (err) {
    if (err instanceof UnsupportedImageError) {
      return NextResponse.json({ error: "Could not read the image." }, { status: 400 });
    }
    if (err instanceof ImageProcessingUnavailableError) {
      return NextResponse.json({ error: `Image processing unavailable: ${err.message}` }, { status: 500 });
    }
    throw err;
  }

  try {
    const client = getAnthropicClient();
    const response = await client.messages.create({
      model: INTERVIEW_MODEL_ID,
      max_tokens: 2048,
      system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
      tools: [DETECT_TOOL],
      tool_choice: { type: "tool", name: DETECT_TOOL.name },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: image.mediaType, data: image.base64 },
            },
            { type: "text", text: "Detect the objects on the work surface." },
          ],
        },
      ],
    });

    const toolUse = response.content.find(
      (b): b is Extract<typeof b, { type: "tool_use" }> => b.type === "tool_use"
    );
    const objects = (toolUse?.input as { objects?: unknown })?.objects;
    if (!Array.isArray(objects)) {
      return NextResponse.json({ objects: [] });
    }
    const cleaned = objects
      .filter(
        (o): o is { label: string; confidence: number; box: { x: number; y: number; w: number; h: number } } =>
          typeof o === "object" &&
          o !== null &&
          typeof (o as { label?: unknown }).label === "string" &&
          typeof (o as { confidence?: unknown }).confidence === "number"
      )
      .map((o) => ({
        label: o.label,
        confidence: Math.max(0, Math.min(1, o.confidence)),
        box:
          o.box && [o.box.x, o.box.y, o.box.w, o.box.h].every((n) => typeof n === "number")
            ? o.box
            : null,
      }));
    return NextResponse.json({ objects: cleaned });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Detection failed" },
      { status: 502 }
    );
  }
}
