import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

/** Returns the signed-in Clerk user id, creating the matching User row on first use. */
export async function ensureUser(): Promise<string | null> {
  const { userId } = await auth();
  if (!userId) return null;
  await db.user.upsert({
    where: { id: userId },
    create: { id: userId },
    update: {},
  });
  return userId;
}
