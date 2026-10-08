import { timingSafeEqual } from "node:crypto";
import { clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { DEMO_EMAIL_DOMAIN, demoTtlMs } from "@/lib/demo-limits";

const PAGE_SIZE = 100;
/** Bounds one run to 500 users so it finishes well inside the function time limit. */
const MAX_PAGES = 5;

export const maxDuration = 60;

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/** Deletes demo users older than the TTL from the database and Clerk; called daily by Vercel Cron. */
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const clerk = await clerkClient();
    const createdAtBefore = Date.now() - demoTtlMs();
    let deleted = 0;

    for (let page = 0; page < MAX_PAGES; page++) {
      const { data: users } = await clerk.users.getUserList({
        query: DEMO_EMAIL_DOMAIN,
        createdAtBefore,
        orderBy: "+created_at",
        limit: PAGE_SIZE,
      });
      const demoIds = users
        .filter((user) => user.publicMetadata.demo === true)
        .map((user) => user.id);
      if (demoIds.length === 0) break;

      // Database rows first: if Clerk fails below, the next run finds the user again.
      await db.user.deleteMany({ where: { id: { in: demoIds } } });
      const results = await Promise.allSettled(
        demoIds.map((id) => clerk.users.deleteUser(id)),
      );
      const removed = results.filter((r) => r.status === "fulfilled").length;
      deleted += removed;
      if (removed === 0) break;
    }

    return Response.json({ success: true, deleted });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
