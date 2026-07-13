import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import { buildZip, normalizeGeneratedFiles } from "../../src/lib/zip";

describe("normalizeGeneratedFiles", () => {
  it("parses a double-encoded files payload", () => {
    const raw = JSON.stringify([
      JSON.stringify({ path: "README.md", content: "hello" }),
      { path: "src/index.ts", content: 123 },
    ]);

    expect(normalizeGeneratedFiles(raw)).toEqual([
      { path: "README.md", content: "hello" },
      { path: "src/index.ts", content: "123" },
    ]);
  });
});

describe("buildZip", () => {
  it("sanitizes dangerous paths and normalizes setup newlines", async () => {
    const buffer = await buildZip(
      [
        { path: "../outside.txt", content: "x" },
        { path: "/abs/path.txt", content: "y" },
      ],
      "line1\\nline2"
    );

    const zip = await JSZip.loadAsync(buffer);
    const names = Object.keys(zip.files).filter((name) => !zip.files[name].dir).sort();

    expect(names).toEqual(["SETUP.md", "abs/path.txt", "outside.txt"]);
    expect(await zip.file("SETUP.md")?.async("string")).toBe("line1\nline2");
  });
});
