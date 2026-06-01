# Review Log

All visual QA, component, and sprint reviews are logged here in reverse-chronological order.

Reviews are observational. They surface findings and recommendations. They do not override architecture or design-system decisions. See `context-rules.md` Rule 6.

---

## Schema

```
ID:               R-###
Date:             YYYY-MM-DD
Reviewer:         Agent name or Human
Subject:          What was reviewed
Findings:         Observations — factual, not editorial
Flags:            Issues requiring attention (severity: Low / Medium / High / Critical)
Recommendations:  Optional — must route through ChatGPT before actioning
Status:           Open | Actioned | Dismissed
```

---

## R-004 — `/start` Stage 3: Q4 Single-Select and Q5 → Q4 Transition

**Date:** 2026-06-01  
**Reviewer:** Claude Code (implementation self-review)  
**Subject:** `components/enquiry/enquiry-opening.tsx`, `app/globals.css` — Q5 → Q4 transition, Q5 memory surface, Q4 single-select stage

**Findings:**
- Pressing "Next step" in Q5 saves selections to `q5Selections`, applies `.enquiry-q5-settling-wrapper` (opacity 0.2, scale 0.97 over 1100ms), then switches stage to `"question2"` at 500ms — producing the approved calm overlap
- Q5 memory block renders with compact label summary: "You mentioned: [comma-separated short labels]" — labels mapped via `Q5_MEMORY_LABELS` constant
- Q5 memory cue ("Q5") renders at `rgba(255,255,255,0.10)` — more muted than the active Q5 cue (`rgba(255,255,255,0.20)`)
- Q5 memory block fades in via `enquiry-q5-memory-appear` (1400ms linear) — calm, non-urgent
- Q4 cue ("Q4") uses the same `enquiry-q5-presence` animation as Q5 cue — consistent atmospheric orientation
- Q4 question reveals left-to-right via `enquiry-mask-reveal-horizontal` — consistent with Q5 and Stage 1 motion language
- Q4 cards enter top-to-bottom with staggered delays (800ms base + 150ms per card) — matching Q5 card pattern
- Q4 is single-select: `role="radiogroup"` on the group, `role="radio"` + `aria-checked` on each card
- Selecting a Q4 card deselects the previously selected card; clicking the active card deselects it
- Card visual states (amber/gold selected, hover) reuse existing `.enquiry-card` and `.enquiry-card-selected` CSS — no new selectors needed
- "Next step" appears after Q4 selection via `enquiry-nextstep-reveal` — same as Q5 Next step
- `prefers-reduced-motion: reduce`: settling skipped, stage switches immediately, no animation classes applied, all content appears at once
- Keyboard focus navigates Q4 cards; `focus-visible` ring present
- Opening context remains at Stage 2 dimmed state — no further change on Q4 entry

**Flags:**

| Severity | ID | Finding | Status |
|---|---|---|---|
| Low | F-007 | Q4 "Next step" is a placeholder — `console.log` only; Q4 → Q3 transition not implemented | Open — Q3 model not yet designed |

**Recommendations:**
- Design Q4 → Q3 transition before implementing — new brief required
- No other changes needed at this stage

**Status:** Partially open — Q4 stage interaction approved. F-005 actioned. F-007 open (Q4 Next step placeholder pending Q3 brief).

---

## R-003 — `/start` Stage 2: Q5 Guided Question

**Date:** 2026-05-31  
**Reviewer:** Claude Code (implementation self-review)  
**Subject:** `components/enquiry/enquiry-opening.tsx` — Stage 2 Q5 multi-select question, card surface, Q5 cue, Next step trigger

**Findings:**
- Q5 orientation cue ("Q5") renders above question text; `aria-hidden="true"` confirmed; scale+fade animation triggers on stage mount
- Question text ("What brought you here today?") reveals left-to-right, linear, consistent with Stage 1 motion language
- Five answer cards reveal sequentially top-to-bottom with staggered delays (800ms base + 150ms per card)
- Cards use frosted/smoked glass gradient surface with inset top-edge hairline; visible gradient depth from top to bottom
- Card selection activates amber/gold warmth: border shifts, top hairline shifts from white to amber, faint outer halo; no ticks, circles, or form-control indicators
- Multi-select works correctly: multiple cards can be activated simultaneously
- "Next step" ghost-pill button appears after first selection; unmounts if all cards deselected
- `role="checkbox"` + `aria-checked` on cards; `role="group"` + `aria-labelledby` on wrapper — correct multi-select ARIA semantics
- `prefers-reduced-motion: reduce`: Q5 cue, card reveals, and Next step all appear immediately; selection transitions instant
- Card `focus-visible` ring is visible at keyboard; "Next step" button is keyboard accessible

