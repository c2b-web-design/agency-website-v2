# Claude Plan — D-088 desk mark, CHUNK 1: the 3D mark alone on a bench — VERSION 2 (amended)

> **Status: AMENDED PER THE ARCHITECT'S REVIEW, AWAITING CARL'S APPROVAL. NO CODE WRITTEN.**
> Version 1 was written in Plan Mode on 3 October 2026 (session 2) and reviewed by the Architect the
> same day: `live-work/architect-plan-response-desk-mark-chunk1-3-october.md` (verdict: approve once
> amended). Every finding is applied below; the table at the end maps each to its change.
> ⚠ Execution starts only on Carl's approval of THIS version, and after the scope amendment (§ Files).

## Task

Build the C2B mark as a real three.js object, **alone on a bench page** (`/proto/logo`): curved
front, flat back, the b's chamfered flat-faced stem, the bevelled terminals, in gold matched to
Carl's target. **No room, no scroll, no fall; `/about` is not touched.** Prove one object before
anything moves (ethos §14a: *"Build the track before adding automation"*).

⛔ **It is the HERO's dress rehearsal** (Carl, 3 October: *"This is a dress rehearsal for it, though it
will be even more sophisticated"*) — so the outline, geometry and material modules are written to
scale to a larger, more detailed mark (resolution dials, nothing tied to the desk's size).

Carl, 3 October 2026: *"Logo on desk will be built with Three js and be animated… Next phase will
need discussion, a plan and consultation with the Architect."* Discussion: D-088's 3 October
session-2 entries (end of `decisions.md`). **Later chunks, not this one:** placement in the room;
the renderer spanning §2→§3 (route 1, structural); the pull and head-over-toe topple; gold→blue;
the arrival; the screen's digital world.

## Context Read

Handoff, `open-defects.md`, `current-sprint.md`, `context-rules.md`, ethos §14a; D-088 whole and
its 3 October rulings; D-063 (amended); D-065. Pattern: `app/proto/card/page.tsx` +
`components/about/card-bench.tsx`. Reused unmodified: `components/about/room-environment.tsx`
(`useRoomEnvMap`, `RoomEnvironment`). Deps present: three 0.185.1, R3F 9, drei 10, sharp.
**No new dependency.**

## Premises checked (measured during planning)

1. Targets: gold = `brand-assets/logo/c2b-logo-gold-relit-source-1671.png` (pixel-exact), blue =
   `brand-assets/logo/transition/c2b-transition-1-platinum-blue.png`.
2. ⛔ **The white silhouette is NOT the target's drawing** (aspect 1.984 vs 1.928; IoU 0.84 after
   fitting boxes; bolder inner strokes, a wider lower stem). Not used.
3. ✔ **`brand-assets/logo/c2b-logo-gold-relit-alpha-1671.png` is the target's outline at a larger
   scale** (fitted onto Carl's image at 933 × 484 / (372, 242): luminance 134 inside its edge, 24 in
   a 4 px ring outside). Anti-aliased → sub-pixel edges. **The trace source.**
4. That outline: one solid piece, **zero holes**, 1078 × 559 px; stroke half-width 45.6 / 48.0 /
   49.2 px (5th / median / 95th), up to 63 at junctions; **narrowest gaps ~4 px**.
   ⚠ **CORRECTED during execution, 3 October:** the "~4 px gaps" were an artefact of the planning measurement
   (2 px readings at the padded border). Measured properly (channel centres of the background distance), **the target
   has no channel narrower than ~6 px** — see `logo-bench-measure.mjs`.
5. The cross-section is the Builder's **inference** (D-088, 3 Oct); no image shows depth or the back.

## Proposed Approach

### Step 1 — The outline, extracted once, offline

`live-work/scripts/logo-outline-extract.mjs` (sharp): marching squares on the gold alpha at the 0.5
iso-line, linearly interpolated (sub-pixel); one closed loop; corner-preserving light smoothing
(corners by turning angle: the stem rectangle, terminal cuts, the slit) and RDP at ~0.25 px.
Writes **`components/about/logo-mark-outline.ts`** with:
- the loop, normalised to mark height = 1, origin at the **bottom-centre of the base** (where it
  stands; *not* the topple's pivot — that is the front bottom edge, set by chunk 3 with a group
  offset) [A10];
- **the stem rectangle**, detected by the script from the alpha (not typed by hand) [A3];
- **the normalisation transform** (source px → mark units) — the bench's front framing is derived
  from it, never fitted by hand [A4];
- provenance: source path, its md5, date, parameters, point count.
The script prints: loops (must be 1), holes (must be 0), points, max deviation from the iso-line.

### Step 2 — The geometry (`components/about/logo-mark-geometry.ts`, pure, no React)

`buildLogoMarkGeometry(params) → { geometry, stats }`, millimetres, reusable as-is by chunk 2.

- **Signed distance** `d` to the outline: exact point-to-segment, segments bucketed in a grid;
  sign by winding.
