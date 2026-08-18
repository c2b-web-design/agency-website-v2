/**
 * Q&A answer-card geometry — measured CSS-pixel constants and the budget maths
 * for the Three.js rebuild of the Q5 answer cards.
 *
 * UNITS: CSS pixels, used DIRECTLY as Three.js world units with NO conversion
 * factor. Valid only because the card renders under an ORTHOGRAPHIC camera with
 * `zoom: 1`, where @react-three/fiber sets the frustum to
 * `left = -size.width/2 … top = size.height/2` in CSS px on every resize. One
 * world unit therefore equals one CSS pixel exactly, and stays exact across
 * resize.
 *
 * ⚠ DELIBERATELY INDEPENDENT OF `contact-field-geometry.ts`. That module is the
 * APPROVED contact field. Its `FIELD_RADIUS_PX` happens to also be 14, which is
 * a coincidence of two different designs landing on the same radius — importing
 * it would mean tuning this card silently moves an approved object. The helpers
 * in `answer-card-mesh.tsx` are copied from `contact-field-mesh.tsx` for the
 * same reason.
 *
 * Source: live Playwright measurement of the rendered Q5 grid at 1440 and 1280
 * (3 August 2026), not computed from the CSS grid definition.
 */

import { GRID_WIDTH_PX, GRID_HEIGHT_PX } from "./answer-card-backdrop-geometry";

// ── Measured card body ───────────────────────────────────────────────────────
/**
 * Card width. Grid columns 1/3 of a 6-column grid in the 576px `max-w-xl`
 * shell with 8px gaps: `(576 - 5*8) / 6 * 2 + 8` = 186.66.
 */
export const CARD_WIDTH_PX = 186.66;

/** Card height. `min-height: 3rem`, fixed at every viewport width measured. */
export const CARD_HEIGHT_PX = 48;

/**
 * Corner radius.
 *
 * ⚠ 14px, NOT the 12px that `rounded-xl` implies in stock Tailwind. This project
 * overrides it: `--radius-xl: calc(var(--radius) * 1.4)` (`app/globals.css:45`).
 * The first draft of the rebuild brief recorded the TOKEN rather than the
 * RENDERED value, and a silhouette built to 12px would have been quietly wrong.
 * Measured from `getComputedStyle(...).borderRadius` on the live card.
 */
export const CARD_RADIUS_PX = 14;

/** Grid gap (`gap-2` = 0.5rem), between cards and between rows. */
export const CARD_GAP_PX = 8;

// ── The depth stack ──────────────────────────────────────────────────────────

/**
 * Radius of the half-tube rim's circular profile.
 *
 * ⚠ THE RIM CONSUMES `2 * R` PER SIDE, NOT `R`. See `rimConsumption` below —
 * this is the single most load-bearing piece of arithmetic in the module and the
 * plan's first draft got it wrong.
 *
 * ⚠ NOT AN APPROVED VALUE. Adjustable via the `?cardrig=1` harness; PROVISIONAL
 * under D-035 (mastering).
 */
export const RIM_TUBE_RADIUS = 2;

/**
 * The bevel's rise as a FRACTION of the rim's apex — Carl, 5 August: *"change the
 * bevel proportionate to the filament."*
 *
 * ⚠ THE PROPORTION IS THE APPROVED THING, NOT THE NUMBER. `BEVEL_RISE` was a
 * hand-entered 1.6 against a rim apex of 2.0, and the ratio between them is what
 * the build actually depends on: the bevel must rise enough to read as a forward
 * slope while staying contained by the rim. 0.8 preserves exactly the geometry
 * that was approved.
 *
 * ⚠ AND IT MUST STAY BELOW 1.0. A first build set the rise to 2.5 against a rim
 * apex of 2.0 — the bevel stood proud of the rim, the face was anchored below it,
 * and the card rendered with a BLACK INTERIOR: the face at the bottom of a well,
 * correctly lit and correctly invisible. Deriving the rise removes the way that
 * defect is reached by hand, but a ratio at or above 1.0 reintroduces it.
 *
 * ⚠ THIS IS WHY THE RIM CAN NOW BE SHRUNK SAFELY. Carl's chunk lowers the
 * filament below the convex face's apex so neighbouring faces catch light on the
 * curve turned TOWARD the source rather than away. Taking `RIM_TUBE_RADIUS` down
 * used to mean remembering to take the bevel with it; now the bevel follows.
 */
export const BEVEL_RISE_RATIO = 0.8;

/**
 * Width of the bevel band — the equidistant slope from the rim inward and
 * toward the viewer.
 *
 * Carl's specification, 3 August: *"a 'slope' that comes toward us. Equidistant
 * all the way around. Top, bottom, sides and corners."*
 *
 * ⚠ ZERO SINCE 5 AUGUST 2026 — THE BEVEL IS REMOVED. Carl: *"a bevel may not be
 * neccersary at all. the face can rise from the bottom of the rim/filament, its
 * so small on screen anyway."*
 *
 * ⚠ HE IS RIGHT ABOUT THE SCALE AND IT IS THE WHOLE ARGUMENT. At 4 units on a
 * 48-unit card the bevel was ~4 SCREEN PIXELS — a sixth of the card's height
 * spent on a facet too small to read as a facet, while creating the
 * discontinuity that made the face look like a separate object floating in the
 * middle. **It cost the thing it was supposed to provide.**
 *
 * ⚠ AND IT IS KEPT AS A ZERO RATHER THAN DELETED because the budget maths
 * (`faceInset`, `cardBudget`) threads it through every derived dimension, and a
 * zero flows through all of it correctly: the face simply grows by what the
 * bevel was eating — 8 units of height returned, face height 34 -> 40. Deleting
 * the parameter would mean editing six call sites to prove the same thing.
 *
 * ⚠ RESTORING IT IS ONE EDIT, and the geometry still supports it — but note that
 * `BEVEL_RISE` is derived from the rim, so a restored bevel would rise forward
 * again unless that is reconsidered too. The old model is documented at
 * `FACE_TUCK_RATIO`.
 *
 * ⚠ NOT AN APPROVED VALUE. Adjustable; PROVISIONAL.
 */
export const BEVEL_WIDTH = 0;

