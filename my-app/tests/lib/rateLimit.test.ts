import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearRateLimitBucketsForTests,
  clientIpFromHeaders,
  enforceRateLimit,
} from "../../src/lib/rateLimit";

describe("clientIpFromHeaders", () => {
  it("prefers first x-forwarded-for entry", () => {
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.10, 10.0.0.1",
      "x-real-ip": "10.0.0.2",
    });
    expect(clientIpFromHeaders(headers)).toBe("203.0.113.10");
  });

  it("falls back to x-real-ip then unknown", () => {
    expect(clientIpFromHeaders(new Headers({ "x-real-ip": "192.0.2.1" }))).toBe("192.0.2.1");
    expect(clientIpFromHeaders(new Headers())).toBe("unknown");
  });
});

describe("enforceRateLimit", () => {
  const req = { headers: new Headers({ "x-forwarded-for": "198.51.100.23" }) };
  const rule = { windowMs: 60_000, maxRequests: 2 };

  beforeEach(() => {
    clearRateLimitBucketsForTests();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });

  it("allows within budget and blocks over budget", () => {
    expect(enforceRateLimit(req as never, "api:test", rule).ok).toBe(true);
    expect(enforceRateLimit(req as never, "api:test", rule).ok).toBe(true);

    const limited = enforceRateLimit(req as never, "api:test", rule);
    expect(limited.ok).toBe(false);
    expect(limited.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("resets after the window elapses", () => {
    enforceRateLimit(req as never, "api:test", rule);
    enforceRateLimit(req as never, "api:test", rule);
    expect(enforceRateLimit(req as never, "api:test", rule).ok).toBe(false);

    vi.advanceTimersByTime(60_000);
    expect(enforceRateLimit(req as never, "api:test", rule).ok).toBe(true);
  });
});
