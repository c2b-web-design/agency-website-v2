# Structural note — the hero's liquid: the logo's mass as blobs (9 November 2026) — v1.3

**v1.1:** Carl answered Q-C1 and Q-C2 (below, *Questions for Carl*): the blobs stay in the air; the logo forms just above
its landing spot.
**v1.2:** Q-C3 discussed (WebGL); the Builder's recommendation added (next section). Carl: *"proceed with your
recommendation."*
**v1.3:** answers **review 11** (`review-11-structural-note-hero-liquid-9-november.md`, the Architect on v1.0: four
major, four moderate, three questions, two minor). Adopted findings change the body and are marked **[R11-n]**; the two
disputed are disputed with a measurement or the record. The answers in one place:

| | Finding | Answer |
|---|---|---|
| R11-1 | A mid-sequence recapture jumps the reflection and drops a frame | **ADOPTED.** ONE capture, the lean's own (at the logo's centre, already taken), used for the WHOLE sequence; no recapture until the formed logo has landed. Item 7 amended |
| R11-2 | Fading a 7.6 cm logo's weight wears holes, not a drain | **ADOPTED.** The emergence's look is a visual decision: the FIRST probe after the shade null control, judged by Carl's eye; candidates: an even shrink against a DIRECTIONAL DRAIN (a front sweeping across the logo, toward the right). Item 2 amended |
| R11-3 | Per-frame rescaling makes the blobs breathe | **ADOPTED.** The paths are fixed, so the motion is deterministic: the strength curve is SOLVED ONCE along the choreography (at load or offline) and played back with no runtime feedback. The per-frame volume reading is VERIFICATION only. The ±1 % bar stays as the instrument's bar, stated as such (not a perception bar). Item 4 amended |
| R11-4 | A and C were priced with a needless cube grid | **ADOPTED.** C's box can be rotated to the lean and stretched (200 × 104 × ~60 cm at grid 72: cells ~2.8 × 1.4 × 0.8 cm, ~9 across the thickness); the field then needs our own fill code, not `addBall`. A's compute grid has no cube constraint. **Precision is no longer marginal for A or C; C's CPU cost is unchanged** (grid 72 is still ~373 k cells, ~18 ms here). Pricing table amended. Not tried |
| R11-5 | §5b missed who owns the material | **ADOPTED, STRUCTURAL.** The material and the capture live inside `HeroLogo`, rebuilt when the capture arrives and the old one disposed a task later. **Proposed: the liquid mounts INSIDE `HeroLogo`**, which becomes the owner of the red body in all its states (solid mesh, liquid, solid mesh). No lifting up the tree; the material never leaves its owner, so nothing holds a disposed one. §5b and *Files* amended. **For the Architect to rule on** (Q-A7) |
| R11-6 | B's couplings misstated | **ADOPTED.** Checked at source: the capture renders its own scene (`useReflection`'s reflection scene), so no route appears in its own reflection; the glow's MRT gives every material `glow: vec4(0)` by default (`hero-bloom.ts:84`). Both removed as B-specific risks. B's real risk stays Q-A3: identical lighting with an overridden position and normal |
| R11-7 | The distance bake is unpriced, its grid too tight | **ADOPTED.** A ±20 cm margin makes a 3D grid ~1.7 M values (~10×). **Preferred candidate: an ANALYTIC extrusion**: a 2D distance texture of the logo's OUTLINE (e.g. 0.5 cm texels with a margin, ~0.1 M values) combined with the thickness by the standard extrusion formula, the bevel as a rounding. Exact for an extruded shape, small, cheap to bake (in the existing worker, beside `buildLogoMarkGeometry`). The dome/bevel profile is approximated: its difference against the mesh is what the handover's null control measures. Not verified |
| R11-8 | The handover null control has no bar | **ADOPTED, bar set now:** the logo's pixels, field logo against mesh, same frame and camera: **mean ≤ 1.0, p99.5 ≤ 6** (the reflection's null bars). **If a still frame fails because the bevels round off:** the swap is made at the first bulge, while the logo is already moving, and judged by Carl frame-stepped. That fallback is a decision for Carl, recorded as a proposal here, not taken |
| Q: 70 L looks small | | **ALREADY ANSWERED by Carl, 8 November (D-101):** *"try to mirror to blobs actions and movement in the video but within the volume we have to play with."* The true mass is kept. The first emergence probe shows him the scale anyway, as the review asks |
| Q: the formation is the Builder's | | **PARTLY ADOPTED.** The FORMATION is Carl's (*"After that they go to the middle and [form] the solid red logo. It would be in the air at this point"*, D-101). The MECHANISM (the same distance field, its weight rising) is the Builder's: marked as a TAKE in item 2 |
| Q: Q-C3 answers itself | | **DISPUTED, MEASURED.** "WebGL has no reflection" holds for the old WebGL MEDIUM (`?medium=webgl`). Visitors without WebGPU get the WebGPU medium on its **WebGL 2 FALLBACK**, where the hero's WebGPU part still loads. Measured this session (`&forcewebgl=1`): drew on `webgl2`, the capture ran (1, skips 0, give-ups 0), the logo wore it (`PMREM.cubeUv`), console clean. **So the fallback HAS the reflection with the text.** Not pixel-compared against WebGPU; one view |
| Minor: C in a Web Worker | | **ADOPTED** as a variant of C (C-w): the field and triangles built in a worker, the buffers handed back. It frees the main thread but must still finish within a frame (~18 ms here at grid 72), so it is still priced as risky on slower machines |
| Minor: the handoff is stale | | **NOT A FAULT.** Session 3 is THIS session; the handoff is replaced at its end, as CLAUDE.md requires |

