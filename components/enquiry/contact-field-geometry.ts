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
/** Left offset of the field body from the contact layer's left edge. */
export const FIELD_OFFSET_LEFT_PX = 0;
/** Top offset of the field body from the contact layer's top edge. */
export const FIELD_OFFSET_TOP_PX = 50;

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
