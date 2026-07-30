"use client";

/**
 * Contact-field mesh — ONE compound field object built from three concentric
 * sub-meshes that are read as a single assembly:
 *
 *   RIM   — outermost structural edge. Its silhouette IS the approved
 *           284 x 38 outer footprint; nothing may extend beyond it.
 *   BEVEL — the transition surface, inset inside the rim.
 *   FACE  — the calm, broad, shallow-convex writing plane, inset inside the bevel.
 *
 * All three derive from ONE rounded-rectangle profile (`roundedRectShape`) at
 * three different insets, so their silhouettes nest concentrically at every
 * responsive width. The FACE is a genuinely rounded-rectangle tessellated
 * surface — NOT a rectangular plane relying on the bevel to hide square
 * corners. See `roundedRectFaceGeometry` for why that distinction matters.
 *
 * Geometry proof only: neutral three-tone diagnostic material, no colour
 * direction, no transmission/clearcoat/environment map, no animation, no
 * interaction. All values are named constants so later tuning is a value
 * change, not a rewrite.
 */

import { useMemo, useEffect } from "react";
import * as THREE from "three";
import {
  FIELD_RADIUS_PX,
  type FieldPlacement,
  type FieldWindow,
} from "./contact-field-geometry";

// ── Depth stack (world units == CSS px) ──────────────────────────────────────
// Shallow by design: ~8.7 units of total depth on a 38-unit-tall object.
const RIM_DEPTH = 6;
const BEVEL_DEPTH = 2;
const BEVEL_THICKNESS = 1.5;
const BEVEL_SEGMENTS = 4;
/**
 * Requested bevel width on the bevel ring's profile.
 *
 * Deliberately small. `bevelSize` is paid TWICE on a ring with an aperture: once
 * outward on the outer edge, and again INWARD on the hole edge (ExtrudeGeometry
 * bevels holes too). The aperture must clear the face boundary, so it is opened
 * by `FACE_APERTURE_MARGIN + bevelSize` per side — and with only ~1px of band
 * between FACE_INSET (4.5) and BEVEL_INSET + bevelSize, a large bevelSize makes
 * the opening swallow the bevel ring entirely (measured: at bevelSize 2 the
 * aperture reached 34.20 against a 31.00 ring — no ring left).
 *
 * At 0.5 the ring survives with ~1.4px of band AND the aperture clears the face
 * by 0.62px. The bevel's visible softness comes mainly from BEVEL_THICKNESS
 * (its z-depth), which is unchanged, so the approved look is preserved.
 */
const BEVEL_SIZE = 0.5;

// Concentric insets from the outer silhouette. The rim is the outer boundary
// (inset 0), so the approved footprint is never expanded by the bevel or crown.
//
// IMPORTANT: `ExtrudeGeometry` grows a bevelled profile OUTWARD by `bevelSize`
// on every side. The bevel's shape must therefore be inset by
// `BEVEL_INSET + bevelSize` so that the finished geometry lands at
// BEVEL_INSET inside the rim rather than protruding past it. Measured before
// this correction: bevel half-extent 142.5 vs rim 142.0 — i.e. the bevel was
// 0.5px WIDER than the approved silhouette on each side.
const BEVEL_INSET = 1.5;
const FACE_INSET = 4.5;

/** Height of the shallow convex crown above the face's base plane. */
const CROWN_HEIGHT = 1.2;
/**
 * Fraction of the LONG axis held at full crown height before rolling off into
 * the end caps. Keeps the writing plane broad and calm rather than letting the
 * crown taper to a point at both ends (which reads as an elliptical blister).
 */
const CROWN_PLATEAU_U = 0.72;
/**
 * How far (in world units) the face's base plane sits below the bevel's front
 * plane. Small and absolute — just enough to tuck the junction inside the
 * aperture so it cannot gap or z-fight, without burying the face's boundary.
 */
