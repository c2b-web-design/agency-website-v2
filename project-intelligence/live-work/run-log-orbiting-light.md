# Run log — the orbiting light, and the crown that made it visible

**Day 8, 2 August 2026.**
**Status: BUILT. PROVISIONAL per D-035 — kept for the mastering pass, not approved.**
**Nothing committed.**

**Full decision record: D-044.** This log carries what the decision entry does not — the
sequence, and the mistakes.

---

## What Carl has

Reload `/start?lightrig=1` and press **spacebar**. That is the whole control surface.

A tilted 3D ellipse orbits the four-box group anticlockwise, 6s across the front and 3s
hidden behind. The faces light and shade as it passes; the gold rims survive the back half
when the faces go dark; the Send opal's shine rises and falls with the front pass.

**Carl on the result:** *"the gradients are animated... that is so fckn cool"* and, on the
opal, *"it's as if the opal's shine pulses and the light of the cards is having some sort of
effect on it."*

⚠ **Neither of those is what was built.** The texture never moves — it is one static
photograph, and a travelling light on a curved surface makes it *look* animated. And nothing
connects the boxes to the opal; they share a clock and the brain supplies the causation.
**Both effects are emergent, and both are better than what was designed.**

---

## The day's one real finding

⚠ **A crown of 1.2 units on a 38-unit box has a maximum surface tilt of 5.67 degrees, and
that single number explains everything Carl reported.**

He said the faces looked flat and that real geometry under a real light should not. **He was
right on both counts.** Lambert shading needs an angle; 5.67 degrees gives an upper/lower
ratio of 1.22 at a 45-degree light and does not reach 2:1 until 75 degrees. **The shadow
lived in the last ~6 degrees of a 90-degree sweep** — real, and invisible.

At `CROWN_HEIGHT = 5.0` the tilt is 22.5 degrees and the shadow forms from ~67. Measured
top/bottom ratio across box 1's face, mid-arc: **1.38 → 3.69.**

⚠ **AND THE TEXTURE WAS NEVER THE PROBLEM.** A probe measured bare geometry at 36 luminance
of gradient against 18 textured, and that was written up as *"the texture is drowning the
geometry."* **Wrong reading.** The texture was not too strong; the geometry was too weak to
compete. Deepened, they cooperate.

---

## ⚠ Six wrong turns, and five were the same mistake

**The mistake: adjusting a value because of a measurement, without checking the measurement
described what it claimed to.**

| # | What happened | What it actually was |
|---|---|---|
| 1 | Light aimed one box behind the readout — pressing 3 lit box 1 more than box 3 | `updateMatrixWorld()` called before the new position propagated |
| 2 | "Off" left the spotlight permanently aimed at the world origin | `return null` unmounted it; the wiring effect never re-ran |
| 3 | Sampling windows read empty space between the rows | Guessed layer fractions; a box is 38px in a 184px layer |
| 4 | ⚠ **A long stretch of intensity/penumbra/easing changes** | **Screenshots taken BEFORE the boxes had rendered.** Blank background read as "unlit face" |
| 5 | Exact `0.00` deltas called a render race, then a reporting bug | Both wrong. A byte diff (160,153 bytes differing, max 98) proved the captures fine — the zeros were the opposite column genuinely receiving nothing |
| 6 | `decay = 2` with intensity 900, then 64000 | Units. One world unit is ONE CSS PIXEL; physical falloff assumes metres |

⚠ **#4 IS THE ONE THAT COST THE MOST TIME.** The harness now polls until bright pixels
actually exist rather than waiting a fixed interval. Several "findings" reported to Carl
during that stretch were about a blank stage.

⚠ **AND ONE FAILURE WAS WORSE THAN A WRONG NUMBER.** A comment was written into the rig
claiming box 3 was kept dark *"verified by measurement, not assumed"* — **written before the
measurement, and false**: box 3 read 109.5 against box 1's 137.7. The words are preserved in
the file rather than deleted. **Asserting verification that has not happened is a worse
defect than the thing it was defending.**

---

## What Carl corrected, and why each was right

**"You made the cone too narrow, I said make it the width of the box. The edges of the face
have geometry too."** The 0.45 cone was justified in-file on the grounds that the question
was about the middle of the face. ⚠ **That discarded the strongest part of the signal** — the
crown is a plateau that rolls off at the ends, so the ends are where the surface turns away
most.

**"Don't create no system where I have to press numbers and toggle things on and off. Far too
complicated and unnecessary."** The previous rig had box selection, arrow stepping, live rim
adjustment and stepped tint presets. Each was defensible; together they made an instrument
nobody could look through. ⚠ **A test rig with a manual is not a test rig.**

**"I expected if I was looking at box 1 is to select it and turn the light on then off."** The
rig was a *selector* when what was needed was a *switch*. A light already on when you look is
just a brightness — **the effect being judged is the light arriving.**

**"It's like volume on a fader. You don't need powerful light to see a shadow."** Intensity
had been chased upward to 12 and blew the face to 135 luminance. ⚠ **A shadow is a RATIO, not
a level**, and a probe that saturates its subject measures its own overexposure.

**"I accept there may be some overspill into box 3."** ⚠ **Geometric, not a tuning failure:**
a circular cone covering a 284-wide box has a 284-tall footprint at every distance, and box 3
is only 58 away. A lateral offset was tried and made it worse.

---

## The ellipse, as Carl specified it

He drew it in MS Paint and then gave the constraints in words, which between them fully
determine the shape:

- **Two edge midpoints** — box 1's left, box 4's right — each with the light 200 units beyond,
  *"at the same distance it was from the face."* These fix the **axis and the tilt**.
- **The halfway cap** — *"not more than double these corner distances."* This fixes the
  **width**, at 400.
- **"The ellipse is supposed to be 3d, tilted. I had to use MS Paint."** The sketch could only
  carry the in-plane shape.
- **"It's circular, we could have chosen any start and halfway points."** ⚠ The start is a free
  phase offset, not a property of the path.

⚠ **AND HE PREDICTED THE BEHAVIOUR CORRECTLY BEFORE IT WAS BUILT:** *"the face will be darker
as it goes behind but some effect may be seen on the gold rim."* Measured: face 20 → 61, rim
26 → 128. The face dies and the rim survives, because the face is opaque with its normal at
the camera while the rim is curved metal with an env map.

---

## Open, and deliberately so

| Item | Note |
|---|---|
| **Everything above** | PROVISIONAL per D-035. Carl: *"we can keep what we've got so far"* — mastering pass at the end |
| **Crown at 5.0** | Legible, not chosen. The depth that looks right is Carl's |
| **Option B — text on the curved surface** | Parked. Needs a hidden input for accessibility/autofill |
| **Grain tint, rim unlit floor** | Now genuinely judgeable — there is finally a moving light to judge them under |
| **The 3s hidden half** | May read abrupt against the 6s front. First time it has been visible |

---

*Day 8, 2 August 2026. The contact field's faces went from flat to genuinely dimensional, and
an orbiting light now crosses the whole assembly. The day's lesson is the one the project
keeps relearning from the other side: **Carl's eye said the geometry was not reading, the
instruments said it was fine, and the geometry was the thing that was wrong.** Every probe
that disagreed with him was measuring something other than what it claimed.*
