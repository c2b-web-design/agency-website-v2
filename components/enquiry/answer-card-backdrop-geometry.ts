/**
 * The grid the answer cards sit in, and the ground behind them.
 *
 * ⚠ THIS FILE USED TO CARRY THE `c2b DESIGN` LOCKUP — the mark bitmap, the
 * wordmark layout, the four-zone blue/teal colour system and the canvas drawing
 * that composed them. **All of it was removed on Carl's instruction, 5 August
 * 2026.** See `answer-card-backdrop.tsx` for the full list of what went and the
 * reasoning.
 *
 * ⚠ WHAT REMAINS IS HERE BECAUSE THE CARDS NEED IT, NOT BECAUSE THE LOCKUP DID.
 * That is why the removal did not split on file boundaries: `CARD_BOXES` is the
 * grid's own layout and every card's world position is derived from it, the two
 * dimensions are imported by `answer-card-geometry.ts`, and `GROUND_COLOR` is
 * the transmission pass's opaque backing. Deleting this module with the lockup
 * would have taken the card layout with it.
 */

// ── The space the grid occupies ──────────────────────────────────────────────

/** The answer grid: 576 wide, two 48px rows with an 8px gap. */
export const GRID_WIDTH_PX = 576;
export const GRID_HEIGHT_PX = 104;

/**
 * The five card boxes in grid coordinates, matching `.enquiry-answer-grid`.
 *
 * ⚠ THE SINGLE SOURCE FOR WHERE A CARD IS. `cardSlotPosition` in
 * `answer-card-geometry.ts` converts these to world space, and the pointer
 * targets in `answer-card-canvas.tsx` are laid out from the same array — so a
 * card's mesh and its hover region cannot drift apart.
 */
export const CARD_BOXES = [
  { x: 0, y: 0, w: 186.66, h: 48 },
  { x: 194.67, y: 0, w: 186.66, h: 48 },
  { x: 389.33, y: 0, w: 186.66, h: 48 },
  { x: 97.33, y: 56, w: 186.66, h: 48 },
  { x: 292, y: 56, w: 186.66, h: 48 },
] as const;

// ── The ground ───────────────────────────────────────────────────────────────

/**
 * The page's own darkness, as a real object in the scene.
 *
 * ⚠ IT EXISTS FOR THE TRANSMISSION PASS, NOT FOR THE EYE. On screen it is
 * indistinguishable from the page behind it — which is the point: it must not be
 * visible as a rectangle. (A first version of the backdrop made exactly that
 * mistake with a flat `#0a0a0a` fill painted into the lockup's own canvas, and
 * Carl saw it immediately: *"I can see the black rectangle the text is sitting
 * in."* The plane that replaced it is oversized so its edge is never on screen.)
 *
 * ⚠ WHY IT IS NEEDED AT ALL: `renderTransmissionPass` clears the transmission
 * target to WHITE when the canvas has `alpha: true` (three.module.js:18019), and
 * the page's real background is CSS, which no WebGL pass can see. Without this
 * object the glass samples white — measured at 0.0% dark pixels inside the card
 * against 44.9% outside it.
 *
 * ⚠ AND IT IS NOW THE WHOLE OF WHAT THE GLASS LOOKS AT. While the lockup existed
 * this colour was only the dark between the letterforms; since 5 August it is
 * the entire content of every card's refraction. **If the cards stop reading as
 * glass, this constant is the lever** — not a reinstated lockup.
 *
 * ⚠ SAMPLED, NOT INVENTED. `app/globals.css` sets
 * `radial-gradient(ellipse at 50% 40%, #141414, #080808)`. The answer grid sits
 * below the ellipse's centre, between the two stops — #101010 is the value
 * measured off the rendered page at the grid's own rows.
 */
export const GROUND_COLOR = "#101010";
