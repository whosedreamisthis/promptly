import { describe, expect, it } from "vitest";
import { filterPrompts, promptSummary } from "@/lib/prompts";

const prompts = [
  {
    title: "Code Reviewer",
    description: "Find bugs",
    content: "Review code",
    category: "Coding" as const,
  },
  {
    title: "Summarizer",
    description: "",
    content: "Summarize the SQL notes",
    category: "Writing" as const,
  },
];

describe("filterPrompts", () => {
  it("returns everything without a query or category", () => {
    expect(filterPrompts(prompts, "  ", null)).toEqual(prompts);
  });

  it("matches the title, description or content, ignoring case", () => {
    expect(filterPrompts(prompts, "REVIEWER", null)).toEqual([prompts[0]]);
    expect(filterPrompts(prompts, "bugs", null)).toEqual([prompts[0]]);
    expect(filterPrompts(prompts, "sql", null)).toEqual([prompts[1]]);
  });

  it("combines the category with the query", () => {
    expect(filterPrompts(prompts, "", "Writing")).toEqual([prompts[1]]);
    expect(filterPrompts(prompts, "bugs", "Writing")).toEqual([]);
  });
});

describe("promptSummary", () => {
  it("uses the description when there is one", () => {
    expect(promptSummary(prompts[0])).toBe("Find bugs");
  });

  it("falls back to the start of the content, cut at 120 characters", () => {
    const summary = promptSummary({
      description: "",
      content: "a".repeat(200),
    });

    expect(summary).toBe(`${"a".repeat(120)}...`);
  });

  it("keeps short content as it is", () => {
    expect(promptSummary(prompts[1])).toBe("Summarize the SQL notes");
  });
});
