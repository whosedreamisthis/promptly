import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  $transaction: vi.fn(),
  message: { create: vi.fn((args: unknown) => args) },
  chat: { update: vi.fn((args: unknown) => args) },
}));

vi.mock("@/lib/db", () => ({ db }));

import { saveChatTurn } from "@/lib/save-chat-turn";

const turn = {
  chatId: "c1",
  userMessageId: "m1",
  userText: "Hello",
  userCreatedAt: new Date(),
  assistantMessageId: "m2",
  reply: "  Hi there  ",
};

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  db.$transaction.mockResolvedValue([]);
});

describe("saveChatTurn", () => {
  it("saves the user message, the trimmed reply and the chat in one transaction", async () => {
    await saveChatTurn(turn);

    expect(db.$transaction).toHaveBeenCalledTimes(1);
    expect(db.message.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ id: "m2", role: "ASSISTANT", content: "Hi there" }),
      }),
    );
  });

  it("saves nothing for an empty reply", async () => {
    await saveChatTurn({ ...turn, reply: "   " });

    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it("ignores a duplicate save but logs other errors", async () => {
    db.$transaction.mockRejectedValueOnce({ code: "P2002" });
    await saveChatTurn(turn);
    expect(console.error).not.toHaveBeenCalled();

    db.$transaction.mockRejectedValueOnce(new Error("down"));
    await saveChatTurn(turn);
    expect(console.error).toHaveBeenCalledTimes(1);
  });
});
