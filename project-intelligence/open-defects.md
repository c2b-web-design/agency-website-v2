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

- **What:** The answer labels are baked into the card face's texture; screen readers get no text.
- **Where:** `components/enquiry/answer-card-mesh.tsx` (`buildLabelTexture`).
- **Found:** 2026-08-09 (`1c9b8d7`); D-051.
- **Waiting on:** Carl — a design question (move the text out of the texture?). Not scheduled.

## ENTRANCE-Q4Q1 — only Q5 gets the card entrance

- **What:** Q4–Q1 have no card entrance: the gate is stage-derived and `stage` does not change across a step.
- **Where:** `components/enquiry/answer-card-canvas.tsx`.
- **Found:** before 2026-08-15; `live-work/entrance-work-written-and-unwound-15-august.md` (diagnosed there).
- **Waiting on:** Unfixed on purpose for this look. Must not be quietly compensated for.

## VERIFY-UNPROVEN — no harness verdict is admissible as evidence

- **What:** `verify/proven.json`'s `proven` array is empty (checked 2026-11-28): no harness pass is admissible; reds
  still count.
- **Where:** `verify/proven.json` (the demoted entries in `_demoted`).
- **Found:** 2026-08-28; D-064 (reasoning, restore route).
- **Waiting on:** Two entries earned against HEAD, `reveal-stall-measure.mjs` first. Not scheduled.

## ENVMAP-STALE — env-map constants appear to do nothing

- **What:** `useRoomEnvMap`'s `useMemo` (keyed `[plate, gl, blur]`) reads `ENV_SHELL_COLOR`, `ENV_PLATE_INTENSITY`,
  `ENV_SHELL_RADIUS` without depending on them: a changed value serves the cached map (checked 2026-11-28).
- **Where:** `components/about/room-environment.tsx`.
- **Found:** 2026-09-22 (a reload hid Carl's diagnostic red); D-091.
- **Waiting on:** Carl — report, do not fix.

## RIM-DARK — the clear rim reflects a near-black shell, not the room

- **What:** The rim reads dark over skirting and floorboards: at grazing angles it reflects `ENV_SHELL_COLOR` `#141a20`
  (proven: a red shell turned it red). Real because the neon spends time off.
- **Where:** `about-card-glass.ts`, `room-environment.tsx`.
- **Found:** 2026-09-22, Carl's eye; D-091 (two candidates).
- **Waiting on:** Carl; a deliberate look first (the take light may resolve it).

## LOGO-FADE-FRAME — a long frame as the logo's fade begins

- **What:** On a cold first visit, one 49.8 ms frame (~3 lost) within 3 frames of the logo's first draw.
- **Where:** `/proto/hero`, the opening (`e561aed`); headed, production.
- **Found:** 2026-11-28; `live-work/architect-probe2-headed-28-november.md` ("base").
- **Waiting on:** Carl to schedule; "reorder only" or the split gate may remove it.

---

*Seeded 19 August 2026. Entries are admitted by Carl only. ANCHOR-STALE removed 28 November 2026 as resolved in code: the
reveal anchor now also requires a stamp matching the live question (`answer-card-canvas.tsx`, the `usable` predicate).*
