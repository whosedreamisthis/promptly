const FILE_NAME_MAX_LENGTH = 60;
const FALLBACK_FILE_NAME = "chat";

export interface ExportMessage {
  role: "USER" | "ASSISTANT";
  content: string;
}

const ROLE_LABEL: Record<ExportMessage["role"], string> = {
  USER: "You",
  ASSISTANT: "Promptly",
};

/** The chat as a Markdown document: a title, the export date, then each message under its speaker. */
export function buildChatMarkdown(
  title: string,
  messages: ExportMessage[],
  exportedAt: Date,
): string {
  const date = exportedAt.toISOString().slice(0, 10);
  const turns = messages.map(
    ({ role, content }) => `**${ROLE_LABEL[role]}**\n\n${content}`,
  );
  return [
    `# ${title}`,
    `_Exported from Promptly on ${date}_`,
    ...turns.flatMap((turn) => ["---", turn]),
  ]
    .join("\n\n")
    .concat("\n");
}

/** A file name safe on every system, such as `my-chat.md`. */
export function exportFileName(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, FILE_NAME_MAX_LENGTH)
    .replace(/-+$/, "");
  return `${slug || FALLBACK_FILE_NAME}.md`;
}

/** The file name in a `Content-Disposition: attachment; filename="..."` header, if there is one. */
export function filenameFromDisposition(header: string | null): string | null {
  return header?.match(/filename="([^"]+)"/)?.[1] ?? null;
}
