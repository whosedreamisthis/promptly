"use client";

import {
  useMemo,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";
import {
  createNotebook as createNotebookAction,
  deleteNotebook as deleteNotebookAction,
  renameNotebook as renameNotebookAction,
  setNotebookPinned as setNotebookPinnedAction,
} from "@/actions/notebooks";
import { NEW_NOTEBOOK_TITLE } from "@/lib/notebooks";
import { persist } from "@/lib/persist";
import { useLatest } from "@/lib/use-latest";
import type { Chat, Notebook } from "@/types/chats";

/** Notebook state with optimistic updates; deleting a notebook also detaches its chats. */
export function useNotebooks(
  initialNotebooks: Notebook[],
  chatsRef: RefObject<Chat[]>,
  setChats: Dispatch<SetStateAction<Chat[]>>,
) {
  const [notebooks, setNotebooks] = useState<Notebook[]>(initialNotebooks);
  const notebooksRef = useLatest(notebooks);

  const actions = useMemo(() => {
    const updateNotebook = (id: string, changes: Partial<Notebook>) => {
      setNotebooks((prev) =>
        prev.map((notebook) =>
          notebook.id === id ? { ...notebook, ...changes } : notebook,
        ),
      );
    };

    /** Creates a notebook and returns its id. */
    const createNotebook = () => {
      const id = crypto.randomUUID();
      setNotebooks((prev) => [
        { id, title: NEW_NOTEBOOK_TITLE, pinned: false },
        ...prev,
      ]);
      void persist(
        createNotebookAction({ id, title: NEW_NOTEBOOK_TITLE }),
        () => setNotebooks((prev) => prev.filter((item) => item.id !== id)),
      );
      return id;
    };

    const renameNotebook = (id: string, title: string) => {
      const previous = notebooksRef.current.find((item) => item.id === id)?.title;
      updateNotebook(id, { title });
      void persist(renameNotebookAction({ notebookId: id, title }), () => {
        if (previous !== undefined) updateNotebook(id, { title: previous });
      });
    };

    const togglePinNotebook = (id: string) => {
      const wasPinned =
        notebooksRef.current.find((item) => item.id === id)?.pinned ?? false;
      updateNotebook(id, { pinned: !wasPinned });
      void persist(
        setNotebookPinnedAction({ notebookId: id, pinned: !wasPinned }),
        () => updateNotebook(id, { pinned: wasPinned }),
      );
    };

    const deleteNotebook = (id: string) => {
      const removed = notebooksRef.current.find((item) => item.id === id);
      const memberIds = chatsRef.current
        .filter((chat) => chat.notebookId === id)
        .map((chat) => chat.id);
      setNotebooks((prev) => prev.filter((item) => item.id !== id));
      setChats((prev) =>
        prev.map((chat) =>
          chat.notebookId === id ? { ...chat, notebookId: null } : chat,
        ),
      );
      void persist(deleteNotebookAction({ notebookId: id }), () => {
        if (removed) setNotebooks((prev) => [removed, ...prev]);
        setChats((prev) =>
          prev.map((chat) =>
            memberIds.includes(chat.id) ? { ...chat, notebookId: id } : chat,
          ),
        );
      });
    };

    return { createNotebook, renameNotebook, togglePinNotebook, deleteNotebook };
  }, [notebooksRef, chatsRef, setChats]);

  return { notebooks, ...actions };
}
