# What step 5 changed but did not measure — the gaps CLOSED

**18 August 2026. ⛔ VERIFICATION ONLY.** No fix, no experiment, no new candidate.
**Commit `98429af` stands — Carl has kept it.** This closes the gaps that deletion
opened. Build `B1Sm5MZ6JdIuckM3FI0Kr`, production `:3100`, 1440x900,
ANGLE (AMD Radeon(TM) Graphics, D3D11). **6 cold runs, fresh profile each.**

Harness: `verify/post-warmup-gaps.mjs`.

---

## ✅ 1. THE ARMING PATH — HEALTHY, AND THE FALLBACK IS ALIVE

```
  ready-gate   6/6 runs      armed at median 396ms   range 311-425ms
  compile      0/6           ⚠ EXPECTED — its only call site was deleted
  backstop     0/6           ⚠ CORRECT — a backstop that fires routinely is broken
```

**The ready gate carries every normal run, at ~400ms.** ⚠ **This is the good
outcome, and it was not guaranteed** — the recorded failure mode in this project is
a backstop quietly becoming the only path, which the warm-up's `requestIdleCallback`
did for two sessions without anything reporting it.

### ⚠⚠ AND THE BACKSTOP IS REACHABLE, NOT DEAD CODE — PROVED BY FORCING IT

**"The ready gate wins every run" is only half an answer.** The other half is whether
the surviving fallback still works, because **if the ready gate ever fails, the
backstop is the only thing between the visitor and a permanently blank opening.**

`document.fonts.ready` was stubbed to a promise that **never settles** — precisely
the failure the ceiling exists for:

```
  armed by backstop @ 4220ms   | Begin present: true
  ✅ THE BACKSTOP IS REACHABLE — the ready gate is not the only exit.
```

**What happens if the surviving path fails:** the opening still starts, **but the
visitor waits 4220ms** — `OPENING_ARM_CEILING_MS` (4000ms) plus scheduling. The page
is not broken; it is **slow, by design, on a path that should never be taken.**

⚠ **So arming is now a TWO-PATH system where it used to be three.** Both remaining
paths are exercised and working. **No correctness defect found.**

---

## ✅ 2. mount → compiled — THE COST LANDED ALMOST EXACTLY WHERE STAGE 1 PREDICTED

```
  per run   1214  1207  1247  1258  1328  1338  ms
  MEDIAN 1252ms    RANGE 1207-1338ms    SPREAD 131ms    (n=6, all cold)
```

| | |
|---|---|
| Stage 1, **with** the warm-up | **106ms** |
| Stage 1, **without** (its `?nowarmup=1` arm) | **1353ms** |
| **Measured here, post-deletion** | **1252ms median** |

⚠⚠ **THE COST DID NOT DISAPPEAR. IT RELOCATED, AND IT IS NOW PAID IN FULL BY THE REAL
CANVAS.** ~1250ms of `mount → compiled` that the warm-up used to absorb before Begin.

⚠ **Stage 1's `?nowarmup=1` arm predicted 1353ms and the real deletion measures
1252ms — within 8%.** The diagnostic arm was an honest model of the deletion.

### ⚠ WHERE IT LANDS IN THE TIMELINE, AND WHY THAT MATTERS LESS THAN IT SOUNDS

**Mount at ~1200ms, compiled at ~2450ms — both BEFORE Begin**, which the visitor
cannot reach until the opening's ~7.8s choreography completes. **So on a normal run
the cost is paid in time the visitor is already spending.**

⛔ **BUT THAT IS AN ARGUMENT ABOUT THE NORMAL RUN ONLY.** Under reduced motion the
opening is ~305–447ms and **Begin is clickable at +226ms**, while compile finishes at
~2500ms. ⚠ **A reduced-motion visitor can press Begin roughly two seconds before the
cards are ready.** Stage 2 recorded that this predates the deletion — but the
deletion **removes the canvas that used to be compiling during that window.**

⚠ **NOT INVESTIGATED HERE.** It is a real exposure, it is out of scope for a
verification pass, and it is recorded so it is not lost.

### ⚠ SPREAD, REPORTED AS INSTRUCTED

**131ms across 6 cold runs — narrow.** ⚠ **Do not read that as "this quantity is
stable".** Six runs cannot establish a tail, and the 40–640ms freeze spread was found
in the same region. **The honest statement: no wide spread was OBSERVED in six runs.**

---

## ✅ 3. REDUCED MOTION — COMPLETES AND ARMS

```
  armed by reduced-motion @ 466ms   | Begin present: true
  mount 1198 → compiled 2511        | warm-up DOM nodes 0
```

