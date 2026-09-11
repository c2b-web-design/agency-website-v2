/**
 * /about §2 role-card geometry — the four cards that stand in the studio
 * photograph (CA/CB on the walls, CD/CS on the floor).
 *
 * ⛔⛔ CHUNK 1: GEOMETRY ONLY. No material, no neon, no room, no placement.
 * Carl, 11 September 2026: *"Don't put glass in yet, use a placeholder
 * material."* The mesh wears a three-tone diagnostic, the same instrument both
 * existing objects were built under.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * UNITS: MILLIMETRES. ⚠ AND THIS BREAKS THE PROJECT'S EXISTING CONVENTION.
 * ══════════════════════════════════════════════════════════════════════════
 *
 * ⛔ `answer-card-geometry.ts`, `contact-field-geometry.ts` and
 * `nextstep-geometry.ts` all state the same precondition: one world unit is one
 * CSS pixel, valid ONLY under an orthographic camera at `zoom: 1`, where R3F
 * sets the frustum in CSS px. **These cards are seen by a PERSPECTIVE camera
 * matched to a photograph, so that mapping cannot hold** — a card at the back of
 * the room and one at the front project differently by construction.
 *
 * ⚠ SO A REAL-WORLD SCALE IS ADOPTED INSTEAD, on the Architect's recommendation
 * (11 September): it makes "the same object family" physically true rather than
 * a resemblance. A 6mm rim channel is a real extruded neon profile; a 6-unit one
 * is a number.
 *
 * ⛔ THE SCALE ANCHOR IS AN ASSUMPTION, NOT A MEASUREMENT: the desks are taken to
 * be 750mm high, a standard sit-stand desk at seated height. Nothing in the
 * photograph confirms it. **If it is wrong, every dimension here scales by the
 * same factor and NOTHING about the design changes** — the cards are specified
 * relative to each other and to the room, not absolutely. Stated so a future
 * reader does not treat 750 as measured.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * THE FAMILY — Carl's specification, 11 September 2026
 * ══════════════════════════════════════════════════════════════════════════
 *
 * > *"A shape that has a rim, bevel and curved face. The corners can be the
 * > same. A corner is a corner no matter what the dimensions."*
 *
 * ⛔ RIM, BEVEL AND CORNER RADIUS ARE TRIM. They do NOT scale proportionally with
 * the card. Carl: *"in the q+a cards proportion of the rim and bevel shouldn't be
 * scaled up... we need face real estate for the text."*
 *
 * ⚠⚠ BUT "CONSTANT" IS ALSO WRONG, AND THE ARCHITECT CAUGHT THE BUILDER GETTING
 * THIS BACKWARDS. The bevel was removed from the answer card because 4 units on a
 * 48-unit card was **~4 SCREEN PIXELS** — *"a facet too small to read as a
 * facet."* ⛔ **That argument was about SCREEN PIXELS, not proportion.** Holding
 * trim at a constant world size on a much larger card reproduces the same 4
 * screen pixels and the same unreadability.
 *
 * ⛔ **THE RULE IS THEREFORE: TRIM GROWS SUB-LINEARLY.** It rises with the card so
 * it stays visible, but far slower than proportionally so it never becomes a
 * frame. Expressed here as a PERCENTAGE OF CARD HEIGHT, held small.
 *
 * ⚠ THE 8-12 SCREEN-PX TARGET THE REVIEW PROPOSED WAS NOT ADOPTED, AND THE
 * REASON IS THE APPROVED OBJECT ITSELF. Computed against CD at a 390px window it
 * demanded a bead of 15-22% of card height — a picture frame. **The shipped Q5
 * card's rim consumes 8.3% of its height and subtends FOUR css px, and it reads
 * correctly.** So 4px is sufficient evidence against a 8-12px floor. The heuristic
 * is sound in general and is contradicted here by the product.
 *
 *     window   CD renders    trim @4% of H
 *       390      144x71        2.8 px
 *      1024      377x186       7.4 px
 *      1920      707x349      14.0 px
 *
 * ⚠ 2.8px on a 390px phone is thin. ⛔ NOT YET JUDGED BY EYE — if Carl finds it
 * too fine at the small end, the answer is a floor on the rendered size, not a
 * larger percentage, which would cost the face at every other width.
 */

// ── The scale anchor ─────────────────────────────────────────────────────────

/**
 * Assumed desk height, millimetres. ⛔ AN ASSUMPTION — see the header. Everything
 * below is derived from the room's proportions against this one figure.
 */
export const DESK_HEIGHT_MM = 750;

// ── Card outlines ────────────────────────────────────────────────────────────

