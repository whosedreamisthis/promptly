import { beforeEach, describe, expect, it, vi } from "vitest";

const { auth, db } = vi.hoisted(() => ({
  auth: vi.fn(),
  db: { chat: { findFirst: vi.fn() } },
}));

vi.mock("@clerk/nextjs/server", () => ({ auth }));
vi.mock("@/lib/db", () => ({ db }));

import { GET } from "@/app/api/chats/[chatId]/export/route";

function exportChat(chatId: string) {
  return GET(new Request(`http://localhost/api/chats/${chatId}/export`), {
    params: Promise.resolve({ chatId }),
  });
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  auth.mockResolvedValue({ userId: "user_1" });
  db.chat.findFirst.mockResolvedValue({
    title: "Trip ideas",
    messages: [
      { role: "USER", content: "Where to go?" },
      { role: "ASSISTANT", content: "Try **Lisbon**." },
    ],
  });
});

describe("GET /api/chats/[chatId]/export", () => {
  it("rejects a signed-out visitor", async () => {
    auth.mockResolvedValue({ userId: null });

    const response = await exportChat("c1");

    expect(response.status).toBe(401);
    expect(db.chat.findFirst).not.toHaveBeenCalled();
  });

  it("rejects an invalid chat id", async () => {
    expect((await exportChat("a".repeat(65))).status).toBe(400);
  });

  it("only looks for chats owned by the signed-in user", async () => {
    db.chat.findFirst.mockResolvedValue(null);

    const response = await exportChat("c1");

    expect(response.status).toBe(404);
    expect(db.chat.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "c1", userId: "user_1" } }),
    );
  });

  it("returns the chat as a Markdown download", async () => {
    const response = await exportChat("c1");
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Disposition")).toBe(
      'attachment; filename="trip-ideas.md"',
    );
    expect(response.headers.get("Content-Type")).toContain("text/markdown");
    expect(body).toContain("# Trip ideas");
    expect(body).toContain("**You**\n\nWhere to go?");
    expect(body).toContain("**Promptly**\n\nTry **Lisbon**.");
  });

  it("returns a generic error when the database fails", async () => {
    db.chat.findFirst.mockRejectedValue(new Error("down"));

    expect((await exportChat("c1")).status).toBe(500);
  });
});
