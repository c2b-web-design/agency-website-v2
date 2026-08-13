# Q5 stalls — the 10 August measurement, and three wrong fixes

**Written 10 August 2026 by the Builder. OPEN — not diagnosed, not fixed.**

> ## ⚠⚠ CORRECTED 13 AUGUST 2026 — THE 626ms EXONERATION BELOW IS NOT VALID
> **The section *"IT IS NOT THE HOVER WORK"* rests on a measurement of a tree that never
> existed as a commit.** The revert command reverted **two** files and left a third current.
> A proper bisect on 13 August measures that same commit at **117ms, not 626ms**, and finds the
> hover arm `4c7a20e` to be the largest single step in the range (+175ms).
> **Read the correction at the foot of this file before using anything in it.**
> Full run log: `q5-stall-bisect-13-august.md`.

Carl, looking at localhost: ***"Q5 stalls"***. He is right, and the measurement is worse than
the symptom suggests.

---

## THE MEASUREMENT

`verify/q5-stutter.mjs`, real GPU (`ANGLE (AMD Radeon(TM) Graphics, D3D11)`), 3 runs each.

    dev server, head e3a5b7c        619-624ms worst frame gap
    PRODUCTION BUILD, same code     596ms

⚠ **IT IS NOT A DEV-SERVER ARTEFACT.** A production build was made specifically to rule that
out. The visible threshold is ~50ms; this is twelve times it.

**For scale, the history of this exact defect:**

    before 3a7cf1f (9 Aug)   584ms   the original stutter
    after  3a7cf1f (9 Aug)    86ms   fixed, and Carl approved it by eye
    now    e3a5b7c (10 Aug)  596ms   back to where it started

---

## ~~⚠⚠ IT IS *NOT* THE HOVER WORK — THIS IS THE MOST USEFUL FACT HERE~~
## ⚠⚠ WITHDRAWN 13 AUGUST 2026 — THIS SECTION IS WRONG

**Both components were reverted to `7b056c2`** — the approved resting-light commit, before any
hover teal existed — with everything else left current:

    git checkout 7b056c2 -- components/enquiry/answer-card-mesh.tsx \
                            components/enquiry/answer-card-canvas.tsx

**Result: 626ms.** The stall survives the removal of the entire hover chunk.

⚠ **SO DO NOT START BY SUSPECTING THE TEAL, THE SECOND TEXTURE, OR THE rAF LOOPS.** That ground
is covered.

> ### ⚠⚠ THE ABOVE IS WITHDRAWN. THE COMMAND REVERTED TWO FILES OUT OF THREE.
>
> `1c9b8d7` changed **`answer-card-canvas.tsx`, `answer-card-mesh.tsx` AND
> `answer-card-glass.ts`**. The revert names only the first two, so
> **`answer-card-glass.ts` stayed at its current version** — and `7b056c2` had changed that file
> by 946 lines.
>
> **The measured tree was therefore current glass against older canvas and mesh: a combination
> that never existed as a commit and that nobody ever intended to ship.** Its 626ms describes
> that hybrid, not `7b056c2`.
>
> **A whole-commit checkout of `7b056c2`, production build, three cold samples, 13 August:
> 117 / 125 / 103ms — median 117ms.** Not 626ms.
>
> ⚠ **AND THE CONCLUSION INVERTS.** The hover WIP arm `4c7a20e` is the **largest single step in
> the range**: 117ms → 294ms, **+175ms**. The teal is not exonerated; on this evidence it is the
> biggest contributor.
>
> ⚠ **THE LESSON IS THE ONE THIS FILE ALREADY TEACHES, APPLIED TO ITSELF.** The section directly
> below warns that *"a bisect that changes files on a live dev server is measuring the server."*
> The same discipline was not applied to the file LIST: **a partial revert measures a tree that
> was never built.** When reverting to a commit, revert to the commit — `git checkout <sha> --
> .` or a whole-tree checkout — or name every file that commit touched.
>
> **Corrected by whole-commit bisect, 13 August 2026: `q5-stall-bisect-13-august.md`.**

---

## ⚠ THREE WRONG FIXES, RECORDED SO THEY ARE NOT REPEATED

Each was plausible, each was measured, each changed nothing:

| # | blamed | after "fixing" |
|---|---|---:|
| 1 | ten unguarded rAF loops firing `invalidate()` on mount | 624ms |
| 2 | the second 2048x512 texture built per card at mount | 624ms |
| 3 | `customProgramCacheKey` forcing a shader re-link | 619ms |

⚠ **THE PROCESS FAILURE IS THE LESSON.** The wholesale revert above is ONE COMMAND and it
partitions the problem completely. **It should have been run first.** Instead three targeted
fixes were attempted against an unlocalised fault — the same pattern that had already wasted a
round earlier the same day on the hover teal.

---

## ⚠ AND ONE EARLIER NUMBER WAS MISLEADING — the reason the hover work looked guilty

An initial bisect appeared to show a clean staircase:

    7b056c2  resting light      161ms  then 132ms on a re-run
    4c7a20e  hover WIP          312ms
    e3a5b7c  hover fix          620ms