**The recommendation after review 11: still route B, on the same condition.** R11-4 makes A's precision sound, so A is a
stronger second; C's cost is unchanged.

## The Builder's recommendation: ROUTE B, conditional — Carl: *"proceed with your recommendation"*

**Route B (raymarched metaballs), on one condition: its shade null control passes first.** All three routes stay in this
note for the Architect, as Carl asked; this is the Builder's view and Carl's direction to proceed with it, not a closed
choice.
- **Why not C.** The emergence needs the 7.6 cm logo in the field: ~18 ms of CPU per frame on Carl's PC at grid 72,
  over a 60 fps frame by itself, and the fallback machines are the slower ones. Cheapest to build; most likely to
  stutter.
- **Why not A first.** WebGPU only (compute, atomics, indirect draws): the WebGL 2 fallback would need a second version
  or the solid story. Its grid is still marginal for the logo's thickness.
- **Why B.** The logo's thinness costs nothing (its own distance texture); the blobs are smooth at any size; the neck is
  the smooth minimum itself; its cost follows the screen the liquid covers, not the 570 cm space; and it runs in BOTH
  systems (a material, which three translates to WebGL 2; **not tested**). So the liquid can play for everyone through
  one implementation (Q-C3).
- **⛔ THE CONDITION (Carl's T2 rule).** B lights the hit with a node rebuild of the logo's material. **First probe: a
  raymarched sphere beside a mesh sphere of the same material, same light, same reflection, compared pixel by pixel**,
  with the tolerance set before the run. **If it fails, B is out**, whatever else it does well; A is the next route.
- **Then, in order** (each its own step, Carl's eye at each): one blob coming out of the logo (the logo's distance
  texture, the first handover's null control, and **[R11-2] the drain's look: an even shrink against a directional
  drain, with the true 70 L scale shown**); the blobs and the right wall (~4 s); the volume held; the formation
  above the landing spot and the second handover. Each measured on WebGPU and on the fallback (`&forcewebgl=1`).

**Status:** PROPOSED. Nothing is built. **For the Architect: all three routes, priced** (Carl: *"all 3 for the
architect"*). The choice of route is Carl's, after the Architect's review and the probes proposed below.
**Authority:** Carl, *"lets open them and proceed"*, after the homework (source, film, live site).
**Record:** D-101, from *"THE BLOBS OPENED; THE HOMEWORK"*. The choreography is D-101's *"PHASE 1's LIQUID
CHOREOGRAPHY"* (8–9 November).

## The ask, in Carl's words

- **One body.** *"There is not 2 red logos. It is one that goes from solid to liquid and back to solid. Is any new mass
  created?"* No new mass: **70,085 cm³ (~70 L)**, measured from the 2 m mesh.
- **The movement.** *"they should emerge from the logo, taking its mass with it. they would go towards the right side wall,
  bouncing off it a few times as in the video. After that they go to the middle and [form] the solid red logo. It would be
  in the air at this point. When solid, it would fall to the floor."* The landing is *"more balanced"* than the first, and
  lands where the upright logo stands now.
- **The emergence.** *"so they must emerge out of the logo like that [`wallx`] and our wall will be on the right hand
  side."* *"we only need half of that. As if the blobs have already entered the logo. We only need them to come out with
  the logos mass."*
- **The timing.** *"The effect youve just seen can be done on the right for about 4s before the blobs congregate in the
  middle to form a solid logo."*
- **The blobs.** *"the blobs should not be equal in volume. We do not want many bubbles either. smaller blobs. You could
  have a larger blob, that would show the refection well."* The Builder's starting take, not a pick: five blobs at
  50 / 20 / 15 / 10 / 5 % of the volume (Ø ~41, 30, 27, 24, 19 cm).
- **The shade.** *"Ant intense shade difference and it could be perceived as a differet object. Like the T100 amd Hasta la
  vista baby at the end of T2. Solid to liquid."* The liquid wears the LOGO's material: `#9c0000`, metalness 1,
  roughness 0.4, and the logo's reflection.
- **The reflection.** *"show the glowing text in it. Not so much in the solid state but definately in the liquid state."*
- **Standing rules.** Nothing may read as a glitch (D-101, 5 November). Price every layer for the audience (D-108).

## What the homework measured (D-101)

- **How `wallx` makes the neck.** `addPlaneX` adds a flat plane to the SAME scalar field as the blobs. One field, one
  isosurface: the bulge, neck and pinch-off are that surface. **A blob can only neck out of the logo if the logo is in the
  same field.** A logo mesh beside a blob mesh gives two surfaces crossing, with a seam.
- **three's `MarchingCubes`** (r185 addon): a CUBE grid, one resolution on all three axes. The geometry is rebuilt on the
  CPU every frame.
- **Cost, this PC.** CPU rebuild (Node, 5 blobs + floor + wall, median): 0.95 ms at grid 28, 3.1 at 40, 8.0 at 56,
  17.6 at 72, 43.5 at 100. Live example, Carl's Chrome, `wallx` on: 60 fps up to grid 56, 43 at 72, 18 at 100.
- **Our scale.** The space runs from the leaning logo (x ≈ −134 cm) to the page frame's right edge at the text's depth
  (434.5 cm): **~570 cm**. At grid 56 a cell is ~10 cm. The small blobs (Ø 19–24 cm) would be ~2 cells across, and
  the logo (**7.6 cm thick**) is thinner than one cell, so it cannot be in the field. The example looks smooth because its
  blobs fill its box.

## What every route must provide

These hold whichever route is chosen. They are the note's structure; the routes only differ in how the field is turned
into pixels.

1. **ONE FIELD.** A scalar field holding: the blobs (metaball terms); the LOGO term during the emergence (at the lean)
   and the formation (just above the landing spot, Q-C2); the RIGHT WALL as a plane term. No floor: the blobs stay in
   the air (Q-C1).
2. **THE LOGO AS A FIELD TERM.** The logo's signed distance, fitted to the logo, not to the 570 cm space. **[R11-7]**
   Preferred: an analytic EXTRUSION of a 2D distance texture of the outline (~0.1 M values with a ±20 cm margin), baked
   in the existing worker; a full 3D grid with the margin would be ~1.7 M. The term has a weight: 1 → 0 as the blobs
   leave (the emergence), 0 → 1 as they gather (the formation). **[R11-2]** How the weight falls is a VISUAL decision:
   an even shrink wears a 7.6 cm plate into holes; a DIRECTIONAL DRAIN (a front sweeping across it) may read as liquid.
   Probed and judged by Carl's eye. The formation re-using this term is the Builder's TAKE; the formation itself is
   Carl's.
3. **TWO HANDOVERS between the solid mesh and the field.**
   - Start: the lean's mesh is swapped for the field's logo, at full weight, on one frame.
   - End: the field's logo, formed in the air, is swapped for the mesh, which then falls.
   - ⛔ **Each swap must be invisible.** Verified by a null control: the field's logo against the mesh, same frame, same
     camera, the logo's pixels, before anything moves. **[R11-8]** Bar: mean ≤ 1.0, p99.5 ≤ 6. If the bevels' rounding
     fails it on a still frame, the proposal (Carl's call) is to swap at the first bulge, judged frame-stepped.
4. **NO NEW MASS, HELD, NOT ASSUMED.** Metaball fields ADD where they overlap, so merging (and the necks) inflate the
   surface. **[R11-3]** Not corrected at runtime (rescaling every frame makes every blob breathe at each merge): the
   motion is deterministic, so the strength curve is SOLVED ONCE along the choreography (at load or offline) and played
   back. The enclosed volume is still measured every frame, as VERIFICATION: 70,085 cm³ ± 1 % (the instrument's bar, not
   a perception bar).
5. **THE MOTION.** Fixed paths, as the reference (`sin`, `|cos|`), not physics:
   - the emergence (the logo's weight falls as the blobs bulge out of its right face, neck and pinch off);
   - ~4 s moving and bouncing against the right wall;
   - the gathering to the middle and the formation in the air;
   - then the mesh's fall and the balanced landing (the mesh's motion, outside this note).
   - The phases need ONE clock. On the bench: a loop with a dev control for the first takes. The hero's phase sequencer is
     another note.
6. **THE MATERIAL IS THE LOGO's.** `#9c0000`, metalness 1, roughness 0.4, the same `envMap` (the reflection capture
   with the glowing text), the same lights. ⛔ Verified by a null control: liquid and logo side by side, same light, same
   reflection, the shade within a tolerance set before the run.
7. **THE REFLECTION.** One capture serves the one body. **[R11-1]** It is the lean's own capture (at the logo's centre,
   already taken), used for the WHOLE sequence: no recapture from the first bulge until the formed logo has landed. A
   recapture mid-motion would jump the reflection and costs ~20 ms (a dropped frame). The capture renders its own scene,
   so the body is never in its own reflection. Measured: the capture also runs on the WebGL 2 fallback.
8. **THE RIGHT WALL** is a plane term just outside the page frame's right edge. The frame's edge depends on depth
   (perspective), so the wall is placed at the edge at the blobs' mean depth. The sheet itself must stay off screen;
   only the bulges at the edge are seen.

## The three routes

### A. Marching cubes on the GPU (WebGPU compute)

The same algorithm as the example, moved to the GPU.
- **How.** Compute pass 1 evaluates the field into a storage buffer (blobs, logo grid sample, wall). Pass 2 runs marching
  cubes and appends triangles to a storage buffer with an atomic counter. The mesh draws them indirectly.
  - r185 has the pieces: `atomicAdd`, storage buffers, `IndirectStorageBufferAttribute`, `BufferGeometry.setIndirect`
    (all found in the installed source; **none tried here**).
- **Shade.** The triangles draw with the logo's `MeshStandardMaterial`. The shade match is then automatic; the null
  control still runs.
- **Scale.** A finer grid becomes affordable, but the grid is still one cube over the space. 570 cm at grid 192 is a
  ~3 cm cell: 2–3 cells across the logo. **Marginal for the emergence**, comfortable for the blobs.
- **Volume.** A reduction pass (inside cells × cell volume), read back a frame late.
- **Cost.** GPU: **not measured.** Memory: grid 192 is 7.1 M cells, ~28 MB for the field alone, plus the triangle buffer
  sized for the worst case. Load: small (code).
- **Structural.** A new compute pipeline and two new GPU buffers (CLAUDE.md §5a): a second instance of expensive GPU
  resources, owned by the liquid.

### B. Raymarched metaballs (a distance field drawn per pixel)

No mesh. Each pixel of a proxy box marches into the field until it hits the surface.
- **How.** A box mesh around the liquid, with a node material whose fragment marches: the blobs as analytic spheres
  joined by a smooth minimum (this IS the bulge-neck-pinch look); the logo as the baked 3D texture (`texture3D`); the
  wall as a plane. The hit's position and normal replace the surface's, and its depth is written (`depthNode`), so it
  sits correctly among the text and the floor.
- **Shade.** The hit is lit by the node version of the logo's material (`MeshStandardNodeMaterial`, same colour,
  metalness, roughness, `envMap`). The null control (a raymarched sphere against a mesh sphere of the same material) must
  pass **before** anything else is built.
