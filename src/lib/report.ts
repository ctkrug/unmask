import { detectInjectionHeuristics } from "./heuristics";
import { ScanResult } from "./scan";

/**
 * Builds a plain-text scan report: one line per finding (name, code point,
 * reason), plus an explicit statement of the decoded hidden payload and
 * whether it matched a known instruction-injection heuristic. Meant to be
 * pasted somewhere else as a shareable audit trail, so it never emits HTML.
 */
export function buildReportText(result: ScanResult): string {
  const lines: string[] = ["Unmask scan report", "==================="];

  if (result.findings.length === 0) {
    lines.push("", "No findings — text scanned clean.");
  } else {
    lines.push("", `${result.findings.length} finding(s):`);
    result.findings.forEach((f, i) => {
      lines.push(`${i + 1}. ${f.name} (${f.codePoint}) — ${f.reason}`);
    });
  }

  lines.push("");
  if (result.hiddenPayload) {
    lines.push(`Hidden payload decoded: "${result.hiddenPayload}"`);
    const matches = detectInjectionHeuristics(result.hiddenPayload);
    lines.push(
      matches.length > 0
        ? `Matches known prompt-injection heuristic(s): ${matches.map((m) => `"${m}"`).join(", ")}`
        : "No known prompt-injection heuristic matched.",
    );
  } else {
    lines.push("No hidden payload decoded.");
  }

  return lines.join("\n");
}
