import type { PrismaClient } from "../app/generated/prisma/client";
import { CHATS, NOTEBOOKS } from "../prisma/seed-data";
import { addMessageSchema } from "./validations/messages";

const MINUTE_MS = 60_000;

/** Seed ids are global primary keys, so each user's copy gets its own prefix. */
function scopedId(userId: string, id: string): string {
  return `${userId}_${id}`;
}

function buildMessages(userId: string) {
  return CHATS.flatMap((chat) => {
    const start =
      new Date(chat.updatedAt).getTime() - chat.messages.length * MINUTE_MS;
    return chat.messages.map((content, index) => {
      const chatId = scopedId(userId, chat.id);
      const message = addMessageSchema.parse({
        id: `${chatId}_m${index + 1}`,
        chatId,
        role: index % 2 === 0 ? "USER" : "ASSISTANT",
        content,
      });
      return {
        ...message,
        createdAt: new Date(start + (index + 1) * MINUTE_MS),
      };
    });
  });
}

/** Replaces `userId`'s notebooks, chats and messages with the sample data; other users are untouched. */
export async function seedUser(
  db: PrismaClient,
  userId: string,
): Promise<{ notebooks: number; chats: number; messages: number }> {
  const messages = buildMessages(userId);

  await db.$transaction(async (tx) => {
    await tx.user.upsert({
      where: { id: userId },
      create: { id: userId },
      update: {},
    });
    await tx.chat.deleteMany({ where: { userId } });
    await tx.notebook.deleteMany({ where: { userId } });
    await tx.notebook.createMany({
      data: NOTEBOOKS.map((notebook) => ({
        ...notebook,
        id: scopedId(userId, notebook.id),
        userId,
        createdAt: new Date(notebook.updatedAt),
        updatedAt: new Date(notebook.updatedAt),
      })),
    });
    await tx.chat.createMany({
      data: CHATS.map(({ messages: chatMessages, updatedAt, ...chat }) => ({
        ...chat,
        id: scopedId(userId, chat.id),
        notebookId: chat.notebookId ? scopedId(userId, chat.notebookId) : null,
        userId,
        isCustomTitle: true,
        createdAt: new Date(
          new Date(updatedAt).getTime() - chatMessages.length * MINUTE_MS,
        ),
        updatedAt: new Date(updatedAt),
      })),
    });
    await tx.message.createMany({ data: messages });
  });

  return {
    notebooks: NOTEBOOKS.length,
    chats: CHATS.length,
    messages: messages.length,
  };
}
