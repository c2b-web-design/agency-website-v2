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
 * ⛔⛔ THE WALL PAIR'S ASPECT — SOLVED FROM THE PLATE, 17 September 2026.
 * SUPERSEDES the 1.615 recorded here until today.
 *
 * ⚠⚠ THE OLD VALUE CAME FROM A CSS TEXT BOX, NOT FROM THE ROOM. It read
 * *"1.615:1 — from `wall-card-text.tsx`'s 420x260 card space, NOT from the pinned
 * corners"* — and it said so plainly, which is the only reason the fault was
 * cheap to find. ⛔ It is **42% too narrow**. Nothing had ever measured it.
 *
 * ⛔ METHOD — the corners are PROJECTED TRAPEZOIDS, so a bounding box is wrong.
 * A first pass took min/max of the cyan and magenta pixels and returned CA
 * spanning x 0.17->0.74 and CB 0.59->0.87 — **overlapping, which is impossible
 * for two separate cards.** ⚠ Same failure the floor guides record: *"wrong, and
 * wrong in a way that looked plausible."*
 *
 * **What worked:** connected-component segmentation to separate the two painted
 * outlines, extreme-point corner extraction (min/max of x+y and x-y), then
 * rectification through the solved camera to undo the perspective.
 *
 *     CA (cyan)     TL 312,193   TR 843,242   BR 844,438   BL 341,447
 *     CB (magenta)  TL 1067,242  TR 1562,139  BR 1518,458  BL 1061,437
 *
 * ⚠ Pixels on the **1800x1200** plate. ⛔ A pixel coordinate without its frame
 * size is not a measurement — the scale trap that cost a camera solve.
 *
 * ⛔⛔ WHY THIS IS TRUSTED — five checks, and they are independent of each other:
 *
 *   1. THREE FOCAL LENGTHS AGREE. CA alone self-solves to f=959px, CB alone to
 *      f=914px, and the project's own camera solve gives f=901px (1282 on the
 *      2560 plate). **Within 6.4%, from data that never touched each other** —
 *      the wall quads were not used in the camera solve.
 *   2. THE ASPECT IS STABLE across that whole focal range: 2.25-2.35, a 4.7%
 *      spread. **Nowhere near 1.615.**
 *   3. ORTHOGONALITY. The two recovered edge directions come back perpendicular
 *      to within 0.012, confirming these are rectangles on a plane.
 *   4. THE OVERLAY LANDS. Rendered back onto the plate, the solved corners sit on
 *      Carl's painted quads along every edge, slants included —
 *      `live-work/wall-corner-check-17-september.png`.
 *   5. ⛔ THE ROOM CORROBORATES, and this test is Carl's. He observed that the
 *      desks relate to the walls, so the card angles should be similar allowing
 *      for perspective. From `/proto/wall`: PL is 0.3deg off the left wall,
 *      PR 5.4deg off the right, 84.3deg between the desks — so two cards lying
 *      flat on their walls should be **~89.4deg apart. Measured: 96.10deg.**
 *
 * ⚠⚠ CHECK 5 AGREES TO 6.7deg AND THAT IS NOT PERFECT — stated rather than
 * dressed up. ⛔ **The suspect is named and it is not these corners:** the record
 * says the RIGHT side is the weak one — *"Carl's rail ALONE... the skirting
 * confirmation came from a fit that never converged and is NOT independent
 * evidence"*, and `camera-solve-11-september.md` still lists the right desk's
 * direction under **"What is NOT established"**. **A wrong corner solve would not
 * land within 7deg of a right angle by chance.**
 *
 * ⚠ PER-CARD, NOT SHARED — the same structure as the floor pair, whose two guide
 * aspects also differ. **CA is 3.5% wider than CB.** ⛔ Carl has not ruled on
 * whether to collapse them to one value; the difference is carried because
 * flattening a measured difference needs a decision, not a default.
 */
export const CA_CARD_ASPECT = 2.327;
export const CB_CARD_ASPECT = 2.248;

