/**
 * The button family's shape — one domed pill, built to any measured box.
 *
 * ⛔ D-088, 12 October 2026. The site's buttons are ONE FAMILY (Carl: *"all come from the same
 * "family". The colour and material may change but theres a theme there."*): Next step's profile —
 * the sharp top rim, the dome, the groove, the lower bevel — at the width each label needs. The
 * crown (8.5) and the flat top come from `nextstep-geometry.ts`, which is LOCKED. ⚠ (Written first as
 * "the profile itself (`crownHeight` …) is read from `nextstep-geometry.ts`" — true until take 3, when
 * Carl had the rim made smaller and the family took its own cross-section; see `FAMILY_PROFILE`.)
 *
 * ⚠⚠ THIS IS A COPY OF `usePillGeometry` IN `components/enquiry/nextstep-canvas.tsx`, AND THE COPY
 * IS DELIBERATE AND TEMPORARY (plan v2, Q1, agreed by the Architect). That hook is private to a
 * component that is live on `/start`; extracting it would edit production code in a build that is
 * not about `/start`. Next step moves onto THIS module when it is redone (Carl: it *"will be
 * redone"*), and the copy ends there.
 *
 * ⚠ THE PROFILE IS NO LONGER NEXT STEP'S (12 October, take 3 — see `FAMILY_PROFILE`): the BUILDER is
 * the copy; the cross-section is the family's own, and Next step's is kept as `NEXTSTEP_PROFILE`.
 *
 * ⚠ THE COPY IS ASSERTED, NOT TRUSTED. `project-intelligence/live-work/scripts/family-geometry-parity.mjs`
 * reads the LIVE Next step mesh out of `/proto/nextstep` in the browser and compares its position,
 * normal and index buffers with this function's output UNDER `NEXTSTEP_PROFILE`. ⚠ **It proves parity at 116.3 × 41 only.**
 * At any other width the two agree by identical logic, not by measurement. If either side changes,
 * run it; if it fails, the two have drifted and the family has two shapes.
 *
 * The reasoning for every choice below (a height field, not swept rings; the grid density; the
 * normal's sampling step; the winding) is recorded at length in the original — read it there
 * rather than here, so the explanation has one home.
 *
 * ⚠ KNOWN, AND PART OF THE SHAPE: quads are kept only where all four corners are inside the pill,
 * at a fixed nx = 220. At ~129 px that is ~0.59 px per column, so a 4× view shows ~2.3 px steps
 * along the edge (Architect, point 4). Inherited from Next step; do not "fix" it here, or the
 * family's two members stop matching.
 */
import * as THREE from "three";
import {
  NEXTSTEP_CROWN_PX,
  NEXTSTEP_GROOVE_AT,
  NEXTSTEP_GROOVE_DEPTH,
  NEXTSTEP_HEIGHT_PX,
  NEXTSTEP_PLATEAU,
} from "@/components/enquiry/nextstep-geometry";

/**
 * The cross-section, as numbers. The crown height (8.5) and the flat top (0.15) are Next step's and
 * are not parameters; what varies is how the dome meets the edge, and where the groove sits.
 *
 *   edgeCut      how much of the raised cosine's fall is used. 1 = all of it, so the curve flattens
 *                into a near-level skirt before the edge (Next step). < 1 stops the fall early and
 *                rescales it, so the dome holds its height further out and meets the edge steeply.
 *   grooveAt     the groove's centre, as a fraction of the fall from the flat top (0) to the edge (1).
 *   grooveWidth  its width, in the same units (a Gaussian; 0.13 is Next step's).
 *   grooveDepth  how far it dips, as a fraction of the crown.
 */
export type PillProfile = { edgeCut: number; grooveAt: number; grooveWidth: number; grooveDepth: number };

/**
 * ⛔ NEXT STEP'S PROFILE, EXACTLY — `crownHeight` in `nextstep-geometry.ts` reproduced bit for bit
 * (edgeCut 1 makes the rescale (b − 0) / 1, an exact identity). Kept so the parity check can still
 * prove THE BUILDER is the live one, now that the family's own profile differs (below).
 */
export const NEXTSTEP_PROFILE: PillProfile = {
  edgeCut: 1,
  grooveAt: NEXTSTEP_GROOVE_AT,
  grooveWidth: 0.13,
  grooveDepth: NEXTSTEP_GROOVE_DEPTH,
};

