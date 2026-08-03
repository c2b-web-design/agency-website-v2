"use client";

/**
 * Q&A answer-card mesh — ONE compound object built from three concentric parts
 * read as a single assembly:
 *
 *   RIM   — a HALF-TUBE swept along the card's rounded-rectangle perimeter. Its
 *           outermost point IS the approved 186.66 x 48 silhouette; nothing may
 *           extend beyond it.
 *   BEVEL — a swept band, sloping inward and TOWARD THE VIEWER.
 *   FACE  — a slightly convex plane, RECESSED behind the rim's apex.
 *
 * All three are placed on ONE sampled path (`sampleRoundedRectPath`) at
 * different insets, so their silhouettes are true parallel offsets of each other
 * and cannot drift apart.
 *
 * ⚠ CARL'S SPECIFICATION, 3 August 2026:
 *   *"It already has a rim where the filament goes. What I imagine after that,
 *   if I describe just the top, is a 'slope' that comes toward us. Equidistant
 *   all the way around. Top, bottom, sides and corners. The face can be flat or
 *   slightly convex."*
 *   *"The rim should be a half tube, that way it will emit light onto the bevel
 *   and face, and if it's making a journey down the right hand side it will
 *   affect the 2 card and all other cards will be affected by proximity."*
 *
 * ⚠ THE HALF-TUBE IS A LENS FOR THE LIGHT IT WILL CARRY (chunk 4). A flat rim
 * emits roughly forward. A half-round presents every angle between the face and
 * the outer edge at once, so ONE geometry throws light three ways: inward onto
 * the bevel and face, outward to neighbouring cards, and at the viewer. That is
 * the whole reason the filament's secondary effects come for free in a real
 * scene and had to be hand-authored in CSS (`GRID_REFL`, `--sweep-pass`).
 *
 * ⚠ THIS IS NOT THE CONTACT FIELD'S RIM. That one is a flat `ExtrudeGeometry`
 * (`contact-field-mesh.tsx`, RIM_DEPTH 6, bevelEnabled false). The helpers below
 * are COPIED rather than imported: the contact field is APPROVED and must not
 * move when this card is tuned.
 *
 * GEOMETRY PROOF ONLY: neutral three-tone diagnostic material, no colour
 * direction, no transmission, no clearcoat, no environment map, no filament, no
 * text. All values are named constants so later tuning is a value change.
 */

import { useMemo, useEffect } from "react";
import * as THREE from "three";
import {
  CARD_WIDTH_PX,
  CARD_HEIGHT_PX,
  CARD_RADIUS_PX,
  RIM_TUBE_RADIUS,
  BEVEL_WIDTH,
  BEVEL_RISE,
  CROWN_HEIGHT,
  CROWN_PLATEAU_U,
  FACE_SEAM_SINK,
  cardBudget,
} from "./answer-card-geometry";
import {
  GLASS_COLOR,
  GLASS_ROUGHNESS,
  GLASS_TRANSMISSION,
  GLASS_THICKNESS,
  GLASS_IOR,
  GLASS_ENV_INTENSITY,
} from "./answer-card-glass";

/**
 * The two glass properties that are adjustable.
 *
 * ⚠ `thickness` AND `ior` ARE DELIBERATELY ABSENT. Under an orthographic camera
 * their maximum effect across the whole face is 0.801px — they would move
 * numbers and change nothing on screen. See `answer-card-glass.ts` for the
 * measured displacement table.
 */
export type GlassTuning = {
  roughness: number;
  transmission: number;
};

export const DEFAULT_GLASS_TUNING: GlassTuning = {
  roughness: GLASS_ROUGHNESS,
  transmission: GLASS_TRANSMISSION,
};

// ── Diagnostic material ──────────────────────────────────────────────────────
// Three distinct greys so rim, bevel and face are separable by eye.
//
// ⚠ GREY IS THE POINT, NOT A PLACEHOLDER. A form defect hides behind a colour
// that already looks plausible: the contact field's 5.67-degree crown failure
// was only findable under a diagnostic material, because a blue-tinted card
// would have read as "roughly right" and carried the defect into the material
// chunk. Confirmed by Carl, 3 August.
const DIAG_RIM_COLOR = "#6a6a6a";
const DIAG_BEVEL_COLOR = "#8a8a8a";
const DIAG_FACE_COLOR = "#a8a8a8";

/** Samples around the perimeter. Corners need the density; straights do not suffer. */
const PATH_SAMPLES = 240;

