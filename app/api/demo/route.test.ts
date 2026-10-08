import { beforeEach, describe, expect, it, vi } from "vitest";

const clerk = vi.hoisted(() => ({
  users: {
    getCount: vi.fn(),
    createUser: vi.fn(),
    deleteUser: vi.fn(),
  },
  signInTokens: { createSignInToken: vi.fn() },
}));
const seedUser = vi.hoisted(() => vi.fn());

vi.mock("@clerk/nextjs/server", () => ({
  clerkClient: vi.fn(async () => clerk),
}));
vi.mock("@/lib/db", () => ({ db: {} }));
vi.mock("@/lib/seed-user", () => ({ seedUser }));

import { POST } from "@/app/api/demo/route";
import { MAX_LIVE_DEMO_USERS } from "@/lib/demo-limits";
import { resetRateLimits } from "@/lib/rate-limit";

function demoRequest(ip = "1.1.1.1") {
  return new Request("http://localhost/api/demo", {
    method: "POST",
    headers: { "x-real-ip": ip },
  });
}

beforeEach(() => {
  resetRateLimits();
  vi.unstubAllEnvs();
  vi.spyOn(console, "error").mockImplementation(() => {});
  clerk.users.getCount.mockResolvedValue(0);
  clerk.users.createUser.mockResolvedValue({ id: "user_demo1" });
  clerk.users.deleteUser.mockResolvedValue({});
  clerk.signInTokens.createSignInToken.mockResolvedValue({ token: "tok_1" });
  seedUser.mockResolvedValue({ notebooks: 5, chats: 20, messages: 82 });
});

describe("POST /api/demo", () => {
  it("creates a marked demo user, seeds it and returns a sign-in token", async () => {
    const response = await POST(demoRequest());

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      data: { token: "tok_1" },
      error: null,
    });
    expect(clerk.users.createUser).toHaveBeenCalledWith(
      expect.objectContaining({ publicMetadata: { demo: true } }),
    );
    expect(seedUser).toHaveBeenCalledWith({}, "user_demo1");
    expect(clerk.signInTokens.createSignInToken).toHaveBeenCalledWith({
      userId: "user_demo1",
      expiresInSeconds: 60,
    });
  });

  it("blocks an address after its daily limit without creating users", async () => {
    vi.stubEnv("DEMO_LIMIT_PER_IP", "1");
    expect((await POST(demoRequest())).status).toBe(200);
    clerk.users.createUser.mockClear();

    const response = await POST(demoRequest());

    expect(response.status).toBe(429);
    expect((await response.json()).success).toBe(false);
    expect(clerk.users.createUser).not.toHaveBeenCalled();
    expect((await POST(demoRequest("2.2.2.2"))).status).toBe(200);
  });

  it("blocks everyone after the global daily limit", async () => {
    vi.stubEnv("DEMO_LIMIT_GLOBAL", "1");
    expect((await POST(demoRequest("1.1.1.1"))).status).toBe(200);
    expect((await POST(demoRequest("2.2.2.2"))).status).toBe(429);
  });

  it("refuses when too many demo users already exist", async () => {
    clerk.users.getCount.mockResolvedValue(MAX_LIVE_DEMO_USERS);

    const response = await POST(demoRequest());

    expect(response.status).toBe(503);
    expect(clerk.users.createUser).not.toHaveBeenCalled();
  });

  it("does not use the global quota while the demo is full", async () => {
    vi.stubEnv("DEMO_LIMIT_GLOBAL", "1");
    clerk.users.getCount.mockResolvedValue(MAX_LIVE_DEMO_USERS);
    expect((await POST(demoRequest())).status).toBe(503);

    clerk.users.getCount.mockResolvedValue(0);
    expect((await POST(demoRequest())).status).toBe(200);
  });

  it("deletes the new user when seeding fails", async () => {
    seedUser.mockRejectedValue(new Error("db down"));

    const response = await POST(demoRequest());

    expect(response.status).toBe(500);
    expect(clerk.users.deleteUser).toHaveBeenCalledWith("user_demo1");
    expect(clerk.signInTokens.createSignInToken).not.toHaveBeenCalled();
  });

  it("returns a friendly error when Clerk fails", async () => {
    clerk.users.createUser.mockRejectedValue(new Error("clerk down"));

    const response = await POST(demoRequest());

    expect(response.status).toBe(500);
    expect((await response.json()).error).toContain("could not start");
    expect(clerk.users.deleteUser).not.toHaveBeenCalled();
  });
});
