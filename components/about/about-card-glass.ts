/**
 * /about §2 role-card glass — CS's face material constants.
 *
 * ✔✔ **THE MATERIAL IS APPROVED — Carl's eye, in the room, 22 September 2026.**
 * **D-089, R-027.** *"Material is approved. Its a good basis to start from."*
 * ⛔ **`GLASS_FACE_TRANSMISSION` 0.86 and `GLASS_ROUGHNESS` at CS's 0.35 ARE NOT
 * TO BE CHANGED WITHOUT CARL'S SPECIFIC AUTHORISATION** — *"which is unlikely.
 * I am happy with the frostiness."*
 *
 * ⚠⚠ **ONE THING MAY STILL MOVE, AND IT IS COLOUR, NOT FROST — D-090.** Whether
 * the frosting becomes lightly tinted is OPEN, and it interacts with whether
 * each card's individual light is white or the neon's colour. ⛔ **Both are
 * answered in the lighting chunk, IN THE SCENE, and neither is authorised.**
 *
 * ⛔ **CS ONLY.** CD, CA and CB are still the diagnostic grey; whether they take
 * these values or their own is **undecided** (see `GLASS_THICKNESS_MM`).
 *
 * ⛔⛔ CHUNK 2a: THE BENCH ONLY. These constants are consumed by `card-bench.tsx`
 * through `AboutCardMesh`'s off-by-default `glass` prop. ⛔ `/about` IS NOT
 * TOUCHED — see the gate note on `AboutCardMeshProps.glass`.
 *
 * ⚠⚠ THESE ARE WHERE THE FADERS OPEN, NOT WHAT THEY AIM AT. Carl, 17 September
 * 2026: *"The figures were presented as a starting point."* They came from an
 * outside source and Carl passed them on as such. ⛔ Only `GLASS_THICKNESS_MM`
 * is a value Carl chose.
 *
 * ⚠ THE PRECEDENT IS EXACT AND IT IS WHY THIS DISTINCTION IS WRITTEN DOWN. The
 * face crown opened at an outside recommendation's 0.015–0.03 and **Carl's eye
 * settled 0.073 — nearly THREE TIMES the starting point.** *"The conservative
 * figure was too timid for a card this size in a dark room."* Do not read
 * `GLASS_ROUGHNESS` as a proposal.
 *
 * ⛔ THE FINAL ROUGHNESS IS SET IN THE ROOM, IN 2b — NOT HERE. `lod =
 * log2(transmissionSamplerSize.x) * applyIorToRoughness(roughness, ior)`
 * (`transmission_pars_fragment.glsl.js:147`), so **frost scale depends on the
 * render target's width.** The bench's canvas is not the room's. ⚠ The bench
 * settles the frost's CHARACTER; its SCALE is a property of the render target.
 */

/**
 * ⛔⛔ A TYPED CONSTANT, NOT `heightMm * TENT_POLE_RATIO`. Carl, 17 September
 * 2026, put the two figures and their displacements to him: *"9.80mm"*.
 *
 * ⚠⚠ THE EXPRESSION WOULD GIVE 28.6mm — 2.92x this value — because
 * `TENT_POLE_RATIO` is 0.073, not the 0.025 a stale comment in `card-bench.tsx`
 * asserted until this chunk corrected it. **Every thickness figure in the first
 * draft of the plan was computed at 0.025 and was wrong.** The displacement
 * consequence is not cosmetic:
 *
 *     CS at  9.80mm  ->  2.24 px mean displacement
 *     CS at 28.6mm   ->  6.55 px mean displacement
 *
 * ⛔ AND THE COUPLING TO THE CROWN IS DECLINED — the second half of Carl's
 * ruling. Had thickness been tied to `TENT_POLE_RATIO`, re-tuning the crown on
 * the bench later would have moved the glass thickness silently. **They are now
 * independent.**
 *
 * ⛔⛔ MILLIMETRES, AND MUST NOT BE DIVIDED BY `MM_PER_UNIT`. Verified in
 * `transmission_pars_fragment.glsl.js:127-133`: `normalize(refractionVector) *
 * thickness * modelScale`, where `modelScale` is read from the model matrix.
 * **Thickness is OBJECT space and is already scaled by the group's
 * `scale={cs.scale}`.** ⚠ A value pushed through `MM_PER_UNIT` would be 750x too
 * thin and show nothing — the same trap as the wall cards' missing scale.
 *
 * ⚠ THIS IS CS'S VALUE. ⛔ Whether CD, CA and CB take the same 9.80mm or a value
 * scaled to their own heights is **an open question for the rollout chunk. Do
 * not assume either.**
 */
