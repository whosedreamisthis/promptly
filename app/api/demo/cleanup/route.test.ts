import { beforeEach, describe, expect, it, vi } from "vitest";

const clerk = vi.hoisted(() => ({
  users: { getUserList: vi.fn(), deleteUser: vi.fn() },
}));
const db = vi.hoisted(() => ({ user: { deleteMany: vi.fn() } }));

vi.mock("@clerk/nextjs/server", () => ({
  clerkClient: vi.fn(async () => clerk),
}));
vi.mock("@/lib/db", () => ({ db }));

import { GET } from "@/app/api/demo/cleanup/route";

function cleanupRequest(secret?: string) {
  return new Request("http://localhost/api/demo/cleanup", {
    headers: secret ? { authorization: `Bearer ${secret}` } : {},
  });
}

function user(
  id: string,
  demo: boolean,
  email = "demo-1@promptly-demo.example.com",
) {
  return {
    id,
    publicMetadata: demo ? { demo: true } : {},
    emailAddresses: [{ emailAddress: email }],
  };
}

/** A full Clerk page (100 users), which is how the route knows there may be more. */
function fullPage(prefix: string, demo: boolean) {
  return Array.from({ length: 100 }, (_, i) => user(`${prefix}_${i}`, demo));
}

beforeEach(() => {
  vi.unstubAllEnvs();
  vi.stubEnv("CRON_SECRET", "s3cret");
  vi.spyOn(console, "error").mockImplementation(() => {});
  clerk.users.getUserList.mockReset();
  clerk.users.deleteUser.mockReset().mockResolvedValue({});
  db.user.deleteMany.mockReset().mockResolvedValue({ count: 0 });
});

describe("GET /api/demo/cleanup", () => {
  it("skips a flagged user whose email is not on the demo domain", async () => {
    clerk.users.getUserList.mockResolvedValueOnce({
      data: [user("user_odd", true, "me@promptly-demo.example.com.evil.io")],
    });

    const body = await (await GET(cleanupRequest("s3cret"))).json();

    expect(body.deleted).toBe(0);
    expect(clerk.users.deleteUser).not.toHaveBeenCalled();
    expect(db.user.deleteMany).not.toHaveBeenCalled();
  });

  it("rejects requests without the secret", async () => {
    expect((await GET(cleanupRequest())).status).toBe(401);
    expect((await GET(cleanupRequest("wrong"))).status).toBe(401);
    expect(clerk.users.getUserList).not.toHaveBeenCalled();
  });

  it("rejects everything when CRON_SECRET is not set", async () => {
    vi.stubEnv("CRON_SECRET", "");
    expect((await GET(cleanupRequest("undefined"))).status).toBe(401);
    expect((await GET(cleanupRequest(""))).status).toBe(401);
  });

  it("deletes old demo users from the database and Clerk, skipping other users", async () => {
    clerk.users.getUserList
      .mockResolvedValueOnce({
        data: [user("user_d1", true), user("user_real", false)],
      })
      .mockResolvedValueOnce({ data: [] });

    const response = await GET(cleanupRequest("s3cret"));

    expect(await response.json()).toEqual({
      success: true,
      deleted: 1,
      failed: 0,
    });
    expect(db.user.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ["user_d1"] } },
    });
    expect(clerk.users.deleteUser).toHaveBeenCalledTimes(1);
    expect(clerk.users.deleteUser).toHaveBeenCalledWith("user_d1");
  });

  it("only asks for users older than the TTL", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-08T12:00:00Z"));
    vi.stubEnv("DEMO_USER_TTL_HOURS", "2");
    clerk.users.getUserList.mockResolvedValue({ data: [] });

    try {
      await GET(cleanupRequest("s3cret"));
    } finally {
      vi.useRealTimers();
    }

    expect(clerk.users.getUserList.mock.calls[0][0].createdAtBefore).toBe(
      new Date("2026-10-08T10:00:00Z").getTime(),
    );
  });

  it("keeps paging past users that are not demo users", async () => {
    clerk.users.getUserList
      .mockResolvedValueOnce({ data: fullPage("real", false) })
      .mockResolvedValueOnce({ data: [user("user_d1", true)] });

    const response = await GET(cleanupRequest("s3cret"));

    expect(await response.json()).toEqual({
      success: true,
      deleted: 1,
      failed: 0,
    });
    expect(clerk.users.getUserList.mock.calls[1][0].offset).toBe(100);
    expect(clerk.users.deleteUser).toHaveBeenCalledWith("user_d1");
  });

  it("does not skip users that stay in the list when a deletion fails", async () => {
    const page = [
      user("a", true),
      user("b", true),
      ...fullPage("real", false).slice(2),
    ];
    clerk.users.getUserList
      .mockResolvedValueOnce({ data: page })
      .mockResolvedValueOnce({ data: [] });
    clerk.users.deleteUser.mockImplementation(async (id: string) => {
      if (id === "a") throw new Error("clerk down");
      return {};
    });

    await GET(cleanupRequest("s3cret"));

    expect(clerk.users.getUserList.mock.calls[1][0].offset).toBe(99);
  });

  it("logs failed deletions and reports them with a 500", async () => {
    clerk.users.getUserList.mockResolvedValue({ data: [user("d", true)] });
    clerk.users.deleteUser.mockRejectedValue(new Error("clerk down"));

    const response = await GET(cleanupRequest("s3cret"));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      success: false,
      deleted: 0,
      failed: 1,
    });
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(clerk.users.getUserList).toHaveBeenCalledTimes(1);
  });

  it("returns a 500 when Clerk cannot be listed", async () => {
    clerk.users.getUserList.mockRejectedValue(new Error("clerk down"));

    expect((await GET(cleanupRequest("s3cret"))).status).toBe(500);
  });
});
