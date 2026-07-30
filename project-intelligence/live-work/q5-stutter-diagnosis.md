# Q5 Stutter — Measured Diagnosis

**Date:** 29 July 2026. **Corrected and completed 30 July 2026.**
**Status:** **RESOLVED — Carl confirmed by eye, 30 July 2026: *"Success. Smooth."***

> ## ⚠ THE 29 JULY FIX WAS INCOMPLETE. Read this before the original below.
>
> **The cause was right. The boundary was wrong.** `Q5_REVEAL_CLEAR_MS` was derived from the
> wrong animation, so the Three.js work was moved out of the measured window instead of out of
> the phrase.
>
> **Two animations start when Begin is pressed, and they are not the same length:**
>
> | Rule | Duration | What it is |
> |---|---:|---|
> | `.enquiry-q5-block` | **700ms** | opacity fade of the whole block |
> | `.enquiry-q-text-reveal` | **1300ms** | horizontal mask that wipes the PHRASE in |
>
> **The phrase is what visibly stutters, so 1300ms is the boundary.** The 29 July fix used 700.
>
> ### How it was caught, and it is the useful part
>
> **Carl, 30 July, on a production build, first load after a server start:** *"it stuttered on
> the h of the word here. Originally it was on the Wh of the first word What."*
>
> ⚠ **A MOVED SYMPTOM IS NOT A FIXED SYMPTOM.** 700ms is ~54% through a 1300ms wipe — mid-phrase,
> exactly where "here" arrives. The work was pushed out of the first 700ms and into the
> remaining 600ms of the wipe. **Where the stutter lands tells you where the work landed.**
>
> ### ⚠ And the harness confirmed the bug instead of catching it
>
> `verify/q5-stutter.mjs` reported **0/3 clean** while the defect was plainly visible, because
> its `Q5_REVEAL_MS` was **also 700**. **The check and the fix shared one assumption, so the
> verification could not fail in the way it needed to.**
>
> **This is a sharper version of the lesson this project already holds.** "Measure before
> accepting a hypothesis" was followed — and still produced a false pass, because the
> *instrument* carried the error. **A harness derived from the same constant as the fix is not
> an independent check.** Carl's eye was the only thing outside the shared assumption.
>
> ### The correction — 30 July 2026
>
> `Q5_REVEAL_CLEAR_MS` **700 → 1300**, read off `.enquiry-q-text-reveal`.
> `Q5_REVEAL_MS` in the harness **700 → 1300**; `WATCH_MS` 2600 → 3400.
> Comments corrected in both files, including the one that conflated the two animations.
> **No logic changed. No approved visual layer touched.**
>
> **Verified `.enquiry-q-text-reveal` is disabled under `prefers-reduced-motion`**
> (globals.css:1420), so the guard's reduced-motion bypass remains correct.
>
> ### Measured across the FULL 1300ms phrase — production build, 3/3 runs
>
> | | 700ms boundary | **1300ms boundary** |
> |---|---:|---:|
> | WebGL context created | +825–841ms (inside the wipe) | **+1438–1446ms** |
> | First shader call | inside the wipe | **+1484–1508ms** |
> | WebGL ms inside the phrase | present | **0.0ms** |
> | Long-task ms inside the phrase | present | **0ms** |
> | Worst frame gap | 81ms | **18–36ms** |
> | Frames rendered | 35–38 | **78** |
>
> The single 36ms gap sits at **+29ms** — the click-to-first-frame boundary, not mid-phrase.
> Context lands ~140ms clear of the 1300ms boundary.
>
> ✅ **Carl confirmed by eye on a cold first load, 30 July 2026: *"Success. Smooth."***

**Original diagnosis, written before the fix, preserved below.**
**Harness:** `verify/q5-stutter.mjs` (committed). Two throwaway probes were used for the
profiling below and deliberately not kept — see "What is reproducible" at the end.

---

## The verdict in one line

**The recorded hypothesis was half right and half wrong.** The pre-warm *is* the cause — but
**not** because of shader compilation, which was the specific mechanism blamed. It is
Three.js's own CPU-side initialisation and geometry construction.

---

## What the record said, and what measured

`current-sprint.md` and the Day 4 handoff both name the leading hypothesis:

> *the WebGL pre-warm's 2000ms fallback firing on a cold load* … *shader compilation lands on
> Q5.*

