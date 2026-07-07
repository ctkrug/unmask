# Unmask

**Paste any text, skill file, or MCP tool description and instantly see the hidden Unicode a
human can't — but an LLM will.**

Unmask decodes zero-width characters, bidirectional-override tricks, invisible Unicode tag
characters, and homoglyph substitutions, then shows you a side-by-side view of *what a human
reads* versus *what a model actually receives*. If a prompt-injection payload is hiding inside
seemingly normal text, Unmask lights it up — and lets you strip it with one click.

Everything runs entirely in your browser. Nothing you paste is ever sent anywhere.

## Why

Modern LLM tooling — skill files, MCP tool descriptions, agent instructions, shared prompts —
is just text, and text is an easy place to hide things. A handful of zero-width joiners, a
bidi-override run, or a set of Unicode tag characters (the same block used for smuggling
invisible payloads into emoji) can carry an entire "ignore previous instructions" sentence that
never renders on screen. A human reviewing the file sees nothing wrong. A model tokenizing the
same bytes sees every word.

Unmask exists to close that gap: it's a magnifying glass built for the character encodings that
matter to language models, not just the ones that matter to human eyes.

## Planned features

- **Zero-width & invisible character detection** — zero-width space/joiner/non-joiner, word
  joiners, soft hyphens, and other characters that render as nothing.
- **Unicode tag character decoding** — reveals payloads smuggled in the `U+E0000`–`U+E007F`
  "tag" block (the same trick used to hide text behind emoji).
- **Bidi-override detection** — flags `RLO`/`LRO`/`PDF` and related control characters used to
  visually reorder text so it reads differently than it's stored.
- **Homoglyph / confusable detection** — flags look-alike characters from other scripts (e.g.
  Cyrillic `а` standing in for Latin `a`) using Unicode confusable-skeleton folding.
- **Human-vs-model diff view** — a side-by-side comparison of the rendered text and the fully
  decoded/normalized text a model would actually process.
- **Per-finding explainer** — plain-language description of what each flagged character is and
  why it's suspicious.
- **One-click sanitize** — strip or normalize every flagged character and copy the cleaned text.

## Stack

TypeScript, built with [Vite](https://vitejs.dev/), tested with [Vitest](https://vitest.dev/).
Fully static, fully client-side — no backend, no build-time secrets, no network calls at
runtime.

## Development

```sh
npm install
npm run dev       # local dev server
npm test          # run the test suite
npm run build     # production build to dist/
```

## Status

Early scaffold — see [`docs/VISION.md`](docs/VISION.md) for the product vision and
[`docs/BACKLOG.md`](docs/BACKLOG.md) for the build plan.

## License

MIT — see [LICENSE](LICENSE).
