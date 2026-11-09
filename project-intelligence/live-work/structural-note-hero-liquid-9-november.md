# Structural note — the hero's liquid: the logo's mass as blobs (9 November 2026) — v1.5

**Status:** ✔ **APPROVED by Carl as v1.5** (*"i will trust your judgement.  as it stands"*, 9 November 2026,
session 3), without a further Architect round, on his word. Nothing is built. **The Builder's recommendation: ROUTE B, conditional** (Carl: *"proceed with your
recommendation"*). All three routes stay in the note for the Architect, as Carl asked. Two decisions are Carl's before he
approves the route: **D1** (the landing's reflection, R12-2) and **D2** (the handover fallback, R11-8). **v1.5: BOTH
DECIDED by Carl:** *"D1 your recommendation   D2 yes"* → **D1-a** and **D2 yes** (below).
**Authority:** Carl, *"lets open them and proceed"*, after the homework (source, film, live site).
**Record:** D-101, from *"THE BLOBS OPENED; THE HOMEWORK"*. The choreography is D-101's *"PHASE 1's LIQUID
CHOREOGRAPHY"* (8–9 November).
**History:** v1.0 written; v1.1 Carl's answers to Q-C1, Q-C2; v1.2 the recommendation; v1.3 answered **review 11**
(`review-11-…`); **v1.4 answers review 12** (`review-12-…`) and carries every adopted finding through the body (R12-1).
v1.3 is kept verbatim as `structural-note-hero-liquid-9-november-v1.3.md`, history only. This body is the whole current
proposal; where it and v1.3 differ, this body holds.

## The ask, in Carl's words

- **One body.** *"There is not 2 red logos. It is one that goes from solid to liquid and back to solid. Is any new mass
  created?"* No new mass: **70,085 cm³ (~70 L)**, measured from the 2 m mesh. On the scale: *"within the volume we have
  to play with"* (8 November).
- **The movement.** *"they should emerge from the logo, taking its mass with it. they would go towards the right side wall,
  bouncing off it a few times as in the video. After that they go to the middle and [form] the solid red logo. It would be
  in the air at this point. When solid, it would fall to the floor."* The landing is *"more balanced"* than the first.
- **The emergence.** *"so they must emerge out of the logo like that [`wallx`] and our wall will be on the right hand
  side."* *"we only need half of that. As if the blobs have already entered the logo. We only need them to come out with
  the logos mass."*
- **The timing.** *"The effect youve just seen can be done on the right for about 4s before the blobs congregate in the
  middle to form a solid logo."*
- **In the air; where it forms.** *"no, they stay in the air. when the logo is fully formed it drops to the ground."* *"we
  calculated where the logo ends up before we moved it to the leaning position. It will fall to that position, so just
  above it."*
- **The blobs.** *"the blobs should not be equal in volume. We do not want many bubbles either. smaller blobs. You could
  have a larger blob, that would show the refection well."* The Builder's starting take, not a pick: five blobs at
  50 / 20 / 15 / 10 / 5 % of the volume (Ø ~41, 30, 27, 24, 19 cm).
- **The shade.** *"Ant intense shade difference and it could be perceived as a differet object. Like the T100 amd Hasta la
  vista baby at the end of T2. Solid to liquid."* The liquid looks exactly like the LOGO's material: `#9c0000`,
  metalness 1, roughness 0.4, the logo's reflection.
- **The reflection.** *"show the glowing text in it. Not so much in the solid state but definately in the liquid state."*
- **Standing rules.** Nothing may read as a glitch (D-101). Price every layer for the audience (D-108).

## What the homework measured (D-101)

- **How `wallx` makes the neck.** `addPlaneX` adds a flat plane to the SAME scalar field as the blobs: one field, one
  surface, so the bulge, neck and pinch-off are that surface. **A blob can only neck out of the logo if the logo is in the
  same field.** A separate logo mesh gives two crossing surfaces and a seam.
- **three's `MarchingCubes`** (r185 addon): an ordinary mesh; its CPU rebuild every frame; `addBall` makes round balls
  only in the grid's own units.
- **Cost, this PC.** CPU rebuild (Node, 5 blobs + floor + wall, median): 0.95 ms at grid 28, 3.1 at 40, 8.0 at 56,
  17.6 at 72, 43.5 at 100. Live example, Carl's Chrome, `wallx` on: 60 fps up to grid 56, 43 at 72, 18 at 100.
- **Our scale.** ~570 cm from the leaning logo (x ≈ −134 cm) to the page frame's right edge at the text's depth
  (434.5 cm). The logo is **7.6 cm thick**. The example looks smooth because its blobs fill its box.
- **The fallback** (measured this session, `&forcewebgl=1`): visitors without WebGPU get the WebGPU medium on its
  **WebGL 2 fallback**, where the hero's WebGPU part still loads and **the logo's reflection capture runs** (1 capture,
  skips 0, give-ups 0, console clean). The old WebGL medium (`?medium=webgl`) is a bench mode, not what visitors get.

## What every route must provide

1. **ONE FIELD:** the blobs; the LOGO term (at the lean for the emergence, just above the landing spot for the
   formation); the RIGHT WALL as a plane. No floor term: the blobs stay in the air.
2. **THE LOGO AS A FIELD TERM [R11-7].** An analytic EXTRUSION: a 2D distance texture of the logo's outline, combined
   with the thickness by the standard extrusion formula, the bevel as a rounding. **[R12-7]** 200 × 104 cm with a
   ±20 cm margin at 0.5 cm texels: 480 × 288, **~0.14 M values** (a full 3D grid with the margin: ~1.7 M). Baked in the
   existing logo worker (`desk-mark.worker`) or beside it, off the main thread.
   - The term's weight: 1 → 0 as the blobs leave, 0 → 1 as they gather. **[R11-2]** How it falls is a VISUAL decision:
     an even shrink wears a 7.6 cm plate into holes; a DIRECTIONAL DRAIN (a front sweeping across it, toward the right)
     may read as liquid. Probed; Carl's eye.
   - The formation re-using this term is the Builder's TAKE; the formation itself is Carl's.
3. **TWO HANDOVERS** between the solid mesh and the field: the lean's mesh → the field's logo at full weight (start);
   the formed field logo → the mesh, which then falls (end). ⛔ **Each is invisible:** a null control, field logo against
   mesh, same frame and camera, the logo's pixels: **mean ≤ 1.0, p99.5 ≤ 6** [R11-8]. **D2 (Carl's):** if the bevels'
   rounding fails it on a still frame, the swap is made at the first bulge, while the logo is already moving, judged
   frame-stepped.
