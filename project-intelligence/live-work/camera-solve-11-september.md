# The camera is solved — 11 September 2026

**Status: MEASURED, with one independent confirmation. Not approved; nothing built on it yet.**

---

## The result

| | |
|---|---|
| focal length | **1282.0 px** on the 2560x1707 plate |
| horizontal FOV | **89.9°** |
| 35mm equivalent | **18.0 mm** |
| camera pitch | **12.69°** below horizontal |
| principal point | image centre (assumed, not solved) |
| predicted vertical VP | (1280, 6545) px |

Inputs: the two wall-card vanishing points, **(2523, 397)** and **(374, 397)**,
⛔ **measured on the 1800x1200 image** — see the scale trap below.

Derivation: `f = sqrt(-(vL-c)·(vR-c))` for two perpendicular horizontal directions,
then the world vertical as `cross(dL, dR)`.

## ⛔ THE FALSIFICATION TEST — IT PASSED, AND IT COULD HAVE FAILED

**The left desk's cabinet base was fitted independently** (perpendicular-gradient
search, **rms 0.33px, max deviation 0.6px, 112 points, none rejected at bound**) and
**never fed into the camera solve**.

Back-projected onto the solved ground plane it reads **0.6° from the left wall
direction**. A desk standing against a wall should read 0°.

⚠ **0.6° is inside the stated tolerance and is invisible on screen.** Carl, 11
September: a human cannot detect a 30ms gap, and the same applies here — chasing a
vanishing point at x=3605px was precision that exists in the arithmetic and nowhere
in the room.

**Also checked:** the two wall directions are **90.0°** apart, and `dL·dR = -0.00000`.
⚠ The 90.0° is NOT independent — the solve constructs the vertical as their cross
product, so perpendicularity is assumed, not measured. **Only the cabinet base result
is a real test.**

## ⛔⛔ THE SCALE TRAP THAT COST THE FIRST SOLVE — READ THIS BEFORE REUSING ANY VP

**The VP pixel coordinates (2523, 397) and (374, 397) are in the 1800x1200 frame of
`brand-assets/about-studio-wall-cards-1800.jpg`, NOT the 2560x1707 plate.**

⚠⚠ **AND BOTH READINGS LOOK PLAUSIBLE, WHICH IS WHY IT SURVIVED A WHOLE SOLVE:**

    397 / 1707 = 0.2326     <- wrong, and looks like a normal horizon
    397 / 1200 = 0.3308     <- correct, and matches the handoff's y = 0.331

⛔ **The first solve produced f = 958px, 106° hFOV, 13.5mm — which passed casual
inspection** (wide interiors really are shot at 13mm) **and produced a cabinet base
reading 20.6° off its own wall.** A sub-pixel line cannot be 20° wrong; that
contradiction is what exposed the error.

⚠ **The handoff records the horizon as y = 0.331 and calls it "the most trustworthy
number in this file". It is — in the 1800 frame.** Nothing said which frame, and the
plate is a different size.

**Rule: a pixel coordinate without its frame size is not a measurement.** Record the
frame, or record fractions.

## What this replaces

⛔ **The desk-angle check is SUPERSEDED as a method.** Its purpose was to establish
whether the desks are parallel to their walls. The camera answers it directly:
**the left desk is parallel to its wall to within 0.6°.**

⚠ **The right desk is NOT yet confirmed.** Three separate attempts to fit its floor
contacts failed on 11 September — the T-foot (wrong axis: the foot is a crossbar,
perpendicular to the desk's length), the desk top's front edge (right axis but at
desk height, not floor level), and dark-blob segmentation (feet, column and shadow
merge into one 125,018-px mass). **Its direction is still unmeasured.**

## Failed instruments, recorded so they are not retried

| attempt | result | why it failed |
|---|---|---|
| desk front edges, fixed horizontal band | 25px rms | the edge slopes out of any fixed band |
| floorboard seams, RANSAC | 3 lines, slopes +0.055/+0.021/-0.009 | grain is indistinguishable from seams; the surviving lines are not a parallel set, and their "VP" landed at y=0.87, below the floor |
| Gemini-generated floor grid | rejected | floor lines bow up to **25px** off their own best fit; 3 of 5 untraceable; **aspect 1.5821 vs 1.500** so it is not even the same frame |
| right desk dark-blob segmentation | one 125k-px component | feet, column and shadow are contiguous |

⚠ **The Gemini grid is worth one line of warning: it looked convincing and the walls
were broadly sound. Only the floor was decorative.** An image model reproduces the
*appearance* of a perspective grid; appearance is not geometry.

## ⛔ THE ROOM, MEASURED — the desks are NOT both square to their walls

**Back-projecting Carl's two hand-placed floor rails through the solved camera:**

| measurement | result |
|---|---|
| Carl's LEFT rail vs left wall | **0.3°** |
| cabinet base vs left wall (independent fit, rms 0.33px) | **0.6°** |
| Carl's RIGHT rail vs right wall | **5.4°** |
| skirting fit vs right wall (independent, poorly converged) | **4.9°** |
| **Carl's two rails, angle in the room** | **84.3°** |

⛔ **THE LEFT DESK IS FLUSH WITH ITS WALL. THE RIGHT DESK IS TURNED ~5°.** Two
independent measurements agree on each side. The 84.3° corner is the 90° room angle
less the right desk's 5.4° turn — the numbers are self-consistent.

⚠ **This is what an L-desk does when pushed into a corner to make the join** — the
possibility the 10 September handoff flagged and could not test. It is now measured.

⚠⚠ **CARL'S HAND PLACEMENT OF THE LEFT RAIL LANDED 0.13° FROM THE CAMERA'S
CONSTRUCTION.** A mouse-drawn line, an eighth of a degree from solved geometry. ⛔ On
the RIGHT side his placement is BETTER EVIDENCE than the construction, because the
construction assumes a wall-parallelism that the measurements refute. **Carl's verdict
by eye — "slightly off" — was correct and decided it.**

⛔ **CONSEQUENCE FOR BUILDING: the right card's yaw comes from Carl's rail, NOT from
the right wall's vanishing point.** A rail built to that VP is wrong by 5.4°.

## What is NOT established

- ⛔ **The right desk's direction.** Unmeasured.
- ⛔ **The position rails.** Carl placed four rails by hand in `/proto/wall`; the two
  he labelled RL/RR were read by the Builder as desk references and **they are not** —
  they sit on the two chairs' castor bases. ⚠ **That misreading produced a "57.7°
  between the desks" figure. Discard it.**
- ⛔ **Scale.** The ground plane is fixed at an arbitrary unit distance. Nothing in
  the room has been measured in real units, and nothing needs to be yet.
- ⚠ **The principal point is assumed at image centre.** Not solved, and a real lens
  may differ. Unasserted.

*Written 11 September 2026. The camera passes one independent test at 0.6°. That is
one confirmation, not a proof — a second independent feature would strengthen it.*
