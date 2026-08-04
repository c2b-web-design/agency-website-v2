/**
 * The logo backdrop — the c2b lockup that sits behind the answer-card grid.
 *
 * ⚠ CHUNK 3 OF THE CARD REBUILD, AND THE REASON IT EXISTS IS MEASURED, NOT
 * DECORATIVE. Glass over a near-black page shows near-black: chunks 1 and 2
 * established that the card only reads as glass when there is something behind
 * it to transmit. **The backdrop is what makes the material visible at all.**
 *
 * ⚠ RECOGNITION IS THE POINT. Carl, 3 August 2026: *"It cannot just be colour to
 * enhance the glass. It's our logo and the shape will definitely imply that to
 * the user. The user must be able to recognise the logo."*
 *
 * ⚠ AND IT IS 2D, DELIBERATELY. *"Can it be 2D? Yes, its function is to enhance
 * the glass."* Flat blue/teal, **no gold, no implied 3D** — the glass supplies
 * the dimensionality, and a lit backdrop would compete with it. Every reference
 * Carl supplied puts FLAT colour behind the panel.
 */

import * as THREE from "three";
import {
  MARK_BITMAP_PACKED,
  MARK_BITMAP_WIDTH,
  MARK_BITMAP_HEIGHT,
} from "./answer-card-mark";

// ── The space the lockup has to fill ─────────────────────────────────────────
//
// ⚠ THE MARK'S ASPECT AND THE GRID'S DO NOT MATCH, and that mismatch is what
// forced the design. The c2b mark is 1.98:1; the answer grid is 576 x 104, or
// 5.5:1. Measured 3 August, with the whole mark centred at grid height:
//
//   top-left card       1% covered
//   top-middle        100% covered
//   top-right           1% covered
//   bottom row         53% covered
//
// ⚠ SO THE WHOLE MARK ALONE CANNOT TOUCH EVERY CARD — the two outer cards would
// sit on plain darkness, which is exactly the grey-slab failure this chunk
// exists to remove. Carl's answer was not to distort the mark but to design for
// the space: **the mark, with "design" set beside it on one line.** That lockup
// is what turns a 2:1 mark into something that fills a 5.5:1 strip.

/** The answer grid: 576 wide, two 48px rows with an 8px gap. */
export const GRID_WIDTH_PX = 576;
export const GRID_HEIGHT_PX = 104;

// ── The mark ─────────────────────────────────────────────────────────────────

/**
 * ⚠ THE MARK COMES FROM A FLAT WHITE STENCIL, AND THAT IS WHY IT IS THE RIGHT
 * SOURCE. `c2b-flat-white-alpha-cleaned-1x.png` is 1301 x 768 with mark bounds
 * 1123 x 566, **zero partial alpha**, 100% pure white opaque pixels. It carries
 * only the SHAPE — so colour is driven here rather than inherited. Every other
 * asset in `brand-assets/logo/` has material and lighting baked in, and using
 * one would mean inheriting someone else's light.
 *
 * It is traced into `answer-card-mark.ts` as a packed bitmap rather than fetched
 * at runtime; see that file for why.
 */
export function decodeMark(): { width: number; height: number; bits: Uint8Array } {
  const raw = atob(MARK_BITMAP_PACKED);
  const bits = new Uint8Array(MARK_BITMAP_WIDTH * MARK_BITMAP_HEIGHT);
  for (let i = 0; i < bits.length; i++) {
    const byte = raw.charCodeAt(i >> 3);
    bits[i] = (byte >> (7 - (i & 7))) & 1;
  }
  return { width: MARK_BITMAP_WIDTH, height: MARK_BITMAP_HEIGHT, bits };
}

/** Aspect ratio of the mark's bounding box (1123 / 566). */
export const MARK_ASPECT = 1.984;

/**
 * ⚠ THE THINNEST STROKE IS 0.0247 OF THE MARK'S HEIGHT — measured across the
 * whole mask, not from one scanline.
 *
 * This is the number chunk 2 was built to make usable:
 *
 *     required mark height = strokeWidth / 0.0247
 *
 * Chunk 2 measured the frost's threshold at roughness ~0.45, with 2/4/6/8px
 * strokes all still legible. So a mark at grid height (104) gives a 2.57px
 * thinnest stroke — inside the band, but near its floor.
 *
 * ⚠ A FIRST ATTEMPT AT THIS USED 4.24px, TAKEN FROM A SINGLE MID-LINE SCAN, AND
 * IT WAS WRONG. Scanning the whole mark gives 14px of a 566px height. The error
 * would have put the mark at a scale where its thinnest strokes were sub-pixel.
 */
export const MARK_THINNEST_STROKE_RATIO = 0.0247;

/** Thinnest stroke in CSS px for a given rendered mark height. */
export function thinnestStrokeAt(markHeightPx: number): number {
  return markHeightPx * MARK_THINNEST_STROKE_RATIO;
}

// ── The wordmark ─────────────────────────────────────────────────────────────
//
// ⚠ DESIGNED HERE, NOT SUPPLIED. Carl: *"the 'web design' has no font of its
// own. The font on the screenshot I sent you may be too thin. Design something
// appropriate."*

