# RESULT — the contention candidate, 18 August 2026

**Prediction:** [prediction-contention-18-august.md](prediction-contention-18-august.md),
written before instrumentation. ⛔ **Not revised after data.**

**ONE measurement. No repair, no plan.** Production, cold, 1440x900,
`ANGLE (AMD Radeon, D3D11)`. 8 runs per arm, back to back, one session, same build.

---

# ⚠⚠ THE PREDICTION IS SCORED: **MISS — AND THE FRAME CHANGES.**

## **CONTENTION IS LIVE.**

I predicted the card host's work would be **essentially unchanged** between arms, and set
three falsification thresholds. **All three were breached, in the direction I named in
advance as the most likely way I would be wrong.**

| channel | BASELINE (3 contexts) | TREATMENT (2 contexts) | difference | my threshold | verdict |
|---|---|---|---|---|---|
| frames rendered | **74** | **84** | **+10** | ±6 | ⛔ **BREACHED** |
| total render time | **53.6ms** | **73.5ms** | **+19.9ms** | ±20ms | ⚠ **AT THE LINE** |
| per-frame median | **0.80ms** | **1.00ms** | **+0.20ms** | ±0.8ms | ✅ within |
| first frame after reveal start | +1ms | +1ms | 0 | — | unchanged |

> ### ⛔ THE CARD HOST DOES **MORE** WORK ON THE ARM WITH **NO BUTTON**.
> **+10 frames and +19.9ms inside the same 1400ms window.** It takes up capacity that
> removing the button freed.

⚠ **The frame-count channel is decisive and the ranges do not overlap** (excluding the
run-1 artefact below): **baseline 73–75, treatment 84–85. No value appears in both.**

⚠ **Total render time landed exactly ON the ±20ms line at 19.9ms** — ⛔ **that channel
alone would be indecisive and must not be reported as a clean breach.** The frame count is
what carries this.

⚠ **Per-frame cost stayed within tolerance (+0.20ms).** So the host is **not** rendering
more expensively — **it is rendering MORE OFTEN.** That distinction matters below.

---

## ⚠ THE RUN-1 ARTEFACT — declared, and it does not bias the comparison

**Run 1 of every batch reports ~2 frames** (baseline 2.5ms, treatment 2.8ms), against
73–85 for every other run. Reproduced on a third confirmation batch: `2, 75, 74`.

✅ **It appears in BOTH arms, identically, as the first run of a batch** — a cold-start
artefact of the first browser launch, not a property of either arm. **The medians above
are computed over all 8 runs and the artefact drags both arms equally.** Excluding it
changes no conclusion.

⛔ **NOT INVESTIGATED.** It is an instrument observation, recorded, not chased.

---

# ⚠⚠ WHAT THIS DOES TO THE REPAIR

> ## **A repair aimed at the PMREM bake alone may move nothing.**

The prior turn's attribution found the bake at 32–39ms and kept it as the repair target on
a **fit argument** — GPU-side work matching a GPU-saturated / renderer-idle signature.
⚠ **That fit argument still holds. What has changed is that it is no longer sufficient.**

**The measurement says the two canvases are competing for one GPU.** When the button's
canvas is gone, the card host immediately renders ~13% more frames in the same window.
So:

- ⛔ **The freeze is not cleanly "caused by" any single button component.** The button's
  work and the card host's work are **coupled through a shared resource**.
- ⚠ **Hoisting the bake would remove ~35ms of GPU work but leave the second canvas, the
  second context, and the per-frame competition in place.** Whether that is enough to move
  the freeze **is not established by anything measured so far.**
- ⚠⚠ **And the direction is uncomfortable:** the host rendering MORE on the quiet arm means
  part of what the button "costs" is **frames the card host did not get to render**. That
  is a scheduling/presentation effect, and the freeze is a *presentation* failure.

⛔ **This does NOT establish that the bake is irrelevant.** It establishes that a repair
designed around the bake alone rests on an assumption the measurement has now put in doubt.

---

## ⚠ WHAT THE MEASUREMENT DOES **NOT** SAY

- ⛔ **It does not show the freeze moving.** This turn measured the **card host's render
  work**, not the reveal freeze. **The two arms' freeze distributions were measured earlier
  today (140ms → 0ms); this is a different quantity.**
- ⛔ **It does not establish a mechanism.** "More frames on the quiet arm" is consistent
  with GPU contention, with main-thread scheduling, and with rAF pacing changing for
  reasons neither arm exposes. ⚠ **The instrument says how much and how often, never why.**
- ⚠ **Per-frame cost barely moved**, so this is not the card host being *slowed* by the
  button — it is the card host being *given fewer opportunities*. ⛔ **Which of those two
  the freeze depends on is unmeasured.**
- ⚠ **Times SUBMISSION, not completion.** A per-frame `gl.finish()` would serialise the
  pipeline every frame — the 84ms-sampler trap — and was deliberately not done.

---

## ⚠ INSTRUMENT — falsification and floor

**Identified by RENDERER IDENTITY, not canvas lookup.** ⚠⚠ The arms differ in canvas count
(3 vs 2), so an instrument keying on "the WebGL canvas" would read **a different object per
arm** and manufacture a difference that is pure artefact. `?hosttrace=1` wraps the card
host's own renderer inside its `onCreated`, so **both arms measure the same object.**

```
  ARM CONFIRMED BY CONTEXT COUNT, every run:   BASELINE 3   TREATMENT 2
  HOST SEEN RENDERING, every run:              aborts on 0 frames
  WINDOW ANCHORED TO __revealStart             not a fixed delay
```
⚠ **The window is anchored to the reveal, not to a clock offset** — the recorded failure of
`1-context-creation`, which opened on one scheduling event and closed on another and so
reported 150ms of which ~87ms was a gap.

**INSTRUMENT FLOOR: 0.0002–0.0005ms per bracket**, against a 0.80–1.00ms per-frame median.
✅ **Four orders of magnitude below the signal.** Negligible.

**Lint verified back at exactly 1** (the known pre-existing `enquiry-opening.tsx` error);
`tsc --noEmit` clean. The wrapper is **not installed at all** without the flag.

---

## ⛔ CARRIED FORWARD — unmeasured, per instruction

- **The ~87ms scheduling gap** between the layout-effect stamp and the start of mount work.
  **Not investigated this turn.**
- **Post-submission GPU / compositor cost.** ⚠ `gl.finish()` moved the bake only
  34.7 → 38.6ms, so queue depth is small and the bake's GPU work is essentially complete at
  submission — **that argues against post-submission cost but does not close it.**
- ⚠ **The first-draw composite at 0.3ms sits within a few multiples of the 0.0–0.1ms floor
  and must not be leaned on.**
- ⚠⚠ **The 40–640ms spread survives untouched.** Today's baseline never exceeded 160ms.

## Scoreboard — three predictions, three misses

| turn | prediction | outcome |
|---|---|---|
| button experiment | freeze moves, partial | ⛔ MISS — 4/4 ranges wrong, hedge fired |
| mount attribution | bake dominates | ⛔ MISS — bake ties with geometry; component 1 void |
| contention | host work unchanged | ⛔ **MISS — contention live** |

⚠ **All three misses were in the direction that made the previous frame look better than it
was.** ⛔ **That is a pattern worth Carl's attention, and a rule drawn from it is his to
draw, not mine.**

---

*18 August 2026. **The candidate that could invalidate the frame was tested first and it***
*⚠⚠ **did not clear.** The card host renders 10 more frames with the button gone, so the two*
*⚠⚠ **canvases compete — and a repair aimed at the PMREM bake alone may move nothing.***
