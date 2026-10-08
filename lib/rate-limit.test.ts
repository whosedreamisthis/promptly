import { beforeEach, describe, expect, it } from "vitest";
import { isRateLimited, resetRateLimits } from "@/lib/rate-limit";

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
