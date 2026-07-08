import type { Sharp } from "sharp";

export class UnsupportedImageError extends Error {}
export class ImageProcessingUnavailableError extends Error {}

type SharpFactory = (input: Buffer) => Sharp;

let sharpFn: SharpFactory | null = null;

async function loadSharp(): Promise<SharpFactory> {
  if (!sharpFn) {
    try {
      const mod: unknown = await import("sharp");
      sharpFn = (mod as { default: SharpFactory }).default;
    } catch (err) {
      throw new ImageProcessingUnavailableError(
        err instanceof Error ? err.message : "Image processing is unavailable"
      );
    }
  }
  return sharpFn;
}

/**
 * Auto-orients, strips EXIF/GPS metadata, and resizes to a safe upper bound
 * for vision input. Re-encodes everything to JPEG regardless of input format
 * so the rest of the app only has to deal with one media type.
 *
 * Loads `sharp` dynamically so a native-binary load failure (e.g. a platform
 * mismatch on the deploy target) surfaces as a normal caught error instead of
 * crashing the route module at import time.
 */
export async function processImage(
  buffer: Buffer
): Promise<{ base64: string; mediaType: "image/jpeg" }> {
  const sharp = await loadSharp();
  let processed: Buffer;
  try {
    processed = await sharp(buffer)
      .rotate()
      .resize({ width: 1568, height: 1568, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();
  } catch (err) {
    throw new UnsupportedImageError(
      err instanceof Error ? err.message : "Could not process image"
    );
  }
  return { base64: processed.toString("base64"), mediaType: "image/jpeg" };
}
