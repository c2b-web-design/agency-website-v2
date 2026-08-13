# Q5 stall bisect — 13 August 2026

**Production build per arm, three cold samples per arm. No code changed.**
Method set by Carl: *"Bisect from 3a7cf1f forward. Production build per arm — a bisect on a
live dev server measures Turbopack, which already cost a round."*

Harness: `verify/q5-stutter.mjs`, metric **worst frame gap inside the 0–1300ms Q5 reveal**,
cold run only. Real GPU. Server: `next start -p 3100`, killed by PID and port confirmed free
between every arm.

---

## ⚠ FIRST, A CORRECTION TO THE CANDIDATE LIST

`q5-stall-10-august.md` lists the arms as *"`5a694a3`, `e429fc2`, `d8dd1a8`, `26f6981`,
`9957465`, `2e71e5c`, `1c9b8d7`, `7b056c2`"*.

**Five of those predate the good arm.** `3a7cf1f` is 9 Aug 14:35; `5a694a3`, `e429fc2`,
`d8dd1a8`, `26f6981` and `9957465` are all 7 August. A bisect walking that list in order would
walk backwards through time.

**The true first-parent path `3a7cf1f..e3a5b7c` is seven commits:**

    2e71e5c  09 Aug 14:40  docs: D-046, stale entrance timings corrected at four sites
    1c9b8d7  09 Aug 20:23  feat: glass discarded, face is satin, label is the surface
    7b056c2  10 Aug 00:01  feat: traveller is a spotlight on a tilted ring
    071923c  10 Aug 00:04  docs (no code)
    4c7a20e  10 Aug 00:35  wip: the hover teal, which animates and paints nothing
    8bd2d0f  10 Aug 00:35  docs (no code)
    e3a5b7c  10 Aug 01:07  fix: the hover teal works

---

## THE MEASUREMENTS

| arm | cold samples (ms) | median | verdict |
|---|---|---:|---|
| `3a7cf1f` (good) | 82 / 80 / 81 | **81** | clean |
| `2e71e5c` | 77 / 82 / 80 | **80** | clean |
| `1c9b8d7` | 138 / 109 / 119 | **119** | ⚠ raised |
| `7b056c2` | 117 / 125 / 103 | **117** | ⚠ raised |
| `4c7a20e` | 214 / 294 / 320 | **294** | ⚠⚠ badly raised |
| `e3a5b7c` (bad) | 303 / 267 / 360 | **303** | broken |

Cross-check against the 10 August record: good arm 81ms here vs **86ms** recorded — agrees.

---

## ⚠⚠ IT IS NOT ONE COMMIT. THE STAIRCASE IS REAL THIS TIME.

**There is no single arm where it breaks.** The number climbs in three steps:

    81ms  →  80ms  →  119ms  →  117ms  →  294ms  →  303ms
          2e71e5c   1c9b8d7   7b056c2   4c7a20e   e3a5b7c
          (clean)   (+38)     (flat)    (+175)    (flat)

**Two arms move it, and neither is a mount-lifecycle change:**

1. **`1c9b8d7` — satin face + label as surface.** 81 → 119ms. Adds 710 lines to
   `answer-card-canvas.tsx`, 530 to `answer-card-glass.ts`, 353 to `answer-card-mesh.tsx`.
2. **`4c7a20e` — the hover teal WIP.** 117 → 294ms. The largest single step.

`7b056c2` and `e3a5b7c` are flat against their predecessors — they inherit the cost, they do
not add to it.

---

## ⚠⚠ THIS CONTRADICTS THE 10 AUGUST EXONERATION OF THE HOVER WORK

`q5-stall-10-august.md` states, as its most-emphasised finding:

> *"**IT IS NOT THE HOVER WORK — THIS IS THE MOST USEFUL FACT HERE.** Both components were
> reverted to `7b056c2` … **Result: 626ms.** The stall survives the removal of the entire hover
> chunk. ⚠ **SO DO NOT START BY SUSPECTING THE TEAL.**"*

