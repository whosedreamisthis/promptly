import { db } from "@/lib/db";
import { withDbRetry } from "@/lib/chats-data";
import { MAX_PROMPTS_PER_USER, PROMPT_SELECT } from "@/lib/prompts";
import type { Prompt } from "@/types/prompts";

/** The user's saved prompts, most recently changed first. */
export function getUserPrompts(userId: string): Promise<Prompt[]> {
  return withDbRetry(
    () =>
      db.prompt.findMany({
        where: { userId },
        select: PROMPT_SELECT,
        orderBy: { updatedAt: "desc" },
        take: MAX_PROMPTS_PER_USER,
      }) as Promise<Prompt[]>,
  );
}
