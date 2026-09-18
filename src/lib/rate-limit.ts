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
 */
export async function checkRateLimit(
  limiterName: keyof typeof rateLimiters,
  identifier: string
): Promise<void> {
  const limiter = rateLimiters[limiterName];
  if (!limiter) {
    console.warn(`[RateLimit] Skipping ${limiterName} because Upstash Redis is not configured.`);
    return;
  }

  const { success } = await limiter.limit(identifier);

  if (!success) {
    throw new Error("RATE_LIMIT_EXCEEDED");
  }
}