**This bisect measures `7b056c2` at 117ms, not 626ms.** Same commit, same harness, same metric.

**The likely reason the two disagree, and it is a guess — flagged as a guess:** the 10 August
revert used `git checkout 7b056c2 -- answer-card-mesh.tsx answer-card-canvas.tsx`, reverting
**two files while leaving `answer-card-glass.ts` current**. `1c9b8d7` changed all three, and
`7b056c2` changed `answer-card-glass.ts` by 946 lines. So that revert produced a **mixed tree
that never existed as a commit** — current glass against older canvas and mesh — rather than
the state of `7b056c2`. A checkout of the whole commit, as done here, is a different measurement.

⚠ **I have not tested that explanation.** Reproducing the two-file revert and measuring it would
confirm or kill it, and that is the next measurement if you want the disagreement closed.

**What is not in doubt:** the hover chunk is where the largest step happens, and `4c7a20e`'s
+175ms is the biggest single move in the range.

---

## ⚠ ON `forceContextLoss` — THE LEAD DOES NOT SURVIVE

`forceContextLoss` at 35ms was the recorded lead: *"a context being destroyed during the window …
if something now tears it down early, the fix is being undone."*

**`forceContextLoss` appears nowhere in `components/` or `app/`.** It is called from inside
Three.js on renderer disposal, i.e. `<Canvas>` unmount — not from our code.

**And the bisect does not point at a mount-lifecycle change.** `2e71e5c` is the only arm that
touches the mount gating in both `enquiry-opening.tsx` and `answer-card-canvas.tsx`, and it
measures **80ms — completely clean**. The two arms that move the number are material and shader
work, not lifecycle.

⚠ **So the 900ms warm-up overlap is most likely still intact, and the regression is not the
`3a7cf1f` mechanism being undone.** The shape fits **more GPU work to do** — a bigger, more
expensive shader set compiling in the same window — rather than the warm context dying early.

**Consistent with the 12 August GPU-process trace** (`CommandBuffer::Flush`, renderer idle),
which found the freeze in the GPU process with the main thread quiet.

---

## WHERE THE GAP LANDS — a second signal, unprompted

The harness prints the offset of the worst gap. It moves with the arm:

    3a7cf1f   +229ms      2e71e5c   +29ms
    1c9b8d7   +380ms      7b056c2   +380ms
    4c7a20e   +396ms      e3a5b7c   +397ms

⚠ **A moved symptom is an unfixed one** — the standing rule on this defect. From `1c9b8d7`
onward the gap parks at **~380–397ms** and stops moving, while its *size* keeps growing. That is
consistent with one fixed piece of work (the compile) getting steadily more expensive.

---

## ⚠ ON THE NUMBERS THEMSELVES — READ THE SPREAD, NOT THE POINT

**Single cold runs do not resolve this.** Measured on one build, one server, back to back:

    4c7a20e   214 / 294 / 320ms      (106ms spread)
    e3a5b7c   303 / 267 / 360ms      ( 93ms spread)

The first `e3a5b7c` sample read **625ms** — the extreme of that distribution, and the value that
would have been reported from a single run. The 596ms in the 10 August file is the same order
and is plausibly the same kind of sample.

⚠ **My own first pass had `7b056c2` at 84ms from one sample; three samples put it at 117ms.**
I nearly reported a clean midpoint that is not clean. The good arms are tight (77–82ms across
six samples); the broken arms are wide. **Quote the median of three, never a single run.**

---

## STATE

- Branch `fix/q5-stall-and-label-colour` restored, head `d7a52ef`, **working tree clean.**
- **No code changed** — all arms were `git checkout` of whole commits, then restored.
- `verify/q5-stutter.mjs` is byte-identical across the entire range, so the instrument was not
  a variable.
- Ports 3000 and 3100 confirmed free by `netstat`, servers killed by PID.

---

*Findings only. Carl decides.*
