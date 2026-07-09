import JSZip from "jszip";

export type GeneratedFile = { path: string; content: string };

export async function buildZip(
  files: GeneratedFile[],
  notes: string
): Promise<Buffer> {
  const zip = new JSZip();
  for (const file of files) {
    zip.file(file.path, file.content);
  }
  if (notes) {
    // The model occasionally writes literal backslash-n as plain text in
    // this prose field instead of an actual line break (a quirk specific
    // to this free-text field, not the code files — those legitimately
    // contain "\n" as real string-literal escapes and must not be touched).
    zip.file("SETUP.md", notes.replace(/\\n/g, "\n"));
  }
  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}
