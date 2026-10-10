import { beforeEach, describe, expect, it, vi } from "vitest";

const { auth, db } = vi.hoisted(() => ({
  auth: vi.fn(),
  db: {
    user: { findUnique: vi.fn(), upsert: vi.fn() },
    prompt: {
      count: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      updateMany: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

vi.mock("@clerk/nextjs/server", () => ({ auth }));
vi.mock("@/lib/db", () => ({ db }));

import { createPrompt, deletePrompt, updatePrompt } from "@/actions/prompts";
import { MAX_PROMPTS_PER_USER } from "@/lib/prompts";

const input = {
  id: "p1",
  title: "Summarizer",
  content: "Summarize this.",
  category: "Writing" as const,
};
const saved = {
  id: "p1",
  title: "Summarizer",
  description: "",
  content: "Summarize this.",
  category: "Writing",
};

beforeEach(() => {
  auth.mockResolvedValue({ userId: "user_1" });
  db.user.findUnique.mockResolvedValue({ id: "user_1" });
  db.prompt.count.mockResolvedValue(0);
});

describe("createPrompt", () => {
  it("rejects calls without a session", async () => {
    auth.mockResolvedValue({ userId: null });

    const result = await createPrompt(input);

    expect(result.success).toBe(false);
    expect(db.prompt.create).not.toHaveBeenCalled();
  });

  it("rejects invalid input before touching the database", async () => {
    const result = await createPrompt({
      ...input,
      category: "Cooking" as never,
    });

    expect(result).toMatchObject({ success: false, error: "Invalid input" });
    expect(auth).not.toHaveBeenCalled();
  });

  it("saves the prompt for the signed-in user", async () => {
    db.prompt.create.mockResolvedValue(saved);

    const result = await createPrompt(input);

    expect(db.prompt.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id: "p1",
          userId: "user_1",
          description: "",
        }),
      }),
    );
    expect(result).toMatchObject({ success: true, data: { id: "p1" } });
  });

  it("refuses to save more than the limit", async () => {
    db.prompt.count.mockResolvedValue(MAX_PROMPTS_PER_USER);

    const result = await createPrompt(input);

    expect(result.success).toBe(false);
    expect(db.prompt.create).not.toHaveBeenCalled();
  });

  it("returns the existing prompt when the same id is saved twice", async () => {
    db.prompt.create.mockRejectedValue({ code: "P2002" });
    db.prompt.findUnique.mockResolvedValue({ ...saved, userId: "user_1" });

    const result = await createPrompt(input);

    expect(result).toMatchObject({ success: true, data: saved });
  });

  it("does not expose a prompt owned by someone else", async () => {
    db.prompt.create.mockRejectedValue({ code: "P2002" });
    db.prompt.findUnique.mockResolvedValue({ ...saved, userId: "user_2" });

    const result = await createPrompt(input);

    expect(result).toMatchObject({ success: false, error: "Prompt not found" });
  });
});

describe("updatePrompt", () => {
  const update = { ...input, promptId: "p1" };

  it("updates only the user's own prompt", async () => {
    db.prompt.updateMany.mockResolvedValue({ count: 1 });

    const result = await updatePrompt(update);

    expect(db.prompt.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "p1", userId: "user_1" } }),
    );
    expect(result.success).toBe(true);
  });

  it("reports a prompt that is missing or owned by someone else", async () => {
    db.prompt.updateMany.mockResolvedValue({ count: 0 });

    const result = await updatePrompt(update);

    expect(result).toMatchObject({ success: false, error: "Prompt not found" });
  });
});

describe("deletePrompt", () => {
  it("deletes only the user's own prompt", async () => {
    db.prompt.deleteMany.mockResolvedValue({ count: 1 });

    const result = await deletePrompt({ promptId: "p1" });

    expect(db.prompt.deleteMany).toHaveBeenCalledWith({
      where: { id: "p1", userId: "user_1" },
    });
    expect(result.success).toBe(true);
  });

  it("rejects calls without a session", async () => {
    auth.mockResolvedValue({ userId: null });

    const result = await deletePrompt({ promptId: "p1" });

    expect(result.success).toBe(false);
    expect(db.prompt.deleteMany).not.toHaveBeenCalled();
  });
});
