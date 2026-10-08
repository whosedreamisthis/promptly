"use client";

import { useState } from "react";
import type { DeletableKind } from "@/components/chat/ConfirmDeleteDialog";

export interface PendingDelete {
  kind: DeletableKind;
  id: string;
  title: string;
}

/**
 * State for a delete confirmation: `request` opens the dialog for an item, and
 * `dialogProps` spreads onto `ConfirmDeleteDialog`. The item is kept after closing so
 * the dialog does not lose its text while it fades out.
 */
export function usePendingDelete(onConfirm: (item: PendingDelete) => void) {
  const [item, setItem] = useState<PendingDelete | null>(null);
  const [open, setOpen] = useState(false);

  const request = (next: PendingDelete) => {
    setItem(next);
    setOpen(true);
  };

  const dialogProps = {
    open,
    onOpenChange: setOpen,
    kind: item?.kind ?? "chat",
    title: item?.title ?? "",
    onConfirm: () => {
      if (item) onConfirm(item);
      setOpen(false);
    },
  };

  return { request, dialogProps };
}
