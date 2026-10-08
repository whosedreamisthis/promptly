"use client";

import { usePathname, useRouter } from "next/navigation";
import { useChats } from "@/components/chat/ChatsProvider";
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
  const { createChat, deleteChat, deleteNotebook } = useChats();
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

  const handleNewChat = async () => {
    const id = await createChat();
    if (id) router.push(`/chats/${id}`);
  };

  return (
    <Sidebar
      activeChatId={activeChatId}
      activeNotebookId={activeNotebookId}
      closed={closed}
      mobileOpen={mobileOpen}
      onClose={onClose}
      onNewChat={handleNewChat}
      onSelectChat={handleSelectChat}
      onSelectNotebook={handleSelectNotebook}
      onDeleteChat={handleDeleteChat}
      onDeleteNotebook={handleDeleteNotebook}
    />
  );
}
