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

// ── Placement beside the live CSS card ───────────────────────────────────────

/**
 * Horizontal gap between the WebGL card's right edge and CSS card 1's left edge.
 *
 * Carl, 3 August: *"Put the new card just to the left of Card 1, top left. It
 * must not be built on top. We can use it to compare and contrast."* Wide enough
 * that the two read as separate objects, close enough to compare in one glance.
 */
export const PROTO_GAP_PX = 24;

/**
 * Minimum viewport width at which the proto card renders.
 *
 * ⚠ THE CARD PLUS ITS GUTTER NEEDS ~211px AND THE MARGIN DOES NOT ALWAYS HAVE
 * IT. Measured free margin left of card 1: 432px at 1440, 352px at 1280, but
 * only 200px at 1024 — where the card would overflow the viewport and add a
 * horizontal scrollbar. Below this width the CSS grid behaves exactly as it does
 * today and the proto card is simply absent.
 */
export const PROTO_MIN_VIEWPORT_PX = 1280;

/**
 * The canvas box, in CSS px, relative to `.enquiry-phrase-extras`.
 *
 * ⚠ DERIVED FROM THE GRID'S OWN SPAN RULE, NOT FROM MEASURING CARD 1. An earlier
 * draft proposed `getBoundingClientRect()` on the live card. That would make the
 * WebGL card DEPEND ON THE DOM CARD IT EXISTS TO REPLACE — and chunk 3 removes
 * the CSS cards, so the proto would lose its position source on the exact step
 * where it becomes the only card. It also avoids a measure → state → render
 * cycle on every resize.
 *
 * `left` is negative: the card sits OUTSIDE the extras box, in the viewport
 * margin to its left. `top: 0` aligns it with the first grid row, because
 * `.enquiry-answer-grid` is the extras box's first child.
 */
export function protoCanvasBox(): {
  left: number;
  top: number;
  width: number;
  height: number;
} {
  return {
    left: -(CARD_WIDTH_PX + PROTO_GAP_PX),
    top: 0,
    width: CARD_WIDTH_PX,
    height: CARD_HEIGHT_PX,
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
export const CARD_RISE_DURATION_MS = 700;
export const CARD_RISE_DELAY_MS = 220;
export const CARD_RISE_TRANSLATE_PX = 6;