export const GLASS_THICKNESS_MM = 9.8;

/**
 * ⚠ A STARTING POINT, NOT A TARGET. See the file header — the crown precedent
 * is a 3x move from an outside figure.
 *
 * ⛔ IT MOVES TWO THINGS AT ONCE, which is why the bench sweeps one variable at
 * a time: roughness sets the frost AND the specular highlight's width, and it is
 * then scaled by IOR — `clamp(ior * 2 - 2, 0, 1)`
 * (`transmission_pars_fragment.glsl.js:137-142`).
 */
export const GLASS_ROUGHNESS = 0.18;

/**
 * ⛔⛔ THE RIM IS CLEAR GLASS, NOT FROSTED. Carl, 18 September 2026, on the
 * bench: *"The rim, which will be a neon light should be clear glass with a
 * roughness value of around 0.10."*
 *
 * ⚠⚠ **THE REASON IS THE RIM'S JOB, NOT ITS LOOK.** ⛔ **This rim IS the neon**
 * (`about-card-mesh.tsx` — *"that is now load-bearing rather than incidental"*).
 * A frosted rim would scatter its own emission; **a clear one stays a legible
 * light source.** ⛔ *(Corrected 23 September 2026 on Carl's unlock: this read
 * "the neon itself is chunk 3 and is not built — four colours are ruled, none
 * chosen". D-090 retired the four colours — **the neon is BLUE**, built pair by
 * pair — and **D-093 built the WALL pair's (CA, CB)**; the floor pair's is not
 * built. Its values live in `about-neon.ts`, not here.)*
 *
 * ⚠ **0.10 IS CARL'S FIGURE, GIVEN BY EYE ON THE BENCH**, and it is the ONE
 * roughness in this file he has named. ⛔ Unlike `GLASS_ROUGHNESS` it is not an
 * outside starting point — but it is *"around 0.10"*, so it is a settled
 * neighbourhood rather than a settled decimal.
 */
export const GLASS_RIM_ROUGHNESS = 0.1;

/** ⚠ A starting point. Fixed on the bench and printed, not swept — see above. */
export const GLASS_IOR = 1.45;

/**
 * ⚠ A starting point. Fully transmissive; the frost comes from roughness.
 *
 * ⛔⛔ THIS IS NOW THE RIM'S VALUE ONLY, AND IT STAYS 1.0. The rim is clear
 * glass by Carl's ruling (see `GLASS_RIM_ROUGHNESS`) — **it IS the neon**, and
 * a body tone on a light source is wrong. ⚠ The FACE and BEVEL take
 * `GLASS_FACE_TRANSMISSION`, a separate dial for a separate job. **Before
 * 22 September 2026 all three surfaces shared this one constant.**
 */
export const GLASS_TRANSMISSION = 1.0;

/**
 * ⛔⛔ THE FACE AND BEVEL'S TRANSMISSION — SPLIT FROM THE RIM'S ON 22 September
 * 2026, BECAUSE THE CARD HAD NO BODY OF ITS OWN.
 *
 * ⚠⚠ **AT `transmission: 1.0` A `meshPhysicalMaterial` HAS NO DIFFUSE
 * CONTRIBUTION AT ALL.** This file already states it of the rim — *"at
 * `transmission: 1` a clear material has no diffuse colour"* — and it was
 * equally true of the face, where it was NOT the intention. **Every pixel of
 * the card's body was refracted background or specular reflection**, so the
 * card took its brightness entirely from whatever sat behind it.
 *
 * ⛔ **THE OBSERVED FAULT — Carl, 22 September 2026, on the built room:** *"the
 * blurring is working well due to the backplate but its difficult to make out
 * the shape of the card."* ⚠ **Against the dark desk mass CS's left edge
 * disappears entirely** — there is nothing for it to be brighter than.
 *
 * ⛔⛔ **AND MORE ROUGHNESS IS NOT THE FIX. THIS IS THE TRAP.** Roughness blurs
 * the background further; **a blurred dark background is still dark.** Chasing
 * the frost upward lands on the reference Carl explicitly REJECTED, where the
 * background is destroyed: *"Too much for us."* ⚠⚠ **The missing ingredient was
 * never frost. It was TONE.**
 *
 * ⚠ **BELOW 1.0, `GLASS_COLOR` STARTS TO MEAN SOMETHING.** White at partial
 * transmission is what gives the reference Carl chose its body — a panel
 * lighter than its background on ANY background, including a dark one. ⛔ At
 * 1.0 the white was inert.
 *
 * ⚠⚠ **A STARTING POINT, NOT A TARGET — and the precedent is this project's
 * own.** The crown opened at an outside recommendation's 0.015-0.03 and
 * **Carl's eye settled 0.073, nearly THREE TIMES it.** ⛔ An outside source
 * proposed **0.95** here on 22 September; **0.95 is a 5% body and is almost
 * certainly too timid for a card this size in a dark room** — the same failure
 * mode as the crown's opening figure. **Do not read this value as a proposal.**
 */
