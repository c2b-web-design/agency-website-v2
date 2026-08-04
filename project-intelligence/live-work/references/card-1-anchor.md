# Card 1 enters ~2 seconds after the phrase reveal has finished

**Measured 4 August 2026, on Carl's instruction: *"measure, we will check it next session."***
**Flagged by the Architect in `architect-answer-lockup-fade.md`; not reported by Carl.**

⚠ **AN APPROVED INSTRUCTION IS CURRENTLY NOT BEING MET, AND THE VALUE IMPLEMENTING IT IS CORRECT.**

---

## Carl's instruction

> *"Rather than wait for the line to end, card 1 can begin its appearance half way through the text
> reveal."*

The reveal is a reading-speed instrument, so the overlap is the point: the eye is still travelling
along the line when the first card arrives beneath it.

`CARD_FIRST_ENTRANCE_MS = Q5_REVEAL_MS / 2 = 650` implements exactly that — **and is correct.**

---

## What actually happens

**Three runs, headed with `--enable-gpu`, run 1 cold. Times are from Begin.**

| | run 1 (cold) | run 2 | run 3 |
|---|---:|---:|---:|
| Q5 canvas mounts / reveal starts | +6888 | +6870 | +6934 |
| **reveal midpoint — the target** | **+7538** | **+7520** | **+7584** |
| reveal ends | +8188 | +8170 | +8234 |
| entrance clock zero | +8926 | +8844 | +8893 |
| **card 1 actually enters** | **+9576** | **+9494** | **+9543** |
| **late by** | **2038ms** | **1974ms** | **1959ms** |

⚠ **CARD 1 ARRIVES ROUGHLY 1.4 SECONDS AFTER THE REVEAL HAS ALREADY FINISHED.** The overlap Carl
designed does not happen at all — the phrase completes, then the cards begin.

**The full ladder, run 2:** card beats at +9494, +10062, +10629, +11179, +11745; lockup at +13177.

---

## ⚠ The cause — one wrong anchor, not a wrong value

`CARD_FIRST_ENTRANCE_MS` is measured from the **entrance clock**, whose zero is when
`active && compiled && warm` first goes true. **That is not when the reveal starts.**

```
precompile gap (canvas mount -> entrance zero):   2038 / 1974 / 1959 ms
```

**The lateness IS the precompile gap, to within 5ms.** The card canvas mounts, the async
precompile runs for ~2 seconds, and only then does beat one fire — 650ms after that.

⚠ **THIS IS THE SAME ROOT CAUSE AS THE LOCKUP-FADE STUTTER** fixed in `f141566`: the entrance runs
on a clock the surrounding code assumes starts at Begin. That fix corrected the contact field's
guard. **This one is the other half — the entrance's own first beat.**

---

## ⚠ Do not fix it by subtracting a constant

**The gap is not a constant.** It contains shader compilation, which:

- differs cold from warm (2038 vs 1959ms here, and far worse on a cold GPU cache)
- **will shrink when the precompile work lands** — `architect-answer-opening-stutter.md` fix A+B

**A recalibrated number is guaranteed to go stale**, and this project has recorded that happening
twice already.

### Measure again before doing anything

**If the precompile drops to ~100ms, card 1 lands at roughly `mount + 100 + 650` — inside the
reveal, near its midpoint, and the defect repairs itself.** That is the Architect's own
recommendation and the cheapest possible outcome.

### If it does not repair itself

The honest fix is the same shape as `f141566`: **anchor the first beat to the reveal's start rather
than to the entrance clock's zero**, so the ladder begins at the midpoint regardless of how long
the precompile took. That means the cards may need to be ready BEFORE the reveal starts — which is
what the warm-up canvas was supposed to buy and does not, because it is discarded at Q5
(`references/opening-stutter.md`).

⚠ **SO THE THREE OPEN PERFORMANCE ITEMS ARE ONE PROBLEM SEEN FROM THREE SIDES:** the warm-up
canvas being thrown away, the ~1.9s precompile, and this anchor. **Fixing the first likely fixes
all three.**

---

## How to re-measure

`?beattrace=1` marks `card-beat-*` and `lockup-beat-6`. Card 1's rung is 650, so the entrance
clock's zero is `card-beat-650` minus 650. The reveal starts when the Q5 canvas mounts and runs
`Q5_REVEAL_MS` (1300).

⚠ **READ THE INSTRUMENT BEFORE THEORISING.** The Architect's note on the last round: four theories
were generated about a fade before its start time had been read off the instrument built for
exactly that.
