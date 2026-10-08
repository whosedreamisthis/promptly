"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MAX_NOTEBOOK_TITLE_LENGTH } from "@/lib/notebooks";

interface NotebookNameFormProps {
  onSubmit: (title: string) => void;
}

/** Shown for a brand new notebook, before its regular page, so it gets a title first. */
export default function NotebookNameForm({ onSubmit }: NotebookNameFormProps) {
  const [title, setTitle] = useState("");
  const trimmed = title.trim();

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <form
        className="flex w-full max-w-md flex-col items-center gap-4 text-center"
        onSubmit={(event) => {
          event.preventDefault();
          if (trimmed) onSubmit(trimmed);
        }}
      >
        <BookOpen className="size-10 text-muted-foreground" aria-hidden="true" />
        <h1 className="text-3xl font-medium text-foreground">
          Name your notebook
        </h1>
        <p className="text-muted-foreground">
          Give it a title so you can find it later.
        </p>
        <Input
          autoFocus
          value={title}
          maxLength={MAX_NOTEBOOK_TITLE_LENGTH}
          onChange={(event) => setTitle(event.target.value)}
          aria-label="Notebook title"
          placeholder="e.g. Frontend notes"
          className="h-10 bg-surface-input"
        />
        <Button type="submit" className="rounded-md" disabled={!trimmed}>
          Create notebook
        </Button>
      </form>
    </div>
  );
}
