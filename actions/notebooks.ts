"use server";

import { fail, ok } from "@/lib/action-result";
import { db } from "@/lib/db";
import { hasErrorCode, UNIQUE_VIOLATION_CODE } from "@/lib/db-errors";
import { runAction } from "@/lib/run-action";
import {
  createNotebookSchema,
  notebookIdSchema,
  renameNotebookSchema,
  setNotebookPinnedSchema,
  type CreateNotebookInput,
  type NotebookIdInput,
  type RenameNotebookInput,
  type SetNotebookPinnedInput,
} from "@/lib/validations/chats";
import type { ActionResult } from "@/types/actions";

const NOTEBOOK_NOT_FOUND = "Notebook not found";

export async function createNotebook(
  input: CreateNotebookInput,
): Promise<ActionResult> {
  return runAction(createNotebookSchema, input, async (userId, data) => {
    try {
      await db.notebook.create({
        data: { id: data.id, userId, title: data.title },
      });
    } catch (error) {
      if (!hasErrorCode(error, UNIQUE_VIOLATION_CODE)) throw error;
      const existing = await db.notebook.findUnique({
        where: { id: data.id },
        select: { userId: true },
      });
      return existing?.userId === userId ? ok(null) : fail(NOTEBOOK_NOT_FOUND);
    }
    return ok(null);
  });
}

export async function renameNotebook(
  input: RenameNotebookInput,
): Promise<ActionResult> {
  return runAction(renameNotebookSchema, input, async (userId, data) => {
    const { count } = await db.notebook.updateMany({
      where: { id: data.notebookId, userId },
      data: { title: data.title },
    });
    return count ? ok(null) : fail(NOTEBOOK_NOT_FOUND);
  });
}

/** Sets the pinned flag to an explicit value, so repeated or concurrent calls cannot undo each other. */
export async function setNotebookPinned(
  input: SetNotebookPinnedInput,
): Promise<ActionResult> {
  return runAction(setNotebookPinnedSchema, input, async (userId, data) => {
    const { count } = await db.notebook.updateMany({
      where: { id: data.notebookId, userId },
      data: { pinned: data.pinned },
    });
    return count ? ok(null) : fail(NOTEBOOK_NOT_FOUND);
  });
}

/** Deleting a notebook keeps its chats (the relation sets notebookId to null). */
export async function deleteNotebook(
  input: NotebookIdInput,
): Promise<ActionResult> {
  return runAction(notebookIdSchema, input, async (userId, data) => {
    await db.notebook.deleteMany({ where: { id: data.notebookId, userId } });
    return ok(null);
  });
}
