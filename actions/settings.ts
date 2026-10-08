"use server";

import { z } from "zod";
import { ok } from "@/lib/action-result";
import { db } from "@/lib/db";
import { resolveModel, type FreeTierModelId } from "@/lib/models";
import { runAction } from "@/lib/run-action";
import { setModelSchema, type SetModelInput } from "@/lib/validations/settings";
import type { ActionResult } from "@/types/actions";

export async function getGeminiModel(): Promise<ActionResult<FreeTierModelId>> {
  return runAction(z.object({}), {}, async (userId) => {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { geminiModel: true },
    });
    return ok(resolveModel(user?.geminiModel));
  });
}

export async function setGeminiModel(
  input: SetModelInput,
): Promise<ActionResult> {
  return runAction(setModelSchema, input, async (userId, data) => {
    await db.user.update({
      where: { id: userId },
      data: { geminiModel: data.model },
    });
    return ok(null);
  });
}
