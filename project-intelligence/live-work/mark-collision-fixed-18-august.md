# The mark-name collision — FIXED, and the re-measurement found something else

**18 August 2026. Diagnostic naming only — no product behaviour changed.**
Done before the next experiment, because that experiment measures this same region
and would have inherited the ambiguity.

---

## 1. THE FIX — named from what the canvas IS

`answer-card-canvas.tsx` chose its mark names from **`warm && !active`**:

```js
const base = warm && !active ? "warmup-canvas-created" : "card-canvas-created";
```

⚠ **`warm` DEFAULTS TO TRUE** (`warm = true` in the props, since `b25fb5f`), and the
shared host renders `active={hostCardsVisible}` — **false during the opening**. So the
one surviving canvas labelled itself `warmup-canvas-*` and **`card-canvas-*` never
fired at all.**

**Now unconditional at both sites** (`-created`, `-compiled`): **there is exactly one
`AnswerCardCanvas` and it is the real one, so it says so.**

⚠ **The `warm` PROP STAYS.** It is still load-bearing for `entranceRunning =
active && compiled && warm` and for `mayCompile`. **Only the naming stopped using it.**

### ⚠ A dependency array had to move with it, and it was checked, not assumed

Dropping `warm`/`active` from the name left `markWarm`'s `useCallback` with
unnecessary deps — a **new lint warning**, and the standing rule is that the known
baseline is not increased. Removed, which required checking the consumer:
`useScenePrecompile` stores the callback in **`readyRef`** and its effect keys on
`mayCompile`, **not on the callback's identity**. So a stabler identity is safe, and
mildly better. **Lint is back to `1 problem (1 error, 0 warnings)`.**

---

## 2. THE READERS — 13 FILES, MORE THAN EXPECTED

**The `card-beat-` regression is the precedent for a prefix with more consumers than
anyone expects, and it held again.**

| | |
|---|---|
| Files referencing either mark family | **13** |
| Product files | 3 (`answer-card-canvas`, `enquiry-opening`, `contact-field-canvas`) |
| `verify/` scripts | **10** |
| Scripts that READ the marks programmatically | **7** |
| Scripts mentioning them only in prose | 3 |

**Readers, and what each needed:**

| Script | Reads | Action |
|---|---|---|
| `warmup-value.mjs` | `card-canvas-*` via `[0]` | ⚠ note — it is the Stage 1 harness |
| `compile-by-question.mjs` | both families | note |
| `overrun-breakdown.mjs` | `card-canvas-*-<q>` | note |
| `card-1-anchor.mjs` | both families | note |
| `opening-arm.mjs` | both families | note |
| `post-warmup-gaps.mjs` | both, with fallback | note — fallback now belt-and-braces |
| `one-context.mjs` | **sums both names** | ✅ **already correct — see below** |
| `entrance-now.mjs`, `walk-dwell.mjs`, `warm-collision.mjs` | prose only | note |

**Every reader now carries a header note** saying the naming changed on 18 August and
that figures from 14–18 August builds are name-ambiguous.

## ⚠⚠ THE COLLISION WAS NOT NEW. IT WAS FOUND ON 14 AUGUST AND LEFT IN THE PRODUCT.

`verify/one-context.mjs`'s header has said this since 14 August:

> ⚠⚠ **THE HOST'S CANVAS MARKS ITSELF `warmup-canvas-created`, NOT
> `card-canvas-created`** — measured 14 August, and it is NOT a harness bug. …
> **On the host build there is no `card-canvas-created` mark at all, and there are
> TWO `warmup-canvas-created` marks.**

⚠ **THAT HARNESS FIXED ITSELF AND NOT THE DEFECT.** It counts both names, so it is
correct — and the finding then sat in one instrument's header **for four days** while
every other reader kept inheriting the fault.

⛔ **I REPORTED THIS AS AN UNEXPECTED NEW FINDING IN THE PREVIOUS PASS. IT WAS NOT
NEW.** It was already written down, by this project, four days earlier. **Correcting
that on the record: the previous write-up's framing was wrong.**

