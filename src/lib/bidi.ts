import { Finding, toCodePointLabel } from "./types";

/**
 * Bidirectional-override and embedding control characters. These can
 * reorder how surrounding text *renders* without changing the underlying
 * character order a model reads — the classic trick for making a filename
 * or sentence display differently than it's stored.
 */
const BIDI_CONTROL_CODE_POINTS: Record<number, string> = {
  0x061c: "Arabic Letter Mark",
  0x200e: "Left-to-Right Mark",
  0x200f: "Right-to-Left Mark",
  0x202a: "Left-to-Right Embedding",
  0x202b: "Right-to-Left Embedding",
  0x202c: "Pop Directional Formatting",
  0x202d: "Left-to-Right Override",
  0x202e: "Right-to-Left Override",
  0x2066: "Left-to-Right Isolate",
  0x2067: "Right-to-Left Isolate",
  0x2068: "First Strong Isolate",
  0x2069: "Pop Directional Isolate",
};

export function detectBidiControls(text: string): Finding[] {
  const findings: Finding[] = [];
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const cp = char.codePointAt(0) ?? 0;
    const name = BIDI_CONTROL_CODE_POINTS[cp];
    if (!name) continue;
    findings.push({
      category: "bidi-control",
      index: i,
      char,
      codePoint: toCodePointLabel(char),
      name,
      reason: `${name} can reorder how nearby text renders on screen without changing the order a model reads it in.`,
    });
  }
  return findings;
}

/**
 * The Unicode "Tag" block (U+E0000-U+E007F) mirrors ASCII one-to-one at an
 * offset of 0xE0000, minus the cancel tag U+E007F. It was designed for
 * language-tagging emoji flags but is invisible in virtually every renderer,
 * which makes it a ready-made channel for smuggling plain text that a human
 * will never see but a model will decode.
 */
const TAG_BASE = 0xe0000;
const TAG_CANCEL = 0xe007f;

function tagCharToAscii(cp: number): string | null {
  if (cp === TAG_CANCEL) return "";
  if (cp < TAG_BASE || cp > TAG_BASE + 0x7f) return null;
  return String.fromCodePoint(cp - TAG_BASE);
}

export interface TagDecodeResult {
  /** The ASCII payload smuggled via tag characters, concatenated in order. */
  decoded: string;
  findings: Finding[];
}

export function detectTagCharacters(text: string): TagDecodeResult {
  const findings: Finding[] = [];
  let decoded = "";
  // Tag characters live outside the BMP, so they're UTF-16 surrogate pairs —
  // iterate by code point (not UTF-16 code unit) while tracking the
  // code-unit index for reporting.
  let index = 0;
  for (const char of text) {
    const cp = char.codePointAt(0) ?? 0;
    const ascii = tagCharToAscii(cp);
    if (ascii !== null) {
      decoded += ascii;
      findings.push({
        category: "tag-character",
        index,
        char,
        codePoint: toCodePointLabel(char),
        name: "Unicode Tag Character",
        reason:
          "Invisible tag characters (U+E0000 block) can encode an entire hidden ASCII message that renders as nothing.",
      });
    }
    index += char.length;
  }
  return { decoded, findings };
}
