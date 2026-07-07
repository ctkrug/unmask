# Unmask — Design Direction

This is the single source of truth for the look and feel. The app and its landing view share
it — they are one brand. Change it only deliberately, in its own commit, and say why.

## 1. Aesthetic direction

**Unmask is a forensic document examiner's blacklight table.** The page is a near-black
darkroom; pasted text sits on it like a document under UV inspection, and every hidden
character you find *fluoresces* — the exact sensation of invisible ink glowing to life under a
blacklight. Nothing about this UI is playful or soft: it's an evidence-room instrument built to
catch things a normal light (a normal reading) would miss.

This is chosen deliberately against the recent portfolio's directions — blueprint cyan-on-navy
(Bankroll), warm print-editorial bone paper (CVE Radar), night-sky ink-blue/brass (Gistmap), and
darkfield-fluorescence green/magenta/cyan (Mitosis Lab). Unmask goes **violet-black UV** with a
single acid-glow ink color as its signature, a family none of those occupy, while still fitting
the "instrument, not toy" register the security/analysis category calls for.

## 2. Tokens

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0a0714` | page background — near-black, violet-tinted |
| `--surface-1` | `#150f24` | panels, the "light table" surface |
| `--surface-2` | `#201a38` | raised panels, cards, the findings rail |
| `--text` | `#ede9fb` | primary text — pale lavender-white |
| `--text-muted` | `#948aad` | secondary text, captions, labels |
| `--accent` | `#a742ff` | UV violet — primary interactive color, focus rings, links |
| `--ink` | `#6dffb8` | acid-glow green — "revealed hidden character" highlight color |
| `--danger` | `#ff3d71` | flagged instruction / injection payload |
| `--success` | `#39e6c8` | clean / sanitized confirmation |
| type — display | **Space Grotesk** (Google Fonts), system fallback `ui-sans-serif, system-ui` | wordmark, headings |
| type — UI/body | **IBM Plex Mono** (Google Fonts), system fallback `ui-monospace, SFMono-Regular, Menlo, monospace` | body copy, textarea, findings list, buttons |
| spacing unit | `8px` base scale (`4/8/16/24/32/48/64`) | all layout spacing |
| corner radius | `10px` panels, `6px` controls | consistent soft-technical edges |
| shadow/glow | `0 0 0 1px rgba(167,66,255,.15), 0 8px 30px rgba(167,66,255,.08)` ambient violet glow on raised surfaces; flagged findings get a tighter `0 0 12px rgba(255,61,113,.5)` pulse | depth without flatness |
| motion | UI transitions 150–220ms ease-out; a finding "developing" (fading in from transparent to lit) animates 400ms ease-out once per scan | feedback without noise |

Monospace as the *body* font (not just code) is deliberate: this tool's entire subject is
individual characters, so fixed-width type lets every glyph — visible or revealed — line up in
a grid the user can trust.

## 3. Layout intent

**Hero = the light table.** A two-pane split fills the viewport:

- **Left pane — "What you see."** The raw paste target: a large textarea/contenteditable
  surface, monospace, styled like a sheet of paper laid on the light table. Every flagged
  character gets an inline highlight in `--ink` (benign/invisible) or `--danger` (a decoded
  hidden-instruction payload), with a thin pulsing outline so it visually "glows" against the
  dark background.
- **Right pane — "What the model sees."** The fully decoded/normalized text — bidi-overrides
  resolved, tag characters expanded, zero-width characters made visible as explicit glyphs — so
  the diff between the two panes *is* the payload.

At 1440×900 the two panes sit side by side, each roughly 45% width, with a slim center findings
rail (~10%) listing each detected issue as a clickable chip that scrolls both panes to it. Above
the panes: the wordmark, a one-line pitch, and the paste/sanitize controls — kept compact (≤15vh)
so the light table itself is the dominant, ≥65vh element.

At 390×844 the panes stack: input pane first, findings rail as a horizontal scrollable chip row
beneath it, decoded pane below that — never both panes squeezed side by side into unreadable
columns.

## 4. Signature detail

The wordmark **"unmask"** renders in Space Grotesk with the middle letters — `m`, `a`, `s` —
overlaid by faint zero-width-joiner glyph marks that fade in and settle into place on page load,
as if the word itself briefly had something hidden inside it before resolving clean. It's a
4–5 frame, one-time animation (respects `prefers-reduced-motion`, degenerating to a static
wordmark). The page background carries a very faint scanline/grain texture reminiscent of a UV
lamp's flicker, animated at near-imperceptible opacity.

## 5. Juice plan

Unmask isn't a game, but findings still need to *feel discovered*, not just appear:

- Running a scan: each flagged character "develops" — fades in from 0 opacity to its full
  `--ink`/`--danger` highlight over ~400ms, staggered ~30ms per finding, so a payload visibly
  reveals itself rather than snapping into view.
- Copy-sanitized-text and other confirmations get a brief `--success` flash on the button
  (140ms) rather than a modal.
- No sound — this is a professional instrument, not a toy; silence is the correct choice here.
- All motion respects `prefers-reduced-motion`: reveals still happen, just as instant state
  changes instead of animated fades.
