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
  const {
    chats,
    notebooks,
    createChat,
    renameChat,
    togglePinChat,
    deleteChat,
    moveChatToNotebook,
    createNotebook,
    renameNotebook,
    togglePinNotebook,
    deleteNotebook,
  } = useChats();
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

  const handleNewChat = async () => {
    const id = await createChat();
    if (id) router.push(`/chats/${id}`);
  };

  return (
    <Sidebar
      chats={chats}
      notebooks={notebooks}
      activeChatId={activeChatId}
      closed={closed}
      mobileOpen={mobileOpen}
      onClose={onClose}
      onNewChat={handleNewChat}
      onSelectChat={handleSelectChat}
      onRenameChat={renameChat}
      onTogglePinChat={togglePinChat}
      onDeleteChat={handleDeleteChat}
      onMoveChat={moveChatToNotebook}
      onNewNotebook={createNotebook}
      onRenameNotebook={renameNotebook}
      onTogglePinNotebook={togglePinNotebook}
      onDeleteNotebook={deleteNotebook}
    />
  );
}
