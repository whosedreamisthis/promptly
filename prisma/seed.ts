import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";
import { addMessageSchema } from "../lib/validations/messages";
import { CHATS, NOTEBOOKS, TARGET_USER_ID } from "./seed-data";

const MINUTE_MS = 60_000;

function assertDevelopmentDatabase(
  connectionString: string | undefined,
): string {
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  const host = new URL(connectionString).hostname;
  console.log(`Seeding database host: ${host}`);
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to seed with NODE_ENV=production");
  }
  if (host !== process.env.SEED_ALLOWED_HOST) {
    throw new Error("Database host does not match SEED_ALLOWED_HOST");
  }
  return connectionString;
}

function buildMessages() {
  return CHATS.flatMap((chat) => {
    const start =
      new Date(chat.updatedAt).getTime() - chat.messages.length * MINUTE_MS;
    return chat.messages.map((content, index) => {
      const message = addMessageSchema.parse({
        id: `${chat.id}_m${index + 1}`,
        chatId: chat.id,
        role: index % 2 === 0 ? "USER" : "ASSISTANT",
        content,
      });
      return {
        ...message,
        createdAt: new Date(start + (index + 1) * MINUTE_MS),
      };
    });
  });
}

async function main() {
  const connectionString = assertDevelopmentDatabase(process.env.DATABASE_URL);
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  const messages = buildMessages();

  try {
    await db.$transaction(async (tx) => {
      await tx.user.upsert({
        where: { id: TARGET_USER_ID },
        create: { id: TARGET_USER_ID },
        update: {},
      });
      await tx.chat.deleteMany({ where: { userId: TARGET_USER_ID } });
      await tx.notebook.deleteMany({ where: { userId: TARGET_USER_ID } });
      await tx.notebook.createMany({
        data: NOTEBOOKS.map((notebook) => ({
          ...notebook,
          userId: TARGET_USER_ID,
          createdAt: new Date(notebook.updatedAt),
          updatedAt: new Date(notebook.updatedAt),
        })),
      });
      await tx.chat.createMany({
        data: CHATS.map(({ messages: chatMessages, updatedAt, ...chat }) => ({
          ...chat,
          userId: TARGET_USER_ID,
          isCustomTitle: true,
          createdAt: new Date(
            new Date(updatedAt).getTime() - chatMessages.length * MINUTE_MS,
          ),
          updatedAt: new Date(updatedAt),
        })),
      });
      await tx.message.createMany({ data: messages });
    });
    console.log(
      `Seeded ${NOTEBOOKS.length} notebooks, ${CHATS.length} chats, ${messages.length} messages`,
    );
  } finally {
    await db.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