/**
 * ⚠ GEIST SANS — THE SITE'S OWN TYPEFACE, not an import. `app/layout.tsx` loads
 * Geist for the whole site and `globals.css` maps `--font-sans` and
 * `--font-heading` to it. A wordmark in a foreign face would announce itself as
 * a separate object.
 *
 * ⚠ NO `var(--font-geist-sans)` HERE, AND THAT IS NOT A STYLE PREFERENCE.
 * **A canvas font string cannot resolve CSS custom properties.** The browser
 * rejects the entire declaration as invalid and silently falls back to
 * `10px sans-serif` — measured 3 August:
 *
 *     ctx.font = '800 129px var(--font-geist-sans), "Geist", sans-serif'
 *     ctx.font  ->  "10px sans-serif"          width 38
 *     ctx.font = '800 129px "Geist", sans-serif'
 *     ctx.font  ->  "800 129px Geist, ..."     width 497
 *
 * ⚠ THIS COST FOUR ATTEMPTS TO FIND, because the failure is silent and looks
 * like a sizing bug: every size assignment was being discarded, so the word
 * stayed tiny no matter what arithmetic produced the number. Two of those
 * attempts "fixed" the sizing maths and one added a font-loading gate — none
 * could work, because the font string was never valid.
 *
 * The literal family name is what `next/font` registers, so naming it directly
 * is both correct and the only thing that works.
 */
export const WORDMARK_FONT_STACK = '"Geist", system-ui, -apple-system, sans-serif';

/**
 * ⚠ HEAVY, AND FOR A MEASURED REASON RATHER THAN A STYLISTIC ONE. This sits
 * BEHIND FROSTED GLASS, and chunk 2 measured detail dying as stroke widths fall
 * toward ~2.5px at the shipped frost. A light weight — like the reference
 * screenshot's — would dissolve into the wash and stop being readable as words.
 */
export const WORDMARK_WEIGHT = 800;

/**
 * ⚠ ONE WORD, NOT TWO — "design" beside the mark, on a single line.
 *
 * The design began as "web" stacked above "design", both justified to one
 * measure by setting "web" 1.52x larger. ⚠ CARL CUT IT: *"design has 6 letters.
 * web has 3. If web is placed above design, there will be some negative space.
 * There will be a gap. Lose the word 'web' and just use 'design'."*
 *
 * **He is right, and it removes a problem rather than solving one.** The size
 * ratio existed only to compensate for two words of unequal length; with one
 * word there is no ragged edge, no gap, and no compensation needed. `c2b design`
 * is one line, one weight, one measure.
 *
 * ⚠ AND IT IS SET IN CAPITALS, ON CARL'S TYPOGRAPHIC POINT: *"if the font or
 * part of it is in lower case it will have a tail, like in the letter 'g'.
 * DESIGN is more of a rectangular block and can be spaced better."*
 *
 * He is right on two counts. Lowercase "design" hangs a descender below the
 * baseline, so the word's visual mass sits off-centre and the block is ragged
 * top and bottom — awkward beside a mark that is itself a clean horizontal
 * shape. **Caps give cap-height to baseline and nothing below it: a rectangle.**
 *
 * ⚠ AND IT SURVIVES THE FROST BETTER. A block of uniform height blurs into a
 * legible bar; a shape with a tail blurs into an ambiguous one. Chunk 2 measured
 * detail dying below ~2.5px, so anything that concentrates mass is worth having.
 */
export const WORDMARK_TEXT = "DESIGN";

/**
 * Letter-spacing, in em.
 *
 * Slightly negative: at heavy weights Geist opens up, and pulling it in keeps
 * the word solid — which matters when it is being read through frost.
 */
export const WORDMARK_TRACKING_EM = -0.02;

// ── Lockup layout — tuned for EVEN COVERAGE, not for composition ─────────────
//
// ⚠ THE BRIEF IS LUMINOSITY, AND IT MAKES THIS A MEASURABLE TARGET RATHER THAN
// A MATTER OF TASTE. Carl, 4 August: *"The goal is to get approximately the same
// amount of text in each box. When light is shone upon the cards they will all
// have roughly the same amount of luminosity... What i am looking for is
// balance."*
//
// ⚠ CARL'S EYE RANKED THE IMBALANCE CORRECTLY BEFORE ANY MEASUREMENT — *"cards
// in order of how much text is in them - 1, 4, 2, 3+5"*. Measured coverage of
// each card box by lockup ink, before this block existed:
//
//     card 1  44.6%   card 2  26.7%   card 3  12.5%
//     card 4  40.8%   card 5  17.3%
//     spread 32.0 points; 29.6% of all ink outside any card
//
// His three prescriptions are the three constants below: *"DESIGN can be made
// bigger and shifted to the right. c2b can be shifted to the right."*

/**
 * The mark's height as a fraction of the grid's.
 *
 * ⚠ BELOW 1.0 SO THE MARK STOPS OVERFLOWING THE ROWS. At full height it ran the
 * entire 104px band, which is what put *"too much c2 outside the card"* in the
 * bottom-left gutter — the mark was taller than either row of cards.
 */
export const MARK_HEIGHT_RATIO = 0.78;

/**
 * How far the mark is inset from the grid's left edge, in grid px.
 *
 * ⚠ CARL: *"c2b can be shifted to the right."* At x=0 the mark's leading edge
 * sat outside card 1 entirely, spending ink where no card could catch it.
 */
export const MARK_LEFT_PX = 30;

