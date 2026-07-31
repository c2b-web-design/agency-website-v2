# The Orbiting Light — test rig brief

**Captured:** 31 July 2026, end of Day 7.
**Status:** Working brief. **Not a plan and grants no implementation authority.**
**Purpose:** Carry Carl's specification for the light TEST, so the next session starts from it
rather than re-deriving it.

⚠ **Read alongside `contact-field-gold-and-light-reference.md`**, which holds the intent, the
three-layer depth model and the measured gold. **This file does not repeat them.** It records
what Carl asked for on 31 July: a controllable rig to see the light before anything is judged
under it.

---

## ⚠ TEST FIRST — that is the whole point of this chunk

**Carl's framing:** *"What I would want to do with the light is test it first, especially
against the components that need decisions."*

⚠ **THREE DEFERRED JUDGEMENTS DEPEND ON THIS**, and all three were deliberately left open
rather than guessed:

| Deferred | Where it sits now | Why it waits |
|---|---|---|
| `FIELD_GRAIN_TINT` | `0.55`, all four boxes | Relief exists to catch the glint. Tint-vs-relief cannot be compared without a moving light |
| Rim unlit floor | `0.05` | How barely-visible gold reads is a question about metal under light |
| The glint itself | Does not exist | — |

⚠ **The rig is therefore the deliverable, not the effect.** A finished light that cannot be
adjusted while looking at it settles nothing.

---

## The path — Carl's specification, 31 July 2026

> *"We start off top left, just above box 1 pointing down. No light should be on the box at this
> moment. We end up, bottom right looking up. It should follow an elliptical orbit. The beam
> should be narrow, its speed slow. What I'd be looking for on the face and rims is a narrow band
> that sweeps across the face. The band should have bloom."*

| Property | Specification |
|---|---|
| **Start** | Top-left, **just above box 1**, pointing **down** |
| **At the start** | ⚠ **No light on the box** — the sweep begins off the object |
| **End** | Bottom-right, looking **up** |
| **Path** | **Elliptical orbit** |
| **Beam** | **Narrow** |
| **Speed** | **Slow** |
| **What to look for** | A **narrow band sweeping across the face** |
| **Bloom** | **On the band** |

⚠ **"NO LIGHT ON THE BOX AT THIS MOMENT" IS A REAL CONSTRAINT, NOT SCENE-SETTING.** It means the
start position and the beam angle must be arranged so the cone misses the geometry entirely at
t=0. The sweep has to ARRIVE. If the band is already on box 1 when the orbit begins, the
entrance of the light is lost and only its travel remains.

⚠ **THE BAND IS THE OBSERVABLE.** Carl is not asking to see a light source — he is asking to see
what the light DOES to the face and the rims. That is the thing to instrument and the thing to
judge.

---

## ⚠ THE TEST DESIGN — Carl, 31 July 2026, and it is sharper than a continuous sweep

> *"While testing this partial orbit... if we make it last 4 seconds, we turn the light on and
> off at intervals. Then we can see the effect as it travels and as it's turned on. You may wish
> to decide not to have the orbit's speed continuous and be static at some point. This is a test
> after all."*

**A 4-second partial orbit, with the light pulsing on and off along the way.**

⚠ **WHY INTERMITTENT BEATS CONTINUOUS AS A TEST, and it is not just "closer to the final
effect".** A light that stays on shows ONE thing well — how the band travels. Pulsing shows
**two independent things**: how the band moves, AND **how the metal responds to a light
ARRIVING.** The second is what the glint actually depends on, because **a glint is an ignition,
not a pass.**

⚠ **AND IT SAMPLES THE ORBIT FOR FREE.** Every on-pulse catches the geometry at a different
angle, so one 4-second run shows the rim and face responding at several positions without
anyone having to scrub to each one.

### The four modes — the orbit and the pulse are SEPARABLE, and separating them is what makes
### this a rig rather than a demo

| Mode | What it isolates |
|---|---|
| **Moving, continuous** | How the band travels |
| **Moving, pulsing** | Arrival and travel together — closest to the intended effect |
| **Static, pulsing** | The metal's response to **ignition alone**, position held |
| **Static, on** | ⚠ **A HELD FRAME.** The only mode in which a screenshot means anything |

⚠ **THE HELD FRAME IS NOT A CONVENIENCE, IT IS THE MEASURABLE STATE.** On 31 July every value
measured from a moving or transient state proved unreliable — and the only two that gave clean
answers were the ones that could be FROZEN: the paused wipe animation and the frozen mask.
**A rig that can stop is a rig that can be measured.** Anything judged only in motion is judged
by eye alone, which is fine for Carl and useless for a regression check.

