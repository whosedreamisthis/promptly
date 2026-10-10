import { auth } from "@clerk/nextjs/server";
import { isExportLimited } from "@/lib/action-limits";
import {
  buildChatMarkdown,
  exportFileName,
  MAX_EXPORT_MESSAGES,
} from "@/lib/chat-export";
import { db } from "@/lib/db";
import { idSchema } from "@/lib/validations/common";

function errorResponse(error: string, status: number) {
  return Response.json({ error }, { status });
}

/** Downloads a chat as a Markdown file. Only its owner can export it. */
export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/chats/[chatId]/export">,
) {
  const parsed = idSchema.safeParse((await params).chatId);
  if (!parsed.success) return errorResponse("Invalid input", 400);

  try {
    const { userId } = await auth();
    if (!userId) return errorResponse("Sign in to export your chats", 401);
    if (await isExportLimited(userId)) {
      return errorResponse("Too many exports. Please slow down.", 429);
    }

    const chat = await db.chat.findFirst({
      where: { id: parsed.data, userId },
      select: {
        title: true,
        messages: {
          orderBy: { createdAt: "asc" },
          take: MAX_EXPORT_MESSAGES,
          select: { role: true, content: true },
        },
      },
    });
    if (!chat) return errorResponse("Chat not found", 404);

    return new Response(
      buildChatMarkdown(chat.title, chat.messages, new Date()),
      {
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Content-Disposition": `attachment; filename="${exportFileName(chat.title)}"`,
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  } catch (error) {
    console.error(error);
    return errorResponse("Something went wrong. Please try again.", 500);
  }
}
