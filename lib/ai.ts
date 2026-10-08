import { createGoogleGenerativeAI } from "@ai-sdk/google";

export const GEMINI_MODEL = "gemini-3.5-flash-lite";
export const MAX_OUTPUT_TOKENS = 2000;
export const HISTORY_LIMIT = 30;
const TITLE_MAX_LENGTH = 60;
const TITLE_SOURCE_LENGTH = 500;

export const SYSTEM_PROMPT =
  "You are Promptly, a friendly and concise assistant. Keep every reply to three paragraphs or fewer. Use markdown only when it helps. If a request is unclear, ask a short question before answering.";

const MOCK_CHUNK_DELAY_MS = 25;

const MOCK_SAMPLE = [
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

export const MOCK_REPLY = [
  "This is a **sample reply**. Live AI answers are switched off right now.",
  "",
  MOCK_SAMPLE,
].join("\n");

/** Shown instead of a model reply once a usage limit has been reached. */
export const LIMIT_REPLY = [
  "You've reached the usage limit for live AI replies, so this is a **sample reply**. Live replies come back when the limit resets.",
  "",
  MOCK_SAMPLE,
].join("\n");

/** Shown instead of a model reply when the model fails or returns nothing. */
export const FALLBACK_REPLY = [
  "Live AI replies aren't available right now, so this is a **sample reply**. Please try again later.",
  "",
  MOCK_SAMPLE,
].join("\n");

/** Real model calls are skipped only when USE_AI_MODEL is exactly "false". */
export function isAiEnabled(): boolean {
  return process.env.USE_AI_MODEL !== "false";
}

/** Streams a canned reply in small chunks; calls onComplete only if it was not aborted. */
export function mockReplyStream(
  signal: AbortSignal,
  onComplete: (text: string) => Promise<void>,
  reply: string = MOCK_REPLY,
): ReadableStream<string> {
  const chunks = reply.match(/\S+\s*/g) ?? [];
  return new ReadableStream<string>({
    async start(controller) {
      for (const chunk of chunks) {
        if (signal.aborted) return controller.close();
        controller.enqueue(chunk);
        await new Promise((resolve) => setTimeout(resolve, MOCK_CHUNK_DELAY_MS));
      }
      controller.close();
      if (!signal.aborted) await onComplete(reply);
    },
  });
}

/**
 * Passes `source` through. If it fails or ends without any text (the model's quota is used
 * up, say), streams `fallback` instead and reports it through `onFallback` unless aborted.
 */
export function withFallback(
  source: ReadableStream<string>,
  signal: AbortSignal,
  fallback: string,
  onFallback: (text: string) => Promise<void>,
): ReadableStream<string> {
  return new ReadableStream<string>({
    async start(controller) {
      let produced = false;
      try {
        const reader = source.getReader();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            produced = true;
            controller.enqueue(value);
          }
        }
      } catch (error) {
        if (!signal.aborted) console.error(error);
      }
      if (produced || signal.aborted) return controller.close();
      const reader = mockReplyStream(signal, onFallback, fallback).getReader();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        controller.enqueue(value);
      }
      controller.close();
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

/** Maps stored messages to model messages; callers limit the history to HISTORY_LIMIT. */
export function toModelMessages(history: HistoryMessage[]) {
  return history.map(({ role, content }) => ({
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
