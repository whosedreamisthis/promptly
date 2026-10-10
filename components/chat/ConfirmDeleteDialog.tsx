"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type DeletableKind = "chat" | "notebook" | "prompt";

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: DeletableKind;
  title: string;
  onConfirm: () => void;
}

const CONSEQUENCE: Record<DeletableKind, string> = {
  chat: "and its messages will be permanently deleted.",
  notebook: "will be deleted. Its chats are kept and will move to Recents.",
  prompt: "will be permanently deleted.",
};

/** Asks before a chat, notebook or prompt is deleted; Cancel has focus first, so Enter never deletes by accident. */
export default function ConfirmDeleteDialog({
  open,
  onOpenChange,
  kind,
  title,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this {kind}?</AlertDialogTitle>
          <AlertDialogDescription>
            &ldquo;{title}&rdquo; {CONSEQUENCE[kind]}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-md">Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            className="rounded-md"
            onClick={onConfirm}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