const FACE_SEAM_SINK = 0.35;
/**
 * How far the bevel's aperture is opened beyond the face boundary, so the
 * face's own edge is never clipped by the opening it shows through.
 */
const FACE_APERTURE_MARGIN = 0.6;

// Face tessellation. Segment counts follow the ~7.5:1 aspect so quads stay near
// square — long thin quads shade anisotropically and would betray the crown.
const FACE_SEG_X = 96;
const FACE_SEG_Y = 16;

/** Corner smoothness for the extruded rim/bevel profiles. */
const SHAPE_CURVE_SEGMENTS = 16;

// ── Neutral diagnostic material — RIM and FACE only ──────────────────────────
// Deliberately achromatic. The rim and the convex writing face remain a
// geometry proof: no hue on either, so neither pre-empts a material decision
// that has not been made. Only the BEVEL carries a material sample (below).
const DIAG_FACE_COLOR = "#8a8a8a";
const DIAG_RIM_COLOR = "#6a6a6a";

// ── PROVISIONAL satin-gold material — BEVEL MESH ONLY ────────────────────────
// First material sample, not a calibration. Reference: the official C2B
// polished-gold logo — deliberately the same METAL FAMILY, but sat lower in the
// visual hierarchy: darker and rougher than the logo, so it reads as
// architectural satin gold rather than a second hero mark.
//
// Character being aimed at: warm gold body, deeper bronze-gold in the shadow
// side of the tube, restrained champagne where the existing key light grazes
// it. Metallic — not yellow paint — so `metalness` stays at 1 and the colour
// does the work; on a metal, `color` tints the REFLECTION rather than acting as
// a diffuse albedo, which is what makes it read as metal at all.
//
// Roughness is the main character control. Too low reads as liquid chrome and
// throws a hard specular hit; too high goes chalky and dead. ~0.34 keeps the
// highlight travelling smoothly AROUND the tubular bevel (the point of the
// geometry) while staying satin rather than mirror.
//
// METALNESS is now 1.0 — genuinely metallic.
//
// Previously it was held at 0.55 because the scene had NO environment map. In
// standard PBR the diffuse term scales by (1 - metalness), so a full metal has
// no diffuse and can only show what it REFLECTS; with nothing to reflect, the
// bevel rendered near-black (measured warmth R-B = 5, i.e. visually neutral).
// Lowering metalness was a workaround for that absence, not a material choice.
//
// A local procedural studio environment now exists (see `StudioEnvironment` in
// contact-field-canvas.tsx — generated on the GPU, no HDRI/CDN/network), so the
// metal finally has a surrounding to reflect and metalness returns to 1.0 as
// the earlier note said it should.
//
// COLOUR — the CHAMPAGNE band of the logo gold, 28 July 2026.
//
// ── Why not the logo's median ────────────────────────────────────────────────
// A first attempt used #b07828, the mid-band mean of 149,431 sampled logo
// pixels. It rendered as copper: measured #562b03 at luminance 49, against a
// logo body of 125 and champagne of 195. Roughly 2.5x too dark WITH THE LOGO'S
// OWN AVERAGE ALREADY APPLIED.
//
// The sampling was correct; the ROLE was wrong. The logo mark is mostly bright
// gold with thin dark edges, so its median is dragged down by shadow lines and
// anti-aliased pixels against black. That median is the logo's AVERAGE, not the
// logo's GOLD. Feeding an average into a metal's reflectance tint reproduces the
// shadow end of the range, never the gold.
//
// Sampled bands, for reference:
//   5th pct  #603d11   shadow gold — narrow, only where the tube turns away
//   50th pct #ad772d   median (dragged low by edges)
//   75th pct #f2bf61   CHAMPAGNE — the gold the eye actually reads  ← this value
//   95th pct #f6f7ec   blown specular, effectively white
//
// ── What Carl's video reference establishes ──────────────────────────────────
// Four frames of the logo under a travelling light. The takeaway, in his words:
// *"observe how light interacts with gold."*
//
//   1. The base at rest is ALREADY BRIGHT — champagne, not bronze. Deep tones are
//      confined to narrow shadow lines.
//   2. The glint goes to WHITE, not to brighter gold. It is a specular highlight
//      above the base, not a colour change.
//   3. Therefore the base must sit high enough that a highlight has somewhere to
//      go. A bronze base asks the light to CREATE the gold, which reads as a
//      colour shift rather than light travelling across a gold surface.
//
// ── The constraint that colour alone cannot solve ────────────────────────────
// `metalness: 1.0` means `color` tints the REFLECTION; it is not paint. A metal
// can only be as bright as its surroundings. This scene's surroundings are two
// panels (see ENV_KEY_INTENSITY / ENV_FILL_INTENSITY in contact-field-canvas),
// so raising the colour alone cannot reach champagne — there is not enough
// radiance to tint. The environment is raised in the same change for that
// reason, and that is the load-bearing half.
//
// ROUGHNESS unchanged at the baseline. Carl: *"lets keep the .34 see how it
// looks first."*
//
// ⚠ STILL A ROUGH MIX, not a calibration. Carl's method is to get elements
// sitting right first, then go back and get granular. The orbiting light, its
// on/off glint (a few hundred ms), the coupled bloom, and the opal's
// backlit response are all still to come, and the base will be re-judged
// against them — a value that reads well statically may not once light moves.
//
// Deliberately absent: emissive, clearcoat, transmission, textures, noise,
// bloom/glow. All named so a later calibration pass is a value change.
const GOLD_BEVEL_COLOR = "#f2bf61"; // logo champagne — the gold the eye reads
const GOLD_BEVEL_ROUGHNESS = 0.34; // UNCHANGED baseline — Carl: keep .34 for now
const GOLD_BEVEL_METALNESS = 1.0; // genuinely metallic, now that a reflection env exists
/**
 * How strongly the bevel samples the studio environment. The only value tuned
 * in this step, and only far enough to make the metallic body readable.
 *
 * Left at 1.0: because the map is applied to this material alone, the studio's
 * own panel intensities already set the level and there is no scene-wide
 * brightening to compensate for.
 */
