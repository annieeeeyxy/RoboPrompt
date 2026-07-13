import type { NextRequest } from "next/server";

type RequestLike = Pick<NextRequest, "headers">;

export type RateLimitRule = {
  windowMs: number;
  maxRequests: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();
let lastPruneAt = 0;

function pruneExpiredBuckets(now: number) {
  // Prune at most once per minute to keep overhead minimal.
  if (now - lastPruneAt < 60_000) return;
  lastPruneAt = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function clientIpFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  const cloudflareIp = headers.get("cf-connecting-ip")?.trim();
  if (cloudflareIp) return cloudflareIp;
  return "unknown";
}

export function enforceRateLimit(
  req: RequestLike,
  namespace: string,
  rule: RateLimitRule
): { ok: boolean; retryAfterSeconds: number; remaining: number } {
  const now = Date.now();
  pruneExpiredBuckets(now);

  const ip = clientIpFromHeaders(req.headers);
  const key = `${namespace}:${ip}`;
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + rule.windowMs });
    return {
      ok: true,
      retryAfterSeconds: Math.ceil(rule.windowMs / 1000),
      remaining: Math.max(0, rule.maxRequests - 1),
    };
  }

  if (current.count >= rule.maxRequests) {
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
      remaining: 0,
    };
  }

  current.count += 1;
  buckets.set(key, current);
  return {
    ok: true,
    retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    remaining: Math.max(0, rule.maxRequests - current.count),
  };
}

export function clearRateLimitBucketsForTests() {
  buckets.clear();
  lastPruneAt = 0;
}
