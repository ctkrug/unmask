import { Finding, toCodePointLabel } from "./types";

/**
 * A representative subset of the Unicode confusables table (full spec:
 * UTS #39) covering the Cyrillic and Greek look-alikes most commonly used
 * in phishing/typosquatting and prompt-injection payloads. Keyed by code
 * point, mapping to the Latin letter each one impersonates plus which
 * script it's actually from.
 *
 * This is intentionally a starter set, not the full UTS #39 skeleton
 * table — broadening coverage is tracked in the backlog.
 */
const CONFUSABLE_CODE_POINTS: Record<number, { looksLike: string; script: string }> = {
  0x0430: { looksLike: "a", script: "Cyrillic" },
  0x0441: { looksLike: "c", script: "Cyrillic" },
  0x0435: { looksLike: "e", script: "Cyrillic" },
  0x0456: { looksLike: "i", script: "Cyrillic" },
  0x0458: { looksLike: "j", script: "Cyrillic" },
  0x043e: { looksLike: "o", script: "Cyrillic" },
  0x0440: { looksLike: "p", script: "Cyrillic" },
  0x0455: { looksLike: "s", script: "Cyrillic" },
  0x0445: { looksLike: "x", script: "Cyrillic" },
  0x0443: { looksLike: "y", script: "Cyrillic" },
  0x0410: { looksLike: "A", script: "Cyrillic" },
  0x0412: { looksLike: "B", script: "Cyrillic" },
  0x0415: { looksLike: "E", script: "Cyrillic" },
  0x041a: { looksLike: "K", script: "Cyrillic" },
  0x041c: { looksLike: "M", script: "Cyrillic" },
  0x041d: { looksLike: "H", script: "Cyrillic" },
  0x041e: { looksLike: "O", script: "Cyrillic" },
  0x0420: { looksLike: "P", script: "Cyrillic" },
  0x0421: { looksLike: "C", script: "Cyrillic" },
  0x0422: { looksLike: "T", script: "Cyrillic" },
  0x0425: { looksLike: "X", script: "Cyrillic" },
  0x0391: { looksLike: "A", script: "Greek" },
  0x0392: { looksLike: "B", script: "Greek" },
  0x0395: { looksLike: "E", script: "Greek" },
  0x0396: { looksLike: "Z", script: "Greek" },
  0x0397: { looksLike: "H", script: "Greek" },
  0x0399: { looksLike: "I", script: "Greek" },
  0x039a: { looksLike: "K", script: "Greek" },
  0x039c: { looksLike: "M", script: "Greek" },
  0x039d: { looksLike: "N", script: "Greek" },
  0x039f: { looksLike: "O", script: "Greek" },
  0x03a1: { looksLike: "P", script: "Greek" },
  0x03a4: { looksLike: "T", script: "Greek" },
  0x03a5: { looksLike: "Y", script: "Greek" },
  0x03a7: { looksLike: "X", script: "Greek" },
  0x03bf: { looksLike: "o", script: "Greek" },
  0x03c1: { looksLike: "p", script: "Greek" },
};

export function detectConfusables(text: string): Finding[] {
  const findings: Finding[] = [];
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const cp = char.codePointAt(0) ?? 0;
    const entry = CONFUSABLE_CODE_POINTS[cp];
    if (!entry) continue;
    findings.push({
      category: "confusable",
      index: i,
      char,
      codePoint: toCodePointLabel(char),
      name: `${entry.script} "${char}"`,
      reason: `This character is ${entry.script}, not Latin — it renders identically to "${entry.looksLike}" but is a different code point to a model.`,
    });
  }
  return findings;
}

/**
 * Folds every known confusable to the Latin letter it impersonates. Used
 * by the sanitize step and by the human-vs-model diff view to show what
 * the text "really" spells once script tricks are removed.
 */
export function foldConfusables(text: string): string {
  let out = "";
  for (const char of text) {
    const cp = char.codePointAt(0) ?? 0;
    const entry = CONFUSABLE_CODE_POINTS[cp];
    out += entry ? entry.looksLike : char;
  }
  return out;
}
