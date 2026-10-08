"use client";

import { memo, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/chats";

// Markdown rendering is only needed once a reply exists, so keep it out of the first load.
const ChatMarkdown = dynamic(() => import("@/components/chat/ChatMarkdown"), {
  loading: () => <span className="text-muted-foreground">...</span>,
});

interface ChatThreadProps {
  messages: ChatMessage[];
  streaming: boolean;
}

function ThinkingIndicator() {
  return (
    <div
      aria-hidden="true"
      className="flex items-center gap-2 rounded-2xl border border-surface-border bg-surface-card px-4 py-3 text-sm text-muted-foreground"
    >
      <span className="flex gap-1">
        <span className="size-2 animate-bounce rounded-full bg-muted-foreground/60" />
        <span className="size-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:150ms]" />
        <span className="size-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:300ms]" />
      </span>
      Promptly is thinking...
    </div>
  );
}

const MessageRow = memo(function MessageRow({
  message,
}: {
  message: ChatMessage;
}) {
  const isUser = message.role === "user";
  return (
    <div
      className={cn("flex flex-col gap-2", isUser ? "items-end" : "items-start")}
    >
      {message.fileNames.length > 0 && (
        <ul className="flex max-w-full flex-wrap justify-end gap-2">
          {message.fileNames.map((name, index) => (
            <li key={`${name}-${index}`} className="max-w-full">
              <Badge
                variant="outline"
                className="h-auto max-w-full gap-2 rounded-md bg-white px-2 py-1 text-sm font-normal"
              >
                <FileText className="text-muted-foreground" />
                <span className="truncate">{name}</span>
              </Badge>
            </li>
          ))}
        </ul>
      )}
      {!isUser && !message.text && <ThinkingIndicator />}
      {message.text && (
        <div
          className={cn(
            "min-w-0 max-w-[85%] overflow-x-auto rounded-2xl px-4 py-2 text-base",
            isUser
              ? "whitespace-pre-wrap bg-user-bubble text-user-bubble-foreground"
              : "border border-surface-border bg-surface-card",
          )}
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
});

/** Text for the screen reader live region; empty while a reply is streaming in. */
function statusText(messages: ChatMessage[], streaming: boolean): string {
  const last = messages.at(-1);
  if (streaming) return last?.text ? "" : "Promptly is thinking...";
  return last?.role === "assistant" ? "Promptly has replied." : "";
}

export default function ChatThread({ messages, streaming }: ChatThreadProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6">
      <div aria-live="polite" className="sr-only">
        {statusText(messages, streaming)}
      </div>
      {messages.map((message) => (
        <MessageRow key={message.id} message={message} />
      ))}
      <div ref={endRef} />
    </div>
  );
}
