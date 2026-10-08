"use server";

import { fail, ok } from "@/lib/action-result";
import { db } from "@/lib/db";
import { runAction } from "@/lib/run-action";
import { addMessageSchema } from "@/lib/validations/messages";
import type { ActionResult } from "@/types/actions";

export async function addMessage(input: {
  id: string;
  chatId: string;
  role: "USER" | "ASSISTANT";
  content: string;
}): Promise<ActionResult> {
  return runAction(addMessageSchema, input, async (userId, data) => {
    const chat = await db.chat.findFirst({
      where: { id: data.chatId, userId },
      select: { id: true },
    });
    if (!chat) return fail("Chat not found");
    await db.message.create({ data });
    await db.chat.update({
      where: { id: chat.id },
      data: { updatedAt: new Date() },
    });
    return ok(null);
  });
}