| Claim | Measured | Verdict |
|---|---|---|
| Pre-warm work lands inside the Q5 reveal | **3 of 3 runs.** WebGL context created at +127 / +207 / +271ms | ✅ **TRUE** |
| Shader compilation is the expensive part | **0.1ms / 0.0ms / 0.2ms** inside the reveal | ❌ **FALSE** |
| GPU API work is the expensive part | **0.1ms total.** One `texImage2D` call above 0.05ms | ❌ **FALSE** |

**The frame gaps are real and visible:** **113ms**, 47ms, 65ms inside the 700ms reveal.
Frames rendered during the reveal: 28 / 36 / 33, against ~42 for smooth 60fps.

---

## What is actually blocking the thread

CPU profile (CDP sampling profiler, 0.1ms interval) across the reveal:

| Self time | Function | Source |
|---:|---|---|
| **55.4ms** | **`onFirstUse`** | `three.module.js` — Three.js lazy first-touch initialisation |
| 13.7ms | `computeBoundingSphere` | `three.core.js` |
| 8.0ms | `getContext` | `three.module.js` |
| 6.4ms | `getExtension` | `three.module.js` |
| 4.0ms | `WebGLRenderer.setSize` | `three.module.js` |
| 4.0ms | `computeVertexNormals` | `three.core.js` |
| ~3ms each | `addUV`, `addVertex`, `createBuffer`, `setProgram`, geometry builders | three / fiber |

**It is CPU work — library initialisation and geometry construction — not GPU work.**

### When it lands

Three.js/fiber main-thread work, binned from the Begin click:

```
  +200- 250ms    5.2ms
  +300- 350ms   33.9ms
  +350- 400ms   59.0ms
  +400- 450ms   70.0ms   ← peak
  +450- 500ms   29.5ms
```

**~197ms of JavaScript between +200ms and +500ms**, entirely inside the 0–700ms window in
which `.enquiry-q5-block` is fading from `opacity: 0` to `1`. The phrase is mid-animation
while the main thread is busy building a 3D scene.

---

## Why it is intermittent, and why "first load after a server start"

**Nothing about the schedule is random.** Pressing Begin sets `stage="active"`, which does two
things in the same instant:

1. `.enquiry-q5-block` starts its **700ms** opacity animation (`globals.css`)
2. `questionnaireStarted` flips true, making the pre-warm's
   `requestIdleCallback(warmWhenSafe, { timeout: 2000 })` eligible
   (`enquiry-opening.tsx`)

`requestIdleCallback` is the correct primitive and fires only when the thread is genuinely
free. **On a warm load it finds a real gap and the work is invisible.** On a cold load —
Turbopack still compiling, modules not yet parsed, nothing cached — **there is no idle gap, so
the 2000ms deadline forces the callback to run regardless**, and it lands on the reveal.

That is exactly the observed pattern: **stutters on the first load after a server start, then
runs clean.** The intermittency is a property of how busy the thread is, not of the code path.

⚠ **The measurement above was taken with the HTTP cache disabled and a fresh browser context
per run, on a dev server that had never served `/start`.** That is why it reproduced 3 of 3
rather than intermittently. **A production build will be faster and may not reproduce at all**
— which is a caveat on severity, not on the diagnosis.

---

## ⚠ It reproduces on a PRODUCTION build — tested 29 July 2026

**This was the open question and it is now closed.** `next build` + `next start`, fresh
browser context per run, HTTP cache disabled, on a server that had never served `/start`.

| | Dev | **Production** |
|---|---:|---:|
| Worst frame gap in reveal | 113ms | **81ms** |
| Long-task ms in reveal | 176ms | **0ms** |
| Frames during reveal (of ~42) | 28–36 | **35–38** |
| WebGL context created | +127–271ms | **+139–169ms** |
| Runs with overlap | 3/3 | **3/3** |

**Production is better, and still not clean.** The change is in *shape*: long tasks fall to
**zero**, so the work no longer arrives as one 176ms block — it arrives as many small ones.
**But the frame gaps survive**, because the total work is unchanged and it still lands inside
the animation. A dropped frame is a dropped frame; **81ms is visible.**

