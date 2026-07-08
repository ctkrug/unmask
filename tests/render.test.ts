import { describe, expect, it } from "vitest";
import {
  escapeAttr,
  escapeHtml,
  renderDecodedHtml,
  renderFindingsRailHtml,
  renderOverlayHtml,
  renderSummaryHtml,
} from "../src/lib/render";
import { scan } from "../src/lib/scan";

describe("escapeHtml", () => {
  it("escapes the HTML special characters", () => {
    expect(escapeHtml("<b>a & b</b>")).toBe("&lt;b&gt;a &amp; b&lt;/b&gt;");
  });

  it("leaves plain text untouched", () => {
    expect(escapeHtml("hello world")).toBe("hello world");
  });
});

describe("escapeAttr", () => {
  it("escapes double quotes in addition to HTML special characters", () => {
    expect(escapeAttr('say "hi" & bye')).toBe("say &quot;hi&quot; &amp; bye");
  });
});

describe("renderDecodedHtml", () => {
  it("passes plain ASCII text through untouched", () => {
    expect(renderDecodedHtml("hello", [])).toBe("hello");
  });

  it("escapes a script-tag injection attempt pasted alongside a real finding", () => {
    const text = "<script>alert(1)</script>hel​lo";
    const result = scan(text);
    const html = renderDecodedHtml(text, result.findings);
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
  });

  it("replaces an invisible finding with its bracketed code-point label", () => {
    const text = "a​b";
    const result = scan(text);
    const html = renderDecodedHtml(text, result.findings);
    expect(html).toContain("[U+200B]");
    expect(html).toContain('data-finding-index="0"');
  });

  it("keeps the visible glyph for a confusable finding instead of a bracket label", () => {
    const text = "pаypal.com";
    const result = scan(text);
    const html = renderDecodedHtml(text, result.findings);
    expect(html).toContain(">а<");
    expect(html).not.toContain("[U+0430]");
  });

  it("labels a bidi-control finding with its own bracketed code point", () => {
    const text = "invoice-‮gnp.exe";
    const result = scan(text);
    const html = renderDecodedHtml(text, result.findings);
    expect(html).toContain('class="finding finding--bidi-control"');
    expect(html).toContain("[U+202E]");
  });

  it("wraps a supplementary-plane tag character as one span, not a split surrogate pair", () => {
    const text = `hi${String.fromCodePoint(0xe0068)}`;
    const result = scan(text);
    const html = renderDecodedHtml(text, result.findings);
    expect(html).toContain('class="finding finding--tag-character"');
    expect(html).toContain("[U+E0068]");
    // A naive UTF-16-unit walk would split the surrogate pair into two spans;
    // there must be exactly one.
    expect((html.match(/class="finding finding--tag-character"/g) ?? []).length).toBe(1);
  });
});

describe("renderOverlayHtml", () => {
  it("passes plain ASCII text through untouched", () => {
    expect(renderOverlayHtml("hello", [])).toBe("hello");
  });

  it("escapes an HTML injection attempt pasted into the overlay pane", () => {
    const text = "<img src=x onerror=alert(1)>";
    const html = renderOverlayHtml(text, []);
    expect(html).not.toContain("<img");
    expect(html).toBe("&lt;img src=x onerror=alert(1)&gt;");
  });

  it("keeps the raw (possibly zero-width) character inside the marker span", () => {
    const text = "a​b";
    const result = scan(text);
    const html = renderOverlayHtml(text, result.findings);
    expect(html).toBe(
      'a<span class="mark mark--zero-width" data-finding-index="0" title="Zero Width Space">​</span>b',
    );
  });
});

describe("renderSummaryHtml", () => {
  it("reports a waiting state for empty input", () => {
    const result = scan("");
    expect(renderSummaryHtml("", result)).toMatch(/Waiting for input/);
  });

  it("reports clean for non-empty ASCII input", () => {
    const result = scan("hello world");
    expect(renderSummaryHtml("hello world", result)).toMatch(/Looks clean/);
  });

  it("summarizes counts by category for dirty input", () => {
    const text = "a​b";
    const result = scan(text);
    const html = renderSummaryHtml(text, result);
    expect(html).toContain("1</strong> hidden character found");
    expect(html).toContain("1 zero-width");
  });

  it("pluralizes the summary when more than one finding is present", () => {
    const text = "a​b​c";
    const result = scan(text);
    const html = renderSummaryHtml(text, result);
    expect(html).toContain("2</strong> hidden characters found");
  });
});

describe("renderFindingsRailHtml", () => {
  it("shows an empty-state message with no findings", () => {
    expect(renderFindingsRailHtml([])).toMatch(/No findings/);
  });

  it("renders one chip per finding with a matching data-finding-index", () => {
    const text = "a​b​c";
    const result = scan(text);
    const html = renderFindingsRailHtml(result.findings);
    expect(html).toContain('data-finding-index="0"');
    expect(html).toContain('data-finding-index="1"');
    expect((html.match(/chip chip--zero-width/g) ?? []).length).toBe(2);
  });
});
