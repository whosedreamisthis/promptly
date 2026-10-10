import { describe, expect, it } from "vitest";
import { createDraftStore, DRAFT_MAX_AGE_MS } from "@/lib/prompt-draft";

describe("createDraftStore", () => {
  it("returns the stored prompt until it is cleared", () => {
    const store = createDraftStore(() => 0);

    store.set("Review this code");

    expect(store.get()).toBe("Review this code");
    expect(store.get()).toBe("Review this code");
    store.clear();
    expect(store.get()).toBeNull();
  });

  it("forgets a prompt nobody picked up in time", () => {
    let time = 0;
    const store = createDraftStore(() => time);

    store.set("Review this code");
    time = DRAFT_MAX_AGE_MS + 1;

    expect(store.get()).toBeNull();
  });

  it("still returns a prompt right at the limit", () => {
    let time = 0;
    const store = createDraftStore(() => time);

    store.set("Review this code");
    time = DRAFT_MAX_AGE_MS;

    expect(store.get()).toBe("Review this code");
  });
});
