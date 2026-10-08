"use server";

import { generateText } from "ai";
import { fail, ok } from "@/lib/action-result";
import { CHAT_SELECT } from "@/lib/chats-data";
import {
  buildTitlePrompt,
  cleanTitle,
  getModel,
  isAiEnabled,
} from "@/lib/ai";
import { db } from "@/lib/db";
import { runAction } from "@/lib/run-action";
import {
  chatIdSchema,
  createChatSchema,
  moveChatSchema,
  renameChatSchema,
} from "@/lib/validations/chats";
import type { ActionResult } from "@/types/actions";
import type { Chat } from "@/types/chats";

const CHAT_NOT_FOUND = "Chat not found";

export async function createChat(input: {
  id: string;
  title?: string;
  notebookId?: string | null;
}): Promise<ActionResult<Chat>> {
  return runAction(createChatSchema, input, async (userId, data) => {
    const existing = await db.chat.findUnique({
      where: { id: data.id },
      select: { ...CHAT_SELECT, userId: true },
    });
    if (existing) {
      if (existing.userId !== userId) return fail(CHAT_NOT_FOUND);
      return ok({
        id: existing.id,
        title: existing.title,
        pinned: existing.pinned,
        notebookId: existing.notebookId,
      });
    }
    if (data.notebookId) {
      const notebook = await db.notebook.findFirst({
        where: { id: data.notebookId, userId },
        select: { id: true },
      });
      if (!notebook) return fail("Notebook not found");
    }
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
  });
}

/** Manual rename: locks the title against automatic renaming. */
export async function renameChat(input: {
  chatId: string;
  title: string;
}): Promise<ActionResult> {
  return runAction(renameChatSchema, input, async (userId, data) => {
    const { count } = await db.chat.updateMany({
      where: { id: data.chatId, userId },
      data: { title: data.title, isCustomTitle: true },
    });
    return count ? ok(null) : fail(CHAT_NOT_FOUND);
  });
}

/** Sets a generated title; ignored once the user has renamed the chat. */
export async function autoTitleChat(input: {
  chatId: string;
  title: string;
}): Promise<ActionResult> {
  return runAction(renameChatSchema, input, async (userId, data) => {
    await db.chat.updateMany({
      where: { id: data.chatId, userId, isCustomTitle: false },
      data: { title: data.title },
    });
    return ok(null);
  });
}

export async function togglePinChat(input: {
  chatId: string;
}): Promise<ActionResult> {
  return runAction(chatIdSchema, input, async (userId, data) => {
    const chat = await db.chat.findFirst({
      where: { id: data.chatId, userId },
      select: { pinned: true },
    });
    if (!chat) return fail(CHAT_NOT_FOUND);
    await db.chat.update({
      where: { id: data.chatId },
      data: { pinned: !chat.pinned },
    });
    return ok(null);
  });
}

export async function moveChatToNotebook(input: {
  chatId: string;
  notebookId: string | null;
}): Promise<ActionResult> {
  return runAction(moveChatSchema, input, async (userId, data) => {
    if (data.notebookId) {
      const notebook = await db.notebook.findFirst({
        where: { id: data.notebookId, userId },
        select: { id: true },
      });
      if (!notebook) return fail("Notebook not found");
    }
    const { count } = await db.chat.updateMany({
      where: { id: data.chatId, userId },
      data: { notebookId: data.notebookId },
    });
    return count ? ok(null) : fail(CHAT_NOT_FOUND);
  });
}

export async function deleteChat(input: {
  chatId: string;
}): Promise<ActionResult> {
  return runAction(chatIdSchema, input, async (userId, data) => {
    await db.chat.deleteMany({ where: { id: data.chatId, userId } });
    return ok(null);
  });
}

/** Generates a short title from the first exchange; keeps the current title on any failure. */
export async function generateChatTitle(input: {
  chatId: string;
}): Promise<ActionResult<{ title: string | null }>> {
  return runAction(chatIdSchema, input, async (userId, data) => {
    if (!isAiEnabled()) return ok({ title: null });
    const chat = await db.chat.findFirst({
      where: { id: data.chatId, userId, isCustomTitle: false },
      select: {
        messages: {
          orderBy: { createdAt: "asc" },
          take: 2,
          select: { role: true, content: true },
        },
      },
    });
    const userMessage = chat?.messages.find((m) => m.role === "USER");
    const assistantMessage = chat?.messages.find((m) => m.role === "ASSISTANT");
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
