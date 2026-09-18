/**
 * /about §2 role-card glass — CS's face material constants.
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
 * light source.** ⚠ The neon itself is chunk 3 and **is not built** — four
 * colours are ruled, none chosen.
 *
 * ⚠ **0.10 IS CARL'S FIGURE, GIVEN BY EYE ON THE BENCH**, and it is the ONE
 * roughness in this file he has named. ⛔ Unlike `GLASS_ROUGHNESS` it is not an
 * outside starting point — but it is *"around 0.10"*, so it is a settled
 * neighbourhood rather than a settled decimal.
 */
export const GLASS_RIM_ROUGHNESS = 0.1;

/** ⚠ A starting point. Fixed on the bench and printed, not swept — see above. */
export const GLASS_IOR = 1.45;

/** ⚠ A starting point. Fully transmissive; the frost comes from roughness. */
export const GLASS_TRANSMISSION = 1.0;

/**
 * ⛔⛔ WHITE, NOT THE DIAGNOSTIC GREY — and this is a measured correction, not a
 * preference. **Transmission is multiplied by `color`**, so carrying
 * `DIAG_FACE_COLOR` `#c8c8c8` across would tint the *"colourless"* glass to
 * **78%**. ⚠ It would have read as a dim or dirty glass and been tuned against.
 */
export const GLASS_COLOR = "#ffffff";

/** No absorption. ⚠ A starting point — CS is colourless by Carl's ruling. */
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
 *   tint          CS stays colourless by Carl's ruling. The four neon colours are
 *                 ruled to be four and all different; **none is chosen.**
 */
