# The logo's build: the amended measurement (28 November 2026)

**For the Architect,** answering `architect-review-logo-build-28-november.md` §2 (*"the amended measurement"*). Read-only.
The tool is `live-work/scripts/hero-logo-build-28-november.mjs`. The build measured is production, of commit `ae134a4`,
served by `next start`. Each run used a fresh **persistent** profile: a cold load, then the browser closed and the same
profile reopened for the return load. Each load ran until the warm-up was done and the logo was first drawn. All figures
are **medians of 5**.

## ⚠ Corrections to the note (v1.0) first

Two of the note's §2 figures were artefacts of the instrument, not facts about the page. They came from
`hero-flow-film-28-november.mjs`.

- **The return visit.** It ran in a non-persistent browser context, which did not keep Chrome's shader cache. In a
  persistent profile a return visit **is** fast (below). The review's §2.3 doubt was right.
- **The "12–16 s" for the logo.** That was measured while screencasting every frame, which costs the GPU and the main
  thread time. Unfilmed, the logo's first draw is ~9 s on a cold first visit (below).

The same corrections are recorded in D-101.

## The answers

| | Cold first visit | Return visit |
|---|---|---|
| prefilter done (after paint) | 1.58 s | 1.49 s |
| 3D first frame | 2.01 s | 1.86 s |
| warm-up | 2.09 → 9.02 s (6.94 s) | 2.16 → 2.69 s (0.50 s) |
| **the logo first drawn** | **9.03 s** (8.52 / 8.88 / 9.03 / 9.70 / 12.12) | **8.40 s** (8.27 / 8.29 / 8.42 / 8.78 / 8.40) |
| main thread busy over the warm-up | 1.85 s (26 %) | 0.46 s (91 %) |
| GPU process busy over the warm-up | 6.94 s (100 %) | 0.50 s (100 %) |

The logo is due when the subtext is in. With the 3D's first frame at ~1.9–2.0 s, that falls at ~8.3–8.5 s.

- **Return visit:** the logo is on time. The warm-up is done ~5.7 s before the logo is due; the logo waits for the subtext,
  as Carl's rule says.
- **Cold first visit:** the median is ~0.6 s late. One run in five was 12.1 s, the slow outlier this PC shows.

## Per material (cold)

| | WGSL (fragment / vertex) | asked (s after `hero:Warm`) | took (async pipeline) | ready |
|---|---|---|---|---|
| opaque | 76.2 KB / 11 KB | 0.56 | 4.68 s | 5.40 |
| fade | 75.8 KB / 11 KB | 1.81 | 4.73 s | 6.65 |
| the fade's depth | 2.5 KB / 8.9 KB | 6.65 | 0.29 s | 6.94 |

- On a return visit every logo pipeline takes 0.01–0.02 s.
- **No logo pipeline was made synchronously** in any of the 10 loads.

## What this settles

1. **(ii), not (i).**
   - Cold: the main thread is idle for three-quarters of the warm-up, while the GPU process is busy throughout.
   - Return: the same pipelines take 0.01 s, so Chrome caches them.

   The cost is the GPU's compile of two ~76 KB shaders, at ~4.7 s each, overlapping.
2. **The review's §1 is confirmed.** The fade and the opaque material are two separate full compiles. The fade is asked
   for ~1.25 s after the opaque, and is ready ~1.25 s after it.
   - Why the opaque comes first, though `warmScene` gathers the fade first: each `compileAsync` call processes its OPAQUE
     objects before its TRANSPARENT ones, one at a time (three r185, `Renderer.compileAsync`). In the first gather the logo
     wears the transparent fade, so it waits behind every opaque object in the scene. In the second it is opaque, so it
     comes early.
   - The fade is the one the logo's appearance needs, so this order puts it LAST.
3. **The depth part is asked for only once the fade is ready** (+6.65 s), in every run. three's per-call processing is
   serial, so the depth waits in the fade's queue. It is cheap (0.29 s), but it sits on the logo's critical path.
4. **Route D's bound** (review §3): the prefilter is done at ~1.5–1.6 s after the paint, and the warm-up starts at
   ~2.1 s. Starting the logo's build at the prefilter's end would gain at most ~0.5 s.

