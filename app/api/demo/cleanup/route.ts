import { timingSafeEqual } from "node:crypto";
import { clerkClient, type User } from "@clerk/nextjs/server";
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

/** Only users flagged as demo whose every email is on the demo domain; Clerk's query is a fuzzy match. */
function isDemoUser(user: User): boolean {
  const { emailAddresses } = user;
  return (
    user.publicMetadata.demo === true &&
    emailAddresses.length > 0 &&
    emailAddresses.every((email) =>
      email.emailAddress.endsWith(`@${DEMO_EMAIL_DOMAIN}`),
    )
  );
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
    let failed = 0;
    // Users that stay in the list (not demo users, or failed deletions) are skipped on the next page.
    let offset = 0;

    for (let page = 0; page < MAX_PAGES; page++) {
      const { data: users } = await clerk.users.getUserList({
        query: DEMO_EMAIL_DOMAIN,
        createdAtBefore,
        orderBy: "+created_at",
        limit: PAGE_SIZE,
        offset,
      });
      const demoIds = users.filter(isDemoUser).map((user) => user.id);
      let removed = 0;

      if (demoIds.length > 0) {
        // Database rows first: if Clerk fails below, the next run finds the user again.
        await db.user.deleteMany({ where: { id: { in: demoIds } } });
        const results = await Promise.allSettled(
          demoIds.map((id) => clerk.users.deleteUser(id)),
        );
        for (const result of results) {
          if (result.status === "rejected") console.error(result.reason);
        }
        removed = results.filter((r) => r.status === "fulfilled").length;
        failed += demoIds.length - removed;
      }

      deleted += removed;
      const lastPage = users.length < PAGE_SIZE;
      const stuck = demoIds.length > 0 && removed === 0;
      if (lastPage || stuck) break;
      offset += users.length - removed;
    }

    return Response.json(
      { success: failed === 0, deleted, failed },
      { status: failed === 0 ? 200 : 500 },
    );
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
