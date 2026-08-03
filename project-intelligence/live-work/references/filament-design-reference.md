# Filament design reference — heat, not drawing

**Settled in discussion with Carl, 3 August 2026, at the end of the card-in-grid session.**
**For the filament chunk, which is next.**

⚠ **REFERENCE STATUS: TARGET TO MATCH, not inspiration only.** Carl supplied three photographs
of incandescent bulb filaments and directed the design from them explicitly.

---

## The decision, in Carl's words

> **"obey the physics, but the physics of heat rather than the physics of drawing"**

That sentence resolves the question he posed:

> *"IRL, the metal would heat up everywhere, all at once, which would suggest a fade in. If the
> amber had a head and acted more like a fuse on a stick of dynamite that would suggest animated
> movement. Do we obey physics or do what looks coolest?"*

**It is a false choice, and the references are what show it.**

---

## What the references actually show

Three images: two lit filaments, one unlit filament assembly.

**1. The lit filament is NOT uniform.** The bright line is hottest across a band of the upper
wire and falls off toward the supports, where the metal fades into dull amber and then into the
dark. It is a single continuous element at one moment in time, **already showing a gradient of
heat along its own length.** Real filaments do this — the coil radiates unevenly and is cooler
where it meets the mounts, which sink heat away.

⚠ **SO "THE PHYSICS" DOES NOT MEAN "UNIFORM FADE IN". Heat has a distribution, and a
distribution can move.**

**2. There is a hot core and a bloom.** The wire is a hard bright line with amber haze spreading
well beyond its own width, falling off into the dark rather than stopping at an edge. In the
second image the *unlit* legs of the wire are still visibly catching light lower down.

**3. At rest it is metal.** The third image is a coiled tungsten element, dull grey, physically
present before any current.

---

## What this settles

### The rim is the unlit filament

⚠ **NOT "GREY WAITING TO BE COVERED".** The rim is a metal element that is there at rest and
heats up. Carl: *"Filaments are usually metal. Notice the hotter core and the bloom. See the
filament at rest."*

**This replaces both options the Builder had offered** (give the rim a colour of its own, or let
the filament become its treatment). Carl's answer was better than either: **the rim wants a
metal material now, not a placeholder colour.**

### It moves AND it fades — they are the same event

A travelling amber head is **not** a violation of the physics. It is a hot spot propagating
along a conductor, which genuinely happens.

**The fuse reads as wrong only if the head is hard-edged**, like a line being drawn. Give it
what the reference has — hot core, bloom, and a long warm tail falling off behind — and it stops
being a progress bar and becomes heat moving through metal.

- The rim **behind** the head stays warm rather than snapping back to grey
- The rim **ahead** of the head is already faintly picking up
- By the end of the circuit the **whole rim is hot**

⚠ **SO THE CARD ENDS IN THE RESTING SELECTED STATE WITHOUT A SEPARATE STEP.** The travel and
the uniform lit state happen in sequence, from one mechanism.

⚠ **THE DYNAMITE FUSE BURNS AWAY. THIS DOES NOT.** That is the whole difference and it is the
one to hold onto.

### Head sharpness is a fader, not a decision

Set by eye during the mastering pass. Not chosen in advance.

---

## Carried-across constraints

**⚠ D-029's filament already draws over 2400ms** with `pathLength="1"`. **The movement is
approved and carries across.** What changes is that the stroke becomes *heat with a bloom*
rather than a hard line.

⚠ **STATE IT THAT WAY TO THE ARCHITECT: a material change to an approved animation, not a new
animation.**

**⚠ 2400ms is shared with the backdrop's colour shift, deliberately.** Carl: *"The blue pixels
will turn teal in the same time frame as the filament takes to do a circuit."* One clock, two
expressions, finishing together — see `REGION_SHIFT_MS`.

**⚠ Amber, echoing the Q numbers in the rail** — Carl: *"The filament is not gold. It will be
amber to echo the Q numbers in the rail system."* Against the backdrop's blue and cyan this is
a near-complementary contrast and will be the most saturated thing on the page. **Whether it
should sing or be restrained is unresolved** — see the open questions in `session-handoff.md`.

---

## ⚠ Why this must be real light, not a painted glow

**The bloom has to do two things a drawn glow cannot:**

1. **Spill onto the bevel.** This was the half-tube rim's original justification, in Carl's own
   words: *"the rim should be a half tube, that way it will emit light onto the bevel and face
   and if its making a journey down the right hand side it will affect the 2nd card and all
   other cards will be affected by proximity."*
2. **Be visible THROUGH the frosted face.** Carl, on the frost interacting with the geometry:
   *"Because of the face geometry i would expect some impact on the frosted glass. What we tried
   to achieve with CSS."*

**A painted head satisfies neither.** It is also the basis of the Next-step requirement —
*"If cards 4+5 are selected that would show more on the next step button"* — which is a light
transport question, not a drawing one.

---

## ⚠ The coupled system — three values, none set independently

Carl, on the frost/amber relationship:

> *"That depends on the intensity of the amber. Any residual effects on the blue/teal underneath
> would be small, but might factor in to how much amber light effect there is."*

**Frost level, amber intensity, and the face's curvature response are one system.** The
mastering method Carl specified applies here — see `session-handoff.md`, the fader-pair
instruction. **Do not pick a frost value and tune amber around it.**
