"use client";

/**
 * /about §2 role-card mesh — ONE compound object from three concentric parts,
 * read as a single assembly:
 *
 *   RIM   — a HALF-TUBE swept along the card's rounded-rectangle perimeter. Its
 *           outermost point IS the silhouette; nothing extends beyond it.
 *   BEVEL — a swept band, sloping inward and TOWARD THE VIEWER.
 *   FACE  — a convex plane whose apex stands PROUD of the rim.
 *
 * All three sit on ONE sampled path at different insets, so their silhouettes
 * are true parallel offsets and cannot drift apart. ⛔ The construction is
 * deliberately the answer card's, not the contact field's — see the rim note.
 *
 * ⛔⛔ CHUNK 1: GEOMETRY PROOF ONLY. Three-tone diagnostic material. No glass, no
 * neon, no transmission, no text, no room. Carl, 11 September 2026: *"Don't put
 * glass in yet, use a placeholder material."*
 *
 * ⚠ AND THE DIAGNOSTIC IS AN INSTRUMENT, NOT A STAND-IN. `answer-card-mesh.tsx`
 * records a defect that *"was only findable under a diagnostic material, because
 * a blue-tinted card"* concealed it. Three flat tones make each surface's
 * orientation legible; a material would start answering a question not yet asked.
 *
 * ⚠ THE HELPERS BELOW ARE COPIED FROM `answer-card-mesh.tsx`, NOT IMPORTED — and
 * that file, unlike `answer-card-glass.ts`, is NOT protected (verified against
 * `.claude/protected-files.json`, 11 September; an earlier claim that it was
 * protected was wrong, and the same false claim is on the record once before).
 * ⛔ They are still copied, for the reason that file gives for copying them from
 * the contact field: **the answer card is APPROVED and must not move when this
 * card is tuned.**
 */

import { useMemo, useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  cardDims,
  /* ⚠ `CROWN_PLATEAU_U` IS NO LONGER IMPORTED. The plateau model it belongs to
     was superseded on 11 September; it remains EXPORTED from the geometry module,
     where its comment is the record of what the plateau was and why it cost the
     text area it was meant to protect. */
  maxFaceTiltDegrees,
  type CardDims,
} from "./about-card-geometry";
/* ⚠ CHUNK 2a — consumed ONLY when the `glass` prop is on. See its note: the
   default stays chunk 1's diagnostic grey for all four room cards. */
import {
  GLASS_ATTENUATION_COLOR,
  GLASS_ATTENUATION_DISTANCE,
  GLASS_COLOR,
  GLASS_IOR,
  GLASS_METALNESS,
  GLASS_RIM_ROUGHNESS,
  GLASS_ROUGHNESS,
  GLASS_FACE_TRANSMISSION,
  GLASS_THICKNESS_MM,
  GLASS_TRANSMISSION,
} from "./about-card-glass";
/* ⛔ D-093 — consumed ONLY when the `neon` prop is passed (CA and CB). */
import { NEON_LAYER, type NeonChannel } from "./about-neon";
/* ⛔ D-094 — consumed ONLY when the `etch` prop is passed (CA, behind `?etch=1`). */
import { buildEtchTexture, resolveEtchFamily, type EtchSettings } from "./card-etch";

// ── Diagnostic tones ─────────────────────────────────────────────────────────
// Deliberately achromatic and deliberately DIFFERENT per part, so the three
// surfaces can be told apart and their angles read. ⛔ Not a material direction.
const DIAG_RIM_COLOR = "#9a9a9a";
const DIAG_BEVEL_COLOR = "#7a7a7a";
const DIAG_FACE_COLOR = "#c8c8c8";

/**
 * Superellipse exponent used to combine the two axis curvatures.
 *
 * ⛔⛔ REVERTED TO 3 ON CARL'S INSTRUCTION, 11 September 2026, AFTER THE TRUE-SDF
 * BUILD REGRESSED. *"It's regressed, go back to the last version."*
 *
 * ⚠⚠ AND THAT MEANS A KNOWN FAULT IS BACK IN, DELIBERATELY. The SDF version fixed
 * the flat corners — measured, mid-side and mid-end heights identical at every
 * inset — but something else in it read worse to Carl's eye, and **the corners are
 * the lesser fault.** ⛔ Do not "fix" this by restoring the SDF without his word.
 *
 * **The history, because it will otherwise be re-walked:**
 *
 *     n = 6   contours approach a RECTANGLE. *"That's not a shallow dome but 4
 *             sloping triangles."* A diagonal point sat at 81% of an edge point's
 *             height, and near-rectangular contours ARE flat panels.
 *     n = 3   contours round again. ⚠ KNOWN FAULT: at the corners the norm reads
 *             0.0000 where the true distance is 0.1558, so the surface climbs too
 *             fast there and tops out early — Carl: *"it's flat in the corners."*
 *     SDF     corners correct, everything else judged a regression. REVERTED.
 *
 * ⚠ THE UNDERLYING TENSION IS REAL AND UNRESOLVED: a norm is not a distance, so no
 * exponent makes the corner slope even. **The corner fix and whatever the SDF
 * version broke are not yet reconciled.** `insetDistance` is retained below,
 * unused, for that reason.
 */
/* ⚠ UNUSED SINCE THE Q+A GEOMETRY REPLACED THE SUPERELLIPSE MODEL, 14 September
   2026. ⛔ KEPT, NOT DELETED: the comment above is the record of why a norm-based
   face could not meet its own bevel — only the corners ever reached the boundary —
   and that reasoning is what stops the model being rebuilt. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CORNER_NORM = 3;

/**
 * ⛔⛔ THE PLATEAU, RE-DERIVED FOR THE ABOUT CARDS' PROPORTIONS — 14 September 2026.
 *
 * ⚠ The Q+A answer card holds full crown height across `CROWN_PLATEAU_U = 0.72` of
 * its LONG axis and rolls off in the last 28% at each end. ⛔ **That figure does
 * not transfer**, because the two faces are different shapes:
 *
 *     Q+A answer card face    ~3.89 : 1    a strip
 *     About floor card face    2.19 : 1    much squarer
 *
 * ⚠⚠ THE INVARIANT WORTH HOLDING IS THE ROLL-OFF BAND'S SHAPE, not the plateau
 * fraction. On the Q+A card the band measures **1.089 x its own half-height**.
 * Holding that same relationship on a 2.19:1 face gives:
 *
 *     band  = 1.089 x 173mm  = 188mm  of a 378mm half-width
 *     plateau = 1 - 188/378  = 0.502
 *
 * ⛔ Carl, 14 September: *"the face proportions are different, this has to be taken
 * into consideration and modified accordingly."* **Inheriting 0.72 would be the
 * same class of error as inheriting the contact field's crown of 5.0 — a number
 * tuned against one object's proportions carried onto another's.**
 *
 * ⚠ It still leaves a real plateau: 50.2% of the half-width, ~190mm of near-level
 * surface down the middle of the card, which is where the copy sits.
 *
 * ⚠⚠ UNUSED SINCE 14 SEPTEMBER 2026 — AND ITS FAILURE IS THE POINT OF KEEPING IT.
 * Carl, on the build that used it: *"theres a lump in the middle and flat bits."*
 * ⛔ **The plateau WAS the lump.** Holding full height across the middle 50.2% of
 * the long axis gave a profile of 16.2 / 16.2 / 16.2 / 8.2 / 0.0mm — three samples
 * at identical height is a flat top, not a curve.
 *
 * ⛔ THE LESSON: the plateau is a STRIP feature. On the Q+A card (3.89:1) the long
 * axis is nearly straight anyway and the plateau reads as a cylindrical roll. On a
 * 2.19:1 face the flat region is wide in BOTH directions and reads as a panel with
 * a bulge. **Re-deriving the value (0.72 -> 0.502) only tuned how wide the lump
 * was; the feature itself did not belong here.**
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ABOUT_PLATEAU_U = 0.502;

/**
 * How far the oval extends BEYOND the card, as a multiple of the card's extent.
 *
 * ⛔⛔ CARL'S SOLUTION TO THE FLAT CORNERS, 11 September 2026: *"Expand the oval
 * in all directions so it goes outside the rectangle, but only show what is
 * inside the rectangle starting from the bevel."*
 *
 * ⚠⚠ THIS IS THE OPTICAL ANSWER AND IT IS BETTER THAN THE BLENDS THAT PRECEDED
 * IT. The card becomes a WINDOW ONTO A LARGER LENS. The curvature is unchanged —
 * Carl had already approved how it read — and the oval simply grows until its rim
 * passes outside the rectangle, so **every point of the bevel sits on the curve**
 * rather than only the four mid-edge points.
 *
 * ⛔ THE THRESHOLD IS E = 1.26, where the rectangle's corner lands exactly on the
 * oval's rim. Below that the corners are outside the oval and go flat — the
 * original defect. At E = 1.3 the whole card is inside.
 *
 * ⚠ AND THE CARD NO LONGER REACHES THE OVAL'S RIM, WHICH IS THE POINT: the face
 * is cut off part-way down the dome, exactly as a lens sits in a mount. The
 * consequence is that the face does NOT fall to zero at the bevel, and the raw
 * heights differ around the perimeter:
 *
 *     E      mid-side   mid-end    corner
 *     1.30     0.481      0.481     0.075
 *     1.50     0.637      0.637     0.353
 *
 * ⛔ SO THE SURFACE IS RE-NORMALISED against the lowest point on the card's edge
 * — see `convexFaceGeometry`. Without it the face would meet a flat bevel at
 * different heights around the card and the seam would read as a step.
 */
