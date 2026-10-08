import { beforeEach, describe, expect, it, vi } from "vitest";

const { auth, db } = vi.hoisted(() => ({
  auth: vi.fn(),
  db: {
    user: { findUnique: vi.fn(), upsert: vi.fn(), update: vi.fn() },
  },
}));

vi.mock("@clerk/nextjs/server", () => ({ auth }));
vi.mock("@/lib/db", () => ({ db }));

import { getGeminiModel, setGeminiModel } from "@/actions/settings";
import { DEFAULT_MODEL } from "@/lib/models";

describe("settings actions", () => {
  beforeEach(() => {
    auth.mockResolvedValue({ userId: "user_1" });
    db.user.findUnique.mockResolvedValue({ id: "user_1", geminiModel: null });
  });

  it("rejects saving without a session", async () => {
    auth.mockResolvedValue({ userId: null });
    const result = await setGeminiModel({ model: "gemini-2.5-flash" });
    expect(result.success).toBe(false);
    expect(db.user.update).not.toHaveBeenCalled();
  });

  it("rejects a model outside the free tier list", async () => {
    const result = await setGeminiModel({
      model: "gemini-3.1-pro-preview",
    } as never);
    expect(result).toMatchObject({ success: false, error: "Invalid input" });
    expect(db.user.update).not.toHaveBeenCalled();
  });

  it("saves the chosen model for the signed-in user", async () => {
    const result = await setGeminiModel({ model: "gemini-2.5-flash" });
    expect(result.success).toBe(true);
    expect(db.user.update).toHaveBeenCalledWith({
      where: { id: "user_1" },
      data: { geminiModel: "gemini-2.5-flash" },
    });
  });

  it("returns a friendly error when saving fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    db.user.update.mockRejectedValue(new Error("db down"));
    const result = await setGeminiModel({ model: "gemini-2.5-flash" });
    expect(result).toMatchObject({
      success: false,
      error: "Something went wrong. Please try again.",
    });
  });

  it("returns the default model when none is stored", async () => {
    const result = await getGeminiModel();
    expect(result).toMatchObject({ success: true, data: DEFAULT_MODEL });
  });

  it("falls back to the default when the stored model is no longer allowed", async () => {
    db.user.findUnique.mockResolvedValue({ geminiModel: "retired-model" });
    const result = await getGeminiModel();
    expect(result).toMatchObject({ success: true, data: DEFAULT_MODEL });
  });

  it("returns the stored model", async () => {
    db.user.findUnique.mockResolvedValue({ geminiModel: "gemini-2.5-flash" });
    const result = await getGeminiModel();
    expect(result).toMatchObject({ success: true, data: "gemini-2.5-flash" });
  });
});
