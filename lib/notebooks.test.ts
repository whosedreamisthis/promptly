import { describe, expect, it } from "vitest";
import { isUnnamedNotebook, NEW_NOTEBOOK_TITLE } from "@/lib/notebooks";

describe("isUnnamedNotebook", () => {
  it("is true for the default title with no chats", () => {
    expect(isUnnamedNotebook(NEW_NOTEBOOK_TITLE, 0)).toBe(true);
  });

  it("is false once the notebook has chats, even with the default title", () => {
    expect(isUnnamedNotebook(NEW_NOTEBOOK_TITLE, 1)).toBe(false);
  });

  it("is false for any custom title", () => {
    expect(isUnnamedNotebook("Frontend notes", 0)).toBe(false);
    expect(isUnnamedNotebook("untitled notebook", 0)).toBe(false);
  });
});