export const GOLD_BEVEL_ENV_INTENSITY = 1.0;

/**
 * Every material starts fully TRANSPARENT and is faded up by the canvas on the
 * approved cascade (`FIELD_ENTRANCE_DELAYS_MS` in contact-field-canvas.tsx).
 *
 * Starting at 0 rather than 1 matters: the boxes must not be visible before
 * their own entrance begins. The former single-box build faded the whole LAYER
 * in CSS, so there was nothing to hide; with four independent entrances the
 * hiding has to happen per box.
 *
 * ⚠ WHY `transparent` AND `depthWrite: false` TOGETHER. `transparent` alone is
 * not enough and the failure is visible: a transparent mesh that still writes
 * depth occludes whatever is drawn after it, so a box at opacity 0 would punch
 * a hole in the boxes behind it — and the rim/bevel/face of a single assembly
 * are three overlapping meshes at different z, so it would also fight itself
 * during its own fade. Disabling depth writes lets the three sub-meshes blend in
 * their draw order, which for a concentric stack viewed head-on under an
 * orthographic camera is the correct back-to-front order already (rim at z=0,
 * bevel at RIM_DEPTH, face above it).
 */
const ENTRANCE_START_OPACITY = 0;

/**
 * The face and rim must NOT respond to the studio environment — this proof is
 * isolated to the bevel. The map is applied ONLY to the bevel material (never
 * to `scene.environment`), so they are excluded by construction; their
 * `envMapIntensity` is additionally pinned to 0 as an explicit guard, in case a
 * scene-wide environment is ever introduced later. Colour, roughness and
 * geometry are untouched either way.
 */
const NO_ENV_RESPONSE = 0;

