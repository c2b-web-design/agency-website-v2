# Architect review — /about §2, the four role cards in Three.js

**11 September 2026. Architect → Carl.** The Architect reports findings; **Carl
decides** (D-036, Rule 5). ⛔ **Nothing here is an approval.**

**Verdict: the shape of the plan is sound.** Five claims did not survive a check
against the files; four structural questions were missing from the §5a note's scope.
⚠ None of it blocks the note being written first — it changes what goes in it.

---

## ⛔ VERIFIED BY THE BUILDER, NOT TAKEN ON TRUST

Every checkable claim below was re-run against the repository on 11 September.

| claim | result |
|---|---|
| `answer-card-geometry.ts` is not protected | ⛔ **CONFIRMED** — absent from `.claude/protected-files.json`, as are `answer-card-canvas.tsx` and `nextstep-canvas.tsx` |
| vFOV = 67.31°, hFOV = 89.91°, pitch = 12.68° | ⛔ **CONFIRMED** — re-derived from f = 1282 |
| `INITIAL_RAIL` contradicts itself | ⛔ **CONFIRMED** — "SEEDS ONLY" and "THE MEASUREMENT" fifteen lines apart |
| `GLASS_THICKNESS` is in pixels, scaled by model scale | ⛔ **CONFIRMED** — `answer-card-glass.ts:187-196` |
| `maxFaceTiltDegrees` is not for verification | ⛔ **CONFIRMED** — `answer-card-geometry.ts:531-535`, and it once carried a factor-of-2 error that prompted a dome |
| A canvas can only refract its own scene | ⛔ **CONFIRMED** — `answer-card-geometry.ts:557-568` |

---

## 1. Five claims the files did not support

**1.1 ⛔ `answer-card-geometry.ts` IS NOT PROTECTED.** The plan listed it as such.
⚠⚠ **And the file's own comments record an authorisation Carl granted on exactly this
false premise** — *"the Builder told Carl a fix 'would need your word because it's a
protected file'… the file was never protected."* **The same mistake, repeated.**
⛔ **Check the list; do not recall it.**

**1.2 ⛔ "The right desk is turned ~5°" OVER-CLAIMS.** `camera-solve-11-september.md`
lists the right desk's direction under *"What is NOT established"*, and the skirting
"confirmation" came from a fit that never converged. **Left desk: measured and
independently confirmed. Right desk: Carl's rail alone.** ⚠ Load-bearing — the floor
cards are specified perpendicular to the desks, so CS's yaw rests on it.
**✔ Corrected in `app/proto/wall/page.tsx` on 11 September.**

**1.3 ⛔ `INITIAL_RAIL` HELD A LIVE CONTRADICTION** — and the labels are inverted:
RL/RR are named ANGLE but sit on the **chair castor bases**; PL/PR are named POSITION
but carry **the desk measurement**. ⚠ Both comments written the same day by the same
author. **✔ Corrected on 11 September; the names are kept so Carl's handles reappear
where he left them, and are now documented as history rather than description.**

**1.4 ⚠⚠ "FROSTED GLASS" AND D-051 ARE NOT THE SAME MATERIAL.** The handoff quotes
Carl — *"The material is frosted glass"* — and the plan pointed chunk 2 at
`answer-card-glass.ts`. ⛔ **But CLAUDE.md's approved layers read "Satin answer-card
face material (D-051 — supersedes D-028's frosted blue glass)."** The file named
*glass* holds **satin**. **Reusing it delivers satin, not frosted.** ⛔ **A question
for Carl before chunk 2 is scoped — the plan framed it only as reproduce-vs-import.**

**1.5 ⛔ THE ACCEPTANCE TEST CONTRADICTED THE HANDOFF, AND BOTH WERE HALF RIGHT.**

- **CA/CB** — a genuine perspective projection of a rectangle on a wall plane, eight
  edges under 1px rms, cross-checked by VP convergence at a shared horizon.
  ✅ **Valid acceptance test**, with two conditions: compare the **back face**
  corners, and **decide the attribution rule before measuring** — ⚠ *a consistent
  offset shared by all four cards is a CAMERA error (principal point), not a
  placement error.* Otherwise cards get nudged to absorb a camera fault, which is the
  "instrument whose bounds I set" failure in a new costume.
- **CD/CS** — axis-aligned screen-space rectangles drawn before any lean existed.
  ⛔ **A size statement only. NOT a test.** The handoff is right about these.

---

## 2. ⛔⛔ FOUR STRUCTURAL QUESTIONS MISSING FROM THE NOTE

**2.1 ⛔⛔ THERE IS NOTHING IN THE SCENE FOR THE GLASS TO TRANSMIT. The biggest gap.**

`answer-card-geometry.ts:557-568` already records this lesson: *"A WebGL canvas can
only refract objects in its OWN scene… the same pale slab"* — and
⚠⚠ ***"The frost was never the problem; the absence of anything worth seeing through
was."***

**The room is a photograph OUTSIDE the canvas.** Three options, and the choice is
structural because it decides what the canvas contains and whether it is transparent
at all:

| | |
|---|---|
| **(a) plate as a textured plane in the scene** | The only option where the glass genuinely refracts the room — §14a's *"caused by the world"*. ⛔ **Cost: bypasses `next/image`, putting the full 459KB on every device — the exact regression D-075 removed (459KB → 105KB at 1440, 22KB at 750).** |
| **(b) plate as env map only** | Reflections register; **transmission does not** |
| **(c) transmission shows the clear colour** | Cheapest, and **reproduces the pale-slab defect** |

⛔ **Must be decided BEFORE chunk 1 — it changes what the bench proves.**

**2.2 ⛔ WHERE DOES THE COPY LIVE?** The plan never said. `wall-card-text.tsx` is
throwaway. Two answers, both with costs:
- **baked into the face texture** — reproduces **D-051-A11Y four times over**, on the
  page whose entire job is explaining the four roles. ⚠ **Body copy on a content page:
  an indexing problem as well as an accessibility one.**
- **DOM overlay** — never refracted by the glass it sits on, and must track the
  projected quad.

CA 64 / CB 84 / CD 49 / CS 55 words, four lines uncuttable. ⛔ **Carl's call, and it
constrains the face geometry.**

**2.3 ⚠ THE UNIT SYSTEM IS UNDEFINED.** The ground plane sits at *"an arbitrary unit
distance"*. **Recommendation: fix a real-world scale from one assumed dimension (desk
height ~750mm) and specify the cards in millimetres.** ⛔ It makes *"the same object
family"* physically true rather than a resemblance — a 6mm rim channel is a real
extruded neon profile, and *"a corner is a corner"* becomes checkable.

