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

import { useMemo, useEffect } from "react";
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
const CORNER_NORM = 3;

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
   */
  const ovalHeight = (x: number, y: number, ohw: number, ohh: number) => {
    const raw = (px2: number, py2: number) => {
      const su = Math.abs(px2) / (ohw * expand);
      const sv = Math.abs(py2) / (ohh * expand);
      const s = Math.min(
        1,
        Math.pow(
          Math.pow(su, CORNER_NORM) + Math.pow(sv, CORNER_NORM),
          1 / CORNER_NORM,
        ),
      );
      return profile(1 - s);
    };
    const lowest = raw(ohw, ohh); // the card's corner — furthest from centre
    const peak = raw(0, 0);
    const span = peak - lowest || 1;
    return Math.max(0, (raw(x, y) - lowest) / span);
  };

  const positions: number[] = [];
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
      const z = crown * ovalHeight(x, y, hw, hh);
      positions.push(px, py, z);
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
  /** Reports the measured tilt of the built face, for the bench readout. */
  onTilt?: (deg: number) => void;
};

export function AboutCardMesh({
  dims,
  crownMm,
  ovalExpand = OVAL_EXPAND,
  onTilt,
}: AboutCardMeshProps) {
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
      ),
    [dims, crownMm, ovalExpand],
  );

  useDisposable(rimGeometry);
  useDisposable(bevelGeometry);
  useDisposable(faceGeometry);

  // Report the MEASURED tilt, never the predicted one.
  useEffect(() => {
    if (onTilt) onTilt(measuredMaxTiltDegrees(faceGeometry));
  }, [faceGeometry, onTilt]);

  // The face's base sits at the bevel's front plane so the seam does not gap.
  const faceBaseZ = dims.rimBeadMm * 0.8;

  return (
    <group>
      <mesh geometry={rimGeometry}>
        <meshStandardMaterial
          color={DIAG_RIM_COLOR}
          roughness={0.55}
          metalness={0}
        />
      </mesh>
      <mesh geometry={bevelGeometry}>
        <meshStandardMaterial
          color={DIAG_BEVEL_COLOR}
          roughness={0.55}
          metalness={0}
        />
      </mesh>
      <mesh geometry={faceGeometry} position={[0, 0, faceBaseZ]}>
        <meshStandardMaterial
          color={DIAG_FACE_COLOR}
          roughness={0.55}
          metalness={0}
        />
      </mesh>
    </group>
  );
}

/** Convenience: dimensions for a card, exported so the bench can print them. */
export { cardDims, maxFaceTiltDegrees };
