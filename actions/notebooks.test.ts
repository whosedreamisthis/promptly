import { beforeEach, describe, expect, it, vi } from "vitest";

const { auth, db } = vi.hoisted(() => ({
  auth: vi.fn(),
  db: {
    user: { findUnique: vi.fn(), upsert: vi.fn() },
    notebook: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

vi.mock("@clerk/nextjs/server", () => ({ auth }));
vi.mock("@/lib/db", () => ({ db }));

import {
  createNotebook,
  deleteNotebook,
  renameNotebook,
  setNotebookPinned,
} from "@/actions/notebooks";

describe("notebook actions", () => {
  beforeEach(() => {
    auth.mockResolvedValue({ userId: "user_1" });
  });

  it("rejects calls without a session", async () => {
    auth.mockResolvedValue({ userId: null });
    const result = await createNotebook({ id: "n1", title: "Ideas" });
    expect(result.success).toBe(false);
    expect(db.notebook.create).not.toHaveBeenCalled();
  });

  it("rejects an empty title", async () => {
    const result = await createNotebook({ id: "n1", title: "" });
    expect(result).toMatchObject({ success: false, error: "Invalid input" });
  });

  it("creates a notebook for the signed-in user", async () => {
    const result = await createNotebook({ id: "n1", title: "Ideas" });
    expect(result.success).toBe(true);
    expect(db.notebook.create).toHaveBeenCalledWith({
      data: { id: "n1", userId: "user_1", title: "Ideas" },
    });
  });

  it("does not reuse a notebook id owned by someone else", async () => {
    db.notebook.create.mockRejectedValue({ code: "P2002" });
    db.notebook.findUnique.mockResolvedValue({ userId: "user_2" });
    const result = await createNotebook({ id: "n1", title: "Ideas" });
    expect(result.success).toBe(false);
  });

  it("treats a repeated create of the user's own notebook as success", async () => {
    db.notebook.create.mockRejectedValue({ code: "P2002" });
    db.notebook.findUnique.mockResolvedValue({ userId: "user_1" });
    const result = await createNotebook({ id: "n1", title: "Ideas" });
    expect(result.success).toBe(true);
  });

  it("sets the pinned flag to the requested value, scoped to the owner", async () => {
    db.notebook.updateMany.mockResolvedValue({ count: 1 });
    const result = await setNotebookPinned({ notebookId: "n1", pinned: true });
    expect(result.success).toBe(true);
    expect(db.notebook.updateMany).toHaveBeenCalledWith({
      where: { id: "n1", userId: "user_1" },
      data: { pinned: true },
    });
  });

  it("scopes renames to the owner", async () => {
    db.notebook.updateMany.mockResolvedValue({ count: 0 });
    const result = await renameNotebook({ notebookId: "n1", title: "New" });
    expect(result.success).toBe(false);
    expect(db.notebook.updateMany).toHaveBeenCalledWith({
      where: { id: "n1", userId: "user_1" },
      data: { title: "New" },
    });
  });

  it("deletes only the notebook, leaving chats to the SetNull relation", async () => {
    db.notebook.deleteMany.mockResolvedValue({ count: 1 });
    const result = await deleteNotebook({ notebookId: "n1" });
    expect(result.success).toBe(true);
    expect(db.notebook.deleteMany).toHaveBeenCalledWith({
      where: { id: "n1", userId: "user_1" },
    });
  });
});
