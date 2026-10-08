import { beforeEach, describe, expect, it, vi } from "vitest";
import { positiveIntFromEnv } from "@/lib/env";

beforeEach(() => vi.unstubAllEnvs());

describe("positiveIntFromEnv", () => {
  it("returns the configured positive integer", () => {
    vi.stubEnv("TEST_LIMIT", "7");
    expect(positiveIntFromEnv("TEST_LIMIT", 3)).toBe(7);
  });

  it.each(["", "0", "-1", "1.5", "abc"])("falls back for %j", (value) => {
    vi.stubEnv("TEST_LIMIT", value);
    expect(positiveIntFromEnv("TEST_LIMIT", 3)).toBe(3);
  });

  it("falls back when the variable is not set", () => {
    expect(positiveIntFromEnv("TEST_LIMIT_UNSET", 3)).toBe(3);
  });
});
