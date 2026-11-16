# Structural note: the logo's temperature during the wash (v1.1, 16 November 2026, session 3)

**Status: BUILT on Carl's word, 16 November 2026, session 3: *"Just build it. components/hero/hero-heat.ts Authorised to
create and use. 1. a"*. Not approved by eye yet. The Architect has not reviewed it (Carl chose to build first).** v1.1
(at the end) records the build and corrects one fact in "the question". Workflow 5a: it adds STATE that carries from frame to frame, and a new GPU resource (a
compute pass and its textures). Approved to build by Carl (D-101, end of session 2: *"yes, but in the next session ... it
will be built from the Home position"*). This note is about the SHAPE of the build; it goes to the Architect through Carl.

## The problem (seen, ruled)
Carl, 16 November 2026, session 2: *"The stright lines do not look natural during the wash, either through the rain or with
rapid cooling."* Today the face's red → platinum blue is a pure function of two inputs per point: its depth below the top of
its run (the run-off map, `RUNOFF`, per vertical strip) and the share of rain landed (`wash`). It has no memory, and no heat
passes between neighbours. Two strips side by side with different run lengths flip at different moments, which gives the
ruler line. Stills before the change, from Home: `scratchpad/wash-before/` (wash 0.25 / 0.5 / 0.75 / 1; story 30.1, 31.3,
32.5, 34.8 s; the first drop lands at 26.3 s).

## The proposal (route A)
**A TEMPERATURE FIELD for the face, simulated on the GPU, stepped on the story's clock.**

- **The grid:** the run-off map's frame (the logo's local x, y at 2 cells per cm). One value per cell, half-float. Two
  storage textures, ping-ponged. The front and back faces share it, which assumes the metal's thickness is thin against
  the distances heat travels here.
- **Each step**, per cell inside the ink:
  1. **Cools into the air**, everywhere and slowly (the logo cools AS AN OBJECT, Carl).
  2. **Cools faster where WET.** "Wet" is today's run-off front (`reach − belowTop − rag`, the same quantity that drives
     the colour now), so the water arrives exactly where and when it does today. Only the colour stops following it
     directly.
  3. **Conducts to its neighbours**, by diffusion through the ink only. Its edges are insulated, so no heat crosses empty
     space between letters. This is what softens the boundaries and lets them wander.
- **Physics, as the starting point (values are takes):** metals' thermal diffusivity is ~1 cm²/s (aluminium ~0.97, copper
  ~1.1). Over 2 s that softens an edge over ~3 cm at the logo's scale. It is a starting value; the goal decides the final
  one.
- **Fixed sub-steps** (~2 per 1/30 s frame; the explicit scheme is stable while `dt·D/dx² ≤ 0.25`), so a frame-stepped
  film and live playback give the same field.
- **Reset** on `replayArrival` and whenever the wash is 0.
- **Compiled in the background** by the existing `precompileCompute` (`hero-steam.ts`), so no new compile stall.

## What it drives (Workflow 5b: everything `cooled` drives today)

| Today driven by `cooled` | After |
|---|---|
| The colour, red → platinum blue | **The temperature** (the change) |
| Roughness, the logo's → `COOLED` | The temperature (it is the metal's state, the same object) |
| The reflection, studio → judging studio | The temperature |
| The ACES mix on the logo's output | The temperature |
| The clear coat's strength and its running-water normal | **Unchanged: the WATER (the front)**. Water runs in streaks; the coat stays where the water is. |
| `flowing` (the ripples ease into beads) | Unchanged (the wash) |
| The logo's own key light, `1 − wash` | Unchanged in this chunk |
| The steam, × `1 − wash` (one number for the logo) | Unchanged in this chunk; **next:** the steam's emitters read the local temperature (the steam follows the red where it is) |

**Exact at the start:** until the first drop lands the field is 1 everywhere and the colour is mixed by 0, so every frame
before the rain is unchanged. Null control: references made this session from the current code (grid off) at story 1.0,
25.3 and 26.2 s, Home and close. Three of the four stills match exactly run to run; the Home lean varies by up to 37 levels
in ~1,100 px between runs of the SAME code (the first shot after load), and that is its noise floor.

**Exact at the end:** once every cell is below the colour's threshold, the logo is the same platinum blue as today. Phase 3
starts from the same frame.

## ⛔ A QUESTION FOR CARL (it changes WHEN the visitor sees something)
Today the last red goes at a wash of exactly 1, the last drop (story 34.8 s, take 2). With a temperature, the last place
the water reaches is still hot when the rain stops; real metal keeps cooling after the rain. Two options:
- **(a) Let it finish naturally**: the last red fades a little after the last drop, tuned to ~1 s. Recommended: it is what
  the metal would do, and something is still moving after the rain.
