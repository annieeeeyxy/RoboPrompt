import JSZip from "jszip";

export type GeneratedFile = { path: string; content: string };

/**
 * The generate_files tool output comes from the model and is NOT guaranteed
 * to match the schema: `files` occasionally arrives as a JSON *string*
 * (double-encoded array) instead of an array, which used to crash buildZip
 * with "files.forEach is not a function". Normalize every shape we can
 * recover; return null only when there is genuinely nothing usable.
 */
export function normalizeGeneratedFiles(raw: unknown): GeneratedFile[] | null {
  let files = raw;
  if (typeof files === "string") {
    try {
      files = JSON.parse(files);
    } catch {
      return null;
    }
  }
  if (!Array.isArray(files)) return null;

  const out: GeneratedFile[] = [];
  for (const entry of files) {
    let file = entry;
    // Individual entries can be double-encoded too.
    if (typeof file === "string") {
      try {
        file = JSON.parse(file);
      } catch {
        continue;
      }
    }
    if (typeof file !== "object" || file === null) continue;
    const { path, content } = file as { path?: unknown; content?: unknown };
    if (typeof path !== "string" || path.trim() === "") continue;
    out.push({
      path,
      content: typeof content === "string" ? content : content == null ? "" : String(content),
    });
  }
  return out.length > 0 ? out : null;
}

/**
 * Model-supplied paths are untrusted. Strip leading slashes and drop "."/".."
 * segments entirely (rather than resolving them) so the result can never
 * point outside the archive root or be treated as absolute by a naive
 * extractor on the user's machine.
 */
function sanitizePath(path: string, fallback: string): string {
  const cleaned = path
    .replace(/\\/g, "/")
    .split("/")
    .filter((segment) => segment !== "" && segment !== "." && segment !== "..")
    .join("/");
  return cleaned || fallback;
}

export async function buildZip(
  files: GeneratedFile[],
  notes: string
): Promise<Buffer> {
  const zip = new JSZip();
  files.forEach((file, i) => {
    const path = sanitizePath(String(file.path ?? ""), `file-${i + 1}.txt`);
    const content = typeof file.content === "string" ? file.content : String(file.content ?? "");
    zip.file(path, content);
  });
  if (notes) {
    // The model occasionally writes literal backslash-n as plain text in
    // this prose field instead of an actual line break (a quirk specific
    // to this free-text field, not the code files — those legitimately
    // contain "\n" as real string-literal escapes and must not be touched).
    zip.file("SETUP.md", notes.replace(/\\n/g, "\n"));
  }
  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}