/**
 * Rounded-rectangle profile, centred on the origin.
 *
 * Corners are TRUE CIRCULAR ARCS (`absarc`), matching CSS `border-radius`.
 * A `quadraticCurveTo` with the control point at the box corner — the obvious
 * shortcut — is NOT equivalent: it passes measurably inside a quarter circle,
 * producing corners subtly squarer than the approved 14px CSS radius. That
 * approximation was used in the first implementation and is corrected here.
 *
 * `radius` is clamped to half of the smaller side. At the field's 7.5:1 aspect
 * the 14px radius is already 74% of the 19px half-height, so this clamp is a
 * real backstop rather than a formality.
 */
function roundedRectShape(width: number, height: number, radius: number): THREE.Shape {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  const hw = width / 2;
  const hh = height / 2;

  const shape = new THREE.Shape();
  shape.moveTo(-hw + r, -hh);
  shape.lineTo(hw - r, -hh);
  shape.absarc(hw - r, -hh + r, r, -Math.PI / 2, 0, false);
  shape.lineTo(hw, hh - r);
  shape.absarc(hw - r, hh - r, r, 0, Math.PI / 2, false);
  shape.lineTo(-hw + r, hh);
  shape.absarc(-hw + r, hh - r, r, Math.PI / 2, Math.PI, false);
  shape.lineTo(-hw, -hh + r);
  shape.absarc(-hw + r, -hh + r, r, Math.PI, (3 * Math.PI) / 2, false);
  return shape;
}

/**
 * Half-width of a true rounded-rectangle profile at height `y` (measured from
 * the profile's centre). Inside the straight section this is the full
 * half-width; within the corner band it follows the circular arc.
 *
 * Shared by the face generator so the face's boundary is the SAME curve as the
 * rim and bevel profiles, rather than an independent approximation.
 */
function roundedRectHalfWidthAt(y: number, halfW: number, halfH: number, r: number): number {
  const absY = Math.abs(y);
  if (absY <= halfH - r) return halfW;
  const dy = Math.min(absY - (halfH - r), r);
  return halfW - r + Math.sqrt(Math.max(0, r * r - dy * dy));
}

/**
 * Corner radius for an inset copy of the profile. A true parallel inward offset
 * of a rounded rectangle reduces the corner radius by the inset distance, so
 * the nested silhouettes stay concentric instead of drifting toward square.
 */
function insetRadius(inset: number): number {
  return Math.max(2, FIELD_RADIUS_PX - inset);
}

/**
 * Bevel size, clamped so the extrusion cannot degenerate.
 *
 * `ExtrudeGeometry` erodes the profile inward by `bevelSize`, so as bevelSize
 * approaches the corner radius the corners first go sharp and then
 * self-intersect (pinched / inverted corners). Capping at a quarter of the
 * radius keeps corners well inside that failure. This is enforced in CODE, not
 * in a comment, so a later tuning pass cannot silently break the corners by
 * turning a number up.
 */
function safeBevelSize(desired: number, radius: number): number {
  return Math.min(desired, 0.25 * radius);
}

/**
 * Shallow convex crown height at normalised position (u, v), each in [-1, 1].
 *
 * SEPARABLE, not radial. Each axis is treated INDEPENDENTLY. A radial dome (a
 * function of sqrt(u^2+v^2)) would read as a circular blister in the middle of
 * a long field and fall away far too fast across the short axis.
 *
 * The SHORT axis (v) carries the cylindrical crown, using a RAISED cosine
 * `(1 + cos(v*pi)) / 2`. Note this is NOT plain `cos(v*pi/2)`: that reaches zero
 * height at the boundary but with MAXIMUM slope, so the face would meet the
 * aperture on a hard crease. The raised cosine reaches zero height AND zero
 * slope at |v| = 1, which is the tangent-smooth junction the design intends.
 * (Corrected after a checkpoint review flagged the original claim as
 * mathematically wrong — it was previously hidden by the bevel occlusion.)
 *
 * The LONG axis (u) is a PLATEAU, not a cosine. A cosine along u drives the
 * crown to zero at both ends, so the lit region tapers to a point and the face
 * renders as an elliptical blister instead of a writing plane (observed in the
 * first render). Instead the crown stays at full height across the central span
 * and only rolls off inside the last `1 - CROWN_PLATEAU_U` of each end, giving
 * the long, calm, broad plane the design calls for while still easing into the
 * end caps.
 */