- **(b) Force it to finish exactly at the last drop**, as today.

## What it couples to
- `hero-scene.ts`: the logo's material reads the temperature texture in place of `cooled` for the four rows above. The
  scene owns the field and steps it in `update`, after the rain (it needs `wash`).
- The run-off map (`hero-maps.worker.ts`, unchanged): the compute pass samples it as the material does now.
- `precompileCompute` (`hero-steam.ts`): its third user, after the steam and the rain. It reads three r185's private
  surface; the guard there skips the precompile if that surface changes.
- GPU cost: one small 2D pass, ~2 dispatches a frame, only during the wash (a few hundred thousand cells at most). It will
  be measured on build, and in Carl's Chrome.
- Where the code lives: a new file `components/hero/hero-heat.ts` (the steam's and rain's pattern: one file per
  simulation), or inside `hero-scene.ts`. **A new file is not in `chunk-scope.json`; Carl names it or it goes in
  `hero-scene.ts`.**

## Rejected
- **(B) The same simulation on the CPU**, uploaded every frame. Same picture, simpler, identical every run. Rejected as
  the first route because it costs main-thread time and a per-frame upload, in the stretch we just cleared of stalls.
  **It is the fallback** if the GPU route measures badly.
- **(C) No state**: blur the run-off map and add an overall fade. Cheapest, but the boundaries never move or develop.
  Rejected under "best first".
- **Temperature driving the clear coat too**: water is not heat. The coat marks where water is, and water does run in
  streaks.

## Not in this chunk
The drips (water flashes to steam above boiling; below it, it runs, gathers on the downward edges and drips), the steam's
local temperature, and the floor's red/blue cell pattern (which will read the same temperature later).

## v1.1 — as built (16 November 2026, session 3)
- **The file:** `components/hero/hero-heat.ts` (Carl named it). The scene owns it (`logoHeat`) and steps it in `update` and
  `compute`; the material reads `share`. The bench's **Heat** folder has the switch (the temperature drives the colour, or
  the front does as before: an A/B) and the five takes.
- **The field holds COLDNESS** (0 = red-hot), not temperature. WebGPU zero-fills new textures, so the logo is phase 1's red
  before any step and after a reset, by construction.
- **Grid:** 405 × 212 cells (the ink's, 2 per cm; asserted equal to the run-off map's at build). Two rgba16float storage
  textures (~0.7 MB) and an 8-bit ink texture. **Load:** 3 compute pipelines compiled in the background
  (`precompileCompute`, 519–854 ms async in Playwright). **Frame:** 2 sub-step pairs per 1/30 s frame. GPU time NOT yet
  measured, and not yet in Carl's Chrome.
- **One fault found and fixed in the build:** the ink holds 1, not 255, so the GPU read it as 1/255 and a `> 0.5` test
  found no ink. Every cell was treated as halo and the logo stayed red (measured: red pixels flat at ~3,877 from 34 s).
  Fixed by testing `> 0.5/255`.
- **Measured** (`live-work/scripts/hero-heat-wash-16-november.mjs`, Home, frame-stepped): red pixels on the logo fall from
  ~41,000 to 0, with the last red at ~33 s, the same as with the front (off). Through the middle of the wash the temperature
  runs ~0.3–0.5 s behind the front. Null control (`hero-logo-state-stills-13-november.mjs`) at 25.3 and 26.2 s: exact,
  apart from the Home lean's known noise floor.
- **⚠ CORRECTION to "the question" above:** 34.8 s is NOT the last drop. The wash already runs ~1.5 s past the last drop
  (`washSeconds` 9.8; Carl, 14 November: *"lets go with 1"*). 34.8 s is when the rounded wash reads 1; the last red went at
  ~33 s with the front too. Carl's 1.a (finish naturally) is what the build does: nothing forces the end.
- **Seen, for Carl's eye (not a fault):** where red meets blue the soft band passes through mauve (a straight mix of the
  two colours). The band is now wider than the front's 6 cm.
- **Seen in both modes, not chased:** one console warning per run, *"Draw with a vertex count of 0 is unusual"*. It appears
  with the temperature off too, and does not come from `hero-heat.ts` (which draws nothing).
- **The take:** `Videos\C2B Films\03 The hero\2026-11-16_temperature_take1.mp4` (Home, then close; from the rain's release
  to 35.5 s, frame-stepped).
