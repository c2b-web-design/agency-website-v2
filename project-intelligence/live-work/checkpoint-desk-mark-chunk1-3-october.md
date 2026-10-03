# Checkpoint Request — D-088 desk mark, chunk 1: the 3D mark alone on a bench

**3 October 2026 (session 2). Servers STOPPED before this checkpoint opened (PID 428 killed, port 3000 confirmed
free).** Nothing committed.

## Objective

The C2B mark as a real three.js object, alone on `/proto/logo`: curved front, flat back, the b's bevelled stem, the
bevelled terminals, gold matched in kind to Carl's target. No room, no scroll, no fall; `/about` untouched.

## Plan / Spec Reference

`live-work/desk-mark-chunk1-plan-3-october.md` — version 2, amended by the Architect's review
(`architect-plan-response-desk-mark-chunk1-3-october.md`), approved by Carl. Record: D-088's 3 October session-2
entries at the end of `decisions.md`.

## Files Changed

New: `app/proto/logo/page.tsx`, `components/about/logo-bench.tsx`, `logo-mark-geometry.ts`, `logo-mark-material.ts`,
`logo-mark-outline.ts` (generated). Scripts (live-work): `logo-outline-extract.mjs`, `logo-bench-measure.mjs`,
`logo-bench-shots-3-october.mjs`. Modified on Carl's word (in scope): `brand-assets/logo/README.md`,
`hero-logo-transition-concept.md` (the silhouette correction, a dated banner). Records: `decisions.md`.
`git status --porcelain` shows nothing else.

## Relevant Code Summary

- **Outline** — traced once from `c2b-logo-gold-relit-alpha-1671.png` (md5 in the file): marching squares on the
  0.5 iso-line → RDP → a centripetal Catmull-Rom spline every 1.5 px (4,433 points). 1 loop, 0 holes; the iso-line
  lies within **0.30 px** of it. Stem rectangle, half-widths and the normalisation transform emitted with it.
- **Geometry** — one signed distance field: an interior grid clipped at a depth, an edge band of rings swept along
  ∇d (the steep flank sampled by the profile), the lip, wall and flat back from the band's outer ring, pinned to the
  outline. R capped at the measured 5th-percentile half-width (A2). The stem: R, bevel and crown EASE inside the
  stem box (continuous — see deviation 1). Normals from the exact field (central differences / chain rule), never
  from the mesh.
- **Material** — metalness 1, colour = gold's F0 in linear (1.00, 0.77, 0.34), roughness 0.25 (A12).
- **Bench** — renderer as `/about` (ACES, sRGB, antialias, alpha, DPR 1–2, soft shadows); studio = Lightformers
  only; "room reflection — no take light"; front view framed by the outline's transform; target overlay as a DOM
  image; mask mode; a room-size view (~70 CSS px).

## Measured (`logo-bench-measure.mjs`, mask mode, rendered large and resampled to source px)

| | |
|---|---|
| control: the gold alpha vs itself eroded 1 px | IoU 0.9803 (1 px everywhere = 2.0 points) |
| the mesh vs the gold alpha | **IoU 0.9969** |
| edge distance, render ↔ target | **max 1.00 px both ways**, 95th 1.00, median 0.00 (incl. ±0.5 px resampling) |
| narrow gaps | the target has none narrower than ~6 px (narrowest channel ~24 px) — premise 4 corrected |
| open edges (welded) / non-manifold / NaN / flipped band | 0 / 0 / 0 / 0 |
| normal angle — crest (a spine seam would show) | **4.6°** |
| normal angle — stem ease / whole front / edges > 30° | 46.7° / 46.7° / 72 |
| triangles / build | 241,353 / ~0.7–0.9 s |
| canvases on the page / console errors | 1 / none |
| tsc / lint / build | clean / `1 problem (1 error, 0 warnings)` (baseline) / passes |

⚠ NOT WATCHED by any of it: the material's likeness, the dome's height, the terminals' shape, the room's light,
motion, other viewports — Carl's eye.

## Screenshots

`live-work/screenshots/logo-bench-3-october/` (gitignored, local): `oblique`, `front`, `front-overlay` (target at
50% over the render), `front-target`, `side`, `below`, `roomsize`, `oblique-room`, `front-mask`.

## Deviations from the approved plan (stated, not hidden)

1. **The stem (A3) — eased parameters, not a smooth max.** A smooth max adds a bump wherever the two fields are
   equal, which is the whole stem face. R, bevel and crown ease instead (continuous because z is continuous in
   them); at the junction both are at the crest, so the bowl flows in as the target shows.
2. **The stem's face is CROWNED** (`stemCrown` 0.25) — Carl, on the first render: *"part of thr b is the wrong way
   round. showing the flat back"*. The heights were right; a dead-flat face square to the camera reflected one
   direction of light and read as the back through a hole.
3. **The outline is a spline**, not the plan's polyline — a polyline's tangent jumps at each vertex and the metal
   showed it as dashes along every stroke.
4. **Normals by central differences of the exact field** (interior), not per-vertex analytic — creases fell between
   grid nodes and stair-stepped. Still never from the mesh.
5. **Convex corners: skipped outline points inserted** into lip, wall and back — the band's rings cut the stem's
   corners into 45° chamfers once the band deepened (`bandT` 0.5).
6. **The measurement renders large** (2400 × 1300 @ 2), not at Carl's viewport — so a thin channel is many render
   pixels. Carl's size is the room-size frame.

## Known, unfixed (for Carl's eye)

- Tiny teeth at the two inside corners where the bowl meets the stem; faint ticks along the 2's diagonal inner
  flank (visible in `below`). Invisible at room size.
- The terminals are pyramid-like mitres from the distance field, not the target's flat bevelled cuts (as planned).

## For chunk 2 — found here

- ⛔ **Under the room's reflection the gold renders almost BLACK** (`oblique-room`). The room's env map was built for
  the glass; its plate panel does not cover the directions a front-facing metal surface reflects, so the gold sees
  the near-black shell — **the RIM-DARK cause** (`open-defects.md`, D-091). The gold will need its light solved in
  the room (the take light, and/or the panel's arc). `room-environment.tsx` was not touched.
- Build ~0.8 s and 241k triangles at bench resolution — chunk 2 decides runtime vs baked, and a coarser grid at
  room size (~70 CSS px needs far less).
- The earlier plan notes stand: `/about` is `frameloop="demand"`; the take light's shadow frustum (±2.2) may not
  reach the desk.

## Specific Questions

1. **For Carl (A13): what does the mark stand on?** `side` shows it: a curved front, a flat back, and a thin wall —
   upright it balances on a strip under the base stroke. **A flat foot (the base's underside sliced flat to full
   depth), or as built?**
2. Structural (Architect): deviation 1 (eased stem) against A3's intent; deviation 4 against A2's "analytic normals".
3. Visual (Carl): the dome's height (0.85 of a half-round), the gold's tone, the stem's crown.

## Reporting Instruction

Report findings only. Do not fix code. Do not instruct Claude Code directly. Findings go to Carl.