function crownZ(u: number, v: number): number {
  const au = Math.min(Math.abs(u), 1);
  let longAxis = 1;
  if (au > CROWN_PLATEAU_U) {
    // Remap the roll-off band to [0,1], then use the same raised cosine so the
    // plateau meets the roll-off — and the roll-off meets the end cap — with
    // matching zero slope at both ends.
    const t = (au - CROWN_PLATEAU_U) / (1 - CROWN_PLATEAU_U);
    longAxis = (1 + Math.cos(t * Math.PI)) / 2;
  }
  const av = Math.min(Math.abs(v), 1);
  const shortAxis = (1 + Math.cos(av * Math.PI)) / 2;
  return CROWN_HEIGHT * longAxis * shortAxis;
}

/**
 * Genuinely rounded-rectangle, indexed, tessellated face surface.
 *
 * WHY NOT a plain `PlaneGeometry`: a rectangular plane has square corners. Even
 * inset under the bevel, those corners are only *hidden* — a masking illusion
 * that fails the moment the camera, lighting or material changes (and it would
 * protrude past a rounded bevel at the corners, since a rectangle's corner
 * reaches further than the rounded profile it sits inside).
 *
 * WHY NOT `ShapeGeometry` + `TessellateModifier`: `TessellateModifier` subdivides
 * by edge length and returns a NON-INDEXED geometry, so `computeVertexNormals`
 * cannot average across shared vertices and the crown would shade faceted.
 *
 * INSTEAD: sample a regular (FACE_SEG_X + 1) x (FACE_SEG_Y + 1) grid and map each
 * row onto the rounded-rect boundary. For each row we compute the profile's
 * half-width at that height and scale the row's x span to it. The result has a
 * genuinely rounded silhouette, stays strictly inside the bevel opening at every
 * width, and remains INDEXED — so `computeVertexNormals()` produces the smooth
 * crown the design calls for.
 */
