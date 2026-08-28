# Open defects — live product faults awaiting action

- **Fixed format:** what, where, found, waiting on. No narrative — link to an incident record.
- **Live PRODUCT faults only.** Carl admits entries.
- **Resolved defects are REMOVED**, not struck through.
- **400 words of ENTRIES, header excluded** — five at ~80 words. A longer list is one nobody reads.
- ⚠ **Nothing enforces this.** Check an entry's date against the code before trusting it.

⚠ *The original limit was 400 words whole-file: a number chosen, not derived, and the format set
alongside it could never have fitted inside it. Corrected 19 August 2026.*

---

## D-051-A11Y — answer text is not in the accessibility tree

- **What:** The answer card labels are baked into the face's albedo texture, so the visible answer
  text does not exist as text to a screen reader.
- **Where:** `components/enquiry/answer-card-mesh.tsx` (`buildLabelTexture`, the face `map`).
- **Found:** 2026-08-09, landed in `1c9b8d7`. Recorded in **D-051** (`decisions.md`), which
  describes the material and keeps the note as part of that description.
- **Waiting on:** Carl — whether the answer text moves out of the baked texture. A design question,
  not a bug fix. Not scheduled, no owner.

---

## ENTRANCE-Q4Q1 — only Q5 gets the card entrance

- **What:** Q4–Q1 have no card entrance. `hostCardsVisible` is stage-derived, and `stage` does not
  change across a question step, so the entrance gate never flips between Q5 and Q1.
- **Where:** `components/enquiry/answer-card-canvas.tsx`.
- **Found:** Predates 2026-08-15. Recorded in
  `live-work/entrance-work-written-and-unwound-15-august.md` (mechanism already diagnosed there —
  do not re-derive it).
- **Waiting on:** Unfixed on purpose for this look. Must not be quietly compensated for.

---

## ANCHOR-STALE — the entrance ladder is unrelated to the text

- **What:** A stale reveal anchor is accepted because the only guards are "is a number" and "is in
  the past" — a value 8 seconds old satisfies both. Cards enter correctly staggered but unrelated
  to the text.
- **Where:** `components/enquiry/answer-card-canvas.tsx:1925`.
- **Found:** 2026-08-17. Recorded in `live-work/mode-ab-finding-17-august.md`.
- **Waiting on:** Carl's instruction — **report, do not fix.**

## VERIFY-UNPROVEN — no harness verdict is admissible as evidence

- **What:** `verify/proven.json`'s `proven` array is **empty**. Its one entry was demoted on
  28 August 2026 as misattributed — the credential described `reveal-stall.mjs`, which films,
  while every arm of its proof came from `reveal-stall-measure.mjs`. ⛔ **No pass from any of the
  131 harnesses is currently admissible.** Reds still pass through unchanged.
- **Where:** `verify/proven.json`; the demoted entry is preserved in `_demoted` with its evidence.
- **Found:** 2026-08-28. Reasoning and the restore route: **D-064** (`decisions.md`).
- **Waiting on:** Two separate entries earned against current HEAD — `reveal-stall-measure.mjs`
  first. ⚠ **Not a regression; the true state made visible.** Not scheduled.

---

*Seeded 19 August 2026. Entries are admitted by Carl only.*