/**
 * ✔✔ **APPROVED BY CARL'S EYE IN THE ROOM, 22 September 2026 — D-089, R-027.**
 * *"0.86 was a good estimation. Material is approved."*
 *
 * ⛔⛔ **DO NOT CHANGE THIS VALUE WITHOUT CARL'S SPECIFIC AUTHORISATION, AND HE
 * HAS SAID THAT IS UNLIKELY.** Carl, 22 September: *"It should be put somewhere
 * so future sessions wont change it unless i give specific authorisation. Which
 * is unlikely. I am happy with the frostiness."*
 *
 * ⚠⚠ **HE SWEPT THE FADER TO BOTH ENDS BEFORE RULING**, so this is a bounded
 * verdict and not a single sample:
 *
 *     0.5   full left    "gives a milky effect"      -> stops being glass
 *     1.0   full right   "practically clear"         -> the ORIGINAL FAULT
 *     0.86               "a good estimation"         -> APPROVED
 *
 * ⛔ **THE ONE THING THAT MAY STILL MOVE IS COLOUR, NOT FROSTINESS — D-090.**
 * Whether the frost becomes lightly tinted is open and interacts with whether
 * each card's individual light is white or the neon's colour. ⚠ **That is a
 * change to `GLASS_COLOR` / `GLASS_ATTENUATION_COLOR`, NOT to this number.**
 */
export const GLASS_FACE_TRANSMISSION = 0.86;