/**
 * The floor pair's aspect ratio.
 *
 * ⛔ 2.026:1, AND IT IS CARL'S, NOT A CHOICE MADE HERE. It comes from the
 * approved landscape geometry of 10 September — CD 663x327 and CS 659x325 on the
 * 1800px plate — which reversed the 4 September portrait ruling once the copy met
 * its container. Full record:
 * `live-work/floor-copy-overlay-withdrawn-11-september.md`.
 *
 * ⚠ THE PAIR IS MATCHED BY ASPECT, NOT BY HEIGHT. CD sits further back, so equal
 * on-screen height would be a DIFFERENT REAL SIZE in the room. Carl accepted the
 * consequence: *"the green card will still have some dead space at the bottom,
 * thats ok."*
 */
export const FLOOR_CARD_ASPECT = 2.026;

/**
 * The wall pair's aspect ratio.
 *
 * ⚠ 1.615:1 — from `wall-card-text.tsx`'s 420x260 card space, NOT from the pinned
 * corners (which are a projected trapezoid and do not state an aspect directly).
 * ⛔ PROVISIONAL. The wall pair is not this chunk's subject and this value is
 * recorded only so the bench can show both proportions side by side.
 */
export const WALL_CARD_ASPECT = 1.615;

/**
 * Floor card height in millimetres.
 *
 * ⛔ DERIVED FROM THE ROOM, NOT CHOSEN. The card stands on the floor behind a
 * chair; its top must clear the desk surface to be readable over it, and it must
 * not reach the monitors. `DESK_HEIGHT_MM` is the anchor: a card ~1.15x desk
 * height stands a little above the desk line.
 *
 * ⚠ PROVISIONAL AND EXPECTED TO MOVE. Carl judges this in situ — *"I would have
 * to see the cards built in situ before I can determine where along the line they
 * should sit. It's about balance within the scene."* The number exists so there is
 * something to look at.
 */
export const FLOOR_CARD_HEIGHT_MM = 860;

/** Floor card width, from the approved aspect. */
export const FLOOR_CARD_WIDTH_MM = FLOOR_CARD_HEIGHT_MM * FLOOR_CARD_ASPECT;

// ── Trim: the parts that do NOT scale with the card ──────────────────────────

/**
 * Corner radius, as a fraction of card height.
 *
 * ⚠ CARL: *"A corner is a corner no matter what the dimensions."* Read strictly
 * that argues for a constant radius in millimetres. ⛔ It is expressed as a
 * fraction here for one reason: the wall and floor cards have different aspect
 * ratios, and a constant radius reads as a different amount of rounding on each.
 * The fraction keeps the CORNER'S CHARACTER equal, which is what the sentence is
 * about.
 *
 * ⚠ Calibrated against the Q5 card: 14px radius on a 48px height = 29%. That is a
 * strip, where the radius nearly meets the top and bottom edges. On a 2:1 card
 * the same 29% would read as a stadium. 12% preserves the *look* of Carl's sketch
 * — a generous but clearly rectangular corner.
 *
 * ⛔ NOT APPROVED. Carl's sketch is the reference and it was, in his words,
 * *"knocked up in 30s in Microsoft Paint"* — the idea, not the measurements.
 */
export const CORNER_RADIUS_RATIO = 0.12;

/**
 * Rim bead radius, as a fraction of card height. The rim is a HALF-TUBE swept
 * along the perimeter — see `about-card-mesh.tsx` for why that shape and not a
 * flat extrude.
 *
 * ⚠ 2.2% of height. On the Q5 card the rim tube is radius 2 on a 48px card =
 * 4.2%, and the rim consumes `2R` per side (8.3% of the height). Halving the
 * ratio is the sub-linear growth the family rule requires: the bead still grows
 * with the card, but a 2:1 panel does not end up wearing a strip's proportions.
 */
export const RIM_BEAD_RATIO = 0.022;

/**
 * Bevel band width, as a fraction of card height.
 *
 * ⛔⛔ THE BEVEL RETURNS, AND IT WAS ZERO ON THE ANSWER CARD. `BEVEL_WIDTH = 0`
 * there since 5 August because 4 units on a 48-unit card was ~4 screen pixels —
 * *"a sixth of the card's height spent on a facet too small to read as a facet.
 * It cost the thing it was supposed to provide."*
 *
 * ⚠ THE ARGUMENT DOES NOT TRANSFER, BUT NOT FOR THE REASON FIRST WRITTEN. It is
 * not simply that the card is bigger — a constant-size bevel would render at the
 * same unreadable 4px. It is that at 3% of a card 5x taller the bevel is both a
 * small fraction of the face AND large enough on screen to catch light.
 *
 * ⛔ AND CARL NAMES ITS PURPOSE: *"bevels and light shone from the right direction
 * create shadows and emphasize geometry."* The bevel is the surface that MAKES the
 * shadow — a rim alone gives an outline; a rim plus a bevel gives an angled facet
 * that takes light differently from the face beside it.
 */
