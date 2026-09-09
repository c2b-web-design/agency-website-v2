/**
 * Contact-field geometry — measured CSS-pixel constants and the layer -> field
 * placement maths for the first Three.js contact-field object.
 *
 * UNITS: CSS pixels, used DIRECTLY as Three.js world units with NO conversion
 * factor. This is only valid because the field renders under an ORTHOGRAPHIC
 * camera with `zoom: 1`, where @react-three/fiber sets the frustum to
 * `left = -size.width/2 … top = size.height/2` in CSS px on every resize
 * (verified in @react-three/fiber `updateCamera`). One world unit therefore
 * equals one CSS pixel exactly, and stays exact across resize.
 *
 * NOTE: this is deliberately NOT the model used by `components/lab/grid-layout.ts`,
 * which applies an arbitrary `PX_TO_WORLD = 1/100` under a PERSPECTIVE camera and
 * preserves only the RATIOS between cards. That is correct for a free-floating
 * lab study and wrong here: this object must be pixel-exact at a measured
 * position, so it must not adopt that scale factor.
 *
 * Sources: `project-intelligence/live-work/contact-form-current-geometry-reference.md`
 * plus live Playwright measurement of the former field grid at 1280/1440/900/600/390
 * viewports (22 July 2026).
 */

// ── Measured field body (the former Name input) ──────────────────────────────
/** Field body height. Fixed at every viewport width — only width flexes. */
export const FIELD_HEIGHT_PX = 38;
/** Approved corner character of the field body. */
export const FIELD_RADIUS_PX = 14;
/** Grid column gap (`gap-2` = 0.5rem) separating the two field columns. */
export const COLUMN_GAP_PX = 8;

// ── Measured placement inside `.enquiry-contact-layer` ───────────────────────
// Both offsets are INVARIANT across every viewport measured. Derivation:
// each grid cell is label(16) + mb-1(4) + input(38) = 58px; two rows + 8px row
// gap = 124px; the layer is 184px with `align-items: center`, so the grid top
// is (184-124)/2 = 30px, and the top-left INPUT top is 30+16+4 = 50px.
//
// ⚠⚠ THAT DERIVATION DESCRIBES THE ORIGINAL CSS GRID AND IS KEPT AS HISTORY —
// it is how `FIELD_OFFSET_TOP_PX` = 50 was arrived at, and 50 is unchanged.
// ⛔ **But the "58px cell" no longer describes the ROW PITCH.** `ROW_PITCH_PX`
// was raised to 70 on 9 September 2026 to fix a label-proximity defect; see its
// own comment for the arithmetic. **The grid is no longer two equal 58px cells.**
/** Left offset of the field body from the contact layer's left edge. */
export const FIELD_OFFSET_LEFT_PX = 0;
/** Top offset of the field body from the contact layer's top edge. */
export const FIELD_OFFSET_TOP_PX = 50;

