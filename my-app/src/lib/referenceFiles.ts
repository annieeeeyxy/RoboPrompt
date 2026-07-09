import JSZip from "jszip";
import type { ChatContentBlock } from "@/types/chat";

const TEXT_EXTENSIONS = new Set([
  "txt", "md", "json", "yaml", "yml", "xml", "urdf", "xacro",
  "py", "cpp", "cc", "c", "h", "hpp", "ino", "js", "ts", "tsx", "jsx",
  "csv", "cfg", "ini", "toml", "launch", "sdf", "world",
]);

const MAX_TEXT_CHARS = 20_000;
const MAX_ZIP_ENTRIES = 40;
// entry.async("string") decompresses the WHOLE entry into memory before we
// can truncate it — a small DEFLATE file can expand ~1000x, so a crafted
// zip well under MAX_REFERENCE_FILE_BYTES can still OOM the process.
// (Tried aborting mid-decompression via entry.nodeStream() + destroy() —
// jszip's internal inflate pipe doesn't tolerate being cut off mid-flight
// and throws an uncaught "stream.push() after EOF" outside the promise
// chain. Checking the declared size from the zip's central directory
// before ever starting decompression avoids that entirely.)
const MAX_ENTRY_DECOMPRESSED_BYTES = 2 * 1024 * 1024; // 2MB per entry
const MAX_TOTAL_DECOMPRESSED_BYTES = 8 * 1024 * 1024; // 8MB summed across all entries

function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot === -1 ? "" : filename.slice(dot + 1).toLowerCase();
}

function truncate(text: string): string {
  return text.length > MAX_TEXT_CHARS
    ? `${text.slice(0, MAX_TEXT_CHARS)}\n…(truncated, ${text.length} chars total)`
    : text;
}

/**
 * The zip central directory records each entry's uncompressed size, read by
 * JSZip during loadAsync() without decompressing anything. Not part of
 * JSZip's public type surface (hence the cast), but it's the standard way
 * to pre-check size with this library — verified empirically against a
 * real DEFLATE bomb. Returns null if the field is missing for any reason,
 * in which case the caller should skip rather than decompress blind.
 */
function declaredUncompressedSize(entry: JSZip.JSZipObject): number | null {
  const size = (entry as unknown as { _data?: { uncompressedSize?: number } })._data
    ?.uncompressedSize;
  return typeof size === "number" ? size : null;
}

async function processZip(buffer: Buffer, filename: string, description: string): Promise<ChatContentBlock> {
  const zip = await JSZip.loadAsync(buffer);
  const entries = Object.values(zip.files).filter((f) => !f.dir);
  const included: string[] = [];
  const skipped: string[] = [];
  let totalDecompressed = 0;

  for (const entry of entries.slice(0, MAX_ZIP_ENTRIES)) {
    const ext = extensionOf(entry.name);
    if (!TEXT_EXTENSIONS.has(ext)) {
      skipped.push(entry.name);
      continue;
    }
    const declaredSize = declaredUncompressedSize(entry);
    if (declaredSize === null) {
      skipped.push(`${entry.name} (size could not be verified, skipped for safety)`);
      continue;
    }
    if (declaredSize > MAX_ENTRY_DECOMPRESSED_BYTES) {
      skipped.push(`${entry.name} (too large: ${declaredSize} bytes decompressed)`);
      continue;
    }
    if (totalDecompressed + declaredSize > MAX_TOTAL_DECOMPRESSED_BYTES) {
      skipped.push(`${entry.name} (over the archive's total size budget)`);
      continue;
    }
    const content = await entry.async("string");
    totalDecompressed += declaredSize;
    included.push(`--- ${entry.name} ---\n${truncate(content)}`);
  }
  if (entries.length > MAX_ZIP_ENTRIES) {
    skipped.push(`…and ${entries.length - MAX_ZIP_ENTRIES} more entries not listed`);
  }

  const parts = [
    `Reference file "${filename}" (zip archive)${description ? ` — user says: ${description}` : ""}.`,
    included.length > 0 ? included.join("\n\n") : "(no text-readable files found inside)",
    skipped.length > 0 ? `Other files in the archive not extracted (binary/unrecognized): ${skipped.join(", ")}` : "",
  ].filter(Boolean);

  return { type: "text", text: parts.join("\n\n") };
}

/** Turns one uploaded reference file into a content block the model can read. */
export async function processReferenceFile(
  file: File,
  description: string
): Promise<ChatContentBlock> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = extensionOf(file.name);

  if (ext === "zip" || file.type === "application/zip") {
    try {
      return await processZip(buffer, file.name, description);
    } catch (err) {
      return {
        type: "text",
        text: `Reference file "${file.name}" is a zip archive that could not be read (${
          err instanceof Error ? err.message : "unknown error"
        })${description ? ` — user says: ${description}` : ""}.`,
      };
    }
  }

  if (ext === "pdf" || file.type === "application/pdf") {
    return {
      type: "document",
      mediaType: "application/pdf",
      base64: buffer.toString("base64"),
      description,
      filename: file.name,
    };
  }

  if (TEXT_EXTENSIONS.has(ext) || file.type.startsWith("text/")) {
    const text = buffer.toString("utf-8");
    return {
      type: "text",
      text: `Reference file "${file.name}"${description ? ` — user says: ${description}` : ""}:\n\n${truncate(text)}`,
    };
  }

  // Unrecognized binary format — keep the description/filename as context
  // rather than silently dropping the upload.
  return {
    type: "text",
    text: `User uploaded a reference file "${file.name}" (${file.type || "unknown type"}, ${buffer.length} bytes) that isn't a text/PDF/zip format this app can read directly.${
      description ? ` User's description: ${description}` : " No description was given — ask what it contains if it matters."
    }`,
  };
}