**2.4 ⛔ THE CANVAS BOX MUST BE THE PLATE'S RENDERED BOX, AND THE FIT MODE IS NOT
SETTLED.** §2 is currently `object-contain` — scaffolding the handoff says *"reverts
with the plate"*. ⚠ **If it reverts to `object-cover`, CB's top-right corner lands at
y = −0.035, off the top, at Carl's ~2.1 aspect. A card would be clipped.** If cover is
wanted, register the projection to the uncropped frame with
`camera.setViewOffset(fullW, fullH, offsetX, offsetY, w, h)`. ⛔ **A prerequisite for
placement, and the handoff's "Carl decides the aspect once he can see the cards" is
circular.**

---

## 3. Geometry

**3.1 ⛔⛔ "NEAR-CONSTANT TRIM" REPRODUCES THE CONDITION THAT KILLED THE BEVEL — the
plan had this BACKWARDS.** The bevel went because 4 units on a 48-unit card was
**~4 screen pixels**: *"a facet too small to read as a facet."* ⚠⚠ **That argument was
about SCREEN PIXELS, not proportion.** Holding trim near-constant on a card ~5x larger
gives **the same 4 screen pixels** — the same unreadability, now on 1.5% of the card
instead of 8%.

⛔ **The correct reading is a third thing: TRIM GROWS SUB-LINEARLY.** And it reduces to
a computable criterion: **size the bead and bevel to subtend 8–12 screen px at the
card's smallest rendered instance** — CD, furthest back, narrowest supported window, on
its receding edge (CA's vertical ratio of 1.317 means the far edge reads ~24% smaller).
⚠ **Arithmetic available today, before anything is built.**

**3.2 ⚠ "SAME-SIZED PARTS" NEEDS A REFERENCE FRAME NAMED.** Under one perspective
camera with four cards at four depths, constant world-size trim renders at four
different screen sizes. **Either the four cards are physically identical objects (family
true in the room, trim visibly unequal on screen) OR trim is scaled per card (equal on
screen, not the same object).** ⛔ **That is exactly a "why is there a second X?"
question** — it decides whether one geometry module serves all four.

**3.3 ⛔ THE TILT FIGURE MUST COME FROM BUILT NORMALS**, never from
`maxFaceTiltDegrees()` — *"FOR TUNING READOUTS, NEVER FOR VERIFICATION"*. ⚠ And the
16° / 23.8° ladder **does not transfer**: it was calibrated face-on under an
orthographic camera with a light 30° off-normal. Here the view is oblique and the
light is a rim tube a few units away. ⛔ **Re-derive in situ; inheriting 16° is the
same class of move as inheriting the contact field's 5.0.**

**3.4 ⚠ THE BENCH NEEDS THE OBLIQUE VIEW, NOT JUST FACE-ON.** A crown that reads at
20° face-on is not evidence it reads at 40° oblique under an 89.9° lens. **Put both
cameras on the bench.** Cheap now; a re-do later.

**3.5 ⚠ BUILD AT THE TWO REAL PROPORTIONS.** Wall pair **1.615:1** (420 × 260,
`wall-card-text.tsx:37-38`); floor pair **2.026:1**. Not one ~2:1 sketch.

**3.6 ⛔ THE GLASS CONSTANTS ARE SCALE-BOUND, AND THIS IS PREDICTABLE WITHOUT
TESTING.** `GLASS_THICKNESS` is in world units and *"one world unit here is one CSS
pixel"*; Three.js scales volume thickness by model scale. **Reusing D-051's constants
on a much larger card reads several times more saturated and more opaque.**
⛔ **`thickness` and `attenuationDistance` must be rescaled — arithmetic, not tuning.**

---

## 4. The timing model

**4.1 ⛔ MAKE THE NEON PHASE A PURE FUNCTION OF TIME** and the "state must advance
off-screen" problem disappears:

    lit(i, t) = ((t + phase_i) mod (on_i + off_i)) < on_i,   t = (now − EPOCH)/1000

⚠ **No state to advance, no catch-up, no jump on return.** Render while §2 intersects,
stop dead when it does not, phase correct on the first frame back. ⛔ **It also
delivers the reproducibility the plan wants, which a mounted clock does not** — add a
`?neon=<seconds>` freeze so a screenshot is comparable.

**4.2 ⚠ "COPRIMALITY BUYS THE LENGTH" IS LOOSE.** {5,6,7,8} is not pairwise coprime
(6 and 8 share 2) and still gives 840s. **LCM is the quantity.** 4-and-8 fails because
8 is a **multiple** of 4, not because they share a factor. {5,7,8,9} → 2520s.

**4.3 ⛔⛔ LENGTH PAST A COUPLE OF MINUTES IS VANITY — DUTY CYCLE IS THE REAL LEVER.**
No viewer tracks a 14-minute cycle. What they notice is **how often the room goes
dark**: all-dark fraction = ∏(1 − dᵢ). **At 50% duty each that is 6.25% — a rest every
few seconds, probably too often.** On/off pairs (4,1)(5,2)(6,2)(7,2) give periods
5/7/8/9, pairwise coprime, LCM 2520s, duties 0.80/0.71/0.75/0.78, **all-dark 0.32% — a
rest of a second or two roughly once every five minutes.**
⛔ **Compute the rest pattern from the duties FIRST, then pick periods. The plan had
that ordering backwards.**

**4.4 ⛔ `prefers-reduced-motion` IS UNHANDLED.** A continuous on/off loop is motion.
This project honours the query throughout — **the one accepted lint error is that very
effect.** Under reduced motion the neon should hold a steady state. ⚠ **Belongs with
the mechanism, not chunk 3.**

---

## 5. The glow masks

⚠ **The mechanism is right and the registration argument holds.** Four practical
points:

- ⛔ **`isolation: isolate` on the wrapper** — `screen`/`plus-lighter` otherwise blends
  against whatever is behind the section, not just the plate.
- ⛔ **Masks must not go through a different image pipeline than the plate.** Same fit
  mode, same aspect, same wrapper. A soft glow forgives resampling, not a different crop.
- ⚠ **Screen-blend opacity is not linear in perceived brightness.** If "lit" has
  levels, drive mask opacity with the same eased curve as the emissive.
- ⛔ **TWO LOCKS, NOT ONE.** The masks wait on card positions **and on the plate being
  final** — guides reverted, aspect and fit decided. **Author against the shipping
  plate or the glow lands on a frame that then moves.**

---

## 6. Sequencing

⛔ **2.1 and 2.2 must be INSIDE the §5a note, not deferred into chunks.** What is in
the scene decides what the bench can prove; where the copy lives decides the face
budget.

**Note scope, in addition to the six rows drafted:** what the scene contains
(plate-as-texture and its `next/image` cost) · where §2's copy lives (and the
D-051-A11Y precedent) · the unit system and scale anchor · canvas box vs fit mode and
`setViewOffset` · **one geometry module or four** (the trim reference frame).

