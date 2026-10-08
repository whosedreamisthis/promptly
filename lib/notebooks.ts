/** Title given to a notebook until the user names it. */
export const NEW_NOTEBOOK_TITLE = "Untitled notebook";

/** Longest notebook title the rename action accepts. */
export const MAX_NOTEBOOK_TITLE_LENGTH = 200;

/** True for a brand new notebook that still needs a title: the default title and no chats yet. */
export function isUnnamedNotebook(title: string, chatCount: number): boolean {
  return title === NEW_NOTEBOOK_TITLE && chatCount === 0;
}
