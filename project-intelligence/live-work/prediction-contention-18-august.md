# PREDICTION — the contention candidate, 18 August 2026

**Written BEFORE instrumentation and BEFORE any measurement.** ⛔ Not revised after data.

**ONE measurement, then stop.** No repair, no plan.

---

## WHY THIS GOES FIRST

**It is the one candidate that changes what the repair IS.**

If removing the button frees GPU capacity that the card host then consumes, **no single
button component is "the cause"** — the freeze is a shared-resource failure, and hoisting
the PMREM bake would move nothing. The attribution so far rests on a **fit argument**
(the bake is GPU-side, matching a GPU-saturated / renderer-idle signature), **not on
causation**, and it accounts for only ~67ms of a 140ms freeze.

⛔ **Designing a structural repair around the bake before testing this would risk building
the wrong repair.**

---

## THE TEST

Instrument the **card host's own GPU work across the Q5 reveal window**, both arms, back to
back, one session, 8 runs each.

| outcome | reading |
|---|---|
| card host work **UNCHANGED** between arms | contention **weakened**; the button's own cost is doing the damage; **the bake becomes the repair target** |
| card host work **SHRINKS or completes EARLIER** on `?nobtnmesh=1` | contention **live**; a repair aimed at the bake alone **may move nothing** |

---

# ⚠ THE PREDICTION — narrow enough to be wrong

## **I expect the card host's work to be essentially UNCHANGED between arms.**

**Specifically, across the Q5 reveal window (~1300ms from reveal start):**

| quantity | baseline | treatment `?nobtnmesh=1` | predicted difference |
|---|---|---|---|
| card-host frames rendered | 60–85 | 60–85 | **within ±6 frames** |
| card-host total render time | 90–190ms | 90–190ms | **within ±20ms** |
| card-host median frame cost | 1.2–3.0ms | 1.2–3.0ms | **within ±0.8ms** |

**Scored WRONG if:** frame count differs by more than 6, **or** total render time differs
by more than 20ms, **or** median frame cost differs by more than 0.8ms — **in either
direction.**

⚠ **A LARGER card-host figure on the TREATMENT arm scores this WRONG too.** That is the
contention signature stated positively: freed capacity being taken up. **I am not
predicting "no difference in the direction I like" — either direction falsifies me.**

## The reasoning

1. **The card host's own PMREM bake is gated on `mayCompile` and fires BEFORE Begin**
   (`useLocalEnvMap`, the fix for the ~572ms opening stutter). ⚠ **So the card host's
   single most expensive GPU operation is already spent by the time Q5's reveal runs** and
   cannot be re-scheduled into the window by freeing capacity.
2. **What the card host does DURING the reveal is `TravellingLight`'s per-frame render** —
   a static scene with a moving light, `invalidate()` each frame. That is **rAF-paced, not
   throughput-paced**: it renders once per display frame regardless of spare GPU capacity.
   **Freeing GPU time does not make rAF fire more often.**
3. **So the mechanism for contention is weak here.** For the card host to take up freed
   capacity it would need work that is *queued and waiting*, and its expensive work is both
   done and gated.

## ⚠ WHAT WOULD MAKE ME WRONG — stated in advance

- If the card host's frames are being **dropped or delayed** during the freeze on baseline
  and **not** on treatment, frame COUNT rises on treatment. **That is contention and it
  would show as a larger treatment figure.** ⚠ **This is the outcome I consider most
  likely if I am wrong**, and it is a real possibility precisely because the freeze is a
  presentation failure.
- If `mayCompile` does not gate as cleanly as the comment claims and part of the card
  host's bake lands in the window.

⚠⚠ **NOTE THE ASYMMETRY: my prediction is the outcome that KEEPS the bake as the repair
target.** That is a reason for suspicion of it, not confidence. **The previous two
predictions both MISSED**, one while passing three coarse conditions on a wrong model.

---

## ⚠ INSTRUMENT REQUIREMENTS — carried from the last two turns

- **Measure the floor.** A per-frame hook that costs a material share of a 1.2–3.0ms frame
  is inflating what it measures.
- ⚠ **Do not stamp during render** — `react-hooks/purity` took the repo 1 → 8 lint errors
  last turn. **Baseline is exactly 1 and must be verified back at 1 by running lint.**
- ⚠ **FALSIFY:** the instrument must show the card host **present and working on BOTH
  arms**. ⛔ It must NOT accidentally read the button's canvas — the arms differ in
  canvas count, and an instrument that keys on "the WebGL canvas" would read a different
  object per arm and produce a difference that is pure artefact.
- ⚠ **Beware the component-1 trap:** a bracket that opens on one scheduling event and
  closes on another measures **delay, not work**. Anchor to the reveal window explicitly.

---

## ⛔ NOT INVESTIGATED THIS TURN — carried as unmeasured

- **The ~87ms scheduling gap** between the layout-effect stamp and the start of mount work.
- **Post-submission GPU / compositor cost.** ⚠ `gl.finish()` moved the bake only
  34.7 → 38.6ms, so queue depth is small and the bake's GPU work is essentially complete at
  submission — **that argues against post-submission cost but does not close it.**
- ⚠ **The first-draw composite at 0.3ms sits within a few multiples of the 0.0–0.1ms floor
  and must not be leaned on.**
- ⚠ **The 40–640ms spread survives untouched.** Today's baseline never exceeded 160ms.

---

*Written 18 August 2026, before instrumentation. ⚠ **The prediction happens to be the***
*⚠⚠ **outcome that preserves the current repair target, which is precisely why it needs***
*⚠⚠ **a measurement rather than an argument.***
