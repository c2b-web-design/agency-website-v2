# Session Handoff — 16 November 2026 (Monday), session 2. THE OPENING's STALLS FIXED; THE LOGO's FADE AS ONE SOLID LAYER; THE GRID OFF

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** It replaces every earlier handoff. Delete it at the end of
the session that reads it, once its replacement is written.

**The record:** D-101 in `decisions.md`, from *"⛔ THE STALL ON THE TEXT: THE MAPS MOVED OFF THE MAIN THREAD (16 November
2026, session 2)"* to the end: every beat, with Carl's words. Session ended on Carl's word: *"Compaction is 44%. Session limit
is good on 35%. We will start a new session. Write a handoff and commit and push and give me a status check"*; then the
vertical lines (ruled out), the temperature model (approved for NEXT session) — the last entries of D-101.

## ⛔ NEXT SESSION — WHAT IS OPEN

1. **⛔ FIRST: BUILD THE TEMPERATURE MODEL** (Carl, end of session 2: *"yes, but in the next session ... it will be built
   from the Home position"*). The sharp vertical red/blue lines are RULED OUT (*"do not look natural during the wash, either
   through the rain or with rapid cooling"*): today's wash cools each vertical strip of the face on its own (the run-off map,
   `RUNOFF`), so neighbouring strips with different run lengths jump at a ruler line. **Build:** a TEMPERATURE for the logo's
   face — falling everywhere over time (the logo cools AS AN OBJECT, Carl), faster where the water runs, EVENED OUT through
   the metal (soft, wandering boundaries) — driving the red→blue colour; the steam follows it (it already follows the red
   left); the DRIPS later (water flashes to steam while the metal is above boiling; below it, it runs, gathers on the
   downward edges, drips). Judged from HOME; Carl flies closer at times, and the final camera direction comes at the end —
   **the wash is to be SEEN CLOSE UP** (*"your handiwork deserves to be seen close up in all its glory"*; the oblique note,
   `hero-camera-direction-14-november/camera-direction-note.md`, 14 November). **NULL CONTROL:** every frame before the rain
   unchanged — make a NEW reference first (the grid is off now). Then the rest of Carl's 14 November rulings: the wet coat's
   lightness, the wet dials, the structural note v1.1 and the camera direction note. Then **THE FLOOR**.
