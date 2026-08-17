# The text jump on Next step — characterised, NOT fixed

**17 August 2026. OBSERVATION ONLY.** No product code changed, no instrument built. Carl
decides what happens next.

**What Carl reported:** on pressing Next step, at every question, the phrase makes a small
jump **left and down** before travelling back — sub-letter, "about the width of a pen
stroke", diagonal, fast. He suspected the phrase then starts its travel from the new
position rather than snapping back.

**He is right on every count, and the displacement is larger than he estimated.**

---

## ⚠⚠ IT IS PRE-EXISTING. THE PHASE MACHINE IS EXONERATED.

Walked `a8996b7` (pre-phase-machine) and `a20a19d` (today), same question, same click,
production builds, same viewport. **The numbers are identical to the digit:**

| | `a8996b7` | `a20a19d` (today) |
|---|---|---|
| qtext x, before → after | **589.21 → 585.70** | **589.21 → 585.70** |
| qtext y, before → after | **444.53 → 448.19** | **444.53 → 448.19** |
| `gap` | **10px → 5.6px** | **10px → 5.6px** |
| cue width | **37.83 → 35.19** | **37.83 → 35.19** |

⚠ **And `app/globals.css` is byte-identical between the two commits** —
`git diff a8996b7 HEAD -- app/globals.css` returns nothing. The rules involved have not been
touched this week.

**Four commits were NOT built on top of a visual regression.**

---

## (a) The step, measured — raw rects, per frame, unnormalised

One frame, at the depth-0 → depth-1 transition:

| Element | dx | dy |
|---|---|---|
| `.enquiry-pdepth-N` (root) | **0.00** | **0.00** |
| `.enquiry-phrase-travel` | **0.00** | **+4.40** |
| `.enquiry-phrase-qrow` | **0.00** | **+4.40** |
| `.enquiry-phrase-cue` | **−3.53** | **+4.40** |
| `.enquiry-phrase-question` | **−3.52** | **+3.66** |

**So the jump is ~3.5px left and ~3.7px down** — roughly twice Carl's 1–2px estimate, which
is a reasonable read for something that lasts one frame.

⚠ **`corridor-motion.mjs` could never have seen this**: the root does not move at all, the
horizontal channel does not exist in that harness, and normalising 0..1 removes a displaced
origin by construction.

## (b) It does NOT snap back — the travel proceeds from the displaced position

Carl's reading is correct. After the step, x continues **from the new value**:

```
qtext x:  589.21 (resting)  →  585.70, 585.70, 585.78, 585.87, 586.08, 586.19, 586.29 …
```

It creeps back **upward** across the move as the font shrinks, rather than returning to
589.21 and starting again. **This is a displaced origin, not a paint glitch** — and those
need different fixes.

## (c) Which element moves — and the answer is NOT "the phrase"

- **The depth root never moves at all** (432.22, 476.79 throughout). Correct: it has been
  static since the 15 August split.
- **`travel` and `qrow` move only in y** (+4.40), and only because their box shrinks.
- ⚠ **Only the CUE and the QUESTION TEXT move horizontally**, and they move in *opposite*
  directions: cue right (541.38 → 544.91), question text left (589.21 → 585.70). **They
  close toward each other.** That is a gap collapsing, not a container shifting.

## (d) What else lands on that exact frame

```
f26  d0   qtX=589.21  cueX=541.38  cueW=37.83  gap=10px    fs=22  fw=500
f27  d1   qtX=585.70  cueX=544.91  cueW=35.19  gap=5.6px   fs=22  fw=500   ← the jump
f29  d1   qtX=585.78  cueX=545.00  cueW=35.18  gap=5.6px   fs=21.998 fw=498
```

**On the jump frame the depth class changes `enquiry-pdepth-0` → `enquiry-pdepth-1`, and:**

- ⚠ **`gap` snaps 10px → 5.6px instantly** (`globals.css:1694` vs `:1723`)
- ⚠ **`letter-spacing` snaps 0.18em → 0.12em**, shrinking the cue 37.83 → 35.19px
  (`:1698` vs `:1728`)
- **`font-size` and `font-weight` do NOT change on that frame** — they are still 22 and 500,
  and begin easing on the *following* frames (21.998, 498 …)

### The cause, from source

`globals.css:1662-1667` transitions **`font-size`, `font-weight`, `color`** on the cue and
question. **`gap` and `letter-spacing` are not in that list, and `.enquiry-phrase-qrow` has
no transition at all** (`:1672-1676`). So two of the four properties that change at the depth
boundary step instantly while the other two ease over 900ms.

In a `justify-content: center` row, half of the combined shrink (2.64px of gap + 2.64px of
cue width) displaces the text by ~3.5px on the frame the class flips.

---

## ⚠ THE LEAD — HALF HELD, AND THE HALF THAT BROKE IS THE IMPORTANT ONE

Carl's prediction: *"the horizontal position is a CONSEQUENCE of font-size shrinking inside a
centred flex row… a staircase derived from a smooth curve, with no easing of its own."*

- ✅ **HELD:** nothing animates the phrase horizontally; the position is a consequence of a
  centred flex row; there is no horizontal easing.
- ⚠ **BROKE:** **it is not font-size.** `fs` is still exactly 22.00 on the jump frame and only
  starts moving afterwards. **The step comes from `gap` and `letter-spacing`, neither of which
  is transitioned at all** — so this is not a staircase quantised out of a smooth curve. It is
  **an untransitioned discontinuity**, and the smooth part follows it.

⚠ **That distinction matters for whatever is decided next:** a staircase would be a
quantisation artefact of an eased property; this is two properties that simply do not ease.

---

## ⚠⚠ NO HARNESS IN THIS REPO HAS A HORIZONTAL CHANNEL

**Carl's eye is the only thing that has ever observed this fault.** Recorded as found; **no
rule drawn.**

- `corridor-motion.mjs` samples `bottom` and phrase Y — **vertical only** — and normalises
  0..1 to compare shape, so a displaced ORIGIN normalises away by construction.
- `paint-order.mjs` captures `gridRect` and **never diffs it**.
- `extras-hold-position.mjs` asserts the extras' rect does not move, not the phrase's.
- `reveal-ratio.mjs` and `q5-card1-halfway.mjs` read marks and animation timings, never x.

The measurements in this file came from a throwaway probe written for this question and
**deleted afterwards**. ⚠ **Nothing in `verify/` would catch this fault today, or catch it
returning.**

## What this does NOT cover

- **Desktop 1440x900 only**, one question step, production. Mobile untested.
- ⚠ **It does not say whether the jump is VISIBLE as Carl describes it** — these are computed
  rects, not pixels. His eye is still the only thing that has seen it.
- **No fix is proposed**, and no instrument was built. ⚠ **No harness in the repo has a
  horizontal channel**, and that remains true.
- The `+4.40px` y-step on `travel`/`qrow` is reported but not diagnosed; it is consistent with
  the row's own box shrinking, and was not separated from the gap change.
