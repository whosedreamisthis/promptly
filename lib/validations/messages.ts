import { z } from "zod";

export const MAX_MESSAGE_LENGTH = 10_000;

export const addMessageSchema = z.object({
  id: z.string().min(1).max(64),
  chatId: z.string().min(1).max(64),
  role: z.enum(["USER", "ASSISTANT"]),
  content: z.string().trim().min(1).max(MAX_MESSAGE_LENGTH),
});
