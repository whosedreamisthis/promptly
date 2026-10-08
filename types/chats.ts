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