/**
 * How far the bevel rises toward the viewer across its width.
 *
 * This is what makes the slope read as coming forward rather than as a flat
 * inward step — Carl: *"a 'slope' that comes toward us."*
 *
 * ⚠ DERIVED FROM THE RIM, NOT HAND-ENTERED — Carl, 5 August: *"change the bevel
 * proportionate to the filament."* It is `RIM_TUBE_RADIUS * BEVEL_RISE_RATIO`,
 * and at the approved 2.0 × 0.8 it evaluates to the 1.6 that was approved. See
 * `BEVEL_RISE_RATIO` for why the ratio rather than the number is the real value.
 *
 * ⚠ IT MUST NOT EXCEED THE RIM'S APEX (`RIM_TUBE_RADIUS`), OR THE BEVEL BREACHES
 * THE SILHOUETTE'S FRONTMOST SURFACE. A first build set this to 2.5 against a
 * rim apex of 2.0: the bevel stood proud of the rim, the face was anchored below
 * it, and the card rendered with a black interior — the face sitting at the
 * bottom of a well, correctly lit and correctly invisible. **Deriving it means
 * shrinking the rim can no longer strand the bevel above it.**
 *
 * At 80% of the rim's height the bevel is a clear forward slope that still reads
 * as contained by the rim. The half-tube remains the frontmost surface, which is
 * what makes it the outline — and what keeps the filament unobstructed.
 */
export const BEVEL_RISE = RIM_TUBE_RADIUS * BEVEL_RISE_RATIO;

/**
 * Height of the convex crown above the face's base plane, on the SHORT axis.
 *
 * ⚠ IT IS THE TILT ANGLE THAT MATTERS, NOT THE DEPTH NUMBER — and this is the
 * one finding from the contact field that transfers wholesale. There, a
 * raised-cosine crown of 1.2 units over a 19-unit half-height gave a MAXIMUM
 * SURFACE TILT OF 5.67 DEGREES: real geometry, and physically incapable of
 * showing itself, because Lambert shading depends on the angle between light and
 * normal and the surface never departed 5.7 degrees from flat. The shadow lived
 * in the last ~6 degrees of a 90-degree light sweep.
 *
 * Carl's report at the time was exactly right: *"I cannot tell any face being
 * convex... those faces look flat."*
 *
 * ⚠ AND THE CONTACT FIELD'S 5.0 DOES NOT TRANSFER AS A NUMBER, ONLY AS A
 * METHOD. Its face is ~19 units across the short axis (a 38-unit box whose rim
 * and bevel eat most of it). THIS face is 32 units — a half-tube rim plus a
 * narrow bevel consumes less — so the same crown spread over a wider face gives
 * a gentler slope. The angle must be recomputed for this geometry, never
 * inherited.
 *
 * Tilt and the resulting upper/lower luminance ratio at a light 30° off-normal,
 * VERIFIED 3 August against the mesh's own computed normals:
 *
 *   crown 1.2 →  6.7°   ratio 1.15   invisible — the contact field's failure
 *   crown 3.0 → 16.4°   ratio 1.41
 *   crown 4.5 → 23.8°   ratio 1.68   <- shipped
 *   crown 6.0 → 30.5°   ratio 2.03
 *   crown 7.5 → 36.4°   ratio 2.48   reads as a dome, not "slightly convex"
 *
 * against the contact field's own reference points: 1.22 nothing visible, 1.41
 * still weak, 2.18 only now starting to read.
 *
 * ⚠ A MID-BUILD DETOUR WORTH RECORDING: this was briefly raised to 7.5 because
 * `maxFaceTiltDegrees()` carried a FACTOR-OF-2 ERROR and reported 12.5° for
 * crown 4.5 — apparently too flat. The mesh was right and the formula was wrong.
 * Caught only because the harness reads the BUILT GEOMETRY'S NORMALS rather than
 * trusting the analytic helper: 36.19° measured against 20.21° predicted. **Had
 * both shared the formula, a dome would have shipped as "verified".**
 *
 * 4.5 is chosen so the effect is legible enough to JUDGE — not because it is
 * right.
 *
 * ⚠ NOT AN APPROVED VALUE. Adjustable; PROVISIONAL under D-035. Revisited in
 * chunk 4: the crown's other job is giving the travelling filament something to
 * catch, which is not visible until the filament exists.
 */
export const CROWN_HEIGHT = 4.5;

/**
 * Fraction of the LONG axis held at full crown height before rolling off.
 *
 * ⚠ THE CROWN IS SEPARABLE AND MULTIPLICATIVE, NOT TWO INDEPENDENT HEIGHTS.
 * `crownZ` returns `CROWN_HEIGHT * longAxis * shortAxis` — one height, with this
 * plateau fraction shaping the long axis. An earlier draft proposed two
 * independent heights; they do not compose in that form. This is the shape
 * already approved on the contact field.
 *
 * Without a plateau the crown tapers to a point at both ends, which reads as an
 * elliptical blister rather than a cylindrical roll.
 */
export const CROWN_PLATEAU_U = 0.72;

/**
 * How far the face's base plane sits BELOW the bevel's inner (front) edge.
 *
 * ⚠ THE FACE APEX SITS BEHIND THE RIM APEX — DECIDED, NOT INHERITED.
 *
 * Carl delegated this call to the Builder on 3 August: *"You make a decision on
 * in front of or behind the rim's apex. Whatever is best suited for the
 * design."* The decision is RECESSED, for four reasons:
 *
 *   1. It is what the rim is FOR. A half-tube is the brightest element by
 *      design. If the face rises past it, the rim stops being the outline and
 *      becomes a groove around a raised centre. Verified against the approved
 *      contact-field render: the gold rim is a continuous unbroken outline on
 *      all four boxes and the face never crosses it.
 *   2. The filament (chunk 4) needs the rim unobstructed. A proud face occludes
 *      the rim's inner half off-axis AND blocks light travelling inward onto the
 *      bevel and face — which is the half-tube's entire justification.
 *   3. It is what glass does. Every reference supplied has the perimeter as the
 *      brightest, most forward element.
 *   4. "A slope that comes toward us" is satisfied either way. Carl's phrase
 *      describes the BEVEL, which carries the forward direction; a recessed face
 *      gives the bevel somewhere to slope TO. The two are not in tension.
 *
 * ⚠ SO THE CROWN GROWS BACKWARD: raising `CROWN_HEIGHT` sinks this by the same
 * amount, so curvature increases while the apex stays tucked under the rim. The
 * contact field uses the same mechanism (`FACE_SEAM_SINK`) for a cross-section
 * that is otherwise INVERTED relative to this one — there the face is a window
 * in a frame; here the interior comes forward.
 *
 * ⚠ THE TUCK IS NOW PROPORTIONATE TO THE BEVEL, NOT A FIXED 0.5 — Carl,
 * 5 August, on shrinking the rim to lower the filament: *"you may have to change
 * the face slightly now that the bevel will become smaller."*
 *
 * The face's apex is anchored to the bevel's inner edge (`bevelInnerZ`), so a
 * fixed drop below a SHRINKING bevel eats the whole rise. At `tubeRadius` 0.6 the
 * bevel rises only 0.48 — a 0.5 tuck would put the face apex BELOW where the
 * bevel began, which is the "face at the bottom of a well" defect this module
 * already records, reached from the other direction.
 *
 * ⚠ FACE WIDTH NEEDS NO SUCH FIX — it was already derived. `faceInset` is
 * `2 * tubeRadius + bevelWidth`, so `cardBudget` widens the face and keeps its
 * corner radius concentric automatically as the rim comes down. Only the Z
 * placement was hand-held.
 */