const OVAL_EXPAND = 1.35;

/**
 * How sharply the crown falls away toward the rim: `z = 1 - (1-t)^CROWN_FALLOFF`.
 *
 * ⛔ THIS IS THE CONTOUR-SPACING DIAL, and the contour map Carl drew is what it
 * is set against. Higher = contours bunch harder at the edge and the level top
 * grows; lower = more even spacing and a smaller top.
 *
 *     1.0   linear — even spacing, a cone
 *     2.5   9/19/31/48/70% insets, 30% of the span near-level   <- current
 *     4.0   steeper edge still, ~40% near-level
 *
 * ⚠ NOT APPROVED. It and `CORNER_NORM` are the two shape dials; between them they
 * set how much of the face is usable for text.
 */
const CROWN_FALLOFF = 2.5;

/**
 * ⚠ THE SEAM-BAND CONSTANT WAS REMOVED, 14 September 2026. It scaled the approved
 * surface down to zero across the outer `SEAM_BAND` of the face. It closed the gap
 * at every perimeter point and left the inboard heights bit-identical — and it was
 * still wrong, because 15% in from every edge is **~28% of the face area** turned
 * into slope at 52.43°. ⛔ Carl: *"youve made the real estate where the text goes
 * much smaller."*
 *
 * ⚠⚠ THE MEASUREMENTS ARE KEPT because the next attempt must not rediscover them:
 *
 *     band   short axis   long axis   face area consumed
 *     0.10     17.3mm       37.8mm          ~19%
 *     0.15     25.9mm       56.8mm          ~28%
 *     0.20     34.6mm       75.7mm          ~36%
 *
 * ⛔ ALL THREE CLOSE THE SEAM. None of them is acceptable, because the cost is
 * paid in the text area the face exists to provide.
 */

/** Samples around the perimeter. Corners need the density; edges do not suffer. */
const PATH_SAMPLES = 512;
/** Rings across the rim's half-tube profile. */
const TUBE_PROFILE_SEGMENTS = 12;

type PathPoint = { x: number; y: number; nx: number; ny: number };

/**
 * Sample a rounded rectangle's perimeter anticlockwise from the middle of the
 * right edge, returning each point with its OUTWARD normal.
 *
 * ⚠ The normal is what lets every band be a true parallel offset: a ring inset by
 * `d` is just `p - n*d`. Corners come out right for free, which is the whole
 * reason the path carries normals rather than being re-derived per band.
 */
function sampleRoundedRectPath(
  width: number,
  height: number,
  radius: number,
  samples: number,
): PathPoint[] {
  const hw = width / 2;
  const hh = height / 2;
  const r = Math.max(0, Math.min(radius, hw, hh));

  const straightX = 2 * (width - 2 * r);
  const straightY = 2 * (height - 2 * r);
  const arcs = 2 * Math.PI * r;
  const total = straightX + straightY + arcs;

  const pts: PathPoint[] = [];
  const quarter = (Math.PI / 2) * r;
  const topRun = width - 2 * r;
  const sideRun = height - 2 * r;

  for (let i = 0; i < samples; i++) {
    let d = (i / samples) * total;

    // 1. right edge, centre upward
    if (d < hh - r) {
      pts.push({ x: hw, y: d, nx: 1, ny: 0 });
      continue;
    }
    d -= hh - r;

    // 2. top-right arc
    if (d < quarter) {
      const a = (d / quarter) * (Math.PI / 2);
      const nx = Math.cos(a);
      const ny = Math.sin(a);
      pts.push({ x: hw - r + nx * r, y: hh - r + ny * r, nx, ny });
      continue;
    }
    d -= quarter;

    // 3. top edge, rightward to leftward
    if (d < topRun) {
      pts.push({ x: hw - r - d, y: hh, nx: 0, ny: 1 });
      continue;
    }
    d -= topRun;

    // 4. top-left arc
    if (d < quarter) {
      const a = Math.PI / 2 + (d / quarter) * (Math.PI / 2);
      const nx = Math.cos(a);
      const ny = Math.sin(a);
      pts.push({ x: -hw + r + nx * r, y: hh - r + ny * r, nx, ny });
      continue;
    }
    d -= quarter;

    // 5. left edge, downward
    if (d < sideRun) {
      pts.push({ x: -hw, y: hh - r - d, nx: -1, ny: 0 });
      continue;
    }
    d -= sideRun;

    // 6. bottom-left arc
    if (d < quarter) {
      const a = Math.PI + (d / quarter) * (Math.PI / 2);
      const nx = Math.cos(a);
      const ny = Math.sin(a);
      pts.push({ x: -hw + r + nx * r, y: -hh + r + ny * r, nx, ny });
      continue;
    }
    d -= quarter;

    // 7. bottom edge, leftward to rightward
    if (d < topRun) {
      pts.push({ x: -hw + r + d, y: -hh, nx: 0, ny: -1 });
      continue;
    }
    d -= topRun;

    // 8. bottom-right arc
    if (d < quarter) {
      const a = (3 * Math.PI) / 2 + (d / quarter) * (Math.PI / 2);
      const nx = Math.cos(a);
      const ny = Math.sin(a);
      pts.push({ x: hw - r + nx * r, y: -hh + r + ny * r, nx, ny });
      continue;
    }
    d -= quarter;

    // 9. right edge, up to the centre
    pts.push({ x: hw, y: -(hh - r) + d, nx: 1, ny: 0 });
  }

  return pts;
}

type BandSample = { inward: number; forward: number; nIn: number; nFwd: number };

/**
 * Sweep a profile around a closed path. `profile(t)` returns, for t in 0..1, how
 * far inward and forward the ring sits and the normal there.
 */
