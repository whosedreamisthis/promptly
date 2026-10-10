"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import type { MenuAction } from "@/components/chat/ActionsMenu";
import ConfirmDeleteDialog from "@/components/chat/ConfirmDeleteDialog";
import { useChats } from "@/components/chat/ChatsProvider";
import { useNewChat } from "@/components/chat/useNewChat";
import { usePendingDelete } from "@/components/chat/usePendingDelete";
import PromptCard from "@/components/prompts/PromptCard";
import { usePromptDraft } from "@/components/prompts/PromptDraftProvider";
import PromptFormDialog, {
  type PromptFields,
} from "@/components/prompts/PromptFormDialog";
import PromptPreviewDialog from "@/components/prompts/PromptPreviewDialog";
import { usePrompts } from "@/components/prompts/usePrompts";
import SignInRequiredModal from "@/components/sidebar/SignInRequiredModal";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  filterPrompts,
  PROMPT_CATEGORIES,
  type PromptCategory,
} from "@/lib/prompts";
import { STARTER_PROMPTS } from "@/lib/starter-prompts";
import type { Prompt } from "@/types/prompts";

interface PromptsViewProps {
  userPrompts: Prompt[];
}

interface PromptSectionProps {
  title: string;
  prompts: Prompt[];
  actionsFor: (prompt: Prompt) => MenuAction[];
  onOpen: (prompt: Prompt) => void;
  onUse: (prompt: Prompt) => void;
}

function PromptSection({
  title,
  prompts,
  actionsFor,
  onOpen,
  onUse,
}: PromptSectionProps) {
  return (
    <section aria-label={title}>
      <h2 className="pb-3 text-lg font-medium text-muted-foreground">
        {title}
      </h2>
      <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {prompts.map((prompt) => (
          <li key={prompt.id}>
            <PromptCard
              prompt={prompt}
              actions={actionsFor(prompt)}
              onOpen={onOpen}
              onUse={onUse}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function PromptsView({ userPrompts }: PromptsViewProps) {
  const { isGuest } = useChats();
  const { setDraft } = usePromptDraft();
  const startNewChat = useNewChat();
  const { prompts, add, update, remove, copy } = usePrompts(userPrompts);
  const { request: requestDelete, dialogProps: deleteDialogProps } =
    usePendingDelete((item) => remove(item.id));
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<PromptCategory | null>(null);
  const [previewing, setPreviewing] = useState<Prompt | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Prompt | null>(null);
  const [signInOpen, setSignInOpen] = useState(false);

  const mine = filterPrompts(prompts, query, category);
  const starters = filterPrompts(STARTER_PROMPTS, query, category);
  const hasNoSaved = !isGuest && prompts.length === 0;
  const showMine = !isGuest && mine.length > 0;

  const handleUse = (prompt: Prompt) =>
    startNewChat(() => setDraft(prompt.content));

  const openForm = (prompt: Prompt | null) => {
    if (isGuest) {
      setSignInOpen(true);
      return;
    }
    setEditing(prompt);
    setFormOpen(true);
  };

  const handleSubmit = (fields: PromptFields) => {
    if (editing) update({ ...editing, ...fields });
    else add({ id: crypto.randomUUID(), ...fields });
    setFormOpen(false);
  };

  const savedActions = (prompt: Prompt): MenuAction[] => [
    { label: "Edit", onSelect: () => openForm(prompt) },
    {
      label: "Duplicate",
      onSelect: () => copy(prompt, `Copy of ${prompt.title}`),
    },
    {
      label: "Delete",
      danger: true,
      onSelect: () =>
        requestDelete({ kind: "prompt", id: prompt.id, title: prompt.title }),
    },
  ];

  const starterActions = (prompt: Prompt): MenuAction[] => [
    {
      label: "Save a copy",
      onSelect: () => (isGuest ? setSignInOpen(true) : copy(prompt)),
    },
  ];

  const isSaved = (prompt: Prompt) => prompts.some((p) => p.id === prompt.id);
  const actionsFor = (prompt: Prompt) =>
    isSaved(prompt) ? savedActions(prompt) : starterActions(prompt);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 pb-12 pt-16">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-4xl font-medium text-foreground">Prompts</h1>
        <Button className="rounded-md" onClick={() => openForm(null)}>
          <Plus />
          New prompt
        </Button>
      </div>
      <InputGroup className="h-9 max-w-md">
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search prompts..."
          aria-label="Search prompts"
        />
      </InputGroup>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Category">
        {[null, ...PROMPT_CATEGORIES].map((item) => (
          <Button
            key={item ?? "all"}
            size="sm"
            variant={category === item ? "default" : "outline"}
            aria-pressed={category === item}
            className="rounded-md"
            onClick={() => setCategory(item)}
          >
            {item ?? "All"}
          </Button>
        ))}
      </div>
      {hasNoSaved && (
        <p className="text-muted-foreground">
          You have not saved any prompts yet. Use New prompt, or save a copy of
          a starter prompt below.
        </p>
      )}
      {showMine && (
        <PromptSection
          title="Your prompts"
          prompts={mine}
          actionsFor={actionsFor}
          onOpen={setPreviewing}
          onUse={handleUse}
        />
      )}
      {starters.length > 0 && (
        <PromptSection
          title="Starter prompts"
          prompts={starters}
          actionsFor={actionsFor}
          onOpen={setPreviewing}
          onUse={handleUse}
        />
      )}
      {!showMine && !hasNoSaved && starters.length === 0 && (
        <p className="text-muted-foreground">No prompts match your search</p>
      )}
      <PromptPreviewDialog
        prompt={previewing}
        actions={previewing ? actionsFor(previewing) : []}
        onUse={handleUse}
        onClose={() => setPreviewing(null)}
      />
      <PromptFormDialog
        open={formOpen}
        initial={editing}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
      />
      <ConfirmDeleteDialog {...deleteDialogProps} />
      <SignInRequiredModal
        open={signInOpen}
        onOpenChange={setSignInOpen}
        feature="Prompts"
        onSignIn={() => setSignInOpen(false)}
      />
    </div>
  );
}
