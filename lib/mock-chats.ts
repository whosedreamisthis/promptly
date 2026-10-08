export interface Chat {
  id: string;
  title: string;
  pinned?: boolean;
}

export const MOCK_CHATS: Chat[] = [
  { id: "1", title: "Brainstorm names for a coffee shop" },
  { id: "2", title: "Explain React Server Components" },
  { id: "3", title: "Draft a polite follow-up email to a recruiter" },
  { id: "4", title: "Weekly meal plan" },
  { id: "5", title: "Debug a failing TypeScript build" },
];

export interface Notebook {
  id: string;
  title: string;
  pinned?: boolean;
  chatIds: string[];
}

export const MOCK_NOTEBOOKS: Notebook[] = [
  { id: "n1", title: "New notebook example", chatIds: [] },
  { id: "n2", title: "Saved prompt templates", chatIds: [] },
];