/**
 * Gap between the mark and the wordmark, in grid px.
 *
 * ⚠ THIS IS THE LEVER ON CARDS 3 AND 5, the two that stayed lowest after the
 * first correction. Widening it pushes DESIGN right, into the top-right and
 * bottom-right boxes, without changing the word's size.
 */
export const WORDMARK_GAP_PX = 22;

/**
 * The wordmark's cap height as a fraction of the grid's height.
 *
 * ⚠ RAISED FROM 0.62 — Carl: *"DESIGN can be made bigger."* DESIGN spans cards
 * 2, 3 and 5, the three that were starving, so its size is the main lever on the
 * right-hand half of the grid.
 */
export const WORDMARK_CAP_RATIO = 0.72;

/**
 * The vertical centre of the gap between the two card rows, in grid px.
 *
 * ⚠ DESIGN IS CENTRED ON THIS, NOT ON THE BAND. Carl's construction, 4 August:
 * *"The height of DESIGN will have a number and also a number that is half the
 * height. Put that half way point at the half way point in the gap between the
 * cards."*
 *
 * ⚠ DERIVED FROM THE ROWS, NOT TYPED. The grid is two 48px rows with an 8px gap
 * (`CARD_BOXES`: top row at y=0, bottom row at y=56), so the gutter runs 48..56
 * and its centre is 52. Reading it from the boxes means a change to the row
 * geometry moves the wordmark with it.
 *
 * ⚠ A FUNCTION, NOT A CONST, because `CARD_BOXES` is declared below this point —
 * a top-level const here is a temporal-dead-zone error rather than a style
 * preference.
 */
export function gutterCentrePx(): number {
  return (CARD_BOXES[0].y + CARD_BOXES[0].h + CARD_BOXES[3].y) / 2;
}

// ── Colour ───────────────────────────────────────────────────────────────────
//
// ⚠ THE CORRIDOR'S OWN TWO COLOURS, read from `app/globals.css` rather than
// invented. Carl: *"Teal belongs to the rail... Blue belongs to the cards."* A
// mark moving between them says the two systems are one journey.
//
// ⚠ NO AMBER. That is the filament's (chunk 4) and would compete with the event
// the card is meant to stage.

/**
 * ⚠ SAMPLED FROM CARL'S OWN RENDER, NOT CHOSEN FROM THE STYLESHEET.
 *
 * Carl, 3 August: *"The c2b is my design. Copy the colour and gradient
 * exactly."* The values below are measured from
 * `brand-assets/logo/ig_...6430c3d4...png` — the blue/teal reference — by
 * sampling the brightest saturated body pixel in each vertical slice of the
 * mark, skipping the white ground, the gold hairlines and the blown speculars.
 *
 * Measured across the mark, left to right:
 *
 *     0%   rgb( 72,159,236)     50%  rgb(  7,222,232)
 *    10%   rgb( 56,138,227)     60%  rgb( 13,216,230)
 *    20%   rgb( 78,149,219)     70%  rgb( 38,237,248)
 *    30%   rgb( 45,182,219)     80%  rgb( 23,241,250)
 *    40%   rgb(  4,204,232)     90%  rgb( 20,230,240)
 *
 * ⚠ THE FIRST VERSION USED THE STYLESHEET'S `#163a8f` AND `rgb(125,210,205)`,
 * and Carl's report was that *"the contrast between colours is not wide
 * enough."* He was right, and the reason is visible in the numbers: the rail's
 * teal is a muted grey-green beside the render's near-cyan, and the opal's blue
 * is darker and flatter than the render's. **The corridor's UI colours and the
 * logo's own colours are not the same palette.**
 */
export const BACKDROP_BLUE = "#1b4fa8";
export const BACKDROP_TEAL = "#00c8e0";

/**
 * The page's own darkness, as a real object in the scene.
 *
 * ⚠ IT EXISTS FOR THE TRANSMISSION PASS, NOT FOR THE EYE. On screen it is
 * indistinguishable from the page behind it — which is the point: it must not
 * be visible as a rectangle (a first version of the BACKDROP made exactly that
 * mistake with a flat `#0a0a0a` fill, and Carl saw it immediately: *"I can see
 * the black rectangle the text is sitting in"*).
 *
 * ⚠ THE DIFFERENCE IS THAT THIS ONE IS BEHIND A CUT-OUT, NOT PAINTED INTO IT.
 * The earlier failure filled the lockup's own canvas, so the rectangle's edges
 * sat against the page's radial gradient and mismatched it. This plane is a
 * separate mesh at z=-2 with no alpha and no edge inside the viewport — it is
 * oversized (2x the grid) precisely so its boundary is never on screen.
 *
 * ⚠ WHY IT IS NEEDED AT ALL: `renderTransmissionPass` clears the transmission
 * target to WHITE when the canvas has `alpha: true` (three.module.js:18019), and
 * the page's real background is CSS, which no WebGL pass can see. Without this
 * object the glass samples white wherever the lockup is cut away, and the
 * letterform's dark ground is destroyed — measured at 0.0% dark pixels inside
 * the card against 44.9% outside it.
 *
 * ⚠ SAMPLED, NOT INVENTED. `app/globals.css` sets
 * `radial-gradient(ellipse at 50% 40%, #141414, #080808)`. The answer grid sits
 * below the ellipse's centre, between the two stops — #101010 is the value
 * measured off the rendered page at the grid's own rows.
 */