- **Front surface:** a regular XY grid, cells split into triangles, **clipped at the interpolated
  zero-crossing of the sampled SDF** (marching triangles). ⚠ **Not an exact outline:** corners (the
  stem rectangle, terminal cuts) are cut short by up to one cell [A8]. **A finer band near the edge**
  (its own step and width, dials) carries the steep flanks [A8]. Height `z = profile`.
- **The dome profile:** wall (`wallH`), flat lip (`lipW`), then
  `z = wallH + domeH·(R−lipW)·sqrt(1 − ((R−d)/(R−lipW))²)` for `d < R`, the crest held for `d ≥ R`.
  ⛔ **R is set AT OR BELOW THE MINIMUM HALF-WIDTH** (default the 5th percentile, ~45.6 source px, a
  dial that cannot exceed the measured minimum) [A2] — so the slope is exactly zero wherever the
  medial axis falls and the crest is a narrow plateau; no seam down the spine.
- **The stem:** its own box SDF (from the emitted rectangle) giving a chamfer-to-flat-face height,
  **combined with the dome by a smooth max** (blend radius a dial) — z continuous across the seam,
  no cliff [A3].
- **Terminals:** what the distance field gives (the dome falling to the cut) — ⚠ a known difference
  from the target's flat bevelled cuts, stated at the checkpoint.
- **Back and wall:** from the front's boundary loop (one-triangle edges, chained) → flat back at
  z = 0 (earcut on that loop) and the vertical wall — watertight by construction.