export const FACE_TUCK_RATIO = 0.3125;

/**
 * ⚠ THE CROSS-SECTION WAS REBUILT ON 5 AUGUST 2026, AND THE VALUES ABOVE ARE THE
 * OLD MODEL. Read this before trusting `FACE_TUCK_RATIO`, `FACE_SEAM_SINK` or
 * `BEVEL_WIDTH` — the card is no longer three pieces with a step between them.
 *
 * ⚠ WHAT WAS WRONG. The card was a rim tube, a bevel rising forward from it, and
 * a face mesh floating **5.00 units behind the bevel's inner edge with nothing
 * modelled across the gap** (measured by `verify/cross-section.mjs`). The face's
 * apex sat 0.90 BELOW the rim's apex, so the interior could never catch light
 * across its top. Carl drew what the renderer actually contained — two tubes,
 * two bevel stubs pointing at nothing, and a dome floating free — and it was
 * exact.
 *
 * ⚠ HOW IT SURVIVED SO LONG. *"Parts dont exist and its difficult to tell
 * whether something exists in total darkness and no light can illuminate
 * something that is not there."* A dark transmissive card looks identical
 * whether a surface is present or absent, so an entire session of lighting work
 * — light level, direction, type, roughness, clearcoat — was spent tuning
 * illumination for geometry that was missing.
 *
 * ⚠ AND THE APPROVALS DID NOT PROTECT IT, WHICH IS THE PROCESS LESSON. Carl:
 * *"approved geometry are meaningless now because i was approving things built
 * on what i thought was there."* The "recessed, never proud" decision was taken
 * by the Builder under delegation, written up with four confident reasons, and
 * then read as settled because it was in a governance file. **The reasoning was
 * inverted, not merely wrong** — reason 2 argued a proud face would obstruct the
 * filament, when Carl's requirement is that the face be proud precisely SO IT
 * ACTS ON the other surfaces.
 *
 * ⚠ THE TARGET IS THE CSS CARD'S IMPLIED GEOMETRY, not the sketch literally.
 * Carl: *"whats important is its the same implied geometry as the CSS version."*
 * `.enquiry-card` in `app/globals.css` describes ONE continuous form — its inset
 * shadows are a shoulder turning inward on all four sides (light at top and
 * left, dark at bottom and right), with the interior rising out of that turn and
 * no seam anywhere. It reads as solid because it is described as one solid
 * thing.
 *
 * ⚠ THE BEVEL IS GONE, ON CARL'S INSTRUCTION: *"a bevel may not be neccersary at
 * all. the face can rise from the bottom of the rim/filament, its so small on
 * screen anyway."* He is right about the scale — the bevel was 3 units on a
 * 48-unit card, roughly 3 screen pixels, spending a sixth of the height on a
 * facet too small to read while creating the very discontinuity that made the
 * face look like a separate object.
 *
 * See `RIM_TUBE_RADIUS`, `BEVEL_WIDTH` and `FACE_RISE_FROM` for the new values.
 */

/**
 * How far the face's base plane sits below the bevel's inner (front) edge.
 *
 * ⚠ SUPERSEDED BY `FACE_RISE_FROM` — see below. Retained only because the
 * contact field declares its own constant of the same name and the two used to
 * be described as the same mechanism; they are no longer. Nothing in the answer
 * card reads this.
 */
export const FACE_SEAM_SINK = CROWN_HEIGHT + BEVEL_RISE * FACE_TUCK_RATIO;

/**
 * Where the face's edge begins, in z — the height it rises FROM.
 *
 * ⚠ THE FACE NOW STARTS AT THE RIM'S BASE AND CLIMBS PAST ITS APEX. That is the
 * whole correction of 5 August 2026, and it is the reverse of what the card did
 * before. Carl: *"the face can rise from the bottom of the rim/filament"*, and
 * on where it must end up: *"the highest part of the convex face should sit
 * above the rim to have effect on the other faces."*
 *
 * ⚠ ZERO IS THE TUBE'S BASE, not its apex. The rim is a half-tube swept about a
 * path at z = 0, so it occupies z 0..`RIM_TUBE_RADIUS` and its widest point — the
 * base of the visible bead — is exactly z = 0. Starting the face there means the
 * two surfaces meet at the same height with nothing to bridge: **the 5.00-unit
 * gap is not closed, it ceases to exist.**
 *
 * ⚠ AND THERE IS NOTHING TO TUCK ANY MORE. `FACE_TUCK_RATIO` and
 * `FACE_SEAM_SINK` existed to hold the face BELOW a lip it was never joined to.
 * With the bevel gone and the face rising from the tube's own base, the concepts
 * they encode no longer describe the object.
 */
export const FACE_RISE_FROM = 0;

/**
 * How far the face's apex stands PROUD of the rim's apex, in world units.
 *
 * ⚠ PROUD, NOT RECESSED, AND THIS REVERSES A DOCUMENTED DECISION. The old model
 * put the face apex 0.90 BELOW the rim (`FACE_TUCK_RATIO`), recorded with four
 * reasons and read as settled. Carl overturned it: *"the highest part of the
 * convex face should sit above the rim to have effect on the other faces."*
 *
 * ⚠ THE REQUIREMENT IS FUNCTIONAL, NOT AESTHETIC, and that is why the old
 * reasoning was inverted rather than merely wrong. Its second reason argued a
 * proud face would obstruct the filament's light travelling inward. **The point
 * is that the face must be high enough to ACT ON the other surfaces** — a crown
 * sunk below its own rim is shaded by it and can never catch light across its
 * top, which is exactly why the card read as an outline around a dark hole.
 *
 * ⚠ "PROUD", NOT "A DOME" — Carl: *"it should not be a dome but the highest part
 * of the convex face should sit above the rim."* A crown reading as a dome was
 * rejected once already (see `CROWN_HEIGHT`, where 7.5 measured 36.4° and was
 * called a dome). This value has to satisfy both ends of that sentence.
 *
 * ⚠ 2.0 IS THE FLOOR THE TILT GUARD IMPOSES, NOT A PREFERENCE — and the guard
 * caught a value that looked reasonable. 1.0 was tried first and produced a face
 * tilt of **13.3°, below the 16° minimum** (`MIN_FACE_TILT_DEGREES`): the
 * convexity would have been real and unable to show itself, which is precisely
 * the defect this rebuild exists to fix.
 *
 * ⚠ THE CAUSE IS THAT REMOVING THE BEVEL MADE THE FACE WIDER. The short-axis
 * half-span went 17 -> 20, so the same rise spread over a longer run is a
 * shallower curve. **Two changes that each looked safe interacted**, and only
 * re-running the budget arithmetic found it.
 *
 *     proud 1.00  ->  13.3°   under the guard
 *     proud 1.75  ->  16.4°   the bare minimum
 *     proud 2.00  ->  17.4°   shipped — clear of the floor, still not a dome
 *     proud 3.00  ->  21.4°
 *
 * At 2.0 the apex sits at z = 4.0 against a rim apex of 2.0: unambiguously the
 * frontmost point of the card, on a 40-unit span, at less than half the tilt the
 * rejected dome reached.
 *
 * PROVISIONAL under D-035.
 */
