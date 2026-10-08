"use client";

import { useState } from "react";
import { Show, UserButton } from "@clerk/nextjs";
import {
  BookOpen,
  BookPlus,
  MessageSquare,
  Pencil,
  Pin,
  PinOff,
  Plus,
  Search,
  Settings,
  Share2,
  SquarePen,
  Trash2,
  User,
  X,
} from "lucide-react";
import Logo from "@/components/layout/Logo";
import SettingsModal from "@/components/sidebar/SettingsModal";
import type { MenuAction } from "@/components/sidebar/ItemMenu";
import SidebarItem from "@/components/sidebar/SidebarItem";
import SidebarSection from "@/components/sidebar/SidebarSection";
import { MOCK_NOTEBOOKS, type Chat, type Notebook } from "@/lib/mock-chats";

interface SidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  closed: boolean;
  mobileOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onSelectChat: (id: string | null) => void;
  onRenameChat: (id: string, title: string) => void;
  onTogglePinChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
}

function pinnedFirst<T extends { pinned?: boolean }>(items: T[]): T[] {
  return [...items].sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned));
}

const ICON_BUTTON =
  "flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors hover:bg-[#EFE8F6] focus-visible:outline-2 focus-visible:outline-pastel-mint";

export default function Sidebar({
  chats,
  activeChatId,
  closed,
  mobileOpen,
  onClose,
  onNewChat,
  onSelectChat,
  onRenameChat,
  onTogglePinChat,
  onDeleteChat,
}: SidebarProps) {
  const [query, setQuery] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notebooks, setNotebooks] = useState<Notebook[]>(MOCK_NOTEBOOKS);
  const [scrolled, setScrolled] = useState(false);
  const [activeNotebookId, setActiveNotebookId] = useState<string | null>(null);

  const [renamingId, setRenamingId] = useState<string | null>(null);

  const filtered = pinnedFirst(
    chats.filter((chat) =>
      chat.title.toLowerCase().includes(query.trim().toLowerCase()),
    ),
  );

  const handleSelectChat = (id: string) => {
    setActiveNotebookId(null);
    onSelectChat(id);
    onClose();
  };

  const handleSelectNotebook = (id: string) => {
    onSelectChat(null);
    setActiveNotebookId(id);
    onClose();
  };

  const handleNewNotebook = () => {
    const notebook: Notebook = {
      id: crypto.randomUUID(),
      title: "Untitled notebook",
      chatIds: [],
    };
    setNotebooks((prev) => [notebook, ...prev]);
    handleSelectNotebook(notebook.id);
  };

  const updateNotebook = (id: string, changes: Partial<Notebook>) => {
    setNotebooks((prev) =>
      prev.map((notebook) =>
        notebook.id === id ? { ...notebook, ...changes } : notebook,
      ),
    );
  };

  const deleteNotebook = (id: string) => {
    setNotebooks((prev) => prev.filter((notebook) => notebook.id !== id));
    setActiveNotebookId((prev) => (prev === id ? null : prev));
  };

  const addChatToNotebook = (notebookId: string, chatId: string) => {
    setNotebooks((prev) =>
      prev.map((notebook) =>
        notebook.id === notebookId && !notebook.chatIds.includes(chatId)
          ? { ...notebook, chatIds: [...notebook.chatIds, chatId] }
          : notebook,
      ),
    );
  };

  const chatActions = (chat: Chat): MenuAction[] => [
    {
      label: "Share conversation",
      icon: <Share2 className="h-4 w-4" />,
      onSelect: () => {
        void navigator.clipboard?.writeText(
          `${window.location.origin}/chat/${chat.id}`,
        );
      },
    },
    {
      label: chat.pinned ? "Unpin" : "Pin",
      icon: chat.pinned ? (
        <PinOff className="h-4 w-4" />
      ) : (
        <Pin className="h-4 w-4" />
      ),
      onSelect: () => onTogglePinChat(chat.id),
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
        onSelect: () => addChatToNotebook(notebook.id, chat.id),
      })),
    },
    {
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      danger: true,
      onSelect: () => onDeleteChat(chat.id),
    },
  ];

  const notebookActions = (notebook: Notebook): MenuAction[] => [
    {
      label: notebook.pinned ? "Unpin" : "Pin",
      icon: notebook.pinned ? (
        <PinOff className="h-4 w-4" />
      ) : (
        <Pin className="h-4 w-4" />
      ),
      onSelect: () => updateNotebook(notebook.id, { pinned: !notebook.pinned }),
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
      onSelect: () => deleteNotebook(notebook.id),
    },
  ];

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col overflow-hidden border-r border-surface-border bg-[#F3F0F8] transition-all duration-300 ease-in-out md:static md:z-auto md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full max-md:invisible"
        } ${closed ? "md:invisible md:w-0 md:border-r-0" : "md:w-64"}`}
      >
        <div className="flex h-16 shrink-0 items-center gap-2 px-3">
          <div className="flex min-w-0 flex-1 items-center gap-2 pl-1">
            <Logo className="h-7 w-7 shrink-0" />
            <span className="truncate text-lg font-semibold">Promptly</span>
          </div>
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={onClose}
            className={ICON_BUTTON}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div
          className={`flex shrink-0 flex-col gap-1 border-b px-3 pb-2 transition-colors ${
            scrolled ? "border-surface-border" : "border-transparent"
          }`}
        >
          <label className="flex h-9 items-center gap-2 rounded-md border border-surface-border bg-white px-3 focus-within:border-pastel-mint focus-within:ring-2 focus-within:ring-pastel-mint/50">
            <Search className="h-4 w-4 shrink-0 text-stone-500" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search chats..."
              aria-label="Search chats"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#9E9893]"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="flex h-9 items-center gap-3 rounded-md px-2 text-sm transition-colors hover:bg-[#EFE8F6]"
          >
            <SquarePen className="h-5 w-5 shrink-0" />
            New chat
          </button>
        </div>

        <nav
          aria-label="Notebooks and recent chats"
          onScroll={(event) => setScrolled(event.currentTarget.scrollTop > 0)}
          className="min-h-0 flex-1 overflow-y-auto px-3"
        >
          <SidebarSection title="Notebooks">
            <button
              type="button"
              onClick={handleNewNotebook}
              className="flex h-10 w-full items-center gap-3 rounded-full pl-3 text-left text-sm transition-colors hover:bg-[#EFE8F6]"
            >
              <Plus className="h-5 w-5 shrink-0" />
              New notebook
            </button>
            {pinnedFirst(notebooks).map((notebook) => (
              <SidebarItem
                key={notebook.id}
                icon={<BookOpen className="h-5 w-5" />}
                label={notebook.title}
                active={notebook.id === activeNotebookId}
                pinned={!!notebook.pinned}
                renaming={renamingId === notebook.id}
                actions={notebookActions(notebook)}
                onSelect={() => handleSelectNotebook(notebook.id)}
                onRename={(title) => {
                  updateNotebook(notebook.id, { title });
                  setRenamingId(null);
                }}
                onCancelRename={() => setRenamingId(null)}
              />
            ))}
          </SidebarSection>
          <SidebarSection title="Recents">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-sm text-stone-500">
                No recent chats
              </p>
            ) : (
              filtered.map((chat) => (
                <SidebarItem
                  key={chat.id}
                  icon={<MessageSquare className="h-4 w-4" />}
                  label={chat.title}
                  active={chat.id === activeChatId}
                  pinned={!!chat.pinned}
                  renaming={renamingId === chat.id}
                  actions={chatActions(chat)}
                  onSelect={() => handleSelectChat(chat.id)}
                  onRename={(title) => {
                    onRenameChat(chat.id, title);
                    setRenamingId(null);
                  }}
                  onCancelRename={() => setRenamingId(null)}
                />
              ))
            )}
          </SidebarSection>
        </nav>

        <div className="mt-auto flex shrink-0 items-center gap-2 border-t border-surface-border p-3">
          <Show when="signed-in">
            <div className="min-w-0 flex-1">
              <UserButton
                showName
                appearance={{
                  elements: {
                    userButtonBox: "!flex-row !justify-start gap-2",
                    userButtonAvatarBox: "!order-first",
                    userButtonOuterIdentifier:
                      "!order-last truncate text-sm font-medium text-foreground",
                    userButtonTrigger:
                      "w-full justify-start rounded-md p-1 hover:bg-[#EFE8F6] focus:shadow-none",
                  },
                }}
              />
            </div>
          </Show>
          <Show when="signed-out">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pastel-lavender">
              <User className="h-5 w-5" />
            </span>
            <p className="min-w-0 flex-1 truncate text-sm font-medium">Guest</p>
          </Show>
          <button
            type="button"
            aria-label="Settings"
            onClick={() => setSettingsOpen(true)}
            className={ICON_BUTTON}
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </aside>
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </>
  );
}
