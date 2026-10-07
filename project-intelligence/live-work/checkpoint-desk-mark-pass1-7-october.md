# Checkpoint Request — D-088 desk mark, PASS 1: the shape in clay (take 2, plan v3)

**7 October 2026. Servers STOPPED before this checkpoint opened** (PID 22792 killed, port 3000 confirmed free).
Nothing committed. `6302913` (chunk 1) is still local and unpushed, on Carl's word.

## Objective

Pass 1 of three (mesh → material → lights; Carl, 7 October — the blue Next step button's process, D-030): **the
mark's shape alone**, in plain grey, lit to bring out the geometry, on `/proto/logo`. Fix the b's junction tear and
the pyramid ends. No material, no room, no motion.

## Plan / Spec Reference

`live-work/desk-mark-pass1-mesh-plan-7-october.md`:
- **v2**, amended per your review (`architect-plan-response-desk-mark-pass1-7-october.md`) and approved by Carl;
- **§ Version 3**, which supersedes v2's step 3. ⚠ **v3 was BUILT BEFORE YOU SAW IT**, on Carl's instruction (*"if you
  want to have a go at this and its not up to scratch i will definately say 'You shall not pass'!"*). **This
  checkpoint is its first review.**

Records:
- `decisions.md`, D-088's 7 October entries (the method, option 2, take 2, the verdict);
- **R-034**;
- `live-work/logo-pass1-baseline-7-october.md`.

## What happened, in order

1. **Step 2 (offline):** the tube polygon was generated, with your A5 checks. The continuation-width check STOPPED it:
   the b's top stroke is only ~87 px wide beside the junction, narrower than 2 × p5. **Carl chose to cap R at the
   narrowest stroke BODY (43.5 px) in place of p5** ("Go with 2"). The p5 statistic counts the ridge running out into
   the terminals' tapers; a ridge-point map found only the b's top stroke (43.5 px) and the 2's diagonal (44.8 px)
   under 45. A fillet-detection fault (a 2° single-sample threshold stopped mid-fillet and tilted the continuation 24°)
   was found and fixed before the stop was reported.
2. **Step 1:** the clay bench (clay / flat / zebra / normals, a raking key, a shadows switch, the fixed junction
   camera). The baseline was recorded first: the 3 October mesh reproduced exactly (241,353 triangles; 46.7° in the
   junction window). ⛔ **Carl marked the gate:** the tear is *"clearly a problem… on a gold bar that will show as a
   defect"*. **He also ruled out the pyramid ends:** *"a departure from the original logo."*
3. **Carl's solution — a new SHAPE target** (`references/desk-mark-refs-7-october/flat-face-shape-target.png`): a
   flat face in a narrow chamfer. **v3: one cross-section all round** — wall → straight chamfer (~15 source px,
   measured off the target's stem) → 4 px round → flat face. One profile means no second cross-section, so no
   junction to blend and no tube to cut. **v2's step 3 was never built.**
4. **Carl: "Yes"** — passes (R-034). v2's generated tube data was then removed (script and module).

## Files Changed

- **Modified:** `app/proto/logo/page.tsx`, `components/about/logo-bench.tsx`, `components/about/logo-mark-geometry.ts`,
  `components/about/logo-mark-outline.ts` (regenerated: `LOGO_OUTLINE` and `LOGO_STEM` byte-identical to 3 October;
  added `LOGO_R_CAP`, `LOGO_JUNCTION`, `LOGO_STEM_CORNER_RADII_PX`).
- **Scripts:** `logo-outline-extract.mjs`, `logo-bench-measure.mjs`, new `logo-pass1-shots-7-october.mjs`.
- **Records:** `decisions.md`, `review-log.md`.
- **Untouched:** `logo-mark-material.ts` (unused on the bench now), everything under `/about`, every protected file.
- `git status --porcelain` shows nothing else.

## Relevant Code Summary

- **Profile** (`makeProfile`):
  - `z = wallH` for `d < lipW`;
  - a straight chamfer of slope k;
  - a circular arc of radius ρ, tangent to both the chamfer and the face (T = ρ tan(θ/2));
  - the flat face from `d ≥ B + T`.
  - `depth` is the total thickness. B + T ≤ 0.9 × `LOGO_R_CAP`, so the face exists on every stroke.
- **Mesh:** chunk 1's mechanism, unchanged in kind.
  - The interior grid is clipped at `dc = B + T + 1.5 steps`, so every node AND its neighbours are flat: the grid
    carries no slope.
  - The band rings sit at explicit levels — through the round evenly in angle, then down the chamfer.
  - The outer ring is pinned, with convex corners inserted; lip, wall and back as before.
- **Normals (A4):** ONE method over the whole front — central differences of the exact `profile(d(x, y))` at ¼ source
  px. Band z comes from the true `d` at each ring point; the foot ring is pinned to `wallH` (the lip's vertices are
  built there, and a mismatch is a crack).
- **Bench:**
  - Modes: `clay` (shades with computed normals), `flat` (`flatShading` — the triangles), `zebra` (a striped
    matcap), `normals`, plus a wireframe overlay.
  - Light: a key with azimuth and elevation dials; shadows 2048², bias −0.0005, normalBias ½ a grid step, with a
    switch.
  - The `junction` view's camera is a fixed constant.
  - `windowReadouts()` reports computed-normal angles and the triangles' dihedral angles in the generated window, on
    welded positions.

## Measured

| | 3 October (baseline) | take 2 (v3) |
|---|---|---|
| junction window: computed-normal angle, max | 46.7° | **6.3°** |
| junction window: dihedral (triangles), max / p99 | 45.4° / 21.5° | **5.6° / 5.6°** |
| IoU vs gold alpha (control: 1 px erosion = 0.9803) | 0.9969 | **0.9961** |
| edge distance, both ways | ≤ 1.00 px | **≤ 1.00 px** |
| open edges (welded) / non-manifold / NaN / flipped | 0 / 0 / 0 / 0 | **0 / 0 / 0 / 0** |
| interior grid z-step | — | **0.000 px** |
| face normal angle (both ends on the face) | — | **1.27°** (see deviations) |
| triangles / build (dev) | 241,353 / ~0.8 s | 295,079 / ~0.8–1.0 s |
| canvases / console errors | 1 / none | 1 / none |

`tsc` clean · lint `1 problem (1 error, 0 warnings)` (baseline) · `npm run build` passes.

⚠ **NOT WATCHED by any of it:** the likeness to the shape target (Carl's eye), the material, the room's light, motion,
other viewports.

## Screenshots

`live-work/screenshots/logo-pass1-7-october/` (gitignored, local):
- `baseline/` and `take2/`, each with front, oblique and junction × clay, flat and zebra; `junction-flat-noshadow`,
  `junction-flat-wire`, side, below, room size;
- `readings.json` in each, holding every state's numbers and the window and camera as the bench logged them.

## Deviations, stated

1. **v3 replaced v2's step 3**, on Carl's new shape target, and was built before review (above).
2. **R's cap** moved from p5 to the narrowest stroke body (Carl's option 2 on the width question). It now caps the
   chamfer.
3. **The face's normal angle is 1.27°, not ~0.** It occurs at the round's last ring (d = B + T exactly), where the
   ±¼ px difference straddles the arc's end. It is not on the grid (z-step 0).
4. **The baseline .md carried a RETYPED junction window,** off by ~5e-5 (the Builder invented a fifth decimal from a
   4-decimal print). The readings were always taken in the module's window, as `readings.json` shows. Corrected in
   place; the script now checks the window against `readings.json`, not prose. Found by that check stopping.
5. **v2's tube data was generated, kept unused while v3 was judged, then removed** once Carl passed v3.

## Specific Questions

1. **Structural (Architect):** does v3 raise anything §5a/§5b would have stopped had it come to you first? (No new
   canvas, context or mechanism; chunk 1's mesh path with a new profile; normals moved to one method.)
2. **The normal method:** the band's normals are now central differences at ¼ px rather than chunk 1's chain rule with
   ±3-neighbour ∇d averaging. Does this sit right against A4 — especially at the chamfer MITRES, which are true
   creases?
3. **For Carl — already raised, not ruled on:**
   - the stem's corners: the trace rounds them 22–26 px, so the chamfer wraps them as a cone; the target shows crisp
     mitres;
   - A13 (flat foot or as built);
   - the dials (bevel 15 px, 45°, round 4 px, depth 41 px);
   - the removed stem crown (*"showing the flat back"*), carried to pass 2 as a question.

## Reporting Instruction

Report findings only. Do not fix code. Do not instruct Claude Code directly. Findings go to Carl.
