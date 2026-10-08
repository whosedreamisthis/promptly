import { z } from "zod";
import { idSchema } from "@/lib/validations/common";

export const MAX_MESSAGE_LENGTH = 10_000;

const messageText = z.string().trim().min(1).max(MAX_MESSAGE_LENGTH);
const role = z.enum(["USER", "ASSISTANT"]);

export const addMessageSchema = z.object({
  id: idSchema,
  chatId: idSchema,
  role,
  content: messageText,
});

/** Earlier turns a signed-out user sends along, since nothing is stored for them. */
export const MAX_GUEST_HISTORY = 10;
/** Signed-out users get shorter messages than signed-in users. */
export const MAX_GUEST_MESSAGE_LENGTH = 2000;
/** After this many messages the notice above the chat box urges guests to sign in. */
export const GUEST_SIGN_IN_PROMPT_AFTER = 5;

/**
 * The last `MAX_GUEST_HISTORY` turns with each one cut to the guest message length, so a
 * guest can't push more text to the model than a signed-in user's message would allow.
 */
export function capGuestHistory<T extends { content: string }>(
  history: T[],
): T[] {
  return history.slice(-MAX_GUEST_HISTORY).map((message) => ({
    ...message,
    content: message.content.slice(0, MAX_GUEST_MESSAGE_LENGTH),
  }));
}

export const chatRequestSchema = z.object({
  chatId: idSchema,
  messageId: idSchema,
  text: messageText,
  history: z
    .array(
      z.object({
        role,
        content: z.string().min(1).max(MAX_MESSAGE_LENGTH),
      }),
    )
    .max(MAX_GUEST_HISTORY)
    .optional(),
});
