import { createTextStreamResponse, streamText, toTextStream } from "ai";
import { db } from "@/lib/db";
import {
  getModel,
  HISTORY_LIMIT,
  type HistoryMessage,
  LIMIT_REPLY,
  mockReplyStream,
  MAX_OUTPUT_TOKENS,
  MOCK_REPLY,
  SYSTEM_PROMPT,
  toModelMessages,
} from "@/lib/ai";
import {
  chooseReplySource,
  isBurstLimited,
  type ReplySource,
} from "@/lib/chat-limits";
import { ensureUser } from "@/lib/session";
import {
  chatRequestSchema,
  MAX_GUEST_HISTORY,
  MAX_GUEST_MESSAGE_LENGTH,
  MAX_MESSAGE_LENGTH,
} from "@/lib/validations/messages";

export const maxDuration = 60;

const GENERIC_ERROR = "Something went wrong. Please try again.";
/** Generous cap for a message plus the history a signed-out user sends, with ids and JSON overhead. */
const MAX_BODY_BYTES = 150_000;

function errorResponse(error: string, status: number) {
  return Response.json({ error }, { status });
}

function tooFastResponse() {
  return errorResponse("Too many messages. Please slow down.", 429);
}

/** The reply streamed when the model is not used. */
function canned(source: Exclude<ReplySource, "model">) {
  return source === "limit" ? LIMIT_REPLY : MOCK_REPLY;
}

/** Replies to a signed-out user: nothing is read from or saved to the database. */
async function guestReply(
  request: Request,
  text: string,
  history: HistoryMessage[],
) {
  if (text.length > MAX_GUEST_MESSAGE_LENGTH) {
    return errorResponse(
      `Messages are limited to ${MAX_GUEST_MESSAGE_LENGTH} characters unless you sign in.`,
      400,
    );
  }
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const key = ip ?? "unknown";
  if (await isBurstLimited("guest", key)) return tooFastResponse();
  const headers = { "X-Message-Id": crypto.randomUUID() };
  const source = await chooseReplySource("guest", key);
  if (source !== "model") {
    return createTextStreamResponse({
      headers,
      stream: mockReplyStream(request.signal, async () => {}, canned(source)),
    });
  }
  const result = streamText({
    model: getModel(),
    instructions: SYSTEM_PROMPT,
    messages: toModelMessages([
      ...history.slice(-MAX_GUEST_HISTORY),
      { role: "USER", content: text },
    ]),
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
    if (await isBurstLimited("user", userId)) return tooFastResponse();

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

    const source = await chooseReplySource("user", userId);
    if (source !== "model") {
      return createTextStreamResponse({
        headers: { "X-Message-Id": assistantId },
        stream: mockReplyStream(request.signal, saveReply, canned(source)),
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
