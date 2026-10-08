"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  autoTitleChat,
  createChat as createChatAction,
  deleteChat as deleteChatAction,
  moveChatToNotebook as moveChatAction,
  renameChat as renameChatAction,
  togglePinChat as togglePinChatAction,
} from "@/actions/chats";
import { addMessage as addMessageAction } from "@/actions/messages";
import {
  createNotebook as createNotebookAction,
  deleteNotebook as deleteNotebookAction,
  renameNotebook as renameNotebookAction,
  togglePinNotebook as togglePinNotebookAction,
} from "@/actions/notebooks";
import type { ChatSubmission } from "@/components/chat/ChatInput";
import type { ChatMessage } from "@/components/chat/ChatThread";
import type { ActionResult } from "@/types/actions";
import {
  NEW_CHAT_TITLE,
  type Chat,
  type ChatsData,
  type Notebook,
} from "@/types/chats";

const MOCK_REPLY =
  "This is a placeholder reply. The Promptly AI backend isn't connected yet, so I can't answer for real, but your message and attachments came through fine.";
const STREAM_INTERVAL_MS = 40;
const TITLE_MAX_LENGTH = 40;
const NEW_NOTEBOOK_TITLE = "Untitled notebook";

interface ChatsContextValue {
  chats: Chat[];
  notebooks: Notebook[];
  messagesByChat: Record<string, ChatMessage[]>;
  /** Stores messages loaded from the database, unless the chat already has messages in memory. */
  seedMessages: (chatId: string, messages: ChatMessage[]) => void;
  streamingChatIds: string[];
  /** Creates an empty chat and returns its id (reuses an untouched empty one), or null if saving failed. */
  createChat: () => Promise<string | null>;
  /** Sends a message, saving the chat first when it is new. Resolves with the chat id, or null if saving failed. */
  sendMessage: (
    chatId: string,
    submission: ChatSubmission,
  ) => Promise<string | null>;
  renameChat: (id: string, title: string) => void;
  togglePinChat: (id: string) => void;
  deleteChat: (id: string) => void;
  moveChatToNotebook: (chatId: string, notebookId: string | null) => void;
  /** Creates a notebook and returns its id. */
  createNotebook: () => string;
  renameNotebook: (id: string, title: string) => void;
  togglePinNotebook: (id: string) => void;
  deleteNotebook: (id: string) => void;
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

/** Awaits a server action; on failure shows its error and calls `rollback`. */
async function persist<T>(
  action: Promise<ActionResult<T>>,
  rollback: () => void,
): Promise<boolean> {
  const result = await action;
  if (!result.success) {
    rollback();
    toast.error(result.error);
  }
  return result.success;
}

interface ChatsProviderProps {
  initialData: ChatsData;
  children: React.ReactNode;
}

export default function ChatsProvider({
  initialData,
  children,
}: ChatsProviderProps) {
  const [chats, setChats] = useState<Chat[]>(initialData.chats);
  const [notebooks, setNotebooks] = useState<Notebook[]>(
    initialData.notebooks,
  );
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

  const seedMessages = (chatId: string, messages: ChatMessage[]) => {
    setMessagesByChat((prev) =>
      chatId in prev ? prev : { ...prev, [chatId]: messages },
    );
  };

  const saveMessage = (
    chatId: string,
    id: string,
    role: "USER" | "ASSISTANT",
    content: string,
  ) => {
    if (!content.trim()) return;
    void persist(addMessageAction({ id, chatId, role, content }), () => {});
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
      if (count >= words.length) {
        stopStreaming(chatId);
        saveMessage(chatId, messageId, "ASSISTANT", MOCK_REPLY);
      }
    }, STREAM_INTERVAL_MS);
    timersRef.current.set(chatId, timer);
  };

  const updateChat = (id: string, changes: Partial<Chat>) => {
    setChats((prev) =>
      prev.map((chat) => (chat.id === id ? { ...chat, ...changes } : chat)),
    );
  };

  const removeChat = (id: string) => {
    stopStreaming(id);
    setChats((prev) => prev.filter((chat) => chat.id !== id));
    setMessagesByChat((prev) =>
      Object.fromEntries(
        Object.entries(prev).filter(([chatId]) => chatId !== id),
      ),
    );
  };

  const addChat = (id: string, title: string) => {
    setChats((prev) => [
      { id, title, pinned: false, notebookId: null },
      ...prev,
    ]);
  };

  const createChat = async () => {
    const [newest] = chats;
    if (
      newest?.title === NEW_CHAT_TITLE &&
      (messagesByChat[newest.id] ?? []).length === 0
    ) {
      return newest.id;
    }
    const id = crypto.randomUUID();
    addChat(id, NEW_CHAT_TITLE);
    const saved = await persist(createChatAction({ id }), () => removeChat(id));
    return saved ? id : null;
  };

  const sendMessage = async (id: string, submission: ChatSubmission) => {
    const existing = chats.find((chat) => chat.id === id);
    const title = titleFor(submission);
    if (!existing) {
      addChat(id, title);
      const saved = await persist(createChatAction({ id, title }), () =>
        removeChat(id),
      );
      if (!saved) return null;
    } else if (
      existing.title === NEW_CHAT_TITLE &&
      (messagesByChat[id] ?? []).length === 0
    ) {
      updateChat(id, { title });
      void autoTitleChat({ chatId: id, title });
    }
    const messageId = crypto.randomUUID();
    saveMessage(id, messageId, "USER", submission.text);
    addMessage(id, {
      id: messageId,
      role: "user",
      text: submission.text,
      fileNames: submission.files.map((file) => file.name),
    });
    streamReply(id);
    return id;
  };

  const renameChat = (id: string, title: string) => {
    const previous = chats.find((chat) => chat.id === id)?.title;
    updateChat(id, { title });
    void persist(renameChatAction({ chatId: id, title }), () => {
      if (previous !== undefined) updateChat(id, { title: previous });
    });
  };

  const togglePinChat = (id: string) => {
    const pinned = chats.find((chat) => chat.id === id)?.pinned ?? false;
    updateChat(id, { pinned: !pinned });
    void persist(togglePinChatAction({ chatId: id }), () =>
      updateChat(id, { pinned }),
    );
  };

  const deleteChat = (id: string) => {
    const removed = chats.find((chat) => chat.id === id);
    removeChat(id);
    void persist(deleteChatAction({ chatId: id }), () => {
      if (removed) setChats((prev) => [removed, ...prev]);
    });
  };

  const moveChatToNotebook = (chatId: string, notebookId: string | null) => {
    const previous = chats.find((chat) => chat.id === chatId)?.notebookId;
    updateChat(chatId, { notebookId });
    void persist(moveChatAction({ chatId, notebookId }), () =>
      updateChat(chatId, { notebookId: previous ?? null }),
    );
  };

  const updateNotebook = (id: string, changes: Partial<Notebook>) => {
    setNotebooks((prev) =>
      prev.map((notebook) =>
        notebook.id === id ? { ...notebook, ...changes } : notebook,
      ),
    );
  };

  const createNotebook = () => {
    const id = crypto.randomUUID();
    setNotebooks((prev) => [
      { id, title: NEW_NOTEBOOK_TITLE, pinned: false },
      ...prev,
    ]);
    void persist(createNotebookAction({ id, title: NEW_NOTEBOOK_TITLE }), () =>
      setNotebooks((prev) => prev.filter((notebook) => notebook.id !== id)),
    );
    return id;
  };

  const renameNotebook = (id: string, title: string) => {
    const previous = notebooks.find((notebook) => notebook.id === id)?.title;
    updateNotebook(id, { title });
    void persist(renameNotebookAction({ notebookId: id, title }), () => {
      if (previous !== undefined) updateNotebook(id, { title: previous });
    });
  };

  const togglePinNotebook = (id: string) => {
    const pinned =
      notebooks.find((notebook) => notebook.id === id)?.pinned ?? false;
    updateNotebook(id, { pinned: !pinned });
    void persist(togglePinNotebookAction({ notebookId: id }), () =>
      updateNotebook(id, { pinned }),
    );
  };

  const deleteNotebook = (id: string) => {
    const removed = notebooks.find((notebook) => notebook.id === id);
    const memberIds = chats
      .filter((chat) => chat.notebookId === id)
      .map((chat) => chat.id);
    setNotebooks((prev) => prev.filter((notebook) => notebook.id !== id));
    setChats((prev) =>
      prev.map((chat) =>
        chat.notebookId === id ? { ...chat, notebookId: null } : chat,
      ),
    );
    void persist(deleteNotebookAction({ notebookId: id }), () => {
      if (removed) setNotebooks((prev) => [removed, ...prev]);
      setChats((prev) =>
        prev.map((chat) =>
          memberIds.includes(chat.id) ? { ...chat, notebookId: id } : chat,
        ),
      );
    });
  };

  return (
    <ChatsContext.Provider
      value={{
        chats,
        notebooks,
        messagesByChat,
        seedMessages,
        streamingChatIds,
        createChat,
        sendMessage,
        renameChat,
        togglePinChat,
        deleteChat,
        moveChatToNotebook,
        createNotebook,
        renameNotebook,
        togglePinNotebook,
        deleteNotebook,
      }}
    >
      {children}
    </ChatsContext.Provider>
  );
}