/**
 * ⚠ DEPRECATED, KEPT AS THE RECORD OF A WRONG NUMBER. Superseded by
 * `CA_CARD_ASPECT` / `CB_CARD_ASPECT` above on 17 September 2026.
 *
 * ⛔ Do not use it and do not restore it. It is retained because
 * `context-rules.md` forbids retroactive rewriting: a future reader finding 1.615
 * in an old plan or screenshot needs to find out here why it is gone.
 */
export const WALL_CARD_ASPECT_DEPRECATED = 1.615;

/**
 * ⛔⛔ THE WALL QUADS' CORNERS, as fractions of the 1800x1200 plate.
 *
 * ⚠ Order is TL, TR, BR, BL — clockwise from top-left, matching the solve above.
 * ⛔ These are PROJECTED corners: they are what the card's rectangle looks like
 * from the solved camera, NOT a rectangle in the image. Do not read an aspect off
 * them directly — that is what produced 1.615's replacement in the first place.
 */
export const GUIDE_CA_QUAD = [
  { x: 312 / 1800, y: 193 / 1200 },
  { x: 843 / 1800, y: 242 / 1200 },
  { x: 844 / 1800, y: 438 / 1200 },
  { x: 341 / 1800, y: 447 / 1200 },
] as const;

export const GUIDE_CB_QUAD = [
  { x: 1067 / 1800, y: 242 / 1200 },
  { x: 1562 / 1800, y: 139 / 1200 },
  { x: 1518 / 1800, y: 458 / 1200 },
  { x: 1061 / 1800, y: 437 / 1200 },
] as const;

/**
 * ⛔ THE WALL CARDS' HEIGHTS, in millimetres.
 *
 * ⚠⚠ DERIVED FROM THE SOLVE, NOT CHOSEN — and derived the same way the floor
 * heights were: the height at which the card, hanging on its wall, subtends
 * exactly its measured quad. **The aspect is measured; the height follows from
 * the rectification's own scale.**
 *
 * ⛔ PROVISIONAL AND EXPECTED TO MOVE. Carl judges size in situ — the floor pair's
 * own note applies verbatim: *"I would have to see the cards built in situ before
 * I can determine where along the line they should sit. It's about balance within
 * the scene."*
 */
export const CA_CARD_HEIGHT_MM = 560;
export const CB_CARD_HEIGHT_MM = 520;

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

/**
 * ⛔⛔ THE FLOOR PAIR, PER CARD — added 14 September 2026, Carl: *"Both floor cards
 * do differ slightly in size."*
 *
 * ⚠⚠ THE HEIGHTS BELOW ARE PLACEHOLDERS AND THE STRUCTURE IS THE POINT. Until the
 * cards are placed on the rails there is no way to derive a real millimetre height
 * for either: the only landscape numbers that exist are ON-SCREEN fractions at the
 * old face-on position, and converting a projected size to a real one needs a
 * DEPTH — which is exactly what changes when the card moves. ⛔ Both therefore
 * carry `FLOOR_CARD_HEIGHT_MM` today. **They are not yet different.**
 *
 * ⚠ WHY THE ENTRY EXISTS ANYWAY: so each card is ADDRESSABLE BY NAME and the two
 * can diverge without a second edit to every consumer. Carl's ruling is recorded
 * in the shape of the code before it is recorded in its numbers.
 *
 * ⛔ THE MEASURED DIFFERENCE, SO IT IS NOT LOST — from the 10 September landscape
 * work (`live-work/floor-copy-overlay-withdrawn-11-september.md`), as fractions of
 * the 1800x1200 plate:
 *
 *     CD   0.3681 w   0.2725 h   ->  662.6 x 327.0 px   aspect 2.0263
 *     CS   0.3663 w   0.2712 h   ->  659.3 x 325.4 px   aspect 2.0261
 *
 * ⚠ CD IS ~0.5% LARGER THAN CS IN BOTH AXES, and the aspects agree to 1 part in
 * 10,000 — **the same shape at slightly different sizes**, not two shapes.
 * ⛔ A Builder called that difference hand-placement slop on 14 September; Carl
 * corrected it. It is intended and must not be flattened away.
 *
 * ⚠⚠ AND IT IS AN ON-SCREEN DIFFERENCE, WHICH IS NOT THE SAME AS A REAL ONE. CS
 * sits nearer the camera, so equal real size projects LARGER for CS — yet CD reads
 * larger here. ⛔ **Whether the two cards are different objects in the room, or one
 * size at two depths, is UNRESOLVED and is Carl's, in situ.** Do not infer it from
 * these numbers.
 */