**The path completes, arms by its own named source, and Begin is present and
usable.** ⚠ **One run only** — enough to answer "does it still work", **not** enough
to characterise its timing. The two-second exposure noted above is the open item.

---

## ⚠⚠ AN UNEXPECTED FINDING — A PRE-EXISTING MARK-NAME COLLISION

**Not what this pass went looking for. Found because the harness reported nonsense
and the nonsense was investigated rather than worked around.**

`answer-card-canvas.tsx` names its performance marks from **`warm && !active`**:

```js
const base = warm && !active ? "warmup-canvas-compiled" : "card-canvas-compiled";
```

⚠ **`warm` DEFAULTS TO TRUE** (`warm = true` in the props, since `b25fb5f` — long
before any of this work). The shared host is mounted `active={hostCardsVisible}`,
**which is false during the opening.**

### ⛔ SO THE ONE SURVIVING CANVAS LABELS ITSELF `warmup-canvas-*`

Verified directly: **zero `[data-testid="answer-card-warmup"]` nodes, one canvas, and
the marks emitted are `warmup-canvas-created` / `warmup-canvas-compiled`.**
**`card-canvas-*` never fires at all during the opening.**

### ⚠⚠ AND IT IS PRE-EXISTING — WHICH IS THE PART THAT MATTERS

**Before step 5, BOTH canvases satisfied `warm && !active` during the opening**
(the warm-up explicitly, the host by default), **so both wrote the SAME mark name.**
Readers take `getEntriesByName(...)[0]` — **the first.**

> ⚠⚠ **EVERY `mount → compiled` FIGURE ON RECORD MAY THEREFORE DESCRIBE WHICHEVER
> CANVAS MOUNTED FIRST, NOT THE ONE THE READER INTENDED** — including the 106ms /
> 1353ms Stage 1 arms and the 758ms "warm-up benefit".

⚠ **This does NOT overturn those figures.** The warm-up mounted first and is the
likelier owner of a `[0]` read, so they are probably what they claim. **But nothing
in the code guaranteed it, and no instrument checked.** ⛔ **NOT FIXED HERE** — it is
a change to shared diagnostic naming, and this is a verification pass.

⚠ **The 1252ms measured above is safe from this**: there is now only one canvas, so
whichever name it uses, the pair describes it.

---

## ⚠ INSTRUMENT DEFECT — `post-warmup-gaps.mjs`, FOUND ON ITS OWN FIRST RUN

**Recorded individually. NOT consolidated with the others — Carl is leading that.**

The first version keyed on `card-canvas-*` and treated `warmup-canvas-*` marks as
proof the warm-up survived. It reported:

```
  ⛔⛔ WARM-UP CANVAS MARKS PRESENT — the deletion did not take.
  ⛔ NO card-canvas marks resolved — cannot report.
```

⚠⚠ **THE FIRST LINE WOULD HAVE READ AS A FAILED COMMIT ON A COMMIT THAT IS FINE.**
Both were artefacts of the naming collision above.

⚠ **THE DEFECT CLASS: asserting on a NAME rather than on the THING.** A mark called
`warmup-canvas-created` is not evidence that a warm-up canvas exists. **Fixed by
judging the deletion on DOM NODES and reading `mount → compiled` from either mark
family.** ⚠ **It failed toward a FALSE ALARM rather than a false pass — the safe
direction, and the only reason it cost minutes rather than a reverted commit.**

---

## ⚠⚠ INSTRUMENT DEFECT — `reveal-stall.mjs` DESTROYED ITS OWN EVIDENCE. FIXED.

**Recorded individually. NOT consolidated.**

`verify/reveal-stall.mjs` called **`rmSync(OUT)` at startup**, so filming a new batch
**deleted the previous one.**

⛔ **IT COST THE 640ms FILM** — the widest freeze ever measured, from the six-run
batch, destroyed when the eight-run batch was filmed **on the same build to raise the
sample count.** ⚠ **It cannot be recovered: a fresh capture is a different run on a
different day, which is precisely the problem the instrument exists to describe.**

⚠⚠ **THE DEFECT IS SPECIFIC TO WHAT THIS HARNESS MEASURES. An instrument whose
subject is RUN-TO-RUN VARIANCE must not delete previous runs — the prior runs are not
stale output, THEY ARE THE MEASUREMENT.** The old comment boasted that it "clears only
its OWN directory", which is exactly the wrong instinct: its own directory held the
irreplaceable data.

