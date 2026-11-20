# Structural note: the cloth collides with the logo (20 November 2026, session 2)

**For Carl** (CLAUDE.md 5a: a new mechanism, and a new map of the logo). D-101.

**The brief (Carl):** *"ok, build the collision physics, lets see how it behaves over a number of jumps."* The ruling it
serves: *"when we see different camera positions we can see full contact ... The worst outcome is that no contact is made."*

## The decision

**The logo's shape as a DISTANCE FIELD, read by the cloth's own step.**

1. **The shape.** The logo is an extrusion: its face outline, 7.6 cm deep. So its distance field is a FLAT one (how far
   each point of the face is from the letters' edge, inside negative, outside positive) combined with its thickness.
   The flat field is made from the logo's INK grid, which already exists (`hero-maps.worker.ts`, `inkGrid`: 2 cells a cm,
   405 × 212, shared today by the fill's flow map, the wash's run-off map and the steam). One new map from the same ink,
   built in the same worker with the others, as a texture. Exact for the flat face and walls; the bevel's rounding is
   inside the collision margin.
2. **The collision, in the cloth's step** (`hero-cloth.ts`): each free point, each of the 360 steps a second, is taken into
   the logo's own frame (its pose this step), the field read; if it is closer than a MARGIN (~1.5 cm, the cloth's point
   spacing is ~2 cm), it is pushed out to the surface along the field's slope, its inward speed removed and its sliding
   slowed by a FRICTION. Bench dials: collision on/off, margin, friction.
3. **The logo's pose** is handed to the cloth each frame (`hero-scene.ts`, as the hand is) and INTERPOLATED across the
   frame's steps, so a fast jump (up to ~14 cm a frame at take-off) is met ~1 cm at a time and the cloth cannot be
   jumped through.
4. **One way only:** the cloth is pushed by the logo; the logo is not pushed by the cloth (its moves are authored, the
   logo leads). Whether the cloth's catch ever turns the logo (the desk logo's bin) stays Carl's, open.

## Rejected

- **The steam's solid mask** (a 3D grid of the logo): built for the landed pose only, at the steam's cell size (too
  coarse for a 7.6 cm thickness), and inside/outside only, with no distance to push out by.
- **A full 3D distance texture:** more memory and build time for nothing — the extrusion makes flat + thickness exact.
- **Spheres or capsules standing in for the letters:** the cloth would catch on shapes that are not there.
- **A physics engine (Rapier, Ammo):** a second simulation on the CPU beside ours on the GPU, and a new dependency.

## What it couples to

- The worker's "face" job returns one more map (the same ink, the same run). Its load cost is measured after, not guessed.
- The cloth's step reads the logo's pose and one texture. Wind, springs, damping, gravity, the hand: unchanged.
- The cloth's frame cost goes up (a few texture reads per point per step). Measured after (D-108).

## Stated before building

- **The cloth's movement WILL change**: it now drapes over the logo instead of passing through. The pass's timing and
  coverage (47–48%) were measured without collision and will be re-measured. The beat and the jump's height may need
  re-tuning.
- **The cloth does not collide with itself** (the example does not either). Folds can pass through each other.
- **The drawn surface** is the centre of every four points, so it can sit slightly inside the margin at sharp edges.
- **The floor** is not a collider (the cloth never reaches it).

## Files

`hero-maps.worker.ts` (the distance map) · `hero-cloth.ts` (the collision in the step) · `hero-scene.ts` (the pose, the
map handed over) · `hero-bench.tsx` (the dials). All four are in `chunk-scope.json`; the worker has not been named this
session.
