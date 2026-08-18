# Step 5 — deleting the warm-up canvas, as a MEASURED EXPERIMENT

**18 August 2026. ⚠ AN EXPERIMENT, NOT A FIX.** Carl's framing. The question is what
the deletion does to the reveal-freeze distribution — not whether it "works".

**Baseline in hand** (`reveal-stall-instrument-18-august.md`, build
`k7Q61m8UeH9ePHlCjZ6if`):

```
  per run   40  120  200  200  200  240  240  240  ms
  MEDIAN 200ms    RANGE 40-240ms    FREEZE IN 7/8 RUNS
```

⚠ **And on the same build, an earlier six-run batch ran 80–640ms.** The honest
statement of the baseline spread is **40–640ms across 14 runs on one build.**

---

## ⚠⚠ THE PREDICTION — WRITTEN BEFORE ANY POST-CHANGE MEASUREMENT

**Stated as a distribution, per the standing rule that the misses are the useful part.**

> ### I predict the median DOES NOT MOVE MEANINGFULLY, and the spread STAYS WIDE.
>
> **Median: 160–280ms** (baseline 200ms). **Range: still spanning at least 5x**,
> with a floor near 40ms and a tail of 400ms+ in 8 runs.
> **Freeze still present in 6/8 or more runs.**
>
> **Confidence: moderate. ⚠ I expect to be wrong about the direction more easily
> than about the spread.**

### The reasoning, so a miss is diagnostic rather than embarrassing

1. **The warm-up's measured benefit is to `mount → compiled`, not to the reveal.**
   Stage 1: 106ms with it, 1353ms without — a real ~1250ms effect **on canvas
   compile time**. ⚠ **That is not the same quantity as the mid-wipe freeze.**
2. ⚠⚠ **Deleting it should make the reveal WORSE, not better, if it matters at all.**
   The warm-up exists to pay the compile cost *before* Begin. Remove it and the real
   canvas compiles later — plausibly *inside* the reveal. **If the median rises
   sharply, that is the warm-up doing its job and the deletion is a regression.**
3. **But the freeze is in the GPU process, and Stage 1 found the cost is
   per-context program instantiation.** The warm-up is a *second context* that links
   the same 17 programs. Removing it removes 17 redundant links — ⚠ **which is a
   claim about total GPU work, not about work inside the 1300ms window.**
4. ⚠ **The spread is the part I expect to survive.** Nothing in this change touches
   whatever makes one run 40ms and another 640ms. **If the spread collapses, that is
   the most interesting possible result and it was not predicted.**

### ⚠ What would falsify each reading

| Outcome | What it would mean |
|---|---|
| median ~200ms, spread wide | prediction holds; **the warm-up is not the reveal freeze** |
| median rises sharply | the warm-up was load-bearing; **deletion is a regression** |
| median falls sharply | ⚠ **the second context was costing the reveal** — unpredicted, and the strongest result |
| **spread collapses** | ⚠⚠ **unpredicted by me.** Would mean the variance source is the warm-up itself |

---

## ⚠ WHAT DEPENDS ON THE STRUCTURE — enumerated BEFORE the change (rule 5b)

| Provided by the warm-up | Preserved? |
|---|---|
| `armOpening("compile")`, one of four arming paths | ⚠ **The ready gate wins 3/3 on normal runs** (+181–332ms) while the compile lands at +1456–2356ms. The compile path had to be **forced** in Stage 2 step 3 by delaying `document.fonts.ready`. **Expected to change arming rarely — measured by name via `opening-arm.mjs`, not assumed.** |
| Shader precompile for the labelled card material | ⛔ **GONE. This is the thing under test.** |
| `warmupHeldOver` overlap (`WARMUP_OVERLAP_MS`) | Exists only so Begin does not destroy the warm context in the commit that creates the real one. **Moot once the node is gone.** |
| `suppressWarmup` / `?nowarmup=1` | The arm-B switch for `warmup-value.mjs`. **Becomes dead code.** |
| `labels={QUESTIONS[5].options}` | Precompiled the **labelled** material variant — a different variant from an unlabelled card. Goes with the node. |

