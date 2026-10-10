"use client";

import { usePathname, useRouter } from "next/navigation";
import { useChats } from "@/components/chat/ChatsProvider";
import { useNewChat } from "@/components/chat/useNewChat";
import Sidebar from "@/components/sidebar/Sidebar";

interface RoutedSidebarProps {
  closed: boolean;
  mobileOpen: boolean;
  onClose: () => void;
}

/** Connects the sidebar to routing; reads the URL, so render it inside Suspense. */
export default function RoutedSidebar({
  closed,
  mobileOpen,
  onClose,
}: RoutedSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { deleteChat, deleteNotebook } = useChats();
  const startNewChat = useNewChat();
  const activeChatId = pathname.startsWith("/chats/")
    ? pathname.split("/")[2]
    : null;

  const activeNotebookId = pathname.startsWith("/notebooks/")
    ? pathname.split("/")[2]
    : null;

  const handleSelectChat = (id: string) => router.push(`/chats/${id}`);

  const handleSelectNotebook = (id: string) => router.push(`/notebooks/${id}`);

  const handleDeleteNotebook = (id: string) => {
    deleteNotebook(id);
    if (id === activeNotebookId) router.push("/");
  };

  const handleDeleteChat = (id: string) => {
    deleteChat(id);
    if (id === activeChatId) router.push("/");
  };

  return (
    <Sidebar
      activeChatId={activeChatId}
      activeNotebookId={activeNotebookId}
      promptsActive={pathname === "/prompts"}
      closed={closed}
      mobileOpen={mobileOpen}
      onClose={onClose}
      onNewChat={() => startNewChat()}
      onOpenPrompts={() => router.push("/prompts")}
      onSelectChat={handleSelectChat}
      onSelectNotebook={handleSelectNotebook}
      onDeleteChat={handleDeleteChat}
      onDeleteNotebook={handleDeleteNotebook}
    />
  );
}
