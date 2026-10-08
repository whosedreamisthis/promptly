export const NEW_CHAT_TITLE = "New Chat";

export interface Chat {
  id: string;
  title: string;
  pinned: boolean;
  notebookId: string | null;
}

export interface Notebook {
  id: string;
  title: string;
  pinned: boolean;
}

export interface ChatsData {
  chats: Chat[];
  notebooks: Notebook[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  fileNames: string[];
}

export interface ChatSubmission {
  text: string;
  files: File[];
}
