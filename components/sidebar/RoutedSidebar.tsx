"use client";

import { usePathname, useRouter } from "next/navigation";
import { useChats } from "@/components/chat/ChatsProvider";
import Sidebar from "@/components/sidebar/Sidebar";

interface RoutedSidebarProps {
  closed: boolean;
  mobileOpen: boolean;
  onClose: () => void;
}

/** Connects the sidebar to chat state and routing; reads the URL, so render it inside Suspense. */
export default function RoutedSidebar({
  closed,
  mobileOpen,
  onClose,
}: RoutedSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { chats, createChat, renameChat, togglePinChat, deleteChat } =
    useChats();
  const activeChatId = pathname.startsWith("/chats/")
    ? pathname.split("/")[2]
    : null;

  const handleSelectChat = (id: string | null) => {
    if (id) router.push(`/chats/${id}`);
  };

  const handleDeleteChat = (id: string) => {
    deleteChat(id);
    if (id === activeChatId) router.push("/");
  };

  return (
    <Sidebar
      chats={chats}
      activeChatId={activeChatId}
      closed={closed}
      mobileOpen={mobileOpen}
      onClose={onClose}
      onNewChat={() => router.push(`/chats/${createChat()}`)}
      onSelectChat={handleSelectChat}
      onRenameChat={renameChat}
      onTogglePinChat={togglePinChat}
      onDeleteChat={handleDeleteChat}
    />
  );
}
