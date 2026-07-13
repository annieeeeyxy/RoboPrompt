import { describe, expect, it } from "vitest";
import { timingSafeEqualStr } from "../../src/lib/auth";

describe("timingSafeEqualStr", () => {
  it("returns true for identical strings", () => {
    expect(timingSafeEqualStr("abc123", "abc123")).toBe(true);
  });

  it("returns false for different strings with same length", () => {
    expect(timingSafeEqualStr("abc123", "abc124")).toBe(false);
  });

  it("returns false for strings with different lengths", () => {
    expect(timingSafeEqualStr("short", "longer")).toBe(false);
  });
});