- **Scale.** No grid for the blobs: smooth at any size. The logo's precision is set by its own distance texture
  ([R11-7]: an outline texture extruded analytically, ~0.1 M values with a ±20 cm margin; a full 3D grid would be
  ~1.7 M).
- **Volume.** Not available from the drawing. Measured by sampling the field on a coarse grid (compute or CPU) every few
  frames.
- **Cost.** GPU per pixel: steps × (blobs + one texture lookup), so it grows with how much SCREEN the liquid covers, not
  with the space. **Not measured.** Load: small, plus the logo's distance texture (baked at load from the mesh, or
  shipped: ~166 k values).
- **Couples to [R11-6]:** NOT the glow (its MRT gives every material `glow: vec4(0)` by default, `hero-bloom.ts:84`) and
  NOT the capture (it renders its own scene). The real risk is Q-A3: identical lighting with an overridden position and
  normal.
- **Structural.** A new rendering technique on the site. No new GPU pipeline beyond a material.

### C. A travelling box on the CPU (the example, as is)

three's `MarchingCubes`, unchanged, with its cube box moving with the blobs.
- **How.** The box covers only where the blobs are. Its moves are snapped to whole cells, so the surface does not
  "swim" as the grid slides under it (a glitch risk).
- **Shade.** The logo's `MeshStandardMaterial`, directly.
- **Scale.** The blobs' spread decides the box. The 4 s against the wall and the gathering may need ~250 cm or more:
  grid 56 gives a ~4.5 cm cell. **The emergence still needs the logo in the field:** a box around the logo (≥ 200 cm) at
  grid 72 gives a 2.8 cm cell, **~18 ms of CPU per frame on this PC** during the emergence. That is over a 60 fps frame
  on its own, before the audience's slower machines.
