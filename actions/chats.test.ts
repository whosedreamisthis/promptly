import { beforeEach, describe, expect, it, vi } from "vitest";

const { auth, db } = vi.hoisted(() => ({
  auth: vi.fn(),
  db: {
    user: { upsert: vi.fn() },
    chat: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    notebook: { findFirst: vi.fn() },
  },
}));

vi.mock("@clerk/nextjs/server", () => ({ auth }));
vi.mock("@/lib/db", () => ({ db }));

import {
  autoTitleChat,
  createChat,
  moveChatToNotebook,
  renameChat,
  togglePinChat,
} from "@/actions/chats";

describe("chat actions", () => {
  beforeEach(() => {
    auth.mockResolvedValue({ userId: "user_1" });
  });

  it("rejects calls without a session", async () => {
    auth.mockResolvedValue({ userId: null });
    const result = await renameChat({ chatId: "c1", title: "Hello" });
    expect(result.success).toBe(false);
    expect(db.chat.updateMany).not.toHaveBeenCalled();
  });

  it("rejects invalid input before touching the database", async () => {
    const result = await renameChat({ chatId: "c1", title: "   " });
    expect(result).toMatchObject({ success: false, error: "Invalid input" });
    expect(auth).not.toHaveBeenCalled();
  });

  it("creates the user row and a chat for a new id", async () => {
    db.chat.findUnique.mockResolvedValue(null);
    db.chat.create.mockResolvedValue({
      id: "c1",
      title: "New Chat",
      pinned: false,
      notebookId: null,
    });
    const result = await createChat({ id: "c1" });
    expect(db.user.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "user_1" } }),
    );
    expect(result).toMatchObject({ success: true, data: { id: "c1" } });
  });

  it("does not expose a chat owned by someone else", async () => {
    db.chat.findUnique.mockResolvedValue({
      id: "c1",
      userId: "user_2",
      title: "Secret",
      pinned: false,
      notebookId: null,
    });
    const result = await createChat({ id: "c1" });
    expect(result).toMatchObject({ success: false, error: "Chat not found" });
    expect(db.chat.create).not.toHaveBeenCalled();
  });

  it("refuses to attach a new chat to a notebook the user doesn't own", async () => {
    db.chat.findUnique.mockResolvedValue(null);
    db.notebook.findFirst.mockResolvedValue(null);
    const result = await createChat({ id: "c1", notebookId: "n1" });
    expect(result).toMatchObject({ success: false });
    expect(db.chat.create).not.toHaveBeenCalled();
  });

  it("marks a manual rename as a custom title, scoped to the user", async () => {
    db.chat.updateMany.mockResolvedValue({ count: 1 });
    const result = await renameChat({ chatId: "c1", title: " My chat " });
    expect(result.success).toBe(true);
    expect(db.chat.updateMany).toHaveBeenCalledWith({
      where: { id: "c1", userId: "user_1" },
      data: { title: "My chat", isCustomTitle: true },
    });
  });

  it("reports not found when renaming a chat the user doesn't own", async () => {
    db.chat.updateMany.mockResolvedValue({ count: 0 });
    const result = await renameChat({ chatId: "c1", title: "Hi" });
    expect(result).toMatchObject({ success: false, error: "Chat not found" });
  });

  it("only auto-titles chats without a custom title", async () => {
    db.chat.updateMany.mockResolvedValue({ count: 0 });
    await autoTitleChat({ chatId: "c1", title: "Generated" });
    expect(db.chat.updateMany).toHaveBeenCalledWith({
      where: { id: "c1", userId: "user_1", isCustomTitle: false },
      data: { title: "Generated" },
    });
  });

  it("toggles the pinned flag", async () => {
    db.chat.findFirst.mockResolvedValue({ pinned: false });
    await togglePinChat({ chatId: "c1" });
    expect(db.chat.update).toHaveBeenCalledWith({
      where: { id: "c1" },
      data: { pinned: true },
    });
  });

  it("checks notebook ownership when moving a chat", async () => {
    db.notebook.findFirst.mockResolvedValue(null);
    const result = await moveChatToNotebook({ chatId: "c1", notebookId: "n9" });
    expect(result).toMatchObject({ success: false });
    expect(db.chat.updateMany).not.toHaveBeenCalled();
  });

  it("returns a friendly error when the database throws", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    db.chat.updateMany.mockRejectedValue(new Error("boom"));
    const result = await renameChat({ chatId: "c1", title: "Hi" });
    expect(result.success).toBe(false);
    expect(result.error).not.toContain("boom");
  });
});
