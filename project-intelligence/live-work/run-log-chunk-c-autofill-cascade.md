# Run log — chunk C: the autofill cascade and masked reveal

**31 July 2026.** Chunk `autofill-cascade-and-reveal`, the last of the three.

⚠ **Not approved.** Working and measured. Carl judges whether it is right.

---

## What was built

On a multi-field autofill, the four boxes reveal **one at a time**: a left-to-right wipe of the
text with the gold rim lighting on the same step. Typing and pasting are unaffected.

| Behaviour | Result |
|---|---|
| Autofill (4 fields at once) | Cascades 1 → 2 → 3 → 4 |
| Typing one character | **No cascade** — rim lights as chunk B |
| Paste into one field | **No cascade** |
| Chrome hover preview | **No cascade** — withdrawn before the settle expires |
| Browser-restored values | **No cascade** — already present when the page arrives |
| Reduced motion | Wipe skipped entirely |

---

## ⚠ FOUR THINGS WERE WRONG BEFORE THIS WORKED, AND EACH LOOKED RIGHT

**This chunk took four corrections. Every one produced a plausible, internally consistent
result that described the wrong thing** — the pattern this project has hit repeatedly.

### 1. The autofill signal was tested in the wrong place

The design says: *a paste fills one field; autofill fills several in one tick.* The Builder
implemented `becameFilled.length > 1` on a single update.

⚠ **The premise is right and the test was in the wrong place.** Chrome dispatches a **separate
`input` event per field**, so React runs `onChange` four times and **each update sees exactly one
newly-filled box.** The condition never fired once.

**Fix:** accumulate across the **tick** rather than within one update. The discriminator is
unchanged; only where it is measured.

### 2. Every `onChange` closure carried stale values

React's handlers close over `values` from the render that created them, so during a four-field
autofill **all four handlers saw the same stale object** and each produced one filled box and
three empty ones.

**Fix:** handlers pass only their own field; `publish` merges onto a tick-scoped ref.

### 3. ⚠ `@property` inside a React `<style>` tag never registered

The wipe needs `--wipe` registered as a `<percentage>`, or it is just a string and flips at the
halfway point instead of interpolating.

⚠ **Measured: `--wipe` read back EMPTY on a fresh element — the at-rule never reached the CSSOM.**
Meanwhile `animationName: contactFieldWipe` was set on all four boxes, so **a completely broken
reveal and a correctly running animation looked identical from the outside.**

**Fix:** `CSS.registerProperty` plus an adopted stylesheet, imperatively.

### 4. ⚠ THE REAL DEFECT — `mask-repeat` and `mask-size` were left at their defaults

Even with `--wipe` registered and interpolating smoothly (measured 0% → 22.4%), the text stayed
**fully visible** at `--wipe: 0%` — the exact opposite of the intent.

**`mask-image` alone leaves `mask-size: auto` and `mask-repeat: repeat`.** A gradient whose
opaque stop sits at `0%` has an effectively zero-width tile, which **repeats across the element
and fills it with opaque mask.**

⚠ **AND THE CONTROL THAT WAS MEANT TO PROVE THE MECHANISM HID THE BUG.** An isolated `<input>`
with the same gradient masked correctly — because the isolated test used the
`-webkit-mask-image` **shorthand**, which sets the sub-properties, while the component set only
`maskImage`. **The control differed from the real thing in the one way that mattered.**

**Fix:** `maskSize: "100% 100%"` and `maskRepeat: "no-repeat"`, both prefixed and unprefixed.

---

## ⚠ The measurement method mattered more than any value

Sampling `--wipe` per frame reported gaps of **205 / 206 / 73ms** against a 120ms target and sent
the Builder chasing a scheduling bug.

⚠ **A sampled value only appears once React has committed the style, so it conflates *when the
animation started* with *when the render landed*.** `getAnimations()` reports what the
compositor actually did:

| Stagger target | Measured gaps (WAAPI) |
|---|---|
| 120ms, four `setTimeout`s | 200 / 134 / 133ms |
| 120ms, one rAF clock | 200 / 134 / 133ms |
| **133ms, one rAF clock, deferred origin** | **183 / 134 / 133ms** |

**Two real fixes came out of it:**

- **One rAF clock, not four timers.** Each step re-renders four inputs and the WebGL scene —
  enough work that independent timers drift.
- **133ms, not 120.** ⚠ **120ms is not a multiple of 16.7ms**, so on a 60Hz display each step
  rounds to the next frame and the spacing lands unevenly. 133ms is exactly 8 frames.

⚠ **The first gap remains ~183ms against 133ms for the rest** — React's commit for box 1 lands
before the loop's second frame. **Open, and left open deliberately:** it is a 50ms discrepancy on
the first of three gaps in a sequence lasting under half a second, and Carl's eye is the
instrument that decides whether it matters.

---

## The preview guard

