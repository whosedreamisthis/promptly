import { beforeEach, describe, expect, it, vi } from "vitest";

const checkLimit = vi.hoisted(() => vi.fn());

vi.mock("@/lib/rate-limit", () => ({ checkLimit }));

import {
  chooseReplySource,
  isBurstLimited,
  isModelBudgetSpent,
} from "@/lib/chat-limits";
import { isDemoGloballyLimited, isDemoIpLimited } from "@/lib/demo-limits";

beforeEach(() => {
  vi.unstubAllEnvs();
  checkLimit.mockReset().mockResolvedValue(false);
});

describe("limits that protect model spend", () => {
  it("fail closed for the global budget", async () => {
    await isModelBudgetSpent();

    expect(checkLimit).toHaveBeenCalledWith("model:global", expect.anything(), {
      failClosed: true,
    });
  });

  it("fail closed for each caller's daily limit", async () => {
    await chooseReplySource("user", "user_1");

    expect(checkLimit).toHaveBeenCalledWith(
      "chat:user:user_1",
      expect.objectContaining({ window: "1 d" }),
      { failClosed: true },
    );
  });

  it("leave the per-minute burst limit fail-open", async () => {
    await isBurstLimited("user", "user_1");

    expect(checkLimit).toHaveBeenCalledWith(
      "chat:user:user_1",
      expect.objectContaining({ window: "1 m" }),
    );
  });
});

describe("demo limits", () => {
  it("fail closed and need Redis in production", async () => {
    await isDemoIpLimited("1.1.1.1");
    await isDemoGloballyLimited();

    for (const call of checkLimit.mock.calls) {
      expect(call[2]).toEqual({ failClosed: true, requireRedis: true });
    }
    expect(checkLimit).toHaveBeenCalledTimes(2);
  });
});
