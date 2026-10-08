"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useLatest } from "@/lib/use-latest";
import type { ChatMessage } from "@/types/chats";

const STREAM_ERROR = "Something went wrong. Please try again.";

/** Earlier turns sent along for signed-out users, whose chats are not stored. */
export type GuestHistory = { role: "USER" | "ASSISTANT"; content: string }[];

/**
 * Holds the in-memory messages of every opened chat and streams replies from /api/chat.
 * The returned actions keep a stable identity, so only message readers re-render per chunk.
 */
export function useChatMessages(onFirstReply: (chatId: string) => void) {
  const [messagesByChat, setMessagesByChat] = useState<
    Record<string, ChatMessage[]>
  >({});
  const [streamingChatIds, setStreamingChatIds] = useState<string[]>([]);
  const controllersRef = useRef<Map<string, AbortController>>(new Map());
  const onFirstReplyRef = useLatest(onFirstReply);

  useEffect(() => {
    const controllers = controllersRef.current;
    return () => controllers.forEach((controller) => controller.abort());
  }, []);

  const actions = useMemo(() => {
    const stopStreaming = (chatId: string) => {
      controllersRef.current.get(chatId)?.abort();
      controllersRef.current.delete(chatId);
      setStreamingChatIds((prev) => prev.filter((id) => id !== chatId));
    };

    const addMessage = (chatId: string, message: ChatMessage) => {
      setMessagesByChat((prev) => ({
        ...prev,
        [chatId]: [...(prev[chatId] ?? []), message],
      }));
    };

    /** Stores messages loaded from the database, unless the chat already has messages in memory. */
    const seedMessages = (chatId: string, messages: ChatMessage[]) => {
      setMessagesByChat((prev) =>
        chatId in prev ? prev : { ...prev, [chatId]: messages },
      );
    };

    const removeMessages = (chatId: string) => {
      setMessagesByChat((prev) =>
        Object.fromEntries(
          Object.entries(prev).filter(([id]) => id !== chatId),
        ),
      );
    };

    const updateMessage = (
      chatId: string,
      id: string,
      changes: Partial<ChatMessage>,
    ) => {
      setMessagesByChat((prev) => ({
        ...prev,
        [chatId]: (prev[chatId] ?? []).map((message) =>
          message.id === id ? { ...message, ...changes } : message,
        ),
      }));
    };

    const dropMessage = (chatId: string, id: string) => {
      setMessagesByChat((prev) => ({
        ...prev,
        [chatId]: (prev[chatId] ?? []).filter((message) => message.id !== id),
      }));
    };

    /** Streams the reply from the chat route; the server saves both messages. */
    const streamReply = async (
      chatId: string,
      messageId: string,
      text: string,
      isFirstTurn: boolean,
      guestHistory?: GuestHistory,
    ) => {
      const controller = new AbortController();
      controllersRef.current.set(chatId, controller);
      setStreamingChatIds((prev) => [...prev, chatId]);
      const placeholderId = crypto.randomUUID();
      addMessage(chatId, {
        id: placeholderId,
        role: "assistant",
        text: "",
        fileNames: [],
      });
      let frame = 0;
      // The placeholder takes the server's message id once the response starts.
      let replyId = placeholderId;
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chatId,
            messageId,
            text,
            history: guestHistory,
          }),
          signal: controller.signal,
        });
        if (!response.ok || !response.body) {
          const body = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(body?.error ?? STREAM_ERROR);
        }
        const serverId = response.headers.get("X-Message-Id");
        if (serverId) updateMessage(chatId, placeholderId, { id: serverId });
        const id = serverId ?? placeholderId;
        replyId = id;
        const reader = response.body
          .pipeThrough(new TextDecoderStream())
          .getReader();
        let reply = "";
        // Chunks arrive faster than the screen refreshes, so render at most once per frame.
        const flush = () => {
          frame = 0;
          updateMessage(chatId, id, { text: reply });
        };
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          reply += value;
          if (!frame) frame = requestAnimationFrame(flush);
        }
        cancelAnimationFrame(frame);
        // The model failed (e.g. quota) without sending anything.
        if (!reply.trim()) throw new Error(STREAM_ERROR);
        updateMessage(chatId, id, { text: reply });
        if (isFirstTurn) onFirstReplyRef.current(chatId);
      } catch (error) {
        cancelAnimationFrame(frame);
        dropMessage(chatId, replyId);
        if (!controller.signal.aborted) {
          toast.error(error instanceof Error ? error.message : STREAM_ERROR);
        }
      } finally {
        if (controllersRef.current.get(chatId) === controller)
          stopStreaming(chatId);
      }
    };

    return {
      addMessage,
      seedMessages,
      removeMessages,
      stopStreaming,
      streamReply,
    };
  }, [onFirstReplyRef]);

  return { messagesByChat, streamingChatIds, actions };
}
