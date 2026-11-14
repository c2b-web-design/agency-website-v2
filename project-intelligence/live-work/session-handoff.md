# Session Handoff — 14 November 2026 (Saturday). THE HERO, PHASE 2: THE RAIN, THE WASH, THE BLUE, WET — BUILT, UNCOMMITTED

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** It replaces every earlier handoff. Delete it at the end of
the session that reads it, once its replacement is written.

**The record:** D-101 in `decisions.md`, from *"⛔ CARL: PHASE 2's QUESTIONS ANSWERED (14 November 2026)"* to the end —
every beat with Carl's words. Session ended on Carl's word: *"Keep the rulings open for the next session. As with the
protected files. Write a handoff."*

## ⛔ NEXT SESSION — CARL's PLAN

Carl: *"next session we will address the rulings and put the floor in."* → (1) the OPEN rulings below, with Carl; (2) THE FLOOR
(its cell pattern, one pattern coloured by what touches it — hot reddish, cold bluish; ruled 13 November to come after
phase 2; the wet sheen with it). Steam stays open among the rulings.

## ⛔ STANDING — CARL's, THIS SESSION

- **THE SCOPE STAYS OPEN** into the next session (Carl: *"As with the protected files"*; `chunk-scope.json`,
  `_heroRain14Nov`, `_archVader14Nov`, `_keptOpen14Nov`): `components/hero/hero-scene.ts`, `hero-bench.tsx`, `hero-rain.ts`
  (new), `components/showcase/arch-idea.tsx` (new), `bench-ideas.ts`, `bench-builder-take.ts`. **No lock and test until
  Carl says so.** Any OTHER file: name it and ask.
