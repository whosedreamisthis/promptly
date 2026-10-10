"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MAX_NOTEBOOK_TITLE_LENGTH } from "@/lib/notebooks";

interface RenameChatFormProps {
  title: string;
  onRename: (title: string) => void;
}

function RenameChatForm({ title, onRename }: RenameChatFormProps) {
  const [value, setValue] = useState(title);
  const trimmed = value.trim();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (trimmed) onRename(trimmed);
      }}
      className="flex flex-col gap-4"
    >
      <Input
        value={value}
        maxLength={MAX_NOTEBOOK_TITLE_LENGTH}
        aria-label="Chat name"
        onChange={(event) => setValue(event.target.value)}
        onFocus={(event) => event.currentTarget.select()}
      />
      <DialogFooter>
        <Button type="submit" className="rounded-md" disabled={!trimmed}>
          Save
        </Button>
      </DialogFooter>
    </form>
  );
}

interface RenameChatDialogProps {
  open: boolean;
  title: string;
  onOpenChange: (open: boolean) => void;
  onRename: (title: string) => void;
}

/** Renames a chat from its own page, where the sidebar's inline rename is not available. */
export default function RenameChatDialog({
  open,
  title,
  onOpenChange,
  onRename,
}: RenameChatDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename chat</DialogTitle>
        </DialogHeader>
        <RenameChatForm title={title} onRename={onRename} />
      </DialogContent>
    </Dialog>
  );
}
