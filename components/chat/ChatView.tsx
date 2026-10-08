"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import ChatInput, { type ChatSubmission } from "@/components/chat/ChatInput";
import ChatThread from "@/components/chat/ChatThread";
import { useChats } from "@/components/chat/ChatsProvider";
import Logo from "@/components/layout/Logo";

interface ChatViewProps {
  /** Omitted on the home page, which uses a pre-generated id until the first message. */
  chatId?: string;
}

export default function ChatView({ chatId }: ChatViewProps) {
  const { user } = useUser();
  // Generated up front so the chat is saved under this id once the user sends a message.
  const draftChatIdRef = useRef<string | null>(null);

  useEffect(() => {
    draftChatIdRef.current ??= crypto.randomUUID();
  }, []);

  const router = useRouter();
  const { messagesByChat, streamingChatIds, sendMessage } = useChats();

  const messages = chatId ? (messagesByChat[chatId] ?? []) : [];
  const streaming = chatId ? streamingChatIds.includes(chatId) : false;

  const handleSubmit = async (submission: ChatSubmission) => {
    const id = await sendMessage(
      chatId ?? draftChatIdRef.current ?? crypto.randomUUID(),
      submission,
    );
    if (id && !chatId) router.push(`/chats/${id}`);
  };

  const greeting = user?.firstName
    ? `Hi ${user.firstName}, let's get into it`
    : "Hi there, let's get into it";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-4 text-center">
            <Logo className="h-16 w-16" />
            <h1 className="text-3xl font-medium text-foreground">{greeting}</h1>
          </div>
        ) : (
          <ChatThread messages={messages} />
        )}
      </div>
      <div className="shrink-0 px-14 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2">
        <ChatInput disabled={streaming} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