export const BEVEL_WIDTH_RATIO = 0.03;

// ── The convex face ──────────────────────────────────────────────────────────

/**
 * How far the face's apex stands PROUD of the rim's apex, as a fraction of height.
 *
 * ⛔ PROUD, NOT RECESSED, AND THIS FOLLOWS THE ANSWER CARD RATHER THAN THE CONTACT
 * FIELD. The two approved objects differ here and the difference is a documented
 * reversal: the contact field recesses its face; the answer card was changed on
 * Carl's instruction — *"the highest part of the convex face should sit above the
 * rim to have effect on the other faces."*
 *
 * ⚠⚠ THE OLD REASONING WAS INVERTED, NOT MERELY WRONG. It argued a proud face
 * would obstruct the filament's light travelling inward. **The point is that the
 * face must be high enough to ACT ON the other surfaces** — a crown sunk below its
 * own rim is shaded by it and can never catch light across its top, *"which is
 * exactly why the card read as an outline around a dark hole."*
 *
 * ⛔ THIS MATTERS MORE HERE THAN THERE. The neon rim is the light source, wrapped
 * around the card's own perimeter. A recessed face would sit in its own shadow.
 */
export const FACE_PROUD_RATIO = 0.018;

/**
 * Crown height as a fraction of card height.
 *
 * ⛔⛔ A RATIO, NOT A NUMBER — Carl, 11 September 2026: *"this formula should be
 * used for all cards. Not the exact same figures because the cards are different
 * sizes."* Every other dimension here already derived from card height; the crown
 * was the last fixed millimetre value and would have broken the family.
 *
 * ⚠⚠ WHAT IS PRESERVED IS THE ANGLE, NOT THE DEPTH, and that is the whole reason
 * a ratio is correct here. Held at 9.01%, the maximum surface tilt is IDENTICAL at
 * every size:
 *
 *     height    crown     tilt
 *      600mm    54.1mm   27.9°
 *      860mm    77.5mm   27.9°
 *     1110mm   100.0mm   27.9°     <- the size Carl judged
 *     1400mm   126.1mm   27.9°
 *
 * ⛔ A FIXED MILLIMETRE CROWN WOULD READ AS A DOME ON A SMALL CARD AND FLAT ON A
 * LARGE ONE. The contact field's own record is the worked case: a crown of 1.2
 * gave 5.67° and was *"physically incapable of showing itself"*, while 7.5 gave
 * 36.4° and *"reads as a dome"*. **The angle is the design; the depth is its
 * consequence.**
 *
 * ⚠ 9.01% IS BACK-DERIVED FROM THE BENCH: 100mm on the 1110mm card Carl was
 * looking at when he approved the shape. ⛔ NOT INDEPENDENTLY CHOSEN, and not
 * approved as a ratio — he approved a rendering, and this is the number that
 * reproduces it at any size.
 */
export const CROWN_RATIO = 0.0901;

/**
 * ⛔⛔ SUPERSEDED 11 SEPTEMBER 2026 — THE FACE IS A LENS AND HAS NO PLATEAU.
 *
 * ⚠ Retained as an EXPORT because `about-card-mesh.tsx` still takes it as a
 * parameter, where it is ignored and documented as such. ⛔ Deleting it would
 * mean editing the signature to prove a point the comment already makes; leaving
 * it undocumented would let a reader think the plateau model is live.
 *
 * **What it was:** a broad flat plateau, 0.72 of each axis, with the curve
 * confined to a band near the rim. The reasoning was that a flat centre PROTECTS
 * the text by keeping curvature away from it.
 *
 * ⚠⚠ IT DID THE OPPOSITE, AND THE FIRST RENDER SHOWED IT. Confining all the
 * curvature to a narrow band makes that band STEEP — a visible shoulder — while
 * the flat centre shrinks to pay for it. Carl: *"it appears the darker grey
 * rectangle is where the text will be, smaller real estate... You cannot put text
 * on the slope. It would be better if it was dome like and not having such a
 * sudden rise. Almost like a lens."*
 *
 * ⛔ **The plateau cost the thing it was meant to protect.** Same shape of error
 * as the answer card's bevel, which *"cost the thing it was supposed to
 * provide."*
 *
 * ⚠ NOTE THE PARAMETER IS NOT WRONG ON THE APPROVED OBJECTS. Both are shallow
 * STRIPS where a plateau on the long axis keeps the writing plane calm and the
 * roll-off has a whole short axis to spread across. **The value did not
 * transfer; the reasoning behind it did not either.**
 */
