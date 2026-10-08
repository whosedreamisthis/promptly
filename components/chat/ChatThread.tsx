"use client";

import { useEffect, useRef } from "react";
import { FileText } from "lucide-react";
import ChatMarkdown from "@/components/chat/ChatMarkdown";
import { Badge } from "@/components/ui/badge";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  fileNames: string[];
}

interface ChatThreadProps {
  messages: ChatMessage[];
}

function ThinkingIndicator() {
  return (
    <div
      role="status"
      className="flex items-center gap-2 rounded-2xl border border-surface-border bg-surface-card px-4 py-3 text-sm text-muted-foreground"
    >
      <span className="flex gap-1" aria-hidden="true">
        <span className="size-2 animate-bounce rounded-full bg-muted-foreground/60" />
        <span className="size-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:150ms]" />
        <span className="size-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:300ms]" />
      </span>
      Promptly is thinking...
    </div>
  );
}

export default function ChatThread({ messages }: ChatThreadProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6">
      {messages.map((message) => {
        const isUser = message.role === "user";
        return (
          <div
            key={message.id}
            className={`flex flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}
          >
            {message.fileNames.length > 0 && (
              <ul className="flex flex-wrap justify-end gap-2">
                {message.fileNames.map((name, index) => (
                  <li key={`${name}-${index}`}>
                    <Badge
                      variant="outline"
                      className="h-auto gap-2 rounded-md bg-white px-2 py-1 text-sm font-normal"
                    >
                      <FileText className="text-muted-foreground" />
                      {name}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
            {!isUser && !message.text && <ThinkingIndicator />}
            {message.text && (
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2 text-base ${
                  isUser
                    ? "whitespace-pre-wrap bg-pastel-lavender"
                    : "border border-surface-border bg-surface-card"
                }`}
              >
                {isUser ? (
                  message.text
                ) : (
                  <ChatMarkdown>{message.text}</ChatMarkdown>
                )}
              </div>
            )}
          </div>
        );
      })}
      <div ref={endRef} />
    </div>
  );
}