**Flags:**

| Severity | ID | Finding | Status |
|---|---|---|---|
| Medium | F-005 | "Next step" button currently only `console.log`s selections — no navigation or Q4 reveal | Actioned — Q4 implemented 2026-06-01 |
| Low | F-006 | Q4 transition behaviour is undefined — how answered questions become contextual memory is not yet designed or documented | Actioned — D-017 approved 2026-05-31 |

**Recommendations:**
- Design Q4 transition before implementing — see D-016 Future Work section
- No other changes required at this stage

**Status:** Closed — Stage 2 interaction approved. F-005 actioned (Q4 implemented 2026-06-01). F-006 actioned via D-017.

---

## R-002 — `/start` Stage 1: Opening Reveal

**Date:** 2026-05-26  
**Reviewer:** Claude Code (implementation self-review)  
**Subject:** `components/enquiry/enquiry-opening.tsx` — Stage 1 mask-based reveal sequence and Begin button

**Findings:**
- Dark radial gradient background renders immediately on route arrival — no flash of white
- Heading line 1 reveals left-to-right, linear, from ~0.6s
- Heading line 2 reveals left-to-right, linear, beginning just before line 1 finishes (~2.9s)
- Supporting text reveals left-to-right, linear, beginning just before line 2 finishes (~5.1s)
- Begin button reveals top-to-bottom, linear, during the final words of supporting text (~9.0s)
- Full phrase settles at ~11.5s — consistent with D-015 approved timing
- Begin button has `tabIndex=-1` and `pointer-events: none` until animation completes; becomes keyboard-accessible on completion
- `prefers-reduced-motion: reduce`: all staged reveals disabled, all content immediately visible, button immediately keyboard-accessible
- All text is real DOM text — no canvas, SVG, or image rendering
- Content wrapper uses `translateY(calc(38vh - 5rem))` in Stage 1 to approximate vertical centring without `justify-center` — prevents layout reflow jump on stage transition

**Flags:**

*None. Stage 1 behaviour matches D-015 approved spec.*

**Recommendations:**
- Minor microtiming adjustments remain possible during a future mastering phase — no action required now

**Status:** Approved. Stage 1 creative milestone complete.

---

## R-001 — Homepage Skeleton

**Date:** 2026-05-23  
**Reviewer:** Claude Code (implementation self-review)  
**Subject:** `app/page.tsx` — initial homepage structure

**Findings:**
- Navbar, Hero, Services, Work, and Footer sections render in correct order
- Forced dark background (`bg-neutral-950`) applied consistently across all sections
- `Container` component used in every section — layout is consistent
- Typography hierarchy is clear: H1 (6xl bold) → H2 (3xl semibold) → body (lg, neutral-400) → muted (sm, neutral-500)
- CTA button (white pill, `rounded-full`) is visually distinct against the dark background
- Section dividers (`border-t border-neutral-800`) create rhythm without visual noise

**Flags:**

| Severity | ID | Finding | Status |
|---|---|---|---|
| High | F-001 | Geist font variables declared in `layout.tsx` but not applied to `<html>` className — Geist not rendering | Actioned — Sprint 2. Variables applied to `<html>`. See D-011. |
| High | F-002 | `--font-sans` in `globals.css` references `var(--font-sans)` — circular, no effect | Actioned — Sprint 2. Corrected to `var(--font-geist-sans)`. `--font-heading` also fixed. See D-011. |
| Medium | F-003 | Navbar has no mobile responsive state — links will overflow or collapse on small screens | Open — Sprint 2 Up Next |
| Low | F-004 | Nav and CTA use plain `<a>` tags — should use Next.js `<Link>` for client-side routing | Open — Sprint 2 Up Next |

**Recommendations:**
- Apply `${geistSans.variable} ${geistMono.variable}` to `<html>` className in `layout.tsx` (not `<body>` — see D-011 for rationale)
- Correct `--font-sans` and `--font-heading` tokens in `globals.css` to `var(--font-geist-sans)`
- Add mobile nav before launch — pattern TBD (hamburger menu, collapsed links, or slide drawer)
- Replace `<a>` with `<Link>` from `next/link`

**Status:** Partially actioned — F-001 and F-002 resolved in Sprint 2. F-003 and F-004 remain open.

---

*Last updated: 2026-06-01*
