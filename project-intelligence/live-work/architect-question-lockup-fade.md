# Architect question — the `c2b DESIGN` fade is not smooth

**Raised by Carl, 4 August 2026, after four Builder attempts on the wrong thing.**
**Drafted for Carl's approval before sending.**

⚠ **THIS IS THE SECOND CONSULTATION TODAY.** The first
(`architect-question-opening-stutter.md`) was answered correctly and the fix worked. **This is a
different defect** that was conflated with it repeatedly.

---

## The symptom

**Carl: *"the c2b DESIGN text entrance is not smooth."*** Restated when the Builder went after the
canvas swap instead: ***"its not Q5, its the c2b DESIGN."***

---

## ⚠ What is actually measured

**Sampling one lockup pixel from inside `drawBackdrop`'s own canvas, every time it repaints,
relative to Begin:**

```
  +7082ms  lum 16     \
  +7097ms  lum 16      >  three paints, then nothing for six seconds
  +7186ms  lum 16     /

  +13187ms lum 18     <- the fade actually begins here
  +13207ms lum 26
  +13233ms lum 29
  ...       ~20ms steps, smooth
  +13377ms lum 45
  +13450ms lum 48
  +13807ms lum 53     <- ⚠ 357ms GAP
  +14031ms lum 74     <- ⚠ 224ms GAP, and lum jumps 21 in one step
  +14134ms lum 84
  ...       ~20ms steps again, smooth to the end
  +15184ms lum 119
```

⚠ **THE FADE IS MOSTLY SMOOTH — ~20ms steps — WITH TWO GAPS IN THE MIDDLE.** 357ms and 224ms, and
the luminance jumps 21 points across the second one. That is what Carl is seeing.

⚠ **AND IT STARTS AT +13187ms**, which the Builder did not expect and has not explained. The
derived constants say beat six should begin ~4330ms after the cards mount (~1300ms after Begin),
i.e. around +5600ms. **It is running roughly 7.5 seconds late.**

---

## ⚠ Four Builder attempts, all on the wrong object

| # | theory | outcome |
|---|---|---|
| 1 | The canvas swap at Q5 (warm-up unmounts +6902, real mounts +6913) | **Real, but a different defect.** Carl corrected: *"its not Q5, its the c2b DESIGN."* |
| 2 | Linear fade where everything else is eased | Untested — see below |
| 3 | Missing `invalidate()` in `useLockupFade` | **Added; repaint count did not change.** Kept, because a ref animated under `frameloop="demand"` genuinely must invalidate |
| 4 | The redraw gate quantising `fade` to 3 decimals | Logic reads correct; not the cause |

⚠ **AND THE MEASUREMENT THAT DROVE 2–4 WAS ITSELF WRONG.** A probe counted "three repaints across
the fade" and concluded the fade was stepping badly. **It was sampling the window
+5300…+7900ms — before the fade starts.** The three paints it found are the pre-fade holds at
+7082–7186. **The instrument's window was derived from constants rather than from the observed
behaviour**, which is the same class of error this project has logged repeatedly.

---

## What the Builder would ask

1. **Why does beat six start at +13187ms?** `LOCKUP_FADE_OVERLAPPED_DELAY_MS` derives to ~4330ms
   from the cards' mount. Either the derivation is wrong, `useLockupFade`'s effect is restarting
   (its deps are `[active, reducedMotion, invalidate]` and `active` may flip), or its clock starts
   from something later than assumed.

2. **What causes the two gaps at +13450 and +13807?** They sit inside an otherwise smooth ramp, so
   whatever blocks is intermittent rather than structural. The contact field's canvas mounts at
   **+13248ms** — measured in a separate probe — which is *inside* this window.

3. **Is the fade curve worth changing at all?** It is linear while every other entrance on this
   card is eased. **At ~20ms steps the curve is visible**, so this may matter once the gaps are
   gone — but it is cosmetic beside them.

---

## Where to look

- `components/enquiry/answer-card-backdrop.tsx` — `useLockupFade` (the clock),
  `useBackdropRedraw` (the repaint gate)
- `components/enquiry/answer-card-geometry.ts` — `LOCKUP_FADE_OVERLAPPED_DELAY_MS`,
  `LOCKUP_FADE_DURATION_MS`, `ENTRANCE_END_MS`
- `components/enquiry/enquiry-opening.tsx` — `canvasWarm` gates the contact field's mount, which
  lands at +13248ms
- `live-work/references/opening-stutter.md` — the first, related, defect

**Current head: `9a11d36`, pushed.** One uncommitted change: the `invalidate()` added in attempt 3.
