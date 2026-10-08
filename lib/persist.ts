import { toast } from "sonner";
import type { ActionResult } from "@/types/actions";

/** Awaits a server action; on failure shows its error and calls `rollback`. */
export async function persist<T>(
  action: Promise<ActionResult<T>>,
  rollback: () => void,
): Promise<boolean> {
  const result = await action;
  if (!result.success) {
    rollback();
    toast.error(result.error);
  }
  return result.success;
}
