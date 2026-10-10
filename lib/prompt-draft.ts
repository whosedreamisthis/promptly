/** How long a chosen prompt waits for the chat box to open before it is dropped. */
export const DRAFT_MAX_AGE_MS = 10_000;

interface Draft {
  text: string;
  savedAt: number;
}

/** Holds one prompt on its way to the chat box. A prompt nobody picked up in time is forgotten. */
export function createDraftStore(now: () => number = Date.now) {
  let draft: Draft | null = null;

  return {
    set(text: string) {
      draft = { text, savedAt: now() };
    },
    get(): string | null {
      if (!draft || now() - draft.savedAt > DRAFT_MAX_AGE_MS) return null;
      return draft.text;
    },
    clear() {
      draft = null;
    },
  };
}