4. **NO NEW MASS, HELD, NOT ASSUMED [R11-3, R12-4, R12-5].**
   - Overlapping fields add, so merges and necks inflate the surface. Not corrected at runtime (rescaling every blob at
     each merge makes them all breathe).
   - **The curve is SOLVED AT DEV TIME and shipped as data**, re-solved for each take of the choreography [R12-5]: the
     motion is deterministic, so nothing is solved on the visitor's machine. **For route B the solved quantities are the
     blobs' RADII and the smooth-minimum's BLEND WIDTH**; for A and C, metaball strengths.
   - **The target stays 70,085 cm³ (the mesh's).** **[R12-4]** The extrusion's own volume at weight 1 differs from the
     domed, bevelled mesh: it is MEASURED as a check of the approximation (the same error Q-A8 asks about), and the
     curve starts from it, so the mass does not jump at the first handover.
   - **Verification only, every frame:** the enclosed volume, 70,085 cm³ ± 1 % (the instrument's bar, not a perception
     bar), published as a series with its skips counted.
5. **THE MOTION.** Fixed paths, as the reference (`sin`, `|cos|`), not physics: the emergence; ~4 s against the right
   wall; the gathering and the formation just above the landing spot; then the mesh's fall (outside this note). ONE clock
   for the phases; on the bench, a loop with a dev control. The hero's phase sequencer is another note.
6. **THE MATERIAL MATCHES THE LOGO's.** `#9c0000`, metalness 1, roughness 0.4, the same reflection, the same lights.
   ⛔ A null control: liquid and logo side by side, same light and reflection, the shade within a bar set before the run.
7. **THE REFLECTION [R11-1, R12-2].** The lean's own capture (at the logo's centre, already taken) serves the WHOLE
   liquid: no recapture during the motion (a recapture costs ~20 ms, a dropped frame, and jumps the reflection).
   - **Trade-off, stated [R12-2]:** for the liquid's ~5 m of travel, its reflection shows the text as seen from the lean,
     close and large. This serves *"definately in the liquid state"*; it is a choice, not a free fact.
   - **D1, Carl's: the landing's reflection.** The landed logo stands ~2.9 m right of the lean's centre.
     - **D1-a (Builder's recommendation):** a SECOND capture, of the landing spot, taken at load during the lean's hold
       (the reflection scene is static: the text and lights never move), swapped in on the LANDING FRAME, where the
       impact hides the change. Cost: a second capture target held at once (~6 MB on the GPU: a 768 × 1024 half-float
       atlas, the size measured today) and ~20 ms once, at load, not during the motion. **Structural (§5a: a second
       instance of a GPU resource).**
     - **D1-b:** never recapture: the landed logo keeps the lean's capture for good. No jump, no cost, but its reflection
       of the text is seen from ~2.9 m away from where it stands.
     - ⛔ Not offered: a recapture after landing (a jump on a still logo, the most visible moment).
8. **THE RIGHT WALL** is a plane just outside the page frame's right edge, placed at the edge for the blobs' mean depth
   (the edge moves with depth). The sheet stays off screen; only the bulges at the edge are seen.

## The three routes

### B. Raymarched metaballs — RECOMMENDED, conditional

No mesh. Each pixel of a proxy box marches into the field until it hits the surface.
- **How.** A box mesh around the liquid with a TSL node material whose fragment marches: the blobs as analytic spheres
  joined by a smooth minimum (the bulge-neck-pinch); the logo as the extruded outline texture (item 2); the wall as a
  plane. The hit's position and normal replace the surface's, and its depth is written (`depthNode`), so it sits among
  the text and the floor.
- **Shade.** The hit is lit through `MeshStandardNodeMaterial` with the logo's colour, metalness, roughness and
  reflection texture. **The condition:** a raymarched sphere beside a mesh sphere of the logo's material, pixel by pixel,
  bar set before the run. **If it fails, B is out and A is next.**
- **Scale.** No grid for the blobs: smooth at any size; the logo's precision is its outline texture's.
- **Volume.** Not available from the drawing: verified by sampling the field on a coarse grid (dev tool and harness).
- **Cost.** GPU per pixel: steps × (blobs + one texture lookup); it grows with the screen the liquid covers, not the
  space. **Not measured.** Load: the shader, the shipped curve, the outline texture (~0.14 M values, baked in the worker).
- **Couples to:** NOT the glow (its MRT defaults every material's `glow` to 0, `hero-bloom.ts:84`) and NOT the capture
  (it renders its own scene) [R11-6]. The real risk is Q-A3, identical lighting with an overridden position and normal.
- **Ownership [R12-3].** The node material is TSL, so it comes from the hero's WebGPU part (`hero-idea-webgpu.tsx`);
  `HeroLogo` imports only three and stays that way. The liquid reaches `HeroLogo` through a PROP SLOT from
  `hero-idea.tsx`, as `reflect` does today, and `HeroLogo` mounts it inside itself. **Shared with the logo: the
  REFLECTION TEXTURE only** (the capture's target, owned by `HeroLogo`'s capture holder, disposed a task late on a real
  unmount). The liquid's own material is the liquid's.
- **Structural.** A new rendering technique on the site; no new GPU pipeline beyond a material.

### A. Marching cubes on the GPU (WebGPU compute) — the second route

- **How.** Compute pass 1 evaluates the field into a storage buffer; pass 2 runs marching cubes and appends triangles
  with an atomic counter; the mesh draws them indirectly. r185 has `atomicAdd`, storage buffers,
  `IndirectStorageBufferAttribute` and `BufferGeometry.setIndirect` (found in the installed source; **none tried**).
- **Shade.** The triangles draw with the logo's own `MeshStandardMaterial`: the match is automatic; the null control
  still runs.
- **Scale [R11-4].** The compute grid has no cube constraint: it can be fitted and aligned to the logo for the emergence,
  then to the blobs. **Precision is sound for the logo's thickness.**
- **Volume.** Verified by a reduction pass, read a frame late (verification only, so the lag does not matter).
- **Cost.** GPU **not measured**; memory set by the grid (e.g. 192³ ≈ 28 MB for the field). Load: small.
- **Media.** WebGPU only: the fallback would need a second version or the solid story.
- **Structural.** A new compute pipeline and two new GPU buffers, owned by the liquid.

### C. three's marching cubes on the CPU, in a stretched box — kept for the record

- **How [R11-4].** The addon's mesh, its box rotated and stretched unevenly to fit (around the lean: 200 × 104 × ~60 cm
  at grid 72, cells ~2.8 × 1.4 × 0.8 cm, ~9 across the thickness). `addBall` makes round balls only in grid units, so
  **the field is filled by our own code**, not the addon's.
- **Shade.** The logo's `MeshStandardMaterial`, directly.
- **Cost.** Grid 72 is ~373 k cells: **~18 ms of CPU per frame on this PC**, measured, over a 60 fps frame by itself.
  **C-w:** the same in a Web Worker frees the main thread but still has to finish within a frame; **a worker is a new
  mechanism (§5a)**.
- **[R12-6]** Three boxes (fitted to the lean, travelling with the blobs, fitted to the upright for the formation) are
  three grids: each switch re-meshes the surface and shows as popping. The snapping rule covers a sliding box, not a
  swapped one.
- **Media.** All three (it is an ordinary mesh). Under WebGPU, dynamic attributes with `setDrawRange`: **not tried**.

### Pricing (D-108)

| | B. Raymarch | A. GPU grid | C. CPU box |
|---|---|---|---|
| The emergence (7.6 cm logo in the field) | the outline texture: fine | sound (fitted grid) | sound (stretched box), ~18 ms CPU |
| Blobs smooth at our sizes | yes, any size | yes | yes, if the box stays small; popping at box swaps |
| Shade match | by the node material, PROVEN FIRST | automatic | automatic |
| Volume | dev-time curve; sampled check | dev-time curve; GPU reduction check | dev-time curve; CPU count check |
| Per-frame cost | GPU per pixel, **not measured** | GPU, **not measured** | CPU, **measured: ~18 ms here** |
| **WebGPU** | yes | yes | yes |
| **WebGL 2 fallback (visitors)** | yes, **not tested** | **no** | yes |
| **Old WebGL medium (bench only)** | no (TSL) | no | yes |
| New on the site | a raymarched surface | a compute pipeline | a CPU job (C-w: a worker) |
| Showcase value | high | high | low |

## The live plan [R12-1]

**One plan is live: route B.** Its first probe is the sphere's shade null control; **A is probed only if that fails**;
C is kept for the record and not probed unless A fails too. *"Build the track before adding automation"* (§14a): each
step is its own, measured, and judged by Carl's eye:
1. The sphere: raymarched against mesh, the logo's material (the condition).
2. One blob coming out of the logo: the outline texture; the first handover's null control (bar, then D2); the drain's
   look, an even shrink against a directional drain; the true 70 L scale shown [R11-2].
3. The blobs and the right wall, ~4 s.
4. The volume curve solved at dev time and played back; the series verified.
5. The formation just above the landing spot; the second handover; D1's landing reflection.

Each measured on WebGPU and on the WebGL 2 fallback (`&forcewebgl=1`), at Carl's window and density, the cold load
included, and on an audience proxy (Q-A4). Probe code is throwaway and says so.

## What depends on what changes (§5b)

- **⛔ Who owns what [R11-5, R12-3].** The logo's material and capture live inside `HeroLogo`, rebuilt when the capture
  arrives, the old disposed a task later. The liquid is mounted INSIDE `HeroLogo` (the owner of the red body in every
  state), handed in through a prop slot from `hero-idea.tsx` because its material comes from the WebGPU part. It shares
  only the reflection texture, whose lifetime is `HeroLogo`'s. Structural: **Q-A7**.
- **The logo's mesh** is HIDDEN by its owner during the liquid (kept, its material and capture alive), not unmounted.
- **The reflection capture** stays the lean's for the whole liquid; D1 settles the landing.
- **The hero's `ready`** waits for the text and the logo with its studio; the liquid must not delay it. It is built after
  `ready`.
- **The glow (MRT)** and **the capture's own scene**: no coupling (above).
- **The bench's cost readout** (`__benchCost`) and both backends: the liquid's cost shows there.

## Files (scope needed, Carl's)

- NEW `components/showcase/hero-liquid.tsx`: the field's description, the motion, the shipped curve, the handovers.
- NEW (route B): the liquid's node material and proxy, in the hero's WebGPU part (`hero-idea-webgpu.tsx`, or a new
  `hero-liquid-webgpu.tsx` beside it).
- `hero-idea.tsx`: passes the liquid to `HeroLogo` through the slot **[R12-3: changes for B in any case]**.
- `hero-logo.tsx`: mounts the liquid inside `HeroLogo`; hides the mesh during it; (D1-a) the second capture.
- The outline distance texture: baked in the logo worker (`components/about/desk-mark.worker`) or a new worker beside it.
- A dev-time solver for the volume curve (a script in `live-work/`, its output shipped as data).
- The probes: throwaway, on the bench, removed after the choice.

## Questions for the Architect

- **Q-A1.** Is the one-field design right, with the logo as an extruded outline whose weight hands the mass over? Or is
  there a cheaper way to get the neck out of a thin solid?
- **Q-A2.** Route A (if B fails): is r185's compute + `setIndirect` path sound for a per-frame variable triangle count?
- **Q-A3.** Route B: can a raymarched hit go through `MeshStandardNodeMaterial`'s full lighting (the PMREM reflection,
  the lights) so that the shade is IDENTICAL to the mesh's?