/**
 * Vertical pitch between row 1 and row 2 of the 2x2 grid.
 *
 * ⛔⛔ RAISED 58 -> 70 ON 9 September 2026. THE OLD VALUE PUT EVERY ROW-2 LABEL
 * CLOSER TO THE FIELD IT DOES NOT LABEL.
 *
 * ⚠⚠ THE ARITHMETIC, BECAUSE IT IS EXACT AND NOTHING CAUGHT IT FOR SIX WEEKS:
 * a row-2 label's gap ABOVE it is `pitch - FIELD_HEIGHT_PX - LABEL_BLOCK_PX`.
 * At 58 that is **58 - 38 - 20 = 0px**, against **4px** below (the `mb-1`).
 * ⛔ **So "Website URL" sat FLUSH against the Name box above it and 4px from its
 * own field.** Proximity is how the eye groups: the label bound upward, to the
 * wrong control. Same for "Email".
 *
 * ⛔ **At 70 it is 12px above / 4px below** — the label is three times closer to
 * the field it names. **Row 1 was never affected**; its labels have open space.
 *
 * ⚠ **FOUND BY A THIRD PARTY (Runable), NOT BY THIS PROJECT.** It measured the
 * rendered gaps at roughly 14px above / 8px below — the same defect read off
 * pixels including the line-box's internal leading, where this comment reads the
 * layout constants. **Different numbers, same conclusion.**
 *
 * ⚠ HEADROOM CHECKED, NOT ASSUMED. `.enquiry-contact-layer` is a FIXED
 * `height: 11.5rem` (184px) in `globals.css`, so the pair must fit inside it.
 * The block runs from row 1's label top to row 2's box bottom:
 * `LABEL_BLOCK_PX + FIELD_HEIGHT_PX + pitch` = 20 + 38 + 70 = **128px**, leaving
 * **28px margin each side**. ⛔ At 58 it was 116px / 34px. **Nothing overflows,
 * and the block stays centred because the layer is `align-items: center`.**
 *
 * ⚠⚠ THIS CONSTANT IS LOAD-BEARING BEYOND LAYOUT. It feeds `fieldPlacements`,
 * which feeds `sharedFieldWindow`, whose `spanY` sets the UV scale for the
 * texture — so **changing it changes the aspect at which the field plate must be
 * authored.** ⛔ **The plate was generated AFTER this change, at the new span.**
 * Any future change here obsoletes the plate and it must be re-generated.
 *
 * Row 2's input top is now 50 + 70 = 120, and the pair spans 50..158 inside the
 * 184px layer.
 */
export const ROW_PITCH_PX = 70;

/**
 * Field body width for a given contact-layer width. The layer spans the shared
 * `max-w-xl` shell, so this reproduces the recorded responsive rule
 * `(shellWidth - columnGap) / 2` — 284px at the full 576px desktop shell.
 */
export function fieldWidthPx(layerWidthPx: number): number {
  return (layerWidthPx - COLUMN_GAP_PX) / 2;
}

export type FieldPlacement = {
  /** Outer silhouette width in px/world units. */
  width: number;
  /** Outer silhouette height in px/world units. */
  height: number;
  /** Field centre X in world coords (origin = layer centre, +x right). */
  x: number;
  /** Field centre Y in world coords (origin = layer centre, +y UP). */
  y: number;
};

/**
 * Field centre in world coordinates, given the contact layer's measured CSS box.
 *
 * The DOM measures from the top-left with +y DOWN; Three.js measures from the
 * centre with +y UP. Hence the negation on y — the DOM-space centre offset
 * (-146, -23) and the world-space (-146, +23) describe the same point.
 *
 * At the full desktop layer (576 x 184): width 284, x = 142 - 288 = -146,
 * y = -(50 + 19 - 92) = +23.
 */
export function fieldPlacement(layerWidthPx: number, layerHeightPx: number): FieldPlacement {
  const width = fieldWidthPx(layerWidthPx);
  return {
    width,
    height: FIELD_HEIGHT_PX,
    x: FIELD_OFFSET_LEFT_PX + width / 2 - layerWidthPx / 2,
    y: -(FIELD_OFFSET_TOP_PX + FIELD_HEIGHT_PX / 2 - layerHeightPx / 2),
  };
}

// ── The 2x2 grid: all four field positions ───────────────────────────────────
/**
 * The four field slots, in the CASCADE ORDER the approved timing contract
 * specifies: Name -> Business name -> Website URL -> Email.
 *
 * That order is row-major (left, right, left, right), NOT column-major, and it
 * matters: the entrance delays are assigned by index, so reordering this array
 * silently retimes the cascade. `contact-form-current-timing-reference.md`
 * §Field-cascade contract is the source.
 *
 * `col`/`row` are grid indices; the world position is derived from them by
 * `fieldPlacements` so the two rows and two columns cannot drift apart.
 */
export const FIELD_SLOTS = [
  { id: "name", label: "Name", col: 0, row: 0 },
  { id: "business", label: "Business name", col: 1, row: 0 },
  { id: "website", label: "Website URL", col: 0, row: 1 },
  { id: "email", label: "Email", col: 1, row: 1 },
] as const;

