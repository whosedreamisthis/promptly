export const PROMPT_CATEGORIES = [
  "Coding",
  "Writing",
  "Productivity",
  "Learning",
  "Everyday",
] as const;

export type PromptCategory = (typeof PROMPT_CATEGORIES)[number];

export const MAX_PROMPT_TITLE_LENGTH = 60;
export const MAX_PROMPT_DESCRIPTION_LENGTH = 120;
export const MAX_PROMPTS_PER_USER = 100;

const SUMMARY_LENGTH = MAX_PROMPT_DESCRIPTION_LENGTH;

interface SearchablePrompt {
  title: string;
  description: string;
  content: string;
  category: PromptCategory;
}

/** Prompts matching the search text (title, description or content) and the category, if one is chosen. */
export function filterPrompts<T extends SearchablePrompt>(
  prompts: T[],
  query: string,
  category: PromptCategory | null,
): T[] {
  const needle = query.trim().toLowerCase();
  return prompts.filter(
    (prompt) =>
      (!category || prompt.category === category) &&
      (!needle ||
        [prompt.title, prompt.description, prompt.content].some((text) =>
          text.toLowerCase().includes(needle),
        )),
  );
}

/** The description, or the start of the content when there is none. */
export function promptSummary({
  description,
  content,
}: Pick<SearchablePrompt, "description" | "content">): string {
  if (description) return description;
  return content.length > SUMMARY_LENGTH
    ? `${content.slice(0, SUMMARY_LENGTH).trimEnd()}...`
    : content;
}

export const PROMPT_SELECT = {
  id: true,
  title: true,
  description: true,
  content: true,
  category: true,
} as const;