- **Normals analytic** (SDF gradient × profile slope).
- **Stats from the BUILT mesh** (never the formula's prediction): vertices, triangles, **open edges
  counted on WELDED positions** [A9] (must be 0), NaNs (0), crest height ÷ half-width, **max angle
  between neighbouring vertices' normals** [A2], **max z-step per cell** [A8].

### Step 3 — The material (`components/about/logo-mark-material.ts`)

`createLogoGold(params) → THREE.MeshPhysicalMaterial`: metalness 1, **base colour from physical
gold, F0 linear ≈ (1.00, 0.77, 0.34)** [A12], roughness ~0.25 — ONE starting value for Carl's eye;
the target judges the result, it is not sampled. No highlight cap unless a face glint appears.

### Step 4 — The bench (`app/proto/logo/page.tsx` + `components/about/logo-bench.tsx`)

Built as `/proto/card` (server page + `"use client"` bench). One `<Canvas>`, `frameloop="always"`.
- ⛔ **Renderer matches `/about`'s** [A5] (`about-card-canvas.tsx` ~1069): R3F defaults — ACES
  filmic tone mapping, sRGB output — and `gl={{ antialias: true, alpha: true }}`, `dpr={[1, 2]}`,
  `shadows="soft"` (on in `/about` while the text runs, its default). Stated in the bench's header.
- **Light:** (a) **studio** — drei `<Environment>` built from `<Lightformer>`s ONLY, **no preset**
  (a preset fetches an HDR from a CDN) [A6]; the header notes that `card-bench.tsx`'s "`<Environment>`
  ruled out" concerned the GLASS — metal with no environment renders black. (b) **"room reflection —
  no take light"** — `RoomEnvironment` from the plate; ⛔ the take light's values are NOT copied
  (they are inline in `about-card-canvas.tsx`; exporting them is chunk 2's, with Carl's word) [A7].
- **Views:** front orthographic, framed by the outline's normalisation transform [A4]; oblique
  perspective; slow turntable; **a bottom/side view** (for Q13) [A13]; ⛔ **a ROOM-SIZE view** — the
  mark at ~70 CSS px tall (its size on Carl's screen, DPR 1.36) [A11].
- **Mask mode:** unlit `MeshBasicMaterial`, white on black — for the measurement only [A4].
- **Target overlay: a DOM `<img>` over the canvas** (not a textured plane — tone mapping would alter
  it), opacity dial, same framing [A5].
- **Dials:** height mm (⚠ placeholder until chunk 2 sets room millimetres from the 144 plate px
  target), grid step, edge-band step/width, R (capped at the measured minimum), wallH, lipW, domeH,
  stem chamfer, blend radius, roughness.
- **Readouts:** Step 2's stats + **build time in ms, measured in an effect** (not in render — lint)
  [A11].

## Structural Contract

- **Existing values/components modified:** none (`room-environment.tsx` imported, not edited).
- **New:** one route `/proto/logo` with ONE canvas on its own page — not on `/about`. Pure geometry
  and material modules for chunk 2 to import into the room's existing canvas.
- **Coupled values:** ⚠ **TWO LOOPS EXIST** [A8] — the outline file, and the grid-clip loop the wall
  and back are built from. **The edge-distance check (Verification 3b) is what keeps them together.**
  The outline data is coupled to its source's md5; the bench's front framing to the outline's
  normalisation transform.
- **Approved layers that must not change:** all of `/about` and `/start`; the card family.
- **§5a:** none in this chunk; the spanning renderer is chunk 2's and returns through the gate.
  **§5b:** nothing existing is moved.

## Files

All new: `app/proto/logo/page.tsx`, `components/about/logo-bench.tsx`,
`components/about/logo-mark-geometry.ts`, `components/about/logo-mark-material.ts`,
`components/about/logo-mark-outline.ts` (generated), `live-work/scripts/logo-outline-extract.mjs`,
`live-work/scripts/logo-bench-measure.mjs`; records on Carl's verdict.

⛔ **SCOPE CHANGE — CARL'S, BEFORE EXECUTION [A1].** `chunk-scope.json`'s wording says *"trace the
white silhouette"*. Premise 2 shows the silhouette is a different drawing; **the input becomes the
gold target's alpha** (`c2b-logo-gold-relit-alpha-1671.png`). The wording changes with the files:
**add** `components/about/logo-mark-outline.ts`, **remove** `public/c2b-mark-silhouette.png`.

⚠ **Raised, out of scope, Carl's call:** `brand-assets/logo/README.md` AND
`brand-assets/logo/hero-logo-transition-concept.md` describe the white silhouette as the trace
source; it is a bolder, different drawing — a note in both is owed.

## Verification

1. Before coding: the relevant guides in `node_modules/next/dist/docs/01-app/` (AGENTS.md).
2. **Outline script:** 1 loop, 0 holes, max deviation from the iso-line ≤ 0.5 source px.
3. **`logo-bench-measure.mjs`** (Playwright 1.62.0, dev server), in **mask mode**, front view framed
   by the normalisation transform:
   - **(a) control first** [A4]: the gold alpha scored against itself eroded by 1 px → states what
     an IoU figure means at this resolution; the mesh's IoU is reported against that, not against an
     uncalibrated 0.99;
   - **(b) edge distance**, rendered mask vs the gold alpha, **max and 95th percentile in source px**
     — what "outline" and "gaps open" depend on; **gaps:** background pixels across the slit and the
     pinch;
   - (c) the page's stats: open edges (welded) 0, NaN 0, triangles, max normal angle, max z-step,
     build ms; (d) **canvases on the page = 1**; (e) no console errors.
   - ⚠ **Its output states what it does NOT watch:** material likeness, the cross-section's height,
     the terminals, the room's light, any motion — Carl's eye.
4. `npx tsc --noEmit` clean; `npm run lint` = `1 problem (1 error, 0 warnings)`; `npm run build`.
5. `/about` untouched: **`git status --porcelain`** [A4] shows only the new files and the records.
6. **Checkpoint:** servers stopped by PID, port confirmed free; frames to `live-work/` — front over
   the target, oblique, room-size, studio vs room reflection, **bottom/side**; one image per state.
   Carl judges by eye; ⛔ **Q13 put to him there:** *a flat foot (the base's underside sliced flat to
   full depth) or as built?* — the Builder does not decide it [A13].

## For chunk 2 — recorded, not acted on

- `/about` is `frameloop="demand"`; `neon-bloom.tsx` owns every frame — a moving mark changes the
  rendering model.
- `TakeLight`'s shadow frustum (±2.2, centred on the cards) may not reach the desk mark.
- Runtime geometry build costs `/about` load time — this chunk's build-ms readout decides whether to
  bake offline.

## Stop Conditions

- Outline not 1 loop / 0 holes, or deviation > 0.5 px → stop, report.
- Gaps close, or the mesh is not watertight on welded positions, at any step the browser can carry → stop.
- Any EXISTING file, or any file outside the approved scope, needed → stop, ask Carl.
- A second canvas/context needed → stop (§5a).
- The stem seam or terminals cannot read right within this mechanism → report with frames; no new mechanism.

## Amendments from the Architect's review

| # | Finding | Change in this version |
|---|---|---|
| A1 | Scope wording, not just files | Scope change put to Carl as a change of INPUT (§ Files) |
| A2 | Global R seams the spine | R ≤ the measured minimum half-width (5th pct); max-normal-angle readout |
| A3 | Stem mask makes a cliff | Box SDF + smooth max; the stem rectangle emitted by the script |
| A4 | Verification | `git status --porcelain`; mask mode; IoU control; edge distance; framing from the transform |
| A5 | Renderer parity | `/about`'s renderer copied and stated (+ `shadows="soft"`, the Builder's addition); overlay as DOM `<img>` |
| A6 | Studio light | Lightformers only, no preset; the bench header explains glass vs metal |
| A7 | "Room" = reflection | Labelled "room reflection — no take light"; values not copied |
| A8 | Grid flanks; "exact" overstated | Edge band + max z-step readout; claim corrected; two loops named under Coupled values |
| A9 | Open edges by index | Counted on welded positions |
| A10 | Origin's reason | Pivot claim removed |
| A11 | Room-size view; numbers for chunk 2 | ~70 CSS px view; triangles and build ms (timed in an effect) |
| A12 | Gold colour | Physical gold F0, one starting value |
| A13 | What it stands on | Bottom/side view at the checkpoint; the question goes to Carl |