export const FACE_PROUD_OF_RIM = 2.0;

/**
 * The crown's height, derived so the apex lands exactly `FACE_PROUD_OF_RIM`
 * above the rim.
 *
 * ⚠ DERIVED, NOT TYPED, so the two cannot drift apart. The face rises from
 * `FACE_RISE_FROM` (the tube's base, z = 0) and must reach
 * `RIM_TUBE_RADIUS + FACE_PROUD_OF_RIM`, so the crown IS that difference. Under
 * the old model `CROWN_HEIGHT` and the sink were two hand-held numbers that had
 * to be changed together, and the contact field's own copy of this records
 * getting that arithmetic wrong once — *"4.15 put the peak at 8.85, i.e. 0.85
 * PROUD of the rim"* — caught by redoing the sums rather than by looking.
 */
export const FACE_CROWN_RISE = RIM_TUBE_RADIUS + FACE_PROUD_OF_RIM - FACE_RISE_FROM;

// ── The budget: three coupled quantities, one 48px axis ──────────────────────

/**
 * How much of each side the rim consumes.
 *
 * ⚠ `2 * R`, NOT `R`. For the bead's outermost point (θ=0) to sit ON the
 * 186.66 x 48 silhouette, the sweep path must itself be inset by R — so the
 * bead's innermost point (θ=π) lands at `2R` inside the silhouette.
 *
 * ⚠ THE PLAN'S FIRST DRAFT ASSUMED `R` AND ITS DEFAULTS FAILED ITS OWN
 * ASSERTION: at R=3 with a 6-unit bevel it computed 9 per side and a 30-unit
 * face, when the true figure is 12 per side and a 24-unit face — against a
 * "face height > 50% of 48" guard, i.e. `24 > 24`, which is false. Caught by the
 * plan-review gate, 3 August. Named as a function rather than inlined so the
 * factor of 2 cannot go missing at a call site.
 */
export function rimConsumption(tubeRadius: number = RIM_TUBE_RADIUS): number {
  return 2 * tubeRadius;
}

/** Total inset from the silhouette to the face boundary, per side. */
export function faceInset(
  tubeRadius: number = RIM_TUBE_RADIUS,
  bevelWidth: number = BEVEL_WIDTH,
): number {
  return rimConsumption(tubeRadius) + bevelWidth;
}

export type CardBudget = {
  /** Inset from silhouette to face boundary, per side. */
  inset: number;
  faceWidth: number;
  faceHeight: number;
  /**
   * Face corner radius. A true parallel inward offset reduces the corner radius
   * by the inset distance, so nested silhouettes stay concentric rather than
   * drifting toward square.
   */
  faceRadius: number;
  /** faceHeight as a fraction of the card's height. */
  faceHeightRatio: number;
};

/**
 * The face's dimensions once the rim and bevel have taken their share.
 *
 * ⚠ THE THIRD ARM OF THE BUDGET IS THE CORNER RADIUS, and it is the one that
 * decides whether the face still reads as a card. At the draft's original
 * values the inset was 12 and `14 - 12 = 2` — effectively square corners inside
 * a 14px-radius silhouette.
 */
export function cardBudget(
  tubeRadius: number = RIM_TUBE_RADIUS,
  bevelWidth: number = BEVEL_WIDTH,
): CardBudget {
  const inset = faceInset(tubeRadius, bevelWidth);
  const faceHeight = CARD_HEIGHT_PX - 2 * inset;
  return {
    inset,
    faceWidth: CARD_WIDTH_PX - 2 * inset,
    faceHeight,
    faceRadius: Math.max(0, CARD_RADIUS_PX - inset),
    faceHeightRatio: faceHeight / CARD_HEIGHT_PX,
  };
}

/** Minimum face height as a fraction of card height, below which the face is eaten. */
export const MIN_FACE_HEIGHT_RATIO = 0.5;

/** Minimum face corner radius, below which the face reads rectangular. */
export const MIN_FACE_RADIUS = 4;

/**
 * Minimum acceptable face tilt, in degrees.
 *
 * ⚠ SET FROM THE LUMINANCE RATIO, NOT FROM THE SHIPPED CROWN. A floor fitted to
 * the current default would pass by construction — the same defect as a harness
 * sharing a constant with the fix.
 *
 * 16° gives a ratio of ~1.41 at a light 30° off-normal: the point the contact
 * field's own table calls the end of "nothing visible" (1.22) and the start of
 * something readable. Below it the convexity is real and cannot show itself,
 * which is the D-044 failure this whole chunk exists downstream of.
 *
 * The shipped crown of 4.5 reaches 23.8° (ratio 1.68), so there is genuine
 * headroom above the floor rather than the two coinciding.
 *
 * ⚠ AN EARLIER VALUE OF 18 WAS DERIVED FROM A FORMULA CARRYING A FACTOR-OF-2
 * ERROR. Rebased on the corrected ladder, verified against mesh normals.
 */
export const MIN_FACE_TILT_DEGREES = 16;

export type BudgetCheck = {
  ok: boolean;
  budget: CardBudget;
  failures: string[];
};

/**
 * Both budget assertions.
 *
 * ⚠ TWO, NOT ONE. Face height alone does not catch the corner-radius collapse:
 * a generous face can still have square corners, and vice versa. Surfaced by
 * `?cardrig=1`'s `[0]` readout so a tuning pass sees the squeeze WHILE tuning
 * rather than discovering it afterwards.
 */
