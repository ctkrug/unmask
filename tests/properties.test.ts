import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { foldConfusables } from "../src/lib/confusables";
import { sanitize } from "../src/lib/sanitize";
import { scan } from "../src/lib/scan";

// Property-based tests over the full Unicode range (via the "grapheme" unit,
// which includes supplementary-plane code points like tag characters and
// emoji) — example tests only cover the hand-picked inputs we thought of,
// these cover inputs we didn't.
describe("scan/sanitize properties", () => {
  it("sanitize always produces text that scans clean, for any input", () => {
    fc.assert(
      fc.property(fc.string({ unit: "grapheme" }), (text) => {
        expect(scan(sanitize(text)).isClean).toBe(true);
      }),
    );
  });

  it("sanitize is idempotent", () => {
    fc.assert(
      fc.property(fc.string({ unit: "grapheme" }), (text) => {
        const once = sanitize(text);
        expect(sanitize(once)).toBe(once);
      }),
    );
  });

  it("scan never throws and always returns findings sorted by index", () => {
    fc.assert(
      fc.property(fc.string({ unit: "grapheme" }), (text) => {
        const { findings } = scan(text);
        for (let i = 1; i < findings.length; i++) {
          expect(findings[i].index).toBeGreaterThanOrEqual(findings[i - 1].index);
        }
      }),
    );
  });

  it("foldConfusables preserves code-point count", () => {
    fc.assert(
      fc.property(fc.string({ unit: "grapheme" }), (text) => {
        expect([...foldConfusables(text)].length).toBe([...text].length);
      }),
    );
  });
});
