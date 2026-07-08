---
title: "Unmask: seeing the Unicode a language model reads but you can't"
published: false
tags: security, ai, typescript, webdev
---

I kept running into the same uneasy feeling. I would copy a prompt from somewhere, or paste in an
MCP tool description, or open a skill file from a repo, and think: I am about to hand this text to
a model, and I have no idea what is actually in it. Not what it looks like. What is in it, byte for
byte.

Because "text" to a human and "text" to a tokenizer are two different things. A zero-width joiner
renders as nothing. A run of Unicode tag characters (the invisible block that was meant for
language tags on emoji flags) renders as nothing too, but it can carry a full ASCII sentence. Drop
"ignore previous instructions" into that block, append it to a friendly-looking request, and a
person reviewing the file sees a normal sentence while the model reads the smuggled command.

So I built [Unmask](https://apps.charliekrug.com/unmask/): paste text in, and it shows you the raw
version next to what the model actually receives, with every invisible character made visible. It
runs entirely client-side, which was a hard requirement. Nobody is going to paste a private prompt
into a tool that phones home.

## Build decision 1: never put an invisible character in source

The detectors need tables of dangerous code points: zero-width spaces, bidi overrides, the tag
block, Cyrillic and Greek homoglyphs. The obvious approach is to paste the literal characters into
a lookup. For a tool whose whole job is catching invisible characters, that would have been a
fitting way to ship a bug. An invisible glyph sitting in a source file is exactly the thing an
editor, a linter, or a git diff can silently mangle.

So every table is keyed by numeric code point and the runtime strings are built with
`String.fromCodePoint`. The same rule holds in the tests: no test pastes a literal zero-width
character either. It reads better in review, and it means the source can never be quietly corrupted
by the class of problem it exists to detect.

## Build decision 2: highlight invisible characters without moving anything

Marking a zero-width character in place is a layout puzzle. The character has no width, so there is
nothing to draw a box around, and I did not want the markers to shift the surrounding text out of
alignment with what the user typed.

The answer was a transparent overlay. A `div` sits directly on top of the real `textarea`, rendering
the identical text with `color: transparent`, at `z-index` above it but with `pointer-events: none`.
The only visible things in the overlay are the marker spans, so the highlights appear to glow right
on top of the raw text while clicks and typing pass straight through to the textarea underneath.
Scroll position syncs one way, from the textarea to the overlay, on every scroll and input event.
Zero-width markers use a CSS `::after` tick anchored to the (zero-width) span, so the marker draws
without ever adding width.

## The part I would do differently

The confusables table is hand-curated Cyrillic and Greek look-alikes, not the full UTS #39 skeleton
data. It covers the common phishing scripts well, but a proper implementation would generate the
table from the Unicode confusables file at build time and cover far more scripts. That is the first
thing I would extend.

The stack is small on purpose: TypeScript, Vite, Vitest, plus fast-check for property tests (one
nice invariant: `scan(sanitize(text))` should find nothing, for any input, which flushed out a
couple of surrogate-pair edge cases). No framework, no backend, one static bundle.

Code is here: [github.com/ctkrug/unmask](https://github.com/ctkrug/unmask). The live tool seeds
itself with a hidden payload on load, so you can see the reveal within a second of opening it. Try
pasting something you were about to trust.