/** Segments around the half-tube's semicircular profile. */
const TUBE_PROFILE_SEGMENTS = 10;

/** Tessellation of the convex face. */
const FACE_SEGMENTS_U = 96;
const FACE_SEGMENTS_V = 32;

// ── The shared path ──────────────────────────────────────────────────────────

type PathPoint = {
  /** Position on the path, in the card's plane. */
  x: number;
  y: number;
  /** Outward unit normal, in the card's plane. */
  nx: number;
  ny: number;
};

/**
 * Sample a rounded-rectangle perimeter, with an outward normal at every point.
 *
 * ⚠ ONE SAMPLER FOR EVERY PART. The rim, the bevel and the face boundary are all
 * placed on this path at different insets, so they are TRUE PARALLEL OFFSETS by
 * construction. The contact field instead builds three separate `THREE.Shape`s
 * and relies on `insetRadius()` arithmetic to keep them concentric; that works,
 * but it expresses one silhouette three times and the copies can disagree.
 *
 * The normal is exact rather than estimated by differencing: on the straights it
 * is axis-aligned, and in a corner it is the radial direction from that corner's
 * arc centre. Differencing would round the corners' normals slightly and show up
 * as a faint facet ring under a moving light.
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

  const straightX = 2 * (width - 2 * r); // top + bottom
  const straightY = 2 * (height - 2 * r); // left + right
  const arcs = 2 * Math.PI * r; // four quarter-turns
  const total = straightX + straightY + arcs;

  const pts: PathPoint[] = [];

  for (let i = 0; i < samples; i++) {
    // Distance travelled anticlockwise from the middle of the right edge.
    let d = (i / samples) * total;

    // 1. Right edge, upward from centre-right to the top-right arc.
    const rightHalf = hh - r;
    if (d < rightHalf) {
      pts.push({ x: hw, y: d, nx: 1, ny: 0 });
      continue;
    }
    d -= rightHalf;

    // 2. Top-right corner arc, 0 -> 90 degrees.
    const quarter = (Math.PI / 2) * r;
    if (d < quarter) {
      const a = (d / quarter) * (Math.PI / 2);
      const nx = Math.cos(a);
      const ny = Math.sin(a);
      pts.push({ x: hw - r + nx * r, y: hh - r + ny * r, nx, ny });
      continue;
    }
    d -= quarter;

    // 3. Top edge, rightward to leftward.
    const topRun = width - 2 * r;
    if (d < topRun) {
      pts.push({ x: hw - r - d, y: hh, nx: 0, ny: 1 });
      continue;
    }
    d -= topRun;

    // 4. Top-left corner arc, 90 -> 180 degrees.
    if (d < quarter) {
      const a = Math.PI / 2 + (d / quarter) * (Math.PI / 2);
      const nx = Math.cos(a);
      const ny = Math.sin(a);
      pts.push({ x: -hw + r + nx * r, y: hh - r + ny * r, nx, ny });
      continue;
    }
    d -= quarter;

    // 5. Left edge, downward.
    const leftRun = height - 2 * r;
    if (d < leftRun) {
      pts.push({ x: -hw, y: hh - r - d, nx: -1, ny: 0 });
      continue;
    }
    d -= leftRun;

    // 6. Bottom-left corner arc, 180 -> 270 degrees.
    if (d < quarter) {
      const a = Math.PI + (d / quarter) * (Math.PI / 2);
      const nx = Math.cos(a);
      const ny = Math.sin(a);
      pts.push({ x: -hw + r + nx * r, y: -hh + r + ny * r, nx, ny });
      continue;
    }
    d -= quarter;

    // 7. Bottom edge, leftward to rightward.
    if (d < topRun) {
      pts.push({ x: -hw + r + d, y: -hh, nx: 0, ny: -1 });
      continue;
    }
    d -= topRun;

    // 8. Bottom-right corner arc, 270 -> 360 degrees.
    if (d < quarter) {
      const a = (3 * Math.PI) / 2 + (d / quarter) * (Math.PI / 2);
      const nx = Math.cos(a);
      const ny = Math.sin(a);
      pts.push({ x: hw - r + nx * r, y: -hh + r + ny * r, nx, ny });
      continue;
    }
    d -= quarter;

    // 9. Right edge, up to the starting point.
    pts.push({ x: hw, y: -hh + r + d, nx: 1, ny: 0 });
  }

  return pts;
}

/**
 * Half-width of a rounded rectangle at height `y`, measured from its centre.
 *
 * Copied from `contact-field-mesh.tsx` (which takes radius as a parameter and
 * does NOT close over `FIELD_RADIUS_PX`). Used by the face generator so the
 * face's boundary is the same curve as the swept parts rather than an
 * independent approximation.
 */