export const CROWN_PLATEAU_U = 0.72;

// ── Derived dimensions ───────────────────────────────────────────────────────

export type CardDims = {
  widthMm: number;
  heightMm: number;
  cornerRadiusMm: number;
  rimBeadMm: number;
  bevelWidthMm: number;
  faceProudMm: number;
  /** Inset from the silhouette to the face boundary. */
  faceInsetMm: number;
  faceWidthMm: number;
  faceHeightMm: number;
  /** ⚠ Derived from `CROWN_RATIO` so the TILT holds across sizes. */
  crownMm: number;
};

/**
 * Every dimension of a card, from its height and aspect.
 *
 * ⚠ THE RIM CONSUMES `2 * bead` PER SIDE, NOT `bead`. For the bead's outermost
 * point to sit ON the silhouette, the sweep path is itself inset by the bead
 * radius — so the bead's innermost point lands at `2 * bead` inside the outline.
 * ⛔ The answer card's plan got this wrong in its first draft and its defaults
 * failed its own assertion. Written out rather than assumed.
 */
export function cardDims(heightMm: number, aspect: number): CardDims {
  const widthMm = heightMm * aspect;
  const rimBeadMm = heightMm * RIM_BEAD_RATIO;
  const bevelWidthMm = heightMm * BEVEL_WIDTH_RATIO;
  // rim eats 2*bead per side, then the bevel band sits inside that
  const faceInsetMm = 2 * rimBeadMm + bevelWidthMm;
  return {
    widthMm,
    heightMm,
    cornerRadiusMm: heightMm * CORNER_RADIUS_RATIO,
    rimBeadMm,
    bevelWidthMm,
    faceProudMm: heightMm * FACE_PROUD_RATIO,
    faceInsetMm,
    faceWidthMm: widthMm - 2 * faceInsetMm,
    faceHeightMm: heightMm - 2 * faceInsetMm,
    crownMm: heightMm * CROWN_RATIO,
  };
}

/**
 * Maximum surface tilt of the crowned face on the SHORT axis, in degrees.
 *
 * ⛔⛔ FOR TUNING READOUTS, NEVER FOR VERIFICATION. Copied deliberately from
 * `answer-card-geometry.ts`, INCLUDING this warning, because that function
 * carried a factor-of-2 error that under-reported every angle by half and
 * prompted a crown of 7.5 — a dome — to be chosen where 4.5 was already right.
 *
 * ⚠ It was caught only because the harness read the BUILT GEOMETRY'S NORMALS
 * instead of this formula: 36.19° measured against 20.21° predicted.
 *
 * ⛔ A CHECK SHARING A FORMULA WITH THE THING IT CHECKS CANNOT FAIL. Any
 * verification of the crown must sample the built mesh's normals.
 *
 * The crown is `h(y) = H * (1 + cos(pi * y/a)) / 2` over half-axis `a`, so
 * `dh/dy` peaks at `H*pi / (2*a)`. Tilt is `atan` of that.
 */
export function maxFaceTiltDegrees(crownMm: number, faceShortAxisMm: number): number {
  const a = faceShortAxisMm / 2;
  /**
   * ⚠ THIS FORMULA HAS NOW CHANGED TWICE IN ONE DAY, FOLLOWING THE PROFILE:
   *
   *     plateau (raised cosine over a narrow band)  crown*pi / (2*band)
   *     paraboloid  z = crown*(1 - e²)              2*crown / a
   *     GRADUAL ARC z = crown*(1 - cos(pi*t))/2     crown*pi / (2*a)   <- current
   *
   * ⛔ THE MAXIMUM IS NOW MID-SLOPE, NOT AT THE RIM — which is what makes the arc
   * gradual. `dz/dt = crown*pi*sin(pi*t)/2` peaks at `t = 0.5`, and the surface
   * eases to FLAT at both ends: no shoulder leaving the bevel, no crease at the
   * apex.
   *
   * ⚠⚠ AND THIS IS EXACTLY WHY THE FUNCTION CANNOT BE TRUSTED FOR VERIFICATION.
   * It has tracked three different profiles today; each time it was edited to
   * match the mesh rather than to check it. **A formula kept in step with the
   * thing it measures is not an instrument.** Use `measuredMaxTiltDegrees()`,
   * which reads built normals.
   */
  /* ⚠ FOURTH PROFILE TODAY: `z = crown*(1-(1-t)^k)`, `dz/dt = crown*k*(1-t)^(k-1)`,
     maximum at the EDGE: `crown * k / a` with k = CROWN_FALLOFF = 2.5. */
  return (Math.atan((crownMm * 2.5) / a) * 180) / Math.PI;
}

