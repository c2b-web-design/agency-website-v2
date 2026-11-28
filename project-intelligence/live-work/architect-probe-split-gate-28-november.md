# The split-gate probe: measured (28 November 2026)

**For the Architect,** answering `architect-review-measurement-28-november.md`, §2, §3 and step 3 of "Next". Carl, the same
day: *"Lets build the instrument to measure. Make dure we are on the right track."*

## How it was measured

- **A temporary probe build** of `ae134a4`. A `?warm=` switch selected the mode; with no switch the page behaved as
  committed. Two extra marks were added: `hero:OpeningDone` (the fade → opaque swap) and `hero:Touchdown`.
- **The probe code is REMOVED.** `hero-scene.ts` and `hero-bench.tsx` are byte-identical to the commit again (SHA-1
  checked), and the probe's production build is no longer served.
- **The tool:** `live-work/scripts/hero-logo-build-28-november.mjs`, run with `QUERY`, headless and unfilmed, a persistent
  profile per run, cold then a return visit.
- **Five INTERLEAVED rounds:** each round ran all four modes back to back, so drift on this PC (measurable within the
  hour) hit every mode alike.
- **Every load ran on AMD RDNA 2.** No load was hit by the race.

The modes:
- **base:** as committed. The gate is `warmed`, the whole warm-up.
- **split:** the review's recommendation. The logo's fade and its depth are built first, alone (a targeted
  `compileAsync(logo, camera, scene)`); the logo's fade is gated on that build; the rest are built behind it.
- **side:** the warm-up's builds one per object, side by side. The gate is unchanged (`warmed`). This take was withdrawn
  earlier on the FILMED instrument.
- **story:** the warm-up in the story's order, with the fade gated on stage A (the fade, the opaque material and the floor
  web). Also withdrawn earlier on the filmed instrument.

## Results (medians of 5; the worst in brackets; s after the first paint)

**Cold:**

| mode | first frame | due | drawn | LATE | gate ready | warm-up done | swap margin | touchdown margin | fade / opaque took |
|---|---|---|---|---|---|---|---|---|---|
| base | 2.10 | 8.46 | 8.90 | 0.36 (2.39) | 8.89 | 8.89 | +2.98 (+2.58) | +3.94 (+3.93) | 4.70 / 4.45 |
| **split** | 2.12 | 8.48 | 8.66 | **0.16 (0.18)** | **7.73** | **12.17** | **−2.19 (−4.21)** | **+0.53 (−1.49)** | 4.92 / 4.10 |
| **side** | 2.04 | 8.40 | 8.70 | **0.30 (0.40)** | 8.09 | **8.09** | +2.65 (+2.15) | +4.71 (+4.28) | 5.10 / 4.70 |
| story | 2.21 | 8.57 | 8.87 | 0.35 (0.95) | 8.79 | 9.58 | +2.17 (+1.89) | +3.74 (+3.72) | 5.95 / 5.60 |

**Return visit:** every mode is on time, LATE 0.13–0.24 s; the warm-up is done at 2.5–3.0 s.

What the columns mean:
- **due:** the subtext's last letter in, computed from the first frame by the scene's own formula. It is ~1 frame
  coarse: on a return visit, when every gate opens ~5.5 s early, LATE still reads **~0.13 s**. Read LATE against that
  floor.
- **swap margin:** the opening's end minus the opaque material's ready time. Positive means the opaque was built in time.
- **touchdown margin:** touchdown minus the time the liquid and heat plane were built. For story that is `WarmB`; for the
  others it is the whole warm-up.

## What it shows

1. **The split gate puts the logo on time cold:** LATE 0.16 s, at the rounding floor, and the worst only 0.18 s. **But
   it delays everything behind it.** Building the fade first, alone, takes as long as building it alongside the opaque
   (4.9 s), so the rest only starts after it. The warm-up ends at **12.2 s instead of 8.9 s**. As a result:
   - **At the swap, the opaque material is NOT built** (−2.2 s at the median, −4.2 s worst). Drawn then, three skips it
     and the logo would vanish for 2–4 s, unless the swap is held (review §4: keep the fade material, with its listed
     differences: sorting, alpha-to-coverage edges, shadows).
   - **At touchdown, the liquid and heat plane are not always built** (worst −1.5 s). It would need a guard.

   The review's estimate (the fade ready at ~7.1 s, a ~1.2 s margin, "no change to the look") came out as the gate at
   7.73 s (a ~0.75 s margin), with **both** fallbacks now load-bearing on every cold first visit.
2. **Side by side is the take the filmed instrument wrongly ruled out.** Unfilmed, it ends the warm-up **0.8 s sooner**
   (8.09 against 8.89). LATE is 0.30 s at the median and **0.40 s at worst** (base: 2.39 s at worst), with both margins
   safe and comfortable.
   - It changes no gate, no material and no look. It is one `compileAsync` per visible top-level object instead of one
     over the scene, the same pattern as the bench's first frame.
   - Against the ~0.13 s floor, it is **~0.2 s** late at the median.
3. **The story order gains nothing** (LATE 0.35 s, worst 0.95 s).
4. **Base, the committed version, was mostly on time in these runs** (median 0.36 s, about 0.2 s above the floor). Its
   risk is the occasional slow load (2.39 s), which side by side also cut, to 0.40 s worst.

## The Builder's reading, for the ruling

- **"On the right track":** yes, the logo's build is the whole problem, and it is the GPU's compile. Return visits are on
  time in every mode.
- **For the cold first visit,** the measured choices are:
  - (a) **side by side**: the simplest; not structural; ~0.2 s late at the median, 0.4 s at worst; no new risk.
  - (b) **the split gate**: on time, but the swap and touchdown fallbacks become necessary on every cold load. That is a
    structural plan, with the visible-swap questions of review §4.
  - (c) **side by side AND split together**: not measured. Side by side may shorten the rest enough to restore the swap
    margin.
- What the opening waits for is Carl's call (review §3).

## Not watched

- Carl's own Chrome and profile (Playwright's, headless).
- Other GPUs and devices.
- The race: the probe ran headless, where it is rare. Headed, it hit 2 of 4 loads; its fix awaits Carl's word.