/**
 * ⛔⛔ SOLVED, NOT CHOSEN — 14 September 2026. These are the heights at which each
 * card, STANDING ON ITS RAIL, subtends exactly the on-screen size of its guide
 * rectangle.
 *
 * ⚠⚠ THE RULE THEY COME FROM IS CARL'S, AND IT IS THE CONSTRAINT: *"The height
 * has already been worked out and is the height of the green and purple
 * rectangles. The copy text was also worked out. Once the geometry for the cards
 * that were built face on was established it shouldnt be changed. All that should
 * change is the angle at which they sit."*
 *
 * ⛔ SO THE APPROVED QUANTITY IS THE ON-SCREEN SIZE, AND THE MILLIMETRE HEIGHT IS
 * ITS CONSEQUENCE. Verified: CD subtends 0.27670 against a guide of 0.27670, CS
 * 0.27410 against 0.27410 — exact to five decimal places.
 *
 * ⚠⚠ WHY THE PREVIOUS 860mm WAS WRONG, AND IT IS AN INSTRUCTIVE FAILURE. Size was
 * inherited from a FACE-ON fit at the front of the frame, then the card was moved
 * DEEP INTO THE ROOM without re-deriving it. A rectangle that fills the green box
 * near the camera must be enormous to fill it from the rails: the cards came out
 * **1730mm wide — wider than the desks they stand behind.** ⛔ Size and position
 * were taken from two unrelated sources and the mismatch was invisible on screen.
 *
 * ⚠ CONSEQUENCE, STATED SO IT IS JUDGED RATHER THAN DISCOVERED: at these heights
 * the cards are **~0.54x desk height** — roughly knee-high behind the chairs.
 * ⛔ NOT YET JUDGED BY EYE, and Carl has named the order in which it will be:
 * insert the text first; if it does not fit, raise the height so that (1) the copy
 * fits, (2) it is proportionate to the desks, (3) proportionate to the wall cards,
 * and (4) the scene looks balanced. **Angles first.**
 *
 * ⚠ THE PAIR STILL OVERLAP AT THE CURRENT MIDPOINTS. Centres are 424mm apart and
 * half the summed widths is ~808mm, so they collide by ~380mm. ⛔ The midpoints
 * are PROVISIONAL and the rails carry long extensions precisely so the cards can
 * be slid along their axis — Carl: *"i will move them along the axis."*
 */
export const CD_CARD_HEIGHT_MM = 406;
export const CS_CARD_HEIGHT_MM = 392;

