import { positiveIntFromEnv } from "@/lib/env";
import { checkLimit } from "@/lib/rate-limit";

const DEFAULT_LIMIT_PER_IP = 3;
const DEFAULT_LIMIT_GLOBAL = 30;
const DEFAULT_TTL_HOURS = 12;
/** Demo users get an email on this domain, which is how they are counted and told apart. */
export const DEMO_EMAIL_DOMAIN = "promptly-demo.example.com";
/** Clerk's development instance allows 500 users, so demos stop well before that. */
export const MAX_LIVE_DEMO_USERS = 150;

const HOUR_MS = 3_600_000;

/** Each demo creates a Clerk user, so these limits must hold: strict when Redis is down or missing in production. */
const DEMO_LIMIT_OPTIONS = { failClosed: true, requireRedis: true } as const;

/**
 * The caller's address from a header the hosting platform sets (clients can't forge it),
 * or "unknown" when there is none. `x-forwarded-for` is deliberately not used: its first
 * entry is whatever the client sent.
 */
export function getClientIp(request: Request): string {
  const ip =
    request.headers.get("x-real-ip") ??
    request.headers.get("x-vercel-forwarded-for")?.split(",")[0];
  return ip?.trim() || "unknown";
}

/** True when this address already started its daily share of demos (`DEMO_LIMIT_PER_IP`). */
export function isDemoIpLimited(ip: string): Promise<boolean> {
  return checkLimit(
    `demo:ip:${ip}`,
    {
      limit: positiveIntFromEnv("DEMO_LIMIT_PER_IP", DEFAULT_LIMIT_PER_IP),
      window: "1 d",
    },
    DEMO_LIMIT_OPTIONS,
  );
}

/** True once everyone together started the day's demos (`DEMO_LIMIT_GLOBAL`). */
export function isDemoGloballyLimited(): Promise<boolean> {
  return checkLimit(
    "demo:global",
    {
      limit: positiveIntFromEnv("DEMO_LIMIT_GLOBAL", DEFAULT_LIMIT_GLOBAL),
      window: "1 d",
    },
    DEMO_LIMIT_OPTIONS,
  );
}

/** How long a demo user lives before cleanup may delete it (`DEMO_USER_TTL_HOURS`). */
export function demoTtlMs(): number {
  return positiveIntFromEnv("DEMO_USER_TTL_HOURS", DEFAULT_TTL_HOURS) * HOUR_MS;
}

/** True when so many demo users exist that no new one should be created. */
export function isDemoCapacityFull(liveDemoUsers: number): boolean {
  return liveDemoUsers >= MAX_LIVE_DEMO_USERS;
}