/**
 * ⛔ THE FAMILY'S PROFILE — A SMALLER RIM (Carl, 12 October 2026: *"The rim shouldnt be that big… do
 * by the numbers of the mesh"*; *"make the rim smaller. Also refer to the ivory button."*).
 *
 * BY THE NUMBERS, Next step's rim is a near-flat skirt 6.6 px wide either side of a 41 px pill (never
 * above 1.6 px high, mostly under 15°): the raised cosine flattens as it reaches the edge. Chrome hides
 * it by mirroring the dark page across it; clay shows it as it is (pass 1, take 2).
 * THE IVORY BUTTON (`.enquiry-begin-btn`, the same 41 px box: `px-6 py-2.5`, 14px) draws its rim in its
 * shadow stack — a 1 px hard top rim (`inset 0 1px 0`) over a 3 px sub-rim (`inset 0 3px 3px`) — about
 * 3 px. So: the fall stopped at 70% (the edge meets the dome steeply, no skirt), the groove 3 px in AT
 * 41 HIGH (grooveAt 1 − 3 / (0.85 × 20.5) — a fraction, so it scales with the height), narrowed to 0.06 so it stays a fine line inside a 3 px rim. From the
 * edge: a lip to 0.74 px by 2 px, the groove's dip at 2.5 px, the dome climbing from 3 px.
 *
 * ⚠ THE FAMILY NOW DIFFERS FROM TODAY'S NEXT STEP, BY DESIGN. Next step's locked numbers are unchanged;
 * it takes this profile when it is redone. Until then the two buttons are not one shape.
 */
export const FAMILY_PROFILE: PillProfile = {
  edgeCut: 0.7,
  grooveAt: 1 - 3 / ((1 - NEXTSTEP_PLATEAU) * 20.5),
  grooveWidth: 0.06,
  grooveDepth: 0.13,
};

/**
 * ⛔ THE CROWN SCALES WITH THE HEIGHT (Carl, 12 October 2026: *"If the height is made taller we can alter the
 * crowns accordingly. it must change proportionately to the height"*). Every other part of the profile — the
 * flat top, the rim, the groove, the dome's fall — is already a FRACTION of the half-height; the crown was the
 * one absolute number (8.5 px, set for a 41 px pill). So: 8.5 per 41 px of height. At 41 this is exactly 8.5
 * (8.5 × 1), so the approved pill and the parity check are unchanged; a taller member keeps the same shape.
 */
export function familyCrown(h: number): number {
  return NEXTSTEP_CROWN_PX * (h / NEXTSTEP_HEIGHT_PX);
}

/**
 * The crown height across the short axis under a profile.
 * @param t      −1 edge … 0 centre … +1 edge
 * @param crown  the crown for this pill's height — `familyCrown(h)`
 */
export function familyCrownHeight(t: number, p: PillProfile, crown: number = NEXTSTEP_CROWN_PX): number {
  const a = Math.abs(t);
  if (a <= NEXTSTEP_PLATEAU) return crown;
  const u = (a - NEXTSTEP_PLATEAU) / (1 - NEXTSTEP_PLATEAU);
  // The raised cosine, cut at `edgeCut` of its fall and rescaled to reach 0 at the edge.
  const floor = (1 + Math.cos(Math.PI * p.edgeCut)) / 2;
  const base = ((1 + Math.cos(Math.PI * p.edgeCut * u)) / 2 - floor) / (1 - floor);
  const d = (u - p.grooveAt) / p.grooveWidth;
  const groove = p.grooveDepth * Math.exp(-d * d);
  return crown * Math.max(0, base - groove);
}

/**
 * The pill's surface height at a point (x, y), px, in the pill's own frame (centred on the origin). The same surface
 * `buildPillGeometry` samples — so anything sitting ON the button (the extruded label, D-088 pass 2) sits on the real
 * dome, not a flat plane under it. 0 outside the pill.
 */
export function familySurfaceZ(x: number, y: number, w: number, h: number, profile: PillProfile = FAMILY_PROFILE): number {
  const r = h / 2;
  const cx = w / 2 - r;
  const clamped = Math.max(-cx, Math.min(cx, x));
  const inset = r - Math.hypot(x - clamped, y);
  if (inset <= 0) return 0;
  return familyCrownHeight(1 - inset / r, profile, familyCrown(h));
}

/** Grid resolution — the original's values; see the note there (ny 88 → 240 for the groove). */
export const FAMILY_GRID_NX = 220;
export const FAMILY_GRID_NY = 240;

/** The central-difference step for normals — must stay well below the groove's half-width. */
const NORMAL_STEP = 0.06;

