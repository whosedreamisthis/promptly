import { toast } from "sonner";
import { filenameFromDisposition } from "@/lib/chat-export";

const FALLBACK_FILE_NAME = "chat.md";
const REVOKE_DELAY_MS = 10_000;

/** Downloads a saved chat as a Markdown file, or shows an error toast. */
export async function downloadChat(chatId: string): Promise<void> {
  try {
    const response = await fetch(
      `/api/chats/${encodeURIComponent(chatId)}/export`,
    );
    if (!response.ok) throw new Error("Export failed");
    const fileName =
      filenameFromDisposition(response.headers.get("Content-Disposition")) ??
      FALLBACK_FILE_NAME;
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    // Revoking right away can cancel the download in some browsers.
    setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS);
  } catch {
    toast.error("Could not export the chat");
  }
}