- **Volume.** Counted on the CPU from the field (cheap at these grids).
- **Cost.** CPU: measured above. Works in BOTH media (it is an ordinary dynamic mesh). Under WebGPU, the addon's dynamic
  attributes with `setDrawRange`: **not tried.**
- **Structural.** No new GPU resource. A per-frame CPU job on the main thread.

### Pricing (D-108)

| | A. GPU grid | B. Raymarch | C. Travelling CPU box |
|---|---|---|---|
| The emergence (logo 7.6 cm in the field) | sound: no cube constraint [R11-4] | by its own texture: fine | sound in a stretched box (~9 cells across) [R11-4], but ~18 ms CPU here (C-w: in a worker, off the main thread, same time) |
| Blobs smooth at our sizes | yes | yes, any size | yes, if the box stays small |
| Shade match | automatic (same material) | by a node port, to be proven | automatic |
| Volume held | GPU reduction | sampled separately | CPU count |
| Per-frame cost | GPU, **not measured** | GPU per pixel, **not measured** | CPU, **measured** |
| Media | WebGPU only | WebGPU (TSL) | both |
| New on the site | a compute pipeline | a raymarched surface | nothing (an addon) |
| Showcase value (a technique clients may want) | high | high | low |

## Proposed before any choice: one probe per route

