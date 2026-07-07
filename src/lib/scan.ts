import { detectBidiControls, detectTagCharacters } from "./bidi";
import { detectConfusables } from "./confusables";
import { Finding } from "./types";
import { detectZeroWidth } from "./zerowidth";

export interface ScanResult {
  /** Every finding across all detectors, ordered by position in the text. */
  findings: Finding[];
  /** Findings grouped by category for summary counts in the UI. */
  counts: Record<Finding["category"], number>;
  /** ASCII payload recovered from Unicode tag characters, if any. */
  hiddenPayload: string;
  /** True if anything at all was flagged. */
  isClean: boolean;
}

const EMPTY_COUNTS: Record<Finding["category"], number> = {
  "zero-width": 0,
  "bidi-control": 0,
  "tag-character": 0,
  confusable: 0,
};

export function scan(text: string): ScanResult {
  const tagResult = detectTagCharacters(text);
  const findings = [
    ...detectZeroWidth(text),
    ...detectBidiControls(text),
    ...tagResult.findings,
    ...detectConfusables(text),
  ].sort((a, b) => a.index - b.index);

  const counts = { ...EMPTY_COUNTS };
  for (const finding of findings) {
    counts[finding.category]++;
  }

  return {
    findings,
    counts,
    hiddenPayload: tagResult.decoded,
    isClean: findings.length === 0,
  };
}
