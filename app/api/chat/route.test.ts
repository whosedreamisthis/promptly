import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  chat: { findFirst: vi.fn() },
  message: { findUnique: vi.fn() },
}));
const ensureUser = vi.hoisted(() => vi.fn());

vi.mock("@/lib/db", () => ({ db }));
vi.mock("@/lib/session", () => ({ ensureUser }));

import { POST } from "@/app/api/chat/route";
import { resetRateLimits } from "@/lib/rate-limit";

function chatRequest(body: string) {
  return new Request("http://localhost/api/chat", { method: "POST", body });
}

const valid = JSON.stringify({ chatId: "c1", messageId: "m1", text: "Hello" });

beforeEach(() => {
  resetRateLimits();
  vi.spyOn(console, "error").mockImplementation(() => {});
  ensureUser.mockResolvedValue("user_1");
  db.chat.findFirst.mockResolvedValue({ id: "c1" });
  db.message.findUnique.mockResolvedValue(null);
});

describe("POST /api/chat", () => {
  it("only treats a message id in the same chat as a duplicate", async () => {
    db.message.findUnique.mockResolvedValue({ id: "m1" });

    const response = await POST(chatRequest(valid));

    expect(response.status).toBe(409);
    expect(db.message.findUnique).toHaveBeenCalledWith({
      where: { id: "m1", chatId: "c1" },
      select: { id: true },
    });
  });

  it("rejects a body over the size limit even without a content-length header", async () => {
    const huge = JSON.stringify({ chatId: "c1", messageId: "m1", text: "a".repeat(200_000) });

    expect((await POST(chatRequest(huge))).status).toBe(413);
  });

  it("rejects a body that is not valid JSON", async () => {
    expect((await POST(chatRequest("{nope"))).status).toBe(400);
  });
});
