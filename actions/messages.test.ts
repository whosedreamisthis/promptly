import { beforeEach, describe, expect, it, vi } from "vitest";

const { auth, db } = vi.hoisted(() => ({
  auth: vi.fn(),
  db: {
    user: { upsert: vi.fn() },
    chat: { findFirst: vi.fn(), update: vi.fn() },
    message: { create: vi.fn() },
  },
}));

vi.mock("@clerk/nextjs/server", () => ({ auth }));
vi.mock("@/lib/db", () => ({ db }));

import { addMessage } from "@/actions/messages";
import { MAX_MESSAGE_LENGTH } from "@/lib/validations/messages";

const input = {
  id: "m1",
  chatId: "c1",
  role: "USER" as const,
  content: "Hello",
};

describe("addMessage", () => {
  beforeEach(() => {
    auth.mockResolvedValue({ userId: "user_1" });
  });

  it("rejects calls without a session", async () => {
    auth.mockResolvedValue({ userId: null });
    const result = await addMessage(input);
    expect(result.success).toBe(false);
    expect(db.message.create).not.toHaveBeenCalled();
  });

  it("rejects empty and over-long messages", async () => {
    const empty = await addMessage({ ...input, content: "   " });
    const tooLong = await addMessage({
      ...input,
      content: "a".repeat(MAX_MESSAGE_LENGTH + 1),
    });
    expect(empty).toMatchObject({ success: false, error: "Invalid input" });
    expect(tooLong).toMatchObject({ success: false, error: "Invalid input" });
    expect(db.message.create).not.toHaveBeenCalled();
  });

  it("accepts a message at the length limit", async () => {
    db.chat.findFirst.mockResolvedValue({ id: "c1" });
    const result = await addMessage({
      ...input,
      content: "a".repeat(MAX_MESSAGE_LENGTH),
    });
    expect(result.success).toBe(true);
  });

  it("does not save to a chat the user does not own", async () => {
    db.chat.findFirst.mockResolvedValue(null);
    const result = await addMessage(input);
    expect(result).toMatchObject({ success: false, error: "Chat not found" });
    expect(db.chat.findFirst).toHaveBeenCalledWith({
      where: { id: "c1", userId: "user_1" },
      select: { id: true },
    });
    expect(db.message.create).not.toHaveBeenCalled();
  });

  it("saves the message and bumps the chat", async () => {
    db.chat.findFirst.mockResolvedValue({ id: "c1" });
    const result = await addMessage(input);
    expect(result.success).toBe(true);
    expect(db.message.create).toHaveBeenCalledWith({ data: input });
    expect(db.chat.update).toHaveBeenCalledOnce();
  });
});
