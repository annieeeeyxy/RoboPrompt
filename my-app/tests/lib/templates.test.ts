import { describe, expect, it } from "vitest";
import {
  loadTemplateFiles,
  mergeTemplateFiles,
  resolveTemplateId,
} from "../../src/lib/codegen/templates";

describe("resolveTemplateId", () => {
  it("accepts known template ids", () => {
    expect(resolveTemplateId("arduino-serial")).toBe("arduino-serial");
  });

  it("rejects 'none', unknown strings, and non-strings", () => {
    expect(resolveTemplateId("none")).toBeNull();
    expect(resolveTemplateId("esp32")).toBeNull();
    expect(resolveTemplateId(undefined)).toBeNull();
    expect(resolveTemplateId(42)).toBeNull();
  });
});

describe("loadTemplateFiles", () => {
  it("loads every manifest entry with non-empty content", () => {
    const files = loadTemplateFiles("arduino-serial");
    const paths = files.map((f) => f.path);
    expect(paths).toEqual([
      "firmware/arm_controller/arm_controller.ino",
      "web/index.html",
      "web/app.js",
      "web/styles.css",
    ]);
    for (const file of files) {
      expect(file.content.length).toBeGreaterThan(100);
    }
  });

  it("template sketch includes the generated config and speaks the documented protocol", () => {
    const files = loadTemplateFiles("arduino-serial");
    const sketch = files.find((f) => f.path.endsWith(".ino"))!.content;
    expect(sketch).toContain('#include "config.h"');
    expect(sketch).toContain("Serial.begin(115200)");
    const panel = files.find((f) => f.path === "web/app.js")!.content;
    expect(panel).toContain("window.ARM_CONFIG");
    expect(panel).toContain('"M " + joint');
  });
});

describe("mergeTemplateFiles", () => {
  const template = [
    { path: "web/app.js", content: "template app" },
    { path: "web/index.html", content: "template html" },
  ];

  it("keeps template files the model did not touch", () => {
    const merged = mergeTemplateFiles(template, [
      { path: "firmware/arm_controller/config.h", content: "#define NUM_JOINTS 4" },
    ]);
    expect(merged).toHaveLength(3);
    expect(merged.find((f) => f.path === "web/app.js")?.content).toBe("template app");
  });

  it("lets a model file at the same path override the template", () => {
    const merged = mergeTemplateFiles(template, [
      { path: "web/app.js", content: "custom app" },
    ]);
    expect(merged.filter((f) => f.path === "web/app.js")).toHaveLength(1);
    expect(merged.find((f) => f.path === "web/app.js")?.content).toBe("custom app");
  });

  it("treats a leading slash from the model as the same path", () => {
    const merged = mergeTemplateFiles(template, [
      { path: "/web/app.js", content: "custom app" },
    ]);
    expect(merged.filter((f) => f.path.endsWith("web/app.js"))).toHaveLength(1);
  });
});
