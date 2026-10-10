"use client";

import { useRouter } from "next/navigation";
import { useChats } from "@/components/chat/ChatsProvider";

/**
 * Returns a function that opens a new chat: the home screen for signed-out users,
 * otherwise a fresh (or reused empty) saved chat. `onReady` runs just before navigating,
 * and is skipped if the chat could not be created.
 */
export function useNewChat() {
  const router = useRouter();
  const { isGuest, createChat } = useChats();

  return async (onReady?: () => void) => {
    const id = await createChat();
    if (!isGuest && !id) return;
    onReady?.();
    router.push(isGuest ? "/" : `/chats/${id}`);
  };
}
