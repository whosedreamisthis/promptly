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