export function checkBudget(
  tubeRadius: number = RIM_TUBE_RADIUS,
  bevelWidth: number = BEVEL_WIDTH,
): BudgetCheck {
  const budget = cardBudget(tubeRadius, bevelWidth);
  const failures: string[] = [];

  if (budget.faceHeightRatio < MIN_FACE_HEIGHT_RATIO) {
    failures.push(
      `face height ${budget.faceHeight.toFixed(2)} is ${(budget.faceHeightRatio * 100).toFixed(1)}% of the card ` +
        `(minimum ${MIN_FACE_HEIGHT_RATIO * 100}%) — rim ${rimConsumption(tubeRadius)} + bevel ${bevelWidth} per side`,
    );
  }
  if (budget.faceRadius < MIN_FACE_RADIUS) {
    failures.push(
      `face corner radius ${budget.faceRadius.toFixed(2)} is below ${MIN_FACE_RADIUS} — corners read square`,
    );
  }

  return { ok: failures.length === 0, budget, failures };
}

// ── Tilt: the number that decides whether the convexity reads ────────────────

/**
 * Maximum surface tilt of the crowned face, in degrees, on the SHORT axis.
 *
 * The crown is `h(y) = H * (1 + cos(pi * y/a)) / 2` over a half-height `a`, so
 * `dh/dy = -H*pi/(2*a) * sin(pi * y/a)`, which peaks at |y| = a/2 with magnitude
 * `H*pi / (2*a)`. Tilt is `atan` of that.
 *
 * ⚠ THE DENOMINATOR IS `2*a`, NOT `4*a`. It was written as `4*a` on 3 August —
 * a factor-of-2 error that under-reported every angle by roughly half and
 * prompted a crown of 7.5 (a dome) to be chosen where 4.5 was already right.
 * **Caught only because the harness reads the BUILT GEOMETRY'S NORMALS instead
 * of this function:** 36.19° measured against 20.21° predicted. Verified after
 * correction: 36.36° predicted against 36.19° measured at crown 7.5.
 *
 * ⚠ SO THIS IS FOR TUNING READOUTS, NEVER FOR VERIFICATION. A check sharing a
 * constant — or a formula — with the thing it checks cannot fail; that is
 * exactly how `verify/q5-stutter.mjs` reported 0/3 CLEAN on a visible defect.
 *
 * Reference points at the shipped face height of 32 (half-axis 16):
 *   crown 1.2 →  6.7°   invisible — the contact field's original failure
 *   crown 4.5 → 23.8°   shipped default
 *   crown 7.5 → 36.4°   reads as a dome
 */
export function maxFaceTiltDegrees(
  crownHeight: number = CROWN_HEIGHT,
  tubeRadius: number = RIM_TUBE_RADIUS,
  bevelWidth: number = BEVEL_WIDTH,
): number {
  const halfAxis = cardBudget(tubeRadius, bevelWidth).faceHeight / 2;
  if (halfAxis <= 0) return 0;
  return (Math.atan((crownHeight * Math.PI) / (2 * halfAxis)) * 180) / Math.PI;
}

// ── Placement: the card in grid slot 1 ───────────────────────────────────────

/**
 * ⚠ THE CARD HAS MOVED OUT OF THE LEFT MARGIN AND INTO THE GRID. Carl, 3 August
 * 2026: *"put the card in its location, top left, and make it glass, not
 * frosted."*
 *
 * ⚠ AND THE MOVE IS NOT A CSS REPOSITION — IT IS A SCENE MERGE, which is the
 * one structural fact that governs this whole step. **A WebGL canvas can only
 * refract objects in its OWN scene.** The card and the lockup were in two
 * separate canvases, so moving the card's `<div>` over the lockup would have put
 * it in front visually while it refracted NOTHING — the same pale slab, now
 * merely overlapping the logo.
 *
 * That is the real answer to *"still frosted"*: the card was transmitting its
 * own throwaway stand-in, a smooth blue→teal ramp with no detail in it. Clear
 * glass and frosted glass look identical over a surface that has nothing sharp
 * to destroy. The frost was never the problem; the absence of anything worth
 * seeing through was.
 *
 * So the two canvases become one, spanning the grid, and the stand-in is gone.
 */

/**
 * Grid geometry, duplicated from `answer-card-backdrop-geometry.ts`.
 *
 * ⚠ IMPORTED THERE, NOT REDECLARED — see the import at the top of
 * `answer-card-canvas.tsx`. This comment marks the coupling: the card's slot
 * position is derived from `CARD_BOXES`, so the two modules must agree, and they
 * agree by SHARING the constant rather than by both being edited correctly.
 */

/**
 * Minimum viewport width at which the WebGL card renders.
 *
 * ⚠ THE THRESHOLD SURVIVES THE MOVE BUT ITS REASON HAS CHANGED. It existed
 * because the card needed ~211px of free left margin, and at 1024 there were
 * only 200px — it would have overflowed and added a horizontal scrollbar. **In
 * the grid there is no margin requirement at all.**
 *
 * It is kept because the answer grid's own three-column layout is what the slot
 * coordinates in `CARD_BOXES` describe, and that layout is only guaranteed above
 * this width. Below it the CSS grid reflows and a card pinned to a hard-coded
 * 186.66 x 48 box at (0, 0) would land wrong.
 *
 * ⚠ SO IT IS NOW A CORRECTNESS GUARD, NOT AN OVERFLOW GUARD, and chunk 5 must
 * revisit it rather than inherit it: five cards cannot simply vanish below
 * 1280px the way one prototype could.
 */
export const PROTO_MIN_VIEWPORT_PX = 1280;

/**
 * The canvas box, in CSS px, relative to `.enquiry-answer-grid`.
 *
 * ⚠ IT SPANS THE WHOLE GRID, NOT ONE CARD. The canvas must contain the lockup
 * as well as the card, because the lockup is what the glass refracts — a
 * card-sized canvas physically cannot see beyond its own edges.
 *
 * ⚠ AND IT MOUNTS INSIDE `.enquiry-answer-grid` NOW, NOT ON
 * `.enquiry-phrase-extras`. The backdrop already mounted there; the card joins
 * it rather than the reverse, so both share one coordinate origin instead of two
 * that must be kept in step.
 *
 * Dimensions come from the grid's own span rule, never from
 * `getBoundingClientRect()` on a live card — that would make the WebGL card
 * depend on the DOM cards it exists to replace, which are gone.
 */
export function protoCanvasBox(): {
  left: number;
  top: number;
  width: number;
  height: number;
} {
  return {
    left: 0,
    top: 0,
    width: GRID_WIDTH_PX,
    height: GRID_HEIGHT_PX,
  };
}

/**
 * Where the card sits in the canvas's world coordinates.
 *
 * ⚠ THE CANVAS ORIGIN IS ITS CENTRE; THE GRID ORIGIN IS ITS TOP-LEFT. Under an
 * orthographic camera at `zoom: 1`, @react-three/fiber puts (0,0) at the canvas
 * centre with +y UP, while `CARD_BOXES` is in CSS layout space with (0,0) at the
 * top-left and +y DOWN. Both conversions are needed and the y flip is the one
 * that is easy to drop.
 *
 * ⚠ DERIVED FROM `CARD_BOXES[slot]`, NOT HARD-CODED. The backdrop's four colour
 * zones are positioned against those same boxes, so a card placed from an
 * independent copy of the numbers could drift out of its own colour region while
 * every assertion still passed.
 */