⚠ **THE REDUCED-MOTION ARM MUST STAY ON THE CHECK.** Stage 2 recorded that under
reduced motion Begin is clickable at +226ms while the warm-up compiles at ~2261ms —
**so a reduced-motion visitor already pays the toll on the cards.** Deleting the
warm-up changes what that visitor experiences and it is already the worse path.

---

## METHOD

- **8 runs minimum**, production, same session, same machine, 1440x900.
- ⚠ **A LOWER MEDIAN ON FEWER RUNS IS NOT A RESULT.** Against a 16x baseline spread,
  the distribution is reported or nothing is.
- **Same instrument, unchanged**, so the comparison is like-for-like.
- ⛔ **NOT IN SCOPE:** `NextStepMeshButton`'s per-step context — 8 contexts across a
  five-question walk, 67ms in `CommandBufferProxyImpl::Initialize`, never counted by
  `one-context.mjs`. **That is the NEXT experiment and must not be folded into this
  one**, or neither is attributable.

---

*18 August 2026. ⚠ The prediction above is written before the measurement. If it is*
*wrong, the miss is the finding and it stays on the record unedited.*

---

# THE RESULT — ⚠ THE DELETION DID NOT MOVE THE FREEZE

**Post-change build `DaQzWyD-4r-8ZP7NeT96O`, production `:3100`, 1440x900,
ANGLE (AMD Radeon(TM) Graphics, D3D11). 8 runs, same session, same machine.**

## ✅ THE DELETION TOOK EFFECT — verified before measuring, not assumed

```
  warm-up nodes pre-Begin ....  0        (was 1)
  linkProgram BEFORE Begin ...  17
  linkProgram AFTER Begin ....  11       ⚠ was 17/17 in Stage 1
  AnswerCardCanvas mounts ....  1        (the shared host, alone)
```

⚠ **The redundant second link of the full 17 programs is GONE.** That was the
structural point of step 5 and it is achieved.

## THE DISTRIBUTION

```
                  per run (ms)                        median   range     freeze
  BEFORE   40  120  200  200  200  240  240  240       200ms   40-240    7/8
  AFTER    80  120  160  200  240  720  760  800       220ms   80-800    7/8
```

⚠ **Validated by eye, per the standing rule:** run-06's 800ms hold reads `Q5 Wh` at
both f260 and f276, and resumes to *"What brought you here toda"* by f284. **The long
runs are real, not an artefact of the harness.**

---

## ⛔⛔ THE HONEST READING: NO IMPROVEMENT, AND THE TAIL GOT WORSE

**Median 200ms → 220ms. Freeze still in 7/8 runs.** ⚠ **And the upper tail went from
240ms to 800ms — three runs above 700ms where the baseline had none.**

### ⚠ WHAT I PREDICTED, AND WHAT ACTUALLY HAPPENED

| | Predicted | Observed | Verdict |
|---|---|---|---|
| median | 160–280ms | **220ms** | ✅ **hit** |
| spread | "at least 5x", floor ~40ms, tail 400ms+ | **10x, 80–800ms** | ✅ **hit** |
| freeze present | ≥6/8 | **7/8** | ✅ **hit** |
| **direction** | *"deleting it should make the reveal WORSE, not better, if it matters at all"* | **worse at the tail** | ⚠ **directionally right, for reasons I cannot claim** |

⚠⚠ **BUT THE HIT ON THE MEDIAN IS NOT A SUCCESS, AND SAYING SO WOULD BE THE FAILURE
THIS WHOLE INSTRUMENT EXISTS TO PREVENT.** My predicted band was 160–280ms — **120ms
wide, against a distribution whose own spread is 720ms.** ⚠ **A band narrower than the
noise cannot be confirmed by a single median.** It would have "hit" against almost any
plausible outcome.