*"Build the track before adding automation"* (§14a). On the bench, in the hero's space, each route draws **one blob
coming out of the logo**, nothing more. Each is measured at Carl's window and density (frame time, the frame's
percentiles, the cold load), and on a throttled run as the audience's proxy (Q-A4). Carl judges the three by eye. The
two lower-cost to build (C, then B's sphere null control) can come first. The probes are throwaway code, and say so.

## What depends on what changes (§5b)

- **⛔ [R11-5] WHO OWNS THE MATERIAL.** The material and its capture live inside `HeroLogo` (`hero-logo.tsx`), rebuilt
  when the capture arrives, the old disposed a task later. A sibling liquid holding a reference would draw a destroyed
  material (the 5 November rule). **Proposed: the liquid mounts INSIDE `HeroLogo`, which owns the red body in all its
  states**; the material never leaves its owner. Structural (§5a, ownership): **Q-A7**.
- **The logo's mesh** is always drawn today. During the liquid it must not be (the one-body rule): HIDDEN by its owner
  (kept, its material and capture live), not unmounted.
- **The reflection capture** stays keyed to the lean's centre and is NOT retaken during the sequence [R11-1].
- **The hero's `ready`** waits for the text and the logo with its studio. The liquid must not delay the first frame:
  it is built after `ready`.
- **The selective glow (MRT)**: route B writes its own fragment (above). A and C draw ordinary materials.
- **The bench's cost readout** (`__benchCost`) and the WebGPU medium: the liquid's cost must show there.
- **WebGL**: the hero has no reflection there. Whether the liquid exists in WebGL at all is Q-C3.

## Files (scope needed, Carl's)

- NEW `components/showcase/hero-liquid.tsx` (the field, the motion, the volume, the handovers).
- NEW per route: `hero-liquid-webgpu.tsx` (A or B, loaded only in the WebGPU medium, as `hero-idea-webgpu.tsx` is).
- `hero-logo.tsx` (mounts the liquid INSIDE `HeroLogo` [R11-5]; the mesh hidden during the liquid). `hero-idea.tsx`
  only if the sequence's clock is passed down from the hero's scene.
- The logo's outline distance texture: baked in the existing worker (`desk-mark.worker`, /about's) or beside it [R11-7].
- The probes: throwaway, on the bench, removed after the choice.

