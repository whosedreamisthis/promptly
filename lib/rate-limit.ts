import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const UPSTASH_TIMEOUT_MS = 2000;
export const RATE_LIMIT_MAX = 20;
export const RATE_LIMIT_WINDOW_MS = 60_000;
const SWEEP_THRESHOLD = 10_000;

const hits = new Map<string, number[]>();

function sweepExpired(now: number, windowMs: number) {
  for (const [key, times] of hits) {
    if (times.every((time) => now - time >= windowMs)) hits.delete(key);
  }
}

/**
 * Sliding-window limiter kept in memory, so it applies per server instance.
 * Records the call and returns true when `key` has already used `limit` calls in the window.
 */
export function isRateLimited(
  key: string,
  limit = RATE_LIMIT_MAX,
  windowMs = RATE_LIMIT_WINDOW_MS,
  now = Date.now(),
): boolean {
  if (hits.size > SWEEP_THRESHOLD) sweepExpired(now, windowMs);
  const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs);
  const limited = recent.length >= limit;
  if (!limited) recent.push(now);
  hits.set(key, recent);
  return limited;
}

export function resetRateLimits() {
  hits.clear();
}

const WINDOW_MS = { "1 m": 60_000, "1 d": 86_400_000 } as const;

export interface LimitSpec {
  limit: number;
  window: keyof typeof WINDOW_MS;
}

const upstashLimiters = new Map<string, Ratelimit>();

/** Shared limiter backed by Upstash Redis, or null when it is not configured. */
function getUpstashLimiter({ limit, window }: LimitSpec): Ratelimit | null {
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    return null;
  }
  const id = `${limit}:${window}`;
  let limiter = upstashLimiters.get(id);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(limit, window),
      prefix: `promptly:${id}`,
      timeout: UPSTASH_TIMEOUT_MS,
    });
    upstashLimiters.set(id, limiter);
  }
  return limiter;
}

/**
 * Records a call and returns true when `key` is over `spec`. Uses Upstash Redis so the
 * count is shared by every server instance; falls back to the in-memory limiter when
 * Upstash is not configured or unreachable. The per-instance fallback does not hold across
 * instances or cold starts, so two options make a limit strict:
 * - `failClosed`: an unreachable Upstash counts as limited.
 * - `requireRedis`: in production, Upstash not being configured counts as limited.
 */
export async function checkLimit(
  key: string,
  spec: LimitSpec,
  {
    failClosed = false,
    requireRedis = false,
  }: { failClosed?: boolean; requireRedis?: boolean } = {},
): Promise<boolean> {
  const fallback = () =>
    isRateLimited(`${spec.window}:${key}`, spec.limit, WINDOW_MS[spec.window]);
  const limiter = getUpstashLimiter(spec);
  if (!limiter) {
    return requireRedis && process.env.NODE_ENV === "production"
      ? true
      : fallback();
  }
  try {
    const { success } = await limiter.limit(key);
    return !success;
  } catch (error) {
    console.error(error);
    return failClosed ? true : fallback();
  }
}
