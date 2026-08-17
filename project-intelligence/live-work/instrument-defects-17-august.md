# Two blind instruments, found 17 August 2026

**Recorded as found, on Carl's instruction.** ⚠ **No rule is drawn from these and they are
not consolidated with anything else — that is Carl's.** They are written here because both
were nominated, in sequence, as the instrument that would verify the phrase recession during
Step 1 of the question-boundary phase machine, and neither could have done it.

Both were found by **running them**, not by reading them. Neither announced its own failure.

---

## Defect 1 — `paint-order.mjs` captures a value, prints it, and never asserts on it

**Nominated for**: covering the phrase recession in Step 1's regression row.

`sampleStacks()` computes the live grid's rect and returns it:

```
:160    let gridRect = null;
:165    gridRect = { l: …, t: Math.round(b.top), w: …, h: … };
:171    return { gridRect, gridIsActive, stacks: out };
```

`note()` prints it on every sampled moment:

```
:197-199   const gridNote = s.gridRect ? `grid@${s.gridRect.t}…` : "⚠ NO GRID";
```

⚠ **The comparison loop at `:300-320` iterates `b.stacks` / `c.stacks` only.** `gridRect` is
never diffed against the baseline. **A value collected, displayed, and never asserted on.**

**Consequence for the nomination**: the grid could move to a different position mid-recession
and the harness would report `336/336 identical probe points` and exit 0. Its mid-corridor
sample is also taken at a fixed `+300ms` after the click (`:264`), so a retimed recession
moves the element under a stationary probe — and the probe compares *which elements stack
there*, not *where the grid is*.

⚠ **`paint-order.mjs` is not broken for the job it was written for.** It reproduced the card
decoupling at 336/336 and it remains the right instrument for stacking order. It is blind to
*motion*, which is not what it claims to measure.

---

## Defect 2 — `corridor-motion.mjs` sampled an element that a later change made static

**Nominated for**: the same job, after defect 1 was found.

Its header states its purpose exactly: *"The corridor's MOTION, sampled — so a restructure
can be proved not to have changed it."* It sampled `.enquiry-pdepth-0` — the phrase **root**.

⚠ **The 15 August extras split moved `bottom`/`opacity` off the phrase root onto an inner
`.enquiry-phrase-travel` wrapper** (`globals.css:1650-1661`). The root the harness sampled
became **static by design**. The harness was never updated.

**Measured on the unmodified tree (`402b1a3`), production build, before any rebase:**

```
  152 frames sampled across the move
  phrase top   477 .. 477px
  grid top     493 .. 493px   (152 frames)
```

**One distinct value per channel. Zero nulls. 2700ms span. Exit code 0.**

A throwaway probe pointed at `.enquiry-pdepth-1 .enquiry-phrase-travel` measured the real
recession in the same build: **448.2 → 392.8px, `bottom` 0 → 58px, 54 distinct values over
~900ms.** The animation never stopped. The sampler stopped being pointed at it.

⚠ **A second, independent blindness in the same file**: the sampler re-queried
`.enquiry-pdepth-0` every frame, and `enquiry-opening.tsx:1797` withholds the active phrase
for the entire move. Even before the split it would have been resolving its `|| .enquiry-phrase`
fallback mid-move — the first phrase in document order, a memory rung, not the mover.

### ⚠ The instruction to re-measure was already written in the file, and was not followed

`corridor-motion.mjs` carried this comment beside its 5% threshold, before 17 August:

> ⚠ **RE-MEASURE THE FLOOR IF THE SAMPLING CHANGES.** It is a property of this harness, not
> of the corridor.

The sampling did not change — **the page changed underneath it**, which the instruction did
not name and nobody translated. Recorded as found.

---

## What the rebase changed (commit: harness only, no product code)

- Samples `.enquiry-phrase-travel`, resolving **depth-1 first, depth-0 as fallback**, and
  records which it took per frame (`depth`). The header states what it samples before,
  during and after the move, because no single selector is correct across the whole span.
- Adds `travelBottom` — the animated property, from computed style.
- **Refuses to save a capture that saw no motion** (`travelBottom` span <20px or <15 distinct
  values), and refuses one where no frame ever saw depth-1.
- **Threshold re-measured from scratch**; the inherited 5% was deleted, not carried.

### ⚠ The liveness check is on `travelBottom` because an injection failed to go RED

The first suppression injection pinned `bottom` and **the harness still exited 0**: `phraseY`
moved **7.0px across 28 distinct values**, purely from font-size reflow on the cue and
question spans — enough to clear a naive liveness threshold on a recession that had been
completely suppressed.

`travelBottom` under the same injection: **1 distinct value.** Honest run: **55 values,
0→58px.** The check moved to the animated property. ⚠ **Decided by an injection that failed,
not by reasoning.**

### Falsification of the rebased harness

| Injection | Result |
|---|---|
| recession suppressed (`bottom` pinned) | ⛔ **RED**, exit 1, capture **not saved** |
| eased → linear (identical endpoints and duration, different shape) | ⚠ **CHANGED** — phraseY **13.0%**, travelBottom **9.2%** |
| three same-tree captures, pairwise | **clean** — worst 0.2% |

**Noise floor measured at 0.1-0.2%** across three pairs on one unmodified tree.
⚠ **Prediction was 2.6-2.9% and was wrong** — that figure belonged to the old sampler, which
inferred position from a rect. Threshold set at **1%**: five times the worst observed noise,
nine times below the weakest injection signal.
