# Session Handoff — 13 November 2026 (Friday), session 1. THE HERO: LEAN → ARRIVAL → EMISSION ON `/proto/hero`

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** It replaces every earlier handoff. Delete it at the end of
the session that reads it, once its replacement is written.

**The record:** D-101 in `decisions.md`, from *"THE LOGO LEANS ON THE 3D t (13 November 2026"* to the end — every beat with
Carl's words. ⚠ Read the LAST TEN entries first. Carl: *"Its looks the best yet. a good place to take stock."*

## ⛔ WHERE IT STANDS (all in `components/hero/hero-scene.ts` unless named; the bench `components/hero/hero-bench.tsx`)

1. **THE LEAN on the 3D "t"** — the sketch's R-103 lean solved in the sketch's frame, carried by the text's similarity
   (`leanInSketch`; `HERO_LEAN` exported from `hero-logo.tsx`). Contact measured from the glyph = the recorded constant.
   ✔ *"The lean looks good."*
2. **THE LOGO's OWN RED** — the button family's metal in the blobs' red (`logoMaterial`, now a `MeshStandardNodeMaterial`),
   NOT the courtyard. ✔ *"the colour where it starts and ends phase 1."* Carl's PRINCIPLE: **a light or map that belongs to
   the blobs acts only once the blobs exist.**
3. **THE ARRIVAL** — appears leaning, holds 2 s, jumps (ballistic, 60 cm apex), lands UPRIGHT, SAME PROFILE, wobbles (the
   desk mark's, sideways). ✔ timing (*"It loads, theres a beat. Jumps happens and a wobble."*). **⛔ It now lands in the
   MIDDLE OF THE DANCE** (Carl's solution: *"bring the mountain and have our logo junp slap bang in the middle of the blobs
   mass"*). ⚠ From Home the logo there is EDGE-ON — a thin red line (put to Carl, not answered).
4. **THE EMISSION (take 10, the one Carl liked)** — from the wobble's end, over **3 s, eased in/out**: a chunked dissolve
   FRONT runs DOWN the logo; blobs BORN AT THE FRONT (top first), swell 0.2 s, ease onto their dance position over a FIXED
   0.7 s; ONE shared dance clock (the example's original choreography); the orange light rises with it. Logo in the middle
   cut the blobs' joining speeds by a third (2,233 → 1,644 units/s top; the dance's own top ~390).
5. **THE FLOOR** — solid for the liquid (nothing drawn below it: a `ClippingGroup` at `FLOOR_Y`); blobs SQUASH on contact
   (volume kept); the floor HEATS where they merge and cools after (an additive plane, a 28 × 28 heat map); the ROUND AMBER
   DISC (the example's floor liquid, top at the floor, faded by a spherical container). ✔ *"a viscous fluid would pool like that."*
6. **THE MOULD** — the sketch's yellow outline (face-on, upright, balanced right, raised 40 cm) as the scene's `mould` pose;
   the bench draws it (Logo → "mould outline"). ✔ balance. ⛔ a GUIDE only, never on the page.
7. **RULED:** the blobs KEEP their size (they are ~19× the logo's 70 L, measured; Carl: the goal over the litres). The
   re-forming: the blobs squeeze INTO the mould FROM BEHIND; the extra mass discarded; at full integrity it falls.

## ⚠ KNOWN, NOT FIXED

- **The amber pool POPS IN at full size the instant the emission starts** (not caused). Planned: a WETNESS mask (landings
  give liquid early, take it back late — Carl: *"the mask in reverse"*), after the choreography.
- One far blob still joins fast (the fixed 0.7 s hand-off); the middle landing reduced it.
- The walls (wallx, wallz) are still the example's square ones (outside the sphere); where a wall stands is Carl's.

## NEXT — Carl's: *"If we can get the solid to liquid transition right we will work out timings next."*

- The timings (the dance's length — "3/4s" was never pinned, Carl: *"not set in stone"*), then the corral (the box shrinks
  toward the mould, trajectories inside it; the blobs' world size held), the squeeze into the mould from behind, the fall.
- WITHDRAWN this session (do not rebuild): per-blob dance clocks (*"a lot worse"*, a column); working backward from the
  dance with a drain (*"blobs jusr spawn out of nowhere"*); the path shifted to the blob (the Builder's misreading of the proverb).

## STATE

- **COMMITTED AND PUSHED this session** (Carl: *"Write a handoff and commit and push"*). tsc clean; lint the one accepted
  error, 0 warnings.
- **The dev server is RUNNING** (port 3000). **The screen capture is RUNNING** (Carl did not ask to stop it):
  `Videos\C2B Films\03 The hero\01 Discussion\2026-11-13_discussion_screen.mkv` (ffmpeg gdigrab; stop it, then remux).
- **Films** (frame-stepped, 30 fps) in `Videos\C2B Films\03 The hero\`: `2026-11-13_logo-arrival_take1`, `floor-heat`,
  `floor-splat_low`, `round-pool_*`, `amber-disc_*`, `emission_take1` … `take10_3s` (take 10 = the one liked).
- **Scripts** (`live-work/scripts/`, 13-november): the lean check, the orange source, the desk-wobble film, the arrival film,
  the solid-floor check, the floor-heat film (camera argument), the heat mapping check, the volume budget, the closest
  approach, the sketch-bench look, the mould spacing, the emission film, the blob speed.
- **Scope:** the hero's phase-1 exception holds (files already in `chunk-scope.json`).
- **Memory:** `feedback_physics_serves_the_goal.md` added; the index compacted (one line each).

## LESSONS

- **Measure the physical fact, then frame it by the goal.** The litres were right to raise and wrong to obey.
- **A proverb is Carl's to explain** — the Builder's reading of "mountains and Muhammed" was built and withdrawn; ask.
- **Find the cause before tuning** — the rush was DISTANCE (a fixed dance), not easing; Carl saw it first.
- **Before showing, check the rule the change must keep** — the first drain ate the logo early and blobs came from nothing.

---

*Written 13 November 2026, session 1.*
