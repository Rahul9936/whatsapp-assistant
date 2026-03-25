import { appConfig } from "./config";

/**
 * Decides whether the agent should respond to an incoming message.
 * Returns true if the message passes the configured filters.
 */
export function shouldRespond(senderPhone: string, messageText: string): boolean {
  const { filters } = appConfig;

  // ── Contact filter ──────────────────────────────────────────────────────
  if (filters.mode === "allowlist") {
    if (!filters.allowedContacts.includes(senderPhone)) {
      console.log(`[filter] Ignoring message from ${senderPhone} (not in allowlist)`);
      return false;
    }
  } else if (filters.mode === "blocklist") {
    if (filters.blockedContacts.includes(senderPhone)) {
      console.log(`[filter] Ignoring message from ${senderPhone} (blocklisted)`);
      return false;
    }
  }
  // mode === "all" — no contact filtering

  // ── Keyword filter ──────────────────────────────────────────────────────
  if (filters.keywords.enabled) {
    const lowerText = messageText.toLowerCase();
    const hasKeyword = filters.keywords.matchAny.some((kw) =>
      lowerText.includes(kw.toLowerCase())
    );
    if (!hasKeyword) {
      console.log(`[filter] Ignoring message from ${senderPhone} (no matching keyword)`);
      return false;
    }
  }

  return true;
}
