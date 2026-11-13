# The hero, phase 2 (the rain): homework, 13 November 2026 (session 2)

Carl: *"lets prepare for it. look at the files that deal with Phase 2 and visit here for a closer look.
https://threejs.org/examples/#webgpu_compute_particles_rain"*

Read: D-101 (Carl's rulings, below), `live-work/hero-concept-8-november/brainstorm-record.md`, its `rain-sliders.mjs`,
the reference film `Videos\C2B Films\03 The hero\00 References\rain-sliders-8-november.mp4` (2:42, contact sheet looked
at), and the example's source at OUR version, r185 (`raw.githubusercontent.com/mrdoob/three.js/r185/examples/
webgpu_compute_particles_rain.html`, 368 lines). Nothing built.

## What is already RULED (Carl's words in D-101)

- **8 Nov:** beat 2 is LOCALISED PLATINUM BLUE RAIN on the logo; red because HOT; the rain COOLS it to PLATINUM BLUE.
  STEAM (fog or a VDB volume) raised, NOT chosen.
- **10 Nov:** the rain hits *"not just the logo but the floor around it too"* — splashes on both.
- **10 Nov, the floor (phase 4, which runs DURING phases 1 and 2):** the projector example's cell pattern appears on the
  floor when the red logo DROPS, REDDISH from the heat; the rain cools it to a BLUISH pattern; it spreads from the logo's
  footprint and fades with distance, no edge; the floor's own glow, not a projector lamp.
- **10 Nov, the principle:** *"Every frame tells a story"* — every layer is caused by what came before it.
- **9 Nov, the standard:** each STATE's colour consistent (red, platinum blue, gold).
- **Brand colour:** Platinum Blue is read from the site (the `Next step` button family), not a stock sheet (31 Oct).

## How the example works (four parts)

1. **The drops live on the GPU.** 50,000 positions and velocities in GPU buffers (`instancedArray`), moved every frame
   by a compute shader. 25,000 are drawn (`instanceCount` is half the buffer).
2. **The collision is a HEIGHT MAP from above.** An orthographic camera looks straight down and renders only the objects
   on layer 1 (the monkey, the box) into a 1024 × 1024 half-float target, writing each pixel's world POSITION. Each drop
   reads the height under it; below it, the drop respawns at the top at a new random spot and leaves a SPLASH there.
3. **The splash** is one small mesh per drop: a flat ring and two crossed upright planes (a crown), expanding rings drawn
   by its clock, fading in ~3 s.
4. **The drops** are thin billboards (0.1 × 2 units) with a soft vertical glow, transparent, not lit.
   The "dry patch" in the film is the box acting as an UMBRELLA over the monkey; the sliders move and stretch it.

## What it does NOT do that our story needs

- **It changes nothing it hits.** Our rain must COOL the logo, red → platinum blue, where it lands. That is a cooling map
  on the logo the hits write into, read by its material (the hardening's dial, per point this time).
- **Vertical rain only hits what faces UP.** From above, our face-on logo is a 7.6 cm-deep strip along its top edges;
  the FACE is vertical and no drop ever touches it. So the face must cool by what water does: it hits the top edges and
  RUNS DOWN. We already have the machinery: the flow map's gravity order runs the same way.
- **It rains everywhere** (100 × 100 units). Ours is LOCALISED on the logo and the floor around it, so it needs a soft
  edge, not a box (the no-edge rule; the no-glitch rule).
- **It is white.** Ours is platinum blue.
- **Its speed depends on the screen.** It adds a fixed step EVERY FRAME (no `deltaTime`), so it falls twice as fast at
  120 Hz and cannot be frame-stepped for our films. Ours must move by time.
- **It renders the scene twice a frame** (the height map, then the picture). Ours can render the height map ONCE: the
  logo is still in phase 2 (it has landed). That removes the main extra cost (to be priced, D-108).
- **The WebGL 2 fallback is unverified** (the brainstorm's open proof): whether the compute runs for a browser without
  WebGPU. A probe, as the liquid's capture was measured on the fallback (9 Nov).

## Open, Carl's

- When the rain starts (on the landing's last wobble?), how long it lasts, how heavy, and how it ends.
- How the cooling reads on the face: from the top edges running down (the Builder's suggestion), or another way.
- ✔ The floor (phase 4) — ANSWERED: *"the floors pattern can be put in after phase 2. Its basically the same geometry all
  that will differ is the colour of the pattern on the floor depending on whether is hot or cold touchimg it."* Built
  after phase 2: one pattern, coloured by what touches it.
- Steam: still raised, not chosen. A red-hot metal under rain is where it would be caused by the world.
- The rain's look: streak length and width at our scale (4.41 units per cm), its density, the splashes' size.
