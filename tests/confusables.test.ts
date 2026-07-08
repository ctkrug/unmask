import { describe, expect, it } from "vitest";
import { detectConfusables, foldConfusables } from "../src/lib/confusables";

describe("detectConfusables", () => {
  it("finds nothing in plain ASCII text", () => {
    expect(detectConfusables("paypal.com")).toEqual([]);
  });

  it("flags a Cyrillic 'а' hiding inside an otherwise-Latin word", () => {
    const text = "pаypal.com";
    const findings = detectConfusables(text);
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({
      category: "confusable",
      index: 1,
      codePoint: "U+0430",
    });
    expect(findings[0].reason).toMatch(/Cyrillic/);
    expect(findings[0].reason).toMatch(/"a"/);
  });

  it("flags multiple confusables from different scripts", () => {
    const text = "Αο"; // Greek Alpha + omicron
    const findings = detectConfusables(text);
    expect(findings).toHaveLength(2);
    expect(findings[0].name).toBe('Greek "Α"');
    expect(findings[1].name).toBe('Greek "ο"');
  });

  it("flags lowercase Greek letters beyond the starter subset", () => {
    const iota = String.fromCodePoint(0x03b9);
    const kappa = String.fromCodePoint(0x03ba);
    const findings = detectConfusables(`${iota}${kappa}`);
    expect(findings.map((f) => f.reason)).toEqual([
      expect.stringContaining('"i"'),
      expect.stringContaining('"k"'),
    ]);
  });

  it("flags Cyrillic letters beyond the starter subset", () => {
    const dze = String.fromCodePoint(0x0405);
    const findings = detectConfusables(dze);
    expect(findings[0].reason).toMatch(/Cyrillic/);
    expect(findings[0].reason).toMatch(/"S"/);
  });

  it("flags a Cyrillic У impersonating uppercase Y", () => {
    const findings = detectConfusables(String.fromCodePoint(0x0423));
    expect(findings[0].reason).toMatch(/Cyrillic/);
    expect(findings[0].reason).toMatch(/"Y"/);
  });

  it("flags a Greek eta impersonating lowercase n, closing the only-vowels gap", () => {
    const findings = detectConfusables(String.fromCodePoint(0x03b7));
    expect(findings[0].reason).toMatch(/Greek/);
    expect(findings[0].reason).toMatch(/"n"/);
  });

  it("flags every character in an all-Cyrillic 'аррӏе.com' typosquat of apple.com", () => {
    // U+0430 U+0440 U+0440 U+04CF U+0435 spell out an apple.com look-alike
    // using only Cyrillic code points that render identically to Latin.
    const text = `${String.fromCodePoint(0x0430, 0x0440, 0x0440, 0x04cf, 0x0435)}.com`;
    const findings = detectConfusables(text);
    expect(findings).toHaveLength(5);
    expect(findings.map((f) => f.index)).toEqual([0, 1, 2, 3, 4]);
  });

  it("flags a single non-Latin character inside an otherwise-Latin word (2.2 acceptance)", () => {
    const text = `p${String.fromCodePoint(0x0430)}ypal.com`;
    const findings = detectConfusables(text);
    expect(findings).toHaveLength(1);
  });
});

describe("foldConfusables", () => {
  it("leaves plain ASCII untouched", () => {
    expect(foldConfusables("paypal.com")).toBe("paypal.com");
  });

  it("folds a Cyrillic confusable to its Latin look-alike", () => {
    expect(foldConfusables("pаypal.com")).toBe("paypal.com");
  });
});