## Questions for the Architect

- **Q-A1.** Is the one-field design right, with the logo as a baked distance grid whose weight hands the mass over? Or is
  there a cheaper way to get the neck out of a thin solid?
- **Q-A2.** Route A: is r185's compute + `setIndirect` path sound for a per-frame variable triangle count? What breaks
  first?
- **Q-A3.** Route B: can a raymarched hit go through `MeshStandardNodeMaterial`'s full lighting (the PMREM `envMap`,
  the lights) so that the shade is IDENTICAL to the mesh? And the MRT for the glow?
- **Q-A4.** The audience proxy: what throttle (CPU ×4? a low-power GPU flag?) stands in for the people who will see the
  site, for the probes' numbers?
- **Q-A5.** The volume measure: what accuracy is achievable at each route's resolution, and is ±1 % a sound bar?
- **Q-A6.** The handovers (mesh → field, field → mesh): what is the failure mode most likely to show as a glitch?
- **Q-A7 [R11-5].** The liquid mounted INSIDE `HeroLogo` (the owner of the red body in every state), rather than the
  material lifted up the tree: sound?
- **Q-A8 [R11-7].** The analytic extrusion of a 2D outline distance texture for the logo's term: is its approximation of
  the dome and bevel acceptable, given the handover's null control measures exactly that difference?

## Questions for Carl

- **Q-C1. ANSWERED.** Carl: *"no, they stay in the air. when the logo is fully formed it drops to the ground."* → No
  floor term in the field; no floor fold. The field holds the blobs, the logo and the right wall only.
- **Q-C2. ANSWERED.** Carl: *"we calculated where the logo ends up before we moved it to the leaning position. It will
  fall to that position, so just above it."* → The formation happens **just above the landing spot**: the balanced
  upright position (`HERO_LOGO_PLACE` in `hero-logo.tsx`: centre x ≈ 132 cm, at the text's face). The formed logo falls
  straight down onto it. The field's logo term for the formation sits there, not at the lean.
- **Q-C3. DISCUSSED.** WebGL (no WebGPU). Carl: *"Most browsers have incorporated WebGPU since 2023"*: Chrome and Edge
  since 2023, Safari 26 and Firefox (Windows, Apple Silicon) since 2025; the rest is a minority (Firefox on Linux and
  Android, older Linux GPUs and Android phones, blocked drivers, un-updated browsers). Carl: *"so are you saying the
  liquid cannot be done with WebGL?"* → No: routes B and C are WebGL-era techniques (the example itself is WebGL); only
  A needs WebGPU. With route B (recommended), the liquid plays on the fallback too, through one implementation; its
  smoothness there is MEASURED, not assumed.

## Verification (for whichever route is chosen)

- Null controls: the field's logo against the mesh (each handover); the liquid's shade against the logo's.
- Volume: 70,085 cm³ ± the bar, every frame of the 4 s, published as a series with its skips counted.
- No glitch: frame-to-frame surface change measured (no swimming, no popping); flicker checked by frame-stepping.
- Cost: frame time at Carl's window and density, cold load, and the audience proxy.
- `tsc` clean, lint at the baseline, console clean.
- ⚠ NOT WATCHED (to be printed with each result): phones; reduced motion (deferred to mastering, D-094).
