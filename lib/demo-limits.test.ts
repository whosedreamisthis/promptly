import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  demoTtlMs,
  getClientIp,
  isDemoCapacityFull,
  isDemoGloballyLimited,
  isDemoIpLimited,
  MAX_LIVE_DEMO_USERS,
} from "@/lib/demo-limits";
import { resetRateLimits } from "@/lib/rate-limit";

beforeEach(() => {
  resetRateLimits();
  vi.unstubAllEnvs();
});

describe("isDemoIpLimited", () => {
  it("allows 3 demos per address per day, then blocks", async () => {
    for (let call = 0; call < 3; call++) {
      expect(await isDemoIpLimited("1.1.1.1")).toBe(false);
    }
    expect(await isDemoIpLimited("1.1.1.1")).toBe(true);
    expect(await isDemoIpLimited("2.2.2.2")).toBe(false);
  });

  it("uses DEMO_LIMIT_PER_IP and ignores invalid values", async () => {
    vi.stubEnv("DEMO_LIMIT_PER_IP", "1");
    expect(await isDemoIpLimited("a")).toBe(false);
    expect(await isDemoIpLimited("a")).toBe(true);

    resetRateLimits();
    vi.stubEnv("DEMO_LIMIT_PER_IP", "nope");
    for (let call = 0; call < 3; call++) await isDemoIpLimited("b");
    expect(await isDemoIpLimited("b")).toBe(true);
  });
});

describe("isDemoGloballyLimited", () => {
  it("blocks everyone after DEMO_LIMIT_GLOBAL demos", async () => {
    vi.stubEnv("DEMO_LIMIT_GLOBAL", "2");
    expect(await isDemoGloballyLimited()).toBe(false);
    expect(await isDemoGloballyLimited()).toBe(false);
    expect(await isDemoGloballyLimited()).toBe(true);
  });
});

describe("demoTtlMs", () => {
  it("defaults to 12 hours and reads DEMO_USER_TTL_HOURS", () => {
    expect(demoTtlMs()).toBe(12 * 3_600_000);
    vi.stubEnv("DEMO_USER_TTL_HOURS", "2");
    expect(demoTtlMs()).toBe(2 * 3_600_000);
  });
});

describe("isDemoCapacityFull", () => {
  it("is full at the live user cap", () => {
    expect(isDemoCapacityFull(MAX_LIVE_DEMO_USERS - 1)).toBe(false);
    expect(isDemoCapacityFull(MAX_LIVE_DEMO_USERS)).toBe(true);
  });
});

describe("getClientIp", () => {
  it("uses the platform-set address", () => {
    const request = new Request("http://localhost", {
      headers: { "x-real-ip": "9.9.9.9" },
    });
    expect(getClientIp(request)).toBe("9.9.9.9");
  });

  it("uses the first x-vercel-forwarded-for address", () => {
    const request = new Request("http://localhost", {
      headers: { "x-vercel-forwarded-for": "8.8.8.8, 10.0.0.1" },
    });
    expect(getClientIp(request)).toBe("8.8.8.8");
  });

  it("ignores the client-controlled x-forwarded-for", () => {
    const request = new Request("http://localhost", {
      headers: { "x-forwarded-for": "6.6.6.6" },
    });
    expect(getClientIp(request)).toBe("unknown");
  });

  it("falls back to unknown without the header", () => {
    expect(getClientIp(new Request("http://localhost"))).toBe("unknown");
  });
});