> ### ⚠ THE TRANSFERABLE POINT
> **A workaround in one consumer is not a fix.** A harness that routes around a
> product defect and records why has documented the defect, not removed it — and the
> record lives where only that harness's next reader will look.

---

## 3. ⚠ STAGE 1'S ARMS — VERIFIED CLEAN, NOT ASSUMED

**The previous pass offered "the warm-up mounted first so `[0]` was the right entry",
called it plausible and untested, and was right to.** It is now **verified from the
source at Stage 1's own arm**, and the real reason is stronger than the ordering
argument.

**Stage 1 ran on `4c7a20e` (13 August). The shared host landed `1e031cd` (14 August)
— the day AFTER.** At `4c7a20e`:

```
  warm-up canvas:  <AnswerCardCanvas active={false} warm … />
                   gated on  stage === "opening"
                   warm && !active = TRUE   ->  warmup-canvas-*

  real canvas:     <AnswerCardCanvas active={isActive} … />   (inside the phrase band)
                   gated on  stage !== "opening"
                   isActive TRUE for the active question
                   warm && !active = FALSE  ->  card-canvas-*     ✅
```

⚠⚠ **THE TWO WERE MUTUALLY EXCLUSIVE IN TIME AND EMITTED DIFFERENT NAMES.** The
warm-up existed only during the opening; the real canvas only after Begin. **So
`warmup-value.mjs` reading `card-canvas-created` at `[0]` resolved the real canvas
unambiguously — there was no competing entry under that name.**

> ## ✅ STAGE 1'S 106ms / 1353ms ARMS ARE UNAFFECTED BY THE COLLISION.
> **Verified from the source, not inferred from mount order.** The collision begins
> at `1e031cd` (14 August) and ends today. **Figures from 14–18 August builds are the
> ambiguous ones.**

⚠ **The 900ms `warmupHeldOver` overlap existed at `4c7a20e` too**, so both nodes were
briefly alive together — but they still wrote **different names**, so a `[0]` read
under either name was unambiguous. The overlap does not weaken the verdict.

---

# 4. THE RE-MEASUREMENT — ⚠⚠ AND IT FOUND A DIFFERENT PROBLEM

**The instruction: confirm `mount → compiled` reproduces the 1252ms median. If not,
the collision was material and the Stage 1 model needs revisiting.**

## ⛔ IT DID NOT REPRODUCE — AND THE COLLISION IS NOT WHY

```
  arm                                     marks      median    range
  ────────────────────────────────────    ────────   ───────   ──────────
  EARLIER SESSION
    f058854   pre-fix                     warmup-*    1252ms   1207-1338

  THIS SESSION, back to back
    f058854   pre-fix  ← SAME COMMIT      warmup-*    1450ms   1364-1471
    fix + deps restored                   card-*      1440ms   1432-1466
    fix, as committed                     card-*      1520ms   1458-1582
```

### ⚠⚠ THE CONTROL THAT DECIDES IT: THE SAME COMMIT MOVED 1252 → 1450ms WITH NO CODE CHANGE

**`f058854` was rebuilt and re-measured in this session, unmodified.** It now reads
**1450ms** where it read **1252ms** hours earlier. ⚠ **The three arms measured
back-to-back in THIS session agree within ~80ms of each other; the outlier is the
EARLIER session's figure.**

> ## ✅ THE NAMING FIX IS EXONERATED — BY A CONTROL, NOT BY AN ARGUMENT.
> The 1252 → 1520 shift is **between-session machine drift**, not the code.

⚠ **The dependency-array change was tested separately** (restored, rebuilt,
re-measured: 1440ms) and accounts for **at most ~80ms, within noise.**

### ⚠⚠ SO THE STAGE 1 MODEL DOES NOT NEED REVISITING — BUT SOMETHING ELSE DOES

**The collision was NOT material to these figures.** ⛔ **But a ~200ms between-session
drift on an unchanged commit is now measured, and it is larger than most differences
this project has treated as results in this region.**

