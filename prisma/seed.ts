import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";
import { seedUser } from "../lib/seed-user";
import { TARGET_USER_ID } from "./seed-data";

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

async function main() {
  const connectionString = assertDevelopmentDatabase(process.env.DATABASE_URL);
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  try {
    const counts = await seedUser(db, TARGET_USER_ID);
    console.log(
      `Seeded ${counts.notebooks} notebooks, ${counts.chats} chats, ${counts.messages} messages`,
    );
  } finally {
    await db.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
