import { describe, expect, it, vi } from "vitest";
import {
  buildTitlePrompt,
  cleanTitle,
  isAiEnabled,
  MOCK_REPLY,
  mockReplyStream,
  toModelMessages,
  withFallback,
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
  it("maps roles and keeps the order", () => {
    const messages = toModelMessages([
      { role: "USER", content: "hi" },
      { role: "ASSISTANT", content: "hello" },
    ]);
    expect(messages).toEqual([
      { role: "user", content: "hi" },
      { role: "assistant", content: "hello" },
    ]);
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

function streamOf(chunks: string[], error?: Error): ReadableStream<string> {
  const remaining = [...chunks];
  // One chunk per pull, so an error is only raised after earlier chunks were read.
  return new ReadableStream<string>({
    pull(controller) {
      const chunk = remaining.shift();
      if (chunk !== undefined) controller.enqueue(chunk);
      else if (error) controller.error(error);
      else controller.close();
    },
  });
}

describe("withFallback", () => {
  const signal = new AbortController().signal;

  it("passes the source through when it produces text", async () => {
    const onFallback = vi.fn();
    const stream = withFallback(streamOf(["Hel", "lo"]), signal, "FALLBACK", onFallback);
    expect(await readAll(stream)).toBe("Hello");
    expect(onFallback).not.toHaveBeenCalled();
  });

  it("streams the fallback when the source ends empty and reports it", async () => {
    const onFallback = vi.fn().mockResolvedValue(undefined);
    const stream = withFallback(streamOf([]), signal, "Sorry about that", onFallback);
    expect(await readAll(stream)).toBe("Sorry about that");
    expect(onFallback).toHaveBeenCalledWith("Sorry about that");
  });

  it("streams the fallback when the source fails before any text", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const onFallback = vi.fn().mockResolvedValue(undefined);
    const stream = withFallback(
      streamOf([], new Error("quota")),
      signal,
      "Sorry about that",
      onFallback,
    );
    expect(await readAll(stream)).toBe("Sorry about that");
    expect(onFallback).toHaveBeenCalledOnce();
  });

  it("keeps partial text when the source fails midway", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const onFallback = vi.fn();
    const stream = withFallback(
      streamOf(["Partial"], new Error("dropped")),
      signal,
      "Sorry about that",
      onFallback,
    );
    expect(await readAll(stream)).toBe("Partial");
    expect(onFallback).not.toHaveBeenCalled();
  });

  it("does not stream or report the fallback when aborted", async () => {
    const controller = new AbortController();
    controller.abort();
    const onFallback = vi.fn();
    const stream = withFallback(streamOf([]), controller.signal, "Sorry", onFallback);
    expect(await readAll(stream)).toBe("");
    expect(onFallback).not.toHaveBeenCalled();
  });
});

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
