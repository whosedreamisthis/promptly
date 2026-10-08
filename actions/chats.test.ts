import { beforeEach, describe, expect, it, vi } from "vitest";

const { auth, db, generateText } = vi.hoisted(() => ({
  auth: vi.fn(),
  generateText: vi.fn(),
  db: {
    user: { findUnique: vi.fn(), upsert: vi.fn() },
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
vi.mock("ai", () => ({ generateText }));

import {
  autoTitleChat,
  createChat,
  generateChatTitle,
  moveChatToNotebook,
  renameChat,
  setChatPinned,
} from "@/actions/chats";
import { titleLimit } from "@/lib/chat-limits";
import { resetRateLimits } from "@/lib/rate-limit";

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
    db.user.findUnique.mockResolvedValue(null);
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

  it("skips the user write when the user row already exists", async () => {
    db.user.findUnique.mockResolvedValue({ id: "user_1" });
    db.chat.create.mockResolvedValue({ id: "c1" });
    await createChat({ id: "c1" });
    expect(db.user.upsert).not.toHaveBeenCalled();
  });

  it("returns the existing chat when a concurrent create hits the unique id", async () => {
    db.chat.create.mockRejectedValue({ code: "P2002" });
    db.chat.findUnique.mockResolvedValue({
      id: "c1",
      userId: "user_1",
      title: "Mine",
      pinned: false,
      notebookId: null,
    });
    const result = await createChat({ id: "c1" });
    expect(result).toMatchObject({ success: true, data: { title: "Mine" } });
  });

  it("does not expose a chat owned by someone else", async () => {
    db.chat.create.mockRejectedValue({ code: "P2002" });
    db.chat.findUnique.mockResolvedValue({
      id: "c1",
      userId: "user_2",
      title: "Secret",
      pinned: false,
      notebookId: null,
    });
    const result = await createChat({ id: "c1" });
    expect(result).toMatchObject({ success: false, error: "Chat not found" });
  });

  it("refuses to attach a new chat to a notebook the user doesn't own", async () => {
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

  it("sets the pinned flag to the requested value, scoped to the user", async () => {
    db.chat.updateMany.mockResolvedValue({ count: 1 });
    const result = await setChatPinned({ chatId: "c1", pinned: true });
    expect(result.success).toBe(true);
    expect(db.chat.updateMany).toHaveBeenCalledWith({
      where: { id: "c1", userId: "user_1" },
      data: { pinned: true },
    });
  });

  it("reports not found when pinning a chat the user doesn't own", async () => {
    db.chat.updateMany.mockResolvedValue({ count: 0 });
    const result = await setChatPinned({ chatId: "c1", pinned: false });
    expect(result).toMatchObject({ success: false, error: "Chat not found" });
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

describe("generateChatTitle", () => {
  const exchange = [
    { role: "USER", content: "How do I deploy to Vercel?" },
    { role: "ASSISTANT", content: "Push your repo and import it." },
  ];

  beforeEach(() => {
    resetRateLimits();
    auth.mockResolvedValue({ userId: "user_1" });
    db.user.findUnique.mockResolvedValue({ id: "user_1" });
    db.chat.findFirst.mockResolvedValue({
      _count: { messages: 2 },
      messages: exchange,
    });
    generateText.mockResolvedValue({ text: '"Deploying To Vercel."' });
    db.chat.updateMany.mockResolvedValue({ count: 1 });
  });

  it("rejects calls without a session", async () => {
    auth.mockResolvedValue({ userId: null });
    const result = await generateChatTitle({ chatId: "c1" });
    expect(result.success).toBe(false);
    expect(generateText).not.toHaveBeenCalled();
  });

  it("saves a cleaned title only while the title is not custom", async () => {
    const result = await generateChatTitle({ chatId: "c1" });
    expect(result).toMatchObject({
      success: true,
      data: { title: "Deploying To Vercel" },
    });
    expect(db.chat.updateMany).toHaveBeenCalledWith({
      where: { id: "c1", userId: "user_1", isCustomTitle: false },
      data: { title: "Deploying To Vercel" },
    });
  });

  it("skips custom-titled or unknown chats without calling the model", async () => {
    db.chat.findFirst.mockResolvedValue(null);
    const result = await generateChatTitle({ chatId: "c1" });
    expect(result).toMatchObject({ success: true, data: { title: null } });
    expect(generateText).not.toHaveBeenCalled();
  });

  it("returns no title when the chat has no reply yet", async () => {
    db.chat.findFirst.mockResolvedValue({
      _count: { messages: 1 },
      messages: [exchange[0]],
    });
    const result = await generateChatTitle({ chatId: "c1" });
    expect(result).toMatchObject({ data: { title: null } });
    expect(generateText).not.toHaveBeenCalled();
  });

  it("only titles the first exchange, not later turns", async () => {
    db.chat.findFirst.mockResolvedValue({
      _count: { messages: 6 },
      messages: exchange,
    });
    const result = await generateChatTitle({ chatId: "c1" });
    expect(result).toMatchObject({ success: true, data: { title: null } });
    expect(generateText).not.toHaveBeenCalled();
  });

  it("stops calling the model once the daily limit is reached", async () => {
    for (let call = 0; call < titleLimit().limit; call++) {
      await generateChatTitle({ chatId: "c1" });
    }
    generateText.mockClear();
    const result = await generateChatTitle({ chatId: "c1" });
    expect(result).toMatchObject({ success: true, data: { title: null } });
    expect(generateText).not.toHaveBeenCalled();
  });

  it("skips the model when USE_AI_MODEL is false", async () => {
    vi.stubEnv("USE_AI_MODEL", "false");
    const result = await generateChatTitle({ chatId: "c1" });
    expect(result).toMatchObject({ success: true, data: { title: null } });
    expect(generateText).not.toHaveBeenCalled();
  });

  it("keeps the current title when the model fails or the chat was renamed meanwhile", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    generateText.mockRejectedValue(new Error("quota"));
    const failed = await generateChatTitle({ chatId: "c1" });
    expect(failed).toMatchObject({ success: true, data: { title: null } });
    generateText.mockResolvedValue({ text: "Fresh Title" });
    db.chat.updateMany.mockResolvedValue({ count: 0 });
    const renamed = await generateChatTitle({ chatId: "c1" });
    expect(renamed).toMatchObject({ data: { title: null } });
  });
});
