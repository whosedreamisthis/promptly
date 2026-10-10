import { beforeEach, describe, expect, it, vi } from "vitest";

const upstash = vi.hoisted(() => ({ limit: vi.fn() }));

vi.mock("@upstash/redis", () => ({
  Redis: { fromEnv: vi.fn(() => ({})) },
}));
vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: Object.assign(
    vi.fn(function () {
      return { limit: upstash.limit };
    }),
    { slidingWindow: vi.fn() },
  ),
}));

import { checkLimit, isRateLimited, resetRateLimits } from "@/lib/rate-limit";

describe("isRateLimited", () => {
  beforeEach(() => resetRateLimits());

  it("allows calls up to the limit and blocks the next one", () => {
    for (let call = 0; call < 3; call++) {
      expect(isRateLimited("user_1", 3, 1000, 0)).toBe(false);
    }
    expect(isRateLimited("user_1", 3, 1000, 0)).toBe(true);
  });

  it("allows calls again once the window has passed", () => {
    for (let call = 0; call < 3; call++) isRateLimited("user_1", 3, 1000, 0);
    expect(isRateLimited("user_1", 3, 1000, 1000)).toBe(false);
  });

  it("tracks each key separately", () => {
    isRateLimited("user_1", 1, 1000, 0);
    expect(isRateLimited("user_1", 1, 1000, 0)).toBe(true);
    expect(isRateLimited("user_2", 1, 1000, 0)).toBe(false);
  });

  it("does not count blocked calls against the window", () => {
    isRateLimited("user_1", 1, 1000, 0);
    isRateLimited("user_1", 1, 1000, 500);
    expect(isRateLimited("user_1", 1, 1000, 1000)).toBe(false);
  });
});

describe("checkLimit when Upstash is not configured", () => {
  const spec = { limit: 5, window: "1 m" } as const;

  beforeEach(() => {
    resetRateLimits();
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
  });

  it("uses the in-memory limiter, even with failClosed", async () => {
    vi.stubEnv("NODE_ENV", "production");

    expect(await checkLimit("k", spec, { failClosed: true })).toBe(false);
  });

  it("counts as limited in production with requireRedis", async () => {
    vi.stubEnv("NODE_ENV", "production");

    expect(await checkLimit("k", spec, { requireRedis: true })).toBe(true);
  });

  it("still uses the in-memory limiter outside production with requireRedis", async () => {
    vi.stubEnv("NODE_ENV", "development");

    expect(await checkLimit("k", spec, { requireRedis: true })).toBe(false);
  });
});

describe("checkLimit when Upstash is unreachable", () => {
  const spec = { limit: 5, window: "1 m" } as const;

  beforeEach(() => {
    resetRateLimits();
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://example.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "token");
    vi.spyOn(console, "error").mockImplementation(() => {});
    upstash.limit.mockRejectedValue(new Error("redis down"));
  });

  it("falls back to the in-memory limiter by default", async () => {
    expect(await checkLimit("k", spec)).toBe(false);
  });

  it("counts as limited with failClosed", async () => {
    expect(await checkLimit("k", spec, { failClosed: true })).toBe(true);
  });

  it("still uses Upstash's answer when it responds", async () => {
    upstash.limit.mockResolvedValue({ success: true });
    expect(await checkLimit("k", spec, { failClosed: true })).toBe(false);
  });
});
