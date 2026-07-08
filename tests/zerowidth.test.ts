import { describe, expect, it } from "vitest";
import { detectZeroWidth } from "../src/lib/zerowidth";

describe("detectZeroWidth", () => {
  it("finds nothing in plain ASCII text", () => {
    expect(detectZeroWidth("hello world")).toEqual([]);
  });

  it("flags a zero width space hidden inside a word", () => {
    const text = "hel​lo";
    const findings = detectZeroWidth(text);
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      category: "zero-width",
      index: 3,
      char: "​",
      codePoint: "U+200B",
      name: "Zero Width Space",
    });
  });

  it("flags multiple distinct invisible characters at their own indices", () => {
    const text = "a​b﻿c";
    const findings = detectZeroWidth(text);
    expect(findings.map((f) => f.index)).toEqual([1, 3]);
    expect(findings.map((f) => f.name)).toEqual([
      "Zero Width Space",
      "Zero Width No-Break Space (BOM)",
    ]);
  });

  it("every finding includes a plain-language reason", () => {
    const findings = detectZeroWidth("‌");
    expect(findings[0].reason).toMatch(/renders as nothing/);
  });

  it("flags deprecated formatting and interlinear-annotation characters", () => {
    const activateSwapping = String.fromCodePoint(0x206b);
    const deprecatedFormatting = detectZeroWidth(`a${activateSwapping}b`);
    expect(deprecatedFormatting[0].name).toBe("Activate Symmetric Swapping");

    const anchor = String.fromCodePoint(0xfff9);
    const terminator = String.fromCodePoint(0xfffb);
    const interlinear = detectZeroWidth(`a${anchor}hidden${terminator}b`);
    expect(interlinear.map((f) => f.name)).toEqual([
      "Interlinear Annotation Anchor",
      "Interlinear Annotation Terminator",
    ]);
  });

  it("flags Hangul and Mongolian filler characters", () => {
    const hangulFiller = String.fromCodePoint(0x3164);
    const halfwidthHangulFiller = String.fromCodePoint(0xffa0);
    const mongolianFvs1 = String.fromCodePoint(0x180b);
    const findings = detectZeroWidth(`${hangulFiller}${halfwidthHangulFiller}${mongolianFvs1}`);
    expect(findings.map((f) => f.name)).toEqual([
      "Hangul Filler",
      "Halfwidth Hangul Filler",
      "Mongolian Free Variation Selector One",
    ]);
  });
});
