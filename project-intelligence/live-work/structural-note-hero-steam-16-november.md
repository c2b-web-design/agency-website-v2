# Structural note: the hero's steam (phase 2's last layer). v1.0, 16 November 2026

**For Carl** (and the Architect, if Carl routes it). Nothing is built yet. Workflow 5a: this adds GPU resources, a file and
a hook, so it stops here before it is built.

**The brief.** Carl, 16 November 2026: *"Steam first. build it on the proto hero and we will take measurements. It shouldnt
run for the whole rainfall time or colour transformation. When rhe rain first fall that is when it should happen, so the
effect will be rather short."* This is the standing ruling of 14 November (D-101): volumetric, best first, using the method
of `webgpu_volume_fire` (smoke only), in a box sized to the logo, measured on Carl's PC.

**Homework.** I read r185's `webgpu_volume_fire.html` whole. Its cost on Carl's PC (8–9 fps) comes from **2,000,000 cells
(100 × 100 × 200) stepped at 120 Hz, up to 8 steps a frame**, plus a second volumetric pass at half resolution, blur and
bloom. Our bench draws with one plain `renderer.render` and has no post-processing pipeline.

## The proposed structure

1. **A new file, `components/hero/hero-steam.ts`.** It sits outside the open scope and needs Carl's word. It follows the
   rain's pattern: `createHeroSteam(floorY)` returns `{ group, settings, setLogo, update, compute, again, info, dispose }`.
2. **New GPU resources, alive only while steam exists:**
   - **Seven 3D storage textures** (rgba16f): velocity A/B, dye A/B (density, temperature, age), divergence, pressure A/B.
     There is also one curl-noise texture, computed once.
   - **The example's compute passes:** advect velocity (buoyancy, turbulence), divergence, Jacobi pressure (2–4 iterations),
     project, advect dye, emit.
   - **One solid mask** (a 3D texture made once on the CPU from the landed logo: the ink raster × the extrusion depth).
     It does two jobs:
     - **In the simulation:** the logo is an OBSTACLE. Steam rising from a lower surface meets the underside of the letter
       above, pools under it and spills round, instead of passing through the metal. That is "caused by the world".
     - **In the draw:** the ray stops at the metal, so steam behind the logo does not show through its face.
   - **One draw:** a box mesh, ray-marched (my own march in a node material, in the main pass). There is **no second render
     pass**, no extra render target and no depth pre-pass.
3. **The box and its grid:** the logo's footprint plus about 20 cm each side, from the lowest top surface to about 100 cm
   above the top. That is roughly 240 × 200 × 60 cm. At **2.5 cm cells** this comes to about 96 × 80 × 24 ≈ **184,000
   cells, about 11 times fewer than the example**, stepped **once per frame at 60 Hz** (the example steps up to 8). The cell
   size is a panel dial, so it can be measured.
4. **The hook (two existing calls, no new call on the bench):**
   - `createHeroScene` adds the steam group to the scene.
   - `update` passes it the rain's own input (the seconds since phase 1's end; the first drops land at 0) and the wash.
   - The scene's existing `compute(renderer)` steps the steam after the rain.
   - `hero-rain.ts` is not changed.
5. **Timing, from Carl's brief:** emission starts as the **first drops land** and lasts a short burst (`burstS`, a take,
   about 1.2 s). It is eased in and out and follows the rain's light opening, × the red still left (1 − wash, about 1
   then). After the burst the steam rises and thins (`lifeS`, about 2 s). Once the dye is gone the simulation **stops and
   the box is hidden, so it costs nothing outside about 3 seconds.** Replaying the story clears it.
6. **Where it is emitted:** the logo's **top-facing surfaces** where the rain lands, from the rain's hit map (the same
   CPU-made map) turned into emitter cells. Vertical rain only reaches surfaces that face up.
7. **The look, take 1:** neutral white steam lit by the scene's key and ambient, with the example's cheap self-shadow (2–3
   taps toward the key). It is not tinted by the logo, because the logo is not a light source (Carl's ruling on the rain,
   14 November). Lit by mesh → material → light: **take 1 judges the MOTION and the COST**, and the look is the next take.
8. **Panel, a Steam folder:** on, amount, burst length, rise (buoyancy), turbulence, life, cell size, ray steps, "Steam
   again". A read-out of cell count and a live/idle flag goes on `__heroBench`.

## Rejected, and why

- **The example's VolumeNodeMaterial with its separate volumetric lighting pass, blur and bloom:** a second render of the
  scene each frame, which is the cost we are trying to avoid. Our march draws in the main pass.
- **Emitting from the logo's vertices** (the example's teapot method): the logo has about 295,000 face triangles, and their
  vertices are not where the rain lands. The hit map already says where it lands.
- **Emitting at each drop's actual splash** (the rain's compute writing into the steam's texture): it couples the two
  files' GPU work. The hit-map emitter gives the same spread for a uniform rain.
- **No obstacle:** cheaper by one texture read per pass, but the steam would rise through the letters and show through the
  face.
- **A depth pre-pass for occlusion:** a second render. The solid mask does the same job inside the material.

## Price (D-108), to be measured

- **Download:** none (code only).
- **GPU memory:** about 1.5 MB per texture × 8, plus the mask, roughly 15 MB, freed when the bench is disposed (and only
  stepped during the burst).
- **Frame cost:** **unmeasured.** It is measured on Carl's PC during the burst, at the default cell size and one size
  either side.

⚠ Unasserted: the cell counts above are estimates from the logo's recorded size (2 m × 103.9 cm × about 7.6 cm). The real
box comes from the hit map at run time and is shown in the read-out.

---

## v1.1, 16 November 2026: as built (Carl authorised the file; the structure built as above, with three changes)

1. **`hero-rain.ts` gained ONE read-only getter**, `sinceFirstLanding` (the rain's own clock minus its lead). v1.0 said the
   rain was not changed. The getter means the steam follows the rain's clock, so "Rain again" replays both. Nothing in the
   rain's behaviour changed (null control: phase 1 0 px).
2. **One simulation step per frame**, its length the frame's (at most 1/30 s), not v1.0's fixed 60 Hz. At 60 Hz, below 60
   fps it ran two steps a frame (measured 24.9 fps → 39.5 fps at 2.5 cm after the change).
3. **The emitters puff at random** (a quarter of the 1/30 s draws, four times the amount), not every spot every step.

Measured box: 242.5 × 205 × 60 cm, 97 × 82 × 24 = 190,896 cells, 240 emitting columns, mask 194 × 164 × 48 (built in
about 20 ms), 13.1 MB. The costs are in D-101 (16 November).

## v1.2, 16 November 2026: the warm-up (Carl: "Implement the fix")

The steam's programs are built at LOAD, not when the story first reaches the drops. The compute passes are run once with
nothing emitted, then cleared. The draw is compiled with `compileAsync`, both variants in turn. The steam's `compute` now
takes the scene and camera, which the scene passes in. No new resources are added, only a change to when the existing ones
are built. The measurements are in D-101 (16 November, "FIRST-RUN HITCH").
