"use server";

import { generateText } from "ai";
import { fail, ok } from "@/lib/action-result";
import { CHAT_SELECT } from "@/lib/chats-data";
import { buildTitlePrompt, cleanTitle, getModel, isAiEnabled } from "@/lib/ai";
import { db } from "@/lib/db";
import { hasErrorCode, UNIQUE_VIOLATION_CODE } from "@/lib/db-errors";
import {
  isModelBudgetSpent,
  MODEL_SPEND_OPTIONS,
  titleLimit,
} from "@/lib/chat-limits";
import { checkLimit } from "@/lib/rate-limit";
import { runAction } from "@/lib/run-action";
import {
  chatIdSchema,
  createChatSchema,
  moveChatSchema,
  renameChatSchema,
  setChatPinnedSchema,
  type ChatIdInput,
  type CreateChatInput,
  type MoveChatInput,
  type RenameChatInput,
  type SetChatPinnedInput,
} from "@/lib/validations/chats";
import type { ActionResult } from "@/types/actions";
import type { Chat } from "@/types/chats";

const CHAT_NOT_FOUND = "Chat not found";
const NOTEBOOK_NOT_FOUND = "Notebook not found";
const FIRST_EXCHANGE_MESSAGE_COUNT = 2;

/** True when no notebook is given, or the notebook belongs to the user. */
async function ownsNotebook(
  userId: string,
  notebookId: string | null | undefined,
): Promise<boolean> {
  if (!notebookId) return true;
  const notebook = await db.notebook.findFirst({
    where: { id: notebookId, userId },
    select: { id: true },
  });
  return notebook !== null;
}

export async function createChat(
  input: CreateChatInput,
): Promise<ActionResult<Chat>> {
  return runAction(createChatSchema, input, async (userId, data) => {
    if (!(await ownsNotebook(userId, data.notebookId))) {
      return fail(NOTEBOOK_NOT_FOUND);
    }
    try {
      const chat = await db.chat.create({
        data: {
          id: data.id,
          userId,
          title: data.title,
          notebookId: data.notebookId ?? null,
        },
        select: CHAT_SELECT,
      });
      return ok(chat);
    } catch (error) {
      if (!hasErrorCode(error, UNIQUE_VIOLATION_CODE)) throw error;
      const existing = await db.chat.findUnique({
        where: { id: data.id },
        select: { ...CHAT_SELECT, userId: true },
      });
      if (!existing) return fail(CHAT_NOT_FOUND);
      const { userId: ownerId, ...chat } = existing;
      return ownerId === userId ? ok(chat) : fail(CHAT_NOT_FOUND);
    }
  });
}

/** Manual rename: locks the title against automatic renaming. */
export async function renameChat(
  input: RenameChatInput,
): Promise<ActionResult> {
  return runAction(renameChatSchema, input, async (userId, data) => {
    const { count } = await db.chat.updateMany({
      where: { id: data.chatId, userId },
      data: { title: data.title, isCustomTitle: true },
    });
    return count ? ok(null) : fail(CHAT_NOT_FOUND);
  });
}

/** Sets a generated title; ignored once the user has renamed the chat. */
export async function autoTitleChat(
  input: RenameChatInput,
): Promise<ActionResult> {
  return runAction(renameChatSchema, input, async (userId, data) => {
    await db.chat.updateMany({
      where: { id: data.chatId, userId, isCustomTitle: false },
      data: { title: data.title },
    });
    return ok(null);
  });
}

/** Sets the pinned flag to an explicit value, so repeated or concurrent calls cannot undo each other. */
export async function setChatPinned(
  input: SetChatPinnedInput,
): Promise<ActionResult> {
  return runAction(setChatPinnedSchema, input, async (userId, data) => {
    const { count } = await db.chat.updateMany({
      where: { id: data.chatId, userId },
      data: { pinned: data.pinned },
    });
    return count ? ok(null) : fail(CHAT_NOT_FOUND);
  });
}

export async function moveChatToNotebook(
  input: MoveChatInput,
): Promise<ActionResult> {
  return runAction(moveChatSchema, input, async (userId, data) => {
    if (!(await ownsNotebook(userId, data.notebookId))) {
      return fail(NOTEBOOK_NOT_FOUND);
    }
    const { count } = await db.chat.updateMany({
      where: { id: data.chatId, userId },
      data: { notebookId: data.notebookId },
    });
    return count ? ok(null) : fail(CHAT_NOT_FOUND);
  });
}

export async function deleteChat(input: ChatIdInput): Promise<ActionResult> {
  return runAction(chatIdSchema, input, async (userId, data) => {
    await db.chat.deleteMany({ where: { id: data.chatId, userId } });
    return ok(null);
  });
}

/**
 * Generates a short title from the first exchange; keeps the current title on any failure.
 * Only runs right after the first reply, so repeated calls cannot trigger more model requests.
 */
export async function generateChatTitle(
  input: ChatIdInput,
): Promise<ActionResult<{ title: string | null }>> {
  return runAction(chatIdSchema, input, async (userId, data) => {
    if (
      !isAiEnabled() ||
      (await checkLimit(
        `title:${userId}`,
        titleLimit(),
        MODEL_SPEND_OPTIONS,
      )) ||
      (await isModelBudgetSpent())
    ) {
      return ok({ title: null });
    }
    const chat = await db.chat.findFirst({
      where: { id: data.chatId, userId, isCustomTitle: false },
      select: {
        _count: { select: { messages: true } },
        messages: {
          orderBy: { createdAt: "asc" },
          take: FIRST_EXCHANGE_MESSAGE_COUNT,
          select: { role: true, content: true },
        },
      },
    });
    if (chat?._count.messages !== FIRST_EXCHANGE_MESSAGE_COUNT) {
      return ok({ title: null });
    }
    const userMessage = chat.messages.find((m) => m.role === "USER");
    const assistantMessage = chat.messages.find((m) => m.role === "ASSISTANT");
    if (!userMessage || !assistantMessage) return ok({ title: null });

    try {
      const { text } = await generateText({
        model: getModel(),
        prompt: buildTitlePrompt(userMessage.content, assistantMessage.content),
      });
      const title = cleanTitle(text);
      if (!title) return ok({ title: null });
      const { count } = await db.chat.updateMany({
        where: { id: data.chatId, userId, isCustomTitle: false },
        data: { title },
      });
      return ok({ title: count ? title : null });
    } catch (error) {
      console.error(error);
      return ok({ title: null });
    }
  });
}
