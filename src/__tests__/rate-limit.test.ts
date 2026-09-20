import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the @upstash packages BEFORE importing the module under test.
// We avoid a real Redis dependency in unit tests; the limiter is only constructed
// when UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are both set, so we
// drive the env vars explicitly per test.
const mockLimit = vi.fn();

vi.mock("@upstash/ratelimit", () => {
  // Construct a fake Ratelimit class. `limit()` delegates to the test-controlled mock.
  return {
    Ratelimit: class {
      static slidingWindow = (_n: number, _w: string) => ({ __sw: true });
      limit = mockLimit;
    },
  };
});

vi.mock("@upstash/redis", () => ({
  Redis: class {
    constructor(_cfg: unknown) {
      // noop
    }
  },
}));

describe("getClientIp", () => {
  beforeEach(() => {
    // Re-import the module under test for each test so env-driven construction is fresh.
    vi.resetModules();
  });

  it("returns first hop from x-forwarded-for", async () => {
    const { getClientIp } = await import("../lib/rate-limit");
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.5, 10.0.0.1, 10.0.0.2",
    });
    expect(getClientIp(headers)).toBe("203.0.113.5");
  });

  it("trims whitespace around forwarded hops", async () => {
    const { getClientIp } = await import("../lib/rate-limit");
    const headers = new Headers({ "x-forwarded-for": "  198.51.100.7  " });
    expect(getClientIp(headers)).toBe("198.51.100.7");
  });

  it("falls back to x-real-ip when x-forwarded-for is missing", async () => {
    const { getClientIp } = await import("../lib/rate-limit");
    const headers = new Headers({ "x-real-ip": "192.0.2.42" });
    expect(getClientIp(headers)).toBe("192.0.2.42");
  });

  it("prefers x-forwarded-for over x-real-ip", async () => {
    const { getClientIp } = await import("../lib/rate-limit");
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.5",
      "x-real-ip": "192.0.2.42",
    });
    expect(getClientIp(headers)).toBe("203.0.113.5");
  });

  it("returns 'unknown' when neither header is present", async () => {
    const { getClientIp } = await import("../lib/rate-limit");
    expect(getClientIp(new Headers())).toBe("unknown");
  });

  it("returns 'unknown' when x-forwarded-for is empty", async () => {
    const { getClientIp } = await import("../lib/rate-limit");
    const headers = new Headers({ "x-forwarded-for": "" });
    expect(getClientIp(headers)).toBe("unknown");
  });
});

describe("checkRateLimit (limiter null path)", () => {
  beforeEach(() => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    vi.resetModules();
    mockLimit.mockReset();
  });

  it("silently passes when Redis is not configured", async () => {
    const { checkRateLimit } = await import("../lib/rate-limit");
    await expect(checkRateLimit("orderPlacement", "1.2.3.4")).resolves.toBeUndefined();
    expect(mockLimit).not.toHaveBeenCalled();
  });

  it("silently passes for every limiter when Redis is not configured", async () => {
    const { checkRateLimit } = await import("../lib/rate-limit");
    const limiters = [
      "orderPlacement",
      "couponValidation",
      "search",
      "reviewSubmission",
      "login",
      "register",
    ] as const;
    for (const name of limiters) {
      await expect(checkRateLimit(name, "test")).resolves.toBeUndefined();
    }
    expect(mockLimit).not.toHaveBeenCalled();
  });
});

describe("checkRateLimit (limiter constructed path)", () => {
  beforeEach(() => {
    process.env.UPSTASH_REDIS_REST_URL = "https://fake-redis.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "fake-token";
    vi.resetModules();
    mockLimit.mockReset();
  });

  it("throws RATE_LIMIT_EXCEEDED when the limiter rejects", async () => {
    mockLimit.mockResolvedValueOnce({ success: false, limit: 5, remaining: 0, reset: 0 });
    const { checkRateLimit } = await import("../lib/rate-limit");
    await expect(checkRateLimit("orderPlacement", "1.2.3.4")).rejects.toThrow(
      "RATE_LIMIT_EXCEEDED"
    );
    expect(mockLimit).toHaveBeenCalledWith("1.2.3.4");
  });

  it("returns silently when the limiter allows the request", async () => {
    mockLimit.mockResolvedValueOnce({ success: true, limit: 5, remaining: 4, reset: 0 });
    const { checkRateLimit } = await import("../lib/rate-limit");
    await expect(checkRateLimit("orderPlacement", "9.9.9.9")).resolves.toBeUndefined();
    expect(mockLimit).toHaveBeenCalledWith("9.9.9.9");
  });
});