/**
 * ⛔⛔ CD's OWN FACE TRANSMISSION — HIGHER THAN CS'S, AND THE DIFFERENCE IS THE
 * POINT. ⚠ **PROVISIONAL, 22 September 2026. Not swept, not approved.**
 *
 * ⛔ **THE OBSERVATION — Carl, on both floor cards at an identical 0.86:**
 * *"they do read as different cards."* **CD reads MILKY where CS reads CLEAR.**
 *
 * ⚠⚠ **AND THE BUILDER'S PREDICTION WAS WRONG, WHICH IS WHY THE MECHANISM IS
 * WRITTEN OUT.** It predicted CD would look *clearer* than CS — on the grounds
 * that CD is nearer and larger, so a fixed frost covers less of it. ⛔ **The
 * opposite happened, and the reason is the BACKGROUND, not the card:**
 *
 *     at 0.86 a pixel is 86% background + 14% WHITE BODY
 *     the body is a CONSTANT. what it is added to is NOT.
 *
 *     CD  overlaps the DARK desk front      -> body dominates -> MILKY
 *     CS  overlaps LIT, grainy floorboards  -> background dominates -> CLEAR
 *
 * ⛔⛔ **SO A FIXED MATERIAL OVER A VARYING BACKGROUND READS AS A VARYING
 * MATERIAL.** ⚠ **This is Carl's own 18 September finding inverted** — *"you can
 * tell the different types of glass... by how the background does too."* **It
 * cuts both ways, and no single transmission value makes four cards match.**
 *
 * ⚠ **CARL'S METHOD, FROM HIS OWN SWEPT ENDS:** *"0.5 = milky, 1.0 = clear. If
 * CD is 0.86 and its giving off this milky look i would up the value."*
 * ⛔ **THE TARGET IS CS'S APPEARANCE, NOT CS'S NUMBER.**
 *
 * ⛔⛔ **THE LADDER, IN ORDER, BECAUSE THE BRACKET IS THE EVIDENCE:**
 *
 *     0.86  Carl: "they do read as different cards"   -> MILKY, rejected
 *     0.93  Carl: "thats a lot closer"                -> close, not settled
 *     0.95  Carl: "CD is good at 0.95"                -> ✔ SETTLED
 *     0.94  a fallback named in advance and NEVER NEEDED
 *
 * ✔✔ **SETTLED AT 0.95 BY CARL'S EYE, 22 September 2026.** ⚠ **He inspected the
 * edge he predicted would fail and reported the opposite of the Builder's
 * prediction:** *"i think the left edge can still be made out, if theres a loss
 * of clarity its at the right edge."* ⛔ **The Builder had named the LEFT edge.
 * Wrong again, and in the same direction** — it reasoned from "dark background"
 * rather than from LOCAL CONTRAST. **The left edge sits against dark wall and
 * skirting, which the pale body separates from; the right edge sits against the
 * dark under-desk shadow, where body and background converge on one value.**
 *
 * ⚠ **THE RIGHT-EDGE SOFTENING IS ACCEPTED, NOT ABSENT.** Carl kept 0.95 knowing
 * it. ⛔ **Do not "fix" it.**
 *
 * ⚠ **THE BUILDER'S STANDING ADVICE, RECORDED SO IT IS NOT LOST:** this may be
 * a compensation for lighting that does not exist yet. **Each card is to get
 * its own light plus neon spill (D-090)**, which lifts a card's surface
 * brightness independently of its background — the exact lever that would make
 * cards read alike without per-card materials. ⛔ **Revisit this value when the
 * lighting lands.** ⚠ Same class of thing as `ENV_PLATE_INTENSITY = 6.0`.
 */
export const CD_FACE_TRANSMISSION = 0.95;

/**
 * ⛔⛔ CA's OWN FACE TRANSMISSION — THE SECOND CARD TO LEAVE THE 0.86 BASELINE.
 * ⚠ **PROVISIONAL, 22 September 2026. Under inspection, not approved.**
 *
 * ⛔ **CARL'S TEST IS FAMILY RESEMBLANCE, NOT MATCHED NUMBERS** — 22 September:
 * *"they feel all part of the same family except CA."* ⚠⚠ **THAT IS THE
 * ACCEPTANCE CRITERION FOR THIS WHOLE ROLLOUT AND IT IS NOT "ALL FOUR AT ONE
 * VALUE".** **Four cards against four different backgrounds need four values to
 * look like one material. §14a: a recurring theme WITH VARIATIONS.**
 *
 * ⚠ **CB WAS LEFT AT 0.86 DELIBERATELY. Carl named CA alone**, and CB passed his
 * eye in the same frame. ⛔ **Do not "tidy" the wall pair onto one number
 * because they share a wall — the ruling was card-by-card.**
 *
 * ⚠⚠ **AND THE BUILDER'S PREDICTION WAS WRONG A THIRD TIME, IN THE SAME
 * DIRECTION.** It named CA as the likeliest to need its own value **for the
 * wrong reason** — ~14 degrees mean incidence, where refraction barely happens.
 * ⛔ **The actual driver is the same one that split the floor pair: the DARK,
 * FEATURELESS WALL behind it.** **Right card, wrong mechanism.**
 *
 * ⛔ **THE PATTERN ACROSS ALL FOUR, now consistent enough to state:**
 *
 *     background BRIGHT + detailed (floorboards)  ->  0.86 reads correct
 *     background DARK + featureless (desk, wall)  ->  0.86 reads MILKY
 *
 * ⚠ **CS IS THE ONLY CARD WITH A BRIGHT, BUSY BACKGROUND** — it is the
 * exception, not the standard the others should match.
 *
 * ⛔⛔ **ALL OF THESE VALUES MAY MOVE WHEN THE LIGHTING LANDS — CARL, EXPLICITLY:**
 * *"it is possible that these values might need tweaking once neon and light are
 * added. We wont know until then."* ⚠ **Each card gets its own light plus neon
 * spill (D-090/D-091), which lifts a card's surface brightness INDEPENDENTLY of
 * its background** — the exact lever that could collapse these four values back
 * toward one. **Do not treat any of them as final.**
 */
