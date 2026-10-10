import { describe, expect, it } from "vitest";
import {
  buildChatMarkdown,
  exportFileName,
  filenameFromDisposition,
} from "@/lib/chat-export";

describe("buildChatMarkdown", () => {
  const exportedAt = new Date("2026-10-10T12:00:00Z");

  it("starts with the title and the export date", () => {
    const markdown = buildChatMarkdown("Trip ideas", [], exportedAt);

    expect(markdown).toBe(
      "# Trip ideas\n\n_Exported from Promptly on 2026-10-10_\n",
    );
  });

  it("keeps a title on one line", () => {
    const markdown = buildChatMarkdown(
      "Line one\n\n## Line two",
      [],
      exportedAt,
    );

    expect(markdown.startsWith("# Line one ## Line two\n\n")).toBe(true);
  });

  it("puts each message under its speaker, in order", () => {
    const markdown = buildChatMarkdown(
      "Hello",
      [
        { role: "USER", content: "Hi" },
        { role: "ASSISTANT", content: "Hello! **Bold** reply" },
      ],
      exportedAt,
    );

    expect(markdown).toContain("---\n\n**You**\n\nHi");
    expect(markdown).toContain("---\n\n**Promptly**\n\nHello! **Bold** reply");
    expect(markdown.indexOf("**You**")).toBeLessThan(
      markdown.indexOf("**Promptly**"),
    );
  });
});

describe("exportFileName", () => {
  it("turns a title into a safe file name", () => {
    expect(exportFileName("Trip ideas: Paris & Rome!")).toBe(
      "trip-ideas-paris-rome.md",
    );
  });

  it("falls back when nothing usable is left", () => {
    expect(exportFileName("???")).toBe("chat.md");
    expect(exportFileName("")).toBe("chat.md");
  });

  it("cuts long titles without leaving a trailing dash", () => {
    const name = exportFileName(`${"a".repeat(59)} bbbbbb`);

    expect(name).toBe(`${"a".repeat(59)}.md`);
  });
});

describe("filenameFromDisposition", () => {
  it("reads the quoted file name", () => {
    expect(filenameFromDisposition('attachment; filename="my-chat.md"')).toBe(
      "my-chat.md",
    );
  });

  it("returns null without a file name", () => {
    expect(filenameFromDisposition(null)).toBeNull();
    expect(filenameFromDisposition("inline")).toBeNull();
  });
});
