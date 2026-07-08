# Unmask — Architecture

A concise map of the codebase for anyone (or any future session) picking this up cold.

## Data flow

```
raw text ──▶ scan() ──▶ ScanResult { findings[], counts, hiddenPayload, isClean }
                │
                ├─▶ render.ts (pure string builders) ──▶ main.ts (DOM glue) ──▶ UI
                ├─▶ sanitize() ──▶ cleaned text
                └─▶ report.ts + heuristics.ts ──▶ plain-text report
```

Everything upstream of `main.ts` is pure, DOM-free TypeScript — detectors, the scan
orchestrator, sanitize, the report builder, and the render helpers all take a string (or a
`ScanResult`) in and return data out, with no side effects. `main.ts` is the only place that
touches the DOM; it wires event listeners and calls the pure functions to compute what to render.
This is why detectors, `scan`/`sanitize`, and the render/report helpers all have direct unit
tests, while `main.ts` itself doesn't (nothing in it is testable in isolation — it's wiring).

## Modules (`src/lib/`)

- **`types.ts`** — the shared `Finding` interface every detector produces, plus
  `toCodePointLabel()`.
- **`zerowidth.ts`** — `detectZeroWidth()`. Table of Cf-category and other
  invisible-or-near-invisible code points (zero-width space/joiner, soft hyphen, deprecated
  formatting controls, Hangul/Mongolian fillers, interlinear annotation marks, the BOM).
- **`bidi.ts`** — `detectBidiControls()` (RLO/LRO/embeddings/isolates) and
  `detectTagCharacters()`, which both flags and *decodes* the Unicode Tag block
  (`U+E0000`–`U+E007F`) back to its smuggled ASCII payload — this decode is the wow moment.
- **`confusables.ts`** — `detectConfusables()` and `foldConfusables()`. A code-point-keyed table
  of Cyrillic/Greek letters that render identically to Latin letters (UTS #39-style, not the full
  spec table).
- **`scan.ts`** — `scan(text)`: runs all four detectors, merges + sorts findings by position,
  tallies counts per category, and surfaces the decoded tag-character payload. This is the single
  entry point everything else (sanitize, render, report) is built on.
- **`sanitize.ts`** — `sanitize(text)`: strips every zero-width/bidi/tag-character finding
  outright and folds confusables to their Latin look-alike. Destructive by design (see
  `docs/VISION.md`).
- **`heuristics.ts`** — `detectInjectionHeuristics(payload)`: matches a decoded hidden payload
  against a list of common prompt-injection phrases. Explicitly a UI/report heuristic, not a
  security boundary.
- **`report.ts`** — `buildReportText(result)`: plain-text summary (findings + hidden payload +
  heuristic match) for the "Copy report" action.
- **`render.ts`** — pure HTML-string builders consumed by `main.ts`:
  - `renderDecodedHtml` — the "what the model sees" pane; invisible findings become explicit
    `[U+XXXX]` labels so hidden characters take up visible space.
  - `renderOverlayHtml` — the "what you see" pane overlay; keeps the *raw* character (so width
    and bidi-reordering stay pixel-identical to the textarea underneath) and wraps flagged
    positions in a `.mark` span. Zero-width categories rely on a CSS `::after` tick anchored to
    the (zero-width) span so the marker never shifts surrounding text.
  - `renderFindingsRailHtml` — one chip per finding, in position order.
  - `renderSummaryHtml` — distinguishes "nothing pasted yet" from "scanned and clean" from
    "N findings by category."
  - Every render function tags its output with a shared `data-finding-index` ordinal so the rail,
    overlay, and decoded pane can all be cross-referenced from one click handler.

## UI (`index.html` + `src/main.ts` + `src/style.css`)

Three-column "light table" grid: input pane / findings rail / decoded pane, matching
`docs/DESIGN.md`. Below 1100px it stacks (input → rail → decoded) and the page scrolls normally;
above that, `#app` is pinned to `height: 100vh` and the grid uses `grid-template-rows:
minmax(0, 1fr)` so each column scrolls its own overflow instead of growing the page (a plain
`min-height` on a grid row does *not* clip auto-sized content — this took a couple of iterations
to get right, see the `fix(app): bound the light table to the viewport` commit).

**The overlay technique** (input pane): a transparent `#overlay` div sits on top of the real,
opaque `#input-area` textarea (`z-index: 2`, `pointer-events: none`), rendering the identical text
with `color: transparent` except for `.mark` spans. Only the marker spans are visible, so they
appear to glow directly on the raw pasted text without ever intercepting clicks/typing (those
still go to the textarea underneath). Scroll position is synced one-way (`inputArea` → `overlay`)
on every `scroll`/`input` event.

**Findings rail clicks**: since the overlay isn't independently scrollable by the user, clicking
a rail chip computes a target `scrollTop` from the overlay mark's `offsetTop` and sets it on
`inputArea` (which then drags the overlay along via the existing scroll sync); the decoded pane
just uses `scrollIntoView`. Both matched elements get a brief `.mark--target` /
`.finding--target` highlight class.

**Clipboard writes** (`copyToClipboard` in `main.ts`) are wrapped in try/catch — a denied
clipboard permission is independent of whether the underlying action (sanitize, report) already
succeeded, so a rejection must not suppress the success-flash confirmation.

## Testing

`npm test` runs Vitest over `tests/*.test.ts`, one file per `src/lib/` module, environment
`node` (no DOM — nothing under test needs one, per the pure/impure split above). Prefer
`String.fromCodePoint(...)` over pasting literal invisible/confusable glyphs into test source,
matching the same rationale as the detector tables themselves.

## Build / run

```sh
npm install
npm run dev        # vite dev server
npm test           # vitest run
npm run build      # tsc --noEmit && vite build -> dist/
npm run preview    # serve the dist/ build locally
```

`vite.config.ts` sets `base: "./"` so every built asset reference is relative — required because
this ships to `apps.charliekrug.com/unmask/`, a subpath, not a domain root. Verified via
`vite preview --base /unmask/`.
