import fs from "node:fs";
import path from "node:path";

let cached: string | null = null;

export function getSystemPrompt(): string {
  if (cached === null) {
    const filePath = path.join(process.cwd(), "src/content/system-prompt.md");
    cached = fs.readFileSync(filePath, "utf-8");
  }
  return cached;
}
