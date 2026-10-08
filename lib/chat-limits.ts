import { isAiEnabled } from "@/lib/ai";
import { checkLimit, type LimitSpec } from "@/lib/rate-limit";

export type ChatCaller = "guest" | "user";

const MINUTE_LIMITS: Record<ChatCaller, number> = { guest: 10, user: 20 };
const DEFAULT_DAILY_LIMIT = 10;
const DEFAULT_GLOBAL_DAILY_LIMIT = 500;

function positiveIntFromEnv(name: string, fallback: number): number {
  const configured = Number(process.env[name]);
  return Number.isInteger(configured) && configured > 0 ? configured : fallback;
}

/** Model-backed messages each person (guest or signed in) gets per day; set CHAT_DAILY_LIMIT=1 to test the limit. */
function dailyLimit(): LimitSpec {
  return {
    limit: positiveIntFromEnv("CHAT_DAILY_LIMIT", DEFAULT_DAILY_LIMIT),
    window: "1 d",
  };
}

/** Title generation is one extra model call per new chat, so it shares the daily cap. */
export function titleLimit(): LimitSpec {
  return dailyLimit();
}

/** True when `key` is sending too fast; the request should be rejected with 429. */
export function isBurstLimited(
  caller: ChatCaller,
  key: string,
): Promise<boolean> {
  return checkLimit(`chat:${caller}:${key}`, {
    limit: MINUTE_LIMITS[caller],
    window: "1 m",
  });
}

/** True once all callers together have used the day's model budget. */
export function isModelBudgetSpent(): Promise<boolean> {
  return checkLimit("model:global", {
    limit: positiveIntFromEnv(
      "GLOBAL_DAILY_MODEL_LIMIT",
      DEFAULT_GLOBAL_DAILY_LIMIT,
    ),
    window: "1 d",
  });
}

export type ReplySource = "model" | "mock" | "limit";

/**
 * Decides where a reply comes from: the model, the dev mock (USE_AI_MODEL=false), or the
 * sample reply once `key` reached its daily limit or the app reached its daily model budget.
 */
export async function chooseReplySource(
  caller: ChatCaller,
  key: string,
): Promise<ReplySource> {
  if (!isAiEnabled()) return "mock";
  if (await checkLimit(`chat:${caller}:${key}`, dailyLimit())) {
    return "limit";
  }
  return (await isModelBudgetSpent()) ? "limit" : "model";
}