/**
 * ⛔⛔ THE GUIDE RECTANGLES, MEASURED OFF THE PLATE — 14 September 2026.
 *
 * ⚠⚠ RECOVERED BY COLOUR SEGMENTATION, NOT READ FROM ANY RECORD, BECAUSE NO
 * RECORD HELD THEM. The guides are PAINTED INTO `about-studio-wall-guides.jpg`;
 * their coordinates existed nowhere in code or in `live-work/`. ⛔ Three recorded
 * CD quads all disagree with the plate and are STALE:
 *
 *     INITIAL_FRAC CD        0.145 -> 0.245 x    PORTRAIT   working-space seeds
 *     page.tsx comment       0.108 -> 0.222 x    PORTRAIT   stale
 *     withdrawn overlay      0.0321 -> 0.4002 x  landscape, wrong x-origin
 *
 * **The true green box starts at 0.1094.** None of the three would have landed
 * the card, and a Builder searching for "the green rectangle" finds all three
 * before finding the truth. ⛔ These are the numbers; the others are history.
 *
 * ⚠ METHOD: green-dominant and magenta-dominant pixels, restricted to BELOW
 * y = 0.45 so the cyan and magenta WALL quads cannot contaminate the floor pair.
 * A first pass without that restriction merged the wall quads in and produced a
 * 1.394 aspect for CD — wrong, and wrong in a way that looked plausible.
 *
 * ⛔ BOTH ARE AXIS-ALIGNED RECTANGLES, VERIFIED: the top and bottom rows of each
 * box return identical x-ranges. They are NOT projected quads, so a bounding box
 * is the whole shape rather than its hull.
 *
 *     CD (green)    x 0.1094 -> 0.4806   y 0.5725 -> 0.8492   668 x 332   2.0120
 *     CS (purple)   x 0.5294 -> 0.8972   y 0.5817 -> 0.8558   662 x 329   2.0122
 *
 * ⚠⚠ THE TWO ASPECTS AGREE TO 1 PART IN 10,000 and sit within 0.7% of the
 * approved `FLOOR_CARD_ASPECT` (2.026). **The approved shape, confirmed
 * independently from the plate.**
 *
 * ⛔ AND THIS IS THE MEASURED FORM OF CARL'S RULING THAT THE TWO DIFFER: CD is
 * **0.9% larger than CS in both axes**. ⚠ An earlier figure of 0.5% came from the
 * withdrawn overlay; these come from the plate Carl is actually looking at and
 * supersede it. **Same shape, different size — do not flatten them to match.**
 *
 * ⚠ FRACTIONS OF THE 1800x1200 PLATE, which is `about-studio-wall-guides.jpg` and
 * shares its 1.5 aspect with `about-studio-source.jpg` (2560x1707). ⛔ A pixel
 * coordinate without its frame size is not a measurement — the scale trap that
 * cost an entire camera solve on 11 September.
 */
export const GUIDE_CD = {
  x0: 0.1094,
  y0: 0.5725,
  x1: 0.4806,
  y1: 0.8492,
} as const;

export const GUIDE_CS = {
  x0: 0.5294,
  y0: 0.5817,
  x1: 0.8972,
  y1: 0.8558,
} as const;

/**
 * ⛔⛔ THE POSITION RAILS' MIDPOINTS — where each floor card's RIM CENTRE sits.
 * Carl, 14 September 2026: *"Move the cards so that the centre of each rim of
 * each card fit exactly halfway along the thicker lines."* Then, disambiguating:
 * *"left card on blue rail. Right card on pink rail."*
 *
 * ⚠⚠ THE RAIL NAMES ARE INVERTED AND THIS IS THE TRAP THAT HAS ALREADY COST ONE
 * MEASUREMENT. In `/proto/wall`:
 *
 *     RL / RR   labelled "ANGLE"      -> sit on the CHAIR CASTOR BASES.
 *                                        A Builder read them as desk references
 *                                        and produced a "57.7° between the desks"
 *                                        figure. ⛔ DISCARDED.
 *     PL / PR   labelled "POSITION"   -> THE MEASUREMENT. Carl's hand-placed desk
 *                                        floor lines, and where the cards stand.
 *
 * ⛔ THESE ARE PL AND PR — the BLUE (cyan) and PINK (magenta) rails. Carl asked
 * for "the angle rails" and then named the colours; **the colours are
 * authoritative and they resolve to the pair labelled POSITION.** A future reader
 * searching for "angle" will find RL/RR first and they are the wrong lines.
 *
 * ⚠ THE MIDPOINT IS OF THE PINNED SPAN — the THICK segment between the two
 * handles, drawn at `strokeWidth={5}`. The thin extension beyond it is the slide
 * axis, deliberately longer so the cards can be nudged along it: *"that way we
 * will have a direction to move them slightly if needed."* ⛔ The midpoint of the
 * drawn line is NOT the midpoint of the extension.
 *
 *     PL  0.27621, 0.94232  ->  0.46058, 0.83185   mid  0.368395, 0.887085
 *     PR  0.50858, 0.80654  ->  0.64059, 1.00101   mid  0.574585, 0.903775
 *
 * ⚠ PR's B handle is at y = 1.00101, fractionally BELOW the plate's bottom edge.
 * That is Carl's placement as committed, not a clamp error — the rail leaves the
 * frame and its midpoint is still inside it.
 *
 * ⛔ UNASSERTED: these are a COPY of `INITIAL_RAIL` in `app/proto/wall/page.tsx`.
 * Nothing in code checks the two agree, and they will drift silently if the rails
 * are ever re-pinned. **Verify against that file before relying on them.**
 */
