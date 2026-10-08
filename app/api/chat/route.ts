import { createTextStreamResponse, streamText, toTextStream } from "ai";
import { db } from "@/lib/db";
import {
  getModel,
  HISTORY_LIMIT,
  isAiEnabled,
  mockReplyStream,
  MAX_OUTPUT_TOKENS,
  SYSTEM_PROMPT,
  toModelMessages,
} from "@/lib/ai";
import { ensureUser } from "@/lib/session";
import {
  chatRequestSchema,
  MAX_MESSAGE_LENGTH,
} from "@/lib/validations/messages";

export const maxDuration = 60;

const GENERIC_ERROR = "Something went wrong. Please try again.";

function errorResponse(error: string, status: number) {
  return Response.json({ error }, { status });
}

export async function POST(request: Request) {
  const parsed = chatRequestSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) return errorResponse("Invalid input", 400);
  const { chatId, messageId, text } = parsed.data;

  try {
    const userId = await ensureUser();
    if (!userId) return errorResponse("Sign in to chat", 401);

    const chat = await db.chat.findFirst({
      where: { id: chatId, userId },
      select: { id: true },
    });
    if (!chat) return errorResponse("Chat not found", 404);

    await db.message.create({
      data: { id: messageId, chatId, role: "USER", content: text },
    });
    const history = await db.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "desc" },
      take: HISTORY_LIMIT,
      select: { role: true, content: true },
    });

    const assistantId = crypto.randomUUID();
    const saveReply = async (reply: string) => {
      const content = reply.trim().slice(0, MAX_MESSAGE_LENGTH);
      if (!content) return;
      try {
        await db.message.create({
          data: { id: assistantId, chatId, role: "ASSISTANT", content },
        });
        await db.chat.update({
          where: { id: chatId },
          data: { updatedAt: new Date() },
        });
      } catch (error) {
        console.error(error);
      }
    };

    if (!isAiEnabled()) {
      return createTextStreamResponse({
        headers: { "X-Message-Id": assistantId },
        stream: mockReplyStream(request.signal, saveReply),
      });
    }

    const result = streamText({
      model: getModel(),
      instructions: SYSTEM_PROMPT,
      messages: toModelMessages(history.reverse()),
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      abortSignal: request.signal,
      onEnd: ({ text: reply }) => saveReply(reply),
    });

    return createTextStreamResponse({
      headers: { "X-Message-Id": assistantId },
      stream: toTextStream({ stream: result.stream }),
    });
  } catch (error) {
    console.error(error);
    return errorResponse(GENERIC_ERROR, 500);
  }
}
