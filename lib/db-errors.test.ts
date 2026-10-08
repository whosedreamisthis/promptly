import { describe, expect, it } from "vitest";
import { hasErrorCode, UNIQUE_VIOLATION_CODE } from "@/lib/db-errors";

describe("hasErrorCode", () => {
  it("matches an error carrying the code", () => {
    expect(hasErrorCode({ code: "P2002" }, UNIQUE_VIOLATION_CODE)).toBe(true);
  });

  it("rejects other codes and values without a code", () => {
    expect(hasErrorCode({ code: "P1001" }, UNIQUE_VIOLATION_CODE)).toBe(false);
    expect(hasErrorCode(new Error("boom"), UNIQUE_VIOLATION_CODE)).toBe(false);
    expect(hasErrorCode(null, UNIQUE_VIOLATION_CODE)).toBe(false);
    expect(hasErrorCode("P2002", UNIQUE_VIOLATION_CODE)).toBe(false);
  });
});