export type FieldSlotId = (typeof FIELD_SLOTS)[number]["id"];

export type PlacedField = FieldPlacement & {
  id: FieldSlotId;
  /** Index in cascade order — 0..3. Drives the entrance delay. */
  order: number;
};

/**
 * All four field centres in world coordinates.
 *
 * Box 1 is IDENTICAL to what `fieldPlacement` returns — verified by
 * construction, since the col-0/row-0 terms are both zero and the expression
 * reduces to the same arithmetic. `fieldPlacement` is deliberately retained
 * rather than replaced: it is the approved single-field placement and other
 * callers (and the geometry proof) reference it.
 *
 * Column pitch is `width + COLUMN_GAP_PX`, so the pair spans the full layer
 * width at every responsive width with the approved 8px gutter between them —
 * the same rule the CSS 2-column grid applied.
 */
export function fieldPlacements(layerWidthPx: number, layerHeightPx: number): PlacedField[] {
  const width = fieldWidthPx(layerWidthPx);
  const colPitch = width + COLUMN_GAP_PX;

  return FIELD_SLOTS.map((slot, order) => ({
    id: slot.id,
    order,
    width,
    height: FIELD_HEIGHT_PX,
    x: FIELD_OFFSET_LEFT_PX + slot.col * colPitch + width / 2 - layerWidthPx / 2,
    y: -(FIELD_OFFSET_TOP_PX + slot.row * ROW_PITCH_PX + FIELD_HEIGHT_PX / 2 - layerHeightPx / 2),
  }));
}

// ── The shared field the four boxes are windows onto ─────────────────────────

/**
 * The rectangle all four boxes look through, in world coordinates.
 *
 * `originX`/`originY` are its bottom-left corner; `spanX`/`spanY` its extent.
 */
export type FieldWindow = {
  originX: number;
  originY: number;
  spanX: number;
  spanY: number;
};

/**
 * The invisible rectangle enclosing all four boxes — the surface they reveal.
 *
 * ⚠ THE MODEL, in Carl's words: *"I imagine an invisible rectangle around the 4
 * boxes. In that rectangle will be our gradient. On the second layer will be our
 * boxes. They act as 'windows' to let the gradient through. So no boxes the same.
 * No boxes with a slight variation of the same idea."*
 *
 * This is materially different from the D-028 approach of five AUTHORED glass
 * variants rotated across cards. Here there is ONE field and four apertures: the
 * variation is not authored per box, it FALLS OUT OF POSITION. Move a box and its
 * appearance changes, because it is looking at a different part of the field.
 * The boxes are therefore related by construction and cannot drift out of
 * alignment with each other.
 *
 * ⚠ DERIVED FROM `fieldPlacements` OUTPUT, never from the constants directly.
 * Re-deriving the bounds from `FIELD_OFFSET_TOP_PX`, `ROW_PITCH_PX` and the rest
 * would create a second copy of the placement maths that could silently disagree
 * with the first. If the boxes move, this window moves with them by construction.
 *
 * At the standard 576 x 184 layer this returns origin (-288, -66), span 576 x 108
 * — the outer rim silhouettes of the four boxes, exactly spanning the layer width
 * with the 8px gutter inside it.
 *
 * ⛔ **576 x 96 UNTIL 9 September 2026.** `ROW_PITCH_PX` 58 -> 70 moved `spanY`
 * 96 -> 108, which changes the PLATE ASPECT from 6.00:1 to **5.33:1**. ⚠ **The
 * field texture is authored to this ratio — see `FIELD_TEX_W`/`FIELD_TEX_H`.**
 *
 * Note the y range is NOT symmetric about the
 * layer centre (+42 to -54): the DOM grid it inherits was centred on label+input
 * cells rather than on the inputs alone. That asymmetry is correct and inherited,
 * not a defect.
 */
// ── The DOM side: real text inputs positioned over the WebGL boxes ───────────

