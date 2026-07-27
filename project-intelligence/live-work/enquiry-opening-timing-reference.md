# Enquiry Opening — Reveal Timing Reference

**Captured:** 27 July 2026
**Status:** Factual reference only. This is not a plan and grants no implementation authority.
**Purpose:** Record the **reasoning** behind the opening reveal delays, which exists nowhere in
the repository. The CSS carries the numbers; nothing carried the why.

Companion to `contact-form-current-timing-reference.md`, which does the same job for the
completion choreography.

---

## The reasoning — this is the part that was undocumented

**The delays are derived from average human reading speed.** Each element begins revealing
*just before* the previous one finishes, so the eye moves through the sequence without a dead
beat. The intent is **continuous flow across the three elements** — heading line 1, heading
line 2, subtext — not three separate reveals with pauses between them.

Carl, 27 July 2026: *"its supposed to start just before it finished. i got timing data on how
fast an average human reads. So there would be a continuous flow between the 3 elements."*

**Why this matters more than the numbers.** The overlaps look like arbitrary values, and an
even-looking sequence is exactly what a later reader would "tidy" them into. Evenly spaced
delays would destroy the effect — the flow depends on the *overlap*, and the overlap is
calculated, not aesthetic.

**These are approved timings.** Recorded so the reasoning survives, not reopened.

---

## Measured sequence — desktop (`app/globals.css` lines 166–185)

| Element | Delay | Duration | Ends | Overlap with next |
|---|---:|---:|---:|---:|
| Heading line 1 | 600ms | 2100ms | 2700ms | next starts 600ms early |
| Heading line 2 | 2100ms | 2100ms | 4200ms | next starts 600ms early |
| Subtext | 3600ms | 4200ms | 7800ms | next starts 400ms early |
| Button radial reveal | **7400ms** | 5000ms | 12400ms | — |

All four use `cubic-bezier(0.37, 0, 0.63, 1)` with `both` fill.
Headings and subtext use `enquiry-mask-reveal-horizontal`; the button uses
`enquiry-mask-reveal-radial`.

**The overlap is consistent — 600, 600, 400ms.** That consistency is what shows the values
were derived rather than chosen individually.

## Measured sequence — mobile (`app/globals.css` lines 1890–1912)

| Element | Delay | Duration | Ends |
|---|---:|---:|---:|
| Line 1 | 600ms | 1500ms | 2100ms |
| Line 2 | 1700ms | 1550ms | 3250ms |
| Line 3 | 2550ms | 1700ms | 4250ms |
| Line 4 | 3850ms | 1450ms | 5300ms |
| Subtext | 5000ms | 2800ms | 7800ms |
| Second subtext line | 7100ms | 2400ms | 9500ms |
| Button radial reveal | **10100ms** | 5000ms | 15100ms |

Mobile splits the heading across four lines and the subtext across two, so the sequence runs
longer. **The same overlap principle holds throughout.**

---

## ⚠ Measured defect — the Begin button's usability, not its appearance

**Measured 27 July 2026** with `verify/begin-timing.mjs`, on Carl's report that the button
*"was clickable immediately when it was built"* and had become slow.

| Measurement | Value |
|---|---|
| `enquiry-mask-reveal-radial` starts | **+7450ms** |
| Begin button becomes usable (`tabindex="0"`) | **+7466ms** |
| Dead time after the visitor can read everything | ~3.8s |

**The visual sequence is correct and is not the defect.** The reveal does exactly what the
reading-speed reasoning above intends.

**The defect is that clickability is welded to the visual clock.** `enquiry-opening.tsx`
activates the hit target on the mask's `animationstart` for `enquiry-mask-reveal-radial`. Since
that animation is last in the sequence, the button inherits the full 7400ms delay before it can
be clicked at all.

**Two clocks were conflated:**

- The **visual clock** is paced to reading speed. Correct, and approved.
- The **interaction clock** should be paced to *intent* — a visitor who has decided at second
  two should not wait until 7.4.

**How it regressed without anyone noticing.** The source comment shows the problem was already
half-solved: the hit target was deliberately made a *sibling* of the mask rather than a child,
so *"the cursor turns to a hand the instant the reveal begins, not once the circle physically
reaches the pill."* That removed the second half of the wait. The first half — waiting for the
reveal to begin at all — was fine when the sequence was shorter, and grew silently as the
choreography lengthened. **Nothing announced that extending the reveal also extended the dead
time.**

**Ruled out by measurement, not by reasoning:** this is **not** caused by the Three.js
pre-warm work. `verify/opening-trace.mjs` recorded **0 WebGL contexts and 0 canvas elements**
during the opening — the `questionnaireStarted` gate holds. Frames 357 of ~359 expected. The
one long task (104ms) is page load. *The first hypothesis was that the Three.js work had
reached back into the opening; measuring showed it had not, and pointed at CSS instead.*

**Reduced motion is unaffected** — the mask is static, `beginActive` is set immediately, and
the button is usable at once. Only the animated path is slow.

**Not fixed.** Carl's decision, 27 July: this is the first job when building resumes. Both the
desktop 7400ms and the mobile 10100ms paths need an answer, and they are separate values.

---

## Implementation sources

- `app/globals.css`
  - `@keyframes enquiry-mask-reveal-horizontal` (line 132)
  - `@keyframes enquiry-mask-reveal-radial` (line 154)
  - desktop delays, lines 166–185
  - mobile delays, lines 1890–1912
  - `prefers-reduced-motion` block, line 192
- `components/enquiry/enquiry-opening.tsx`
  - `beginActive` state and the `onAnimationStart` guard
  - `tabIndex` / `aria-disabled` on the hit target

**Line numbers shift with every edit above them.** Verify by reading the file, not by trusting
a recorded line number — the same rule `CLAUDE.md` applies to the lint baseline.

---

## How to re-measure

```
npm run dev
node verify/begin-timing.mjs      # when the button becomes usable, and every animationstart
node verify/opening-trace.mjs     # WebGL, frames, long tasks during the opening
```

Both print measured values. **Re-run after any change here** — a before and after number is
what makes a timing fix reviewable rather than a matter of opinion.
