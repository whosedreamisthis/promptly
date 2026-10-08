"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen } from "lucide-react";
import ActionsMenu from "@/components/chat/ActionsMenu";
import ChatInput from "@/components/chat/ChatInput";
import { useChats } from "@/components/chat/ChatsProvider";
import InlineRenameInput from "@/components/chat/InlineRenameInput";
import type { ChatSubmission } from "@/types/chats";

interface NotebookViewProps {
  notebookId: string;
}

export default function NotebookView({ notebookId }: NotebookViewProps) {
  const router = useRouter();
  const {
    notebooks,
    chats,
    sendMessage,
    moveChatToNotebook,
    renameChat,
    togglePinChat,
    deleteChat,
  } = useChats();
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const notebook = notebooks.find((item) => item.id === notebookId);

  if (!notebook) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <p className="text-muted-foreground">Notebook not found</p>
      </div>
    );
  }

  const notebookChats = chats.filter((chat) => chat.notebookId === notebookId);

  const handleSubmit = async (submission: ChatSubmission) => {
    const id = await sendMessage(crypto.randomUUID(), submission);
    if (!id) return;
    moveChatToNotebook(id, notebookId);
    router.push(`/chats/${id}`);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 pt-16">
          <h1 className="flex items-center gap-3 text-4xl font-medium text-foreground">
            <BookOpen className="size-9 shrink-0" />
            <span className="truncate">{notebook.title}</span>
          </h1>
          <section aria-labelledby="past-chats">
            <h2
              id="past-chats"
              className="px-3 pb-2 text-lg font-medium text-muted-foreground"
            >
              Past chats
            </h2>
            {notebookChats.length === 0 ? (
              <p className="px-3 py-2 text-sm text-muted-foreground">
                No chats in this notebook yet. Ask something below or use
                &quot;Add to notebook&quot; on an existing chat.
              </p>
            ) : (
              <ul className="flex flex-col">
                {notebookChats.map((chat) => (
                  <li
                    key={chat.id}
                    className="flex items-center rounded-md hover:bg-pastel-peach"
                  >
                    {renamingId === chat.id ? (
                      <InlineRenameInput
                        value={chat.title}
                        ariaLabel="Rename chat"
                        onRename={(title) => {
                          renameChat(chat.id, title);
                          setRenamingId(null);
                        }}
                        onCancel={() => setRenamingId(null)}
                        className="mx-3 my-1.5 h-9 min-w-0 flex-1 bg-white"
                      />
                    ) : (
                      <Link
                        href={`/chats/${chat.id}`}
                        className="min-w-0 flex-1 truncate px-3 py-3"
                      >
                        {chat.title}
                      </Link>
                    )}
                    <ActionsMenu
                      label={`Actions for ${chat.title}`}
                      keepFocus={renamingId !== null}
                      actions={[
                        {
                          label: "Rename",
                          onSelect: () => setRenamingId(chat.id),
                        },
                        {
                          label: chat.pinned ? "Unpin" : "Pin",
                          onSelect: () => togglePinChat(chat.id),
                        },
                        {
                          label: "Remove from notebook",
                          onSelect: () => moveChatToNotebook(chat.id, null),
                        },
                        {
                          label: "Delete",
                          onSelect: () => deleteChat(chat.id),
                        },
                      ]}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
      <div className="shrink-0 px-14 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2">
        <ChatInput disabled={false} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