⚠ **Carl's framing governs the whole build: *"This is a test after all."*** The rig does not have
to be the effect, does not have to be efficient, and does not have to survive into production.
**It has to make the three deferred judgements possible.**

---

## What this requires of the scene — established, not proposed

**Verified in code on 31 July 2026:**

- **Post-processing is already available.** `@react-three/postprocessing ^3.0.4` and
  `postprocessing ^6.39.3` are both installed. ⚠ **Bloom needs no new dependency.**
- **The current rig is three STATIC lights** — `ambientLight`, and two `directionalLight`s (key
  and fill). **There is no spotlight and no post-processing pass in the scene at all.**
- `three ^0.185.1`, `@react-three/fiber ^9.6.1`, `@react-three/drei ^10.7.7`.

### ⚠ Two structural changes the brief implies, both worth deciding before building

**1. `frameloop="demand"` becomes a continuous loop while the light moves.** The canvas
currently renders only when something changes, and that discipline is deliberate and documented
— the entrance cascade runs a bounded rAF loop and **stops itself** when the last box settles.
An orbiting light renders every frame for as long as it orbits.

**2. Bloom means an `EffectComposer` between the render and the screen.** That is a second full
pass over the frame.

⚠ **NEITHER IS A PROBLEM; BOTH ARE A CHANGE IN KIND.** The contact canvas has been a static
render with a bounded animation since it was built. **Carl should decide whether the light runs
continuously, or only on a triggered pass** — the existing reference already describes the glint
as *momentary, not a constant key*, achieved by *"turning the light on and off over a few hundred
milliseconds"*, and Carl's 31 July note added that the light **is intermittent — it extinguishes
and re-ignites along its path.** A momentary light and a continuous orbit are different animals
for the frame loop.

---

## ⚠ What the rig must expose, or it is not a rig

The three deferred judgements are **by eye, under the light, while it moves.** That means the
values below have to be adjustable without a rebuild-and-re-walk of the corridor each time —
walking `/start` to completion takes ~14 seconds before the boxes even appear.

**Candidates to expose, for the next session to settle:**

- ⚠ **Orbit run/pause, and pulse on/off — INDEPENDENTLY.** The four modes above are only
  available if these are two switches rather than one
- ⚠ **Scrub to a position and hold it.** The held frame is the measurable state
- pulse rate and duty (how long on, how long off)
- beam angle / cone width
- orbit speed, and the ellipse's shape and tilt
- light intensity, and its falloff with distance
- bloom threshold, intensity and radius
- ⚠ **`FIELD_GRAIN_TINT` and the rim unlit floor** — the two deferred constants, so they can be
  moved *while the band sweeps*, which is the only condition under which they were ever going to
  be judged

⚠ **THE 4-SECOND RUN IS A TEST DURATION, NOT A DESIGN VALUE.** It is long enough to watch and
short enough to repeat. **Nothing should derive from it** — the final effect's timing is a
separate judgement Carl has not made.

⚠ **A rebuild between each value is not a rig.** The lesson is already on the record from the
box entrance: four tuning approaches failed, and what made the fade judgeable at all was
isolating one variable and being able to look at it — Carl: *"lets make chunks out of the
chunk... separate the connection between elements."*

---

## Carried forward — the constraints this must not break

⚠ **From `contact-field-gold-and-light-reference.md`, not restated here in full:**

- **Bloom is coupled, not decorative.** Carl: *"the numbers that define that bloom will be
  related to the metal and intensity of light."* Effects should feel **caused by the world**, not
  layered on top of it.
- **The three-layer depth model** — logo (background), boxes (middle), opal (foreground).
  Distance is the intensity control and falls out of placement.
- **The opal is the prize** — light passing *behind* a transmissive foreground element. It only
  works if the light genuinely orbits behind the foreground.

⚠ **And the hierarchy constraint that governs the whole contact field:** the gold rim stays
dominant; the field's brightest point sits **below** the rendered gold's. A bloom pass can break
that by construction, because it adds light back into the frame **after** the render — where none
of the existing measurements can see it. **Re-measure the hierarchy with bloom on.**

⚠ **The entrance cascade's values, ordering and masking remain out of bounds.** The standing
*"close enough is not approved"* reservation is not reopened by this chunk.

---

## ⚠ Authority — unresolved, and it must be settled before work starts

**Carl's standing instruction is that the orbiting light chunk goes through the PM/A, not
direct.** This brief was given straight to the Builder.

⚠ **The Builder did not treat that as superseding the instruction.** Whether this brief goes to
the PM/A first, or whether Carl's giving it directly replaces that route, **is Carl's call and is
not recorded as decided.**

---

*Day 7, 31 July 2026. Nothing here is authorised and no code has been written.*
