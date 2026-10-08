import { db } from "@/lib/db";
import type { ChatsData } from "@/types/chats";

export const CHAT_SELECT = {
  id: true,
  title: true,
  pinned: true,
  notebookId: true,
} as const;

const NOTEBOOK_SELECT = { id: true, title: true, pinned: true } as const;

const DB_UNREACHABLE_CODE = "P1001";
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1500;

/** Retries only when the database is unreachable, e.g. while a Neon compute wakes from scale-to-zero. */
async function withDbRetry<T>(operation: () => Promise<T>): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const code = (error as { code?: unknown } | null)?.code;
      if (code !== DB_UNREACHABLE_CODE || attempt >= MAX_ATTEMPTS) throw error;
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * attempt));
    }
  }
}

export function getChatsData(userId: string): Promise<ChatsData> {
  return withDbRetry(() => queryChatsData(userId));
}

async function queryChatsData(userId: string): Promise<ChatsData> {
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
