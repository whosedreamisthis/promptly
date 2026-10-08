import type { ActionResult } from "@/types/actions";

export const NOT_SIGNED_IN = "Sign in to save your chats";

export function ok<T>(data: T): ActionResult<T> {
  return { success: true, data, error: null };
}

export function fail<T = null>(error: string): ActionResult<T> {
  return { success: false, data: null, error };
}
