"use client";

import { useEffect, useRef } from "react";
import { FileText } from "lucide-react";
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
            {message.text && (
              <p
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-base ${
                  isUser
                    ? "bg-pastel-lavender"
                    : "border border-surface-border bg-surface-card"
                }`}
              >
                {message.text}
              </p>
            )}
          </div>
        );
      })}
      <div ref={endRef} />
    </div>
  );
}
