"use server";

import { isPromptChangeLimited } from "@/lib/action-limits";
import { fail, ok } from "@/lib/action-result";
import { db } from "@/lib/db";
import {
  hasErrorCode,
  UNIQUE_VIOLATION_CODE,
  WRITE_CONFLICT_CODE,
} from "@/lib/db-errors";
import { MAX_PROMPTS_PER_USER, PROMPT_SELECT } from "@/lib/prompts";
import { runAction } from "@/lib/run-action";
import {
  createPromptSchema,
  promptIdSchema,
  updatePromptSchema,
  type CreatePromptInput,
  type PromptIdInput,
  type UpdatePromptInput,
} from "@/lib/validations/prompts";
import type { ActionResult } from "@/types/actions";
import type { Prompt } from "@/types/prompts";

const PROMPT_NOT_FOUND = "Prompt not found";
const TOO_FAST = "Too many changes. Please slow down.";
const TRY_AGAIN = "Too many changes at once. Please try again.";

/** Counts and inserts in one serializable transaction, so simultaneous creates cannot pass the limit. */
function createWithinLimit(userId: string, data: CreatePromptInput) {
  return db.$transaction(
    async (tx) => {
      const count = await tx.prompt.count({ where: { userId } });
      if (count >= MAX_PROMPTS_PER_USER) return null;
      return tx.prompt.create({
        data: { ...data, userId },
        select: PROMPT_SELECT,
      });
    },
    { isolationLevel: "Serializable" },
  );
}

export async function createPrompt(
  input: CreatePromptInput,
): Promise<ActionResult<Prompt>> {
  return runAction(createPromptSchema, input, async (userId, data) => {
    if (await isPromptChangeLimited(userId)) return fail(TOO_FAST);
    try {
      const prompt = await createWithinLimit(userId, data);
      if (!prompt) {
        return fail(`You can save up to ${MAX_PROMPTS_PER_USER} prompts`);
      }
      return ok(prompt as Prompt);
    } catch (error) {
      if (hasErrorCode(error, WRITE_CONFLICT_CODE)) return fail(TRY_AGAIN);
      if (!hasErrorCode(error, UNIQUE_VIOLATION_CODE)) throw error;
      const existing = await db.prompt.findUnique({
        where: { id: data.id },
        select: { ...PROMPT_SELECT, userId: true },
      });
      if (!existing) return fail(PROMPT_NOT_FOUND);
      const { userId: ownerId, ...prompt } = existing;
      return ownerId === userId ? ok(prompt as Prompt) : fail(PROMPT_NOT_FOUND);
    }
  });
}

export async function updatePrompt(
  input: UpdatePromptInput,
): Promise<ActionResult> {
  return runAction(updatePromptSchema, input, async (userId, data) => {
    if (await isPromptChangeLimited(userId)) return fail(TOO_FAST);
    const { promptId, ...fields } = data;
    const { count } = await db.prompt.updateMany({
      where: { id: promptId, userId },
      data: fields,
    });
    return count ? ok(null) : fail(PROMPT_NOT_FOUND);
  });
}

export async function deletePrompt(
  input: PromptIdInput,
): Promise<ActionResult> {
  return runAction(promptIdSchema, input, async (userId, data) => {
    if (await isPromptChangeLimited(userId)) return fail(TOO_FAST);
    await db.prompt.deleteMany({ where: { id: data.promptId, userId } });
    return ok(null);
  });
}
