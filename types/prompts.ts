import type { PromptCategory } from "@/lib/prompts";

export interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  category: PromptCategory;
}
