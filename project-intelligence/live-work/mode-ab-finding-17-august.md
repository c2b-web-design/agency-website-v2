# ⚠⚠ Q4–Q1 ENTER AT 100% MODE B — measured 17 August 2026, Step 2

**A FINDING, NOT A DEFECT TO FIX.** Carl's instruction for this step was to capture the Mode
A/B rate before and after the entrance re-arm and report movement. This is that report.
**Nothing here was acted on.**

---

## The numbers — `verify/ladder-mode.mjs`, 6 runs, production `:3100`, same build settings

### BEFORE (at `cbedda1`, Step 1)

```
  question   Mode A   Mode B   Mode B rate   overrun ms (median)
  Q5            30        0           0%          8
  ALL           30        0           0%
```

⚠ **Q4, Q3, Q2 and Q1 emitted NOTHING AT ALL** — across six complete four-step walks. The
entrance never re-ran, so there was no ladder to have a mode.

### AFTER (the entrance re-arm)

```
  question   Mode A   Mode B   Mode B rate   overrun ms (median)
  Q5            30        0           0%          6
  Q4             0       30         100%       8160  ⚠
  Q3             0       30         100%       3445  ⚠
  Q2             0       30         100%       3386  ⚠
  Q1             0       30         100%       3398  ⚠
  ALL           30      120          80%
```

**Q5 is unchanged: 0% Mode B, overrun 6–8ms.**

---

## ⚠ HOW TO READ THIS — THE BEFORE IS ABSENCE, NOT A LOW RATE

**There is no Q4–Q1 rate that "moved".** Before this step those questions had no entrance at
all, so they had no mode. The 100% is a **first measurement of a thing that did not previously
exist**, not a regression from 0%.

⚠ **The honest statement is: Q4–Q1 now HAVE an entrance, and it is arriving in Mode B.** The
cards enter and still stagger; what is lost is their relationship to the text.

⚠ **AND THIS IS WHY THE BEFORE CAPTURE WAS REQUIRED.** Without it, someone finding 100% Mode B
at Q4–Q1 later could not tell whether this step caused it or whether it had always been so.
The answer is neither: the question could not be asked before.

---

## ⚠ THE MECHANISM — IT IS NOT THE PRECOMPILE RACE

**Measured, not inferred.** A throwaway probe wrapped `window.__revealStart` in a setter and
logged every write against the entrance effect's read:

```
  __revealStart writes:
    set to 8154  at 8155ms   (activeQ was Q5)
    set to 16506 at 16506ms  (activeQ was Q4)

  modetrace:
    Q5  A-anchored  overrun 5ms
    Q4  B-clamped   overrun 8343ms
```

**`__revealStart` IS updated for Q4 — at 16506ms. The Q4 entrance effect read it at ~16497ms,
about 9ms EARLIER**, and therefore got Q5's value from 8.3 seconds before. That gap *is* the
overrun.

**The ordering:**

1. `arriving` edge fires, in the same React batch as `setActiveQ(4)`
2. the entrance effect re-runs on the new epoch and reads `__revealStart` — **still Q5's**
3. the new phrase commits and paints; its reveal animation starts
4. `onAnimationStart` writes `__revealStart` for Q4 — **too late for the reader in step 2**

`answer-card-canvas.tsx:1925` accepts the stale value because its only guards are "is a number"
and "is in the past". A value 8 seconds old satisfies both. The clamp then does exactly what it
was designed to do — **fail to the current timing rather than to a collapsed ladder** — so the
cards enter correctly staggered, just unrelated to the text.

⚠ **The clamp is working. The anchor is stale.** Those are different faults and the distinction
matters for whoever fixes this.

**Q3/Q2/Q1 at ~3400ms rather than ~8160ms** is consistent: one corridor step's distance back to
the previous question's reveal, where Q4's gap also contains the opening.

---

## ⚠ WHAT THIS MEANS FOR ITEM 5 — THE LEAD IS PROTECTED, NOT CONTAMINATED

Carl's prediction, recorded before the work: *"Step 2 may change the Mode A/B distribution for
three questions — the exact mechanism under investigation in item 5."*

**The prediction was right that the distribution would move, and wrong about the mechanism** —
and that is a useful result rather than a miss. The movement is **not** the precompile race
item 5 is chasing. It is a stale-anchor ordering fault introduced by giving Q4–Q1 an entrance
at all.

⚠ **Item 5's Q5 evidence is untouched:** Q5 is 0% Mode B before and after, overrun 6–8ms both
times. Nothing about the Q5 lead has moved.

⚠ **The label prewarm is NOT the cause.** It now runs for Q3, Q2 and Q1 for the first time
(§A.3), which was expected to *help* — and Q3/Q2/Q1 do sit at ~3400ms against Q4's ~8160ms. But
all four are clamped, so the prewarm cannot be evaluated from this data. **Whether the prewarm
helped is unmeasured**, and it cannot be measured while the anchor is stale.

---

## What was NOT done about it

- **Not fixed.** Carl's instruction: report, do not fix.
- **No constant changed**, no guard added at `:1925`, no reordering of the publish.
- ⚠ **No number here has been turned into a comment or a harness constant.** These are
  measurements of a build with a known ordering fault in it.

*17 August 2026. Six runs before, six after, production build, same machine and session.*
