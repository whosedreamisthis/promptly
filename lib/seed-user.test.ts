import { describe, expect, it, vi } from "vitest";
import type { PrismaClient } from "../app/generated/prisma/client";
import { seedUser } from "./seed-user";

function createFakeDb() {
  const tx = {
    user: { upsert: vi.fn() },
    chat: { deleteMany: vi.fn(), createMany: vi.fn() },
    notebook: { deleteMany: vi.fn(), createMany: vi.fn() },
    message: { createMany: vi.fn() },
  };
  const db = {
    $transaction: vi.fn(async (run: (client: typeof tx) => Promise<void>) =>
      run(tx),
    ),
  };
  return { db: db as unknown as PrismaClient, tx };
}

describe("seedUser", () => {
  it("replaces only the given user's data and returns the counts", async () => {
    const { db, tx } = createFakeDb();

    const counts = await seedUser(db, "user_a");

    expect(counts).toEqual({ notebooks: 5, chats: 20, messages: 82 });
    expect(tx.user.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "user_a" } }),
    );
    expect(tx.chat.deleteMany).toHaveBeenCalledWith({
      where: { userId: "user_a" },
    });
    expect(tx.notebook.deleteMany).toHaveBeenCalledWith({
      where: { userId: "user_a" },
    });
  });

  it("prefixes ids with the user id so copies never collide", async () => {
    const { db, tx } = createFakeDb();
    await seedUser(db, "user_a");
    await seedUser(db, "user_b");

    const [firstChats, secondChats] = tx.chat.createMany.mock.calls.map(
      ([args]) => args.data as { id: string; notebookId: string | null }[],
    );
    const firstIds = new Set(firstChats.map((chat) => chat.id));
    expect(firstIds.size).toBe(20);
    expect(secondChats.some((chat) => firstIds.has(chat.id))).toBe(false);
    expect(firstChats.every((chat) => chat.id.startsWith("user_a_"))).toBe(
      true,
    );
  });

  it("keeps chats pointing at their own scoped notebooks and messages at their chats", async () => {
    const { db, tx } = createFakeDb();
    await seedUser(db, "user_a");

    const notebooks = tx.notebook.createMany.mock.calls[0][0].data as {
      id: string;
    }[];
    const chats = tx.chat.createMany.mock.calls[0][0].data as {
      id: string;
      notebookId: string | null;
    }[];
    const messages = tx.message.createMany.mock.calls[0][0].data as {
      chatId: string;
    }[];
    const notebookIds = new Set(notebooks.map((notebook) => notebook.id));
    const chatIds = new Set(chats.map((chat) => chat.id));

    for (const chat of chats) {
      if (chat.notebookId) expect(notebookIds.has(chat.notebookId)).toBe(true);
    }
    for (const message of messages) {
      expect(chatIds.has(message.chatId)).toBe(true);
    }
  });
});
