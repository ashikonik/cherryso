import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Graceful fallback if Redis is not configured yet
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const hasRedis = !!(redisUrl && redisToken);

const redis = hasRedis
  ? new Redis({
      url: redisUrl,
      token: redisToken,
    })
  : ({} as Redis); // Mock redis if not configured

// Create specific rate limiters based on Phase 2 Plan
export const rateLimiters = {
  // 5 per hour per IP
  orderPlacement: hasRedis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "1 h"),
        analytics: true,
      })
    : null,

  // 10 per minute per IP
  couponValidation: hasRedis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, "1 m"),
        analytics: true,
      })
    : null,

  // 30 per minute per IP
  search: hasRedis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(30, "1 m"),
        analytics: true,
      })
    : null,

  // 3 per hour per user/IP
  reviewSubmission: hasRedis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(3, "1 h"),
        analytics: true,
      })
    : null,

  // 5 per 15 minutes per IP
  login: hasRedis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "15 m"),
        analytics: true,
      })
    : null,

  // 3 per hour per IP
  register: hasRedis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(3, "1 h"),
        analytics: true,
      })
    : null,
};

/**
 * Utility function to check rate limit and throw an error if exceeded.
 * If Redis is not configured, it silently passes (useful for local dev before keys are added).
 *
 * Throws a `RATE_LIMIT_EXCEEDED` Error which callers should translate into a
 * user-facing message (do NOT leak the raw error code to clients).
 */
export async function checkRateLimit(
  limiterName: keyof typeof rateLimiters,
  identifier: string
): Promise<void> {
  const limiter = rateLimiters[limiterName];
  if (!limiter) {
    // Local dev: Upstash not configured. Silent pass keeps checkout flow working.
    return;
  }

  const { success } = await limiter.limit(identifier);

  if (!success) {
    throw new Error("RATE_LIMIT_EXCEEDED");
  }
}

/**
 * Extract the best-effort client IP from a Next.js request.
 *
 * Trust order (most-to-least specific):
 *   1. `x-forwarded-for` first hop — Netlify/Cloudflare set this for every request
 *   2. `x-real-ip` — fallback for proxies that normalise the header
 *   3. `"unknown"` — degraded bucket; this still prevents a single attacker
 *      from wiping out the limit for ALL users (they share the "unknown" bucket,
 *      but their individual count is bounded by the limiter's window).
 *
 * Callers should pass the result as the `identifier` to `checkRateLimit`.
 */
export function getClientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    // x-forwarded-for can be a comma-separated list: "client, proxy1, proxy2".
    // The first entry is the original client.
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const xri = headers.get("x-real-ip");
  if (xri) return xri.trim();
  return "unknown";
}
