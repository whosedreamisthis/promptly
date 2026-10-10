"use client";

import { createContext, useContext, useMemo, useRef } from "react";

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
  const draftRef = useRef<string | null>(null);
  const api = useMemo<PromptDraftApi>(
    () => ({
      setDraft: (text) => {
        draftRef.current = text;
      },
      getDraft: () => draftRef.current,
      clearDraft: () => {
        draftRef.current = null;
      },
    }),
    [],
  );
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
