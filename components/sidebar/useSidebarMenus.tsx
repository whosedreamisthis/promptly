"use client";

import { useState } from "react";
import {
  BookOpen,
  BookPlus,
  Link2,
  Pencil,
  Pin,
  PinOff,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { MenuAction } from "@/components/chat/ActionsMenu";
import { useChats } from "@/components/chat/ChatsProvider";
import type { DeletableKind } from "@/components/chat/ConfirmDeleteDialog";
import type { Chat, Notebook } from "@/types/chats";

interface SidebarMenusOptions {
  onDeleteChat: (id: string) => void;
  onDeleteNotebook: (id: string) => void;
}

interface PendingDelete {
  kind: DeletableKind;
  id: string;
  title: string;
}

function PinIcon({ pinned }: { pinned: boolean }) {
  return pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />;
}

async function copyChatLink(chatId: string) {
  try {
    await navigator.clipboard.writeText(
      `${window.location.origin}/chats/${chatId}`,
    );
    toast.success("Link copied");
  } catch {
    toast.error("Could not copy the link");
  }
}

/** Builds the pin/rename/delete menus of sidebar chats and notebooks, and tracks which row is being renamed. */
export function useSidebarMenus({
  onDeleteChat,
  onDeleteNotebook,
}: SidebarMenusOptions) {
  const { notebooks, moveChatToNotebook, togglePinChat, togglePinNotebook } =
    useChats();
  const [renamingId, setRenamingId] = useState<string | null>(null);
  // Kept after closing so the dialog does not lose its text while it fades out.
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const requestDelete = (item: PendingDelete) => {
    setPendingDelete(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    if (pendingDelete.kind === "chat") onDeleteChat(pendingDelete.id);
    else onDeleteNotebook(pendingDelete.id);
    setDeleteDialogOpen(false);
  };

  const chatActions = (chat: Chat): MenuAction[] => [
    {
      label: "Copy link",
      icon: <Link2 className="h-4 w-4" />,
      onSelect: () => void copyChatLink(chat.id),
    },
    {
      label: chat.pinned ? "Unpin" : "Pin",
      icon: <PinIcon pinned={chat.pinned} />,
      onSelect: () => togglePinChat(chat.id),
    },
    {
      label: "Rename",
      icon: <Pencil className="h-4 w-4" />,
      onSelect: () => setRenamingId(chat.id),
    },
    {
      label: "Add to notebook",
      icon: <BookPlus className="h-4 w-4" />,
      children: notebooks.map((notebook) => ({
        label: notebook.title,
        icon: <BookOpen className="h-4 w-4" />,
        onSelect: () => moveChatToNotebook(chat.id, notebook.id),
      })),
    },
    {
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      danger: true,
      onSelect: () =>
        requestDelete({ kind: "chat", id: chat.id, title: chat.title }),
    },
  ];

  const notebookActions = (notebook: Notebook): MenuAction[] => [
    {
      label: notebook.pinned ? "Unpin" : "Pin",
      icon: <PinIcon pinned={notebook.pinned} />,
      onSelect: () => togglePinNotebook(notebook.id),
    },
    {
      label: "Rename",
      icon: <Pencil className="h-4 w-4" />,
      onSelect: () => setRenamingId(notebook.id),
    },
    {
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      danger: true,
      onSelect: () =>
        requestDelete({
          kind: "notebook",
          id: notebook.id,
          title: notebook.title,
        }),
    },
  ];

  return {
    renamingId,
    setRenamingId,
    chatActions,
    notebookActions,
    pendingDelete,
    deleteDialogOpen,
    setDeleteDialogOpen,
    confirmDelete,
  };
}