export const RAIL_MID_CD = { x: 0.368395, y: 0.887085 } as const;
export const RAIL_MID_CS = { x: 0.574585, y: 0.903775 } as const;

/**
 * ⛔⛔ THE SOLVED CAMERA — `live-work/camera-solve-11-september.md`.
 *
 * ⚠⚠ `PerspectiveCamera.fov` IS VERTICAL. The plan carried the 89.91° HORIZONTAL
 * figure; the Architect caught it before it was written. **67.31° is the vertical
 * FOV derived from f = 1282px on the 2560x1707 plate.**
 *
 * ⛔ FALSIFIED INDEPENDENTLY AT 0.6°: the left desk's cabinet base, fitted at
 * rms 0.33px and never fed into the solve, back-projects to 0.6° from its wall.
 * It should be 0°. **That test could have failed and did not.**
 *
 * ⚠ THE PRINCIPAL POINT IS ASSUMED AT IMAGE CENTRE. Not solved. Unasserted.
 */
export const CAMERA_VFOV_DEG = 67.31;
export const CAMERA_PITCH_DEG = 12.68;

/**
 * ⛔⛔ EACH FLOOR CARD'S YAW, BACK-PROJECTED FROM ITS RAIL — 14 September 2026.
 *
 * ⚠⚠ DERIVED, NOT CHOSEN, AND THE DERIVATION CORROBORATES CARL'S ACCOUNT OF HOW
 * THE RAILS WERE MADE. Carl, 14 September: *"the green and amber lines… follow
 * the desk where it meets the floor. Blue and pink were extrapolated from those
 * angles."* Back-projecting all four onto the solved floor plane:
 *
 *     RL (green, left desk)    123.88°
 *     PL (blue,  left card)    122.80°   <- 1.08° from RL. The extrapolation holds.
 *     RR (amber, right desk)    26.16°
 *     PR (pink,  right card)    31.47°   <- 5.32° from RR
 *
 * ⛔ THE 5.32° ON THE RIGHT IS NOT ERROR. It matches the recorded **5.4° turn of
 * the right desk off its wall** — an L-desk pushed into the corner. ⚠ And that
 * side rests on Carl's single hand-placed rail: `camera-solve-11-september.md`
 * still lists the right desk's direction under *"What is NOT established"*.
 *
 * ⚠ THE DESKS COME OUT 82.28° APART against the recorded **84.3°**. The ~2°
 * residual is the assumed principal point and camera height. ⛔ It does not affect
 * the RELATIVE yaws, which is what the cards use.
 *
 * ⚠⚠ A SIGN ERROR IN THE PITCH ROTATION FIRST PRODUCED **146.26°** FOR THE SAME
 * PAIR — a 62° error that looked like a number. It was caught ONLY by testing both
 * conventions against Carl's recorded 84.3°. ⛔ The transform was written in one
 * pass and checked against nothing, which is the four-ceiling-angles failure in a
 * new place. **Verify a derived angle against a known one before using it.**
 */
export const CD_RAIL_YAW_DEG = 122.8;
export const CS_RAIL_YAW_DEG = 31.47;

/**
 * ⛔⛔ WHICH WAY EACH CARD FACES — Carl, 14 September: *"Each card faces inward,
 * mirroring the wall cards."*
 *
 * ⚠ A RAIL IS A LINE WITH TWO DIRECTIONS, so the face normal is the rail's yaw
 * ±90° and only one of the two points into the room. Resolved by dotting each
 * candidate against the direction back to the camera:
 *
 *     CD   normal 32.80°   -> x +0.542, z +0.841   dot +0.956   inward from LEFT
 *     CS   normal 301.47°  -> x -0.853, z +0.522   dot +0.640   inward from RIGHT
 *
 * ⛔ BOTH ARE `yaw - 90°`, AND THAT SYMMETRY IS EVIDENCE RATHER THAN COINCIDENCE:
 * the same rule resolves both sides, and the two normals mirror each other exactly
 * as Carl specified.
 *
 * ⚠ THE MESH IS BUILT IN THE XY PLANE FACING +Z (`about-card-mesh.tsx` returns a
 * bare group; the face is offset along +Z). So orienting a card is a **Y-ROTATION
 * ONLY** — there is no X rotation, because "no lean" means no backward tilt.
 * ⛔ Carl, 14 September: *"standing upright, no lean."*
 */