export function cardSlotPosition(
  slot: { x: number; y: number; w: number; h: number },
  /**
   * The grid's MEASURED width. Defaults to the 576px reference so every existing
   * caller is unchanged.
   *
   * ⚠ IT MUST BE THE SAME WIDTH THE SLOT CAME FROM. Pass boxes from
   * `cardBoxesAt(w)` together with that same `w` — mixing a scaled box with the
   * default width re-centres the card against a grid it is not in, which places
   * it plausibly but wrongly. See `cardBoxesAt`.
   */
  gridWidthPx: number = GRID_WIDTH_PX,
): { x: number; y: number } {
  return {
    x: slot.x + slot.w / 2 - gridWidthPx / 2,
    y: GRID_HEIGHT_PX / 2 - (slot.y + slot.h / 2),
  };
}

// ── Entrance — carried across unchanged ──────────────────────────────────────

/**
 * Card 1's entrance, read off `.enquiry-cards-reveal .enquiry-card:nth-child(1)`
 * (`app/globals.css`): `enquiry-card-rise` 700ms linear at a 220ms delay,
 * opacity 0 → 1 with `translateY(6px)` → none.
 *
 * ⚠ CARRIED ACROSS, NOT REINVENTED. Carl: *"All numbers for card appearance,
 * filament speed etc will be used or converted"* and *"We will be moving it at
 * the appropriate time into place so the timing will stay."* The full ladder
 * (220/350/480/610/740) belongs to the chunk-5 rollout; card 1's delay is what
 * the single proto card matches.
 *
 * ⚠ DISABLED UNDER `prefers-reduced-motion` — the CSS rule disables the card
 * rise, so the WebGL card must not animate either.
 */
/**
 * How long one card takes to arrive: the rise, the scale, and the light coming
 * up, all on this one number.
 *
 * ⚠ 2000 — SET BY CARL BY EAR, 4 August, still BRACKETING rather than settling.
 * The method is his: *"if we change 1100ms to 1500ms and its too slow we will
 * have a range to work with."* Find the two ends, then close on the value
 * between them.
 *
 * The walk to here, so the range is not lost:
 *
 *   700ms   the CSS ladder's value, carried across   *"far too fast"*
 *   1100ms  first correction                         *"a little too fast"*
 *   1500ms  bracketing upward                        (not reported)
 *   2000ms  current                                  <- looking for the far end
 *
 * ⚠ THE CSS's 700 WAS NEVER THE RIGHT REFERENCE, and it is worth recording why
 * so it is not reached for again. It was matched verbatim while the WebGL card
 * stood beside its CSS neighbour and had to arrive with it. **Those cards are
 * gone.** It also carried an opacity fade that this entrance cannot have — so
 * the same duration reads faster here, because less is happening inside it.
 *
 * ⚠ THIS NUMBER ALSO SETS THE GAP BETWEEN CARDS, via `CARD_OVERLAP` — raising it
 * stretches the whole sequence. Carl: *"The sequence can get a little longer."*
 * If the fade is right but the sequence runs long, the correction belongs in the
 * overlap, not here.
 *
 * PROVISIONAL under D-035. Carl tunes it by eye.
 */
export const CARD_RISE_DURATION_MS = 2000;
export const CARD_RISE_DELAY_MS = 220;

/**
 * ⚠ 10px, NOT 6 — the rise needs distance to be readable as motion once it is
 * eased. A 6px cubic ease-out spends most of its travel in the last few pixels
 * and reads as an appearance rather than an arrival.
 *
 * PROVISIONAL. Carl tunes it by eye.
 */
export const CARD_RISE_TRANSLATE_PX = 10;

/**
 * Scale the card starts at, growing to 1.
 *
 * ⚠ NO LONGER "THE ONLY FADE AVAILABLE" — THE OPACITY FADE RETURNED ON
 * 7 AUGUST 2026. This comment used to justify scale as the sole substitute for
 * alpha, because `transparent = true` routes the rim out of the transmission
 * target. That cost is real but it is now SCOPED to each card's own rise rather
 * than treated as a prohibition; the substitute it licensed — ramping the
 * material from black — is what produced the black rectangle Carl reported.
 * See `CardLighting` in `answer-card-canvas.tsx`.
 *
 * ⚠ SO SCALE IS NOW A THIRD STRAND, NOT A STAND-IN, and it is the one most
 * likely to be surplus. Carl specified *"a slight rise coupled with an opacity
 * fade"* — he did not ask for a scale-up. Kept for now because it is subtle and
 * removing it is a change to judge by eye, not to make silently while fixing
 * something else. **If the entrance reads as a pop or a zoom, this is the first
 * thing to try at 1.0.**
 *
 * Deliberately subtle: this is a card settling into its slot, not a pop.
 */
export const CARD_RISE_SCALE_FROM = 0.94;

// ── The filament circuit: DELETED, 4 August 2026 ────────────────────────
//
// `filamentHeadAt()` mapped progress 0..1 to a point on the card perimeter, and
// `circuitDelta()` measured wrapped distance along it. Both existed to place a
// TRAVELLING head.
//
// Carl replaced the whole idea, 4 August: "does it have to move? become
// animated? No. it could fade in, like a real light bulb filament." The
// filament now heats in place, so there is no position to compute.
//
// In git at 1dfce8a, with the route he walked recorded in its comments, if the
// travelling version is ever wanted back.


/**
 * The five-card stagger, read off `.enquiry-cards-reveal .enquiry-card:nth-child(n)`
 * in `app/globals.css`.
 *
 * ⚠ READ FROM THE CSS, NOT INVENTED. These are the approved ladder — 130ms apart,
 * starting at card 1's 220ms — and they are what the WebGL cards must match now
 * that all five exist. Carl: *"All numbers for card appearance, filament speed
 * etc will be used or converted."*
 *
 * ⚠ AND THEY ARE IN GRID ORDER, which is also DOM order: 0 top-left, 1
 * top-middle, 2 top-right, 3 bottom-left, 4 bottom-right. The cards arrive
 * left-to-right along the top row, then left-to-right along the bottom — Carl,
 * 4 August: *"The cards come on in sequential order. 1,2,3,4 and then 5."*
 */
