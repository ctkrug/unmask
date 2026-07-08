import { Finding } from "./types";
import { ScanResult } from "./scan";

/** Escapes text for use as HTML element content. */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Escapes text for use inside a double-quoted HTML attribute value. */
export function escapeAttr(str: string): string {
  return escapeHtml(str).replace(/"/g, "&quot;");
}

export const CATEGORY_LABEL: Record<Finding["category"], string> = {
  "zero-width": "zero-width",
  "bidi-control": "bidi override",
  "tag-character": "hidden tag char",
  confusable: "homoglyph",
};

/**
 * Maps each finding to its ordinal position in the (already position-sorted)
 * findings array, keyed by object identity. This ordinal is what links a
 * finding across the two text panes and the findings rail — clicking rail
 * item N highlights the element tagged data-finding-index="N" in both panes.
 */
function railIndexByFinding(findings: Finding[]): Map<Finding, number> {
  return new Map(findings.map((f, i) => [f, i]));
}

function findingByCharIndex(findings: Finding[]): Map<number, Finding> {
  return new Map(findings.map((f) => [f.index, f]));
}

/**
 * Renders the "what the model sees" pane: every flagged character is
 * replaced with its explicit code-point label so invisible/disguised
 * characters take up visible space instead of vanishing again.
 */
export function renderDecodedHtml(text: string, findings: Finding[]): string {
  const findingByIndex = findingByCharIndex(findings);
  const railIndex = railIndexByFinding(findings);
  let html = "";
  let index = 0;
  for (const char of text) {
    const finding = findingByIndex.get(index);
    if (finding) {
      const visible =
        finding.category === "confusable" ? escapeHtml(char) : `[${finding.codePoint}]`;
      html += `<span class="finding finding--${finding.category}" data-finding-index="${railIndex.get(finding)}" title="${escapeAttr(finding.reason)}">${visible}</span>`;
    } else {
      html += escapeHtml(char);
    }
    index += char.length;
  }
  return html;
}

/**
 * Renders the "what you see" overlay pane: keeps the raw character (so
 * width/line-wrapping/bidi-reordering stay pixel-identical to the textarea
 * underneath) but wraps flagged positions in a marker span. Zero-width
 * categories rely on a CSS ::after tick anchored to the (zero-width) span
 * rather than any visible glyph, so the marker never shifts surrounding text.
 */
export function renderOverlayHtml(text: string, findings: Finding[]): string {
  const findingByIndex = findingByCharIndex(findings);
  const railIndex = railIndexByFinding(findings);
  let html = "";
  let index = 0;
  for (const char of text) {
    const finding = findingByIndex.get(index);
    if (finding) {
      html += `<span class="mark mark--${finding.category}" data-finding-index="${railIndex.get(finding)}" title="${escapeAttr(finding.name)}">${escapeHtml(char)}</span>`;
    } else {
      html += escapeHtml(char);
    }
    index += char.length;
  }
  return html;
}

/** Builds the scan summary line, distinguishing "nothing pasted yet" from "scanned and clean". */
export function renderSummaryHtml(text: string, result: ScanResult): string {
  if (text.length === 0) {
    return "Waiting for input — paste text on the left to scan it.";
  }
  if (result.isClean) {
    return "Looks clean — no hidden characters found.";
  }
  const parts = Object.entries(result.counts)
    .filter(([, count]) => count > 0)
    .map(([category, count]) => `${count} ${CATEGORY_LABEL[category as Finding["category"]]}`);
  return `<strong>${result.findings.length}</strong> hidden character${result.findings.length === 1 ? "" : "s"} found — ${parts.join(", ")}.`;
}

/** Renders the center findings rail as clickable chips, one per finding, in position order. */
export function renderFindingsRailHtml(findings: Finding[]): string {
  if (findings.length === 0) {
    return `<p class="rail-empty">No findings.</p>`;
  }
  return findings
    .map((f, i) => {
      const label = `${f.name}, ${f.codePoint}. ${f.reason}`;
      return `<button type="button" class="chip chip--${f.category}" data-finding-index="${i}" title="${escapeAttr(label)}" aria-label="${escapeAttr(label)}"><span class="chip-name">${escapeHtml(f.name)}</span><span class="chip-code">${f.codePoint}</span></button>`;
    })
    .join("");
}
