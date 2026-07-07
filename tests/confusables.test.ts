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
});

describe("foldConfusables", () => {
  it("leaves plain ASCII untouched", () => {
    expect(foldConfusables("paypal.com")).toBe("paypal.com");
  });

  it("folds a Cyrillic confusable to its Latin look-alike", () => {
    expect(foldConfusables("pаypal.com")).toBe("paypal.com");
  });
});