**That reading is wrong.** Those measurements were taken immediately after `git checkout`
switched files, so **Turbopack was recompiling during the run**. The dev server's state was the
variable, not the source. The wholesale revert — same server, same warmth, only the two
components changed — is the trustworthy comparison, and it says 626ms.

⚠ **A BISECT THAT CHANGES FILES ON A LIVE DEV SERVER IS MEASURING THE SERVER.** Any future
bisect here must either restart the server per arm, or use a production build per arm.

---

## THE ONE PIECE OF POSITIVE EVIDENCE

CPU profile captured across the reveal (CDP `Profiler`, 1600ms window):

    (idle)                  6912.3ms
    (program)                763.8ms    <- native/GPU-driver work
    getProgramParameter       74.6ms    <- SHADER LINK QUERY
    WebGLRenderer.forceContextLoss  35.0ms
    getProgramInfoLog         16.5ms    <- SHADER LINK LOG
    getParameters             13.9ms
    replaceLightNums           6.8ms

⚠ **`getProgramParameter` + `getProgramInfoLog` + `replaceLightNums` are all shader-compilation
path.** That points at programs being built during the reveal — which is precisely what
`3a7cf1f` fixed by giving the warm-up canvas a 900ms overlap past Begin.

⚠ **`forceContextLoss` AT 35ms IS WORTH A LOOK.** That is a context being destroyed during the
window. `3a7cf1f`'s whole mechanism is keeping the warm context alive across Begin; if something
now tears it down early, the fix is being undone rather than broken.

> ### ⚠ FOLLOWED UP 13 AUGUST — THE TEARDOWN IS REAL, PRESENT ON EVERY ARM, AND NOT THE CAUSE
>
> A program-count probe at the `useScenePrecompile` resolve point, four arms, three runs each:
>
> - **The warm-up context IS destroyed inside the reveal**, at a remarkably fixed time —
>   its program count empties at **+1306–1314ms** and `isContextLost()` flips at
>   **+1460–1548ms**. So the lead was a real event, correctly spotted.
> - ⚠ **BUT IT HAPPENS IDENTICALLY ON THE GOOD ARM.** `3a7cf1f` — the 81ms commit Carl approved
>   — tears the same context down at +1497/+1548/+1510ms. **A behaviour present on the fast arm
>   and the slow arm alike does not explain the difference between them.**
> - **`3a7cf1f`'s mechanism is intact on every arm**: the warm-up resolves **~5.2–5.9 SECONDS
>   before Begin**, nowhere near the reveal. The 900ms overlap is not being undone.
>
> **`forceContextLoss` is closed as the cause.** It is a normal unmount of the warm-up canvas
> after its job is done, and it happens after the reveal window in any case.

---

## WHERE TO START NEXT SESSION

1. ~~**Bisect properly, production build per arm**, from `3a7cf1f` (86ms, approved) forward. The
   candidates in between are `5a694a3`, `e429fc2`, `d8dd1a8`, `26f6981`, `9957465`, `2e71e5c`,
   `1c9b8d7`, `7b056c2`.~~ **DONE 13 August — and the candidate list was wrong.**

   ⚠ **FIVE OF THOSE EIGHT COMMITS PREDATE THE GOOD ARM.** `3a7cf1f` is 9 Aug 14:35;
   `5a694a3`, `e429fc2`, `d8dd1a8`, `26f6981` and `9957465` are all **7 August**. A bisect
   walking that list in the order written walks backwards through history.

   **The true first-parent path `3a7cf1f..e3a5b7c` is seven commits, two of them docs-only:**
   `2e71e5c`, `1c9b8d7`, `7b056c2`, `071923c` (docs), `4c7a20e`, `8bd2d0f` (docs), `e3a5b7c`.
   Results in `q5-stall-bisect-13-august.md`.
2. **Check the warm-up overlap still holds.** `3a7cf1f` gave the warm node a 900ms lifetime past
   Begin. `verify/warmup-value.mjs` measures what it is worth (161ms with, 919ms without).
3. **Follow `forceContextLoss`** — find what calls it and when.

⚠ **AND RE-READ `current-sprint.md` ON THIS DEFECT BEFORE BELIEVING ANY HARNESS.**
`verify/q5-stutter.mjs` itself has TWO recorded false-result episodes: it ran headless until
9 August (SwiftShader, no GPU), and its overlap assertion fired on a pre-existing context. Both
are fixed, but this file has a history of confident wrong answers.

---

## STATE AT HANDOFF

**Uncommitted at the time of writing: none — the three changes below were committed on their own
merits, NOT as a fix for this.**

- the rAF guard (ten cards no longer start a loop to discover they have nothing to animate)
- the deferred teal texture (built in an idle gap rather than during the reveal)
- `customProgramCacheKey` REMOVED — it was added to fix a hover bug that never existed, and it
  does force a shader re-link

**None of the three moved the number.** They are kept because each is correct in isolation, and
the comments in the code say exactly that so nobody reads them as a fix.
