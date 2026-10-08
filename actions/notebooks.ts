"use server";

import { fail, ok } from "@/lib/action-result";
import { db } from "@/lib/db";
import { runAction } from "@/lib/run-action";
import {
  createNotebookSchema,
  notebookIdSchema,
  renameNotebookSchema,
} from "@/lib/validations/chats";
import type { ActionResult } from "@/types/actions";

const NOTEBOOK_NOT_FOUND = "Notebook not found";

export async function createNotebook(input: {
  id: string;
  title: string;
}): Promise<ActionResult> {
  return runAction(createNotebookSchema, input, async (userId, data) => {
    const existing = await db.notebook.findUnique({
      where: { id: data.id },
      select: { userId: true },
    });
    if (existing) {
      return existing.userId === userId ? ok(null) : fail(NOTEBOOK_NOT_FOUND);
    }
    await db.notebook.create({
      data: { id: data.id, userId, title: data.title },
    });
    return ok(null);
  });
}

export async function renameNotebook(input: {
  notebookId: string;
  title: string;
}): Promise<ActionResult> {
  return runAction(renameNotebookSchema, input, async (userId, data) => {
    const { count } = await db.notebook.updateMany({
      where: { id: data.notebookId, userId },
      data: { title: data.title },
    });
    return count ? ok(null) : fail(NOTEBOOK_NOT_FOUND);
  });
}

export async function togglePinNotebook(input: {
  notebookId: string;
}): Promise<ActionResult> {
  return runAction(notebookIdSchema, input, async (userId, data) => {
    const notebook = await db.notebook.findFirst({
      where: { id: data.notebookId, userId },
      select: { pinned: true },
    });
    if (!notebook) return fail(NOTEBOOK_NOT_FOUND);
    await db.notebook.update({
      where: { id: data.notebookId },
      data: { pinned: !notebook.pinned },
    });
    return ok(null);
  });
}

/** Deleting a notebook keeps its chats (the relation sets notebookId to null). */
export async function deleteNotebook(input: {
  notebookId: string;
}): Promise<ActionResult> {
  return runAction(notebookIdSchema, input, async (userId, data) => {
    await db.notebook.deleteMany({ where: { id: data.notebookId, userId } });
    return ok(null);
  });
}
