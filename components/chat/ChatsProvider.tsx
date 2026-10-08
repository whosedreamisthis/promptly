"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ChatSubmission } from "@/components/chat/ChatInput";
import type { ChatMessage } from "@/components/chat/ChatThread";
import { MOCK_CHATS, type Chat } from "@/lib/mock-chats";

const MOCK_REPLY =
  "This is a placeholder reply. The Promptly AI backend isn't connected yet, so I can't answer for real, but your message and attachments came through fine.";
const STREAM_INTERVAL_MS = 40;
const TITLE_MAX_LENGTH = 40;
const NEW_CHAT_TITLE = "New chat";

interface ChatsContextValue {
  chats: Chat[];
  messagesByChat: Record<string, ChatMessage[]>;
  streamingChatIds: string[];
  /** Creates an empty chat and returns its id (reuses an untouched empty one). */
  createChat: () => string;
  /** Sends a message; creates a new chat when `chatId` is null. Returns the chat id. */
  sendMessage: (chatId: string | null, submission: ChatSubmission) => string;
  renameChat: (id: string, title: string) => void;
  togglePinChat: (id: string) => void;
  deleteChat: (id: string) => void;
}

const ChatsContext = createContext<ChatsContextValue | null>(null);

export function useChats(): ChatsContextValue {
  const value = useContext(ChatsContext);
  if (!value) throw new Error("useChats must be used inside ChatsProvider");
  return value;
}

function titleFor({ text, files }: ChatSubmission): string {
  const source = text || files[0]?.name || NEW_CHAT_TITLE;
  return source.length > TITLE_MAX_LENGTH
    ? `${source.slice(0, TITLE_MAX_LENGTH).trimEnd()}...`
    : source;
}

export default function ChatsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [chats, setChats] = useState<Chat[]>(MOCK_CHATS);
  const [messagesByChat, setMessagesByChat] = useState<
    Record<string, ChatMessage[]>
  >({});
  const [streamingChatIds, setStreamingChatIds] = useState<string[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setInterval>>>(
    new Map(),
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((timer) => clearInterval(timer));
  }, []);

  const stopStreaming = (chatId: string) => {
    const timer = timersRef.current.get(chatId);
    if (timer) clearInterval(timer);
    timersRef.current.delete(chatId);
    setStreamingChatIds((prev) => prev.filter((id) => id !== chatId));
  };

  const addMessage = (chatId: string, message: ChatMessage) => {
    setMessagesByChat((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] ?? []), message],
    }));
  };

  const streamReply = (chatId: string) => {
    const words = MOCK_REPLY.split(" ");
    const messageId = crypto.randomUUID();
    let count = 0;
    setStreamingChatIds((prev) => [...prev, chatId]);
    addMessage(chatId, {
      id: messageId,
      role: "assistant",
      text: "",
      fileNames: [],
    });
    const timer = setInterval(() => {
      count += 1;
      const text = words.slice(0, count).join(" ");
      setMessagesByChat((prev) => ({
        ...prev,
        [chatId]: (prev[chatId] ?? []).map((message) =>
          message.id === messageId ? { ...message, text } : message,
        ),
      }));
      if (count >= words.length) stopStreaming(chatId);
    }, STREAM_INTERVAL_MS);
    timersRef.current.set(chatId, timer);
  };

  const createChat = () => {
    const [newest] = chats;
    if (
      newest?.title === NEW_CHAT_TITLE &&
      (messagesByChat[newest.id] ?? []).length === 0
    ) {
      return newest.id;
    }
    const id = crypto.randomUUID();
    setChats((prev) => [{ id, title: NEW_CHAT_TITLE }, ...prev]);
    return id;
  };

  const sendMessage = (chatId: string | null, submission: ChatSubmission) => {
    const id = chatId ?? crypto.randomUUID();
    const existing = chats.find((chat) => chat.id === id);
    if (!existing) {
      setChats((prev) => [{ id, title: titleFor(submission) }, ...prev]);
    } else if (
      existing.title === NEW_CHAT_TITLE &&
      (messagesByChat[id] ?? []).length === 0
    ) {
      renameChat(id, titleFor(submission));
    }
    addMessage(id, {
      id: crypto.randomUUID(),
      role: "user",
      text: submission.text,
      fileNames: submission.files.map((file) => file.name),
    });
    streamReply(id);
    return id;
  };

  const renameChat = (id: string, title: string) => {
    setChats((prev) =>
      prev.map((chat) => (chat.id === id ? { ...chat, title } : chat)),
    );
  };

  const togglePinChat = (id: string) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === id ? { ...chat, pinned: !chat.pinned } : chat,
      ),
    );
  };

  const deleteChat = (id: string) => {
    stopStreaming(id);
    setChats((prev) => prev.filter((chat) => chat.id !== id));
    setMessagesByChat((prev) =>
      Object.fromEntries(
        Object.entries(prev).filter(([chatId]) => chatId !== id),
      ),
    );
  };

  return (
    <ChatsContext.Provider
      value={{
        chats,
        messagesByChat,
        streamingChatIds,
        createChat,
        sendMessage,
        renameChat,
        togglePinChat,
        deleteChat,
      }}
    >
      {children}
    </ChatsContext.Provider>
  );
}
