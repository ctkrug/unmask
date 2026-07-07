export type FindingCategory =
  | "zero-width"
  | "bidi-control"
  | "tag-character"
  | "confusable";

export interface Finding {
  /** Category of hidden/deceptive character this finding represents. */
  category: FindingCategory;
  /** Index into the original string where the flagged character starts. */
  index: number;
  /** The raw character(s) flagged. */
  char: string;
  /** Unicode code point, e.g. "U+200B". */
  codePoint: string;
  /** Short human name, e.g. "Zero Width Space". */
  name: string;
  /** Plain-language explanation of why this is flagged. */
  reason: string;
}

export function toCodePointLabel(char: string): string {
  const cp = char.codePointAt(0) ?? 0;
  return `U+${cp.toString(16).toUpperCase().padStart(4, "0")}`;
}
