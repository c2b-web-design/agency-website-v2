# Program-count probe — 13 August 2026

**Temporary probe, four arms, production build per arm, three cold runs each. No permanent code
changed; the tree was restored with `git checkout --` after every arm and is clean.**

Carl set the question: *"Those are different bugs with different fixes. Do not propose a fix
until the probe says which one it is."*

**The probe says it is NEITHER.** Both candidate mechanisms are ruled out by measurement.

---

## THE PROBE

Inserted at the point `useScenePrecompile` resolves (`answer-card-canvas.tsx`, immediately
before `readyRef.current()`), recording `gl.info.programs.length` plus a `requestAnimationFrame`
poll so the count could be read again after the reveal.

⚠ **ONE SLOT PER CONTEXT, AND THE FIRST VERSION WAS WRONG BECAUSE IT USED A SHARED ONE.** The
warm-up canvas and the card canvas each run this hook. A single `window.__probe` was overwritten
by whichever resolved last, and the later context starts at zero programs — which printed as
`POST 0`, i.e. the count apparently collapsing to nothing. **That would have been reported as a
dramatic cache flush. It was a bug in the probe.** Fixed by keying per context and by reading
`isContextLost()` alongside the count.

---

## THE MEASUREMENTS — all four arms, three runs each

| arm | stall (13 Aug bisect) | programs at resolve | programs after reveal | growth |
|---|---:|---:|---:|---:|
| `3a7cf1f` (good, approved) | 81ms | **14** | **14** | **+0** |
| `1c9b8d7` (satin/label) | 119ms | **14** | **14** | **+0** |
| `4c7a20e` (hover WIP) | 294ms | **14** | **14** | **+0** |
| `d7a52ef` (current HEAD) | — | **14** | **14** | **+0** |

**Identical on every arm, every run. Twelve runs, no variation at all.**

---

## ⚠ QUESTION 1 — DOES THE COUNT GROW ACROSS THE REVEAL? **NO.**

`growth +0` on all four arms, all twelve runs. The live card context holds **14 programs at the
moment the warm-up resolves and 14 after the reveal finishes.**

**So there is no cache-key mismatch.** The warm-up is not compiling variants the reveal then
fails to use — the reveal compiles nothing new at all. The two-state `compileAsync` already
documented in the code (canvas variant + transmission variant, *"16 programs is 8 materials seen
twice"*) is covering the set correctly.

## ⚠ QUESTION 2 — DOES THE COUNT STEP UP AT `1c9b8d7` AND `4c7a20e`? **NO.**

**14 on the 81ms arm and 14 on the 294ms arm.** The stall grew by 3.6x across the range while
the program count did not move by one.

**So it is not compile volume outrunning the fixed 900ms warm-up window.** The number of
programs is constant; what those programs cost is not.

---

## ⚠⚠ WHAT THE PROBE FOUND THAT NEITHER QUESTION ASKED

**The warm-up context is destroyed inside the reveal — on every arm, including the good one.**

    arm        programs empty at    isContextLost() at
    3a7cf1f    +1306 – 1312ms       +1497 / 1548 / 1510ms
    1c9b8d7    +1312 – 1314ms       +1529 / 1498 / 1478ms
    4c7a20e    +1312 – 1313ms       +1478 / 1461 / 1462ms
    d7a52ef    +1311 – 1313ms       +1482 / 1460 / 1481ms

This is the `forceContextLoss` from the 10 August CPU profile, now located in time. It is real.

⚠ **BUT IT IS PRESENT IDENTICALLY ON THE 81ms ARM AND THE 294ms ARM, so it cannot explain the
difference between them.** It is the warm-up canvas being unmounted once its job is done, and it
lands *after* the 1300ms reveal window closes.

⚠ **AND `3a7cf1f`'s MECHANISM IS INTACT EVERYWHERE.** The warm-up resolves **5.2–5.9 seconds
before Begin** on all four arms. The 900ms overlap is not being undone — that lead is closed.

---

## WHAT THIS LEAVES, STATED AS THE OPEN QUESTION AND NOT AS A FIX

**Same number of programs, same warm-up timing, 3.6x the stall.** The cost per program went up,
not the count. Consistent with the 12 August GPU-process trace (`CommandBuffer::Flush`, renderer
idle): the work is in linking and first-draw of *more expensive* shaders, not *more* shaders.

⚠ **The card context still resolves at +319 to +519ms — INSIDE the 1300ms reveal, on every arm
including the good one.** That is the same fact D-048 was authorised to address, and it is
unchanged by any of this.

**No fix proposed, per Carl's instruction.** The probe was asked which of two bugs this is; the
answer is that it is neither, and the next question is what makes the same fourteen programs
cost three times as much — which is a different measurement (per-program link time), not a
change to the code.

---

## STATE

- Branch `fix/q5-stall-and-label-colour`, head `d7a52ef`, **working tree clean.**
- **The probe is fully reverted** — `grep "TEMPORARY PROBE"` returns 0 occurrences.
- Probe inserter, harness and run script live in the session scratchpad only; nothing was added
  to `verify/`.
- Ports 3000 and 3100 confirmed free; every server killed by PID.

---

*Findings only. Carl decides.*