export const CA_FACE_TRANSMISSION = 0.95;

/**
 * ⛔⛔ WHITE, NOT THE DIAGNOSTIC GREY — and this is a measured correction, not a
 * preference. **Transmission is multiplied by `color`**, so carrying
 * `DIAG_FACE_COLOR` `#c8c8c8` across would tint the *"colourless"* glass to
 * **78%**. ⚠ It would have read as a dim or dirty glass and been tuned against.
 */
export const GLASS_COLOR = "#ffffff";

/**
 * No absorption. ⚠ A starting point — CS is colourless by Carl's ruling.
 *
 * ⛔ **WHETHER THE FROST BECOMES LIGHTLY COLOURED IS AN OPEN QUESTION — D-090**,
 * raised by Carl on 22 September 2026 and **deliberately not answered.** ⚠⚠ **It
 * interacts with a second open question — whether each card's individual light
 * is white or the neon's colour** — and the pair must be swept against each
 * other, not decided separately. ⛔ **A tint here would change D-089's APPROVED
 * colourless material and needs Carl.**
 */
export const GLASS_ATTENUATION_COLOR = "#ffffff";

/** No absorption over distance. ⚠ A starting point. */
export const GLASS_ATTENUATION_DISTANCE = Infinity;

export const GLASS_METALNESS = 0;

/**
 * ⛔ SET AGAINST THE OUTSIDE SOURCE'S `DoubleSide`, and the REASON stated in the
 * plan was wrong even though the decision is right.
 *
 * ⚠ F5 — the plan called these *"opaque-backed cards."* **They are not.** The
 * face is a single surface over a rim ring with nothing behind it in the scene;
 * `thickness` fakes a solid slab. ⛔ FrontSide is still correct — **the camera
 * never sees the back** — but the reason was wrong, and a wrong reason recorded
 * in support of a right conclusion becomes a false fact later readers rely on.
 *
 * ⚠ NOT EXPORTED AS A CONSTANT. `THREE.FrontSide` is applied at the material in
 * `about-card-mesh.tsx`; re-exporting it from here as a string would need a
 * translation step and would be a second name for one value. **The decision is
 * recorded here; the value is set where it is used.**
 */

/**
 * ⛔ THE BENCH'S FADER RANGES. ⚠ Deliberately wider than the starting points, so
 * the fader can travel where Carl's eye actually goes — the crown moved 3x past
 * its opening figure and a range clamped near the recommendation would have made
 * that value unreachable without a code edit.
 */
export const GLASS_ROUGHNESS_RANGE = { min: 0, max: 1, step: 0.005 } as const;
export const GLASS_THICKNESS_RANGE_MM = { min: 0, max: 60, step: 0.1 } as const;

/**
 * ⛔ THE FACE-TRANSMISSION FADER'S RANGE. ⚠ It reaches **0.5**, far past the
 * 0.95 an outside source proposed, for the reason stated on
 * `GLASS_FACE_TRANSMISSION`: **a range clamped near a recommendation makes
 * Carl's actual value unreachable without a code edit**, and the crown moved 3x
 * past its opening figure.
 *
 * ⚠ It stops at 1.0 at the top because that is fully clear — there is nothing
 * above it. **Below 0.5 the card stops being glass and becomes a white panel**;
 * the floor is there so the fader can prove that rather than assert it.
 */
export const GLASS_FACE_TRANSMISSION_RANGE = {
  min: 0.5,
  max: 1,
  step: 0.005,
} as const;

