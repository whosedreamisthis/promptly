import { describe, expect, it } from "vitest";
import {
  createPromptSchema,
  updatePromptSchema,
} from "@/lib/validations/prompts";

const valid = {
  id: "p1",
  title: "Code Reviewer",
  content: "Review this code.",
  category: "Coding",
};

describe("createPromptSchema", () => {
  it("accepts a prompt and defaults the description to empty", () => {
    const result = createPromptSchema.parse(valid);

    expect(result.description).toBe("");
  });

  it("trims the title and content", () => {
    const result = createPromptSchema.parse({
      ...valid,
      title: "  Title  ",
      content: "  Text  ",
    });

    expect(result).toMatchObject({ title: "Title", content: "Text" });
  });

  it.each([
    ["an empty title", { title: "   " }],
    ["a title over 60 characters", { title: "a".repeat(61) }],
    ["a description over 120 characters", { description: "a".repeat(121) }],
    ["empty content", { content: "" }],
    ["content over 10,000 characters", { content: "a".repeat(10_001) }],
    ["an unknown category", { category: "Cooking" }],
    ["an empty id", { id: "" }],
  ])("rejects %s", (_name, change) => {
    expect(createPromptSchema.safeParse({ ...valid, ...change }).success).toBe(
      false,
    );
  });

  it("accepts the maximum lengths", () => {
    const result = createPromptSchema.safeParse({
      ...valid,
      title: "a".repeat(60),
      description: "a".repeat(120),
      content: "a".repeat(10_000),
    });

    expect(result.success).toBe(true);
  });
});

describe("updatePromptSchema", () => {
  it("requires a prompt id", () => {
    const fields = {
      title: valid.title,
      content: valid.content,
      category: valid.category,
    };

    expect(updatePromptSchema.safeParse(fields).success).toBe(false);
    expect(
      updatePromptSchema.safeParse({ ...fields, promptId: "p1" }).success,
    ).toBe(true);
  });
});