2. **THE FLOOR, restated today** (Carl: *"that will be on the floor. No statue. The pasttern will either be red or blue
   depending on the lodo stste."*): `webgpu_lights_projector`'s procedural cell pattern
   (`Videos\C2B Films\03 The hero\00 References\projector-floor-8-november.mp4`), WITHOUT the statue; reddish from the heat,
   bluish from the cold, spreading from the logo and fading with distance (10 November, PHASE 4). It replaces the grid.
   ⚠ **Check it with and without the logo drawn before it** — this GPU draws a later object differently after a LARGE draw
   (below).
3. **The steam's take-1 notes** (seen, not ruled; carried from session 1): a thin fringe on the top edges in the first ~0.4 s;
   the cloud hangs once its heat is gone, then fades by ~4.2 s; soft close up at 2.5 cm cells.
4. **Flags, not chased:** the one-off PINK tint on the text at the lean (1 of 4 Playwright runs; Carl saw none) — likely the
   same GPU draw-order effect; the scene's remaining 100–170 ms frames are three's main-thread shader generation (cannot
   leave the main thread) and land before the subtext.

## ⛔ STANDING — CARL's

- **A FIX MUST NOT CHANGE THE STORY** (memory). Anything that changes what the visitor sees, or when, goes to Carl first.
  Today it held twice: the grid drawn first changed approved shading → reverted and put to him.
- **SOMETHING IS ALWAYS MOVING.**
- **THE SCOPE STAYS OPEN** (no lock and test asked): `components/hero/hero-scene.ts`, `hero-bench.tsx`, `hero-rain.ts`,
  `hero-steam.ts`, `hero-maps.worker.ts` (new today, Carl: *"Authorised to create and use."*), `components/showcase/arch-idea.tsx`,
  `bench-ideas.ts`, `bench-builder-take.ts` (`chunk-scope.json`: `_keptOpen14Nov`, `_heroSteam16Nov`, `_heroMapsWorker16Nov`).
  Any other file: name it and ask.
- Best first; fall back only if a measurement forces it.

## WHERE IT STANDS — on `/proto/hero` (committed and pushed at session end)

1. **THE MAPS OFF THE MAIN THREAD** (`hero-maps.worker.ts`): the flow, run-off, hit and steam-mask maps, lifted VERBATIM;
   the arrival's main-thread work 490–632 → 45–70 ms; worker vs inline 0 mismatches (`?mapcheck=1`, dev).
2. **THE COMPUTE PIPELINES COMPILED IN THE BACKGROUND** (`precompileCompute`, `hero-steam.ts`; the rain imports it): the
   steam's 10 and the rain's 2 — three r185 creates compute pipelines synchronously only; probed 679 → 4 ms. It reads three's
   PRIVATE surface (`_nodes`, `_bindings`, `backend`); skips itself if they change. Note
   `live-work/structural-note-compute-precompile-16-november.md`.
3. **THE REFLECTION MAPS PREFILTERED IN THE DARK** (the PRIMER, `hero-scene.ts`): the studio, courtyard and judging studio
   PMREMs built at opening 0.1 s (the lights rise at 0.3 s) into three's cache; exactly 3 builds (none twice). The Q&A's
   lesson (`/start`'s ~572 ms PMREM; the corners, 21 October). `pmremTexture` outside a lit material needs an explicit
   direction AND level.
4. **MEASURED** (a visible window, this PC): first visit — frames over 50 ms after the lights start: 83, 67, 67 ms (was a
   0.85–1.3 s freeze); return visit — worst 67 ms; the subtext starts at 2.2 s on both; its window 0 over 50 ms. Carl:
   *"Start text and subtext timings look good, No pink tint on this load."*
5. **THE LOGO's FADE AS ONE SOLID LAYER** (`logoFadeParts`): during the opening a TRANSPARENT copy of the logo's material
   after a DEPTH-ONLY child; once done, the opaque material untouched (the story's frames 0 px). Carl: *"implement 1"*. Takes:
   `03 The hero\2026-11-16_logo-fade_cold.mp4` (the old stipple) and `..._take2_solid-layer.mp4`.
6. **THE GRID OFF** (`hero-bench.tsx`, the panel switch kept): Carl: *"theyve served their purpose"* … *"you can switch it off
   now"*. It carried the flick at the fade's end: this GPU draws the grid DIMMER after a large draw — its SCREEN AREA, even a
   draw writing nothing (bisected, `hero-grid-order-bisect-16-november.mjs`); the 16 November "transparency moved the grid"
   rejection was this.

**NULL CONTROL:** `node project-intelligence/live-work/scripts/hero-logo-state-stills-13-november.mjs <out> 25.3 <ref>` —
⚠ today's references (scratchpad, gone) included the grid: make a NEW reference from the current code first.

## MEASUREMENT SCRIPTS (all `live-work/scripts/`, 16 November session 2)

`hero-opening-measure` (`HEADED=1` for a visible window), `hero-opening-gpu-work` (each submit's GPU time and pipelines; the
PMREM count), `hero-opening-gpu-creates` (which pipelines are built when, labelled), `hero-opening-timeline` (the hero's
`performance.mark`s "hero:…" beside each long frame and each process), `hero-opening-profile` (CPU, `warm`, `HEADED=1`),
`hero-opening-gpu-trace`, `hero-maps-worker-check`, `webgpu-async-prewarm-probe`, `hero-logo-fade-film`,
`hero-fade-grid-probe`, `hero-grid-order-bisect`.

## STATE

- **COMMITTED AND PUSHED** at Carl's word: see `git log` for the commit after `6701266`. tsc clean; lint at the baseline (the
  one accepted error, 0 warnings); a clean-checkout build before the push.
- **The dev server is UP** (port 3000).

## LESSONS

- **A freeze with the page IDLE is the GPU.** Profile first (`hero-opening-profile`): if the main thread is idle in the long
  frame, trace the GPU process and time the submits.
- **Check the record for the same problem:** the Q&A and the corners had already solved PMREM stalls.
- **A probe needs a frozen scene** (the loop stopped, frames drawn by hand): a live scene moved and gave false numbers once.
- **Bisect by removal, against a true reference** (the object hidden): it found that a draw's screen area, not its pixels,
  changed the grid.

---

*Written 16 November 2026, session 2.*