/**
 * ⛔⛔ THE BACKGROUND IS WHAT MAKES THE TWO GLASSES DISTINGUISHABLE — CARL,
 * 18 September 2026, ON SEEING THE BUILT CARD:
 *
 *   *"You can tell the different types of glass not just by the way light
 *    interacts with it but how the background does too."*
 *
 * ⚠⚠ **THIS IS A STRONGER CLAIM THAN "THE GLASS NEEDS SOMETHING TO REFRACT", AND
 * IT CHANGES WHAT THE BACKPLATE IS FOR.** The frosted face BLURS the floorboards;
 * the clear rim keeps them SHARP and bends them. **Same room behind both, two
 * treatments of it** — and that contrast is what reads as two materials.
 *
 * ⛔ **SO THE BACKPLATE IS NOT SCENERY. It is the instrument that makes material
 * difference legible.** Against a flat or empty background, roughness 0.10 and
 * roughness 0.35 are nearly the same picture: there is no detail for one to
 * preserve and the other to destroy.
 *
 * ⚠ **WHAT THIS BEARS ON, so it is not rediscovered:**
 *   - **2b** — the room's background behind each card is not interchangeable.
 *     ⛔ Carl already flagged it: *"in the About scene, it is quite dark
 *     underneath the desk."* **A card against a dark, featureless region will
 *     show less material character than this bench does**, and that is a property
 *     of the placement, not of the material.
 *   - **Rollout** — CA at 14.0 degrees mean incidence barely refracts (see the
 *     incidence table in the chunk 2 plan). **What is behind it matters more
 *     there, not less.**
 *   - **The text chunk** — copy sitting ON the face competes with the background
 *     seen THROUGH it. Both occupy the same pixels.
 */

/**
 * ⛔⛔ THE ENVIRONMENT MAP — REQUIRED, AND THE REASON IS THE RIM, NOT THE FACE.
 *
 * ⚠⚠ **AN EARLIER NOTE IN THIS PROJECT SAID AN ENV MAP WAS "NOT REQUIRED AND NOT
 * THE ANSWER". THAT WAS TRUE OF THE FACE AND IS FALSE OF THE RIM**, and the two
 * were not distinguishable until Carl ruled the rim clear on 18 September.
 * **Corrected in place rather than left standing** — a sentence that was true
 * when written and is now false is this project's most-recorded failure.
 *
 * ⛔ **THE FROSTED FACE DOES NOT NEED ONE.** The backplate supplies it — measured
 * 2.2 -> 99.6 with the control unmoved at 113.2.
 *
 * ⛔⛔ **THE CLEAR RIM CANNOT RENDER WITHOUT ONE.** At `transmission: 1` a clear
 * material has no diffuse colour, and ⚠ **transmissive objects are excluded from
 * the transmission render target** (`three.module.js:18039` renders
 * `opaqueObjects` ONLY), so the rim cannot see itself or its neighbours.
 * **Specular reflection is the only channel left that can draw it.** ⚠ Measured:
 * with no environment the all-glass card lost its silhouette entirely; with one,
 * the rim returned as a bright edge with corner catch-lights.
 *
 * ⛔⛔ **AND THE PROJECT ALREADY HAS A WORKED PRECEDENT FOR THE HARD HALF OF
 * THIS — `/start`'s SEND OPAL. See D-091.** A **DOM element lit by a WebGL
 * light**: the orbiting rig writes `--opal-shine` on the same frame it moves,
 * and the CSS button reads it in **one** of eleven gradient layers.
 * ⚠ `components/enquiry/contact-field-light-rig.tsx` — **a protected file; read
 * it, do not edit it.**
 *
 * ⚠⚠ **FOUR RULES IT PROVES, ALL OF THEM RELEVANT HERE:** one layer moves and
 * ten do not; one clock drives both halves or they drift; **true proximity was
 * MEASURED AND REJECTED** because the authored curve reads as caused and the
 * physical one does not; and its fallback renders the approved material when
 * nothing drives it. ⛔ **`/about`'s neon faces the same problem against a
 * photograph — do not invent a new architecture for it.**
 *
 * ⚠ **AND IT IS NOT A SUBSTITUTE FOR THE NEON.** `answer-card-canvas.tsx` states
 * the distinction exactly: *"Panels are things to be SEEN IN a reflection, not
 * lights."* ⛔ **An env map makes the rim LEGIBLE. The neon is what will make it
 * CORRECT** — and Carl's references (18 September) show a rim that visibly spills
 * onto the floor and the surrounding wall, with bloom. **That is emission plus a
 * real light, and it is chunk 3. This constant does not deliver it.**
 */
export const ENV_SHELL_RADIUS = 60;

