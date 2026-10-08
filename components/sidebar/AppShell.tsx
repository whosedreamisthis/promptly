"use client";

import { useState } from "react";
import { Show, UserButton } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import { USER_MENU_POPOVER_CLASS } from "@/lib/clerk-appearance";
import Sidebar from "@/components/sidebar/Sidebar";
import { MOCK_CHATS, type Chat } from "@/lib/mock-chats";

interface AppShellProps {
  navbar: React.ReactNode;
  children: React.ReactNode;
}

export default function AppShell({ navbar, children }: AppShellProps) {
  const [chats, setChats] = useState<Chat[]>(MOCK_CHATS);
  const [activeChatId, setActiveChatId] = useState<string | null>(
    MOCK_CHATS[0].id,
  );
  const [closed, setClosed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleOpen = () => {
    setClosed(false);
    setMobileOpen(true);
  };

  const handleClose = () => {
    setClosed(true);
    setMobileOpen(false);
  };

  const handleNewChat = () => {
    const chat: Chat = { id: crypto.randomUUID(), title: "New chat" };
    setChats((prev) => [chat, ...prev]);
    setActiveChatId(chat.id);
  };

  const handleRenameChat = (id: string, title: string) => {
    setChats((prev) =>
      prev.map((chat) => (chat.id === id ? { ...chat, title } : chat)),
    );
  };

  const handleTogglePinChat = (id: string) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === id ? { ...chat, pinned: !chat.pinned } : chat,
      ),
    );
  };

  const handleDeleteChat = (id: string) => {
    setChats((prev) => prev.filter((chat) => chat.id !== id));
    setActiveChatId((prev) => (prev === id ? null : prev));
  };

  return (
    <div className="flex h-full">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        closed={closed}
        mobileOpen={mobileOpen}
        onClose={handleClose}
        onNewChat={handleNewChat}
        onSelectChat={setActiveChatId}
        onRenameChat={handleRenameChat}
        onTogglePinChat={handleTogglePinChat}
        onDeleteChat={handleDeleteChat}
      />
      <div className="relative flex min-w-0 flex-1 flex-col">
        {navbar}
        <div
          className={`absolute left-3 top-3.5 z-10 items-center gap-2 ${
            closed ? "flex" : "flex md:hidden"
          }`}
        >
          <button
            type="button"
            aria-label="Open sidebar"
            onClick={handleOpen}
            className="flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-pastel-lavender focus-visible:outline-2 focus-visible:outline-pastel-mint"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-lg font-semibold">Promptly</span>
        </div>
        <Show when="signed-in">
          <div
            className={`absolute bottom-3 left-3 z-10 flex h-9 items-center transition-[opacity,visibility] ease-in-out ${
              closed
                ? "visible opacity-100 delay-[250ms] duration-500"
                : "invisible opacity-0 duration-150 max-md:visible max-md:opacity-100"
            }`}
          >
            <UserButton
              appearance={{
                elements: {
                  userButtonTrigger: "rounded-md p-1",
                  userButtonPopoverCard: USER_MENU_POPOVER_CLASS,
                },
              }}
            />
          </div>
        </Show>
        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
