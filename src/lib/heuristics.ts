/**
 * Phrases commonly used to redirect or override an LLM's prior instructions.
 * This is a plain-language heuristic, not a security boundary — it exists so
 * a decoded hidden payload can be flagged as "this looks like an injection
 * attempt" in the UI and the exported report, not to gate sanitize behavior.
 */
const INJECTION_PHRASES = [
  "ignore previous",
  "ignore all previous",
  "ignore the above",
  "ignore your instructions",
  "disregard the above",
  "disregard previous",
  "system prompt",
  "you are now",
  "new instructions",
  "override your instructions",
  "act as",
  "do not follow",
  "forget your instructions",
  "pretend you are",
  "pretend to be",
  "developer mode",
  "jailbreak",
  "bypass your",
  "reveal your instructions",
  "print your system prompt",
];

/** Returns every known injection phrase found (case-insensitively) inside the decoded payload. */
export function detectInjectionHeuristics(payload: string): string[] {
  const lower = payload.toLowerCase();
  return INJECTION_PHRASES.filter((phrase) => lower.includes(phrase));
}
