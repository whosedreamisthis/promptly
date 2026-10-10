"use client";

import { useState } from "react";
import { createPrompt, deletePrompt, updatePrompt } from "@/actions/prompts";
import { persist } from "@/lib/persist";
import { MAX_PROMPT_TITLE_LENGTH } from "@/lib/prompts";
import { useLatest } from "@/lib/use-latest";
import type { Prompt } from "@/types/prompts";

/** The user's saved prompts. Changes show right away and are undone if saving fails. */
export function usePrompts(initialPrompts: Prompt[]) {
  const [prompts, setPrompts] = useState(initialPrompts);
  const promptsRef = useLatest(prompts);

  const replace = (prompt: Prompt) =>
    setPrompts((prev) =>
      prev.map((item) => (item.id === prompt.id ? prompt : item)),
    );

  const add = (prompt: Prompt) => {
    setPrompts((prev) => [prompt, ...prev]);
    void persist(createPrompt(prompt), () =>
      setPrompts((prev) => prev.filter((item) => item.id !== prompt.id)),
    );
  };

  const update = (prompt: Prompt) => {
    const previous = promptsRef.current.find((item) => item.id === prompt.id);
    replace(prompt);
    void persist(updatePrompt({ ...prompt, promptId: prompt.id }), () => {
      if (previous) replace(previous);
    });
  };

  const remove = (id: string) => {
    const removed = promptsRef.current.find((item) => item.id === id);
    setPrompts((prev) => prev.filter((item) => item.id !== id));
    void persist(deletePrompt({ promptId: id }), () => {
      if (removed) setPrompts((prev) => [removed, ...prev]);
    });
  };

  /** Saves a copy of a saved or starter prompt, with a fresh id. */
  const copy = (prompt: Prompt, title = prompt.title) =>
    add({
      ...prompt,
      id: crypto.randomUUID(),
      title: title.slice(0, MAX_PROMPT_TITLE_LENGTH),
    });

  return { prompts, add, update, remove, copy };
}