**Same cause, confirmed by profile.** Minified `A` at **46.0ms** is `onFirstUse` (55.4ms in
dev); `computeBoundingSphere` (10.2ms) and `computeVertexNormals` (3.0ms) are unminified and
identical. **Production changes the magnitude, not the mechanism.**

**What this rules out:** "it is only a dev-server artefact" — the most attractive explanation,
and the one that would have made this not worth fixing. It is not that.

---

## What has NOT been established

- **Whether Carl's observed stutter is this stutter.** The symptom matches — ragged text
  during the phrase — and the frame gaps are large enough to see. But a measured 81ms gap and
  a reported ragged "W" are two observations, not proven to be one.
- **Behaviour on Carl's actual hardware.** All numbers are headless Chromium on this machine.
  A slower device would show more; the 27" monitor findings in the gold reference are a
  reminder that the measuring surface is not always the judging surface.
- **Any fix.** Nothing has been changed. Options exist and are not recorded here, because
  choosing one is Carl's.

---

## What is reproducible

`node verify/q5-stutter.mjs [runs]` — committed, and it reports the overlap as measured fact
or reports its absence. **It is written to be able to disprove the hypothesis**, and it
half did: the shader-compilation numbers in its own output are what refuted the recorded
cause.

The two deeper probes (GPU-API timing by function, and the CPU profile above) were throwaway
scripts run from `verify/` and deleted. **The numbers in this file are therefore a record, not
a reproducible artefact** — say so rather than implying otherwise. If they need re-checking,
the profiler approach is: CDP `Profiler.enable` → `setSamplingInterval(100)` → `start` →
click Begin → `stop`, then aggregate self-time by call frame.

---

---

## The fix

**One guard, in `enquiry-opening.tsx`. No choreography, no timing and no visual value was
changed.**

`Q5_REVEAL_CLEAR_MS = 700` — derived from `.enquiry-q5-block`'s existing 700ms declaration in
`globals.css`, exactly as `CHOREOGRAPHY_CLEAR_MS = 7100` is derived from the completion
animations. The warm-up callback now checks, **when it fires**, whether the reveal is still
running; if so it reschedules for after it clears.

**Why this shape and not another.** The pre-warm was already built to keep WebGL work off the
*completion* choreography, and that mechanism is correct and proven. **This is the same guard,
one stage earlier** — the stage its author did not anticipate, because the pre-warm predates
Three.js being on the page at all. Nothing new was invented; an existing pattern was extended
to the case it missed.

**Three supporting pieces**, each mirroring what completion already does:

| Piece | Mirrors |
|---|---|
| `activatedAtRef` — the instant Begin was pressed, in a ref | `completedAtRef` |
| `enterActive()` — the single shared entry into `active`, writing the ref **synchronously** before `setStage` | `enterComplete()` |
| The guard carries `!reducedMotion` | The completion guard's own reduced-motion condition |

⚠ **The reduced-motion condition is not decoration.** `.enquiry-q5-block` has
`animation: none` under `prefers-reduced-motion`, so waiting would stall the field for 700ms
guarding an animation that never runs. **That is precisely the defect the 24 July architect
review found** in the completion guard — a delay correctly derived from a choreography, then
applied even when the choreography was gated off. Verified here rather than assumed:
**+143ms under reduced motion.**

**Why `enterActive()` writes the ref synchronously.** A passive effect runs after commit and
paint, leaving a window in which the idle callback could fire, read a stale `null`, and do its
work inside the reveal. `completedAtRef`'s comment documents this exact race; the same closure
is used.

### What was verified, and what was not

| Checked | Result |
|---|---|
| Frame gaps and overlap, production build, 3 runs | **Clean, 0/3 overlap** |
| Reduced motion does not wait | **+143ms, correct** |
| Canvas still warm before completion | **+820ms on a fastest-possible run** |
| `tsc --noEmit` | **Clean** |
| `npm run lint` | **1 error — the recorded baseline, unchanged** |

**Not checked:** Carl's own hardware and eye; Safari's `setTimeout` fallback path (no
`requestIdleCallback`), which takes the same guard but was not exercised here.

---

*Measured because a plausible cause and a measured cause are different things. This page has
already produced one plausible cause that measured innocent — Three.js was blamed for the
opening delay and recorded 0 WebGL contexts during it. This time Three.js is guilty, but of a
different offence than the one it was charged with: not the GPU work everyone expected, but
the CPU cost of waking the library up.*
