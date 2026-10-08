import { z } from "zod";

const id = z.string().min(1).max(64);
const title = z.string().trim().min(1).max(200);

export const createChatSchema = z.object({
  id,
  title: title.optional(),
  notebookId: id.nullable().optional(),
});
export const chatIdSchema = z.object({ chatId: id });
export const renameChatSchema = z.object({ chatId: id, title });
export const moveChatSchema = z.object({
  chatId: id,
  notebookId: id.nullable(),
});
export const createNotebookSchema = z.object({ id, title });
export const notebookIdSchema = z.object({ notebookId: id });
export const renameNotebookSchema = z.object({ notebookId: id, title });
