# Unmask — Backlog

Epic/story breakdown for the build. Every story has concrete, verifiable acceptance criteria —
no vibes. Build implements to the criteria; QA attacks them.

A minimal scaffold already proves the underlying detectors and a working demo exist (see
`src/lib/`), but no story below is considered done until its full acceptance criteria are met
against `docs/DESIGN.md`.

## Epic 1 — Reveal the hidden payload (the wow moment)

- [x] **1.1 — Paste-and-scan reveals invisible characters live (WOW MOMENT)**
  - Pasting the seeded demo sentence immediately highlights the tag-character findings in a
    color distinct from zero-width findings.
  - Typing or pasting into the input re-scans without a button click, updating the decoded pane
    and findings list on the same input event.
  - An all-ASCII sentence with no hidden characters shows a "Looks clean" summary, never a blank
    or empty-looking state.

- [x] **1.2 — Full Unicode tag-character decode to plain text**
  - A multi-character tag-character payload decodes to its exact ASCII string, shown explicitly
    as a "hidden payload" value, not just individual highlighted characters.
  - The cancel tag (U+E007F) is treated as a terminator and never appears in the decoded payload.

- [x] **1.3 — Zero-width & invisible character catalog completeness**
  - Detector covers the full set of Unicode format (`Cf`) and other whitespace-adjacent
    characters relevant to text smuggling, not just the SCOPE-phase starter subset.
  - Each finding in the findings rail shows its Unicode name and code point (e.g. "Zero Width
    Space — U+200B").

- [x] **1.4 — Design polish: two-pane light-table layout**
  - At 1440×900 the "what you see" and "what the model sees" panes each occupy roughly 45% width
    with a visible findings rail between them, per `docs/DESIGN.md`.
  - At 390×844 the panes stack vertically with no horizontal scroll and no overlap.
  - The wordmark's glyph-settle animation plays once on load and is skipped entirely when
    `prefers-reduced-motion` is set.

## Epic 2 — See what the model sees

- [x] **2.1 — Bidi-override detection with reordering preview**
  - Every bidi control character (RLO, LRO, embeddings, isolates) is flagged with its specific
    control name, not a generic "bidi character" label.
  - For any text containing a bidi-control character, the decoded pane shows the logical
    (stored) character order rather than the visually-reordered rendering a browser would show.

- [ ] **2.2 — Homoglyph/confusable detection covers common phishing scripts**
  - Detection covers the full relevant UTS #39 confusable set for Cyrillic and Greek Latin
    look-alikes (uppercase and lowercase), not just the SCOPE starter subset.
  - A mixed-script string (e.g. `pаypal.com`) is flagged even when only one character in the
    string is non-Latin.
  - Partial: table broadened from 35 to 45 entries (more lowercase Greek, extended Cyrillic) —
    still a curated subset, not the complete official UTS #39 skeleton table.

- [x] **2.3 — Human-vs-model diff view highlights the delta**
  - The normalized/decoded text and the raw input are shown side by side with every differing
    span visually highlighted.
  - Clicking a finding in the findings rail scrolls and highlights the corresponding location in
    both panes.

- [x] **2.4 — Design polish: interaction states & accessibility pass**
  - Every control (textarea, buttons, findings-list items) has a visible `:focus-visible` state
    distinct from its hover state.
  - Tab order reaches every interactive element in a logical sequence with no keyboard trap.
  - The live-region summary announces finding counts on scan, verified with a screen reader or
    an automated accessibility check (e.g. axe).

## Epic 3 — Sanitize & audit real files

- [x] **3.1 — One-click sanitize with clipboard confirmation**
  - Clicking "Copy sanitized" replaces the input with the cleaned text and copies it to the
    system clipboard.
  - Re-scanning the cleaned text reports zero findings.
  - The button shows a visible success confirmation that clears after ~150ms, never a
    browser-native alert.

- [x] **3.2 — File upload / drag-and-drop for skill and MCP files**
  - Dragging a `.md`/`.txt`/`.json` file onto the input pane loads its contents into the scanner.
  - A file over 1MB shows a designed inline error state instead of hanging or throwing an
    uncaught error.

- [x] **3.3 — Shareable scan report export**
  - A "Copy report" action produces a plain-text summary listing each finding's name, code
    point, and plain-language reason.
  - The report explicitly states whether a decoded hidden payload matched an
    instruction-injection heuristic (e.g. "ignore previous", "system prompt", "disregard the
    above").

- [x] **3.4 — Design polish: empty/loading/error states**
  - The empty-input state shows designed placeholder copy per `docs/DESIGN.md`'s juice plan, not
    a blank textarea with no guidance.
  - A file-too-large or unreadable-file error renders as a designed inline error state, never a
    browser `alert()`.

## Epic 4 — Ship readiness

- [x] **4.1 — Static build works from any subpath**
  - `npm run build` output in `dist/` loads and functions correctly when served from a
    non-root subpath (verified via `vite preview --base /some-path/`).
  - `dist/index.html` and its built assets contain no leading-slash absolute asset URLs.

- [x] **4.2 — Full test coverage across detectors and sanitize**
  - Every detector module and the `scan`/`sanitize` orchestrators have passing unit tests
    covering at least one true-positive and one true-negative case each.
  - CI (typecheck, test, build) is green on the default branch.

- [x] **4.3 — Design polish: final self-review against DESIGN.md**
  - Squint test, resize test (390/768/1440), and a control-by-control interaction pass are
    completed and the results noted in the STATUS `memory` field.
  - No anti-generic-ban violations are present: no unstyled native controls, no pure black/white
    surfaces, no placeholder copy anywhere on the page.