function roundedRectHalfWidthAt(y: number, halfW: number, halfH: number, r: number): number {
  const absY = Math.abs(y);
  if (absY <= halfH - r) return halfW;
  const dy = Math.min(absY - (halfH - r), r);
  return halfW - r + Math.sqrt(Math.max(0, r * r - dy * dy));
}

/**
 * Convex crown height at normalised position (u, v), each in [-1, 1].
 *
 * ⚠ SEPARABLE AND MULTIPLICATIVE — `H * longAxis * shortAxis`. Not two
 * independent heights (they do not compose in this form) and not radial: a
 * radial dome would read as a circular blister in the middle of a long card and
 * fall away far too fast across the short axis.
 *
 * The SHORT axis carries a RAISED cosine `(1 + cos(v*pi)) / 2`, which reaches
 * zero derivative at the boundary so the face meets the bevel without a crease.
 * The LONG axis holds full height across `CROWN_PLATEAU_U` and rolls off only in
 * the last `1 - CROWN_PLATEAU_U` at each end — otherwise the crown tapers to a
 * point and reads as an elliptical blister.
 *
 * Copied in form from `contact-field-mesh.tsx`'s `crownZ`, which is the shape
 * already approved there.
 */
function crownZ(u: number, v: number, crownHeight: number, plateauU: number): number {
  const shortAxis = (1 + Math.cos(v * Math.PI)) / 2;

  let longAxis = 1;
  const au = Math.abs(u);
  if (au > plateauU) {
    const t = (au - plateauU) / (1 - plateauU);
    longAxis = (1 + Math.cos(t * Math.PI)) / 2;
  }

  return crownHeight * longAxis * shortAxis;
}

// ── Swept-band builder, shared by the rim and the bevel ──────────────────────

/**
 * Build a closed swept surface by placing a profile at every path sample and
 * bridging consecutive rings.
 *
 * `profile` returns, for a parameter t in [0, 1], how far to move INWARD from
 * the path (`inward`) and how far FORWARD toward the viewer (`forward`), plus
 * the profile's own normal in that 2D cross-section.
 *
 * ⚠ THE LOOP IS CLOSED BY WRAPPING THE RING INDEX, not by appending a duplicate
 * ring — a duplicate would leave a hairline seam where the two coincident rings
 * z-fight under a moving light.
 */