- **THE OPEN RULINGS STAY OPEN** (Carl: *"Keep the rulings open"*) — listed under OPEN below; do not decide them.
- **BEST FIRST, FALL BACK ONLY IF A MEASUREMENT FORCES IT** (Carl: *"We start with the best first then fallback if we have
  to. i want quality."*; memory `feedback_best_first_then_fall_back.md`).
- **Phase 2 may change lighting, roughness, anything** (Carl: *"Phase 1 is over, so any changes in lighting for Phase 2 can
  be done"*) — phase 1 stays pixel-identical until the rain (the null control, below).
- **Camera direction:** the scene is BUILT FROM HOME; close-ups are checks. Moves are FLOWN on the pad or COMPUTED by the
  Builder from a start and an end (arc / parabola / zoom at once); more than one camera, jump cuts. **The direction is
  decided ONLY WHEN THE SCENE IS FINISHED.** The scene MOVES TO THE CAMERA BENCH (route A) **after** the work on
  `/proto/hero` is done.

## WHERE IT STANDS — all on `/proto/hero` (committed and pushed at session end)

1. **The rain** (`hero-rain.ts`): the example's GPU drops at r185, LOCAL (a disc about the landed logo, soft rim), platinum
   blue, by TIME; light → downpour → eases off (`weightAt`), 5–7 s (6 default); first drops land as the wobble ends; a HIT
   MAP made once on the CPU from the logo's triangles (a stated departure from the approved render-from-above). Take 2:
   NOTHING TILES (each drop and splash varied) — *"clearly shows the randomness"*. Peak 3,600 (Carl's). The red tint on the
   rain WITHDRAWN (*"if the logo is light emissive i dont think they would affect rain splashes like that"*). Panel: Rain.
2. **The wash** (`hero-scene.ts`, `RUNOFF`, `logoRunoffMap`; `hero-rain.ts` `washNow`): water runs DOWN the face from each
   top edge (a run-off map from the ink), each column its pace; the rain's shape stretched over `washSeconds` (9.8 default:
   the last red ~1.5 s after the last drop, measured by counting red pixels). **Take 2: *"That looks great, a helluva lot
   better"*.**
3. **The blue = the desk mark's** (#083C80 measured on `/proto/logo?mode=blue&view=front`): where cooled, the judging
   studio (`judgingStudioTexture`, CPU, from `LOGO_JUDGING_STUDIO`), roughness 0.25, ACES on the logo's own output; the
   LOGO's OWN KEY light (`LOGO_KEY`, layer 31, fades with the wash; the text keeps the scene's key). Measured after:
   (10, 63, 132) / (8, 60, 127) vs (8, 60, 128).
4. **Wet** (`WET`): the logo material now PHYSICAL; a clear coat where wet; running water on the coat → still beads.
   **Carl: *"They look good and are more pronounced from an oblique angle. A note for camera direction"*.**
5. **A phase-1 defect fixed** (Carl found it close up: *"part of the logo is missing"*): the fill's sum of 1/10s is
   0.9999999999999999, so `level` never reached full and the top of the b's stem was masked away — ⚠ it is in phase 1's
   approved film `phase 1 logo.mp4`. Fix: full within 1e-9.
6. **The ink raster** lifted out of `logoFlowMap` into `inkGrid` (shared): the flow map proven unchanged (hash 3630756487).
7. **The camera bench:** film 4's ARCH back as an IDEA (`arch-idea.tsx`, `?idea=arch`; its build runs in the Guide layer);
   the VADER MOVE restored (`bench-builder-take.ts`, take 4's numbers, version 5) — ⚠ it sits on EVERY idea's timeline.

**NULL CONTROL (run after every material change):** `node project-intelligence/live-work/scripts/hero-logo-state-stills-13-november.mjs <out> 25.3 <ref>`
— 0 px against the post-notch-fix reference. ⚠ The reference folders were in the session scratchpad (gone): make a new
reference from the CURRENT code first. ⚠ When measuring after a fast-forward, render TWICE (the first frame showed the
key light's old strength).

## OPEN — Carl's (kept open on his word)

- **Steam:** chosen VOLUMETRIC, best first — the GPU fluid simulation (`webgpu_volume_fire`'s method, smoke only), emitted
  where the rain meets the red left, rising by heat, in a logo-sized box, MEASURED on Carl's PC (the example ran 8–9 fps at
  its full size). Fallbacks only if measured: a volume made in code → sprites. The last layer of phase 2. NOT BUILT.
- **The sharp VERTICAL red/blue lines** where a run's top jumps between columns (a sideways spread offered) — not ruled.
- **The wet coat's lightness** face on (38, 74, 136) vs the dry desk-mark blue — Carl approved the look; the coat strength
  is one number if he wants it.
- **Panel dials** for the wet look (coat, streaks, run speed, beads) — not added.
- **Structural note** `live-work/structural-note-hero-camera-direction-14-november.md` **v1.1** (route A; its seven
  questions: units, the idea contract, the draw twice in third person, plain three in R3F, the panel, the 9 Nov hero idea,
  `/proto/hero`'s fate) — for the Architect via Carl, when the move is due. The MOVE shape's maths in it (§4) stands.
- **Camera direction note** `live-work/hero-camera-direction-14-november/camera-direction-note.md`: in position by phase 1's
  end; the rain close; pull back to show it local; the wet look OBLIQUE; Carl's test shots and frames beside it.
- From before: the floor's cell pattern AFTER phase 2 (one pattern, coloured by hot/cold); the walls (wallx, wallz).

## STATE

- The six code files, `decisions.md`, `current-sprint.md`, the homework file and the live-work notes (force-added) are in
  the session's commit. tsc clean; lint at the baseline (the one accepted error, 0 warnings).
- **COMMITTED AND PUSHED** at Carl's word (*"commit and push and stop the capture"*) — see `git log` for the commit after `50fb88d`.
- **The dev server is STOPPED** (the whole tree; no project node process; port 3000 free). **The screen capture is STOPPED** (Carl): `VideosC2B Films The hero Discussion6-11-14_discussion_screen.remux.mkv`, 2:50:53; the RAW `.mkv` beside it, KEPT (not deleted without Carl's word).
- **Films this session** (`Videos\C2B Films\03 The hero\`): `rain-wash_take1.mp4`, `rain-wash_take2.mp4`,
  `rain-blue-wet_take1.mp4` (frame-stepped, Carl's close camera 79.6, −279.4, 934.2 → 681.9, −187.1, −6.3).

## LESSONS

- **Measure the reference before matching to it.** The blue was matched to a number (#083C80) read off the approved bench,
  and the remaining gap was traced to one light by switching it off — not argued.
- **A sum of fractions is not 1.** Ten tenths = 0.9999999999999999; a `>= 1` gate on a float sum is a latent defect.
- **A shader noise does not reach its range's ends.** A completion promised by a noise's minimum never arrives; compute the
  value on the CPU when a guarantee rests on it.
- **What the eye sees ends before the number does** (the last red at ~0.77 of the wash): measure the visible event.
- **A first frame after a jump can lie** — render twice before measuring.

---

*Written 14 November 2026.*
