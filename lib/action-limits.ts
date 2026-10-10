import { checkLimit } from "@/lib/rate-limit";

const EXPORTS_PER_MINUTE = 10;
const PROMPT_CHANGES_PER_MINUTE = 30;

/** True when `userId` is exporting chats too fast; the request should be rejected with 429. */
export function isExportLimited(userId: string): Promise<boolean> {
  return checkLimit(`export:${userId}`, {
    limit: EXPORTS_PER_MINUTE,
    window: "1 m",
  });
}

/** True when `userId` is creating, editing or deleting prompts too fast. */
export function isPromptChangeLimited(userId: string): Promise<boolean> {
  return checkLimit(`prompts:${userId}`, {
    limit: PROMPT_CHANGES_PER_MINUTE,
    window: "1 m",
  });
}
