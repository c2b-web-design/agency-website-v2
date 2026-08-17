# The stale reveal anchor — stamped, and what the stamp exposed

**17 August 2026.** Item 2's choreography. ⚠ **The fix is HALF LANDED ON PURPOSE: the stale
anchor is now rejected, and what should happen INSTEAD is a design decision that is Carl's.**

---

## What was wrong

`CARD_FIRST_ENTRANCE_MS` is 650 because it is `Q5_REVEAL_MS / 2` — **card 1 arrives halfway
through the reveal.** That is a RELATIONSHIP between two events, not a delay.

`__revealStart` was published bare, and the reader's only guards were *"is a number"* and
*"is in the past"*. **A reveal start from the previous question satisfies both.**

## What landed

- **`enquiry-opening.tsx`** — the publisher stamps the question: `__revealStartQ = qNum`,
  written **before** the value so no reader sees a fresh timestamp under an old stamp.
- **`answer-card-canvas.tsx`** — rung 1 is used only when `stamp === __activeQ`. Both sides
  must be present; a missing stamp is not a match.
- **`?anchortrace=1`** — records WHICH RUNG answered. This is the load-bearing part of the
  work, for the reason below.
- **`verify/anchor-freshness.mjs`** — new, with two injections.

## ⚠⚠ WHAT THE RUNG TRACE CAUGHT, AND WHY IT HAD TO EXIST

**`ladder-mode.mjs` reports 0% Mode B on production after this change — at every question.**
That number is **not trustworthy on its own**, and the rung trace is what shows why:

```
  question   rung1(published)   rung2(css anim)   rung3(now)
  Q5                      0                 3            0
  Q4                      0                 3            0
  Q3                      0                 2            1  ⚠
  Q2                      0                 1            2  ⚠
  Q1                      0                 1            2  ⚠
```

**25 fall-throughs to `now` across 3 runs.** Falling through to `nowMs` makes `overrun = 0`,
which is **indistinguishable from a perfect anchor in the modetrace**. ⚠ **Mode A by
arithmetic, not by choreography.** Had the rung trace not been built in the same change, this
would have been reported as a clean fix.

### The mechanism — NOT the 9ms race the earlier record described

Every read on production shows the stamp **exactly one question behind**, with rung 2 also
unavailable:

```
    t=16213  q=4  stamp=5  rung=3-now
    t=19664  q=3  stamp=4  rung=3-now
    t=23048  q=2  stamp=3  rung=3-now
    t=26453  q=1  stamp=2  rung=3-now
```

**The entrance effect runs before the incoming question's reveal has started at all** — not
9ms early, but a whole step ahead. The guard is doing its job; there is simply nothing correct
to read yet. ⚠ **The earlier "9ms race" figure in `mode-ab-finding-17-august.md` came from a
probe that instrumented `__revealStart` with `Object.defineProperty` — see below — and should
not be relied on.**

---

## ⚠⚠ A FIFTH BLIND INSTRUMENT — AND IT WAS MINE, WRITTEN YESTERDAY

The probe that produced the original "9ms race" diagnosis wrapped `window.__revealStart` in a
getter/setter. **Converting that data property into an accessor changed the timing enough that
the defect stopped reproducing entirely** — 4 consecutive clean runs, all Mode A. Removing the
instrumentation made it reproduce immediately (Q4 clamped at 8431/8421/8408ms).

**The instrument was the difference between the fault appearing and not appearing.** Found
only by deleting it and re-running. Recorded as found; no rule drawn.

---

## ⚠ THE OPEN DESIGN QUESTION — CARL'S, NOT MINE (question a)

**What SHOULD happen when the anchor is correctly rejected as stale?** Three candidates, none
implemented:

1. **Fall to `now`** — what happens today. The ladder is internally correct and unrelated to
   the text. **This is the current behaviour and it is not obviously wrong**, because it is
   also what the clamp was always designed to do: *fail to current timing, never to a
   collapsed ladder.*
2. **Wait for the reveal** — hold the entrance until this question's `animationstart` fires.
   ⚠ Changes WHEN the cards enter, which is approved choreography, and could stall the ladder
   if the reveal never fires.
3. **Publish the anchor earlier** — have the corridor publish the intended reveal start at the
   `arriving` edge rather than waiting for `animationstart`. ⚠ Predicts the reveal rather than
   observing it, which is the coupling `__revealStart` was created to remove.

**Recommendation: none acted on.** Option 2 changes approved motion and option 3 re-couples
the choreography to a prediction — both are §5a-shaped and neither is mine to choose.

---

## ⚠⚠ WHAT NO INSTRUMENT IN THIS REPO CAN VERIFY

**Nothing measures the reveal.** The beat trace sees the card; no instrument sees the text. So
*"card 1 arrives halfway through the reveal"* — the actual instruction — **cannot be checked
here.** That is item 3, and it is not built.

What is now asserted is narrower: **the anchor the ladder uses belongs to the question being
entered, or it is not used.** Necessary for the relationship; not sufficient to prove it.

---

## Measurements

| | Q5 | Q4 | Q3 | Q2 | Q1 |
|---|---|---|---|---|---|
| **Mode B before** (prod, 6 runs) | 0% | **100%** | **100%** | **100%** | **100%** |
| **Mode B after** (prod, 6 runs) | 0% | 0% | 0% | 0% | 0% |
| **⚠ but rung 3 (`now`) after** | 0/3 | 0/3 | 1/3 | 2/3 | 2/3 |

**Dev, 6 runs after: 0% Mode B, and `anchor-freshness.mjs` green — 0/75 fall-throughs.**
⚠ **The dev and production answers differ**, and the production one is the one that ships.

*17 August 2026. The anchor is no longer stale. What replaces it at Q4-Q1 on production is
still `now`, and that is the open question.*