export const CD_FACE_YAW_DEG = CD_RAIL_YAW_DEG - 90;
export const CS_FACE_YAW_DEG = CS_RAIL_YAW_DEG - 90;

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
 * ⛔⛔ THE TENT POLE — how far the centre of the face is lifted, as a fraction of
 * CARD HEIGHT. This is the dial. 14 September 2026.
 *
 * ⚠⚠ CARL'S MODEL, AND IT IS THE SPACETIME PICTURE INVERTED: a pliable sheet
 * pinned to its frame, with a pole pushing UP at the centre instead of a mass
 * pulling down. *"Just enough so the face is curved, text can be read off it and
 * when light is shone at it, especially from the top and sides — it is noticably
 * curved."*
 *
 * ⛔ A RATIO, NOT A MILLIMETRE VALUE, so it travels across all four cards at their
 * different sizes — the same family rule that governs every other dimension.
 * Carl: *"it is a blueprint for all 4 cards."*
 *
 * ⚠⚠ START SMALL AND BRING IT UP — Carl's instruction, in his own terms: *"Start
 * small, lets see what effect it has on the face. Like music production, we will
 * start at low volume and increase as needs be."*
 *
 *     0.040   <- current. ~16mm on CD, about a third of the old lift.
 *     0.060      ~24mm
 *     0.090      ~37mm, roughly what the superseded crown produced
 *
 * ⛔ DELIBERATELY NOT `CROWN_RATIO`. That value was back-derived to hold 27.9° of
 * maximum tilt on the OLD superellipse profile — a model that has been replaced.
 * Reusing it would carry a number tuned for one surface onto a different one,
 * which is the class of mistake this project has recorded repeatedly. **The pole
 * gets its own figure, tuned by eye against the membrane.**
 *
 * ⚠⚠ RETUNED TO 0.025 ON 14 SEPTEMBER 2026, when the quartic bulge
 * `(1 - x²)(1 - y²)` replaced the tent-pole membrane. ⛔ The name is now stale —
 * there is no pole, and the value is the CURVATURE of a shallow dome — but it is
 * kept so the dial has one home rather than two. **Rename when the shape settles.**
 *
 * ⛔⛔ 0.073 — CARL'S VALUE, SET BY EYE ON THE BENCH, 14 September 2026. *"CD — i
 * modified the crown."* **30mm of rise on CD's 757x346mm face.**
 *
 * ⚠⚠ ALMOST THREE TIMES THE RECOMMENDED STARTING POINT, and that is the finding.
 * The outside advice suggested 0.015–0.03 *"rather than making it obviously
 * curved"*, and the Builder opened at 0.025 on that basis. ⛔ **Judged on the
 * bench under a swept light, in side and top elevation, it wanted far more.**
 * The conservative figure was too timid for a card this size in a dark room.
 *
 *     0.015    6.09mm    max tilt 4.03°
 *     0.025   10.15mm    max tilt 6.69°    the recommended start
 *     0.030   12.18mm    max tilt 8.02°
 *     0.073   30.00mm                      <- CARL'S, by eye
 *
 * ⚠ THE QUARTIC SPENDS NO TEXT AREA ON SLOPE AT ANY SETTING — each factor
 * vanishes on its own axis, so the edges are zero however high the centre goes.
 * **That is why a value this large is affordable here and was not on any earlier
 * formulation**, all of which bought their seam with face area.
 *
 * ⚠ SET BY EYE, NOT YET SIGNED OFF as the final value — the lighting it will
 * finally live under does not exist (the rim is not a light source until chunk 3,
 * and the four aimed lights are unbuilt).
 */
export const TENT_POLE_RATIO = 0.073;

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
