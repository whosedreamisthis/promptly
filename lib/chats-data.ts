import { db } from "@/lib/db";
import type { ChatsData } from "@/types/chats";

export const CHAT_SELECT = {
  id: true,
  title: true,
  pinned: true,
  notebookId: true,
} as const;

const NOTEBOOK_SELECT = { id: true, title: true, pinned: true } as const;

export async function getChatsData(userId: string): Promise<ChatsData> {
  const [chats, notebooks] = await Promise.all([
    db.chat.findMany({
      where: { userId },
      select: CHAT_SELECT,
      orderBy: { updatedAt: "desc" },
    }),
    db.notebook.findMany({
      where: { userId },
      select: NOTEBOOK_SELECT,
      orderBy: { updatedAt: "desc" },
    }),
  ]);
  return { chats, notebooks };
}

export async function getChatWithMessages(userId: string, chatId: string) {
  return db.chat.findFirst({
    where: { id: chatId, userId },
    select: {
      ...CHAT_SELECT,
      messages: {
        orderBy: { createdAt: "asc" },
        select: { id: true, role: true, content: true },
      },
    },
  });
}