export const GROUND_COLOR = "#101010";

/**
 * How long a region takes to travel from blue to teal, in ms.
 *
 * ⚠ 2400ms IS THE FILAMENT'S CIRCUIT, NOT AN ARBITRARY DURATION. Carl, 3
 * August: *"The blue pixels will turn teal in the same time frame as the
 * filament takes to do a circuit."*
 *
 * ⚠ AND THAT MAKES TWO THINGS ONE THING rather than two things that happen to
 * match — the same instinct as the filament taking the rail's amber. In chunk 4
 * the filament becomes a real light, and selecting a card will start the
 * perimeter draw and the colour change on ONE clock, finishing together.
 *
 * D-029's filament: an SVG rect with `pathLength="1"`, stroked over 2400ms.
 */
export const REGION_SHIFT_MS = 2400;

// ── Building the texture ─────────────────────────────────────────────────────

export type BackdropRegions = {
  /**
   * Per-card shift, 0 = the region's resting colour, 1 = fully inverted.
   * Indexed in grid order: 0 top-left, 1 top-middle, 2 top-right, 3
   * bottom-left, 4 bottom-right.
   *
   * ⚠ INVERSION, NOT "TOWARD TEAL" — and the distinction is load-bearing. The
   * lockup has four alternating zones, so a blue region inverts to teal and a
   * teal region inverts to blue. See the `1 - 2 * base` composition in
   * `drawBackdrop`, and Carl's *"and vice versa"*.
   *
   * ⚠ PER-REGION, NOT GLOBAL. Carl: *"In its own region is a good idea."* Each
   * card owns the patch of backdrop behind it, so its state changes the colour
   * beneath IT rather than shifting the whole field.
   */
  shift: number[];
  /**
   * Beat six: 0 = the lockup is absent, 1 = fully present.
   *
   * ⚠ PAINTED, NOT `material.opacity`. Driving opacity requires
   * `transparent: true`, which routes the backdrop out of the transmission
   * pass's opaque list — the glass would stop seeing it, so the lockup would
   * fade in everywhere EXCEPT inside the cards. See `useLockupFade`.
   */
  fade?: number;
  /**
   * How far each hover rectangle is pulled in from the card's silhouette, in
   * grid px — so its edges sit UNDER the rim and bevel rather than on the
   * card's outline.
   *
   * ⚠ SUPPLIED BY THE CALLER AS `faceInset()`, not imported here.
   * `answer-card-geometry.ts` already depends on this module, so reaching back
   * for it would be circular. See the use site.
   */
  inset?: number;
};

/** The five card boxes in grid coordinates, matching `.enquiry-answer-grid`. */
export const CARD_BOXES = [
  { x: 0, y: 0, w: 186.66, h: 48 },
  { x: 194.67, y: 0, w: 186.66, h: 48 },
  { x: 389.33, y: 0, w: 186.66, h: 48 },
  { x: 97.33, y: 56, w: 186.66, h: 48 },
  { x: 292, y: 56, w: 186.66, h: 48 },
] as const;

/**
 * ⚠ FOUR ZONES ACROSS THE LOCKUP: BLUE, TEAL, BLUE, TEAL.
 *
 * Carl, 3 August: *"C2B should be treated separately so the C is mostly blue,
 * the b is mostly teal and the 2 the transition. Copy the screenshot exactly
 * with its distribution of colour. So throughout the phrase 'c2b DESIGN' the
 * colour distribution is Blue Teal Blue Teal. 4 areas where the changes will
 * affect 5 cards."*
 *
 * ⚠ THE MARK'S OWN BOUNDS ARE MEASURED FROM CARL'S RENDER, not estimated.
 * Sampling the brightest saturated body pixel in 24 vertical slices of
 * `ig_...6430c3d4...png` and reading green-to-blue ratio:
 *
 *     0% → 33%    g/b 0.58–0.80    BLUE      the `c`
 *    33% → 46%    g/b 0.80–0.88    changing  the `2`
 *    46% → 100%   g/b 0.88–0.97    TEAL      the `b`
 *
 * Those fractions are of the MARK's width, and the mark occupies the left
 * portion of the lockup — so they are rescaled below.
 *
 * ⚠ AND FOUR ZONES IS NOT DECORATION. Five cards sit across this width; four
 * colour areas means no two adjacent cards show the same thing, and the
 * boundaries fall between cards rather than on them. That is the windows model
 * doing real work — variation falls out of POSITION rather than being authored
 * per card.
 */
type Zone = { start: number; end: number };

/**
 * The two transitions, as fractions of the whole lockup width.
 *
 * The first is the mark's `2`, the second is DESIGN's `SI`. Both are computed
 * from the layout in `drawBackdrop` rather than hard-coded, so moving the mark
 * or resizing the word cannot leave them behind.
 */