function sweptBand(
  path: PathPoint[],
  segments: number,
  profile: (t: number) => BandSample,
): THREE.BufferGeometry {
  const n = path.length;
  const rings = segments + 1;
  const positions = new Float32Array(n * rings * 3);
  const normals = new Float32Array(n * rings * 3);
  const indices: number[] = [];

  for (let r = 0; r < rings; r++) {
    const s = profile(r / segments);
    for (let i = 0; i < n; i++) {
      const p = path[i];
      const o = (r * n + i) * 3;
      positions[o] = p.x - p.nx * s.inward;
      positions[o + 1] = p.y - p.ny * s.inward;
      positions[o + 2] = s.forward;
      // Normal lies in the plane of the path normal and z.
      normals[o] = p.nx * s.nIn;
      normals[o + 1] = p.ny * s.nIn;
      normals[o + 2] = s.nFwd;
    }
  }

  for (let r = 0; r < segments; r++) {
    for (let i = 0; i < n; i++) {
      const a = r * n + i;
      const b = r * n + ((i + 1) % n);
      const c = (r + 1) * n + ((i + 1) % n);
      const d = (r + 1) * n + i;
      indices.push(a, b, c, a, c, d);
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  g.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}

/**
 * Distance from a point to the boundary of a rounded rectangle, normalised so 0
 * is on the boundary and 1 is the innermost point.
 *
 * ⛔⛔ THIS IS THE "MATHEMATICS AT THE CORNERS" — Carl, 11 September 2026: *"it's
 * flat in the corners. The slope must start from every point on the bevel... Your
 * gonna need some mathematics at the corners to keep the slope even."*
 *
 * ⚠⚠ THE SUPERELLIPSE NORM IT REPLACES WAS NOT A DISTANCE, AND THE CORNERS ARE
 * WHERE THAT SHOWED. Measured at a point 60mm in from the bevel:
 *
 *     position          true distance    superellipse n=3
 *     mid side             0.1638            0.1638
 *     mid end              0.1638            0.0743
 *     corner diagonal      0.1558            0.0000   <- reads as ON the boundary
 *
 * ⛔ At the corner the norm said zero. The surface therefore had its WHOLE climb
 * still to do in the small space left, ramped up fast, and topped out early —
 * leaving the flat wedge visible in the render.
 *
 * ⚠ THE EXACT SDF: fold into the first quadrant, measure to the inner
 * rectangle's corner, subtract the radius. Negative inside; its magnitude is the
 * true perpendicular distance to the nearest edge OR corner arc, which is what
 * makes the slope start evenly from every point on the bevel — straights and
 * arcs alike.
 *
 * ⚠ THIS FUNCTION EXISTED EARLIER TODAY AND WAS DELETED. It was removed when the
 * RADIAL profile built on it read as a CRT — but the fault was the profile, not
 * the distance field. **A correct component was discarded for its caller's
 * defect.** Restored, with that noted so it is not discarded again.
 */
/* ⛔ RETAINED THOUGH UNUSED, ON PURPOSE — this is the measured fix for the flat
   corners and it will be needed again. The build that used it regressed
   elsewhere and Carl reverted it on 11 September; the corner fault and whatever
   that build broke are not yet reconciled. ⚠ A suppression is a debt: if the
   superellipse is ever retired for good, delete this and the directive together.
   See `CORNER_NORM`. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function insetDistance(
  x: number,
  y: number,
  hw: number,
  hh: number,
  r: number,
): number {
  const qx = Math.abs(x) - (hw - r);
  const qy = Math.abs(y) - (hh - r);
  const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
  const inside = Math.min(Math.max(qx, qy), 0);
  const d = outside + inside - r;
  return Math.max(0, Math.min(1, -d / Math.min(hw, hh)));
}

/**
 * The convex face — a tessellated rounded rectangle crowned by a raised cosine.
 *
 * ⚠ A GENUINELY ROUNDED-RECTANGLE SURFACE, not a rectangular plane relying on the
 * bevel to hide square corners. The contact field's own note explains why that
 * distinction matters: the face's outline is visible through the aperture.
 *
 * ⚠ THE CROWN IS SEPARABLE PER AXIS, with a plateau on each. Both approved
 * objects hold `CROWN_PLATEAU_U` on the long axis only, because they are strips.
 * ⛔ HERE IT IS APPLIED TO BOTH AXES — a 2:1 card crowns meaningfully in both
 * directions, and a plateau on one axis alone would leave the short axis curving
 * continuously under the text.
 */
/**
 * ⛔ THE FACE'S DOME, normalised: 0 on the boundary, 1 at the pole. The quartic
 * bulge `(1 − u²)(1 − v²)` — see `ovalHeight` below for the whole account.
 *
 * ⚠ EXPORTED SO THE EXTRUDED TEXT (`card-extrude.tsx`, D-094) SITS ON THE SAME
 * SURFACE the face is built from — one formula, not a copy that could drift.
 * Multiply by the crown (mm); add `faceBaseZ(dims)`.
 */
export function faceDome(x: number, y: number, hw: number, hh: number): number {
  const u = Math.min(1, Math.abs(x) / hw);
  const v = Math.min(1, Math.abs(y) / hh);
  return (1 - u * u) * (1 - v * v);
}

/** Where the face's base sits: the bevel's front plane, so the seam does not gap.
    ⚠ Exported for the same reason as `faceDome`. */
export function faceBaseZ(dims: CardDims): number {
  return dims.rimBeadMm * 0.8;
}

function convexFaceGeometry(
  width: number,
  height: number,
  radius: number,
  crown: number,
  /** ⚠ Replaces the long-dead `plateauU`. See `OVAL_EXPAND`. */
  expand: number,
  /**
   * ⚠ RAISED WITH THE EQUIDISTANT PROFILE. The contours now follow the card's
   * rounded-rectangle outline rather than an ellipse, so the corner arcs carry
   * real curvature that a coarse grid would facet. ⛔ Segment counts follow the
   * aspect so quads stay near square — long thin quads shade anisotropically and
   * would betray the crown, which is the reason the answer card states the same
   * rule.
   */
  segX = 160,
  segY = 80,
  /**
   * ⛔ BUILD THE FACE FLAT — no crown at all. CS only, 14 September 2026.
   * See the `flat ? 0 : ...` line in the vertex loop for why this closes the seam
   * without spending any face area.
   */
  flat = false,
): THREE.BufferGeometry {
  const hw = width / 2;
  const hh = height / 2;
  const r = Math.max(0, Math.min(radius, hw, hh));

  /**
   * ⛔⛔ A LENS, NOT A PLATEAU. Carl, 11 September 2026, on the first build:
   * *"It appears the darker grey rectangle is where the text will be, smaller
   * real estate. Space will be at a premium. You cannot put text on the slope.
   * It would be better if it was dome like and not having such a sudden rise.
   * Almost like a lens."*
   *
   * ⚠⚠ THE PLATEAU MODEL WAS BACKWARDS AND THE SCREENSHOT SHOWED IT. The
   * reasoning had been that a flat plateau PROTECTS the text by keeping the curve
   * away from it. ⛔ **It does the opposite.** Confining all the curvature to a
   * narrow band makes that band STEEP — a visible shoulder, too sloped for text —
   * and the flat centre shrinks to pay for it. The usable area became the small
   * dark rectangle in the render, not the face.
   *
   * ⛔ A LENS DISTRIBUTES THE CURVE ACROSS THE WHOLE FACE: gentler everywhere, no
   * shoulder, and type sits on a shallow continuous curve. **The whole face
   * becomes text real estate** instead of a flat island inside a slope.
   *
   * ⚠ AND IT COSTS NOTHING IN TILT, WHICH IS THE THING THE CROWN EXISTS FOR. A
   * spherical-cap profile still reaches its maximum slope at the rim — the same
   * place the plateau model put it — so the shadow that discloses the convexity
   * is unchanged. What goes is the discontinuity, not the effect.
   *
   * `plateauU` is retained in the signature but IGNORED — see the caller, where
   * it is documented as superseded rather than silently dropped.
   */
  /**
   * ⛔⛔ CONTOUR SPACING IS THE SPECIFICATION. Carl drew the face as a contour
   * map, 11 September 2026: *"at the edges the gradual slope starts, even all
   * around. As you get higher it shallows. Not exactly a flat surface but not
   * sloped enough that when you put 2D text in it, it won't look wrong."*
   *
   * ⚠⚠ READ OFF HIS DRAWING: the outer contours are CLOSE TOGETHER (steep near
   * the edge) and SPREAD as they go inward (shallowing), and the innermost is a
   * long thin SLOT — a broad near-level top running the card's length, not a
   * point.
   *
   * ⛔ THE RAISED COSINE FAILED THE FIRST AND THIRD OF THOSE. Contours at
   * 30/44/56/71/86% is near-even spacing, and only **1.8% of the face** sat above
   * 95% height — a ridge, not a level top.
   *
   *     profile                  20%  40%  60%  80%  95%   top area
   *     raised cosine             30   44   56   71   86      14%
   *     1 - (1-t)^2.5              9   19   31   48   70      30%   <- current
   *
   * ⛔ **9/19/31/48/70 is bunched at the edge and spreading inward**, and 30% of
   * the span sits above 95% height. That is the drawing.
   *
   * ⚠ IT STILL LANDS WITH ZERO SLOPE AT THE APEX, so there is no crease at the
   * top — the text sits on a large, gently curved region rather than over a ridge.
   * ⛔ That is the whole point of the shape: *"not sloped enough that when you put
   * 2D text in it, it won't look wrong."*
   *
   * `t` is distance from the boundary: 0 at the bevel, 1 at the innermost point.
   */
  /* ⚠ UNUSED SINCE THE TENT-POLE MEMBRANE, 14 September 2026 — the raised cosine
     in `ovalHeight` replaced it. ⛔ KEPT, NOT DELETED: the comment above records
     Carl's contour drawing and the 9/19/31/48/70 spacing derived from it, which is
     the specification any future profile has to answer to. **The falloff was never
     the fault — the norm it was applied to was.** */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const profile = (t: number) => {
    const a = Math.max(0, Math.min(1, t));
    return 1 - Math.pow(1 - a, CROWN_FALLOFF);
  };

  /**
   * Height on the EXPANDED oval, re-normalised so the card's lowest edge point
   * sits at 0 and its centre at 1.
   *
   * ⛔ THE EXPANSION IS WHAT FIXES THE CORNERS — see `OVAL_EXPAND`. The oval's
   * rim now lies outside the card, so no part of the card is off the curve.
   *
   * ⚠ THE RE-NORMALISATION IS NOT COSMETIC. After expanding, the raw surface sits
   * well above zero at the bevel (0.48 at the mid-edges, 0.08 at the corners on
   * E = 1.3). Left raw, the face would meet a FLAT bevel at four different
   * heights and the seam would read as a step. Subtracting the lowest edge value
   * and rescaling puts the whole visible rise back into `crown`.
   *
   * ⚠ THE CORNER IS THE LOWEST POINT, so it is the one that lands exactly on the
   * bevel; the mid-edges sit slightly proud of it. ⛔ That is a real consequence
   * of cutting a rectangle out of an oval and it is VISIBLE — if it reads wrong,
   * the dial is `OVAL_EXPAND`: higher flattens the difference, lower exaggerates
   * it and eventually returns the flat corners.
   *
   * ══════════════════════════════════════════════════════════════════════════
   * ⚠⚠ A PER-DIRECTION NORMALISATION WAS BUILT HERE ON 14 SEPTEMBER AND REVERTED
   * ══════════════════════════════════════════════════════════════════════════
   *
   * ⛔ THE DEFECT IS REAL AND IS STILL OPEN. Carl, on the rendered page: *"the face
   * does not connect with the bevel on the sides… its quite clearly a gap."*
   * Measured on CD (406mm tall, crown 36.6mm): the face's edge floats **16.05mm**
   * above the bevel at the mid-edges — 3.95% of card height, larger than the rim
   * bead (8.93mm) and larger than the bevel band (12.18mm). Zero at the corners,
   * worst at the mid-edges.
   *
   * ⚠⚠ IT HID ON THE BENCH AND THE REASON IS WORTH KEEPING. Carl: *"in the proto
   * card construction because it was on a black background this could of been
   * mistaken for a shadow."* A 16mm lift showing black against black reads as
   * shading; against a lit floor it is unmistakable. **The bench could not have
   * disclosed this; only the room could.**
   *
   * ⛔⛔ WHY THE FIX WAS REVERTED, AND IT IS A SCOPE FAILURE NOT A MATHS FAILURE.
   * The attempt normalised EVERY sample against its own boundary point. It did
   * close the gap — seven perimeter points measured 0.000000mm — but it changed
   * the face's surface EVERYWHERE, on BOTH cards, and produced visible diagonal
   * creases across each face. Carl: *"i did not say change the left card. i did
   * not say change the whole geometry of the face. just fill in the gap with a
   * gentle curve."*
   *
   * ⚠ THE BRIEF IS NARROWER THAN THE FIX THAT WAS APPLIED: the bevel stays
   * equidistant and unmodified, the approved face geometry stays as Carl approved
   * it, and only the GAP is to be filled — with a gentle curve, on the edge where
   * it shows. ⛔ A global re-normalisation is not that.
   */
  const ovalHeight = (x: number, y: number, ohw: number, ohh: number) => {
    /**
     * ⛔⛔ THE TENT-POLE MEMBRANE — THE FACE FORMULATION FOR ALL FOUR CARDS.
     * Carl, 14 September 2026: *"it is a blueprint for all 4 cards… we can touch
     * the face surface now, the old model didnt work."*
     *
     * ⚠⚠ HIS MODEL, AND IT IS THE SPACETIME PICTURE INVERTED. A pliable sheet
     * pinned to its frame with a mass pulling DOWN — except here a pole pushes UP
     * at the centre: *"Imagine our face is fabric. Its pliable. at the very centre
     * of the face we have a tent pole. Whats gonna happen if we lift it up? Just
     * enough so the face is curved, text can be read off it and when light is
     * shone at it, especially from the top and sides — it is noticably curved."*
     *
     * ⛔⛔ THE PINNING IS WHAT FIXES THE SEAM, AND IT FIXES IT BY CONSTRUCTION.
     * A membrane fixed to its frame CANNOT lift off it, however high the pole
     * goes. `m` is 1 on the boundary, so `1 - m` is 0 there, so the height is
     * EXACTLY 0 — at every perimeter point, on every card, at every pole value.
     * **No seam band, no re-normalisation, and no face area spent closing a gap.**
     *
     * ⚠⚠ WHAT THIS REPLACES. The old model took a superellipse NORM of the two
     * axes and applied one profile to it. With `OVAL_EXPAND` pushing the oval's rim
     * outside the card, a mid-edge sample read `su = 1/1.35 = 0.741` with `sv = 0`,
     * so the norm never reached 1 and the surface never came down. **Only the
     * CORNERS — where both terms contribute — touched the bevel.** Carl, in the
     * room: *"the face is a single flat sheet that has had equal pressure applied
     * at the corners and bent."* The gap measured 16.05mm on CD, larger than the
     * rim bead (8.93mm) and larger than the bevel band (12.18mm).
     *
     * ⛔ TWO PATCHES WERE BUILT ON THE OLD MODEL AND BOTH FAILED — recorded so
     * neither is retried as if new:
     *   1. PER-DIRECTION NORMALISATION — closed the gap, rewrote the whole surface
     *      on BOTH cards, visible diagonal creases.
     *   2. A 15% SEAM BAND — closed the gap, left the inboard surface identical,
     *      but turned ~28% of the FACE AREA into 52° slope. *"youve made the real
     *      estate where the text goes much smaller."*
     * ⛔ **Neither fault is possible here: a pinned membrane spends nothing to
     * reach its own edge.**
     *
     * ⚠ `CORNER_NORM`, `OVAL_EXPAND` and `CROWN_FALLOFF` are now UNUSED by this
     * function and are retained only as the record of the model that did not work.
     *
     * ⚠ `m` is the rounded-rect ray parameter — the same outline the vertex loop
     * clamps to, so the pinning and the geometry agree by construction rather than
     * by coincidence.
     */
    /**
     * ⛔⛔ PLAN B — THE Q+A ANSWER CARD'S GEOMETRY, 14 September 2026. Carl:
     * *"Apply the q+a geometry to the cards."*
     *
     * ⚠⚠ SEPARABLE AND MULTIPLICATIVE: `longAxis * shortAxis`. Ported in form from
     * `answer-card-mesh.tsx`'s `crownZ`, which is the shape approved on BOTH
     * existing objects — the answer card and the contact field.
     *
     * ⛔ WHY IT CLOSES THE SEAM BY CONSTRUCTION. At `v = ±1` — anywhere on a long
     * edge — `shortAxis = (1 + cos(pi)) / 2 = 0`, and the PRODUCT is zero
     * regardless of `u`. At `u = ±1` the same holds via `longAxis`. **Every
     * perimeter point is zero, so the face meets the bevel all the way round.**
     *
     * ⚠⚠ AND IT HAS NO DIAGONAL RIDGE, WHICH IS WHY THE MEMBRANE FAILED. The
     * tent-pole model used `max(|x|/hw, |y|/hh)` — a max-norm, whose contours are
     * RECTANGLES. Those meet at the diagonals as a crease, and the render showed
     * exactly that: two visible creases running corner to corner. ⛔ A product of
     * two smooth per-axis falloffs has no such seam anywhere in the interior.
     *
     * ⚠ THE PLATEAU IS RE-DERIVED, NOT INHERITED. The Q+A card is a 3.89:1 strip;
     * this face is 2.19:1. Holding the Q+A's roll-off band at the same proportion
     * of the SHORT axis gives `ABOUT_PLATEAU_U ≈ 0.502` here against 0.72 there.
     * ⛔ Carl: *"the face proportions are different, this has to be taken into
     * consideration and modified accordingly."*
     */
    /**
     * ⛔⛔ THE QUARTIC BULGE — `(1 - x²)(1 - y²)`. 14 September 2026, from a second
     * outside recommendation Carl brought in, and it is the SIXTH face formulation
     * tried today. The five before it were rejected on sight.
     *
     * ⚠⚠ IT CLOSES THE SEAM ALGEBRAICALLY, NOT APPROXIMATELY. Each factor vanishes
     * on its own axis: at `x = ±1` the first is exactly 0 regardless of y, and at
     * `y = ±1` the second is exactly 0 regardless of x. **Every perimeter point is
     * zero at every curvature value** — so the face meets the bevel all the way
     * round and cannot lift off it, which is what the superellipse model could not
     * do (it reached zero only at the four corners, hanging 16.05mm elsewhere).
     *
     * ⛔ AND IT HAS NO FLAT REGION AND NO CREASE — the two faults that sank the
     * attempts in between. Measured on CD at 2.5%:
     *
     *     perimeter        0 on every edge      (algebraic)
     *     diagonal spike   2.2e-4               smooth, no ridge
     *     flat run         3.3%                 noise, no plateau
     *     max tilt         6.69°
     *     TEXT-FLAT        100% of the face     <- the number that matters
     *
     * ⚠⚠ **100% OF THE FACE SITS UNDER 8° OF TILT.** Every earlier fix spent text
     * area to close the seam: the 15% band left 72%, the membrane 80%, and the
     * plateau build had a visibly flat top. This has no flat region AND no steep
     * region. ⛔ Carl's constraint throughout — *"youve made the real estate where
     * the text goes much smaller"* — is finally satisfied rather than traded
     * against.
     *
     * ⚠ THE PROFILE IS A DOME, NOT A BENT SHEET: 10.15 / 9.52 / 7.61 / 4.44 / 0.00
     * — shallow near the apex, steepening toward the rim. The quartic is flattest
     * where the text sits and does its work near the edge, where the light catches.
     *
     * ⚠ THE RIM AND BEVEL ARE UNTOUCHED, as the recommendation requires — they are
     * separate swept meshes in this file and nothing here reaches them.
     *
     * ⚠ `x`/`y` here are already the clamped rounded-rect coordinates from the
     * vertex loop, so the normalisation matches the outline the face is cut to.
     */
    /* ⚠ THE FORMULA LIVES IN `faceDome` (module scope, exported) SO THE EXTRUDED
       TEXT SITS ON THE SAME SURFACE — one source, not a copy (D-094, 24 September
       2026). Moved verbatim; the face's vertices are unchanged. */
    return faceDome(x, y, ohw, ohh);
  };

  const positions: number[] = [];
  /** ⛔ See the `uvs.push` in the vertex loop — their absence made the normal map
      completely inert, which is the fault Carl found on CS. */
  const uvs: number[] = [];
  const indices: number[] = [];
  const cols = segX + 1;

  for (let j = 0; j <= segY; j++) {
    const v = (j / segY) * 2 - 1;
    const y = v * hh;
    for (let i = 0; i <= segX; i++) {
      const u = (i / segX) * 2 - 1;
      const x = u * hw;
      // Clamp into the rounded-rect outline: pull the corners in.
      const ox = Math.max(0, Math.abs(x) - (hw - r));
      const oy = Math.max(0, Math.abs(y) - (hh - r));
      const corner = Math.hypot(ox, oy);
      const scale = corner > r ? r / corner : 1;
      const px = Math.sign(x) * (Math.min(Math.abs(x), hw - r) + ox * scale);
      const py = Math.sign(y) * (Math.min(Math.abs(y), hh - r) + oy * scale);
      /**
       * ⛔ HEIGHT COMES FROM A SUPERELLIPSE NORM — see `CORNER_NORM` above for why
       * this is here rather than the true distance field, and what it costs.
       *
       * ⚠ `su`/`sv` run 0 at the centre to 1 at each edge pair; the norm combines
       * the two axes' shortfalls and the result is inverted back to a
       * distance-from-edge for the profile.
       *
       * ⚠⚠ KNOWN FAULT, ACCEPTED FOR NOW: near a corner both terms contribute, so
       * `s` saturates early and the crown tops out before the corner — the flat
       * wedges Carl identified. ⛔ `insetDistance` fixes exactly this and is
       * deliberately NOT used; the build that used it regressed elsewhere and Carl
       * reverted it. **Do not swap it back without his word.**
       */
      /**
       * ⛔⛔ `flat` BUILDS A PLANE FACE — CS ONLY, 14 September 2026, on Carl's
       * instruction: *"On the right card, make it flat and connect it to the bevel
       * at all points."*
       *
       * ⚠⚠ A FLAT FACE SOLVES THE SEAM BY CONSTRUCTION. Height is zero at every
       * sample, so the face sits on the bevel's own front plane (`faceBaseZ`) and
       * touches it all the way round — no gap, no seam band, and **no face area
       * spent on slope.** The two reverted fixes both closed the gap by consuming
       * the text area; this one cannot.
       *
       * ⛔ IT IS A TEST, NOT A DECISION. CD keeps the approved crown so the two can
       * be judged side by side in the room — which is the only place the seam was
       * ever visible.
       *
       * ⚠ WHAT IT COSTS, STATED: the crown is the whole reason the rim can light
       * the face, and it is what makes a plano-convex card refract backlight. A
       * flat face is a flat sheet of glass. **The comparison is between a defect
       * that shows and an optical property that may not survive its removal.**
       */
      const z = flat ? 0 : crown * ovalHeight(x, y, hw, hh);
      positions.push(px, py, z);

      /**
       * ⛔⛔ UVs — ADDED 14 September 2026, AND THEIR ABSENCE WAS A SILENT BUG.
       *
       * ⚠⚠ THE FACE HAD NO `uv` ATTRIBUTE AT ALL. A normal map is sampled BY UV,
       * so with none present Three.js reads texel (0,0) for every fragment — one
       * corner of the map, encoding an essentially flat normal. **The map was
       * applied, uploaded and completely inert.**
       *
       * ⛔ THAT IS WHAT CARL OBSERVED: *"Moving CS parameters had no effect…
       * Changing Ovals and Crown has no effect on the shape, Changing light angle
       * just changes the face shade uniformly."* Two causes, both real: `flat`
       * discards the crown and oval before they reach the mesh, and the missing
       * UVs made the normal map unreadable. **CS had no mechanism to respond to
       * anything.**
       *
       * ⚠⚠ SO THE NORMAL-MAP APPROACH WAS NEVER ACTUALLY TESTED. The verification
       * confirmed the texture BUILT and the page COMPILED — it never checked that
       * the geometry could SAMPLE it. Same class of gap as every other false green
       * today: the thing measured was not the thing that mattered.
       *
       * ⚠ RECTANGULAR MAPPING over the face's bounding box, which is what the
       * outside advice assumed: *"The rectangular UV coordinates remain unchanged
       * while the geometry underneath them curves, so the text follows the
       * surface."* ⛔ It is also what the BAKED COPY will need in chunk 2 — the
       * same mapping serves both, so this is not scaffolding for the test alone.
       *
       * ⚠ `u`/`v` run 0→1 across the face's full extent. Corner vertices are
       * clamped inward to the rounded-rect outline, so their UVs compress
       * slightly there — correct, since the texture should follow the visible
       * surface rather than a rectangle the face does not occupy.
       */
      uvs.push((px + hw) / (2 * hw), (py + hh) / (2 * hh));
    }
  }

  for (let j = 0; j < segY; j++) {
    for (let i = 0; i < segX; i++) {
      const a = j * cols + i;
      const b = a + 1;
      const c = a + cols + 1;
      const d = a + cols;
      indices.push(a, b, c, a, c, d);
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  /** ⛔ WITHOUT THIS THE NORMAL MAP IS INERT — every fragment samples texel (0,0).
      See the `uvs.push` in the vertex loop for the full account. */
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}

/**
 * Measure the built face's maximum surface tilt from its NORMALS.
 *
 * ⛔⛔ THIS IS THE VERIFICATION PATH, AND `maxFaceTiltDegrees()` IS NOT. That
 * function shares its formula with the geometry and therefore cannot fail —
 * `answer-card-geometry.ts` records it carrying a factor-of-2 error that
 * *"prompted a crown of 7.5 (a dome) to be chosen where 4.5 was already right"*,
 * caught only because a harness read built normals instead.
 */
export function measuredMaxTiltDegrees(g: THREE.BufferGeometry): number {
  const n = g.getAttribute("normal");
  let maxTilt = 0;
  for (let i = 0; i < n.count; i++) {
    const nz = Math.abs(n.getZ(i));
    const tilt = Math.acos(Math.min(1, nz));
    if (tilt > maxTilt) maxTilt = tilt;
  }
  return (maxTilt * 180) / Math.PI;
}

function useDisposable(g: THREE.BufferGeometry) {
  useEffect(() => () => g.dispose(), [g]);
}


export type AboutCardMeshProps = {
  dims: CardDims;
  /** Crown height in mm. Separate from dims so the bench can sweep it. */
  crownMm: number;
  /**
   * How far the oval extends beyond the card. ⛔ Below ~1.26 the corners fall
   * outside the oval and go flat; above it the whole card is on the curve but
   * the mid-edges stand increasingly proud of the bevel. See `OVAL_EXPAND`.
   */
  ovalExpand?: number;
  /**
   * ⛔ BUILD THE FACE FLAT — no crown. CS only, 14 September 2026, Carl: *"On the
   * right card, make it flat and connect it to the bevel at all points."*
   *
   * ⚠ A flat face touches the bevel all the way round BY CONSTRUCTION and spends
   * no face area doing it — unlike the two reverted seam fixes, which both paid
   * for the gap with the text area. ⛔ A TEST, not a decision: CD keeps the
   * approved crown so the pair can be compared in the room.
   */
  flat?: boolean;
  /**
   * ⛔⛔ THE GLASS GATE — OFF BY DEFAULT, AND THE DEFAULT IS LOAD-BEARING.
   *
   * ⚠⚠ THIS COMPONENT IS SHARED BY ALL FOUR ROOM CARDS. Swapping the face
   * material outright — rather than behind this prop — turns CD, CS, CA and CB
   * into milky slabs on the next build, and the milkiness is **a pipeline
   * artefact, not a material verdict**:
   *
   *     three.module.js:18019
   *     if ( _currentClearAlpha < 1 ) _this.setClearColor( 0xffffff, 0.5 );
   *
   * **The `/about` canvas is `alpha: true`**, so the transmission render target
   * clears to **50% WHITE**. ⛔ It would look exactly like *"the frost is too
   * heavy"* when nothing about the frost is wrong — **worse than an empty
   * result, because it is a confident wrong answer.**
   *
   * ⛔ ONLY THE BENCH SETS THIS IN CHUNK 2a. `about-card-canvas.tsx` is NOT
   * changed until 2b, which owns the warm-up and the target measurement.
   *
   * ⚠ Found by the Architect: the first plan said "optional prop" and the
   * amended plan dropped the words, which would have made the claim *"2a does
   * not touch `/about`"* false. **This is the §5b lesson in miniature — a change
   * to a shared component reaches every consumer.**
   */
  glass?: boolean;
  /** ⚠ Bench faders. Ignored unless `glass`. See `about-card-glass.ts`. */
  glassRoughness?: number;
  /**
   * ⛔ THE FACE AND BEVEL'S TRANSMISSION. ⚠⚠ **THE RIM IS NOT AFFECTED and must
   * not be** — it is clear glass because it IS the neon. See
   * `GLASS_FACE_TRANSMISSION`.
   *
   * ⚠ DEFAULTS TO THE CONSTANT, so every existing consumer — `/about` included
   * — keeps whatever the constant says without passing anything. **The default
   * is the behaviour change; the prop is only the bench's dial.**
   */
  glassFaceTransmission?: number;
  /** ⚠ MILLIMETRES, object space. ⛔ Never divided by `MM_PER_UNIT`. */
  glassThicknessMm?: number;
  /** Reports the measured tilt of the built face, for the bench readout. */
  onTilt?: (deg: number) => void;
  /**
   * ⛔⛔ THE NEON — D-093. OFF BY DEFAULT, AND THE DEFAULT IS LOAD-BEARING.
   *
   * When passed, the rim gains an EMISSIVE and a second mesh — the EMITTER —
   * shares the rim's geometry on `NEON_LAYER`, where only `NeonBloom`'s neon
   * pass sees it. Both are driven every frame by ONE writer (`neon-bloom.tsx`).
   *
   * ⚠ With `etch` as well (CA, `?etch=1`), the etched text's GLOW mesh
   * registers into the same channel as a third depth (D-094, 24 September).
   *
   * ⚠⚠ WHEN ABSENT NOTHING CHANGES — CD, CS and the bench render exactly as
   * before. **The opal's rule 4 (D-091): an effect that is invisible without its
   * driver cannot regress approved work.** The identity gate measures this.
   *
   * ⛔ REQUIRES `glass` — Architect F14. The rim's physical material exists only
   * in the glass branch; neon without glass would do nothing silently, and look
   * like a dead constant. A dev check says so loudly.
   */
  neon?: NeonChannel;
  /**
   * ⛔⛔ THE ETCHED TEXT — D-094, 24 September 2026. OFF BY DEFAULT, and the
   * default is load-bearing for the same reason as `neon`: absent, nothing new
   * renders and no card changes. Only CA, only with `?etch=1`, until Carl approves.
   *
   * ⚠ MUST BE MEMOISED BY THE CALLER — an inline object would be new on every
   * render (Architect S1). The texture effect is keyed on primitives anyway.
   */
  etch?: { id: string; body: string; settings: EtchSettings };
  /** The face receives shadows — D-094's extruded text only. Off by default. */
  faceReceiveShadow?: boolean;
};

export function AboutCardMesh({
  dims,
  crownMm,
  ovalExpand = OVAL_EXPAND,
  flat = false,
  glass = false,
  glassRoughness = GLASS_ROUGHNESS,
  glassFaceTransmission = GLASS_FACE_TRANSMISSION,
  glassThicknessMm = GLASS_THICKNESS_MM,
  onTilt,
  neon,
  etch,
  faceReceiveShadow = false,
}: AboutCardMeshProps) {
  useEffect(() => {
    if (neon && !glass && process.env.NODE_ENV !== "production") {
      console.error(
        `⛔ NEON WITHOUT GLASS on card "${neon.id}" — the rim's emissive lives only in the glass branch, so this neon renders NOTHING. Pass \`glass\`.`,
      );
    }
  }, [neon, glass]);

  const path = useMemo(
    () =>
      sampleRoundedRectPath(
        dims.widthMm,
        dims.heightMm,
        dims.cornerRadiusMm,
        PATH_SAMPLES,
      ),
    [dims],
  );

  // ── RIM — a half-tube. ──
  //
  // ⚠ A HALF-TUBE AND NOT A FLAT EXTRUDE, AND THE REASON IS LIGHT, NOT SHAPE.
  // Carl, 3 August: *"The rim should be a half tube, that way it will emit light
  // onto the bevel and face, and if it's making a journey down the right hand
  // side it will affect the 2 card."* A flat rim emits roughly forward; a
  // half-round presents every angle between face and outer edge at once, so ONE
  // geometry throws light three ways — inward onto its own face, outward to
  // neighbouring cards, and at the viewer.
  //
  // ⛔ THAT IS NOW LOAD-BEARING RATHER THAN INCIDENTAL: this rim is the neon.
  const rimGeometry = useMemo(() => {
    const bead = dims.rimBeadMm;
    const centred = path.map((p) => ({
      x: p.x - p.nx * bead,
      y: p.y - p.ny * bead,
      nx: p.nx,
      ny: p.ny,
    }));
    return sweptBand(centred, TUBE_PROFILE_SEGMENTS, (t) => {
      const theta = t * Math.PI;
      return {
        inward: -Math.cos(theta) * bead,
        forward: Math.sin(theta) * bead,
        nIn: -Math.cos(theta),
        nFwd: Math.sin(theta),
      };
    });
  }, [path, dims]);

  // ── BEVEL — a swept band sloping inward and toward the viewer. ──
  //
  // ⛔ CARL NAMES ITS PURPOSE: *"bevels and light shone from the right direction
  // create shadows and emphasize geometry."* A rim alone gives an outline; a rim
  // plus a bevel gives an angled facet that takes light differently from the face
  // beside it, and the boundary reads as an edge in space.
  const bevelGeometry = useMemo(() => {
    const start = 2 * dims.rimBeadMm; // the rim's inner edge
    const width = dims.bevelWidthMm;
    // Rise to meet the face's base plane.
    const rise = dims.rimBeadMm * 0.8;
    const centred = path.map((p) => ({
      x: p.x - p.nx * start,
      y: p.y - p.ny * start,
      nx: p.nx,
      ny: p.ny,
    }));
    const len = Math.hypot(width, rise) || 1;
    return sweptBand(centred, 4, (t) => ({
      inward: t * width,
      forward: t * rise,
      nIn: rise / len,
      nFwd: width / len,
    }));
  }, [path, dims]);

  // ── FACE — convex, apex PROUD of the rim. ──
  const faceGeometry = useMemo(
    () =>
      convexFaceGeometry(
        dims.faceWidthMm,
        dims.faceHeightMm,
        dims.cornerRadiusMm - dims.faceInsetMm,
        crownMm,
        ovalExpand,
        undefined,
        undefined,
        flat,
      ),
    [dims, crownMm, ovalExpand, flat],
  );

  useDisposable(rimGeometry);
  useDisposable(bevelGeometry);
  useDisposable(faceGeometry);

  // Report the MEASURED tilt, never the predicted one.
  useEffect(() => {
    if (onTilt) onTilt(measuredMaxTiltDegrees(faceGeometry));
  }, [faceGeometry, onTilt]);

  // The face's base sits at the bevel's front plane so the seam does not gap.
  const baseZ = faceBaseZ(dims);

  // ── THE ETCH'S TEXTURE — D-094. Built only when `etch` is passed. ──
  //
  // ⚠ KEYED ON PRIMITIVES (Architect S1): the body, the size and weight, and the
  // face's millimetres — the texture's size comes from `dims`.
  // ⛔ STATE IS SET ONLY AFTER THE AWAIT (Architect S8): a synchronous setState in
  // an effect body is the lint baseline's one accepted error, not a second.
  // ⛔ NOTHING MOUNTS UNTIL THE TEXTURE EXISTS (Architect F3): a transparent white
  // material without its map would draw a pale slab over the card, and adding
  // the map later forces a recompile.
  const gl = useThree((s) => s.gl);
  const invalidate = useThree((s) => s.invalidate);
  const [etchTex, setEtchTex] = useState<THREE.CanvasTexture | null>(null);
  const etchId = etch?.id;
  const etchBody = etch?.body;
  const etchEm = etch?.settings.emMm;
  const etchWeight = etch?.settings.weight;
  const etchBW = etch?.settings.blockW;
  const etchBH = etch?.settings.blockH;
  const faceW = dims.faceWidthMm;
  const faceH = dims.faceHeightMm;
  useEffect(() => {
    if (!etchId || !etchBody || etchEm === undefined || etchWeight === undefined || etchBW === undefined || etchBH === undefined) return;
    let cancelled = false;
    let made: THREE.CanvasTexture | null = null;
    (async () => {
      try {
        const family = await resolveEtchFamily(etchWeight, etchBody);
        if (cancelled) return;
        made = buildEtchTexture(etchId, etchBody, faceW, faceH, etchEm, etchWeight, etchBW, etchBH, family).texture;
        /* ⚠ THE UPLOAD HAPPENS HERE, at a moment chosen — not inside whatever
           frame first draws it (Architect F3). Timed separately from the paint
           and from the first render's program compile. */
        const t0 = performance.now();
        gl.initTexture(made);
        performance.measure(`etch:upload:${etchId}`, { start: t0, end: performance.now() });
        if (cancelled) return;
        performance.mark(`etch:ready:${etchId}`);
        setEtchTex(made);
        invalidate();
      } catch (e) {
        console.error(`⛔ ETCH NOT MOUNTED on ${etchId} — ${e instanceof Error ? e.message : e}`);
      }
    })();
    return () => {
      cancelled = true;
      made?.dispose();
    };
  }, [etchId, etchBody, etchEm, etchWeight, etchBW, etchBH, faceW, faceH, gl, invalidate]);

  return (
    <group>
      {/* ⛔⛔ THE RIM — CLEAR GLASS, NOT FROSTED. Carl, 18 September 2026:
          *"The rim, which will be a neon light should be clear glass with a
          roughness value of around 0.10."*

          ⚠⚠ THE REASON IS ITS JOB: **this rim IS the neon** (see the half-tube
          note above). A frosted rim would scatter its own emission; a clear one
          stays a legible light source.

          ⛔ CORRECTED 23 September 2026, in place per the amendable rule. This
          read: *"The neon is chunk 3 and is NOT built — four colours are ruled
          and none is chosen."* ⚠ **Both halves are overtaken:** D-090 retired
          the four colours on 22 September (the neon is BLUE, built pair by
          pair), and **D-093 built the WALL PAIR's (CA, CB) neon** on 23
          September — the `neon` branch below. **The floor pair's is not built.** */}
      <mesh geometry={rimGeometry}>
        {glass ? (
          <meshPhysicalMaterial
            /* ⛔ D-093 — registered with the writer; `emissiveIntensity` starts
               at 0 and is written EVERY FRAME by `NeonBloom`, never by a prop,
               so a re-render cannot reset a lit tube. ⚠ The glass values above
               and below are D-089's and are NOT touched by the neon. */
            ref={
              neon
                ? (m: THREE.MeshPhysicalMaterial) => {
                    Object.assign(neon, { rim: m });
                    return () => {
                      Object.assign(neon, { rim: null });
                    };
                  }
                : undefined
            }
            {...(neon ? { emissive: neon.tubeColor, emissiveIntensity: 0 } : {})}
            color={GLASS_COLOR}
            roughness={GLASS_RIM_ROUGHNESS}
            metalness={GLASS_METALNESS}
            transmission={GLASS_TRANSMISSION}
            thickness={glassThicknessMm}
            ior={GLASS_IOR}
            attenuationColor={GLASS_ATTENUATION_COLOR}
            attenuationDistance={GLASS_ATTENUATION_DISTANCE}
            side={THREE.FrontSide}
          />
        ) : (
          <meshStandardMaterial
            color={DIAG_RIM_COLOR}
            roughness={0.55}
            metalness={0}
          />
        )}
      </mesh>
      {/* ⛔⛔ THE EMITTER — D-093. The bloom's ONLY input. It SHARES
          `rimGeometry` — the same object, so the glow's shape cannot drift from
          the tube's — and sits on `NEON_LAYER` ALONE, so the base render never
          draws it; only `NeonBloom`'s neon pass does.

          ⚠ THE LAYER IS SET IN THE REF, NOT AS `layers={n}` — Architect F14.

          ⚠⚠ `toneMapped={false}` IS REDUNDANT HERE AND IS NOT WHAT PROTECTS
          IT — Architect F10. The emitter only ever renders into a render target,
          and three applies no tone mapping to a target at all
          (`WebGLRenderer.js:2351-2357`). ⛔ **The flag records intent; do not
          read it as load-bearing.** That the bloom is never tone-mapped is what
          keeps the glow NAVY while the ACES-mapped tube whitens. */}
      {neon && glass && (
        <mesh
          geometry={rimGeometry}
          /* ⛔ GUARD THE NULL. React calls a ref callback with `null` whenever
             it swaps the function (every re-render of an inline ref). The
             unguarded first build threw here, OUTSIDE `NeonBloom`'s isolation,
             and took the whole canvas down with a lost context — caught by the
             identity gate's `?neon=off` arm on 23 September 2026. */
          ref={(m: THREE.Mesh | null) => {
            m?.layers.set(NEON_LAYER);
          }}
        >
          <meshBasicMaterial
            ref={(m: THREE.MeshBasicMaterial) => {
              Object.assign(neon, { emitter: m });
              return () => {
                Object.assign(neon, { emitter: null });
              };
            }}
            color="#000000"
            toneMapped={false}
          />
        </mesh>
      )}
      {/* ⛔ THE BEVEL — FROSTED GLASS FOR NOW. Carl, 18 September 2026: *"For the
          moment, lets go with frosted glass."*

          ⚠⚠ **NOT SETTLED, AND THE ALTERNATIVE IS LIVE.** Carl's reasoning: the
          bevel is STRUCTURAL — it attaches the face to the rim — and ⛔ **that job
          does not dictate the material.** *"It could be frosted glass or it could
          be metallic - it cannot stay as a grey placeholder."* **Both would
          reflect the neon; they differ in how.** His distinction: *"If its frosted
          glass it would look cleaner. If, for instance, its silver metallic the
          light would behave differently and look differently WHEN THE NEON LIGHT
          IS OFF."*

          ⛔⛔ **THE OFF STATE IS THE ARGUMENT, AND IT IS WHY THIS IS DEFERRED
          RATHER THAN DECIDED.** A card with its neon off is a real state of this
          design, and glass and metal diverge most there. ⚠ **It cannot be judged
          until the neon exists.** ⛔ *(Corrected 23 September 2026: this read
          "chunk 3, four colours ruled, none chosen". D-090 made the neon BLUE;
          D-093 built the WALL pair's — so CA and CB are now the place to judge
          the bevel lit AND off.)*

          ⚠ **AN EARLIER VERSION OF THIS COMMENT RECORDED FROSTED AS CARL'S
          DECISION AND THAT OVERSTATED IT.** He offered it as one of two
          candidates; the Builder read a candidate as a ruling. Corrected in place
          rather than silently, per `context-rules.md`.

          ⚠ IT TRACKS THE FACE'S FADER DELIBERATELY, not a second dial. *"Same as
          the face"* is a relationship, and giving the bevel its own roughness
          would let the two drift apart silently the first time the face is
          re-tuned. */}
      <mesh geometry={bevelGeometry}>
        {glass ? (
          <meshPhysicalMaterial
            color={GLASS_COLOR}
            roughness={glassRoughness}
            metalness={GLASS_METALNESS}
            /* ⚠ THE FACE'S TRANSMISSION, NOT THE RIM'S — the bevel is frosted
               and tracks the face, for the same reason it tracks its
               roughness. See `GLASS_FACE_TRANSMISSION`. */
            transmission={glassFaceTransmission}
            thickness={glassThicknessMm}
            ior={GLASS_IOR}
            attenuationColor={GLASS_ATTENUATION_COLOR}
            attenuationDistance={GLASS_ATTENUATION_DISTANCE}
            side={THREE.FrontSide}
          />
        ) : (
          <meshStandardMaterial
            color={DIAG_BEVEL_COLOR}
            roughness={0.55}
            metalness={0}
          />
        )}
      </mesh>
      <mesh
        geometry={faceGeometry}
        position={[0, 0, baseZ]}
        /* ⚠ D-094's extruded text: the letters' shadows land on the face of the
           ONE card carrying text on this load (`extrudeCard` — plain `/about`
           shows CB while it is worked on; `?extrude=ca|cb|cd|cs` picks one). Off
           everywhere else; `false` is three's own default. ⚠ *Corrected in
           place:* this read "(CA — plain `/about`…; was `?extrude=1` only)". */
        receiveShadow={faceReceiveShadow}
      >
        {/* ⚠ NO NORMAL MAP. The convex-normal-map route was tested and closed on
            14 September 2026 — Carl: *"NO change. CD is the way to go."* The
            curvature is real geometry; see `ovalHeight`. */}
        {glass ? (
          /* ⛔⛔ CHUNK 2a — CS'S FROSTED FACE, BENCH ONLY. Reached only through
             the `glass` prop, which is OFF by default; see its note for the
             milky-slab artefact that gate exists to prevent.

             ⚠ THE COLOUR IS WHITE AND NOT `DIAG_FACE_COLOR` DELIBERATELY:
             transmission is multiplied by `color`, so the grey would tint this
             "colourless" glass to 78%. See `GLASS_COLOR`.

             ⚠ `thickness` IS IN MILLIMETRES — object space, already scaled by
             the group's scale. ⛔ Do NOT divide it by `MM_PER_UNIT`. */
          <meshPhysicalMaterial
            color={GLASS_COLOR}
            roughness={glassRoughness}
            metalness={GLASS_METALNESS}
            /* ⛔⛔ BELOW 1.0, AND THAT IS WHAT GIVES THE CARD A BODY. At 1.0
               there is no diffuse contribution at all, so the face took its
               brightness entirely from the background and vanished against the
               dark desk. ⚠ `GLASS_COLOR`'s white is INERT at 1.0 and only
               starts to read below it. See `GLASS_FACE_TRANSMISSION`. */
            transmission={glassFaceTransmission}
            thickness={glassThicknessMm}
            ior={GLASS_IOR}
            attenuationColor={GLASS_ATTENUATION_COLOR}
            attenuationDistance={GLASS_ATTENUATION_DISTANCE}
            side={THREE.FrontSide}
          />
        ) : (
          <meshStandardMaterial
            color={DIAG_FACE_COLOR}
            roughness={0.55}
            metalness={0}
          />
        )}
      </mesh>
      {/* ⛔⛔ THE ETCHED TEXT — D-094, 24 September 2026. TWO MESHES, BOTH SHARING
          `faceGeometry` — the same object, as the emitter shares `rimGeometry`, so
          the words cannot drift from the dome.

          ⚠⚠ TWO, NOT ONE — Architect F1. In one transparent material the emissive
          is inside the colour that gets multiplied by alpha, so the glow would be
          capped by the frost's opacity and `etchop=0` could never glow. Frost
          COVERS what is behind it (normal blend); escaping light ADDS to it
          (additive). Two blend terms, two meshes.

          ⚠ SIBLINGS OF THE FACE, NEVER CHILDREN, with the face's own position —
          nesting would double the offset (Architect S2). Coplanar with the glass
          ("etched IN it"), held in front by `polygonOffset`, not lifted.

          ⚠ `renderOrder` 1 then 2: both are transparent at the same depth, so
          without it their order would fall to creation order. Frost first, so it
          never covers the glow. */}
      {etch && etchTex && (
        <mesh geometry={faceGeometry} position={[0, 0, baseZ]} renderOrder={1}>
          <meshStandardMaterial
            color="#ffffff"
            roughness={etch.settings.roughness}
            metalness={0}
            transparent
            opacity={etch.settings.opacity}
            alphaMap={etchTex}
            depthWrite={false}
            polygonOffset
            polygonOffsetFactor={-1}
            polygonOffsetUnits={-4}
          />
        </mesh>
      )}
      {/* ⚠ THE GLOW needs a channel: with `?neon=none` it is not mounted and the
          frost renders unlit (Architect S3). Black until the writer sets it. */}
      {etch && etchTex && neon && (
        <mesh geometry={faceGeometry} position={[0, 0, baseZ]} renderOrder={2}>
          <meshBasicMaterial
            ref={(m: THREE.MeshBasicMaterial | null) => {
              /* ⛔ NULL-GUARDED — the D-093 lesson: an unguarded ref here threw
                 outside the writer's isolation and lost the whole context. */
              if (!m) return;
              Object.assign(neon, { textGlow: m });
              return () => {
                Object.assign(neon, { textGlow: null });
              };
            }}
            color="#000000"
            transparent
            blending={THREE.AdditiveBlending}
            alphaMap={etchTex}
            depthWrite={false}
            polygonOffset
            polygonOffsetFactor={-1}
            polygonOffsetUnits={-4}
          />
        </mesh>
      )}
    </group>
  );
}

/** Convenience: dimensions for a card, exported so the bench can print them. */
export { cardDims, maxFaceTiltDegrees };