/**
 * The domed pill as a BufferGeometry, centred on the origin, in CSS-pixel world units
 * (one unit = one CSS px under an orthographic camera at zoom 1).
 *
 * @param w        the measured box width, px
 * @param h        the measured box height, px (41 for the family)
 * @param profile  the cross-section — the family's by default; `NEXTSTEP_PROFILE` for parity
 */
export function buildPillGeometry(w: number, h: number, profile: PillProfile = FAMILY_PROFILE): THREE.BufferGeometry {
  const r = h / 2;
  const cx = w / 2 - r; // the centre-line runs from (-cx,0) to (+cx,0)
  const crown = familyCrown(h);
  const nx = FAMILY_GRID_NX;
  const ny = FAMILY_GRID_NY;

  /** Inset from the boundary: 0 on the outline, r at the centre-line. */
  const insetAt = (x: number, y: number) => {
    const clamped = Math.max(-cx, Math.min(cx, x));
    const d = Math.hypot(x - clamped, y);
    return r - d;
  };

  const zAt = (x: number, y: number) => {
    const inset = insetAt(x, y);
    if (inset <= 0) return 0;
    return familyCrownHeight(1 - inset / r, profile, crown);
  };

  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const index: number[] = [];
  // -1 marks a grid point outside the pill, so triangles can skip it.
  const vid: number[] = new Array((nx + 1) * (ny + 1)).fill(-1);

  for (let j = 0; j <= ny; j++) {
    const y = -r + (j / ny) * (2 * r);
    for (let i = 0; i <= nx; i++) {
      const x = -w / 2 + (i / nx) * w;
      if (insetAt(x, y) < 0) continue;

      const z = zAt(x, y);
      const e = NORMAL_STEP;
      const dzdx = (zAt(x + e, y) - zAt(x - e, y)) / (2 * e);
      const dzdy = (zAt(x, y + e) - zAt(x, y - e)) / (2 * e);
      const n = new THREE.Vector3(-dzdx, -dzdy, 1).normalize();

      vid[j * (nx + 1) + i] = positions.length / 3;
      positions.push(x, y, z);
      normals.push(n.x, n.y, n.z);
      uvs.push(i / nx, j / ny);
    }
  }

  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const a = vid[j * (nx + 1) + i];
      const b = vid[j * (nx + 1) + i + 1];
      const c = vid[(j + 1) * (nx + 1) + i];
      const d = vid[(j + 1) * (nx + 1) + i + 1];
      if (a < 0 || b < 0 || c < 0 || d < 0) continue;
      // Counter-clockwise, as the original — see its note on the winding.
      index.push(a, b, c, b, d, c);
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(index);
  return g;
}

/**
 * ⛔ THE BAND — THE PILL MADE SOLID (D-088, 12 October 2026, session 2). Carl: *"Is the back of the pill flat?"* — there was no
 * back: `buildPillGeometry` is one height-field sheet. Then the forward roll: *"when it goes through 180deg you will see "who
 * we are" again"*. The solid pill is THREE parts: the front dome (`buildPillGeometry`), the SAME dome turned 180° about the
 * horizontal axis for the back (a rotation, not a mirror — the back's words read upright when they come round), and this
 * band between them. Without it the two domes meet at z = 0 in a razor edge and edge-on the button is a hairline.
 * A straight-sided slab of the pill's outline, `band` px thick, centred on z = 0; the domes sit on its two faces. ⚠ The
 * dome's grid edge is a staircase inside the true outline (the known ~2.3 px steps at 4×, R-042): the slab's flat faces fill
 * that sliver, at the dome's own edge height (0), so no gap opens round the edge.
 * `FAMILY_BAND` — the band as a fraction of the height (a starting value, Carl's eye).
 */
export const FAMILY_BAND = 0.1;
export function buildPillBand(w: number, h: number, band: number): THREE.BufferGeometry {
  const r = h / 2;
  const cx = w / 2 - r;
  const shape = new THREE.Shape();
  shape.moveTo(-cx, -r);
  shape.lineTo(cx, -r);
  shape.absarc(cx, 0, r, -Math.PI / 2, Math.PI / 2, false);
  shape.lineTo(-cx, r);
  shape.absarc(-cx, 0, r, Math.PI / 2, (3 * Math.PI) / 2, false);
  const g = new THREE.ExtrudeGeometry(shape, { depth: band, bevelEnabled: false, curveSegments: 48 });
  g.translate(0, 0, -band / 2);
  return g;
}
