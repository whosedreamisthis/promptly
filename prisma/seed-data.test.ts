import { describe, expect, it } from "vitest";
import { addMessageSchema } from "@/lib/validations/messages";
import { CHATS, NOTEBOOKS } from "./seed-data";

describe("seed data", () => {
  it("has the expected counts", () => {
    expect(NOTEBOOKS).toHaveLength(5);
    expect(CHATS).toHaveLength(20);
    expect(CHATS.filter((chat) => chat.notebookId)).toHaveLength(6);
    expect(CHATS.flatMap((chat) => chat.messages)).toHaveLength(82);
  });

  it("only links chats to existing notebooks", () => {
    const ids = new Set(NOTEBOOKS.map((notebook) => notebook.id));
    for (const chat of CHATS) {
      if (chat.notebookId) expect(ids.has(chat.notebookId)).toBe(true);
    }
  });

  it("alternates user and assistant turns and respects the message limit", () => {
    for (const chat of CHATS) {
      expect(chat.messages.length % 2).toBe(0);
      chat.messages.forEach((content, index) => {
        const result = addMessageSchema.safeParse({
          id: "m",
          chatId: chat.id,
          role: index % 2 === 0 ? "USER" : "ASSISTANT",
          content,
        });
        expect(result.success).toBe(true);
      });
    }
  });

  it("uses unique ids and leaves nb_5 empty", () => {
    expect(new Set(CHATS.map((chat) => chat.id)).size).toBe(CHATS.length);
    expect(CHATS.some((chat) => chat.notebookId === "nb_5")).toBe(false);
  });
});
