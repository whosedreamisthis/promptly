"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import ChatInput from "@/components/chat/ChatInput";
import ChatThread from "@/components/chat/ChatThread";
import { useChats, useMessages } from "@/components/chat/ChatsProvider";
import Logo from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { GUEST_SIGN_IN_PROMPT_AFTER } from "@/lib/validations/messages";
import type { ChatMessage, ChatSubmission } from "@/types/chats";

const NO_MESSAGES: ChatMessage[] = [];

interface ChatViewProps {
  /** Omitted on the home page, which uses a pre-generated id until the first message. */
  chatId?: string;
  /** Messages saved in the database, shown until the chat has messages in memory. */
  initialMessages?: ChatMessage[];
}

export default function ChatView({
  chatId,
  initialMessages = NO_MESSAGES,
}: ChatViewProps) {
  const { user } = useUser();
  // Generated up front so the chat is saved under this id once the user sends a message.
  const draftChatIdRef = useRef<string | null>(null);

  useEffect(() => {
    draftChatIdRef.current ??= crypto.randomUUID();
  }, []);

  const router = useRouter();
  const { chats, notebooks, isGuest, guestChatId, seedMessages, sendMessage } =
    useChats();
  const { messagesByChat, streamingChatIds } = useMessages();

  useEffect(() => {
    // Seeding is a no-op once the chat has messages in memory.
    if (chatId) seedMessages(chatId, initialMessages);
  }, [chatId, initialMessages, seedMessages]);
  const chat = chats.find((item) => item.id === chatId);
  const notebook = notebooks.find((item) => item.id === chat?.notebookId);

  const activeId = chatId ?? (isGuest ? guestChatId : undefined);
  const messages = activeId
    ? (messagesByChat[activeId] ?? initialMessages)
    : NO_MESSAGES;
  const streaming = activeId ? streamingChatIds.includes(activeId) : false;
  const userMessageCount = messages.filter(
    (message) => message.role === "user",
  ).length;

  const handleSubmit = async (submission: ChatSubmission) => {
    const id = await sendMessage(
      activeId ?? draftChatIdRef.current ?? crypto.randomUUID(),
      submission,
    );
    if (id && !chatId && !isGuest) router.push(`/chats/${id}`);
  };

  const greeting = user?.firstName
    ? `Hi ${user.firstName}, let's get into it`
    : "Hi there, let's get into it";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {chat && notebook && (
        <Breadcrumb className="shrink-0 px-14 py-2">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href={`/notebooks/${notebook.id}`}
                  className="block max-w-48 truncate"
                >
                  {notebook.title}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="block max-w-64 truncate">
                {chat.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-4 text-center">
            <Logo className="h-16 w-16" />
            <h1 className="text-3xl font-medium text-foreground">{greeting}</h1>
          </div>
        ) : (
          <ChatThread messages={messages} streaming={streaming} />
        )}
      </div>
      <div className="shrink-0 px-14 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2">
        {isGuest && (
          <div className="mx-auto mb-2 flex w-full max-w-3xl items-center justify-between gap-3 rounded-md bg-card px-3 py-2 text-sm text-muted-foreground">
            <p>
              {userMessageCount >= GUEST_SIGN_IN_PROMPT_AFTER
                ? "Sign in to keep chatting and save your chats."
                : "Your chats won't be saved unless you sign in."}
            </p>
            <Button asChild size="sm" className="shrink-0 rounded-md">
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </div>
        )}
        <ChatInput disabled={streaming} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
