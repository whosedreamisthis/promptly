"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import {
  autoTitleChat,
  generateChatTitle,
  createChat as createChatAction,
  deleteChat as deleteChatAction,
  moveChatToNotebook as moveChatAction,
  renameChat as renameChatAction,
  setChatPinned as setChatPinnedAction,
} from "@/actions/chats";
import { useChatMessages } from "@/components/chat/useChatMessages";
import { useNotebooks } from "@/components/chat/useNotebooks";
import { persist } from "@/lib/persist";
import { useLatest } from "@/lib/use-latest";
import {
  NEW_CHAT_TITLE,
  type Chat,
  type ChatMessage,
  type ChatsData,
  type ChatSubmission,
  type Notebook,
} from "@/types/chats";

const TITLE_MAX_LENGTH = 40;

interface ChatsActions {
  /** Stores messages loaded from the database, unless the chat already has messages in memory. */
  seedMessages: (chatId: string, messages: ChatMessage[]) => void;
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

interface ChatsContextValue extends ChatsActions {
  chats: Chat[];
  notebooks: Notebook[];
}

interface MessagesContextValue {
  messagesByChat: Record<string, ChatMessage[]>;
  streamingChatIds: string[];
}

const ChatsContext = createContext<ChatsContextValue | null>(null);
const MessagesContext = createContext<MessagesContextValue | null>(null);

/** Chats, notebooks and their actions. Does not change while a reply streams. */
export function useChats(): ChatsContextValue {
  const value = useContext(ChatsContext);
  if (!value) throw new Error("useChats must be used inside ChatsProvider");
  return value;
}

/** Messages and streaming state. Changes on every rendered chunk of a reply. */
export function useMessages(): MessagesContextValue {
  const value = useContext(MessagesContext);
  if (!value) throw new Error("useMessages must be used inside ChatsProvider");
  return value;
}

function titleFor({ text, files }: ChatSubmission): string {
  const source = text || files[0]?.name || NEW_CHAT_TITLE;
  return source.length > TITLE_MAX_LENGTH
    ? `${source.slice(0, TITLE_MAX_LENGTH).trimEnd()}...`
    : source;
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
  const chatsRef = useLatest(chats);

  const updateChat = useCallback((id: string, changes: Partial<Chat>) => {
    setChats((prev) =>
      prev.map((chat) => (chat.id === id ? { ...chat, ...changes } : chat)),
    );
  }, []);

  const applyGeneratedTitle = useCallback(
    async (chatId: string) => {
      try {
        const result = await generateChatTitle({ chatId });
        if (result.success && result.data.title) {
          updateChat(chatId, { title: result.data.title });
        }
      } catch (error) {
        console.error(error);
      }
    },
    [updateChat],
  );

  const {
    messagesByChat,
    streamingChatIds,
    actions: messageActions,
  } = useChatMessages(applyGeneratedTitle);
  const messagesRef = useLatest(messagesByChat);

  const {
    notebooks,
    createNotebook,
    renameNotebook,
    togglePinNotebook,
    deleteNotebook,
  } = useNotebooks(initialData.notebooks, chatsRef, setChats);

  const chatActions = useMemo(() => {
    const removeChat = (id: string) => {
      messageActions.stopStreaming(id);
      setChats((prev) => prev.filter((chat) => chat.id !== id));
      messageActions.removeMessages(id);
    };

    const addChat = (id: string, title: string) => {
      setChats((prev) => [
        { id, title, pinned: false, notebookId: null },
        ...prev,
      ]);
    };

    const hasNoMessages = (id: string) =>
      (messagesRef.current[id] ?? []).length === 0;

    const createChat = async () => {
      const [newest] = chatsRef.current;
      if (newest?.title === NEW_CHAT_TITLE && hasNoMessages(newest.id)) {
        return newest.id;
      }
      const id = crypto.randomUUID();
      addChat(id, NEW_CHAT_TITLE);
      const saved = await persist(createChatAction({ id }), () =>
        removeChat(id),
      );
      return saved ? id : null;
    };

    const sendMessage = async (id: string, submission: ChatSubmission) => {
      if (!submission.text) {
        toast.error("Type a message to send with your files");
        return null;
      }
      const existing = chatsRef.current.find((chat) => chat.id === id);
      const title = titleFor(submission);
      const isFirstTurn = hasNoMessages(id);
      if (!existing) {
        addChat(id, title);
        const saved = await persist(createChatAction({ id, title }), () =>
          removeChat(id),
        );
        if (!saved) return null;
      } else if (existing.title === NEW_CHAT_TITLE && isFirstTurn) {
        updateChat(id, { title });
        autoTitleChat({ chatId: id, title }).catch(console.error);
      }
      const messageId = crypto.randomUUID();
      messageActions.addMessage(id, {
        id: messageId,
        role: "user",
        text: submission.text,
        fileNames: submission.files.map((file) => file.name),
      });
      void messageActions.streamReply(id, messageId, submission.text, isFirstTurn);
      return id;
    };

    const renameChat = (id: string, title: string) => {
      const previous = chatsRef.current.find((chat) => chat.id === id)?.title;
      updateChat(id, { title });
      void persist(renameChatAction({ chatId: id, title }), () => {
        if (previous !== undefined) updateChat(id, { title: previous });
      });
    };

    const togglePinChat = (id: string) => {
      const wasPinned =
        chatsRef.current.find((chat) => chat.id === id)?.pinned ?? false;
      updateChat(id, { pinned: !wasPinned });
      void persist(setChatPinnedAction({ chatId: id, pinned: !wasPinned }), () =>
        updateChat(id, { pinned: wasPinned }),
      );
    };

    const deleteChat = (id: string) => {
      const removed = chatsRef.current.find((chat) => chat.id === id);
      removeChat(id);
      void persist(deleteChatAction({ chatId: id }), () => {
        if (removed) setChats((prev) => [removed, ...prev]);
      });
    };

    const moveChatToNotebook = (chatId: string, notebookId: string | null) => {
      const previous = chatsRef.current.find(
        (chat) => chat.id === chatId,
      )?.notebookId;
      updateChat(chatId, { notebookId });
      void persist(moveChatAction({ chatId, notebookId }), () =>
        updateChat(chatId, { notebookId: previous ?? null }),
      );
    };

    return {
      seedMessages: messageActions.seedMessages,
      createChat,
      sendMessage,
      renameChat,
      togglePinChat,
      deleteChat,
      moveChatToNotebook,
    };
  }, [chatsRef, messagesRef, messageActions, updateChat]);

  const chatsValue = useMemo<ChatsContextValue>(
    () => ({
      chats,
      notebooks,
      ...chatActions,
      createNotebook,
      renameNotebook,
      togglePinNotebook,
      deleteNotebook,
    }),
    [
      chats,
      notebooks,
      chatActions,
      createNotebook,
      renameNotebook,
      togglePinNotebook,
      deleteNotebook,
    ],
  );

  const messagesValue = useMemo<MessagesContextValue>(
    () => ({ messagesByChat, streamingChatIds }),
    [messagesByChat, streamingChatIds],
  );

  return (
    <ChatsContext.Provider value={chatsValue}>
      <MessagesContext.Provider value={messagesValue}>
        {children}
      </MessagesContext.Provider>
    </ChatsContext.Provider>
  );
}
