import { describe, expect, it } from "vitest";
import { safeUrl } from "@/lib/safe-url";

describe("safeUrl", () => {
  it.each([
    "https://example.com/a?b=1",
    "http://example.com",
    "mailto:me@example.com",
    "/relative/path",
    "#anchor",
  ])("keeps %s", (url) => {
    expect(safeUrl(url)).toBe(url);
  });

  it.each([
    "javascript:alert(1)",
    "JaVaScRiPt:alert(1)",
    " javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "vbscript:msgbox(1)",
    "file:///etc/passwd",
  ])("drops %s", (url) => {
    expect(safeUrl(url)).toBe("");
  });
});
