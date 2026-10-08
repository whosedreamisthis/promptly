import { describe, expect, it } from "vitest";
import {
  chatRequestSchema,
  capGuestHistory,
  MAX_GUEST_HISTORY,
  MAX_GUEST_MESSAGE_LENGTH,
  MAX_MESSAGE_LENGTH,
} from "@/lib/validations/messages";

const valid = { chatId: "c1", messageId: "m1", text: "Hello" };

describe("chatRequestSchema", () => {
  it("accepts a valid request and trims the text", () => {
    const result = chatRequestSchema.safeParse({ ...valid, text: "  Hello  " });
    expect(result.success && result.data.text).toBe("Hello");
  });

  it("accepts text at the length limit and rejects longer text", () => {
    const atLimit = "a".repeat(MAX_MESSAGE_LENGTH);
    expect(
      chatRequestSchema.safeParse({ ...valid, text: atLimit }).success,
    ).toBe(true);
    expect(
      chatRequestSchema.safeParse({ ...valid, text: `${atLimit}a` }).success,
    ).toBe(false);
  });

  it("rejects empty text and missing or oversized ids", () => {
    expect(chatRequestSchema.safeParse({ ...valid, text: "   " }).success).toBe(
      false,
    );
    expect(chatRequestSchema.safeParse({ ...valid, chatId: "" }).success).toBe(
      false,
    );
    expect(
      chatRequestSchema.safeParse({ ...valid, messageId: "x".repeat(65) })
        .success,
    ).toBe(false);
    expect(chatRequestSchema.safeParse({ chatId: "c1" }).success).toBe(false);
  });

  it("accepts optional guest history up to the limit and rejects more or invalid turns", () => {
    const turn = { role: "USER" as const, content: "Hi" };
    const history = (count: number) => Array.from({ length: count }, () => turn);
    expect(chatRequestSchema.safeParse(valid).success).toBe(true);
    expect(
      chatRequestSchema.safeParse({
        ...valid,
        history: history(MAX_GUEST_HISTORY),
      }).success,
    ).toBe(true);
    expect(
      chatRequestSchema.safeParse({
        ...valid,
        history: history(MAX_GUEST_HISTORY + 1),
      }).success,
    ).toBe(false);
    expect(
      chatRequestSchema.safeParse({
        ...valid,
        history: [{ role: "SYSTEM", content: "Hi" }],
      }).success,
    ).toBe(false);
    expect(
      chatRequestSchema.safeParse({
        ...valid,
        history: [{ role: "USER", content: "" }],
      }).success,
    ).toBe(false);
  });
});

describe("capGuestHistory", () => {
  it("keeps the last turns and cuts long content to the guest length", () => {
    const history = Array.from({ length: MAX_GUEST_HISTORY + 2 }, (_, index) => ({
      role: "USER" as const,
      content: `${index}`.padEnd(MAX_GUEST_MESSAGE_LENGTH + 500, "x"),
    }));

    const capped = capGuestHistory(history);

    expect(capped).toHaveLength(MAX_GUEST_HISTORY);
    expect(capped[0].content.startsWith("2")).toBe(true);
    expect(capped.every((m) => m.content.length === MAX_GUEST_MESSAGE_LENGTH)).toBe(true);
    expect(capped[0].role).toBe("USER");
  });

  it("leaves short history unchanged", () => {
    const history = [{ role: "USER" as const, content: "hi" }];
    expect(capGuestHistory(history)).toEqual(history);
  });
});
