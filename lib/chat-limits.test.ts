import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  chooseReplySource,
  isBurstLimited,
  isModelBudgetSpent,
} from "@/lib/chat-limits";
import { checkLimit, resetRateLimits } from "@/lib/rate-limit";

beforeEach(() => {
  resetRateLimits();
  vi.unstubAllEnvs();
});

describe("isBurstLimited", () => {
  it("allows guests up to the minute limit, then blocks", async () => {
    for (let call = 0; call < 10; call++) {
      expect(await isBurstLimited("guest", "1.1.1.1")).toBe(false);
    }
    expect(await isBurstLimited("guest", "1.1.1.1")).toBe(true);
  });

  it("tracks keys and callers separately", async () => {
    for (let call = 0; call < 11; call++) await isBurstLimited("guest", "a");
    expect(await isBurstLimited("guest", "b")).toBe(false);
    expect(await isBurstLimited("user", "a")).toBe(false);
  });
});

describe("chooseReplySource", () => {
  it("uses the model while under every limit", async () => {
    expect(await chooseReplySource("guest", "ip")).toBe("model");
  });

  it("defaults to 10 model replies per day", async () => {
    for (let call = 0; call < 10; call++) {
      expect(await chooseReplySource("guest", "ip")).toBe("model");
    }
    expect(await chooseReplySource("guest", "ip")).toBe("limit");
    expect(await chooseReplySource("guest", "other-ip")).toBe("model");
  });

  it("applies CHAT_DAILY_LIMIT to guests and signed-in users alike", async () => {
    vi.stubEnv("CHAT_DAILY_LIMIT", "1");
    expect(await chooseReplySource("guest", "ip")).toBe("model");
    expect(await chooseReplySource("guest", "ip")).toBe("limit");
    expect(await chooseReplySource("user", "u1")).toBe("model");
    expect(await chooseReplySource("user", "u1")).toBe("limit");
  });

  it("falls back to the default for an invalid CHAT_DAILY_LIMIT", async () => {
    vi.stubEnv("CHAT_DAILY_LIMIT", "0");
    for (let call = 0; call < 10; call++) {
      expect(await chooseReplySource("guest", "ip")).toBe("model");
    }
  });

  it("switches everyone to the sample reply once the global budget is spent", async () => {
    vi.stubEnv("GLOBAL_DAILY_MODEL_LIMIT", "2");
    expect(await chooseReplySource("user", "u1")).toBe("model");
    expect(await chooseReplySource("user", "u2")).toBe("model");
    expect(await chooseReplySource("user", "u3")).toBe("limit");
  });

  it("returns the dev mock without counting when USE_AI_MODEL is false", async () => {
    vi.stubEnv("USE_AI_MODEL", "false");
    vi.stubEnv("GLOBAL_DAILY_MODEL_LIMIT", "1");
    for (let call = 0; call < 3; call++) {
      expect(await chooseReplySource("guest", "ip")).toBe("mock");
    }
    vi.stubEnv("USE_AI_MODEL", "true");
    expect(await chooseReplySource("guest", "ip")).toBe("model");
  });

  it("does not use up the global budget for a caller already over its daily limit", async () => {
    vi.stubEnv("GLOBAL_DAILY_MODEL_LIMIT", "11");
    for (let call = 0; call < 15; call++) await chooseReplySource("guest", "ip");
    expect(await chooseReplySource("user", "fresh")).toBe("model");
  });
});

describe("isModelBudgetSpent", () => {
  it("is false until the configured daily total is used", async () => {
    vi.stubEnv("GLOBAL_DAILY_MODEL_LIMIT", "3");
    for (let call = 0; call < 3; call++) {
      expect(await isModelBudgetSpent()).toBe(false);
    }
    expect(await isModelBudgetSpent()).toBe(true);
  });

  it("falls back to the default for an invalid setting", async () => {
    vi.stubEnv("GLOBAL_DAILY_MODEL_LIMIT", "abc");
    expect(await isModelBudgetSpent()).toBe(false);
  });
});

describe("checkLimit", () => {
  it("uses the in-memory limiter when Upstash is not configured", async () => {
    const spec = { limit: 1, window: "1 m" } as const;
    expect(await checkLimit("k", spec)).toBe(false);
    expect(await checkLimit("k", spec)).toBe(true);
  });
});
