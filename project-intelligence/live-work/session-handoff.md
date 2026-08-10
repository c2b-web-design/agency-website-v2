# Session Handoff — 10 August 2026 (hover teal / Q5 stall)

**Read this first, then `project-intelligence/` as normal.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written** —
`live-work-protocol.md` §3a.

---

## ⛔ THE STANDING DIRECTIVE

**NEVER comment on how long Carl has been working.** Not the time of day, not the session
length, not a suggestion to stop or resume later. **Carl decides when a session ends and will
say so.** It was not broken this session.

---

## STATE OF THE TREE

**Clean, committed and pushed.** Head is `f96b600`.

`npx tsc --noEmit` clean. Lint at the recorded baseline: **1 problem (1 error, 0 warnings)** —
the known `enquiry-opening.tsx` reduced-motion effect, untouched. **The dev server was stopped
at the end of the session; a production build exists in `.next/`.**

---

## 🔴 START HERE — Q5 STALLS. OPEN, MEASURED, NOT DIAGNOSED

**Carl: *"Q5 stalls"*. He is right. Full record: `live-work/q5-stall-10-august.md` — read it
before touching anything, it will save a round.**

    production build, head e3a5b7c   596ms worst frame gap
    visible threshold                 ~50ms
    for scale — 9 Aug, after 3a7cf1f   86ms, and Carl approved it by eye

⚠⚠ **IT IS NOT THE HOVER WORK.** Both components were reverted to `7b056c2` (before any hover
teal existed) with everything else left current: **626ms**. That ground is covered — do not
start by suspecting the teal, the second texture or the rAF loops.

⚠ **THREE FIXES WERE TRIED AND ALL THREE MISSED** (rAF guard, deferred texture, cache-key
removal — 624/624/619ms). They are committed at `f96b600` because each is right in isolation,
and the code comments say explicitly that none is a remedy.

**The one piece of positive evidence** — CPU profile across the reveal:

    (program)                763.8ms
    getProgramParameter       74.6ms   <- shader link query
    forceContextLoss          35.0ms   <- a context being DESTROYED in the window
    getProgramInfoLog         16.5ms   <- shader link log

**Shader compilation during the reveal, which is exactly what `3a7cf1f` fixed** by keeping the
warm-up context alive 900ms past Begin. `forceContextLoss` at 35ms suggests something now tears
that context down early.

**Where to start:** bisect from `3a7cf1f` forward, **production build per arm**.

⚠⚠ **AND THIS IS THE PROCESS LESSON OF THE SESSION: A BISECT THAT CHANGES FILES ON A LIVE DEV
SERVER IS MEASURING THE SERVER.** An early bisect showed a convincing staircase (161 → 312 →
620ms) that appeared to convict the hover commits. It was Turbopack recompiling after each
`git checkout`. **Restart the server per arm, or build per arm.**

---

## ✅ THE HOVER TEAL IS DONE — and it was never broken

**`e3a5b7c`.** The answer text turns teal on hover, `rgb(160, 220, 218)`, read from
`.enquiry-pdepth-*` `.enquiry-phrase-answers` — the rail's own colour, because a card turning
teal is a promise about where that answer is going. Eases over ~1s (`LABEL_HOVER_TAU` 0.42).

Verified on the real GPU:

    motion enabled   red drop 9.6  (green 8.9, blue 8.0)
    reduced motion   red drop 39.0 (green 7.2, blue 12.0)

⚠ **NOT YET JUDGED BY CARL'S EYE.** He asked to see it and the session went to the Q5 stall
instead.

### ⚠⚠ THE FEATURE WORKED ALL ALONG. THE HARNESS WAS WRONG, TWICE.

An Architect question was raised over what turned out to be an instrument fault
(`architect-question-hover-teal.md`, `architect-answer-hover-teal.md`).

| the fault | why it lied |
|---|---|
| sampled the **brightest 6%** of pixels | that is the white relief halo from the faked extrusion, which is **identical in both textures** — only the glyph core takes the ink |
| ran at **deviceScaleFactor 2** | a ~12px glyph is too anti-aliased to resolve; at 6 the same crop is unmistakably teal |

