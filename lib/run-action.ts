import type { z } from "zod";
import { fail, NOT_SIGNED_IN } from "@/lib/action-result";
import { ensureUser } from "@/lib/session";
import type { ActionResult } from "@/types/actions";

/** Authenticates, validates input with Zod and wraps the handler in try/catch. */
export async function runAction<S extends z.ZodType, T>(
  schema: S,
  input: unknown,
  handler: (userId: string, data: z.infer<S>) => Promise<ActionResult<T>>,
): Promise<ActionResult<T>> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return fail("Invalid input");
  try {
    const userId = await ensureUser();
    if (!userId) return fail(NOT_SIGNED_IN);
    return await handler(userId, parsed.data);
  } catch (error) {
    console.error(error);
    return fail("Something went wrong. Please try again.");
  }
}
