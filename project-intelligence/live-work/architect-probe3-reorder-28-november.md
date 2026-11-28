# Probe 3: reorder only against the split gate (28 November 2026)

**For the Architect,** answering `architect-review-probe2-28-november.md`, step 2. Carl: *"proceed"*.

## Method

- **A temporary probe build** of `e561aed`.
  - `?warm=reorder`: the fade (with its depth) gets its own `compileAsync(logo, camera, scene)`, first and not awaited.
    The gate is left as `warmed`.
  - `?warm=splitov`: the same first call, with the logo's fade gated on that call alone.
- **Five INTERLEAVED headed rounds,** production, persistent profiles (cold, then a return visit). All 10 loads ran on
  AMD RDNA 2, with no race.
- **The probe is REMOVED:** both files are byte-identical to `e561aed` (SHA-1).

## Results (s after the first paint; LATE = drawn − due, ~0.1 s rounding)

**Cold, round by round** (LATE / warm-up done / due):

| round | reorder | splitov |
|---|---|---|
| R1 | **0.65** / 10.37 / 9.81 | 0.21 / 8.47 / 9.63 |
| R2 | 0.21 / 8.15 / 9.24 | 0.19 / 8.22 / 9.31 |
| R3 | 0.21 / 10.07 / 10.59 | 0.21 / 9.35 / 10.21 |
| R4 | 0.21 / 9.57 / 9.48 | 0.19 / 8.09 / 9.13 |
| R5 | **0.31** / 10.91 / 10.80 | 0.21 / 8.80 / 9.76 |

**Medians, cold:**
- reorder: LATE 0.21 s (worst 0.65); warm-up done 10.07; swap +1.47 (+1.30); touchdown +4.13 (+3.95).
- splitov: LATE 0.21 s (worst 0.21); warm-up done 8.47; swap +2.49 (+2.31); touchdown +5.16 (+4.98).

**Return visits:** both on time (0.14–0.18 s).

**The frames, cold:**
- reorder: the fade's first-draw frame worst **49.9 ms**. This is LOGO-FADE-FRAME (`open-defects.md`), still present.
- splitov: worst 16.9 ms (the next 3 at worst 17.3). This repeats probe 2, where splitov's worst was 33.3 ms.
- Neither made a bind group or a synchronous pipeline on the fade frame or the swap frame.

## What it shows

1. **The hypothesis does not hold reliably.** With reorder only, the warm-up ended AFTER the logo's due in 3 of 5 rounds
   (R1, R4, R5), and the logo was late in two of them (0.65 s and 0.31 s). By the review's own rule ("later in any round →
   the split gate earns its place"), **the split gate earns its place.**
2. **The split gate repeats probe 2:** on time in every round (0.19–0.21 s, against ~0.1 s of rounding), and the warm-up
   still ended before the due in all five. The swap margin was ≥ +2.31 s and touchdown ≥ +4.98 s.
3. **The split gate also removed LOGO-FADE-FRAME on these loads.** Reorder only kept it (49.9 ms).
4. **Reorder's warm-up ran ~1.6 s longer at the median than splitov's,** from the same first call. Unexplained. One
   possibility, unverified: in splitov the logo is drawn (fading) during the warm-up's tail, in reorder it is not, and the
   orders of the remaining builds differ.

## Next, by the review's order

Step 3: **plan the split gate** with the review's §2 guards, for plan review and Carl's ruling on what the opening waits
for (Option D).

The plan must answer:
- **The swap guard:** hold the fade material if the opaque is not built, and say what the story looks like in it.
- **A touchdown guard in code.**
- **The floor web,** which pops in if `warmed` comes after the logo. Measured: the warm-up ended before the logo was drawn
  in all 10 splitov cold rounds of probes 2 and 3.
- **The full-story check** is not needed: the warm-up's gathers are unchanged.
