import { db } from "@/lib/db";
import { DB_UNREACHABLE_CODE, hasErrorCode } from "@/lib/db-errors";
import type { ChatsData } from "@/types/chats";

export const CHAT_SELECT = {
  id: true,
  title: true,
  pinned: true,
  notebookId: true,
} as const;

const NOTEBOOK_SELECT = { id: true, title: true, pinned: true } as const;

/** Most recent chats and notebooks loaded into the sidebar. */
export const LIST_LIMIT = 100;
/** Most recent messages loaded when a chat is opened. */
export const MESSAGE_LIMIT = 200;

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1500;

/** Retries only when the database is unreachable, e.g. while a Neon compute wakes from scale-to-zero. */
export async function withDbRetry<T>(operation: () => Promise<T>): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (!hasErrorCode(error, DB_UNREACHABLE_CODE) || attempt >= MAX_ATTEMPTS) {
        throw error;
      }
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
      take: LIST_LIMIT,
    }),
    db.notebook.findMany({
      where: { userId },
      select: NOTEBOOK_SELECT,
      orderBy: { updatedAt: "desc" },
      take: LIST_LIMIT,
    }),
  ]);
  return { chats, notebooks };
}

/** Loads a chat with its most recent messages, oldest first. */
export async function getChatWithMessages(userId: string, chatId: string) {
  const chat = await db.chat.findFirst({
    where: { id: chatId, userId },
    select: {
      ...CHAT_SELECT,
      messages: {
        orderBy: { createdAt: "desc" },
        take: MESSAGE_LIMIT,
        select: { id: true, role: true, content: true },
      },
    },
  });
  return chat && { ...chat, messages: chat.messages.reverse() };
}