⚠ **AND THE CROSS-CHECK FAILED THE SAME WAY** — the frames that "confirmed" white text were
captured at scale 2. **A visual check at a resolution where the effect cannot resolve is not a
cross-check.**

**The Architect's answer still earned its keep**: it killed the Builder's shared-uniform theory
by reading installed source, showed that **three of five "eliminations" in the question were
unsound** (two worthless — "no compile error" was silence configured by
`checkShaderErrors = false` at line 3563), and found the reduced-motion defect below.

### The real defect it found, now fixed

The hover ease ran in `useFrame`, which only ticks while something invalidates the canvas — the
traveller's rAF loop was doing that **by accident**. Under `prefers-reduced-motion` the traveller
parks, **so the teal would never have arrived**. Silently, for the users most likely to need a
clear affordance, and invisible to every existing harness because they all run with motion on.
It now has its own rAF that stops when settled. `verify/hover-reduced-motion.mjs` covers it.

---

## ⚠ THE `frameloop` REGRESSION — recorded, not fixed, and it is Carl's call

**`7b056c2` — the approved resting light — turned a demand-mode canvas into a continuous 60fps
one.** `TravellingLight` runs an unconditional rAF loop calling `invalidate()` every frame.

**The file's own header at line 18 still claims** *"`frameloop="demand"` AND IT STAYS THAT WAY…
nothing needs a continuous rAF loop."* **That is now false.** A phone renders WebGL for as long
as the corridor is open.

**Not fixed because throttling the traveller is a visual change Carl has not seen.** It needs to
be his decision, not the Builder's.

---

## Still open, unchanged

- **The floating faces / black edges.** Carl established it is a REGRESSION: *"the card in
  general was approved. If it had dark edges i would of flagged it."* Measured: with the whole
  static rig at zero the face still reads 44 of 58, so ~77% is baked albedo plus an unscaled
  sheen lobe. ⚠ **`verify/card-edge.mjs` does NOT detect it** — approved-HEAD and current both
  read face 56, cliff 5px. Do not use it to certify a fix.
- **Card 2 is the weakest card** at swing 9.9 — centre-row, never gets a close corner pass.
- **`GLASS_CLEARCOAT` = 0, inert.** The grid that dismissed it ran on the OLD geometry.
- **The ground plane** — stashed as `ground-gradient-attempt-7aug`.
- **~2.4MB of three + fiber loads eagerly.** `next/dynamic` flagged, not done.
- ⚠ **SHADOW.** Seventh session parked.
- ⚠ **ACCESSIBILITY DEBT:** the answer text is a texture, not in the a11y tree. Mandatory when
  these become real controls.
- **`chunk-scope.json` is absent and that is its resting state** — never committed, fail-open is
  the hook's documented design. Nothing to restore.

---

## The three states

| state | status |
|---|---|
| **Resting** | ✅ approved `7b056c2` — *"thats a lot better"* |
| **Hover** | ✅ built and verified `e3a5b7c` — **awaiting Carl's eye** |
| **Selected** | filament warms off → amber → stops halfway between amber and red. **Next.** |

---

## How to look at it

```
npm run dev
http://localhost:3000/start                  press Begin, hover a card
node verify/q5-stutter.mjs                   the stall, 3 runs
node verify/hover-teal.mjs                   the teal, motion enabled
node verify/hover-reduced-motion.mjs         the teal under reduced motion
```

⚠ **MEASURE HEADED, WITH `--enable-gpu`.** Headless substitutes SwiftShader and this project has
already published numbers that never touched a GPU. Every harness prints the renderer and aborts
on a software rasteriser.

⚠ **AND `verify/hover-teal.mjs` MUST STAY AT deviceScaleFactor 6.** At 2 it returns a false
negative on a working feature — the reason this session lost a round.

---

*10 August 2026. The hover teal is built and verified but unjudged; the Q5 stall is the open
subject and the record for it is `q5-stall-10-august.md`. The transferable lesson from today is
that two separate stretches went to instruments that lied — a harness sampling the wrong pixels,
and a bisect measuring a recompiling dev server. **Check the instrument before believing the
result**, and reach for the wholesale revert before the targeted fix.*
