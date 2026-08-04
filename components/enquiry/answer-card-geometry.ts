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
 * Width of the bevel band — the equidistant slope from the rim inward and
 * toward the viewer.
 *
 * Carl's specification, 3 August: *"a 'slope' that comes toward us. Equidistant
 * all the way around. Top, bottom, sides and corners."*
 *
 * ⚠ NOT AN APPROVED VALUE. Adjustable; PROVISIONAL.
 */
export const BEVEL_WIDTH = 4;

/**
 * How far the bevel rises toward the viewer across its width.
 *
 * This is what makes the slope read as coming forward rather than as a flat
 * inward step — Carl: *"a 'slope' that comes toward us."*
 *
 * ⚠ IT MUST NOT EXCEED THE RIM'S APEX (`RIM_TUBE_RADIUS`), OR THE BEVEL BREACHES
 * THE SILHOUETTE'S FRONTMOST SURFACE. A first build set this to 2.5 against a
 * rim apex of 2.0: the bevel stood proud of the rim, the face was anchored below
 * it, and the card rendered with a black interior — the face sitting at the
 * bottom of a well, correctly lit and correctly invisible.
 *
 * At 1.6 against a rim apex of 2.0 the bevel rises to 80% of the rim's height:
 * a clear forward slope that still reads as contained by the rim. The half-tube
 * remains the frontmost surface, which is what makes it the outline — and, in
 * chunk 4, what keeps the filament unobstructed.
 */
export const BEVEL_RISE = 1.6;

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
 */
