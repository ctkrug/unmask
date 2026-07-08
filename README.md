# Unmask

**▶ Live demo: [apps.charliekrug.com/unmask](https://apps.charliekrug.com/unmask/)**

[![CI](https://github.com/ctkrug/unmask/actions/workflows/ci.yml/badge.svg)](https://github.com/ctkrug/unmask/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-6dffb8.svg)](LICENSE)

**Reveal the hidden Unicode an LLM reads.** Paste any text, skill file, or MCP tool description
and Unmask shows you the zero-width characters, bidi overrides, invisible Unicode tag payloads,
and homoglyphs a person cannot see but a language model reads in full.

Everything runs in your browser. Nothing you paste is ever sent anywhere.

## Who it's for

You review text before it reaches a language model: a prompt engineer vetting a shared prompt
template, a tool builder auditing a third-party MCP tool description or skill file, or anyone
checking untrusted text before feeding it to an agent. Unmask is a magnifying glass for the
character encodings that matter to a model but stay invisible to you.

## The problem

Text is the interface between people and language models, and "text" in the Unicode sense is a
much bigger surface than "text" in the human-reading sense. A run of zero-width joiners, a
bidi-override sequence, or a string of invisible Unicode tag characters can carry a whole hidden
sentence that never renders on screen. A person reviewing the file sees nothing wrong. A model
tokenizing the same bytes reads every word, including "ignore previous instructions."

As more of what you paste into an LLM comes from someone else (a shared template, a downloaded
tool description, a skill file from a repo), the odds that some of it was doctored go up. Unmask
closes that gap with a lightweight, offline check.

## What it catches

- **Zero-width and invisible characters.** Zero-width space, joiner, and non-joiner, word
  joiners, soft hyphens, deprecated formatting controls, and Hangul/Mongolian fillers, all of
  which render as nothing but count as real characters to a tokenizer.
- **Unicode tag-character smuggling.** Decodes payloads hidden in the `U+E0000`–`U+E007F` tag
  block (the same block used to smuggle text behind emoji), shown as an explicit decoded value
  and checked against common prompt-injection phrases.
- **Bidi-override controls.** Flags `RLO`, `LRO`, embeddings, and isolates by their specific
  control name, the characters used to make a line display differently than it is stored.
- **Homoglyphs / confusables.** Flags look-alike letters from Cyrillic and Greek (for example
  Cyrillic `а` standing in for Latin `a`) across a 52-entry table, the trick behind look-alike
  domain names.

## What you get

- **Two-pane light table.** "What you see" (the raw text, with hidden characters marked in
  place) beside "what the model sees" (the fully decoded text), linked by a clickable findings
  rail.
- **Per-finding explainer.** A plain-language name, the Unicode code point, and the reason each
  character is flagged.
- **One-click sanitize.** Strips the invisible characters, folds homoglyphs back to their Latin
  look-alike, and copies the cleaned text to your clipboard.
- **File upload and drag-and-drop.** Audit a whole `.md`, `.txt`, or `.json` file up to 1MB, not
  just pasted text.
- **Shareable report.** Copy a plain-text scan report to paste into a review or an issue.

## Sample output

The report you can copy for any scan (the seeded demo, abbreviated):

```
Unmask scan report
===================

28 finding(s):
1. Unicode Tag Character (U+E0069) ...
2. Unicode Tag Character (U+E0067) ...
   ...26 more invisible tag characters...

Hidden payload decoded: "ignore previous instructions"
Matches known prompt-injection heuristic(s): "ignore previous"
```

That payload is smuggled into a sentence that reads, to a human, as nothing more than "Please
summarize this document for me."

## Run it locally

```sh
npm install
npm run dev        # local dev server
```

Other scripts:

```sh
npm test           # run the test suite
npm run coverage   # run the suite with a coverage report (gated at 85%)
npm run typecheck  # type-check without emitting
npm run build      # static build to site/
npm run preview    # serve the build locally
```

## How it works

Every detector is an independent, DOM-free module that takes a string and returns findings; a
thin `scan()` orchestrator merges them, and `main.ts` is the only code that touches the DOM. See
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full map, [`docs/VISION.md`](docs/VISION.md)
for the product thinking, and [`docs/DESIGN.md`](docs/DESIGN.md) for the visual direction.

## Stack

TypeScript, built with [Vite](https://vitejs.dev/), tested with [Vitest](https://vitest.dev/) and
[fast-check](https://fast-check.dev/). Fully static, fully client-side: no backend, no build-time
secrets, no network calls at runtime.

## License

MIT, see [LICENSE](LICENSE).

More of Charlie's projects → https://apps.charliekrug.com