- **Q-A4.** The audience proxy: what throttle stands in for the people who will see the site, for the probes' numbers?
- **Q-A5.** The volume check's accuracy at each route's sampling: is ±1 % a sound instrument bar?
- **Q-A6.** The handovers: what failure is most likely to show as a glitch?
- **Q-A7 [R11-5, R12-3].** The liquid mounted INSIDE `HeroLogo` through a prop slot, sharing only the reflection texture
  (route B), rather than the material lifted up the tree: sound?
- **Q-A8 [R11-7, R12-4].** The extruded outline's approximation of the dome and bevel: acceptable, given the handover
  null control and the frame-0 volume check measure that same error?

## Decisions for Carl (before he approves the route)

- **D1 — the landing's reflection [R12-2]: DECIDED, D1-a** (Carl: *"D1 your recommendation"*): a second capture of
  the landing spot, taken at load during the lean's hold, swapped in on the landing frame. Structural, approved by Carl
  as part of this decision (a second capture target, ~6 MB GPU).
- **D2 — the handover fallback [R11-8]: DECIDED, YES** (Carl: *"D2 yes"*): if a still-frame handover fails the bar
  because the bevels round off, the swap is made at the first bulge, while the logo moves, judged frame-stepped.

## Answered (kept for the record)

- **Q-C1.** *"no, they stay in the air. when the logo is fully formed it drops to the ground."* → no floor term.
- **Q-C2.** *"we calculated where the logo ends up before we moved it to the leaning position. It will fall to that
  position, so just above it."* → the formation just above `HERO_LOGO_PLACE` (centre x ≈ 132 cm, at the text's face).
- **Q-C3.** WebGL: the liquid can be done in WebGL (B and C are WebGL-era techniques; only A needs WebGPU). Visitors
  without WebGPU get the WebGL 2 fallback, where the reflection runs (measured). With B, one implementation serves both.

## Verification (for whichever route is built)

- Null controls: the shade (the sphere, first); each handover (bar above).
- Volume: the extrusion's volume at weight 1 against 70,085 cm³ (the approximation check); then the series, ± 1 %.
- No glitch: frame-to-frame surface change measured (no swimming, no popping); flicker checked by frame-stepping.
- Cost: frame time at Carl's window and density, cold load, the audience proxy; WebGPU and the fallback.
- `tsc` clean, lint at the baseline, console clean.
- ⚠ NOT WATCHED (printed with each result): phones; reduced motion (deferred to mastering, D-094); the old WebGL medium.