function roundedRectFaceGeometry(
  width: number,
  height: number,
  radius: number,
  /** This box's centre in world coordinates, from `fieldPlacements`. */
  centreX: number,
  centreY: number,
  /** The shared field all four boxes are windows onto, from `sharedFieldWindow`. */
  field: FieldWindow,
): THREE.BufferGeometry {
  const halfW = width / 2;
  const halfH = height / 2;
  const r = Math.max(0, Math.min(radius, halfW, halfH));

  // ── The aspect correction, baked into the UVs ──────────────────────────────
  // The field's world aspect changes with viewport width (6:1 at the 576px
  // desktop layer, ~3:1 at 300px) because width flexes while height is fixed at
  // 96 units. Left uncorrected, arcs drawn as circles in the texture would render
  // as ellipses that change eccentricity with the viewport.
  //
  // ⚠ BAKED HERE RATHER THAN CARRIED IN `texture.repeat`/`offset`, deliberately.
  // `map` and `normalMap` have INDEPENDENT transform uniforms in three, so setting
  // `repeat` on one does not set it on the other — the relief would silently slide
  // off the colour, and nothing would catch it but the eye. Baking makes that
  // desync structurally impossible instead of a thing to remember.
  //
  // The cost is nil: this geometry ALREADY rebuilds on every resize (`useMemo` on
  // [width, height] at the call site), so the UVs were never durable across resize
  // in the first place. The TEXTURE still never regenerates, which was the goal.
  //
  // The short axis is the invariant one — always 96 world units — so it is the
  // reference. v spans 0..1 across it; u is scaled to match its world density, so
  // one UV unit covers the same world distance on both axes.
  const uPerWorld = 1 / field.spanY;

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let iy = 0; iy <= FACE_SEG_Y; iy++) {
    const ty = iy / FACE_SEG_Y; // 0..1 top->bottom
    const y = halfH - ty * height; // +halfH .. -halfH

    // Half-width of the rounded-rect profile at this height, from the SHARED
    // helper — the same circular-arc curve used by the rim and bevel profiles,
    // so the face's boundary cannot drift from theirs.
    const rowHalfW = roundedRectHalfWidthAt(y, halfW, halfH, r);

    for (let ix = 0; ix <= FACE_SEG_X; ix++) {
      const tx = ix / FACE_SEG_X; // 0..1 left->right
      const x = (tx * 2 - 1) * rowHalfW;

      // Crown is evaluated on the FULL-extent normalised coordinates, so the
      // dome profile is a property of the field as a whole rather than of each
      // row's clipped span — otherwise corner rows would dome as steeply as the
      // centre and the crown would look pinched at the ends.
      positions.push(x, y, crownZ(x / halfW, y / halfH));

      // ── UV = this vertex's position within the SHARED FIELD ────────────────
      // ⚠ NOT `(tx, 1 - ty)`. That gave every box a full [0,1] tile, so all four
      // would sample identical texture — four copies of one crop, which is
      // exactly what the windows model is not. Deriving from world position is
      // what makes the four boxes show four different regions of one field.
      //
      // ⚠ AND THE `1 - ty` FLIP IS GONE. World +y is up and UV +v is up, so
      // deriving v from world y directly is already correct; keeping the flip
      // would mirror the field vertically.
      //
      // This also removes a latent defect. Corner rows are 93.1% as wide as the
      // centre but previously consumed 100% of u, stretching any texture ~7% in
      // the corner band. `x` is already arc-clipped, so deriving u from it fixes
      // that by construction rather than by correction.
      uvs.push(
        (centreX + x - field.originX) * uPerWorld,
        (centreY + y - field.originY) / field.spanY,
      );
    }
  }

  const rowStride = FACE_SEG_X + 1;
  for (let iy = 0; iy < FACE_SEG_Y; iy++) {
    for (let ix = 0; ix < FACE_SEG_X; ix++) {
      const a = iy * rowStride + ix;
      const b = a + 1;
      const c = a + rowStride;
      const d = c + 1;
      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setIndex(indices);
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  // Indexed + shared vertices => smooth averaged normals across the crown.
  geometry.computeVertexNormals();
  return geometry;
}

/** Dispose a geometry when it is replaced or the canvas unmounts. */
function useDisposable(geometry: THREE.BufferGeometry) {
  useEffect(() => () => geometry.dispose(), [geometry]);
}

/**
 * The single compound contact-field object: rim + bevel + face, positioned by
 * the measured placement. One visible field assembly — no placeholders, no
 * labels, no inputs, no preview objects.
 */
export function ContactField({
  placement,
  field,
  bevelMaterialRef,
  groupRef,
}: {
  placement: FieldPlacement;
  /**
   * The shared field this box is a window onto — see `sharedFieldWindow`.
   *
   * Passed in rather than derived here: the box must not know how to compute the
   * field, only which one it belongs to. All four boxes receive the SAME window,
   * which is what makes them apertures onto one surface instead of four
   * independently-textured tiles.
   */
  field: FieldWindow;
  /**
   * Receives the bevel's material so the canvas can attach the locally
   * generated studio radiance map to it — and only to it — and detach it again
   * on teardown. The face and rim materials are never exposed this way.
   */
  bevelMaterialRef?: React.Ref<THREE.MeshStandardMaterial>;
  /**
   * Receives the assembly's root group so the canvas can drive this ONE box's
   * entrance opacity independently of the other three.
   *
   * The opacity is applied to the three materials, not to the group (Three.js
   * groups have no opacity), but the group is the honest handle: it is what
   * "this box" means. The canvas walks its children — see `setFieldOpacity` in
   * contact-field-canvas.tsx.
   */
  groupRef?: React.Ref<THREE.Group>;
}) {
  const { width, height, x, y } = placement;

  // ── RIM — outer silhouette. Defines the approved 284 x 38 footprint. ──
  const rimGeometry = useMemo(() => {
    const shape = roundedRectShape(width, height, FIELD_RADIUS_PX);
    return new THREE.ExtrudeGeometry(shape, {
      depth: RIM_DEPTH,
      bevelEnabled: false,
      curveSegments: SHAPE_CURVE_SEGMENTS,
    });
  }, [width, height]);

  // ── BEVEL — inset transition surface, bevelled at the front, with a real
  // APERTURE cut through it at the face boundary.
  //
  // The profile is shrunk by an EXTRA `bevelSize` on each side, because the
  // bevel expands the finished geometry outward by exactly that amount. The
  // result sits BEVEL_INSET inside the rim, as intended.
  //
  // The hole matters: without it the bevel has a solid front cap, the face sits
  // behind that cap, and only the part of the crown that rises above the cap is
  // visible. The visible inner boundary would then be an ISO-HEIGHT INTERSECTION
  // CONTOUR between crown and cap — not the face's own outline — which is
  // exactly the masking illusion this design must avoid: it changes shape with
  // crown height and would come apart under a different camera or a
  // transmissive material. Cutting a true aperture at the face boundary means
  // the face is seen THROUGH an opening and presents its own rounded-rectangle
  // silhouette. (Found by checkpoint review and independently confirmed:
  // only the central ~63% of the face's short axis was clearing the cap.)
  const bevelGeometry = useMemo(() => {
    const radius = insetRadius(BEVEL_INSET);
    const bevelSize = safeBevelSize(BEVEL_SIZE, radius);
    const shrink = (BEVEL_INSET + bevelSize) * 2;
    const shape = roundedRectShape(
      width - shrink,
      height - shrink,
      Math.max(2, radius - bevelSize),
    );

    // Aperture: a genuine OUTWARD parallel offset of the face boundary, so the
    // face's complete outline is visible through it and the opening never
    // defines the visible contour.
    //
    // Two effects must both be paid for, or the opening ends up SMALLER than the
    // face and re-masks it:
    //   1. the intended clearance beyond the face boundary; and
    //   2. `bevelSize` — ExtrudeGeometry bevels HOLES inward, so the frontmost
    //      opening is `bevelSize` tighter on every side than its source profile.
    // Both are added here, so the source hole is enlarged by
    // (margin + bevelSize) per side and the FRONT opening lands clear of the
    // face. Measured before this correction: the front aperture edge sat at
    // |y| 11.900 against a face half-height of 14.500 — the face's outer 2.6px
    // was masked all round, so the opening still defined the visible contour.
    // Verified after, by ray-casting the GENERATED mesh along the orthographic
    // view axis at 284/272/167 widths: front occlusion edge |y| 15.120 vs face
    // 14.500 => +0.620 clearance, and +1.100 worst case around the whole
    // boundary INCLUDING the corners, with the bevel ring still 1.4px wide.
    const apertureOffset = FACE_APERTURE_MARGIN + bevelSize;
    const holeW = width - FACE_INSET * 2 + apertureOffset * 2;
    const holeH = height - FACE_INSET * 2 + apertureOffset * 2;
    if (holeW > 0 && holeH > 0) {
      shape.holes.push(
        roundedRectShape(holeW, holeH, Math.max(2, insetRadius(FACE_INSET) + apertureOffset)),
      );
    }

    return new THREE.ExtrudeGeometry(shape, {
      depth: BEVEL_DEPTH,
      bevelEnabled: true,
      bevelSize,
      bevelThickness: BEVEL_THICKNESS,
      bevelSegments: BEVEL_SEGMENTS,
      curveSegments: SHAPE_CURVE_SEGMENTS,
    });
  }, [width, height]);

  // ── FACE — rounded-rectangle convex writing plane, inset inside the bevel. ──
  // ⚠ The dependency array now carries the FIELD as well as the box's own size:
  // the UVs encode position within the shared field, so a change to the field —
  // which happens on every responsive resize — must rebuild them. Omitting it
  // would leave the four boxes sampling a field that no longer matches the layout.
  const faceGeometry = useMemo(
    () =>
      roundedRectFaceGeometry(
        width - FACE_INSET * 2,
        height - FACE_INSET * 2,
        insetRadius(FACE_INSET),
        x,
        y,
        field,
      ),
    [width, height, x, y, field],
  );

  // Face z is DERIVED from the bevel's real front plane, never assumed. A
  // bevelled extrusion spans -bevelThickness .. depth (not 0 .. depth), so
  // hand-arithmetic put the face BEHIND the bevel front and the writing plane
  // was completely hidden — the object rendered as a flat slab. Measuring the
  // bevel's actual bounding box removes that whole class of error.
  //
  // The face's BASE now sits just below the bevel's front plane while its whole
  // boundary shows through the aperture cut above. The small sink keeps the
  // junction tucked inside the opening (no gap, no coplanar z-fighting) without
  // burying the face's outline, so the visible inner shape is the face's own
  // rounded rectangle rather than a crown/cap intersection contour.
  const faceBaseZ = useMemo(() => {
    bevelGeometry.computeBoundingBox();
    const bevelFrontZ = RIM_DEPTH + (bevelGeometry.boundingBox?.max.z ?? BEVEL_DEPTH);
    return bevelFrontZ - FACE_SEAM_SINK;
  }, [bevelGeometry]);

  useDisposable(rimGeometry);
  useDisposable(bevelGeometry);
  useDisposable(faceGeometry);

  return (
    <group ref={groupRef} position={[x, y, 0]}>
      {/* Rim and bevel keep ExtrudeGeometry's own hard-edged normals. Running
          computeVertexNormals() on them would average across the extrusion
          edges and smear the rim into the face, destroying the structurally
          distinct rim the design requires. */}
      {/* Rim — diagnostic grey, unchanged. envMapIntensity 0 keeps it out of
          the studio environment so the reflection proof stays on the bevel. */}
      <mesh geometry={rimGeometry} position={[0, 0, 0]}>
        <meshStandardMaterial
          color={DIAG_RIM_COLOR}
          roughness={0.65}
          metalness={0}
          envMapIntensity={NO_ENV_RESPONSE}
          transparent
          opacity={ENTRANCE_START_OPACITY}
          depthWrite={false}
        />
      </mesh>

      {/* BEVEL — the only mesh carrying a material sample. Provisional satin
          gold; the rim above and the face below stay diagnostic grey so the
          gold can be judged soloed against the approved geometry and the
          existing key/fill/ambient rig. Geometry, aperture and lighting are
          untouched by this material change. */}
      <mesh geometry={bevelGeometry} position={[0, 0, RIM_DEPTH]}>
        <meshStandardMaterial
          ref={bevelMaterialRef}
          color={GOLD_BEVEL_COLOR}
          roughness={GOLD_BEVEL_ROUGHNESS}
          metalness={GOLD_BEVEL_METALNESS}
          envMapIntensity={GOLD_BEVEL_ENV_INTENSITY}
          transparent
          opacity={ENTRANCE_START_OPACITY}
          depthWrite={false}
        />
      </mesh>

      {/* Face — diagnostic grey, unchanged. Also held out of the environment. */}
      <mesh geometry={faceGeometry} position={[0, 0, faceBaseZ]}>
        <meshStandardMaterial
          color={DIAG_FACE_COLOR}
          roughness={0.55}
          metalness={0}
          envMapIntensity={NO_ENV_RESPONSE}
          transparent
          opacity={ENTRANCE_START_OPACITY}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
