"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, MoreVertical } from "lucide-react";
import ChatInput, { type ChatSubmission } from "@/components/chat/ChatInput";
import { useChats } from "@/components/chat/ChatsProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NotebookViewProps {
  notebookId: string;
}

interface RenameFieldProps {
  title: string;
  onRename: (title: string) => void;
  onCancel: () => void;
}

function RenameField({ title, onRename, onCancel }: RenameFieldProps) {
  const settled = useRef(false);

  const finish = (value: string) => {
    if (settled.current) return;
    settled.current = true;
    const next = value.trim();
    if (next && next !== title) onRename(next);
    else onCancel();
  };

  return (
    <Input
      autoFocus
      defaultValue={title}
      aria-label="Rename chat"
      onFocus={(event) => {
        settled.current = false;
        event.currentTarget.select();
      }}
      onBlur={(event) => finish(event.currentTarget.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") finish(event.currentTarget.value);
        if (event.key === "Escape") {
          settled.current = true;
          onCancel();
        }
      }}
      className="mx-3 my-1.5 h-9 min-w-0 flex-1 bg-white"
    />
  );
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
                      <RenameField
                        title={chat.title}
                        onRename={(title) => {
                          renameChat(chat.id, title);
                          setRenamingId(null);
                        }}
                        onCancel={() => setRenamingId(null)}
                      />
                    ) : (
                      <Link
                        href={`/chats/${chat.id}`}
                        className="min-w-0 flex-1 truncate px-3 py-3"
                      >
                        {chat.title}
                      </Link>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Actions for ${chat.title}`}
                        >
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        onCloseAutoFocus={(event) => {
                          // Keep focus on the rename field instead of returning it to the trigger.
                          if (renamingId) event.preventDefault();
                        }}
                      >
                        <DropdownMenuItem
                          onSelect={() => setRenamingId(chat.id)}
                        >
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => togglePinChat(chat.id)}
                        >
                          {chat.pinned ? "Unpin" : "Pin"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => moveChatToNotebook(chat.id, null)}
                        >
                          Remove from notebook
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => deleteChat(chat.id)}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
