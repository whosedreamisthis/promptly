import { describe, expect, it } from "vitest";
import { PROMPT_CATEGORIES } from "@/lib/prompts";
import { STARTER_PROMPTS } from "@/lib/starter-prompts";
import { promptFieldsSchema } from "@/lib/validations/prompts";

describe("STARTER_PROMPTS", () => {
  it("has 12 prompts with unique ids", () => {
    const ids = STARTER_PROMPTS.map((prompt) => prompt.id);

    expect(STARTER_PROMPTS).toHaveLength(12);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("passes the same validation as user prompts", () => {
    for (const prompt of STARTER_PROMPTS) {
      expect(promptFieldsSchema.safeParse(prompt).success, prompt.title).toBe(
        true,
      );
    }
  });

  it("uses every category at least once", () => {
    const used = new Set(STARTER_PROMPTS.map((prompt) => prompt.category));

    expect(
      [...PROMPT_CATEGORIES].filter((category) => !used.has(category)),
    ).toEqual([]);
  });
});
