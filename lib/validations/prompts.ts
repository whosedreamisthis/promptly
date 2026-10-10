import { z } from "zod";
import {
  MAX_PROMPT_DESCRIPTION_LENGTH,
  MAX_PROMPT_TITLE_LENGTH,
  PROMPT_CATEGORIES,
} from "@/lib/prompts";
import { idSchema as id } from "@/lib/validations/common";
import { MAX_MESSAGE_LENGTH } from "@/lib/validations/messages";

const promptFields = {
  title: z.string().trim().min(1).max(MAX_PROMPT_TITLE_LENGTH),
  description: z.string().trim().max(MAX_PROMPT_DESCRIPTION_LENGTH).default(""),
  content: z.string().trim().min(1).max(MAX_MESSAGE_LENGTH),
  category: z.enum(PROMPT_CATEGORIES),
};

export const promptFieldsSchema = z.object(promptFields);
export const createPromptSchema = z.object({ id, ...promptFields });
export const updatePromptSchema = z.object({ promptId: id, ...promptFields });
export const promptIdSchema = z.object({ promptId: id });

export type CreatePromptInput = z.input<typeof createPromptSchema>;
export type UpdatePromptInput = z.input<typeof updatePromptSchema>;
export type PromptIdInput = z.infer<typeof promptIdSchema>;
