# The card exit — falsification run, and two instrument findings

**18 August 2026. MEASUREMENT ONLY. No product code changed in this run.**
Carl's decisions are recorded as decisions; everything else is measured or explicitly a lead.

---

## 1. THE HARD CUT IS CONFIRMED, AND IT IS NOT WHERE THE PLAN PREDICTED

Production build on :3100, 1440×900, Q5 → Q4 step, five card columns sampled per frame.

```
card 0  baseline 74.58   dark at 1340.7ms
card 1  baseline 75.61   dark at 1340.7ms
card 2  baseline 83.07   dark at 1340.7ms
card 3  baseline 73.47   dark at 1340.7ms
card 4  baseline 70.73   dark at 1340.7ms

spread (stagger) : 0.0ms      [a real exit needs 476ms across five]
```

Card 0's normalised luminance across the cut — **one frame, not a fade**:

```
1309:1.12   1324:1.13   1341:0.21   1353:0.21   1369:0.21   1393:0.21 …
```

**The instrument reports the defect on the current build, so a green from it later means
something.** That was the gate and it passed.

### ⚠ But the cut lags the epoch by ~190ms

```
predicted  ~1150ms   (the epoch bump)
measured   ~1341ms
delta      +190.7ms
```

**The boundary machine itself is correct and on time.** From the same run:

```
leaving(Q5)@0ms   arriving(Q4)@1153ms   settled(Q4)@1153ms
```

So `CORRIDOR_STEP_MS = 1150` is sound — the edge fires within 3ms. ⚠ **The discrepancy is
not in the boundary. It is a ~190ms lag between React committing the new epoch and the
pixels going dark.**

### Carl's decision — TAKEN AS-IS, NOT CHASED

**The lag sits on the EXTINGUISH path, which the exit removes.** Under the exit's own loop
the cards are dark at 901ms, so the epoch restart has nothing left to extinguish. The 190ms
belongs to a mechanism this work deletes.

⚠ **And it makes the item 6 label-swap invariant SAFER, not riskier.** The swap commits at
1153 and paints at ~1341 — **both well clear of a 901ms exit.**

---

## 2. ⚠ A LEAD — NOT A FINDING. DO NOT INVESTIGATE NOW.

**The extinguish path lags React commit by ~190ms while the incoming entrance is on time.**

| | predicted | measured | delta |
|---|---|---|---|
| outgoing cards go dark | 1153 | ~1341 | **+190ms** |
| incoming card 1 rung | 1803 (1153 + 650) | 1816 | **+13ms** (one frame) |

⚠ **That asymmetry is on the same commit-to-pixel axis as the unexplained card-1 entrance
delay** (`card-1-anchor.mjs`, fails 1 run in 3 on the cold run, ~450ms drift, verified
identical on the stashed pre-change build).

⚠⚠ **IT IS A LEAD FOR THAT DEFERRED ITEM ONLY.** It is not a finding, it is not evidence
for a cause, and it is not to be chased inside the exit work. Recorded so the next session
looking at the card-1 delay has it, and so nobody re-measures it from scratch.

---

## 3. ⚠⚠ TWO INSTRUMENT FINDINGS — BOTH WILL BITE A FUTURE SESSION

### 3a. `canvas.__r3f` IS UNDEFINED ON PRODUCTION BUILDS

Measured on all three canvases on the page, inside the host and out:

```
i  inHost  hasR3f  hasStore  hasScene  meshes
0  true    false   false     false     0
1  false   false   false     false     0
2  false   false   false     false     0
```

⚠ **So a scene-walking instrument reports "⛔ BROKEN" on a perfectly healthy page.** The
established access shape is `c.__r3f?.store ?? c.__r3f?.root?.store`, and it finds nothing
here.

⚠ **`verify/satin-anisotropy-live.mjs` USES EXACTLY THAT ROUTE** (`:77-81`). It works in
dev. **It cannot work against a production build**, and nothing in it says so. Any new
harness copying its pattern inherits the fault.

**Not fixed in this chunk** — `satin-anisotropy-live.mjs` was not in scope and is not
touched. Recorded so the next reader does not spend an hour rediscovering it.

### 3b. ⚠⚠ `__cardTrace` IS SILENT ACROSS THE ENTIRE BOUNDARY

It publishes one sample per card per frame **from inside the tick loop** — and the tick loop
**self-terminates at `t >= 1`** (`answer-card-canvas.tsx:2370`). Measured across a Q5→Q4
step:

```
65 samples after the click
earliest at +1816ms
every one of them Q4's INCOMING entrance
```

**There is no sample anywhere in the window the cut happens in.**

⚠⚠ **THE EXIT PLAN NAMED `__cardTrace` AS "THE RIGHT PRECEDENT" FOR THE EXIT INSTRUMENT.
THAT WAS WRONG.** An exit harness built on it alone would have **stayed green forever** —
the same shape as `extras-hold-position.mjs`, which asserts a rect, says nothing about
opacity, and stays green through an exit that never fires.

**Corrected in the plan in place.** The channel is still worth extending with a
`dir: "in" | "out"` field *once the exit's own loop is running and has samples to publish* —
but it cannot be the only channel, and it could not have been the falsifying one.

### What the instrument does instead

**Reads rendered pixels** — an in-page `drawImage` blit of each card's column into a small
offscreen 2D canvas, once per frame, mean luminance weighted by alpha.

⚠ **This is NOT a screenshot harness.** No CDP round-trip, no ~84ms/capture, no main-thread
stall — the recorded fault where a sampler slower than the thing it samples "will invent a
defect and hide a real one". The cost is one GPU→2D blit per frame, inside the page. Card
columns are located from the hover targets, so they cannot drift from the cards.

`verify/card-exit.mjs`. Both dead-end routes are documented in its header.

---

## 4. THE EMPTY-WINDOW FIGURES, CORRECTED

⚠ **The figures first recorded (650 → 899, +249ms) assumed the cut coincides with the
epoch. It does not.** Corrected from this run's own measurements:

```
TODAY       cards dark 1341ms → next cards 1816ms  =  475ms empty
WITH EXIT   cards dark  901ms → next cards 1816ms  =  915ms empty
                                                       ─────
INCREASE IN EMPTY STAGE                                440ms
```

⚠ **Stated as an INCREASE IN EMPTY STAGE** — the stage is already empty for 475ms today;
this makes that window 915ms.

⚠ **The increase is 440ms, not the 249ms of headroom.** They are no longer the same number
seen from two ends, because the current cut lags the epoch. **Carl is deciding whether the
915ms empty window is acceptable before the exit is built.**

---

## 5. WHAT LANDED, AND WHAT DID NOT

**Landed:** commit (a) only — the derived constants and the `CORRIDOR_STEP_MS` /
`COMPLETE_HOLD_MS` exports. **Zero behaviour change; nothing reads them yet.** The 1150
boundary is confirmed at 1153, so the arithmetic stands.

**NOT built:** the exit itself (commit b) and the `useCardEntrance` →
`useCardChoreography` rename (commit c). **Stopped on Carl's instruction pending his
decision on the 915ms window.**

---

*18 August 2026. The instrument was built to falsify itself first, and it did — but it also*
*⚠ **falsified the plan's own choice of channel. The precedent the plan named could not***
*⚠ **have seen the fault it was being pointed at.***