/**
 * ⚠ THE LADDER IS NOW DERIVED FROM THE PHRASE, NOT FROM THE OLD CSS NUMBERS.
 *
 * Carl, 4 August, describing the walk from Begin:
 *
 * > *"The first thing a user will see is Q5 as it reveals from left to right.
 * > That reveal time is not random. It is the speed an average person reads. The
 * > user will be focused on that. Rather than wait for the line to end, card 1
 * > can begin its appearance half way through the text reveal."*
 *
 * ⚠ SO THE PHRASE IS THE TEMPO, AND EVERYTHING ANSWERS TO IT. The reveal is a
 * READING-SPEED instrument, not a delay to be waited out — which is why card 1
 * starts at its midpoint rather than at its end.
 *
 * > *"It continues the flow established on the start page with text, subtext and
 * > button, but much tighter."*
 *
 * And on the character of the sequence:
 *
 * > *"the fade in doesnt have to complete before the next element. As its
 * > reaching its full appearance state the next card can begin its entrance. So
 * > instead of a rapid fire, almost bullet like appearance, we will achieve a
 * > choreographed flow."*
 *
 * ⚠ "AS IT IS REACHING ITS FULL APPEARANCE" IS THE SPECIFICATION, and it fixes
 * the gap as a FRACTION of the duration rather than an independent number. At
 * `CARD_OVERLAP` = 0.72 each card's rise OVERLAPS ITS PREDECESSOR'S BY 72% of
 * the duration — the next card begins 28% in, 560ms into a 2000ms rise, so the
 * two are climbing together for 1440ms.
 *
 * ⚠ THIS CLAUSE USED TO READ "each card begins when the previous is 72% of the
 * way through", AND THAT SENTENCE WAS WRONG AND COST A SESSION. A Builder read
 * it, found `(1 - CARD_OVERLAP)` disagreeing, "fixed" the arithmetic to match
 * the prose, and shipped a 1440ms gap that spreads the five cards so far apart
 * each is seen alone in the dark early part of its own rise. Carl rejected it on
 * sight: *"There is no overlap between ths cards."* **The constant, its name and
 * the arithmetic were all correct; one clause of the description was not.**
 *
 * ⚠ AND THIS IS WHY THE OLD 130ms GAP READ AS BULLET-FIRE. Against a 1100ms
 * entrance it was 12% — five cards effectively simultaneous. The gap has to
 * scale with what it staggers, so it is now expressed as a ratio and cannot
 * drift out of step when the duration is tuned.
 *
 * ⚠ EVERY VALUE HERE IS A STARTING POINT, EXPLICITLY. Carl: *"figures are not
 * set in stone... if at first we are in the ballpark all we would have to do is
 * increase the numbers slightly to fine tune, to master."* PROVISIONAL under
 * D-035.
 */
export const CARD_OVERLAP = 0.72;

/**
 * The gap between card entrances: 560ms, the 28% of a rise that has elapsed when
 * the next card starts. Approved behaviour — see `CARD_OVERLAP` for why the
 * description above it once said otherwise.
 */
export const CARD_RISE_GAP_MS = Math.round(CARD_RISE_DURATION_MS * (1 - CARD_OVERLAP));

/**
 * When card 1 begins, measured from the phrase reveal starting.
 *
 * ⚠ HALF THE REVEAL, ON CARL'S INSTRUCTION — *"card 1 can begin its appearance
 * half way through the text reveal."* Derived from the reveal's own duration so
 * it cannot drift if the phrase is retimed.
 */
export const Q5_REVEAL_MS = 1300;
export const CARD_FIRST_ENTRANCE_MS = Math.round(Q5_REVEAL_MS / 2);

/**
 * ⚠⚠ HOW LONG AFTER THE ARRIVING EDGE THE REVEAL ACTUALLY STARTS — MEASURED,
 * NOT CHOSEN. Candidate 3, 17 August 2026.
 *
 * **The entrance runs before the incoming question's reveal exists.** It re-arms
 * on the `arriving` edge, which fires in the same React batch as `setActiveQ`;
 * the new phrase has not painted, so neither `__revealStart` nor the CSS
 * animation carries this question's clock yet. The anchor fell through to `now`,
 * and the ladder ran correctly against a clock unrelated to the text — which
 * destroys the only thing `CARD_FIRST_ENTRANCE_MS` means.
 *
 * **So the entrance PREDICTS the reveal's start instead of reading it.**
 *
 * ⚠ THE VALUE IS THE MIDPOINT OF A MEASURED RANGE, AND THE RANGE IS ONE FRAME.
 * Measured on production, 40 question-steps across 10 walks:
 *
 *     min -1.50ms   max 14.40ms   range 15.90ms   midpoint 6.45ms
 *
 * Every observed offset fell inside a single frame interval (16.70ms measured),
 * and the reveal's `startTime` lands exactly on a frame boundary (30 of 32
 * samples). **The spread is QUANTISATION — which side of a frame tick the edge
 * fell on — not uncertainty about behaviour.**
 *
 * ⚠ THE MIDPOINT IS CHOSEN TO BOUND THE ERROR, not to be typical. Predicting 0
 * would be ~14ms early on the runs that land high; predicting 14 would be
 * ~14ms late on those that land low. **The midpoint bounds the worst case at
 * ±7.95ms**, against Carl's stated ±30ms tolerance.
 *
 * ⚠ IT IS NOT A DIAL AND MUST NOT BE TUNED BY EYE. It describes the browser's
 * frame scheduling, not a piece of choreography. If it needs to change, the
 * reason is that the measurement changed — re-measure it, do not adjust it.
 * `verify/anchor-freshness.mjs` publishes the live prediction error every run.
 *
 * ⚠ PROVISIONAL under D-035 only in the sense that the MEASUREMENT may move on
 * other hardware. It was measured at 60Hz; a 120Hz display halves the frame
 * interval and would halve this. **The self-check is what would reveal that** —
 * see `__anchorTrace`'s `deltaMs`.
 */
export const REVEAL_START_OFFSET_MS = 6.45;

export const CARD_RISE_LADDER_MS = [0, 1, 2, 3, 4].map(
  (i) => CARD_FIRST_ENTRANCE_MS + i * CARD_RISE_GAP_MS,
);

