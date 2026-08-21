# Enquiry Opening — Reveal Timing Reference

**Captured:** 27 July 2026
**Classification corrected:** 21 August 2026 — see the banner below.
**Status:** Factual reference only. This is not a plan and grants no implementation authority.
**Purpose:** Record the **reasoning** behind the opening reveal delays, which exists nowhere in
the repository. The CSS carries the numbers; nothing carried the why.

Companion to `contact-form-current-timing-reference.md`, which does the same job for the
completion choreography.

---

# ⛔⛔ THE DEFECT CLASSIFICATION IN THIS DOCUMENT IS CLOSED BY D-055

> **Carl walked a clean production build on 21 August 2026 and ruled: the Begin button is NOT
> meant to be immediately clickable. The radial reveal is correct, and so is its gating of
> clickability.** The gating described below is the **intended design**.
>
> ⚠ **THE MEASUREMENTS BELOW ARE RETAINED AS HISTORY AND THEY ARE ACCURATE.** The reading-speed
> reasoning, the desktop and mobile overlap tables, the mechanism, the ruling-out of Three.js and
> the reduced-motion note all still describe the system correctly. **What changed is the
> CLASSIFICATION, not the record.**
>
> ⛔ **NOTHING WAS EVER FIXED, AND NOTHING NEEDS FIXING.** Do not read anything below as an
> outstanding job. **Do not decouple the hit target from the mask, and do not shorten the delay to
> make the button available earlier** — that is a change to approved work and needs Carl.
>
> ⚠ **YOU WILL SEE THE DELAY IF YOU LOAD THE PAGE. That is the design working, not evidence that
> this banner is stale.** The gate lifted at **+7711ms desktop** and **+10259ms mobile** on the
> 21 August production build, and Carl approved it in that state.
>
> **Full ruling: `decisions.md` D-055.**

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

## ⚠⚠ CORRECTED 21 August 2026 — this section said "RESOLVED". NOTHING WAS EVER FIXED

**What this section used to claim:** that Carl confirmed on 28 July 2026 the button *"was fixed
in an earlier session"*, and that the measurement below **"no longer describes current
behaviour."**

⛔ **BOTH CLAIMS WERE FALSE, AND THE MEASUREMENT BELOW HAS DESCRIBED CURRENT BEHAVIOUR THE
WHOLE TIME.** No fix was ever made. The gating is still exactly what the 27 July measurement
describes, and it fired at **+7711ms** on the 21 August 2026 production build.

**What actually happened on 28 July: Carl looked at the button and was satisfied with it.**
That is the *same ruling* he made on 21 August — **it was simply recorded under the wrong
heading.** A satisfaction misfiled as a fix.

> ### ⚠⚠ A SATISFACTION IS NOT A FIX, AND FILING ONE AS THE OTHER IS WHY THIS ITEM RETURNED TWICE.
> **"Fixed" is a claim about the build.** It decays, and **anyone can refute it by loading the
> page and still seeing the delay** — which is how the item came back on 19 August 2026.
> **"Approved" is a design decision.** Observing the delay *confirms* it. See D-055.

⚠ **The section did mislead a later session, and that part of the record stands.** It, and
`current-sprint.md`, both named this as the first job when building resumed, and the Builder
started working from it. **Reading the code would not have caught the error** —
`enquiry-opening.tsx:259` and the 7400ms delay at `globals.css:185` still exist and still look
like the described defect.

⚠⚠ **BUT THE 28 JULY DIAGNOSIS OF *WHY* IT MISLED WAS ITSELF WRONG.** It concluded the file was
stale about a fix. **The file was stale about a classification.** Reading the code confirmed the
defect *because the mechanism is real and still there* — not because the record had decayed.

**The lesson, corrected:** a recorded next-step is a claim about the present and it decays — so
before acting on one, confirm it in the running app. ⚠ **And when it turns out the behaviour is
intended, close it as a DECISION, not as a fix.** A closure that is a claim about the build can
be refuted by the build; a design decision cannot.

---

## ⚠ Measured defect — the Begin button's usability, not its appearance

**(The measurement is accurate and current. The *defect* classification is CLOSED — D-055.
See the banner at the top and the correction above.)**

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

## ⛔ SUPERSEDED — this section used to close with a standing instruction

**It read:** *"Not fixed. Carl's decision, 27 July: this is the first job when building resumes.
Both the desktop 7400ms and the mobile 10100ms paths need an answer, and they are separate
values."*

⛔ **THAT INSTRUCTION IS CLOSED, NOT DEFERRED — D-055, 21 August 2026.** The gating is the
intended design. **The desktop and mobile values do not need separate answers; they do not need
an answer at all.**

⚠ **The 27 July analysis above was not wrong about the facts.** It measured correctly and
described the mechanism correctly, and its numbers remain the reference for this behaviour.
**What it got wrong was calling the result a defect** — a judgement about intent, not a
measurement.

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