function transitionZones(markStart: number, markEnd: number, textStart: number): Zone[] {
  // ⚠ THE MARK NO LONGER STARTS AT ZERO, so every zone is expressed as a
  // position WITHIN the mark's span rather than as a fraction of the whole
  // width. `at(f)` reads "f of the way across the mark".
  const at = (f: number) => markStart + (markEnd - markStart) * f;
  return [
    // The `2` — 33%–46% of the mark's own width.
    { start: at(0.33), end: at(0.46) },
    // ⚠ THE RESET, and it needs real width. It runs from inside the `b`'s
    // trailing edge to the start of DESIGN, so the colour is back to blue before
    // the first letter. Placing it in the mark-to-word gap alone left it ~3% of
    // the width — not enough to complete, which inverted the whole second half.
    { start: at(0.82), end: textStart },
    // The `SI` — DESIGN's six letters divide its span evenly; S and I are
    // letters 3 and 4, so they occupy the middle third.
    { start: textStart + (1 - textStart) * 0.33, end: textStart + (1 - textStart) * 0.62 },
  ];
}

/**
 * Position → colour, 0 = blue and 1 = teal, across four alternating zones.
 *
 * ⚠ THE SECOND ZONE RETURNS TO BLUE, which is the whole point of Carl's
 * distribution: the lockup reads blue, teal, blue, teal rather than one long
 * run. `smoothstep` on each transition so neither has a visible entry or exit
 * edge — the colour arrives and departs gradually, reading as one material
 * changing rather than two colours meeting.
 */
function easeBlueTeal(t: number, zones: Zone[]): number {
  const smooth = (u: number) => u * u * (3 - 2 * u);

  const [mark, reset, word] = zones;

  //  c  →  2  →  b     DE  →  SI  →  GN
  // blue  ramp  teal  blue   ramp   teal
  //
  // ⚠ THE THIRD ZONE RETURNS TO BLUE, and that is the point of Carl's
  // distribution: four alternating areas rather than one long run. The reset
  // happens in the gap between the mark and the word, where nothing is drawn,
  // so it is never visible as a hard edge.
  if (t <= mark.start) return 0; //  the `c`            BLUE
  if (t < mark.end) return smooth((t - mark.start) / (mark.end - mark.start));

  // ⚠ THE RESET TO BLUE HAPPENS INSIDE THE `b`'s TRAILING EDGE, not in the gap
  // between mark and word.
  //
  // A first version put it in the gap, reasoning that nothing is drawn there so
  // the change would be invisible. **The gap is far too narrow** — roughly 3% of
  // the width against the 13% each real transition needs — so the ramp could not
  // complete and DESIGN came out teal→blue: DE teal, GN blue, the exact
  // inverse of what Carl specified.
  //
  // Running it across the `b`'s last third instead gives it room. The `b` still
  // reads teal at its widest point, and by the time the eye reaches DESIGN the
  // colour has returned to blue.
  if (t <= reset.start) return 1; //  the `b`           TEAL
  if (t < reset.end) {
    return 1 - smooth((t - reset.start) / (reset.end - reset.start));
  }

  // ⚠ THE `DE` HOLD, AND ITS ABSENCE WAS THE BUG. Without this branch the range
  // between the reset ending and `SI` beginning fell through to the `SI`
  // formula with a NEGATIVE numerator, so `smooth()` extrapolated instead of
  // interpolating — traced values of 6.00 and 2.91 where the domain is 0..1.
  //
  // The visible result was DESIGN rendering teal→blue: DE teal, GN blue, the
  // exact inverse of the specification, twice in a row. Two attempts adjusted
  // the reset's POSITION when the fault was a missing branch, and only tracing
  // the function's own output across 0..1 found it.
  if (t <= word.start) return 0; //   `DE`              BLUE

  if (t < word.end) return smooth((t - word.start) / (word.end - word.start));
  return 1; //  `GN`                                    TEAL
}

/**
 * Blue→teal at `t`, then faded toward the ground by beat six's `fade`.
 *
 * ⚠ THE FADE IS TOWARD `GROUND_COLOR`, NOT TOWARD TRANSPARENCY. The lockup is a
 * cut-out on an opaque material (`alphaTest`, never `transparent`), because a
 * transparent backdrop is invisible to the transmission pass — the failure this
 * module documents twice. Fading alpha would therefore make the lockup disappear
 * from INSIDE the cards while remaining visible outside them: the precise
 * inverse of the intended effect.
 *
 * Mixing the drawn colour toward the page's own darkness gives an identical
 * result to the eye and keeps the material opaque throughout.
 */
function mixColour(a: THREE.Color, b: THREE.Color, t: number, fade = 1): string {
  const c = a.clone().lerp(b, Math.min(1, Math.max(0, t)));
  if (fade < 1) c.lerp(new THREE.Color(GROUND_COLOR), 1 - Math.min(1, Math.max(0, fade)));
  return `#${c.getHexString()}`;
}

/**
 * Draw the lockup into a canvas and return it as a texture.
 *
 * The mark is drawn from the stencil via `globalCompositeOperation`, so the
 * white silhouette becomes a mask for whatever gradient is painted through it —
 * which is the whole reason a flat white stencil is the right source asset.
 *
 * ⚠ THE RESULT GOES ON AN OPAQUE MATERIAL. `three.module.js:18039` renders
 * `opaqueObjects` only into the transmission target, and `:8237` routes anything
 * with `transparent === true` away from that list — so a transparent backdrop
 * would be INVISIBLE to the glass refracting it, with every assertion still
 * green. Chunk 2 learned this twice.
 */