## For the Architect's ruling on A′

- The cold shortfall is ~0.6 s at the median.
- A′ would take the opaque material's 4.7 s compile off the logo's path. The fade would then compile alone, which should
  be faster than two overlapping compiles, though this is unmeasured.
- Reordering alone may also close most of the gap, by building the fade (and its depth) before the opaque. That is not
  structural. It is unmeasured too.

## Also found: a race in today's committed work (a fault, flagged)

In 1 of 16 production loads today (the smoke run), the logo entered the scene before the bench's first-frame gather began.
The first frame's build then included the logo's **opaque** material (asked 3.9 s before `hero:Warm`), and the 3D's first
frame came at **7.3 s** instead of ~2 s.

- Cause: `hero-bench.tsx`, `start()` gathers every visible top-level object. The logo is added visible (`scene.add(logo)`)
  and hidden only by `update`, which has not run yet before the first frame.
- Carl's to schedule. It is not fixed here.

## Not watched

Carl's own Chrome and profile (all of the above is Playwright's Chrome, headless); other GPUs and devices; what inside the
GPU process the time is (Dawn's translation vs the D3D compiler).

---

## Addendum: the review's §1 and §6 answered (28 November 2026, later)

Same tool, now with the GPU ADAPTER logged on every load, and two switches (`HEADED=1`, `SCREENCAST=1`) so that ONE
condition changes at a time. ⚠ Premise check: the films and this tool were BOTH headless (Playwright's default), so
"headless and unfilmed changed together" did not hold. The variables between them were the screencast, the context
(non-persistent vs persistent) and the trace.

- **The adapter, every load (24 of 24):** `amd / rdna-2`, not the fallback. This is the PC's own GPU.
- **(a) headless, unfilmed, 5 runs (a repeat):** the logo at 8.84 s cold (8.42 / 8.60 / 8.84 / 9.07 / 11.17) and 8.25 s
  on return. Fade 4.95 s, opaque 4.60 s. Main thread 27 %, GPU process 100 %.
- **(b) the films' SCREENCAST ON, nothing else changed, 3 runs:** the logo at **14.12 s** cold (13.51 / 14.12 / 15.59)
  and 9.19 s on return. Each shader's compile went from ~4.8 s to **7.1–9.2 s**. **Isolated: the films' 12–16 s was the
  screencast.**
  - It follows that any capture that films every frame (a screen recording during a film take, too) may slow the
    logo's compile. Unmeasured for OBS.
- **(c) HEADED, unfilmed, 2 runs:** the compile times are the same as headless (fade 4.35–4.65 s, opaque 4.50–4.69 s).
  ⚠ **But THE RACE hit 2 of 4 headed loads** (cold run 1, return run 2): the opaque logo was built in the first frame's
  gather. The 3D's first frame came at 7.57 / 6.88 s, the logo at 14.09 / 13.34 s.
  - A race-hit load also leaves the next load's opaque uncached (3.81 s on return run 1).
  - Headless, it hit 1 of 26 loads. Headed is the way Carl's Chrome runs.
- **§6, the columns:** ASKED = when the pipeline was requested, s after `hero:Warm`. TOOK = request to resolve.
  READY = resolve, s after `hero:Warm`. Each is the MEDIAN across runs taken on its own, so asked + took need not equal
  ready. The tool now prints this.

**The race fix, for Carl's word (the review's §5).** The file is `components/hero/hero-scene.ts`. The change is one line:
`logo.visible = false` before `scene.add(logo)` (line 1773). What depends on the logo's visibility at that moment:

1. The bench's first-frame gather (`hero-bench.tsx`, `start()`) takes visible top-level objects. Hidden, the logo is left
   out, which is the fix.
2. `update`: `settled` is set in the SAME block (line 1783), so from the first frame `logo.visible = emitted < 1` (line
   2807) makes it visible, and the opening hides it until its fade (line 2879). Unchanged from the first `update` on.
3. `warmScene` and `warmShadow` show it for their gathers and restore the value they kept. A hidden value restored is
   reset by the next `update`.
4. `replayArrival` sets it visible explicitly.
5. The cloth's collider reads it (line 2960) only inside `update`, after the lines above.
