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