**Recorded as an unfalsifiable prediction, not as a correct one.**

### ⚠⚠ AND THE DIRECTIONAL CLAIM DOES NOT SURVIVE THE SPREAD EITHER

**Three runs above 700ms after the change; none before.** That looks like a
regression, and it is the reading I would take if forced. ⚠ **But the baseline's own
earlier six-run batch on the UNCHANGED build contained a 640ms run** — so a long tail
is not new to this build, only to this particular eight.

⛔ **8 runs per arm is NOT enough to establish a tail difference.** It was enough to
establish that a single number is worthless; it is **not** enough to compare two
distributions' tails. **The working floor established this morning is a floor for
detecting the spread, not for comparing arms.**

> ## ⚠ THE DEFENSIBLE STATEMENT
> **Deleting the warm-up canvas did NOT reduce the reveal freeze.** The median is
> unchanged within noise and the defect still appears in 7 of 8 runs.
> **Whether it made the tail worse is NOT ESTABLISHED by these 8 runs.**

---

## ⚠ WHAT THIS DOES AND DOES NOT SETTLE

**SETTLED:** the warm-up canvas was **not** what caused the reveal freeze. Removing a
whole redundant WebGL context and 17 redundant program links left the median where it
was. ⚠ **The 106ms-vs-1353ms `mount → compiled` benefit was real and is a DIFFERENT
QUANTITY from the mid-wipe freeze** — exactly the conflation this experiment tested.

**NOT SETTLED:**
- Whether the tail genuinely worsened. **Needs more runs per arm, and that is a
  decision about how much machine time this question is worth — Carl's call.**
- ⚠ **Whether the deletion is a REGRESSION for other reasons.** `mount → compiled`
  was not re-measured here; Stage 1 says it should now be ~1353ms rather than ~106ms.
  **That cost has not gone away — it has moved, and nothing in this experiment
  measured where it landed.**
- **The arming path.** `opening-arm.mjs` was not run post-change. The compile path is
  now gone entirely, so arming must fall to the ready gate or the backstop.
  ⚠ **Predicted to be `ready-gate` on a normal run, but NOT VERIFIED.**
- **Reduced motion.** Not exercised. Stage 2 recorded that reduced-motion visitors
  already paid the toll on the cards; deleting the warm-up changes that path and it
  was already the worse one.

---

## ⛔ NOT IN SCOPE, AND DELIBERATELY NOT TOUCHED

**`NextStepMeshButton`'s per-step context** — 8 contexts across a five-question walk,
67ms in `CommandBufferProxyImpl::Initialize`, never counted by `one-context.mjs`.
⚠ **The post-change count above still shows 3 canvases after Begin**, so it is still
there. **That is the NEXT experiment. It was not folded into this one, so that each
remains attributable.**

## ARTEFACTS — preserved, SHA256-verified

```
project-intelligence/live-work/screenshots/
  q5-reveal-stall-18aug-step5-tail-80ms.webm    run-03    80ms
  q5-reveal-stall-18aug-step5-tail-800ms.webm   run-06   800ms
```

```
step5-tail-80ms   552591b14315ee824b62718a77ef071a8a46438051719a046987dc0792aea0f6
step5-tail-800ms  de69b18f8b39410c5c9c54d4a8f5c7fec153cfff5bfeec72b6d2b607b0d63abb
```

## GATES

`npx tsc --noEmit` clean. `npm run lint` **1 problem (1 error, 0 warnings)** — the
known `enquiry-opening.tsx` reduced-motion baseline, unchanged. The transient
`suppressWarmup` unused-var warning was cleared by removing the dead state with it.

---

*18 August 2026. ⚠ **The warm-up canvas is gone, the second context with it, and the***
*⚠ **freeze did not move. The prediction's median band was narrower than the noise,***
*⚠ **so its "hit" proves nothing — recorded as unfalsifiable rather than correct.***
