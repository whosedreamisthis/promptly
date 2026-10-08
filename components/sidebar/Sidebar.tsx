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
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import SettingsModal from "@/components/sidebar/SettingsModal";
import { USER_MENU_POPOVER_CLASS } from "@/lib/clerk-appearance";
import type { MenuAction } from "@/components/sidebar/SidebarItem";
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
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col overflow-hidden border-r border-surface-border bg-[#F3F0F8] transition-all duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full max-md:invisible"
        } ${closed ? "md:invisible md:-translate-x-full" : "md:translate-x-0"}`}
      >
        <div className="flex h-16 shrink-0 items-center gap-2 px-3">
          <div className="flex min-w-0 flex-1 items-center gap-2 pl-1">
            <Logo className="h-7 w-7 shrink-0" />
            <span className="truncate text-lg font-semibold">Promptly</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close sidebar"
            onClick={onClose}
          >
            <X className="size-5" />
          </Button>
        </div>

        <div
          className={`flex shrink-0 flex-col gap-1 border-b px-3 pb-2 transition-colors ${
            scrolled ? "border-surface-border" : "border-transparent"
          }`}
        >
          <InputGroup className="h-9 bg-white">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search chats..."
              aria-label="Search chats"
            />
          </InputGroup>
          <Button
            variant="ghost"
            className="h-9 justify-start gap-3 px-2 font-normal"
            onClick={() => {
              setActiveNotebookId(null);
              onNewChat();
              onClose();
            }}
          >
            <SquarePen className="size-5" />
            New chat
          </Button>
        </div>

        <nav
          aria-label="Notebooks and recent chats"
          onScroll={(event) => setScrolled(event.currentTarget.scrollTop > 0)}
          className="min-h-0 flex-1 overflow-y-auto px-3"
        >
          <SidebarSection title="Notebooks">
            <Button
              variant="ghost"
              className="h-10 w-full justify-start gap-3 rounded-full pl-3 font-normal"
              onClick={handleNewNotebook}
            >
              <Plus className="size-5" />
              New notebook
            </Button>
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
                  active={!activeNotebookId && chat.id === activeChatId}
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
                    userButtonPopoverCard: USER_MENU_POPOVER_CLASS,
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
          <Button
            variant="ghost"
            size="icon"
            aria-label="Settings"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="size-5" />
          </Button>
        </div>
      </aside>
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