export function drawBackdrop(
  ctx: CanvasRenderingContext2D,

  widthPx: number,
  heightPx: number,
  regions: BackdropRegions,
): void {
  const blue = new THREE.Color(BACKDROP_BLUE);
  const teal = new THREE.Color(BACKDROP_TEAL);
  const fade = regions.fade ?? 1;

  // ⚠ CLEARED, NOT FILLED. A first version painted `#0a0a0a` here as "the
  // page's own colour" — but the page background is a RADIAL GRADIENT
  // (`radial-gradient(ellipse at 50% 40%, #141414, #080808)`), so a flat fill
  // does not match it at any point and Carl saw the result immediately: *"I can
  // see the black rectangle the text is sitting in."*
  //
  // Transparent lets the real page show through, which is correct in every case
  // and cannot go stale if the background changes.
  ctx.clearRect(0, 0, widthPx, heightPx);

  const sx = widthPx / GRID_WIDTH_PX;
  const sy = heightPx / GRID_HEIGHT_PX;

  // ── The lockup, painted white into an offscreen layer ──
  // Composited rather than drawn directly so one gradient can be applied
  // through the whole shape — mark and wordmark alike — in a single pass.
  const layer = document.createElement("canvas");
  layer.width = widthPx;
  layer.height = heightPx;
  const lc = layer.getContext("2d");
  if (!lc) return;

  lc.fillStyle = "#ffffff";

  // ── The mark, fitted to the height and inset from the left ──
  //
  // ⚠ THE LAYOUT IS TUNED FOR EVEN COVERAGE PER CARD, NOT FOR COMPOSITION.
  // Carl, 4 August: *"The goal is to get approximately the same amount of text
  // in each box. When light is shone upon the cards they will all have roughly
  // the same amount of luminosity."*
  //
  // ⚠ MEASURED BEFORE IT WAS TOUCHED, and Carl's eye had already ranked it
  // correctly — *"cards in order of how much text is in them - 1, 4, 2, 3+5"*:
  //
  //     card 1  44.6%      card 2  26.7%      card 3  12.5%
  //     card 4  40.8%      card 5  17.3%
  //     spread 32.0 points, 29.6% of the ink outside any card
  //
  // The mark previously started at x=0 at FULL height, which is what put *"too
  // much c2 outside the card"* bottom-left while the right-hand cards starved.
  const markH = heightPx * MARK_HEIGHT_RATIO;
  const markW = markH * MARK_ASPECT;
  const markLeft = MARK_LEFT_PX * sx;
  const markTop = (heightPx - markH) / 2;
  const mark = decodeMark();
  const px = markW / mark.width;
  const py = markH / mark.height;
  for (let y = 0; y < mark.height; y++) {
    for (let x = 0; x < mark.width; x++) {
      if (mark.bits[y * mark.width + x]) {
        // +1 on each dimension so neighbouring cells meet without hairlines.
        lc.fillRect(markLeft + x * px, markTop + y * py, px + 1, py + 1);
      }
    }
  }

  // ── "design", to its right, on one line ──
  //
  // Sized so the word fills the remaining width, and vertically centred on the
  // mark. One word means no ragged block and no compensation — see WORDMARK_TEXT.
  const gap = WORDMARK_GAP_PX * sx;
  const textLeft = markLeft + markW + gap;
  const textWidth = widthPx - textLeft - MARK_LEFT_PX * sx;

  lc.textBaseline = "middle";
  lc.letterSpacing = `${WORDMARK_TRACKING_EM}em`;

  // ⚠ SIZED TO A MARGIN, NOT TO A CAP HEIGHT — AND THE HISTORY MATTERS BECAUSE
  // THE PREVIOUS RULE READ AS SETTLED.
  //
  // It was: *"sized by cap height, not by fitting the width"*, after an earlier
  // version's width-fit clamp bound first (150px against a width that allowed
  // 213px) and left the word silently small. That reasoning was sound while the
  // target was "a legible word beside the mark".
  //
  // ⚠ CARL CHANGED THE TARGET. The brief is now BALANCE — even ink per card —
  // and he supplied the construction for it, so the word's size is a CONSEQUENCE
  // of the margin rather than an input.
  //
  // ⚠ DESIGN IS SIZED TO LAND ITS `N` AS FAR FROM THE RIGHT EDGE AS THE `c` IS
  // FROM THE LEFT — Carl's construction, 4 August: *"The N of DESIGN can end at
  // the same distance from the perceived edge as when the c starts. Design can be
  // made taller and the text of DESIGN be changed in proportion."*
  //
  // ⚠ SO THE SIZE IS SOLVED FOR, NOT CHOSEN. `WORDMARK_CAP_RATIO` is only the
  // starting guess; the word is then scaled by the ratio of the width it should
  // occupy to the width it does. That makes the margin exact at any mark size,
  // and it cannot drift when the mark or the gap is retuned.
  //
  // ⚠ AND IT IS MEASURED FROM THE INK, NOT THE ADVANCE WIDTH. A font's advance
  // includes side bearings the letterform does not fill, so sizing on
  // `measureText().width` would leave the N's stem short of the target by the
  // trailing bearing — measured 56.5px adrift before this was solved for.
  let size = heightPx * WORDMARK_CAP_RATIO;
  lc.font = `${WORDMARK_WEIGHT} ${size}px ${WORDMARK_FONT_STACK}`;

  const inkWidthAt = (px: number) => {
    lc.font = `${WORDMARK_WEIGHT} ${px}px ${WORDMARK_FONT_STACK}`;
    const b = lc.measureText(WORDMARK_TEXT);
    // Right edge of the ink, relative to the draw origin.
    return b.actualBoundingBoxRight;
  };

  const targetInkWidth = textWidth;
  const inkAt = inkWidthAt(size);
  if (inkAt > 0) {
    size *= targetInkWidth / inkAt;
    lc.font = `${WORDMARK_WEIGHT} ${size}px ${WORDMARK_FONT_STACK}`;
  }

  // ⚠ CENTRED ON THE GUTTER BY ITS OWN MEASURED GLYPH BOX, NOT BY
  // `textBaseline: "middle"`.
  //
  // Carl's construction, 4 August: *"The height of DESIGN will have a number and
  // also a number that is half the height. Put that half way point at the half
  // way point in the gap between the cards."*
  //
  // ⚠ `"middle"` IS NOT THE GLYPH'S CENTRE. It centres on the font's em box,
  // which includes descender space `DESIGN` never uses — measured 6.3px HIGH of
  // the gutter's centre (mid-point y=45.8 against a gutter centre of 52.0).
  //
  // `actualBoundingBoxAscent/Descent` report where the ink actually falls, so
  // the correction is exact rather than a nudge: shift by the difference between
  // the box's own centre and the baseline.
  // ⚠ MEASURED AFTER THE FINAL SIZE IS SET, AND `textBaseline` SWITCHED FIRST.
  // `actualBoundingBox*` are reported RELATIVE TO THE CURRENT BASELINE, so
  // measuring while `textBaseline` was still "middle" and the font was still the
  // pre-solve size gave a correction for neither — the word drew clipped at
  // y=0, 21.8px adrift.
  lc.textBaseline = "alphabetic";
  const box = lc.measureText(WORDMARK_TEXT);
  const inkCentreFromBaseline = (box.actualBoundingBoxAscent - box.actualBoundingBoxDescent) / 2;
  lc.fillText(WORDMARK_TEXT, textLeft, gutterCentrePx() * sy + inkCentreFromBaseline);

  // ── Colour it, per region ──
  // Each card's patch gets its own blue→teal position, so a selected card's
  // region travels while its neighbours hold.
  lc.globalCompositeOperation = "source-in";

  // ⚠ THE ZONES ARE DERIVED FROM THE LAYOUT ABOVE, not hard-coded. Moving the
  // mark or resizing the word moves the transitions with them, so the four
  // colour areas cannot drift away from the letterforms they belong to.
  // ⚠ THE MARK'S SPAN IS NOW `markLeft` TO `markLeft + markW`, NOT `0` TO
  // `markW`. `transitionZones` places the `2`'s colour ramp at fractions of the
  // MARK's own width, so passing an un-inset figure would slide every zone
  // boundary left of the letterform it belongs to — the four-zone distribution
  // would drift off the glyphs it was measured against.
  const zones = transitionZones(
    markLeft / widthPx,
    (markLeft + markW) / widthPx,
    textLeft / widthPx,
  );

  const ramp = lc.createLinearGradient(0, 0, widthPx, 0);
  // Sample the region shifts across the width so the ramp bends toward teal
  // wherever a card is selected, and stays blue elsewhere.
  // ⚠ 96, NOT 48. The transition is PLACED rather than spread across the whole
  // span, so it needs enough stops inside its own quarter to read as smooth
  // rather than banded — and the hover falloff now adds a SECOND feature at a
  // finer scale, a per-card ramp roughly 93px wide.
  //
  // At 48 stops that is ~7 stops per falloff, on a gradient that is also being
  // blurred by the glass in front of it. Doubling costs one more pass over a
  // 1152px canvas and removes the risk entirely.
  const stops = 96;
  for (let i = 0; i <= stops; i++) {
    const t = i / stops;

    // ⚠ THE TRANSITION IS PLACED, NOT SPREAD — Carl, 3 August: *"in DESIGN, the
    // DE should be blue. The GN should be teal. The SI is where the slow
    // gradient transition should take place."*
    //
    // A linear ramp across the full width put every letter at a different
    // colour, so nothing read as definitely blue or definitely teal. Holding the
    // ends and moving only through the middle gives two clear statements and one
    // transition between them — which is what a two-colour identity needs.
    //
    // `easeBlueTeal` maps position to colour with flat ends and a smooth centre.
    //
    // ⚠ THE RESTING COLOUR ONLY. Hover is NOT painted through this ramp — see
    // the per-card pass below for why it cannot be.
    ramp.addColorStop(t, mixColour(blue, teal, easeBlueTeal(t, zones), fade));
  }
  lc.fillStyle = ramp;
  lc.fillRect(0, 0, widthPx, heightPx);

  // ── Hover, painted per card and CLIPPED TO THAT CARD'S OWN BOX ──────────────
  //
  // ⚠ A HORIZONTAL GRADIENT PHYSICALLY CANNOT CONFINE A CHANGE TO ONE CARD, and
  // that is why this is a separate pass rather than more stops on the ramp above.
  //
  // Carl, 4 August: *"only inside the card should this transition take place.
  // Card 4 will sit under card 1, right now the way its working card 1's hover
  // affects where card 4 will be."*
  //
  // He is right, and it is structural. `createLinearGradient(0, 0, widthPx, 0)`
  // has NO y-component: every column is one colour top to bottom. Card 1 spans
  // x 194-381 in the TOP row and card 4 spans x 292-478 in the BOTTOM row, so
  // they share columns 292-381 and a horizontal ramp cannot give them different
  // colours there. **No amount of tuning the weighting could have fixed it** —
  // the previous attempt's neighbour falloff was the right idea applied to an
  // instrument that has only one axis.
  //
  // ⚠ MEASURED BEFORE IT WAS BELIEVED: hovering card 0 moved card 3's hue by
  // +0.6° with the pointer nowhere near it.
  //
  // Each hovered region is now drawn as its own rectangle, so its influence stops
  // at its own edges — which is what *"in its own region"* has to mean once the
  // grid has two rows.
  // ⚠ `source-atop`, NOT the `source-in` LEFT OVER FROM THE RESTING FILL.
  //
  // `source-in` keeps only the intersection of new and existing pixels and
  // DISCARDS THE REST OF THE LAYER — so each per-card rectangle replaced the
  // whole lockup with itself, and hovering one card erased the other four
  // regions entirely. Measured as a uniform 217.9 hue in every non-hovered
  // region, and visible immediately in a screenshot: the lockup vanished except
  // inside the hovered card.
  //
  // ⚠ AND THE PROBE'S "NOT CONFINED" VERDICT WAS RIGHT FOR THE WRONG REASON —
  // two wrong diagnoses (a stale baseline, then a pre-fade hold) were argued
  // before the screenshot settled it in one glance. **The image was available the
  // whole time.** Carl's standing lesson: his eye beats the instruments, and a
  // number that cannot say WHAT is wrong is worth less than a picture.
  //
  // `source-atop` draws the new colour only where the layer is already opaque —
  // the letterforms — and leaves everything else untouched.
  lc.globalCompositeOperation = "source-atop";

  regions.shift.forEach((amount, idx) => {
    if (amount <= 0) return;
    const box = CARD_BOXES[idx];
    if (!box) return;

    // ⚠ INSET SO THE RECTANGLE'S EDGES RUN UNDER THE RIM AND BEVEL.
    //
    // Carl, 4 August: *"you can see some bleed outside the box. Make the
    // rectangle the colour sits in smaller. If its edges ran under the filament
    // or bevel this might eliminate the problem."*
    //
    // ⚠ HE IS RIGHT ABOUT BOTH THE CAUSE AND THE CURE. `CARD_BOXES` is the
    // SILHOUETTE — the rim's outer edge sits exactly on it — so a fill to that
    // boundary reaches the card's outline with nothing left to hide it, and any
    // softness in the gradient or the glass spills past the card entirely.
    //
    // `faceInset()` is the existing budget maths for precisely this distance:
    // `2 * tubeRadius + bevelWidth`, the depth the rim and bevel consume per
    // side before the face begins. Pulling the rectangle in by it puts every
    // edge underneath opaque geometry, so the boundary is occluded rather than
    // merely faint.
    //
    // ⚠ DERIVED FROM THE SAME CONSTANTS THE MESH IS BUILT FROM, never a
    // hand-tuned margin — a literal here would drift the moment the rim or bevel
    // is retuned in `?cardrig=1`, and the bleed would silently return.
    //
    // ⚠ PASSED IN, NOT IMPORTED. `faceInset()` lives in `answer-card-geometry.ts`,
    // which already imports `GRID_WIDTH_PX` from THIS module — importing it back
    // would make the two files circular. The caller supplies it, so the value is
    // still the mesh's own and the dependency still points one way.
    const inset = regions.inset ?? 0;
    const x0 = (box.x + inset) * sx;
    const y0 = (box.y + inset) * sy;
    const w = (box.w - 2 * inset) * sx;
    const h = (box.h - 2 * inset) * sy;

    // The inverted colour, sampled across this card's own span so the lockup's
    // four zones still read correctly inside the region.
    const local = lc.createLinearGradient(x0, 0, x0 + w, 0);
    const localStops = 24;
    for (let i = 0; i <= localStops; i++) {
      const u = i / localStops;
      // Sampled across the INSET span, matching the rectangle actually filled —
      // so the lockup's four zones still line up with the letterforms inside it.
      const t = (box.x + inset + u * (box.w - 2 * inset)) / GRID_WIDTH_PX;
      const base = easeBlueTeal(t, zones);

      // ⚠ THE SHIFT INVERTS THE REGION, IT DOES NOT DRIVE IT TOWARD TEAL. Carl,
      // 4 August: *"the card that the mouse is in would change from blue to teal
      // and vice versa."*
      //
      // ⚠ "AND VICE VERSA" IS THE WHOLE INSTRUCTION. This lockup has FOUR
      // alternating zones, so the five cards do NOT all start blue — measured,
      // `base` at each card's centre is 0.99, 0.00, 1.00, 0.66, 0.41. A shift
      // that always travelled toward teal would be a no-op on cards 0 and 2.
      //
      // Interpolating toward `1 - base` inverts each region about its own
      // resting colour, so a blue region goes teal and a teal region goes blue —
      // one mechanism, no per-card special-casing.
      local.addColorStop(u, mixColour(blue, teal, base + (1 - 2 * base) * amount, fade));
    }

    lc.fillStyle = local;
    lc.fillRect(x0, y0, w, h);
  });

  lc.globalCompositeOperation = "source-over";

  ctx.drawImage(layer, 0, 0);
}
