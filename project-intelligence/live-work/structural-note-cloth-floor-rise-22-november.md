# Structural note: the cloth lies on the floor and rises by its pins (22 November 2026, session 3)

**For Carl, to route to the Architect** (CLAUDE.md 5a: a change to how the cloth's simulation steps, and to what moves its
pins, is decided before it is built). D-101. Status: **PROPOSED**, not built.

**The brief (Carl):** *"if the cloth is on the floor, it could rise up to its position. It would be out of the area of
rainfall, further back, raise and make its way forward. Careful camera positioning would hide its arrival."* … *"its not
lowered to the floor, it would already start there, hidden from camera. … as the rain is finishing and the code drop happens
the camera will be close to the logo, looking up at a slight angle. The camera would pull back to take in Pass 1. As it does,
the cloth would rise up"* … *"Yes, it should have floor physics, theres nothing stopping us switching to another Cam as it
rises. The option is open."*

**The camera it is hidden from (Carl's screenshots):** A, position 206, −269.5, 587.7 (38 cm above the floor); or B, lower,
238.3, −402.2, 571.6 (8 cm above the floor, *"that would hide the floor behind"*); both target 468.9, −201, −37.9, fov 45.

## The decision

1. **The floor in the cloth's step** (`hero-cloth.ts`, the vertex step, after the logo's push): a free point below the floor
   (`FLOOR_Y`, the scene's, passed in; + a small margin) is put back on it, its speed DOWN removed, its sliding slowed by a
   floor FRICTION (its own dial, apart from the logo's). One compare per point per step.
2. **The hand rises** (`setHand(zCm, yCm = 0)`): the pins' offset gains a height, interpolated across the steps like z. Every
   existing call (`setHand(zCm)`) is unchanged.
3. **The start: LAID FLAT on the floor**, behind its pins, outside the rain, the pins' edge on the floor. A second start
   layout beside today's hanging one (the same points, turned flat about the pin line); "Cloth again" uses the story's.
4. **Asleep until it rises:** not drawn and not stepped from the load until its rise begins (a flat sheet on a floor is
   already at rest), so it costs nothing through phases 1 and 2. It wakes where it lies.
5. **The path** (`hero-scene.ts`): from the floor straight up to the pins' height, then forward to its place (`CLOTH_BACK_CM`,
   where pass 1 starts) — timed to the camera's pull-back; the timing and speed Carl's.

## Rejected

- **Hidden below the floor, rising through it** (offered as B): no floor contact needed, but it reads as coming OUT of the
  floor, not lifting off it. Carl chose floor physics.
- **Dropped into a heap** (released low, left to crumple): unpredictable, and it must simulate through phases 1–2 (~3–5 ms a
  frame) to settle. Possible as a later take on the same floor.
- **Settling from today's hanging start onto the floor:** a vertical sheet clamped to a plane collapses into a line; the
  springs would explode.
- **The floor in the logo's distance field:** the floor is a plane; a plane test is one line.

## What it depends on (5b) and how each is kept

- **The passes' hand (z):** unchanged; y is 0 for them. **The Reset snapshot:** taken at pass 1's take-off, after the rise:
  unchanged. **The logo's collision:** unchanged, the floor tested after it (⚠ a point squeezed between the logo's base and
  the floor ends on the floor: stated, to be watched). **The cloth's place** (`CLOTH_PLACE`): unchanged; the floor start is a
  hand offset from it. **"on":** still hides it; asleep is a new state beside it.
- **Unasserted until measured:** the start distance (the rain's disc is 160 cm about the logo, fading at its rim → ~250 cm
  back proposed); that cameras A and B do not see it lying there; the floor friction's value.