⚠ **Also worth a line: `/proto/card` DEPLOYS**, like `/proto/wall` and
`/proto/nextstep`. Consistent with precedent, and Carl has accepted it before — **but
it should be said, not assumed.**

---

## 7. ⛔⛔ FOR CARL — SIX DECISIONS THAT ARE HIS

1. **Frosted or satin?** D-051 is satin and supersedes the frosted decision; the file
   named *glass* holds satin.
2. **Does the plate go into the scene** so the glass refracts the room — accepting the
   `next/image` regression — **or does transmission show nothing?**
3. **Where does the copy live** — baked into the face, or DOM over it?
4. **§2's final aspect and fit mode**, which placement depends on.
5. **Equal trim in the room, or equal trim on screen?**
6. **Duty cycle before periods:** how often may the room go fully dark, and for how long?

---

## ⚠ TWO NOTES ON THE REVIEW ITSELF

⛔ **Nothing above is an approval.**

⚠ **The CA/CB acceptance test is the one item wanting a second pass before it is
relied upon** — the claim that those quads are a true wall-plane projection rests on
the VP convergence check and the sub-1px edge fits. **Strong evidence, but produced
outside this repository.**

---

*Filed 11 September 2026 per Rule 6 — findings do not live only in a chat panel.
Precedent: `architect-plan-response.md`.*