/**
 * The label's reserved vertical block above each input: 16px line-height + 4px
 * gap = 20px.
 *
 * ⚠ NOT A NEW MEASUREMENT. It is the label term already decomposed in the
 * comment above `FIELD_OFFSET_LEFT_PX` — `50 = 30 + 16 + 4` — given a name so the
 * DOM layer can position labels without re-deriving it. `FIELD_OFFSET_TOP_PX`
 * and `ROW_PITCH_PX` were both computed INCLUDING this block, so the 20px slot
 * above every box already exists and is empty. **Adding labels shifts nothing.**
 *
 * ⚠ IT HOLDS ONLY AT 12px/16px TYPE (Tailwind `text-xs`). `text-sm` is 14px/20px
 * and would overflow the reserved slot — and because the label is absolutely
 * positioned, it would simply overlap with nothing on screen to signal it.
 * Recorded in `live-work/contact-form-current-geometry-reference.md`.
 */
export const LABEL_BLOCK_PX = 20;

/** One field's box in DOM space, relative to `.enquiry-contact-layer`'s top-left. */
export type DomPlacement = {
  id: FieldSlotId;
  /** Index in cascade order — 0..3. Matches `PlacedField.order`. */
  order: number;
  /** px from the layer's LEFT edge. */
  left: number;
  /** px from the layer's TOP edge. */
  top: number;
  width: number;
  height: number;
  /** px from the layer's top edge to the LABEL's top — `top - LABEL_BLOCK_PX`. */
  labelTop: number;
};

/**
 * The four field boxes in DOM coordinates, for positioning real inputs over the
 * WebGL geometry.
 *
 * ⚠ THIS IS ONLY VALID BECAUSE 1 WORLD UNIT == 1 CSS PIXEL. The canvas uses an
 * orthographic camera at `zoom: 1`, so R3F sets the frustum from the measured
 * CSS size and the mapping is exact at every viewport width. See the header of
 * `contact-field-canvas.tsx`.
 *
 * ⚠ DERIVED BY INVERTING `fieldPlacements` OUTPUT, never re-derived from the
 * constants — the same rule `sharedFieldWindow` follows, and for the same reason
 * it states: re-deriving from `FIELD_OFFSET_TOP_PX`, `ROW_PITCH_PX` and the rest
 * would create a SECOND COPY of the placement maths that could silently disagree
 * with the first.
 *
 * The temptation here is stronger than usual, because the DOM form these boxes
 * replaced was a CSS grid and reproducing that grid looks like the obvious move.
 * ⚠ **It is the wrong move.** A grid expresses the placement in a second
 * language: it would agree today by coincidence of shared inputs, and a change to
 * `ROW_PITCH_PX` would move the WebGL boxes and leave the DOM inputs behind, with
 * nothing to catch it. Inverting one source makes that **structurally
 * impossible** rather than a thing to remember.
 *
 * The inversion: world space has its origin at the layer CENTRE with +y UP; DOM
 * space has its origin at the top-left with +y DOWN.
 */
export function fieldDomPlacements(
  layerWidthPx: number,
  layerHeightPx: number,
): DomPlacement[] {
  return fieldPlacements(layerWidthPx, layerHeightPx).map((p) => {
    const top = layerHeightPx / 2 - p.y - p.height / 2;
    return {
      id: p.id,
      order: p.order,
      left: p.x + layerWidthPx / 2 - p.width / 2,
      top,
      width: p.width,
      height: p.height,
      labelTop: top - LABEL_BLOCK_PX,
    };
  });
}

export function sharedFieldWindow(layerWidthPx: number, layerHeightPx: number): FieldWindow {
  const placements = fieldPlacements(layerWidthPx, layerHeightPx);

  const minX = Math.min(...placements.map((p) => p.x - p.width / 2));
  const maxX = Math.max(...placements.map((p) => p.x + p.width / 2));
  const minY = Math.min(...placements.map((p) => p.y - p.height / 2));
  const maxY = Math.max(...placements.map((p) => p.y + p.height / 2));

  return {
    originX: minX,
    originY: minY,
    spanX: maxX - minX,
    spanY: maxY - minY,
  };
}
