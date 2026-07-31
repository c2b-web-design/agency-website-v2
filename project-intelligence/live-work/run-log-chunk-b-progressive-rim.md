# Run log — chunk B: the progressive gold rim

**31 July 2026.** Chunk `progressive-gold-rim`, the second of three.

⚠ **Not approved, and DELIBERATELY NOT JUDGED YET.** See the deferral below — it is the
central outcome of this chunk, not a caveat on it.

---

## What was built

The rim chain: **box 1 always lit; one character in box N lights box N+1; reversible.**

| File | Change |
|---|---|
| `contact-field-canvas.tsx` | `setBevelEnvIntensity` gains `lit` and `unlitFloor`; new `useProgressiveRim`; `filled` prop |
| `enquiry-opening.tsx` | Holds `fieldFilled`, lifts it from the inputs to the canvas |
| `contact-field-inputs.tsx` | Unchanged — its `onFieldStateChange` seam was built in chunk A and is now consumed |

⚠ **The chunk-A foundation was consumed without a refactor**, which was the point of building
`FieldStateSnapshot` before anything read it. `becameFilled` is still unused — it is chunk C's.

### The mechanism

⚠ **THE RIM MULTIPLIES INTO THE ENTRANCE'S RAMP, IT DOES NOT REPLACE IT.** At `lit = 1` the
expression reduces to `GOLD_BEVEL_ENV_INTENSITY * sqrt(progress)` — **exactly** the pre-chunk-B
behaviour — so the approved entrance is unchanged for any lit box.

⚠ **BOTH LOOPS SHARE ONE `rimLitState` OBJECT, not two copies.** `useEntranceCascade` and
`useProgressiveRim` both write `envMapIntensity`, and they overlap in time whenever a user types
while boxes are still arriving. Two copies would disagree for exactly as long as the overlap
lasts, and the symptom — a box flashing to the wrong brightness for a few frames — is visible,
intermittent, and very hard to attribute later.

⚠ **NOT MASKING.** A masked box (`FIELD_ENTRANCES[i] === null`) does not exist at all: no fade,
no geometry, nothing to type into. That would break the no-gating rule outright. All four boxes
arrive complete with their satin field; **only the gold is withheld.**

⚠ **`frameloop="demand"` is preserved.** The rim loop runs only while a rim is in transit and
stops itself once every rim has settled.

---

## ⚠ THE JUDGEMENT IS DEFERRED — Carl, 31 July 2026

> *"There is a discernable difference in the gold rims. We cannot judge it properly until we see
> a moving light shining across the boxes. A light that is not constantly on but turns on/off as
> it moves."*

⚠ **This is the same call Carl made on `FIELD_GRAIN_TINT`, and for the same structural reason:
judging a metal's RESTING state before its light exists compares a finished thing with an
unfinished one.** The rim's entire reason for being gold is how it responds to a moving light. A
static screenshot can only show the part that is not the point.

**Both techniques stay in the build until the orbiting light exists.** ⚠ **The A/B array must not
be collapsed to one value before then** — that would silently discard the comparison this chunk
was built to enable.

### A new requirement for the light chunk, from Carl's phrasing

⚠ *"A light that is **not constantly on** but turns on/off as it moves."* The existing brief
(`live-work/contact-field-gold-and-light-reference.md`) describes an orbiting light with a
momentary aimed glint. **Carl has now been specific that the light is INTERMITTENT — it
extinguishes and re-ignites along its path**, rather than travelling as a constant source. That
is a materially different behaviour and belongs in that brief.

---

## The A/B, split diagonally by column — Carl's design

> *"use one technique on boxes 1+3 and the other technique on boxes 2+4."*

| Boxes | Technique | Unlit floor |
|---|---|---|
| **1 + 3** — left column | **Fully dark** | `0.0` |
| **2 + 4** — right column | **Dim gold** | `0.22` |

⚠ **The diagonal split is better than the top/bottom one the Builder would have used.** Boxes
1+3 are the LEFT column and 2+4 the RIGHT, so each technique appears once in each ROW, at both a
top and a bottom position. **Neither is judged only under the shorter or the longer entrance
delay** — a top/bottom split would have confounded technique with timing.

### ⚠ How the fully-dark rim actually reads — Carl's correction

**The Builder claimed from the screenshot that box 3 had "no visible rim at all", reading as a
floating blue field with no edge. ⚠ THAT WAS AN OVERSTATEMENT AND CARL CORRECTED IT:**

> *"Box 3 rim is there. I can see it from 2ft away. But it's **low in the mix**."*

⚠ **The distinction matters and it is not pedantry.** *Absent* would be a defect — a box whose
silhouette had failed. *Low in the mix* is a **level**, which is a tuning question with a knob
already attached to it (`RIM_UNLIT_FLOOR_AB[0]`, currently `0.0`). One would mean the technique
is broken; the other means it may simply be set too low.

**Carl's framing is the production one and it is the right model here:** an element that is
present but sitting well down against everything else, which is a mix decision rather than a
missing track. It also means the fully-dark technique has a **range** to be judged across, not
just an on/off comparison against dim-gold — `0.0` is one end of it, not the whole of it.

⚠ **A REMINDER ABOUT VIEWING CONDITIONS, WHICH THE BUILDER GOT WRONG TWICE OVER.** The Builder's
captures were layer-only crops at DPR 2, viewed as images. Carl's was a full-page screenshot at
1080p, judged **on the monitor from a normal viewing distance**. **A crop is not the
composition, and an image of a screen is not the screen.** Rule 9 puts rendered output first;
this is a reminder that *how* it is rendered and *how far away the eye is* are part of that.

---

## Verification

| Check | Result |
|---|---|
| Box 1 lit at rest, others unlit | Confirmed |
| One character in box N lights box N+1 | Confirmed, 1 → 2 → 3 → 4 |
| **Reversible** — clearing box N unlights box N+1 | Confirmed; boxes still holding content stayed lit |
| No gating | All four focusable and typeable regardless of rim state |
| `npx tsc --noEmit` | clean |
| `npm run lint` | **1 problem (1 error, 0 warnings)** — recorded baseline |

One type error (`(0|1)[]` inferred where fractions are held) and one exhaustive-deps warning
were introduced and **fixed, not suppressed**.

---

## Open, for Carl — after the light exists

1. **Which unlit technique.** ⚠ Deferred by Carl. Both remain in the build.
2. **`RIM_LIGHT_MS = 900`** — its own constant, deliberately NOT the entrance's 3000ms. The
   design record is explicit that inheriting it would couple this to timings Carl has not
   approved, and a rim lighting on an already-visible box is not a box materialising from
   nothing. **Current and best-judged, not approved.**
3. **`RIM_UNLIT_FLOOR_AB = 0.22`** for the dim technique — one bracket, not a tuned value.

---

*Chunk B built and deferred. Chunk C (the autofill cascade) is untouched.*