export const FACE_SEAM_SINK = CROWN_HEIGHT + 0.5;

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
): { x: number; y: number } {
  return {
    x: slot.x + slot.w / 2 - GRID_WIDTH_PX / 2,
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
 * ⚠ THE ONLY "FADE" AVAILABLE TO A TRANSMISSIVE CARD. `material.opacity` needs
 * `transparent = true`, which routes the rim and bevel out of the transmission
 * target for the whole entrance — the constraint that removed the opacity fade
 * on 3 August. Scale touches no material, so every mesh stays opaque for every
 * frame.
 *
 * Deliberately subtle: this is a card settling into its slot, not a pop.
 */
export const CARD_RISE_SCALE_FROM = 0.94;

// ── The filament's circuit ───────────────────────────────────────────────────

/**
 * Where the head is at progress `t` (0..1) around the card's perimeter, in the
 * card's own local coordinates.
 *
 * ⚠ THE ROUTE IS CARL'S, WALKED STEP BY STEP, 4 August:
 *
 * > *"Filament starts top left. Travels anticlockwise... first curve and travels
 * > down card 1s right edge. Second curve and travels along its bottom edge,
 * > adjacent to card 4. Third curve and on its left edge travels upward."*
 *
 * So the order is: **top-left origin → RIGHTWARD along the top → down the right
 * edge → LEFTWARD along the bottom → up the left edge → back to the origin.**
 *
 * ⚠ THE FIRST READING OF THIS WAS BACKWARDS, and Carl corrected it. "Anticlockwise"
 * was taken to mean the head left the top-left corner heading DOWN the left edge
 * — which would have put the spill on the far side of the grid from the cards it
 * is supposed to reach. **The spill targets are the check on the direction:**
 * card 2 sits right of card 1, so the head must travel the RIGHT edge to affect
 * it; card 4 sits below, so it must travel the BOTTOM edge.
 *
 * ⚠ AND IT IS A CLOSED LOOP. Carl: *"the time it takes for the filament to start
 * its journey and meet up with itself, that is a circuit."* `t = 1` returns to
 * `t = 0`, which is what lets the whole rim finish hot from one mechanism.
 *
 * Coordinates are centred on the card, +y UP — the same convention the mesh uses.
 */
export function filamentHeadAt(
  t: number,
  width: number = CARD_WIDTH_PX,
  height: number = CARD_HEIGHT_PX,
  radius: number = CARD_RADIUS_PX,
): { x: number; y: number } {
  const hw = width / 2;
  const hh = height / 2;
  const r = Math.max(0, Math.min(radius, hw, hh));

  const runX = width - 2 * r; // top and bottom straights
  const runY = height - 2 * r; // left and right straights
  const quarter = (Math.PI / 2) * r; // one corner arc
  const total = 2 * runX + 2 * runY + 4 * quarter;

  // Wrap, so a tail reaching back past the origin is handled by the caller
  // passing t < 0 or > 1 without special-casing.
  let d = ((t % 1) + 1) % 1 * total;

  // 1. Top edge, rightward from the top-left corner's end.
  if (d < runX) return { x: -hw + r + d, y: hh };
  d -= runX;

  // 2. Top-right corner, 90° -> 0°.
  if (d < quarter) {
    const a = Math.PI / 2 - (d / quarter) * (Math.PI / 2);
    return { x: hw - r + Math.cos(a) * r, y: hh - r + Math.sin(a) * r };
  }
  d -= quarter;

  // 3. Right edge, downward. ⚠ THE ONE THAT LIGHTS CARD 2.
  if (d < runY) return { x: hw, y: hh - r - d };
  d -= runY;

  // 4. Bottom-right corner, 0° -> -90°.
  if (d < quarter) {
    const a = -(d / quarter) * (Math.PI / 2);
    return { x: hw - r + Math.cos(a) * r, y: -hh + r + Math.sin(a) * r };
  }
  d -= quarter;

  // 5. Bottom edge, leftward. ⚠ THE ONE THAT LIGHTS CARD 4 — and where the head
  //    rounding the previous curve bleeds RIGHT of card 4's own vertical edge.
  if (d < runX) return { x: hw - r - d, y: -hh };
  d -= runX;

  // 6. Bottom-left corner, -90° -> -180°.
  if (d < quarter) {
    const a = -Math.PI / 2 - (d / quarter) * (Math.PI / 2);
    return { x: -hw + r + Math.cos(a) * r, y: -hh + r + Math.sin(a) * r };
  }
  d -= quarter;

  // 7. Left edge, upward.
  if (d < runY) return { x: -hw, y: -hh + r + d };
  d -= runY;

  // 8. Top-left corner, 180° -> 90° — closing the loop at the origin.
  const a = Math.PI - (d / quarter) * (Math.PI / 2);
  return { x: -hw + r + Math.cos(a) * r, y: hh - r + Math.sin(a) * r };
}

/**
 * Shortest distance between two points on the circuit, as a fraction, respecting
 * the wrap.
 *
 * ⚠ THE WRAP IS LOAD-BEARING FOR THE TAIL. Without it the warm trail vanishes
 * the instant the head crosses the origin, which would show as the rim going
 * cold at exactly the moment the circuit completes — the opposite of the
 * intended *"by the end of the circuit the whole rim is hot."*
 */
export function circuitDelta(a: number, b: number): number {
  const d = Math.abs(a - b) % 1;
  return Math.min(d, 1 - d);
}

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
 * `CARD_OVERLAP` = 0.72 each card begins when the previous is 72% of the way
 * through its own entrance — past its main travel, still settling.
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

/** The gap between card entrances, derived from the overlap. */
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

export const CARD_RISE_LADDER_MS = [0, 1, 2, 3, 4].map(
  (i) => CARD_FIRST_ENTRANCE_MS + i * CARD_RISE_GAP_MS,
);

/**
 * ⚠ THE SIXTH BEAT — the lockup fades in once all five cards are in place.
 *
 * Carl, 4 August: *"There should be a 6 beat and that is the text underneath
 * fading in."* And, when asked what "the text underneath" meant: *"by text
 * underneath i mean 'c2b DESIGN'."* It is the BACKDROP, not answer labels.
 *
 * ⚠ IT SPANS ALL FIVE CARDS AND ARRIVES AS ONE EVENT. Carl: *"It spans the 5
 * cards"* and *"The cards fade in at a certain speed, the text should do the
 * same. 6 beats instead of 5."* One lockup, one fade, at the cards' own 700ms —
 * not five per-region fades, which would fold beat six back into the ladder.
 *
 * ⚠ DERIVED, NEVER TYPED. `enquiry-opening.tsx` records that a hand-written
 * end-of-choreography value went stale TWICE. The last card starts at 740 and
 * runs 700, so the ladder ends at 1440 and the lockup begins there.
 */
export const LOCKUP_FADE_DELAY_MS =
  CARD_RISE_LADDER_MS[CARD_RISE_LADDER_MS.length - 1] + CARD_RISE_DURATION_MS;

/**
 * ⚠ BEAT SIX OVERLAPS TOO, BY THE SAME RULE AS THE CARDS. Carl's *"the fade in
 * doesnt have to complete before the next element"* is a statement about the
 * whole choreography, not about cards only — so the lockup begins as the last
 * card is reaching its full appearance rather than after it has settled.
 *
 * Without this the sequence would go legato, legato, legato, legato, **stop**,
 * then the lockup — a gap of a full card-length in the middle of a phrase that
 * is meant to flow.
 */
export const LOCKUP_FADE_OVERLAPPED_DELAY_MS =
  CARD_RISE_LADDER_MS[CARD_RISE_LADDER_MS.length - 1] +
  Math.round(CARD_RISE_DURATION_MS * CARD_OVERLAP);

/** How long the lockup takes to fade up. The cards' own duration — Carl: *"the same"*. */
export const LOCKUP_FADE_DURATION_MS = CARD_RISE_DURATION_MS;

/**
 * When the whole six-beat entrance has finished, measured from Begin.
 *
 * ⚠ IT MUST USE THE OVERLAPPED DELAY, because that is when beat six ACTUALLY
 * starts. Deriving it from the non-overlapped `LOCKUP_FADE_DELAY_MS` would
 * overstate the end by one overlap and — since this is what the contact field's
 * warm-up now waits for — would delay that warm-up for no reason.
 *
 * ⚠ AND IT IS CONSUMED OUTSIDE THIS MODULE: `enquiry-opening.tsx` imports it so
 * the contact field's own WebGL warm-up cannot land inside the card ladder.
 * Measured 4 August, before that guard existed: a 355ms blocking task at
 * +2622ms after Begin, between card 2 and card 3.
 */
export const ENTRANCE_END_MS =
  LOCKUP_FADE_OVERLAPPED_DELAY_MS + LOCKUP_FADE_DURATION_MS;
