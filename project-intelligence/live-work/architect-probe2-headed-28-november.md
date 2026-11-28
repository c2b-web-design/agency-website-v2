# Probe 2: headed, the overlapping split gate and side by side (28 November 2026)

**For the Architect,** following `architect-review-answers-28-november.md`, step 4. **Why it was run:** Carl saw the lag
in his own Chrome, in Incognito, on the production build: *"Om 3100 there is still a significaknt delay to the logos
apperance"*. Carl then said: *"proceed"*.

## Method

- **A temporary probe build** of `e561aed` (which includes the race fix), selected by `?warm=`. The probe code has been
  REMOVED: both files are byte-identical to `e561aed` again, checked by SHA-1.
- **The modes:**
  - **base:** as committed; the gate is the whole warm-up (`warmed`).
  - **splitov:** the logo's fade, with its depth child, gets its own `compileAsync(logo, camera, scene)`, **NOT awaited**.
    The warm-up's two gathers start alongside it. The logo's fade is gated on that call alone. This is the review's §2
    split "at its best".
  - **side:** the warm-up's gathers made one per visible top-level object, side by side; the gate is `warmed`.
- **The tool:** `hero-logo-build-28-november.mjs` with `HEADED=1`. Five INTERLEAVED rounds (base, splitov and side in
  every round), cold then a return visit in a persistent profile, production. All 30 loads ran on AMD RDNA 2, and the
  race hit none of them.
- **New in the tool:** the length of the frame on which the fade first draws, and of the frame of the swap (the opening's
  end), plus the longest of the 3 frames after each, and any bind group or synchronous pipeline made on those frames.
  This answers the review's §3.

## Results (medians; worst in brackets; s after the first paint)

**Cold:**

| mode | first frame | due | drawn | LATE | gate ready | warm-up done | swap margin | touchdown margin | fade / opaque took |
|---|---|---|---|---|---|---|---|---|---|
| base | 3.45 | 9.81 | 10.65 | **0.76 (1.03)** | 10.64 | 10.64 | +3.36 (+3.07) | +3.93 (+3.93) | 4.44 / 4.18 |
| **splitov** | 3.20 | 9.56 | 9.79 | **0.20 (0.23)** | 8.76 | 8.89 | **+1.98 (+1.65)** | **+4.67 (+4.33)** | 5.40 / 4.98 |
| side | 3.38 | 9.74 | 9.98 | 0.26 (**1.94**) | 9.59 | 9.59 | +2.42 (+1.98) | +4.29 (+3.93) | 5.41 / 4.94 |

**The rounds, cold** (LATE, s):

| | R1 | R2 | R3 | R4 | R5 |
|---|---|---|---|---|---|
| base | 0.81 | 0.76 | 0.76 | 1.03 | 0.52 |
| splitov | 0.23 | 0.19 | 0.20 | 0.20 | 0.20 |
| side | 0.29 | 0.24 | **1.94** | 0.26 | 0.23 |

**Return visit:** every mode is on time. LATE: base 0.09, splitov 0.14 (0.39), side 0.19. This is the rounding floor,
~0.1 s.

**The frames:** in every mode and condition, the fade's first-draw frame and the swap frame were one normal frame
(16.4–17.0 ms; the worst 17.2 ms). No bind group and no synchronous pipeline was made on either. Of the 3 frames after,
the worst was one 49.8 ms frame in **base** after the fade; in splitov the worst was 33.3 ms (cold) and 17.2 ms.

## What it shows

1. **The overlapping split gate puts a first visit ON TIME, headed:** 0.19–0.23 s in all five rounds, ~0.1 s above the
   return-visit floor. Base was 0.52–1.03 s late.
2. **Its swap and touchdown are safe in every round.** The opaque is built ≥1.65 s before the swap, and the liquid and
   heat plane ≥4.33 s before touchdown. Building the rest ALONGSIDE the fade, not after it, is what fixes the probe 1
   failure (−2.2 s at the swap). Neither fallback in review §4 is load-bearing on these loads.
3. **No hitch.** The fade begins and the swap happens on normal frames, with nothing built on them.
4. **The fade compiles more slowly alongside the opaque** (5.40 s against 4.44 s in base), but it is asked for first and
   alone in its call, so it is ready ~1.9 s sooner than the whole warm-up.
5. **Side by side's tail is not cut:** R3 was 1.94 s. Its median was 0.26 s. Not recommended.
6. **Headed, the 3D's first frame is still ~3.1–3.5 s** (headless ~2 s). This is unexplained; the logo's due time moves
   with it.

## For the ruling

**Recommended: the overlapping split gate, to plan review.** It is structural (5a): it changes what the opening waits
for. That is Carl's call (Option D, 26 November). It needs no new material and no change to the look. The plan must still
answer review §4:
- **If the opaque is not built by the swap:** measured never, worst +1.65 s, but not asserted in code. A guard is
  needed: hold the fade material past the swap.
- **The floor web is gated on `warmed`.** It stays gated on the whole warm-up, which is unchanged.
- **Touchdown is guarded today by timing only** (+4.33 s at worst). It needs a guard in code, or the margin stated as
  unasserted.
- **The full-story check (§3.1):** the warm-up's gathers are unchanged in splitov, so after the logo the story is built
  exactly as in base. The one new call is the logo's own, and it matched the draw: one pipeline per material per load.

## Not watched

- Carl's own Chrome and profile (Playwright's headed Chrome on this PC).
- Other GPUs.
- Why the headed first frame is ~1.3 s later than headless.
