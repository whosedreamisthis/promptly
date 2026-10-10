"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  MAX_PROMPT_DESCRIPTION_LENGTH,
  MAX_PROMPT_TITLE_LENGTH,
  PROMPT_CATEGORIES,
  type PromptCategory,
} from "@/lib/prompts";
import { MAX_MESSAGE_LENGTH } from "@/lib/validations/messages";
import type { Prompt } from "@/types/prompts";

export type PromptFields = Omit<Prompt, "id">;

interface PromptFormProps {
  initial: Prompt | null;
  onSubmit: (fields: PromptFields) => void;
}

function PromptForm({ initial, onSubmit }: PromptFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [category, setCategory] = useState<PromptCategory>(
    initial?.category ?? PROMPT_CATEGORIES[0],
  );
  const [description, setDescription] = useState(initial?.description ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const canSave = title.trim() !== "" && content.trim() !== "";

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSave) return;
    onSubmit({
      title: title.trim(),
      category,
      description: description.trim(),
      content: content.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="prompt-title">Title</Label>
        <Input
          id="prompt-title"
          value={title}
          maxLength={MAX_PROMPT_TITLE_LENGTH}
          onChange={(event) => setTitle(event.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="prompt-category">Category</Label>
        <Select
          value={category}
          onValueChange={(value) => setCategory(value as PromptCategory)}
        >
          <SelectTrigger id="prompt-category" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PROMPT_CATEGORIES.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="prompt-description">Description (optional)</Label>
        <Input
          id="prompt-description"
          value={description}
          maxLength={MAX_PROMPT_DESCRIPTION_LENGTH}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="prompt-content">Prompt</Label>
        <Textarea
          id="prompt-content"
          rows={8}
          value={content}
          maxLength={MAX_MESSAGE_LENGTH}
          onChange={(event) => setContent(event.target.value)}
        />
        <p className="text-right text-xs text-muted-foreground">
          {content.length} / {MAX_MESSAGE_LENGTH}
        </p>
      </div>
      <DialogFooter>
        <Button type="submit" className="rounded-md" disabled={!canSave}>
          Save
        </Button>
      </DialogFooter>
    </form>
  );
}

interface PromptFormDialogProps {
  open: boolean;
  /** The prompt being edited, or null when creating a new one. */
  initial: Prompt | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (fields: PromptFields) => void;
}

export default function PromptFormDialog({
  open,
  initial,
  onOpenChange,
  onSubmit,
}: PromptFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit prompt" : "New prompt"}</DialogTitle>
          <DialogDescription>
            Saved prompts appear above the starter prompts.
          </DialogDescription>
        </DialogHeader>
        <PromptForm
          key={initial?.id ?? "new"}
          initial={initial}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
