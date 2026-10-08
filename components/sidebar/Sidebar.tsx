"use client";

import { useState } from "react";
import { BookOpen, MessageSquare, Plus, Search, SquarePen } from "lucide-react";
import { useChats } from "@/components/chat/ChatsProvider";
import ConfirmDeleteDialog from "@/components/chat/ConfirmDeleteDialog";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import SidebarFooter from "@/components/sidebar/SidebarFooter";
import SidebarHeader from "@/components/sidebar/SidebarHeader";
import SidebarItem from "@/components/sidebar/SidebarItem";
import SidebarSection from "@/components/sidebar/SidebarSection";
import SignInRequiredModal from "@/components/sidebar/SignInRequiredModal";
import { useSidebarMenus } from "@/components/sidebar/useSidebarMenus";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeChatId: string | null;
  activeNotebookId: string | null;
  closed: boolean;
  mobileOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onSelectNotebook: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onDeleteNotebook: (id: string) => void;
}

function pinnedFirst<T extends { pinned?: boolean }>(items: T[]): T[] {
  return [...items].sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned));
}

export default function Sidebar({
  activeChatId,
  activeNotebookId,
  closed,
  mobileOpen,
  onClose,
  onNewChat,
  onSelectChat,
  onSelectNotebook,
  onDeleteChat,
  onDeleteNotebook,
}: SidebarProps) {
  const {
    chats,
    notebooks,
    isGuest,
    renameChat,
    renameNotebook,
    createNotebook,
    togglePinChat,
    togglePinNotebook,
  } = useChats();
  const {
    renamingId,
    setRenamingId,
    chatActions,
    notebookActions,
    deleteDialogProps,
  } = useSidebarMenus({ onDeleteChat, onDeleteNotebook });
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [signInPromptOpen, setSignInPromptOpen] = useState(false);

  const filtered = pinnedFirst(
    chats.filter((chat) =>
      chat.title.toLowerCase().includes(query.trim().toLowerCase()),
    ),
  );

  const handleSelectChat = (id: string) => {
    onSelectChat(id);
    onClose();
  };

  const handleSelectNotebook = (id: string) => {
    onSelectNotebook(id);
    onClose();
  };

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
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col overflow-hidden border-r border-surface-border bg-sidebar transition-all duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full max-md:invisible",
          closed ? "md:invisible md:-translate-x-full" : "md:translate-x-0",
        )}
      >
        <SidebarHeader onClose={onClose} />

        <div
          className={cn(
            "flex shrink-0 flex-col gap-1 border-b px-3 pb-2 transition-colors",
            scrolled ? "border-surface-border" : "border-transparent",
          )}
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
              className="h-10 w-full justify-start gap-3 pl-3 font-normal"
              onClick={() =>
                isGuest
                  ? setSignInPromptOpen(true)
                  : handleSelectNotebook(createNotebook())
              }
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
                pinned={notebook.pinned}
                renaming={renamingId === notebook.id}
                actions={notebookActions(notebook)}
                onSelect={() => handleSelectNotebook(notebook.id)}
                onTogglePin={() => togglePinNotebook(notebook.id)}
                onRename={(title) => {
                  renameNotebook(notebook.id, title);
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
                  pinned={chat.pinned}
                  renaming={renamingId === chat.id}
                  actions={chatActions(chat)}
                  onSelect={() => handleSelectChat(chat.id)}
                  onTogglePin={() => togglePinChat(chat.id)}
                  onRename={(title) => {
                    renameChat(chat.id, title);
                    setRenamingId(null);
                  }}
                  onCancelRename={() => setRenamingId(null)}
                />
              ))
            )}
          </SidebarSection>
        </nav>

        <SidebarFooter />
        <SignInRequiredModal
          open={signInPromptOpen}
          onOpenChange={setSignInPromptOpen}
          feature="Notebooks"
          onSignIn={onClose}
        />
        <ConfirmDeleteDialog {...deleteDialogProps} />
      </aside>
    </>
  );
}
