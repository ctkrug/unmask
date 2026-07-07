import { Finding, toCodePointLabel } from "./types";

/**
 * Characters that render as nothing but are fully present in the text a
 * model tokenizes. Zero-width joiners are legitimate in emoji sequences and
 * complex scripts, so callers may want to weight/allow those separately —
 * here we flag every occurrence and let the UI layer decide what to do
 * with it.
 *
 * Defined by code point (not literal glyphs) so the source stays legible —
 * an invisible character pasted directly into source is exactly the kind
 * of thing an editor or diff tool can silently mangle.
 */
const ZERO_WIDTH_CODE_POINTS: Record<number, string> = {
  0x00ad: "Soft Hyphen",
  0x034f: "Combining Grapheme Joiner",
  0x180e: "Mongolian Vowel Separator",
  0x200b: "Zero Width Space",
  0x200c: "Zero Width Non-Joiner",
  0x200d: "Zero Width Joiner",
  0x2060: "Word Joiner",
  0x2061: "Function Application",
  0x2062: "Invisible Times",
  0x2063: "Invisible Separator",
  0x2064: "Invisible Plus",
  0xfeff: "Zero Width No-Break Space (BOM)",
};

export const ZERO_WIDTH_CHARS: Record<string, string> = Object.fromEntries(
  Object.entries(ZERO_WIDTH_CODE_POINTS).map(([cp, name]) => [
    String.fromCodePoint(Number(cp)),
    name,
  ]),
);

export function detectZeroWidth(text: string): Finding[] {
  const findings: Finding[] = [];
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const name = ZERO_WIDTH_CHARS[char];
    if (!name) continue;
    findings.push({
      category: "zero-width",
      index: i,
      char,
      codePoint: toCodePointLabel(char),
      name,
      reason: `${name} renders as nothing, but is a real character a model will read and count.`,
    });
  }
  return findings;
}
