import { describe, expect, it } from "vitest";
import { BASE_PATH, withBasePath, withoutBasePath } from "../../src/lib/basePath";

describe("RoboPrompt base path", () => {
  it("prefixes browser requests", () => {
    expect(BASE_PATH).toBe("/prompt");
    expect(withBasePath("/api/chat")).toBe("/prompt/api/chat");
    expect(withBasePath("api/chat")).toBe("/prompt/api/chat");
  });

  it("normalizes public paths for auth redirects", () => {
    expect(withoutBasePath("/prompt/try")).toBe("/try");
    expect(withoutBasePath("/prompt")).toBe("/");
    expect(withoutBasePath("/api/chat")).toBe("/api/chat");
  });
});
