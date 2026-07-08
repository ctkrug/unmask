import { describe, expect, it } from "vitest";
import { toCodePointLabel } from "../src/lib/types";

describe("toCodePointLabel", () => {
  it("pads a low code point to 4 hex digits", () => {
    expect(toCodePointLabel(String.fromCodePoint(0x200b))).toBe("U+200B");
  });

  it("uppercases hex digits", () => {
    expect(toCodePointLabel(String.fromCodePoint(0x04bb))).toBe("U+04BB");
  });

  it("does not truncate a supplementary-plane code point wider than 4 digits", () => {
    expect(toCodePointLabel(String.fromCodePoint(0xe0069))).toBe("U+E0069");
  });

  it("labels the null character as U+0000", () => {
    expect(toCodePointLabel(String.fromCodePoint(0))).toBe("U+0000");
  });
});
