"use server";

import { fail, ok } from "@/lib/action-result";
import { db } from "@/lib/db";
import { hasErrorCode, UNIQUE_VIOLATION_CODE } from "@/lib/db-errors";
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

export async function createPrompt(
  input: CreatePromptInput,
): Promise<ActionResult<Prompt>> {
  return runAction(createPromptSchema, input, async (userId, data) => {
    const count = await db.prompt.count({ where: { userId } });
    if (count >= MAX_PROMPTS_PER_USER) {
      return fail(`You can save up to ${MAX_PROMPTS_PER_USER} prompts`);
    }
    try {
      const prompt = await db.prompt.create({
        data: { ...data, userId },
        select: PROMPT_SELECT,
      });
      return ok(prompt as Prompt);
    } catch (error) {
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
    await db.prompt.deleteMany({ where: { id: data.promptId, userId } });
    return ok(null);
  });
}
