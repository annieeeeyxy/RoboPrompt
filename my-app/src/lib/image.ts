import sharp from "sharp";

export class UnsupportedImageError extends Error {}

/**
 * Auto-orients, strips EXIF/GPS metadata, and resizes to a safe upper bound
 * for vision input. Re-encodes everything to JPEG regardless of input format
 * so the rest of the app only has to deal with one media type.
 */
export async function processImage(
  buffer: Buffer
): Promise<{ base64: string; mediaType: "image/jpeg" }> {
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
