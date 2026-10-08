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
export const setChatPinnedSchema = z.object({ chatId: id, pinned: z.boolean() });
export const moveChatSchema = z.object({
  chatId: id,
  notebookId: id.nullable(),
});
export const createNotebookSchema = z.object({ id, title });
export const notebookIdSchema = z.object({ notebookId: id });
export const renameNotebookSchema = z.object({ notebookId: id, title });
export const setNotebookPinnedSchema = z.object({
  notebookId: id,
  pinned: z.boolean(),
});

export type CreateChatInput = z.infer<typeof createChatSchema>;
export type ChatIdInput = z.infer<typeof chatIdSchema>;
export type RenameChatInput = z.infer<typeof renameChatSchema>;
export type SetChatPinnedInput = z.infer<typeof setChatPinnedSchema>;
export type MoveChatInput = z.infer<typeof moveChatSchema>;
export type CreateNotebookInput = z.infer<typeof createNotebookSchema>;
export type NotebookIdInput = z.infer<typeof notebookIdSchema>;
export type RenameNotebookInput = z.infer<typeof renameNotebookSchema>;
export type SetNotebookPinnedInput = z.infer<typeof setNotebookPinnedSchema>;