/**
 * ⚠ THE 16° / 23.8° LADDER FROM THE APPROVED OBJECTS DOES NOT TRANSFER, and
 * inheriting it would be the same class of move as inheriting the contact field's
 * crown of 5.0.
 *
 * ⛔ Those figures were calibrated FACE-ON, under an ORTHOGRAPHIC camera, with a
 * light 30° off-normal. Here the view is OBLIQUE, the lens is 89.9° hFOV, and the
 * light is a rim tube a few units away. **The floor at which convexity reads must
 * be re-derived in situ.**
 *
 * ⚠ Kept as a REFERENCE POINT, not a threshold: 5.67° was measured invisible and
 * 22.5° measured clearly legible, both face-on. That range is where to start
 * looking, not a specification.
 */
export const TILT_REFERENCE_INVISIBLE_DEG = 5.67;
export const TILT_REFERENCE_LEGIBLE_DEG = 22.5;

// ── The transmission proxy ───────────────────────────────────────────────────

/**
 * Colours sampled from the room behind each card's footprint, for the proxy
 * plane that sits behind the glass.
 *
 * ⛔⛔ WHY A PROXY EXISTS AT ALL — THE ONE STRUCTURAL FACT THAT GOVERNS THIS
 * OBJECT. A WebGL canvas can only refract objects in its OWN scene, and the room
 * is a photograph OUTSIDE the canvas. `answer-card-geometry.ts` records the same
 * lesson from 3 August: a card moved over the lockup *"would have put it in front
 * visually while it refracted NOTHING — the same pale slab"*, and
 * ⚠⚠ ***"The frost was never the problem; the absence of anything worth seeing
 * through was."***
 *
 * ⛔ CARL'S SOLUTION, 11 September, and it avoids the cost the Architect flagged:
 * *"can you sample the wall colour and put a rectangle of the same colour behind
 * the cards?"* — a small proxy per card rather than the whole plate as a texture.
 * **The alternative was putting the full 459KB image in the scene, bypassing
 * `next/image` and reinstating the exact regression D-075 removed.**
 *
 * ⚠ SAMPLED FROM `public/about-studio-source.jpg` ON 11 SEPTEMBER, over each
 * card's current footprint. Mean colour after a heavy blur — i.e. what frosted
 * glass would actually transmit:
 *
 *     CA  #182733   wall, left            spread 39
 *     CB  #192a35   wall, right           spread 37
 *     CD  #15191f   floor, left, shadow   spread 56 -> flat after blur
 *     CS  #2d353c   floor, right, lit     spread 72 -> flat after blur
 *
 * ⛔ THE TWO WALLS ARE EFFECTIVELY IDENTICAL (one or two levels per channel).
 * ⛔ THE FLOOR PAIR IS NOT: CS is roughly TWICE CD's luminance, because CS sits in
 * the lit part of the floor and CD in shadow. **Giving both the same proxy would
 * read as identical objects in identical light, which the room contradicts.**
 *
 * ⚠⚠ AND A MEASURED SURPRISE THAT MATTERS FOR THE MATERIAL: after a heavy blur
 * BOTH floor regions go essentially FLAT — one or two levels of variation across
 * the whole footprint. The high spread is fine-grained board grain, and frosting
 * destroys exactly that. ⛔ **So a flat proxy is faithful — and a faithful proxy
 * may give the glass nothing to distort.** Frosted and clear glass look identical
 * over a flat field; that is the pale-slab defect restated. **The proxy may need
 * MORE contrast than the room has.** Carl's eye decides; `PROXY_CONTRAST` is the
 * dial.
 */
export const PROXY_COLORS = {
  CA: "#182733",
  CB: "#192a35",
  CD: "#15191f",
  CS: "#2d353c",
} as const;

/**
 * How much internal contrast the proxy carries, 0 = the flat sampled mean.
 *
 * ⚠ A DIAL, NOT A VALUE. See `PROXY_COLORS` — the room is flat behind these cards
 * once blurred, so faithful reproduction may leave the frosting with nothing to
 * work on. ⛔ NOT JUDGED. Starts at 0 (faithful) so the first thing Carl sees is
 * the room as it is, not an invention.
 */
export const PROXY_CONTRAST = 0;
