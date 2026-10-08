import { z } from "zod";

export const MAX_MESSAGE_LENGTH = 10_000;

export const addMessageSchema = z.object({
  id: z.string().min(1).max(64),
  chatId: z.string().min(1).max(64),
  role: z.enum(["USER", "ASSISTANT"]),
  content: z.string().trim().min(1).max(MAX_MESSAGE_LENGTH),
});

/** Earlier turns a signed-out user sends along, since nothing is stored for them. */
export const MAX_GUEST_HISTORY = 29;

export const chatRequestSchema = z.object({
  chatId: z.string().min(1).max(64),
  messageId: z.string().min(1).max(64),
  text: z.string().trim().min(1).max(MAX_MESSAGE_LENGTH),
  history: z
    .array(
      z.object({
        role: z.enum(["USER", "ASSISTANT"]),
        content: z.string().min(1).max(MAX_MESSAGE_LENGTH),
      }),
    )
    .max(MAX_GUEST_HISTORY)
    .optional(),
});
