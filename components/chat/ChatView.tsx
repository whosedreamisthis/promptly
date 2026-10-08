"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import ChatInput, { type ChatSubmission } from "@/components/chat/ChatInput";
import ChatThread, { type ChatMessage } from "@/components/chat/ChatThread";
import Logo from "@/components/layout/Logo";

const MOCK_REPLY =
  "This is a placeholder reply. The Promptly AI backend isn't connected yet, so I can't answer for real, but your message and attachments came through fine.";
const STREAM_INTERVAL_MS = 40;

export default function ChatView() {
  const { user } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current);
    },
    [],
  );

  const streamReply = () => {
    const words = MOCK_REPLY.split(" ");
    const id = crypto.randomUUID();
    let count = 0;
    setStreaming(true);
    setMessages((prev) => [
      ...prev,
      { id, role: "assistant", text: "", fileNames: [] },
    ]);
    timerRef.current = setInterval(() => {
      count += 1;
      const text = words.slice(0, count).join(" ");
      setMessages((prev) =>
        prev.map((message) =>
          message.id === id ? { ...message, text } : message,
        ),
      );
      if (count >= words.length) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        setStreaming(false);
      }
    }, STREAM_INTERVAL_MS);
  };

  const handleSubmit = ({ text, files }: ChatSubmission) => {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "user",
        text,
        fileNames: files.map((file) => file.name),
      },
    ]);
    streamReply();
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
