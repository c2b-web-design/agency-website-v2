# Structural note: the cloth's pins carried by a "hand" (20 November 2026, session 2)

**For Carl** (CLAUDE.md 5a: a change to how the cloth's simulation steps is decided before it is built). D-101.

**The brief (Carl):** *"move the cloth to that same distance in front. have it meet the cloth mid jump so the most area of
cloth meets the most area of logo. What this will tell me in real time is how fast the cloth moves."*

## The decision

The cloth's 23 PINS (its top-edge fixed points) are moved by a HAND OFFSET each simulation step; every other point stays
free and follows through the springs, so the sheet trails, swings and settles as cloth.

- `hero-cloth.ts`: the pinned points' start positions kept on the GPU; in the vertex step a pinned point is SET to its start
  + the hand's offset (today it `Return()`s, never moving). A `setHand(zCm)` call takes the hand's place each frame; the
  360-a-second steps between two frames interpolate from the last place to the new one, so the pins never jump.
- `hero-scene.ts`: the hand's path, driven by THE LOGO's JUMP (the logo leads): it starts as the logo leaves the floor, its
  pins cross the logo's plane at the apex, it arrives as the logo lands. From 60 cm BEHIND the logo's centre to 60 cm IN
  FRONT (120 cm), eased in and out (smoothstep). With the jump at 60 cm: 0.70 s, average 171 cm/s, ~257 cm/s at the meeting.
- `hero-bench.tsx`: nothing new needed (Pass 1 → Jump fires both).

## Rejected

- **Moving the cloth's group (or every point) instead:** the sheet would slide as a rigid board, no trail, no swing.
- **Borrowing the camera bench's paths (`bench-chain.ts`):** one straight line with an ease needs none of it; a second
  user of that module for a single line is coupling for nothing. Revisit if the hand's paths grow (curves, passes).

## What it couples to

- The cloth's step reads one more value (the hand). The wind, springs, damping and gravity are unchanged.
- The cloth's movement is tied to the logo's jump (`jumpInfo`), not to the cloth's own clock.

## Stated before building

- **The cloth passes THROUGH the logo.** Nothing makes them collide yet (the collision is its own step). This take shows
  the TIMING and SPEED only.
- **The pins cross at the apex; the hem crosses later**, because the cloth trails its hand. How much later is measured, not
  guessed, after the build.
- **Unasserted:** the clearances at each end come from one wind run.