function sweptBand(
  path: PathPoint[],
  profileSegments: number,
  profile: (t: number) => { inward: number; forward: number; nIn: number; nFwd: number },
): THREE.BufferGeometry {
  const rings = path.length;
  const cols = profileSegments + 1;

  const positions = new Float32Array(rings * cols * 3);
  const normals = new Float32Array(rings * cols * 3);

  for (let i = 0; i < rings; i++) {
    const p = path[i];
    for (let j = 0; j < cols; j++) {
      const t = j / profileSegments;
      const { inward, forward, nIn, nFwd } = profile(t);
      const idx = (i * cols + j) * 3;

      // Move inward along the path's own outward normal, negated.
      positions[idx] = p.x - p.nx * inward;
      positions[idx + 1] = p.y - p.ny * inward;
      positions[idx + 2] = forward;

      // The profile normal, rotated into the path's frame. The in-plane
      // component follows the path normal; the forward component is z.
      normals[idx] = p.nx * nIn;
      normals[idx + 1] = p.ny * nIn;
      normals[idx + 2] = nFwd;
    }
  }

  const indices: number[] = [];
  for (let i = 0; i < rings; i++) {
    const next = (i + 1) % rings; // wrap — closes the loop with no seam
    for (let j = 0; j < profileSegments; j++) {
      const a = i * cols + j;
      const b = next * cols + j;
      const c = next * cols + j + 1;
      const d = i * cols + j + 1;
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  geo.setIndex(indices);
  geo.computeBoundingBox();
  geo.computeBoundingSphere();
  return geo;
}

/**
 * The convex face, as a genuinely rounded-rectangle tessellated surface.
 *
 * ⚠ A RECTANGULAR PLANE RELYING ON THE BEVEL TO HIDE ITS SQUARE CORNERS WOULD BE
 * WRONG, and would come apart the moment the material becomes transmissive: the
 * visible inner boundary would be an intersection contour rather than the face's
 * own outline, and it would change shape with crown height. Each row is inset to
 * the true rounded-rect half-width at that height.
 */
function convexFaceGeometry(
  width: number,
  height: number,
  radius: number,
  crownHeight: number,
  plateauU: number,
): THREE.BufferGeometry {
  const halfW = width / 2;
  const halfH = height / 2;
  const r = Math.max(0, Math.min(radius, halfW, halfH));

  const cols = FACE_SEGMENTS_U + 1;
  const rows = FACE_SEGMENTS_V + 1;
  const positions = new Float32Array(cols * rows * 3);

  for (let iy = 0; iy < rows; iy++) {
    const v = (iy / FACE_SEGMENTS_V) * 2 - 1; // -1 .. 1
    const y = v * halfH;
    const rowHalfW = roundedRectHalfWidthAt(y, halfW, halfH, r);

    for (let ix = 0; ix < cols; ix++) {
      const u = (ix / FACE_SEGMENTS_U) * 2 - 1; // -1 .. 1
      const x = u * rowHalfW;

      // ⚠ The crown is evaluated on the ROW-NORMALISED u, so the roll-off
      // follows the rounded boundary instead of a rectangle inscribed in it.
      const idx = (iy * cols + ix) * 3;
      positions[idx] = x;
      positions[idx + 1] = y;
      positions[idx + 2] = crownZ(u, v, crownHeight, plateauU);
    }
  }

  // ⚠ WINDING IS COUNTER-CLOCKWISE SO THE NORMALS FACE +Z (the camera and the
  // light). An earlier build wound these the other way, and `computeVertexNormals`
  // duly produced normals pointing at -z — every one of 3201 of them. The face
  // was lit from BEHIND and rendered a perfectly uniform rgb(44,44,44): ambient
  // only, no directional contribution, no gradient across a convex surface.
  //
  // ⚠ AND `side: DoubleSide` HID IT. The face was still visible, so nothing
  // looked broken — it just looked flat and dark, which is exactly the symptom
  // this whole chunk exists to avoid. Caught by sampling rendered pixels and
  // finding them uniform, not by any assertion: the tilt check passed throughout
  // because it reads |normal.z| and a flipped normal has the same magnitude.
  const indices: number[] = [];
  for (let iy = 0; iy < FACE_SEGMENTS_V; iy++) {
    for (let ix = 0; ix < FACE_SEGMENTS_U; ix++) {
      const a = iy * cols + ix;
      const b = (iy + 1) * cols + ix;
      const c = (iy + 1) * cols + ix + 1;
      const d = iy * cols + ix + 1;
      indices.push(a, d, b);
      indices.push(b, d, c);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setIndex(indices);
  // ⚠ Computed from the surface itself, never asserted from the crown constant —
  // the verification harness reads these normals back, and a normal derived from
  // the same constant as the crown could not disprove anything.
  geo.computeVertexNormals();
  geo.computeBoundingBox();
  geo.computeBoundingSphere();
  return geo;
}

/** Dispose a geometry when the component unmounts. */
function useDisposable(geo: THREE.BufferGeometry) {
  useEffect(() => () => geo.dispose(), [geo]);
}

export type AnswerCardTuning = {
  tubeRadius: number;
  bevelWidth: number;
  bevelRise: number;
  crownHeight: number;
  plateauU: number;
  /**
   * How far the face's apex sits BEHIND the rim's apex, in world units.
   *
   * ⚠ POSITIVE MEANS RECESSED, AND THE DEFAULT IS RECESSED — decided by the
   * Builder on Carl's delegation, 3 August. See `FACE_SEAM_SINK` in
   * `answer-card-geometry.ts` for the four reasons. Exposed here so Carl can
   * overrule by eye; it will not go proud without a deliberate change.
   */
  faceRecess: number;
};

export const DEFAULT_TUNING: AnswerCardTuning = {
  tubeRadius: RIM_TUBE_RADIUS,
  bevelWidth: BEVEL_WIDTH,
  bevelRise: BEVEL_RISE,
  crownHeight: CROWN_HEIGHT,
  plateauU: CROWN_PLATEAU_U,
  faceRecess: FACE_SEAM_SINK - CROWN_HEIGHT,
};

/**
 * The card assembly.
 *
 * Z convention: the rim's apex sits at z = `tubeRadius` (its profile sweeps from
 * z = 0 at the outer silhouette round to z = 0 at the inner edge, peaking at the
 * top of the half-round). Everything else is placed relative to that so the
 * recess decision is expressed once.
 */
export function AnswerCardMesh({
  tuning = DEFAULT_TUNING,
  groupRef,
  glass = false,
  glassTuning = DEFAULT_GLASS_TUNING,
  faceMaterialRef,
}: {
  tuning?: AnswerCardTuning;
  groupRef?: React.Ref<THREE.Group>;
  /**
   * Whether the face wears glass (chunk 2) or chunk 1's diagnostic grey.
   *
   * ⚠ THE RIM AND BEVEL ARE UNAFFECTED EITHER WAY and stay grey. Colouring them
   * in the same chunk that introduces the glass would mix two variables Carl
   * could otherwise separate, and it contradicts chunk 1's own argument that
   * grey exists so a form defect cannot hide behind a plausible colour.
   */
  glass?: boolean;
  glassTuning?: GlassTuning;
  /** So the canvas can attach the locally generated environment map. */
  faceMaterialRef?: React.Ref<THREE.MeshPhysicalMaterial>;
}) {
  const { tubeRadius, bevelWidth, bevelRise, crownHeight, plateauU, faceRecess } = tuning;

  const path = useMemo(
    () => sampleRoundedRectPath(CARD_WIDTH_PX, CARD_HEIGHT_PX, CARD_RADIUS_PX, PATH_SAMPLES),
    [],
  );

  // ── RIM — the half-tube. Its outermost point IS the silhouette. ──
  //
  // The profile runs from theta = 0 (on the silhouette, z = 0) through theta =
  // pi/2 (the apex, inward by R, z = R) to theta = pi (inward by 2R, z = 0).
  //
  // ⚠ THIS IS WHY THE RIM CONSUMES 2R PER SIDE, NOT R. The sweep path is inset
  // by R so that theta = 0 lands exactly on the silhouette; theta = pi therefore
  // lands 2R inside it. The plan's first draft assumed R and its defaults failed
  // its own budget assertion.
  const rimGeometry = useMemo(() => {
    const inset = tubeRadius; // path centre-line
    const centred = path.map((p) => ({
      x: p.x - p.nx * inset,
      y: p.y - p.ny * inset,
      nx: p.nx,
      ny: p.ny,
    }));
    return sweptBand(centred, TUBE_PROFILE_SEGMENTS, (t) => {
      const theta = t * Math.PI;
      return {
        // Relative to the centre-line: outward at theta 0, inward at theta pi.
        inward: -Math.cos(theta) * tubeRadius,
        forward: Math.sin(theta) * tubeRadius,
        nIn: -Math.cos(theta),
        nFwd: Math.sin(theta),
      };
    });
  }, [path, tubeRadius]);

  // ── BEVEL — a swept band sloping inward and TOWARD THE VIEWER. ──
  //
  // ⚠ A SWEPT BAND, NOT AN `ExtrudeGeometry` BEVEL, and that choice has three
  // consequences, all wanted:
  //   1. The corners are a true parallel offset BY CONSTRUCTION, because every
  //      ring sits on the same sampled path at a different inset.
  //   2. `safeBevelSize` from the contact field has NO REFERENT here — it guards
  //      ExtrudeGeometry's inward erosion near the corner radius, and a swept
  //      band has no such erosion. Copying it would be cargo-cult.
  //   3. There is no solid front cap, so the contact field's aperture problem
  //      (cutting a real hole so the face's own outline is visible rather than
  //      an iso-height intersection contour) does not arise: a band is open.
  const bevelGeometry = useMemo(() => {
    const start = 2 * tubeRadius; // where the rim's inner edge lands
    const centred = path.map((p) => ({
      x: p.x - p.nx * start,
      y: p.y - p.ny * start,
      nx: p.nx,
      ny: p.ny,
    }));

    // Slope normal: the band rises `bevelRise` across `bevelWidth` inward.
    const len = Math.hypot(bevelWidth, bevelRise) || 1;
    const nIn = bevelRise / len; // tilts to face outward-and-forward
    const nFwd = bevelWidth / len;

    return sweptBand(centred, 4, (t) => ({
      inward: t * bevelWidth,
      forward: t * bevelRise,
      nIn,
      nFwd,
    }));
  }, [path, tubeRadius, bevelWidth, bevelRise]);

  // ── FACE — convex, and RECESSED behind the rim's apex. ──
  const faceGeometry = useMemo(() => {
    const budget = cardBudget(tubeRadius, bevelWidth);
    return convexFaceGeometry(
      budget.faceWidth,
      budget.faceHeight,
      budget.faceRadius,
      crownHeight,
      plateauU,
    );
  }, [tubeRadius, bevelWidth, crownHeight, plateauU]);

  useDisposable(rimGeometry);
  useDisposable(bevelGeometry);
  useDisposable(faceGeometry);

  // ── Where the face sits in z ──────────────────────────────────────────────
  //
  // ⚠ THE FACE JOINS THE BEVEL, NOT THE RIM, so its apex is measured from the
  // BEVEL'S INNER EDGE (`bevelRise`) — not from the rim's apex.
  //
  // ⚠ A FIRST BUILD ANCHORED THIS TO THE RIM AND THE CARD RENDERED WITH A BLACK
  // INTERIOR. With rim apex 2, recess 0.5 and crown 4.5 the face apex landed at
  // z = 1.5 while the bevel's inner edge stood at z = 2.5 — so the bevel rose
  // ABOVE the face and the face sat at the bottom of a well, correctly lit and
  // correctly invisible. The geometry was doing exactly what it was told.
  //
  // Anchoring here means the face's apex sits `faceRecess` below the lip it
  // meets, which is what "recessed behind the rim" actually has to mean once the
  // bevel rises. Raising the crown still sinks the base plane by the same
  // amount, so curvature grows BACKWARD and the apex never breaches the lip.
  const bevelInnerZ = bevelRise;
  const faceApexZ = bevelInnerZ - faceRecess;
  const faceBaseZ = faceApexZ - crownHeight;

  return (
    <group ref={groupRef}>
      <mesh geometry={rimGeometry}>
        <meshStandardMaterial
          color={DIAG_RIM_COLOR}
          roughness={0.55}
          metalness={0}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh geometry={bevelGeometry} position={[0, 0, 0]}>
        <meshStandardMaterial
          color={DIAG_BEVEL_COLOR}
          roughness={0.6}
          metalness={0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/*
        ⚠ THE FACE IS THE ONLY TRANSMISSIVE SURFACE, and that is a constraint
        rather than a preference. `three.module.js:18039` renders `opaqueObjects`
        ONLY into the transmission target, and the render-list split at `:8237`
        pushes anything with `transmission > 0` into a separate list. So a
        transmissive rim or bevel would DELETE ITSELF from what the face
        refracts — the card would lose its own edges.

        ⚠ AND THE RIM AND BEVEL ARE ALREADY EXCLUDED DURING THE ENTRANCE, for
        the OTHER arm of the same rule: the entrance sets `transparent = true`
        while it fades, and `transparent === true` also routes a material away
        from the opaque list. They rejoin it once the fade completes.
      */}
      <mesh geometry={faceGeometry} position={[0, 0, faceBaseZ]}>
        <meshPhysicalMaterial
          ref={faceMaterialRef}
          color={glass ? GLASS_COLOR : DIAG_FACE_COLOR}
          roughness={glass ? glassTuning.roughness : 0.65}
          metalness={0}
          transmission={glass ? glassTuning.transmission : 0}
          // ⚠ FIXED, NOT TUNABLE — see answer-card-glass.ts. Under an
          // orthographic camera the crown centre is at normal incidence, so the
          // maximum lateral displacement across the whole face is 0.801px.
          thickness={GLASS_THICKNESS}
          ior={GLASS_IOR}
          envMapIntensity={GLASS_ENV_INTENSITY}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

/**
 * Exported for the verification harness.
 *
 * ⚠ THE HARNESS MUST READ TILT FROM THESE NORMALS, SCOPED TO THE FACE ALONE.
 * The half-tube presents the full 0-90 degrees BY CONSTRUCTION — it is the whole
 * reason it was chosen — so a maximum taken across the assembly returns ~90
 * whatever the crown does, INCLUDING at crownHeight 0. A harness that cannot
 * fail is not a harness; `verify/q5-stutter.mjs` reported 0/3 CLEAN on a visible
 * defect for exactly this reason.
 */
export function buildFaceGeometryForTest(
  tubeRadius: number,
  bevelWidth: number,
  crownHeight: number,
  plateauU: number,
): THREE.BufferGeometry {
  const budget = cardBudget(tubeRadius, bevelWidth);
  return convexFaceGeometry(
    budget.faceWidth,
    budget.faceHeight,
    budget.faceRadius,
    crownHeight,
    plateauU,
  );
}
