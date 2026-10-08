import { clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import {
  DEMO_EMAIL_DOMAIN,
  getClientIp,
  isDemoCapacityFull,
  isDemoGloballyLimited,
  isDemoIpLimited,
} from "@/lib/demo-limits";
import { seedUser } from "@/lib/seed-user";

const SIGN_IN_TOKEN_SECONDS = 60;
const GENERIC_ERROR = "The demo could not start. Please try again.";

function fail(error: string, status: number) {
  return Response.json({ success: false, data: null, error }, { status });
}

/** Returns an error response when this request may not start a demo, otherwise null. */
async function checkDemoLimits(request: Request): Promise<Response | null> {
  if (await isDemoIpLimited(getClientIp(request))) {
    return fail(
      "You've already started the demo a few times today. Please try again tomorrow.",
      429,
    );
  }
  if (await isDemoGloballyLimited()) {
    return fail(
      "The demo has reached its daily limit. Please try again tomorrow.",
      429,
    );
  }
  return null;
}

/** Creates an isolated, freshly seeded demo user and returns a one-time sign-in token for it. */
export async function POST(request: Request) {
  const limited = await checkDemoLimits(request);
  if (limited) return limited;

  try {
    const clerk = await clerkClient();
    const live = await clerk.users.getCount({ query: DEMO_EMAIL_DOMAIN });
    if (isDemoCapacityFull(live)) {
      return fail("The demo is busy right now. Please try again later.", 503);
    }

    const user = await clerk.users.createUser({
      emailAddress: [`demo-${crypto.randomUUID()}@${DEMO_EMAIL_DOMAIN}`],
      firstName: "Demo",
      lastName: "Recruiter",
      publicMetadata: { demo: true },
      skipPasswordRequirement: true,
    });

    try {
      await seedUser(db, user.id);
      const { token } = await clerk.signInTokens.createSignInToken({
        userId: user.id,
        expiresInSeconds: SIGN_IN_TOKEN_SECONDS,
      });
      return Response.json({ success: true, data: { token }, error: null });
    } catch (error) {
      await clerk.users.deleteUser(user.id).catch(console.error);
      throw error;
    }
  } catch (error) {
    console.error(error);
    return fail(GENERIC_ERROR, 500);
  }
}
