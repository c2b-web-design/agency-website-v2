# Plan — probe the hover teal, then fix what the probes name

**Written 10 August 2026 by the Builder, after the Architect's answer
(`architect-answer-hover-teal.md`), which is canonical for this chunk.**

**Scope:** find why the teal blend paints nothing, fix it, and fix the frame-drive defect the
Architect found alongside it. **No material or geometry changes.**

---

## STEP 0 — the rule for this chunk

⚠ **PROBES BEFORE CHANGES. NO FOURTH GUESS.**

Three guesses have been spent (the program cache key, the sampling crop, the shared-uniform
theory) and all three were wrong. The Architect's answer partitions the remaining space into
exactly two branches, and **probes A and B together decide which one it is.** Nothing gets
edited until they have run.

---

## STEP 1 — PROBE A + B, one run, no production changes

**A — is the mix actually in the compiled program?**

Extend the `shaderSource` interceptor to **count** `uLabelTeal` per shader and assert the literal
`diffuseColor = mix(`.

    1 occurrence  -> the .replace() silently missed. The declaration prepends
                     regardless, which is why the earlier check passed.
    2 occurrences -> the code is genuinely on the GPU.

**B — is the drive live at draw time?**

In the face material's `useFrame`, write to `window.__hoverProbe`:

    uHover.value
    uLabelTeal.value !== null
    uLabelTeal.value !== labelMap        <- must be a DIFFERENT texture, not just non-null

Read it from `verify/hover-teal.mjs` at the same three instants it samples colour.

⚠ **BOTH PROBES ARE TEMPORARY AND COME OUT BEFORE THE COMMIT.** The `window.__hoverProbe` write
is dev-only scaffolding; leaving it in ships a debug hook.

**Expected outcomes and what each means:**

| A | B | the fault is |
|---|---|---|
| 1 occurrence | — | the `.replace()` target string never matched |
| 2 | `uHover` stays ~0 | the drive — see Step 2, which is being fixed anyway |
| 2 | `uLabelTeal` null or `=== labelMap` | the sampler assignment |
| 2 | both healthy | run probe C (force `uHover` to `1.0` in GLSL) to split sample-vs-blend |

---

## STEP 2 — FIX THE FRAME DRIVE, whatever the probes say

⚠ **THIS IS NOT CONDITIONAL AND IT IS NOT THE SAME BUG.**

The hover ease runs in `useFrame`, which only ticks because `TravellingLight` is invalidating
every frame. **Under `reducedMotion` the traveller parks and the ease loses its frame source —
the teal would never arrive at all.**

The file records this exact trap twice already (lines 315–321, 1855–1858): *"a ref animated
without invalidating produced three repaints across an entire 2000ms fade."*

**Fix:** give the hover its own rAF driver that calls `invalidate()` while it runs and **stops
when settled** — the `useFilament` shape. Not a permanent loop; that is the other defect, below.

---

## STEP 3 — RECORD THE `frameloop` REGRESSION (record, do not fix here)

Commit `7b056c2` — this session's approved resting light — made `TravellingLight` run an
unconditional rAF loop, **turning a demand-mode canvas into a continuous 60fps one.** The file's
own header at line 18 still claims *"`frameloop="demand"` AND IT STAYS THAT WAY… nothing needs a
continuous rAF loop."*

⚠ **THE HEADER IS NOW FALSE AND THE COST IS UNRECORDED.** A phone renders WebGL continuously for
as long as the corridor is open.

**This plan does NOT fix it** — the traveller is approved work and throttling it is a visual
change Carl has not seen. **It gets written into the header and the handoff as a known cost**, and
raised with Carl as its own decision.

---

## STEP 4 — FIX THE TEAL, per what A/B/C named

Then re-run `verify/hover-teal.mjs`. **The pass condition is the Architect's corrected figure:**

    green-minus-blue shift  ~ +10.5   (NOT the +13 the question assumed)
    luminance drop          ~ 13%
    returns to rest         g-b back within ~2 of resting

⚠ **AND THE HARNESS MUST BE RE-RUN AS A NO-CHANGE CONTROL FIRST** — this project's rule after
`approved-timings.mjs` reported drift on unchanged code.

---

## STEP 5 — the two comments the Architect asked for

Both about the faked relief, both **write-downs, not fixes**:

1. The baked lip is drawn for the key at `[-160, 120, 40]`, but **the dominant source is now a
   moving spotlight** — implied and actual light directions disagree during the sweep.
2. The white lit lip is **identical in both textures**, so it stays white when the glyph goes
   teal. ⚠ **Arguably correct — a lit edge returns the light's colour, not the material's — but
   it will read as an oversight, so the comment must say so.**

---

## NOT IN SCOPE

- The floating-faces / black-edge regression (separate, and the Architect confirms this chunk
  does not touch it).
- Throttling the traveller (Step 3 records only).
- The accessibility debt.
- Any material, geometry, or ellipse change.

---

## THE CORRECTION WORTH CARRYING

⚠ **THREE OF THE FIVE ELIMINATIONS IN MY QUESTION WERE UNSOUND**, and I presented them under a
heading telling the Architect not to re-examine them:

| claimed | actually |
|---|---|
| *"no GLSL compile error"* | `checkShaderErrors = false` at line 3563 — **silence was configured** |
| *"the source reaches the GPU"* | tested **presence** of a token that appears whether or not the injection worked |

**Both tested something adjacent to the claim rather than the claim itself.** That is the same
class as this project's seven harness-lies, now in prose rather than in a script. **An
elimination is a measurement and carries the same burden of proof** — and a wrong one is worse
than none, because it is handed onward as settled.
