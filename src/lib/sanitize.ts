import { foldConfusables } from "./confusables";
import { scan } from "./scan";

/**
 * Strips every zero-width, bidi-control, and tag character, then folds any
 * homoglyph confusables to the Latin letter they impersonate. The result is
 * safe to paste anywhere a hidden payload could otherwise be smuggled back
 * in through the same text.
 */
export function sanitize(text: string): string {
  const result = scan(text);
  const stripIndices = new Set(
    result.findings
      .filter((f) => f.category !== "confusable")
      .map((f) => f.index),
  );

  // Iterate by code point (not UTF-16 code unit): tag characters are
  // supplementary-plane surrogate pairs, so a plain index-by-index walk
  // would strip only half of one and leave a dangling surrogate behind.
  let stripped = "";
  let index = 0;
  for (const char of text) {
    if (!stripIndices.has(index)) stripped += char;
    index += char.length;
  }

  return foldConfusables(stripped);
}