⚠ **BETWEEN-SESSION COMPARISON IN THIS REGION IS NOT SAFE.** Two figures from two
sessions are two anecdotes even when each is a six-run distribution — **the
`q5-reveal-stall-reobserved-16-august.md` lesson, reproduced in a second quantity.**

**Consequence, stated plainly:**

- ✅ **Arms compared WITHIN one session are sound** — that is how this was resolved.
- ⛔ **Arms compared ACROSS sessions need the baseline RE-MEASURED in the new
  session.** A stored baseline is not a control.
- ⚠ **The previous pass's "within 8% of Stage 1's 1353ms" claim is withdrawn as
  stated.** See below.

## ⚠ CORRECTION TO THE RECORD, AS INSTRUCTED

**The previous write-up said the 1252ms measurement and Stage 1's 1353ms agreed
"within 8%", and presented that as corroboration.**

> ⛔ **THAT WAS WRONG IN FORM. Stage 1's 1353ms was ONE ARM — a single median from
> its own runs — and this pass measured six runs. A SINGLE NUMBER LANDING INSIDE A
> DISTRIBUTION IS NOT TWO MEASUREMENTS AGREEING.** It is one number falling in a
> range, which is a much weaker statement and is not evidence of corroboration.

⚠ **And it is weaker still now**, because the same commit produces 1252ms or 1450ms
depending on the session. **The honest statement: Stage 1's single 1353ms arm falls
inside the range this pass observed, on a quantity whose between-session drift is
comparable to the difference being discussed.**

---

## ⚠ INSTRUMENT DEFECT — `post-warmup-gaps.mjs`. NOT CONSOLIDATED. **THE TENTH IN FIVE DAYS.**

**Recorded in its own right. Carl is leading the pattern; this is not merged into it.**

**The defect:** it asserted on mark **NAMES** and reported

```
  ⛔⛔ WARM-UP CANVAS MARKS PRESENT — the deletion did not take.
  ⛔ NO card-canvas marks resolved — cannot report.
```

on a build with **zero warm-up DOM nodes**. ⚠ **The first line would have read as a
failed commit on a commit that is fine.**

**The class:** asserting on a *name* rather than on the *thing*. A mark called
`warmup-canvas-created` is not evidence that a warm-up canvas exists.

⚠ **IT FAILED TOWARD A FALSE ALARM — THE SAFE DIRECTION.** That is why it cost minutes
rather than a reverted commit, and it is the distinguishing feature worth recording:
of the instrument defects on this record, **the expensive ones are those that failed
toward a PASS** (`q5-stutter.mjs` 0/3 CLEAN on a visible stall; `one-context.mjs` 2/2
while a context was created per question; the reveal window's version 3 reporting 0ms
on a live freeze). **A false alarm is investigated. A false pass is believed.**

### ⚠⚠ AND THE COUNT IS NOW PART OF THE FINDING — TEN IN FIVE DAYS

**Ten instrument defects, 14–18 August.** ⚠ **A defect rate that high in the
measuring apparatus is itself a measurement**, and it bears on how much weight any
single green verdict can carry in this area.

⛔ **NO RULE PROPOSED — Carl is leading that.** Recorded so the count is on the record
rather than distributed across ten files where nobody sees the total.

---

## GATES AND STATE

- `npx tsc --noEmit` **clean**.
- `npm run lint` **1 problem (1 error, 0 warnings)** — the known `enquiry-opening.tsx`
  reduced-motion baseline. ⚠ **The transient `exhaustive-deps` warning this change
  introduced was cleared, not accepted.**
- **Product change is naming + one dependency array.** No behaviour.
- ⛔ **`NextStepMeshButton` NOT TOUCHED.**
- Arming still `ready-gate` 6/6; backstop still reachable (4225ms); reduced motion
  still completes and arms. **All three re-confirmed on the corrected build.**

---

*18 August 2026. ⚠ **The marks now say what the canvas is. Stage 1 is verifiably clean —***
*⚠ **the collision starts a day after its arm. And the re-measurement's real finding is***
*⚠⚠ **that the SAME COMMIT reads 1252ms or 1450ms depending on the session.***
