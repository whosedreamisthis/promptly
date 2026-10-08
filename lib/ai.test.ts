import { describe, expect, it, vi } from "vitest";
import {
  buildTitlePrompt,
  cleanTitle,
  HISTORY_LIMIT,
  isAiEnabled,
  MOCK_REPLY,
  mockReplyStream,
  toModelMessages,
} from "@/lib/ai";

describe("cleanTitle", () => {
  it("removes quotes, markdown, a Title prefix and trailing punctuation", () => {
    expect(cleanTitle('Title: "**Deploying To Vercel**."')).toBe(
      "Deploying To Vercel",
    );
  });

  it("collapses whitespace and limits the length", () => {
    expect(cleanTitle("A   B\nC")).toBe("A B C");
    expect(cleanTitle("word ".repeat(30))?.length).toBeLessThanOrEqual(60);
  });

  it("returns null when nothing is left", () => {
    expect(cleanTitle('  ""  ')).toBeNull();
  });
});

describe("toModelMessages", () => {
  it("maps roles and keeps only the most recent messages", () => {
    const history = Array.from({ length: HISTORY_LIMIT + 5 }, (_, index) => ({
      role: index % 2 === 0 ? ("USER" as const) : ("ASSISTANT" as const),
      content: `m${index}`,
    }));
    const messages = toModelMessages(history);
    expect(messages).toHaveLength(HISTORY_LIMIT);
    expect(messages[0].content).toBe("m5");
    expect(messages[0].role).toBe("assistant");
  });
});

describe("buildTitlePrompt", () => {
  it("truncates long messages", () => {
    const prompt = buildTitlePrompt("a".repeat(2000), "b".repeat(2000));
    expect(prompt.length).toBeLessThan(1300);
  });
});

async function readAll(stream: ReadableStream<string>): Promise<string> {
  const reader = stream.getReader();
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) return text;
    text += value;
  }
}

describe("mock mode", () => {
  it("disables the model only when USE_AI_MODEL is exactly false", () => {
    vi.stubEnv("USE_AI_MODEL", "false");
    expect(isAiEnabled()).toBe(false);
    vi.stubEnv("USE_AI_MODEL", "true");
    expect(isAiEnabled()).toBe(true);
    vi.stubEnv("USE_AI_MODEL", "");
    expect(isAiEnabled()).toBe(true);
  });

  it("streams the full mock reply and reports completion", async () => {
    const onComplete = vi.fn().mockResolvedValue(undefined);
    const stream = mockReplyStream(new AbortController().signal, onComplete);
    const text = await readAll(stream);
    expect(text).toBe(MOCK_REPLY);
    expect(onComplete).toHaveBeenCalledWith(MOCK_REPLY);
  });

  it("does not report completion when aborted", async () => {
    const controller = new AbortController();
    controller.abort();
    const onComplete = vi.fn();
    await readAll(mockReplyStream(controller.signal, onComplete));
    expect(onComplete).not.toHaveBeenCalled();
  });
});
