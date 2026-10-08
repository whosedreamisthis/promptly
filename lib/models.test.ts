import { describe, expect, it } from "vitest";
import { DEFAULT_MODEL, FREE_TIER_MODEL_IDS, resolveModel } from "@/lib/models";

describe("resolveModel", () => {
  it("keeps an allowed model", () => {
    expect(resolveModel("gemini-2.5-flash")).toBe("gemini-2.5-flash");
  });

  it("falls back to the default for unknown, empty or missing values", () => {
    expect(resolveModel("gemini-3.1-pro-preview")).toBe(DEFAULT_MODEL);
    expect(resolveModel("")).toBe(DEFAULT_MODEL);
    expect(resolveModel(null)).toBe(DEFAULT_MODEL);
    expect(resolveModel(undefined)).toBe(DEFAULT_MODEL);
  });

  it("offers the default model", () => {
    expect(FREE_TIER_MODEL_IDS).toContain(DEFAULT_MODEL);
  });
});