/**
 * ⛔ DERIVED FROM THE ROOM, NOT A SYNTHETIC STUDIO — and that is the difference
 * from the `/start` precedent, which builds two abstract panels in a black shell.
 *
 * ⚠⚠ **A drei `apartment` PRESET WAS USED AS A DIAGNOSTIC AND IS NOT A
 * CANDIDATE.** It proved the mechanism and **lights the card with reflections of
 * a room that is not this one** — it also lifted the bench's control from 113 to
 * 225, so it was brightening the whole scene, not just the glass. ⛔ §14a:
 * *"Effects should feel caused by the world, not layered on top of it."* **A rim
 * reflecting somebody else's apartment is the definition of layered on top.**
 */
export const ENV_FROM_PLATE = true;

/**
 * ⚠ THE SHELL'S BASE TONE, sampled from the room's dark surround. It is what the
 * rim reflects where the plate does not reach. ⛔ Deliberately NOT black: a pure
 * black shell gives a clear rim nothing at all across most of its arc, which is
 * the failure this env map exists to fix.
 */
export const ENV_SHELL_COLOR = "#141a20";

/**
 * ⚠ HOW BRIGHT THE PLATE READS IN THE REFLECTION. ⛔ A STARTING POINT, not a
 * settled value — it is a fader for Carl's eye, and the rim's final reading
 * depends on the neon that does not exist yet.
 */
export const ENV_PLATE_INTENSITY = 6.0;

/**
 * ⛔⛔ 6.0 IS A COMPENSATION, NOT A PHYSICAL VALUE — AND SAYING SO IS THE POINT.
 *
 * ⚠⚠ **IT MULTIPLIES A PHOTOGRAPH OF A DIM ROOM BY SIX TO MANUFACTURE HIGHLIGHTS
 * THAT ARE NOT IN IT.** At a physical 1.6 the rim barely read; at 6.0 it reads as
 * a continuous tube. ⛔ **Nothing about 6.0 is derived. It is the number at which
 * a missing light source stops being visible as missing.**
 *
 * ⛔ **THE REAL FINDING, 18 September 2026: A CARD IN A DIM ROOM HAS NOTHING
 * BRIGHT TO REFLECT.** A reflection can only be as bright as what it reflects,
 * and this room — correctly, by D-073 — is dark. ⚠ **A drei `apartment` preset
 * produced a far stronger rim for exactly one reason: it contains windows.**
 *
 * ⚠⚠ **AND CARL'S OWN REFERENCES INVERT THE WHOLE PROBLEM.** In both, **the rim
 * is the brightest thing in the frame and the ROOM reflects IT** — light travels
 * outward, not inward. ⛔ **So the rim will not read correctly until it EMITS:**
 * emission on the rim, a real light at it so the floor is lit by it, and a bloom
 * pass for the spill past the geometry. **That is chunk 3, and it is the actual
 * answer to "why does the rim not read".**
 *
 * ⛔ **WHAT THIS CONSTANT IS FOR, HONESTLY:** it makes the rim legible enough to
 * judge the FACE and the card's silhouette on the bench today. ⚠ **It should be
 * revisited — probably downward — the moment the neon exists**, because the neon
 * supplies the brightness this number is standing in for.
 */

/**
 * ⚠ WHAT WAS DELIBERATELY LEFT OUT, so it is not rediscovered as an omission:
 *
 *   `anisotropy`  ⛔ NEEDS A `tangent` ATTRIBUTE AND THIS GEOMETRY HAS NONE
 *                 (verified: `grep tangent` -> 0 hits). Satin's character on
 *                 `/start` comes from anisotropy 0.86. **It is the same absence
 *                 that made the normal-map route inert on 14 September** — built
 *                 right, bound right, UVs added, still nothing.
 *   `clearcoat`   ⛔ FORBIDDEN BY NAME for this chunk. `answer-card-mesh.tsx:226`:
 *                 *"SWEEP IT WITH `roughness`, NEVER ALONE."*
 *   `thicknessMap` possible (the UVs exist), out of scope, recorded only.
 *   tint          CS stays colourless by Carl's ruling. ⛔ *(Corrected 23 September
 *                 2026: this read "the four neon colours are ruled to be four and
 *                 all different; none is chosen". D-090 RETIRED four colours —
 *                 the neon is BLUE, pair by pair; the wall pair starts from the
 *                 logo's navy "c", `about-neon.ts`.)* Whether the frost itself is
 *                 tinted is still D-090's open question 1.
 */
