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
   * Per-card shift, 0 = resting blue, 1 = fully teal. Indexed in grid order:
   * 0 top-left, 1 top-middle, 2 top-right, 3 bottom-left, 4 bottom-right.
   *
   * ⚠ PER-REGION, NOT GLOBAL. Carl: *"In its own region is a good idea."* Each
   * card owns the patch of backdrop behind it, so its state changes the colour
   * beneath IT rather than shifting the whole field.
   */
  shift: number[];
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
function transitionZones(markFraction: number, textStart: number): Zone[] {
  return [
    // The `2` — 33%–46% of the mark's own width.
    { start: markFraction * 0.33, end: markFraction * 0.46 },
    // ⚠ THE RESET, and it needs real width. It runs from inside the `b`'s
    // trailing edge to the start of DESIGN, so the colour is back to blue before
    // the first letter. Placing it in the mark-to-word gap alone left it ~3% of
    // the width — not enough to complete, which inverted the whole second half.
    { start: markFraction * 0.82, end: textStart },
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

function mixColour(a: THREE.Color, b: THREE.Color, t: number): string {
  const c = a.clone().lerp(b, Math.min(1, Math.max(0, t)));
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

  // ── The mark, on the left, fitted to the full height ──
  const markH = heightPx;
  const markW = markH * MARK_ASPECT;
  const mark = decodeMark();
  const px = markW / mark.width;
  const py = markH / mark.height;
  for (let y = 0; y < mark.height; y++) {
    for (let x = 0; x < mark.width; x++) {
      if (mark.bits[y * mark.width + x]) {
        // +1 on each dimension so neighbouring cells meet without hairlines.
        lc.fillRect(x * px, y * py, px + 1, py + 1);
      }
    }
  }

  // ── "design", to its right, on one line ──
  //
  // Sized so the word fills the remaining width, and vertically centred on the
  // mark. One word means no ragged block and no compensation — see WORDMARK_TEXT.
  const gap = 18 * sx;
  const textLeft = markW + gap;
  const textWidth = widthPx - textLeft;

  lc.textBaseline = "middle";
  lc.letterSpacing = `${WORDMARK_TRACKING_EM}em`;

  // ⚠ SIZED BY CAP HEIGHT, NOT BY FITTING THE WIDTH.
  //
  // A first version scaled the word to fill the remaining width and clamped it
  // to a fraction of the canvas height. The clamp bound first — 150px against a
  // width that allowed 213px — so the word came out small and the arithmetic
  // silently disagreed with itself.
  //
  // Caps make the honest approach available: with no descenders the block IS
  // cap height, so setting the size from the available height is exact rather
  // than approximate. The word then occupies whatever width it occupies, and
  // only shrinks if that would overflow.
  let size = heightPx * 0.62;
  lc.font = `${WORDMARK_WEIGHT} ${size}px ${WORDMARK_FONT_STACK}`;
  const measured = lc.measureText(WORDMARK_TEXT).width;
  if (measured > textWidth && measured > 0) {
    size *= textWidth / measured;
    lc.font = `${WORDMARK_WEIGHT} ${size}px ${WORDMARK_FONT_STACK}`;
  }

  lc.fillText(WORDMARK_TEXT, textLeft, heightPx / 2);

  // ── Colour it, per region ──
  // Each card's patch gets its own blue→teal position, so a selected card's
  // region travels while its neighbours hold.
  lc.globalCompositeOperation = "source-in";

  // ⚠ THE ZONES ARE DERIVED FROM THE LAYOUT ABOVE, not hard-coded. Moving the
  // mark or resizing the word moves the transitions with them, so the four
  // colour areas cannot drift away from the letterforms they belong to.
  const zones = transitionZones(markW / widthPx, textLeft / widthPx);

  const ramp = lc.createLinearGradient(0, 0, widthPx, 0);
  // Sample the region shifts across the width so the ramp bends toward teal
  // wherever a card is selected, and stays blue elsewhere.
  // ⚠ 48, NOT 12. The transition is now PLACED rather than spread across the
  // whole width, so it occupies a quarter of the span and needs enough stops
  // inside that quarter to read as smooth rather than banded.
  const stops = 48;
  for (let i = 0; i <= stops; i++) {
    const t = i / stops;
    const x = t * GRID_WIDTH_PX;
    let shift = 0;
    let weight = 0;
    CARD_BOXES.forEach((box, idx) => {
      const centre = box.x + box.w / 2;
      const w = Math.max(0, 1 - Math.abs(x - centre) / box.w);
      shift += (regions.shift[idx] ?? 0) * w;
      weight += w;
    });
    const local = weight > 0 ? shift / weight : 0;

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
    const base = easeBlueTeal(t, zones);
    ramp.addColorStop(t, mixColour(blue, teal, Math.min(1, base + local * (1 - base))));
  }
  lc.fillStyle = ramp;
  lc.fillRect(0, 0, widthPx, heightPx);
  lc.globalCompositeOperation = "source-over";

  ctx.drawImage(layer, 0, 0);

  void sy;
}
