import { db } from "@/lib/db";
import { hasErrorCode, UNIQUE_VIOLATION_CODE } from "@/lib/db-errors";
import { MAX_MESSAGE_LENGTH } from "@/lib/validations/messages";

interface ChatTurn {
  chatId: string;
  userMessageId: string;
  userText: string;
  userCreatedAt: Date;
  assistantMessageId: string;
  reply: string;
}

/**
 * Saves a user message together with its reply, so a failed or aborted reply
 * never leaves a dangling user message behind. Does nothing for an empty reply.
 */
export async function saveChatTurn(turn: ChatTurn): Promise<void> {
  const content = turn.reply.trim().slice(0, MAX_MESSAGE_LENGTH);
  if (!content) return;
  const replyCreatedAt = new Date(
    Math.max(Date.now(), turn.userCreatedAt.getTime() + 1),
  );
  try {
    await db.$transaction([
      db.message.create({
        data: {
          id: turn.userMessageId,
          chatId: turn.chatId,
          role: "USER",
          content: turn.userText,
          createdAt: turn.userCreatedAt,
        },
      }),
      db.message.create({
        data: {
          id: turn.assistantMessageId,
          chatId: turn.chatId,
          role: "ASSISTANT",
          content,
          createdAt: replyCreatedAt,
        },
      }),
      db.chat.update({
        where: { id: turn.chatId },
        data: { updatedAt: replyCreatedAt },
      }),
    ]);
  } catch (error) {
    // A concurrent request with the same messageId already saved this turn.
    if (!hasErrorCode(error, UNIQUE_VIOLATION_CODE)) console.error(error);
  }
}