⚠ **Carl found in real Chrome that hovering a suggestion writes values into the real fields with
no commitment**, and moving away withdraws them. A cascade firing on that would run its whole
performance for text that vanishes — and re-run on every hover.

**`AUTOFILL_SETTLE_MS = 90`**: the cascade waits, then **re-reads the DOM**. If it was a preview
the fields are empty again and nothing starts. ⚠ Trusting the values captured when the event
fired would defeat the entire guard.

---

## Verification

| Check | Result |
|---|---|
| Autofill cascades in order | ✅ WAAPI start times 0 / 183 / 317 / 450ms |
| Wipe visibly masks | ✅ Frozen at 9.6%, only "Ca" of "Carl Buckley" visible; paused mid-cascade, box 2 shows "C2B Web D" |
| Typed 1 char | ✅ **0 wipe animations on all four boxes** |
| Paste into one field | ✅ **0 wipe animations on all four boxes** |
| Values correct after cascade | ✅ all four intact |
| `npx tsc --noEmit` | clean |
| `npm run lint` | **1 problem (1 error, 0 warnings)** — recorded baseline |

---

## ⚠ TWO DEFECTS FOUND BY CARL ON A REAL AUTOFILL — both from cases no test covered

### 1. The unlit rim merged into the background

The Builder implemented *"only the potential to have a gold rim"* as `envMapIntensity: 0`.
⚠ **At zero the bevel is black metal on a near-black page, so an unlit box lost its edge and the
shape dissolved.**

**Carl's correction:** *"Turn the intensity of the gold right down. If it is black it will merge
into the background. If it's gold but turned right down, so it's barely seen by the human eye,
turning it up with the fade will achieve the same effect."*

⚠ **This is better than zero for a reason beyond visibility.** `envMapIntensity` governs how much
of the studio environment the metal REFLECTS. From a low floor the trigger **illuminates a rim
that was always there** — the reflection climbing along the bevel's curve. At zero there is no
metal catching anything and the arrival is merely a fade. It also inherits the `sqrt(progress)`
curve already on this property, so it is non-linear rather than flat.

**Settled at `RIM_UNLIT_FLOOR = 0.05`**, bracketed at 0.03 / 0.05 / 0.09.
⚠ **CURRENT AND BEST-JUDGED, NOT APPROVED** — the three are near-indistinguishable in a
screenshot and differ on a monitor.

### 2. ⚠ A COMPLETED BOX LOOKED LESS COMPLETE THAN AN EMPTY ONE

**Carl, on a real Chrome autofill:** *"Using autofill and I can input into boxes 1, 2 + 4. Boxes
1, 2 + 3 are on but not 4."*

⚠ **Chrome's address profiles hold NO website field**, so box 3 stays empty while 1, 2 and 4
fill. That gap will happen to almost every user, and no test covered it.

**The original rule — light box N when box N-1 has content — produced exactly that, and was
correct by its own logic.** Box 3's rim lit from box 2's content; box 4's did not, because box 3
was empty. ⚠ **On screen: an empty box wearing a gold rim beside a completed box with none. The
one field the user had actually finished looked like the one they had not.**

**The rule was built for sequential typing**, where an empty box means *you have not reached it
yet*. Under autofill an empty box in the middle means *the browser had nothing for that field* —
nothing was skipped, and everything after it is genuinely done.

**Fix — and it is the wayfinder principle applied honestly rather than mechanically:** a filled
box is ALWAYS lit. **A box's own content is stronger evidence it is complete than any inference
from its neighbour.** Box 1 always, or this box has content, or the box before it does.

⚠ **Carl's reading of the result confirms the principle survived the change:** *"All four are now
lit and that is how it should be at this stage. User has input to do in box 3."* A lit empty box
says *this one is yours*, not *this one is done* — which only works because **the rim was never
permission.**

⚠ **SECOND TIME TODAY THE RIM RULE NEEDED CORRECTING FROM A REAL CASE RATHER THAN A
SPECIFICATION** — the first being reversibility. Both times the logic was self-consistent and the
screen was wrong.

**Carl on the finished result:** *"it looks great!"*

---

## Open, for Carl

1. **`CASCADE_STAGGER_MS = 133`** — frame-aligned. Carl's two limits were *"not so fast that the
   human eye cannot discern it, but not so slow as to interfere"*. Four boxes at 133ms is ~530ms
   end to end.
2. **`CASCADE_REVEAL_MS = 520`** — one box's wipe, matched to its rim fade per Carl's constraint
   that *"the fade in time and the reveal time were the same"*. ⚠ Deliberately **not** copied
   from the opening's mask: shorter distance, smaller element.
3. **The ~183ms first gap** above.
4. ⚠ **NOT YET SEEN IN REAL CHROME.** Every test here fires a synthetic multi-field `input`
   event. **Carl's saved address only fills Name and Email** — two fields, which still trips the
   `> 1` discriminator, but the real path has not been watched.

---

*Chunks A, B and C complete. The light chunk still carries three deferred judgements.*
