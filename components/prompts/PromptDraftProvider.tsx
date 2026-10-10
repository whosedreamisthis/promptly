"use client";

import { createContext, useContext, useMemo } from "react";
import { createDraftStore } from "@/lib/prompt-draft";

interface PromptDraftApi {
  /** Stores a prompt for the next chat input that opens. */
  setDraft: (text: string) => void;
  /** Returns the stored prompt without removing it, so it is safe to call while rendering. */
  getDraft: () => string | null;
  /** Forgets the stored prompt. */
  clearDraft: () => void;
}

const PromptDraftContext = createContext<PromptDraftApi | null>(null);

/** Carries a prompt from the prompts page to the chat box. Held in memory because prompts can be long. */
export function PromptDraftProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const api = useMemo<PromptDraftApi>(() => {
    const store = createDraftStore();
    return {
      setDraft: store.set,
      getDraft: store.get,
      clearDraft: store.clear,
    };
  }, []);
  return (
    <PromptDraftContext.Provider value={api}>
      {children}
    </PromptDraftContext.Provider>
  );
}

export function usePromptDraft(): PromptDraftApi {
  const value = useContext(PromptDraftContext);
  if (!value) {
    throw new Error("usePromptDraft must be used inside PromptDraftProvider");
  }
  return value;
}
