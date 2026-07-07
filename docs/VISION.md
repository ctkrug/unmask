# Unmask — Vision

## The problem

Text is the interface between humans and language models — prompts, skill files, MCP tool
descriptions, shared instructions. But "text" in the Unicode sense is a much bigger surface than
"text" in the human-reading sense. A handful of zero-width characters, a bidi-override run, or a
string of invisible Unicode tag characters can carry a whole hidden sentence that never renders
on screen. A human reviewing the file sees nothing wrong. A model tokenizing the same bytes sees
every word — including "ignore previous instructions."

As more of what people paste into an LLM comes from someone else — a shared prompt template, a
downloaded MCP tool description, a skill file from a repo — the odds that some of that text was
deliberately doctored go up. There is currently no lightweight, offline way for a person to check
"is there anything hiding in this text that I can't see but a model would read?" before they trust
it.

## Who it's for

- **Prompt engineers and AI tool builders** vetting third-party prompts, skill files, or MCP tool
  descriptions before wiring them into an agent.
- **Security-conscious developers** reviewing text from an untrusted source (a support ticket, a
  scraped web page, a pasted config) before feeding it to an LLM pipeline.
- **Anyone curious** who wants to see, concretely, what a zero-width character smuggling attack
  actually looks like — the tool is also a teaching aid for an otherwise invisible threat class.

## The core idea

Paste text in. Unmask runs it through a battery of Unicode-aware detectors — zero-width and
invisible characters, bidirectional-override controls, Unicode tag-character smuggling, and
script-mixing homoglyphs — and renders a side-by-side view: **what you see** (the raw text as a
human reads it) next to **what the model sees** (the fully decoded text, with every invisible or
disguised character made explicit). Each finding gets a plain-language explanation. One click
sanitizes the text — strips the invisible characters, folds homoglyphs back to their Latin
look-alikes — and copies a clean version.

The wow moment is the demo the app seeds itself with on load: a perfectly normal-looking sentence
that, the instant you look at the decoded pane, reveals a hidden "ignore previous instructions"
payload smuggled through invisible Unicode tag characters. No setup, no explanation needed — the
threat is obvious the moment you see it.

## Key design decisions

- **Fully client-side, zero network calls.** Nothing pasted into Unmask ever leaves the browser —
  this matters both for trust (people won't paste sensitive prompts into a tool that phones
  home) and for the "purpose-built for the AI era, fully offline" pitch.
- **Detectors are independent and composable.** Zero-width detection, bidi-control detection, tag-
  character decoding, and confusable detection each live in their own module with their own
  tests, and a thin orchestrator (`scan()`) merges their findings. This keeps each detector easy
  to reason about and easy to extend (e.g. broadening the confusables table) without touching the
  others.
- **Findings carry a plain-language reason, not just a code point.** The target audience is not
  assumed to know Unicode block names — every finding explains *why* it's flagged in a sentence a
  non-specialist can read.
- **Code points over literal glyphs in source.** Every detector table is defined by numeric code
  point rather than pasting the literal invisible/confusable character into source — an invisible
  character embedded directly in a source file is exactly the kind of thing an editor or diff
  tool can silently mangle, which would be an ironic bug for this specific tool to ship.
- **Sanitize is destructive by design.** Zero-width, bidi-control, and tag characters are removed
  outright (there's no legitimate reason for them to be in prose text meant for an LLM), while
  confusables are folded to their Latin look-alike rather than deleted, since deleting them would
  usually corrupt otherwise-legible words.

## What "v1 done" looks like

- All four detector categories (zero-width, bidi-control, tag-character, confusable) are
  implemented with real Unicode data tables, not just the SCOPE-phase starter subsets.
- The two-pane "what you see / what the model sees" layout is fully built per `docs/DESIGN.md`,
  responsive at 390/768/1440px, with the findings rail linking each flagged character to both
  panes.
- Per-finding explainers are visible inline (tooltip or expandable detail), not just in a side
  list.
- One-click sanitize copies a cleaned version to the clipboard and confirms the action visually.
- A file-upload/drag-and-drop path exists for auditing whole skill/MCP/prompt files, not just
  pasted text.
- The landing view and the tool are the same page, on-brand, with the wow-moment demo pre-loaded
  so a first-time visitor sees the payload reveal within seconds of arriving.
- CI is green (typecheck, unit tests, build) on every push.
