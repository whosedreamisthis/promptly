import { createGoogleGenerativeAI } from "@ai-sdk/google";

export const GEMINI_MODEL = "gemini-3.8-flash";
export const MAX_OUTPUT_TOKENS = 2000;
export const HISTORY_LIMIT = 30;
const TITLE_MAX_LENGTH = 60;
const TITLE_SOURCE_LENGTH = 500;

export const SYSTEM_PROMPT =
  "You are Promptly, a friendly and concise assistant. Keep every reply to three paragraphs or fewer. Use markdown only when it helps. If a request is unclear, ask a short question before answering.";

const MOCK_CHUNK_DELAY_MS = 25;

export const MOCK_REPLY = [
  "This is a **mock reply**. Set `USE_AI_MODEL=true` in `.env` to get real answers from Gemini.",
  "",
  "Here is a short list and a code sample so you can check the formatting:",
  "",
  "- Lists render as bullets",
  "- `Inline code` is highlighted",
  "- Links and **bold** text work too",
  "",
  "```ts",
  "export function greet(name: string): string {",
  "  return `Hello, ${name}!`;",
  "}",
  "```",
  "",
  "Nothing was sent to the model, so no tokens were used.",
].join("\n");

/** Real model calls are skipped only when USE_AI_MODEL is exactly "false". */
export function isAiEnabled(): boolean {
  return process.env.USE_AI_MODEL !== "false";
}

/** Streams MOCK_REPLY in small chunks; calls onComplete only if it was not aborted. */
export function mockReplyStream(
  signal: AbortSignal,
  onComplete: (text: string) => Promise<void>,
): ReadableStream<string> {
  const chunks = MOCK_REPLY.match(/\S+\s*/g) ?? [];
  return new ReadableStream<string>({
    async start(controller) {
      for (const chunk of chunks) {
        if (signal.aborted) return controller.close();
        controller.enqueue(chunk);
        await new Promise((resolve) => setTimeout(resolve, MOCK_CHUNK_DELAY_MS));
      }
      controller.close();
      if (!signal.aborted) await onComplete(MOCK_REPLY);
    },
  });
}

export interface HistoryMessage {
  role: "USER" | "ASSISTANT";
  content: string;
}

export function getModel() {
  const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
  return google(GEMINI_MODEL);
}

/** Maps stored messages to model messages, keeping only the most recent ones. */
export function toModelMessages(history: HistoryMessage[]) {
  return history.slice(-HISTORY_LIMIT).map(({ role, content }) => ({
    role: role === "USER" ? ("user" as const) : ("assistant" as const),
    content,
  }));
}

export function buildTitlePrompt(userText: string, assistantText: string) {
  return `Write a title of 3 to 5 words in title case for this conversation. Return only the title, with no quotes, punctuation, markdown or prefix.\n\nUser: ${userText.slice(0, TITLE_SOURCE_LENGTH)}\nAssistant: ${assistantText.slice(0, TITLE_SOURCE_LENGTH)}`;
}

/** Strips quotes, markdown and a "Title:" prefix; returns null when nothing usable is left. */
export function cleanTitle(raw: string): string | null {
  const title = raw
    .replace(/^\s*title\s*:\s*/i, "")
    .replace(/[*_`#"'“”‘’]/g, "")
    .replace(/\s+/g, " ")
    .replace(/[.!?:;,\s]+$/, "")
    .trim();
  if (!title) return null;
  return title.length > TITLE_MAX_LENGTH
    ? title.slice(0, TITLE_MAX_LENGTH).trimEnd()
    : title;
}
