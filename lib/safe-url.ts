const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "mailto:"]);

/** Keeps relative and anchor links and absolute ones with a safe scheme; anything else is dropped. */
export function safeUrl(url: string): string {
  try {
    const { protocol } = new URL(url, "http://relative.invalid");
    return ALLOWED_PROTOCOLS.has(protocol) ? url : "";
  } catch {
    return "";
  }
}
