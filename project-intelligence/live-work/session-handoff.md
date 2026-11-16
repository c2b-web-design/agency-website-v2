# Session Handoff — 16 November 2026 (Monday). THE STEAM; THE FIRST-RUN HITCHES; THE OPENING (text, then the logo fades in)

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** It replaces every earlier handoff. Delete it at the end of
the session that reads it, once its replacement is written.

**The record:** D-101 in `decisions.md`, from *"⛔ PHASE 2: THE STEAM, TAKE 1, BUILT ON THE BENCH (16 November 2026"* to the
end: every beat, with Carl's words. Session ended on Carl's word: *"stop the capture. Theres a stall on the text now.
compaction is 36%. We will start a new session. Write a handoff and commit and push. Keep the server up"*.

## ⛔ NEXT SESSION — WHAT IS OPEN

1. **THE STALL ON THE TEXT (Carl, the last thing he saw).** The headline's fade-in stalls on a first visit: the load's
   main-thread work now lands there, since the subtext was moved clear of it. Measured: cold 0.3–1.6 s frames in the first
   ~1.3 s of the opening, warm ~0.75 s. The causes, timed (`hero.loadTimes`): the logo's ARRIVAL ~0.6–1.0 s in one frame
   (flow map 280–450 ms, run-off 145–240, the steam's ink and mask ~90–110, the rain's hit map ~60–95, the lean and plans
   ~70); the warm-up's synchronous part (the gather ~80–150 ms, the compute builds up to ~95 ms); three's shader GENERATION
   (main thread, chunks up to ~0.4 s).
   - **ASKED, NOT ANSWERED:** a worker for the maps, `components/hero/hero-maps.worker.ts` (a NEW FILE: needs Carl's word).
     It would remove ~0.6–1.0 s of the arrival work with no visible change. The shader generation cannot leave the main
     thread.
2. **Then Carl's plan from 14 November:** the RULINGS, in order. STEAM is done as take 1; next are the sharp vertical
   red/blue lines, the wet coat's lightness, the wet dials, the structural note v1.1 and the camera direction note. Then
   THE FLOOR (the cell pattern, coloured by hot and cold; the wet sheen with it).
3. **The steam's take-1 notes** (seen, not ruled): a thin fringe on the top edges in the first ~0.4 s; the cloud stops
   rising once its heat is gone (heat life 0.8 s) and HANGS, then fades as a whole by ~4.2 s; close up at 2.5 cm cells it
   is soft and blurred (the look is take 2: mesh → material → light).

## ⛔ STANDING — CARL's, THIS SESSION

- **A FIX MUST NOT CHANGE THE STORY** (memory `feedback_a_fix_must_not_change_the_story.md`). I hid the logo and held the
  story ~6 s to cover a compile; Carl: *"goes against the first line in the story"*. Anything that changes what the
  visitor sees, or when, goes to Carl BEFORE it is built.
- **SOMETHING IS ALWAYS MOVING** (Carl: *"Having things static means a visitor could take in what info is there and go,
  click or scroll. We know what is going to happen. A visitor will not."*).
- **THE SCOPE STAYS OPEN** (no lock and test asked): `components/hero/hero-scene.ts`, `hero-bench.tsx`, `hero-rain.ts`,
  `hero-steam.ts` (new, Carl: *"Authorised to create and use."*), `components/showcase/arch-idea.tsx`, `bench-ideas.ts`,
  `bench-builder-take.ts` (`chunk-scope.json`, `_heroSteam16Nov`, `_keptOpen14Nov`). **Any other file: name it and ask.**
- From 14 November: best first, fall back only if a measurement forces it; the camera direction is decided only when the
  scene is finished.

## WHERE IT STANDS — on `/proto/hero` (committed and pushed at session end)

1. **THE STEAM** (`hero-steam.ts`): `webgpu_volume_fire`'s fluid, smoke only, in a box about the landed logo (242.5 × 205 ×
   60 cm, 2.5 cm cells, 190,896 cells). The logo is a SOLID (a mask: the pressure treats it as a wall, the ray stops at it).
   It is emitted where the rain lands (240 columns), as a BURST from the first drops landing (`burstS` 1.2 s) × the red
   left, then it thins (`lifeS` 1.2). One step per frame; one draw in the main pass; a warm-up at load. Panel: Steam
   (hold, burst, life, …, cell, ray steps). Carl: *"The steam looks very good"*; **30 fps on his Chrome during the burst**
   (steam off: lowest 54; the rain ~7 of the drop). Film: `03 The hero\2026-11-16_steam_take1.mp4`.
2. **THE FIRST-RUN HITCHES** (a fresh browser = an empty shader cache, as a first visitor). The orange light is switched
   by INTENSITY 0, never `visible` (r185 rebuilds every lit material when the light count changes: that was the 2.6 s
   hitch at touchdown). A BACKGROUND WARM-UP (`warmScene`, `compileAsync`) builds the logo, the liquid, the heat plane and
   the rain's draws; the rain's step program is run once (`HeroRain.warm`); the steam warms itself. The jump, touchdown,
   blobs-out, the rain's release and the first drops: no frame over 50 ms.
3. **THE OPENING** (`OPENING`, `stepOpening`): the LIGHTS come up over 3 s (the key, the ambient, the text's glow:
   intensities only); the SUBTEXT is revealed at reading pace (`/start`'s ~70 ms a letter), starting at 2.2 s or 0.6 s
   after the warm-up began, if later; then the LEANING LOGO FADES IN (7.2 s after that spacing, or when built if later;
   1.2 s), then the story from the lean as approved. **The fade is ALPHA-TO-COVERAGE** (the logo stays opaque; one shader).
   Transparency was MEASURED and rejected twice: on permanently, it moved the floor grid's pixels (111,236 px, cause not
   established); switched on only for the fade, it means a second build (3.2 s). Carl: *"It looks a lot better. The fade
   in of the logo is smooth."* Panel: Opening → "Opening again"; "Arrival again" skips the opening.
   - ⚰️ **SCRAPPED by Carl the same day** (in the record, removed from the code): the HTML loading logo with "Loading……",
     the face-on swap, and the SWIVEL about the c into the lean (*"scrap the HTML logo idea and the overlay. Frame rate
     drops to 14fps while its compiling."*). Raised and not chosen: a loading bar.
4. **Measured last** (Playwright's Chrome, dev server): the subtext window has 0 frames over 50 ms at 60 fps, cold and
   warm; the subtext starts at 2.2 s cold and 2.79 s warm; the fade and the story have 0 frames over 50 ms.

**NULL CONTROL** (phase 1, 0 px every time this session): `node project-intelligence/live-work/scripts/hero-logo-state-stills-13-november.mjs <out> 25.3 <ref>`
— ⚠ the reference folder was in this session's scratchpad (gone): make a new reference from the CURRENT code first. The
script now waits for `hero.warmed`.

## MEASUREMENT SCRIPTS (all `live-work/scripts/`, 16 November)

`hero-opening-measure` (cold + warm in one profile: the opening's events, worst frames, the subtext's window, `loadTimes`),
`hero-opening-stills`, `hero-first-run-hitch`, `hero-pipeline-builds` (what is built when), `hero-logo-shader-compile` (the
logo's shader compiled on its own; variants by stubs), `hero-logo-opening-material`, `hero-steam-{stills,fps,film}`,
`start-opening-frames`.

## STATE

- **COMMITTED AND PUSHED** at Carl's word: see `git log` for the commit after `71697a2`. tsc clean; lint at the baseline
  (the one accepted error, 0 warnings); a clean-checkout build before the push.
- **The dev server is UP** (Carl: *"Keep the server up"*): `npm run dev`, port 3000.
- **The screen capture is STOPPED:** `Videos\C2B Films\03 The hero\01 Discussion\2026-11-16_discussion_screen.remux.mkv`
  (3:33:36), with the raw `.mkv` beside it, KEPT.

## LESSONS

- **A fix must not change the story.** Put the consequence first, then build.
- **r185 SKIPS drawing an object whose pipeline is still compiling asynchronously**, so `compileAsync` on a visible object
  hides it by another route.
- **r185 builds COMPUTE pipelines synchronously only**; render pipelines can be built in the background (`compileAsync`),
  and a background compile keeps the page moving (measured: an 18–51 ms worst gap during a 4.4 s compile).
- **A light's `visible` switch rebuilds every lit material**; switch it by intensity.
- **The logo's shader takes 4.2–4.7 s to compile on its own**, and the NOISE is 2–3 s of it (five noise calls, all in one
  shader). Phase 2's noise is paid at the first frame.
- **A stalled frame advances the opening by at most 0.1 s** (the bench clamps the delta), so stall time adds to the
  opening's length.

---

*Written 16 November 2026.*
