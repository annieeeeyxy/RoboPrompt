import JSZip from "jszip";

export type GeneratedFile = { path: string; content: string };

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