⚠ **AND IT BLOCKED THE NEXT EXPERIMENT.** Comparing two arms means holding both arms'
films at once; under the old behaviour, filming arm B destroyed arm A.

**FIXED:** batches now write to `verify/out/reveal-stall/<timestamp>/` and
**accumulate — nothing is ever deleted automatically.** `REVEAL_STALL_BATCH` names a
batch explicitly; the measure script reads the newest by default and accepts a path so
two arms can be compared without refilming either. The existing step-5 films were
migrated to `2026-08-18-step5-post-deletion/` rather than left to be overwritten.

---

## ⚠⚠ THE SELF-ASSESSMENT ON THE STEP 5 PREDICTION — RECORDED AS INSTRUCTED

> **A 120ms-wide median band against a distribution with a 720ms spread was
> UNFALSIFIABLE, NOT CORRECT.**

My step 5 prediction named a median of **160–280ms**. The observed median was 220ms,
and I recorded it as a "hit". ⚠ **It was not a hit in any meaningful sense** — a band
that narrow, against noise that wide, would have been satisfied by almost any outcome
the experiment could produce. **A prediction that cannot be wrong is not evidence.**

> ### ⚠ THE RULE THIS ESTABLISHES
> **Future predictions about this defect must state a band NARROW ENOUGH TO BE
> WRONG** — and must be stated relative to the measured spread, not in isolation.
> A band wider than the effect being predicted is not a prediction.

---

## ⚠⚠ THE NEGATIVE RESULT — AND IT IS THE SUBSTANTIVE OUTCOME OF STEP 5

**Recorded as a NARROWING OF THE FIELD, not as a failed fix.**

```
  linked programs   17 / 17   →   17 / 11      (a whole redundant context's worth, gone)
  freeze median      200ms    →    220ms       (unchanged within noise)
  freeze present      7/8     →     7/8
```

> ## ⚠ EVIDENCE AGAINST PROGRAM-LINK **COUNT** AS THE DRIVER OF THE REVEAL FREEZE.

**That count was the implicit theory behind the shared-host rebuild.** Stage 1 found
the cost was *per-context program instantiation* and the fault was *context lifetime*;
the rebuild, and then this deletion, followed from that reading. ⚠ **Removing an
entire redundant context and six of seventeen post-Begin links moved the freeze not at
all.**

### ⚠ WHAT THAT DOES AND DOES NOT LICENCE

- ✅ **It narrows the field.** "Fewer linked programs → smaller freeze" is not
  supported. A future candidate should not assume it.
- ⛔ **It does NOT say the GPU is innocent.** The freeze is still in the GPU process
  with the renderer idle (`CommandBuffer::Flush`, ~164ms in four blocks). **Link
  count is one mechanism within that; ruling it out does not rule out the process.**
- ⛔ **It does NOT make step 5 a failure.** ⚠ **The deletion's own benefit is real and
  is a DIFFERENT QUANTITY:** it removed a whole WebGL context and 17 redundant program
  links. **`mount → compiled` — 106ms → 1252ms — is the price, and it is paid before
  Begin on a normal run.** Whether that trade is right is a design judgement, and
  Carl's.

⚠ **The confusion this guards against is treating `mount → compiled` and the mid-wipe
freeze as one number.** They are not, they never were, and conflating them is what
step 5 was run to test.

---

## STATE

- **New:** `verify/post-warmup-gaps.mjs`, this file.
- **Modified:** `verify/reveal-stall.mjs` (batches accumulate),
  `verify/reveal-stall-measure.mjs` (reads the newest batch, or a named one).
- ⛔ **NO PRODUCT CODE TOUCHED.** `98429af` stands untouched.
- ⛔ **`NextStepMeshButton` NOT TOUCHED** — still 3 canvases after Begin. **The next
  experiment, deliberately separate.**

## OPEN, AND CARL'S

1. **The reduced-motion exposure** — Begin clickable ~2s before the cards compile.
   Pre-existing, but the deletion removed the canvas that used to compile in that
   window. **Not investigated.**
2. **The mark-name collision** — every historical `mount → compiled` figure rests on
   a `[0]` read that nothing guaranteed. **Not fixed.**
3. **Whether ~1250ms of pre-Begin compile is an acceptable price** for one context.
   **A design judgement, not a measurement.**

---

*18 August 2026. ⚠ **All three gaps closed: arming is healthy and its fallback proved***
*⚠ **reachable, the deleted cost landed within 8% of Stage 1's prediction, and reduced***
*⚠ **motion still arms. The unlooked-for finding is that the one surviving canvas has***
*⚠ **been calling itself the warm-up all along.***
