import fs from "node:fs";
import path from "node:path";
import type { GeneratedFile } from "@/lib/zip";

export const TEMPLATE_IDS = ["arduino-serial"] as const;
export type TemplateId = (typeof TEMPLATE_IDS)[number];

// Explicit manifest of zip path -> repo path. The files themselves are
// shipped to the serverless bundle via outputFileTracingIncludes in
// next.config.ts — adding a file here requires no config change (the glob
// covers the whole templates directory).
const MANIFESTS: Record<TemplateId, { zipPath: string; diskPath: string }[]> = {
  "arduino-serial": [
    {
      zipPath: "firmware/arm_controller/arm_controller.ino",
      diskPath: "src/lib/codegen/templates/arduino-serial/arm_controller.ino",
    },
    { zipPath: "web/index.html", diskPath: "src/lib/codegen/templates/arduino-serial/index.html" },
    { zipPath: "web/app.js", diskPath: "src/lib/codegen/templates/arduino-serial/app.js" },
    { zipPath: "web/styles.css", diskPath: "src/lib/codegen/templates/arduino-serial/styles.css" },
  ],
};

const cache = new Map<TemplateId, GeneratedFile[]>();

export function resolveTemplateId(raw: unknown): TemplateId | null {
  return TEMPLATE_IDS.includes(raw as TemplateId) ? (raw as TemplateId) : null;
}

export function loadTemplateFiles(id: TemplateId): GeneratedFile[] {
  let files = cache.get(id);
  if (!files) {
    files = MANIFESTS[id].map((entry) => ({
      path: entry.zipPath,
      content: fs.readFileSync(path.join(process.cwd(), entry.diskPath), "utf-8"),
    }));
    cache.set(id, files);
  }
  return files;
}

/**
 * Template files fill in everything the model didn't generate; a model file
 * at the same path wins, so the model can deviate from the template when the
 * confirmed plan requires it.
 */
export function mergeTemplateFiles(
  templateFiles: GeneratedFile[],
  modelFiles: GeneratedFile[]
): GeneratedFile[] {
  const modelPaths = new Set(modelFiles.map((file) => file.path.replace(/^\/+/, "")));
  return [
    ...templateFiles.filter((file) => !modelPaths.has(file.path)),
    ...modelFiles,
  ];
}