/**
 * When the whole entrance has finished, measured from the phrase reveal
 * starting: the last card's start plus its own rise.
 *
 * ⚠ FIVE BEATS, NOT SIX — THE LOCKUP AND ITS BEAT WERE REMOVED ON CARL'S
 * INSTRUCTION, 5 August 2026. Beat six was the `c2b DESIGN` backdrop fading in
 * behind the cards (*"There should be a 6 beat and that is the text underneath
 * fading in"*), and the three constants that timed it —
 * `LOCKUP_FADE_DELAY_MS`, `LOCKUP_FADE_OVERLAPPED_DELAY_MS` and
 * `LOCKUP_FADE_DURATION_MS` — went with it.
 *
 * ⚠ CARL'S REASONING WAS THAT THE FEATURE WAS NEVER NECESSARY, only the state
 * change it was serving: *"This is the reason the background exists. I needed
 * something to distinguish between card resting state and hover state... Is it
 * necessary? No. Is a resting state and hover state necessary. Yes."* The
 * distinction returns on the card's own surface, as the CSS version does it.
 *
 * ⚠ THE EXPORT SURVIVES THE CUT DELIBERATELY, because it does not belong to the
 * lockup — it means *"when is the entrance over"*, and there is still an
 * entrance. `enquiry-opening.tsx` imports it so the contact field's own WebGL
 * warm-up cannot land inside the card ladder. Measured 4 August, before that
 * guard existed: a 355ms blocking task at +2622ms after Begin, between card 2
 * and card 3. **That guard is still needed and still correct** — only its value
 * changes, 6330 -> 5440, because the thing it waits for is genuinely shorter now.
 *
 * ⚠ DERIVED, NEVER TYPED. `enquiry-opening.tsx` records that a hand-written
 * end-of-choreography value went stale TWICE.
 */
export const ENTRANCE_END_MS =
  CARD_RISE_LADDER_MS[CARD_RISE_LADDER_MS.length - 1] + CARD_RISE_DURATION_MS;

/* ────────────────────────────────────────────────────────────────────────────
   THE CARD EXIT — Carl's decisions, 18 August 2026.

   ⚠ NOTHING READS THESE YET. They land on their own, ahead of the exit itself,
   so the arithmetic can be reviewed without the mechanism in the diff.

   ⚠⚠ THE EXIT IS NOT "THE ENTRANCE, RUSHED" — and a reader who takes it that way
   will tune it in the wrong direction. Carl's reasoning: on entry the user is
   reading and assessing five options; on exit that is done — they have chosen and
   they are moving on. Clearing the cards faster readies a calm arrival for the
   next set. **The asymmetry follows from what the moment is for.** The budget
   merely happens to agree.
   ──────────────────────────────────────────────────────────────────────────── */

/**
 * The corridor step — how long the move takes from the Next-step click to the
 * next question being admitted.
 *
 * ⚠ IT LIVED AS A BARE LITERAL IN `enquiry-opening.tsx` UNTIL 18 August 2026,
 * where it was the `setTimeout` delay and nothing else. It is named here so the
 * exit's headroom can be DERIVED against it rather than asserted in a comment —
 * this file's own record has comments going stale twice.
 *
 * ⚠ MEASURED, NOT ASSUMED: `verify/card-exit.mjs` reads the phase edges as
 * `leaving@0ms -> arriving@1153ms`, so the stored value is right within 3ms.
 */
export const CORRIDOR_STEP_MS = 1150;

/**
 * The Q1 -> complete hold. That path is different in kind: 900ms, `enterComplete`,
 * and NO `setActiveQ` — no question is arriving.
 *
 * ⚠ NAMED FOR THE GUARD BELOW, not for its own sake. See `CARD_EXIT_Q1_HEADROOM_MS`.
 */
export const COMPLETE_HOLD_MS = 900;

/**
 * Each card's own departure. ⚠ THE ONE CHOSEN NUMBER IN THE EXIT — everything
 * else here is derived from it and from `CARD_OVERLAP`.
 *
 * ⚠ PROVISIONAL UNDER D-035 — Carl tunes it by eye. If the gesture reads wrong,
 * the correction belongs in this value or in the overlap. **Do not hand-type a
 * ladder to compensate.**
 */
export const CARD_EXIT_DURATION_MS = 425;

/**
 * ⚠ THE SAME `CARD_OVERLAP` THE ENTRANCE USES, AND THAT IS THE POINT. Preserving
 * 0.72 is what makes the departure read as the same gesture as the arrival,
 * played faster. The shape is being kept; the duration is not.
 */
export const CARD_EXIT_GAP_MS = Math.round(
  CARD_EXIT_DURATION_MS * (1 - CARD_OVERLAP),
);

/**
 * The exit ladder, indexed by GRID INDEX — `CARD_EXIT_LADDER_MS[i]` is the rung
 * for the card in slot `i`, the same access shape as `CARD_RISE_LADDER_MS[i]`.
 *
 * ⚠⚠ THE REVERSAL LIVES HERE, NOT IN THE CONSUMER. The cards leave 5 -> 4 -> 3
 * -> 2 -> 1: last to arrive, first to leave. Writing `(4 - i)` in the ladder makes
 * that a property anyone can read at a glance; burying the subtraction in a tick
 * loop is how it gets silently inverted.
 *
 * So card 5 (index 4) leaves at 0ms and card 1 (index 0) leaves last, at 476ms.
 */
export const CARD_EXIT_LADDER_MS = [0, 1, 2, 3, 4].map(
  (i) => (4 - i) * CARD_EXIT_GAP_MS,
);

/** When the last card has finished leaving, measured from the Next-step click. */
export const CARD_EXIT_END_MS =
  Math.max(...CARD_EXIT_LADDER_MS) + CARD_EXIT_DURATION_MS;

/**
 * What is left of the corridor step once every card has gone.
 *
 * ⚠⚠ THIS IS A DESIGN FIGURE, NOT SLACK — Carl, 18 August 2026. It gives the
 * user time to prepare for the next set. **A later reader must not reclaim it as
 * spare budget**, and that is the entire reason it is named rather than left as
 * the difference between two other numbers.
 */
export const CARD_EXIT_HEADROOM_MS = CORRIDOR_STEP_MS - CARD_EXIT_END_MS;

/**
 * ⚠⚠ THE Q1 CLIFF — GUARDED HERE BECAUSE D-035 TUNES TOWARD IT.
 *
 * On the Q1 -> complete path the exit gets only `COMPLETE_HOLD_MS` before `stage`
 * flips, `hostCardsVisible` goes false, and the `!active` branch hides the cards
 * outright. Exceed it and the last card is TRUNCATED MID-FADE.
 *
 * ⚠ IT IS NEGATIVE (-1ms) AT THE APPROVED VALUES, AND THAT IS CORRECT, NOT A
 * FAILURE. 1ms is far below one frame and cannot be seen. **So a harness must
 * assert against a FRAME (~16.7ms), not against zero** — the overrun only becomes
 * visible once it exceeds one frame interval.
 *
 * ⚠ The cliff is real and would otherwise be unguarded: `CARD_EXIT_DURATION_MS` is
 * tuned BY EYE under D-035, so it will be walked toward, not away from. Adding the
 * check later means adding it after someone has already fallen off.
 */
export const CARD_EXIT_Q1_HEADROOM_MS = COMPLETE_HOLD_MS - CARD_EXIT_END_MS;
