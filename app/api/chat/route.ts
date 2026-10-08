import { createTextStreamResponse, streamText, toTextStream } from "ai";
import { db } from "@/lib/db";
import {
  getModel,
  HISTORY_LIMIT,
  type HistoryMessage,
  isAiEnabled,
  mockReplyStream,
  MAX_OUTPUT_TOKENS,
  SYSTEM_PROMPT,
  toModelMessages,
} from "@/lib/ai";
import { isRateLimited } from "@/lib/rate-limit";
import { ensureUser } from "@/lib/session";
import {
  chatRequestSchema,
  MAX_MESSAGE_LENGTH,
} from "@/lib/validations/messages";

export const maxDuration = 60;

const GENERIC_ERROR = "Something went wrong. Please try again.";
/** Generous cap for a message plus the history a signed-out user sends, with ids and JSON overhead. */
const MAX_BODY_BYTES = 400_000;

function errorResponse(error: string, status: number) {
  return Response.json({ error }, { status });
}

/** Replies to a signed-out user: nothing is read from or saved to the database. */
function guestReply(
  request: Request,
  text: string,
  history: HistoryMessage[],
) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (isRateLimited(`chat:guest:${ip ?? "unknown"}`)) {
    return errorResponse("Too many messages. Please slow down.", 429);
  }
  const headers = { "X-Message-Id": crypto.randomUUID() };
  if (!isAiEnabled()) {
    return createTextStreamResponse({
      headers,
      stream: mockReplyStream(request.signal, async () => {}),
    });
  }
  const result = streamText({
    model: getModel(),
    instructions: SYSTEM_PROMPT,
    messages: toModelMessages([...history, { role: "USER", content: text }]),
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    abortSignal: request.signal,
  });
  return createTextStreamResponse({
    headers,
    stream: toTextStream({ stream: result.stream }),
  });
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return errorResponse("Message too large", 413);
  }
  const parsed = chatRequestSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) return errorResponse("Invalid input", 400);
  const { chatId, messageId, text, history: guestHistory } = parsed.data;

  try {
    const userId = await ensureUser();
    if (!userId) return guestReply(request, text, guestHistory ?? []);
    if (isRateLimited(`chat:${userId}`)) {
      return errorResponse("Too many messages. Please slow down.", 429);
    }

    const chat = await db.chat.findFirst({
      where: { id: chatId, userId },
      select: { id: true },
    });
    if (!chat) return errorResponse("Chat not found", 404);

    const duplicate = await db.message.findUnique({
      where: { id: messageId },
      select: { id: true },
    });
    if (duplicate) return errorResponse("Message already sent", 409);

    const userCreatedAt = new Date();
    const previous = await db.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "desc" },
      take: HISTORY_LIMIT - 1,
      select: { role: true, content: true },
    });
    const history = [
      ...previous.reverse(),
      { role: "USER" as const, content: text },
    ];

    const assistantId = crypto.randomUUID();
    // The user message is saved together with its reply, so a failed or aborted
    // reply never leaves a dangling user message behind.
    const saveReply = async (reply: string) => {
      const content = reply.trim().slice(0, MAX_MESSAGE_LENGTH);
      if (!content) return;
      const replyCreatedAt = new Date(
        Math.max(Date.now(), userCreatedAt.getTime() + 1),
      );
      try {
        await db.$transaction([
          db.message.create({
            data: {
              id: messageId,
              chatId,
              role: "USER",
              content: text,
              createdAt: userCreatedAt,
            },
          }),
          db.message.create({
            data: {
              id: assistantId,
              chatId,
              role: "ASSISTANT",
              content,
              createdAt: replyCreatedAt,
            },
          }),
          db.chat.update({
            where: { id: chatId },
            data: { updatedAt: replyCreatedAt },
          }),
        ]);
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
      messages: toModelMessages(history),
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
