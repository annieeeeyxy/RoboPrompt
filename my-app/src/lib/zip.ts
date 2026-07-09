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
    zip.file("SETUP.md", notes);
  }
  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}
