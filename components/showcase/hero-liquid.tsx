"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { LOGO_ASPECT, LOGO_OUTLINE, LOGO_R_CAP } from "@/components/about/logo-mark-outline";
import { LOGO_MARK_DEFAULTS } from "@/components/about/logo-mark-geometry";
import { useDisposeOnUnmount } from "@/lib/use-dispose-on-unmount";
import { LIQUID_BALLS, type LiquidUniforms } from "./hero-liquid-webgpu";
import { HERO_LOGO_PLACE, type JumpHold } from "./hero-logo";
import type { AsyncCompileHandle } from "./bench-medium";

/**
 * ⛔ THE LIQUID, ROUTE B (10 November 2026; THROWAWAY until the choice; D-101) — the logo as a field term (probe 2) and the
 * liquid on the bench (below). `live-work/structural-note-hero-
 * liquid-9-november.md` v1.5, APPROVED, the live plan's STEP 2: the logo in the field, the first handover, ONE blob out of
 * the logo's right face, the drain's look. Plain three only: the node material comes from the hero's WebGPU part through
 * `HeroLogo`'s slot (`liquidMaterial`, `hero-liquid-webgpu.tsx`); `HeroLogo` mounts this inside itself.
 *
 * ⛔ THE LOGO AS A FIELD TERM — TWO THINGS, BOTH THE MESH's OWN:
 * 1. THE PROFILE (`logoProfileCm`): the mesh's cross-section, from `LOGO_MARK_DEFAULTS` by `logo-mark-geometry.ts`'s
 *    `makeProfile` formula. ⚠ A COPY of that formula (the file is outside this chunk's scope and does not export it): a
 *    second source of truth. Partly asserted: `__liquid.stats.topErrorCm` compares the profile's face height with the
 *    mesh's measured bounds; the wall height and the round are NOT checked against the mesh.
 * 2. THE OUTLINE's DISTANCE (`bakeLogoDistance`): signed (positive inside), in cm, at 0.25 cm texels with a 20 cm margin
 *    (960 × 576, half float, ~1.1 MB). Exact distances to the traced polyline within 2 texels of it; beyond, the nearest
 *    SEGMENT carried outward by two forward/backward sweeps (8 neighbours), each texel's distance exact to its carried
 *    segment. Inside by the same scan-line parity the mesh uses. ⚠ BAKED ON THE MAIN THREAD ON LOAD, AFTER the hero is
 *    ready (a probe; the note's end state bakes in the logo's worker). Its time is published (`__liquid.stats.bakeMs`).
 * ⛔ THE VOLUME CHECK [R12-4]: the field logo's volume at weight 1 (Σ profile(d) × texel area) against the MESH's (the
 *    divergence theorem over its triangles, measured here, not the recorded 70,085 cm³).
 */

/** the bake's resolution and margin (cm) */
const TEXEL_CM = 0.25;
const MARGIN_CM = 20;

export type LogoProfileCm = { lip: number; wallH: number; d1: number; zd1: number; arcEnd: number; rho: number; top: number; slope: number; theta: number; z(u: number): number };

/** ⚠ A COPY of `makeProfile` (`logo-mark-geometry.ts`), scaled to cm — see the header */
export function logoProfileCm(heightCm: number): LogoProfileCm {
  const p = LOGO_MARK_DEFAULTS;
  const k = p.bevelRise;
  const lipW = p.lipW;
  const theta = Math.atan(k);
  const B0 = Math.min(p.bevelW, 0.9 * LOGO_R_CAP);
  const rho = Math.max(0, Math.min(p.edgeRound, (0.9 * (B0 - lipW)) / (Math.sin(theta) - Math.tan(theta / 2))));
  const T = rho * Math.tan(theta / 2);
  const B = Math.min(B0, 0.9 * LOGO_R_CAP - T);
  const top = p.depth;
  const wallH = top - k * (B - lipW);
  const arcEnd = B + T;
  const d1 = arcEnd - rho * Math.sin(theta);
  const s = heightCm;
  const P = { lip: lipW * s, wallH: wallH * s, d1: d1 * s, zd1: (wallH + k * (d1 - lipW)) * s, arcEnd: arcEnd * s, rho: rho * s, top: top * s, slope: k, theta };
  const zc = P.top - P.rho;
  return {
    ...P,
    z: (u) => {
      if (u < P.lip) return P.wallH;
      if (u <= P.d1) return P.wallH + k * (u - P.lip);
      if (u < P.arcEnd) {
        const a = u - P.arcEnd;
        return zc + Math.sqrt(Math.max(0, P.rho * P.rho - a * a));
      }
      return P.top;
    },
  };
}

export type LogoDistance = {
  texture: THREE.DataTexture;
  origin: [number, number];
  size: [number, number];
  cols: number;
  rows: number;
  bakeMs: number;
  volumeCm3: number;
  /** the signed distances (cm, + inside), row by row — the spots are chosen from them */
  dCm: Float32Array;
  dispose(): void;
};

export function bakeLogoDistance(heightCm: number, prof: LogoProfileCm): LogoDistance {
  const t0 = performance.now();
  const n = LOGO_OUTLINE.length / 2;
  const ax = new Float64Array(n);
  const ay = new Float64Array(n);
  const bx = new Float64Array(n);
  const by = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    ax[i] = LOGO_OUTLINE[2 * i] * heightCm;
    ay[i] = LOGO_OUTLINE[2 * i + 1] * heightCm;
    bx[i] = LOGO_OUTLINE[2 * j] * heightCm;
    by[i] = LOGO_OUTLINE[2 * j + 1] * heightCm;
  }
  const x0 = -(LOGO_ASPECT / 2) * heightCm - MARGIN_CM;
  const y0 = -MARGIN_CM;
  const cols = Math.ceil((LOGO_ASPECT * heightCm + 2 * MARGIN_CM) / TEXEL_CM);
  const rows = Math.ceil((heightCm + 2 * MARGIN_CM) / TEXEL_CM);
  const N = cols * rows;
  const best = new Float64Array(N).fill(Infinity);
  const seg = new Int32Array(N).fill(-1);
  const cx = (i: number) => x0 + (i + 0.5) * TEXEL_CM;
  const cy = (j: number) => y0 + (j + 0.5) * TEXEL_CM;
  const d2 = (s: number, x: number, y: number) => {
    const dx = bx[s] - ax[s];
    const dy = by[s] - ay[s];
    const L2 = dx * dx + dy * dy;
    let t = L2 > 0 ? ((x - ax[s]) * dx + (y - ay[s]) * dy) / L2 : 0;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    const px = ax[s] + t * dx - x;
    const py = ay[s] + t * dy - y;
    return px * px + py * py;
  };
  // 1. exact within 2 texels of each segment
  const band = 2 * TEXEL_CM;
  for (let s = 0; s < n; s++) {
    const i0 = Math.max(0, Math.floor((Math.min(ax[s], bx[s]) - band - x0) / TEXEL_CM));
    const i1 = Math.min(cols - 1, Math.ceil((Math.max(ax[s], bx[s]) + band - x0) / TEXEL_CM));
    const j0 = Math.max(0, Math.floor((Math.min(ay[s], by[s]) - band - y0) / TEXEL_CM));
    const j1 = Math.min(rows - 1, Math.ceil((Math.max(ay[s], by[s]) + band - y0) / TEXEL_CM));
    for (let j = j0; j <= j1; j++) {
      const y = cy(j);
      for (let i = i0; i <= i1; i++) {
        const id = j * cols + i;
        const v = d2(s, cx(i), y);
        if (v < best[id]) {
          best[id] = v;
          seg[id] = s;
        }
      }
    }
  }
  // 2. the nearest segment carried outward: forward and backward sweeps, twice
  const relax = (id: number, x: number, y: number, nid: number) => {
    const s = seg[nid];
    if (s < 0 || s === seg[id]) return;
    const v = d2(s, x, y);
    if (v < best[id]) {
      best[id] = v;
      seg[id] = s;
    }
  };
  for (let round = 0; round < 2; round++) {
    for (let j = 0; j < rows; j++) {
      const y = cy(j);
      for (let i = 0; i < cols; i++) {
        const id = j * cols + i;
        const x = cx(i);
        if (i > 0) relax(id, x, y, id - 1);
        if (j > 0) {
          relax(id, x, y, id - cols);
          if (i > 0) relax(id, x, y, id - cols - 1);
          if (i < cols - 1) relax(id, x, y, id - cols + 1);
        }
      }
    }
    for (let j = rows - 1; j >= 0; j--) {
      const y = cy(j);
      for (let i = cols - 1; i >= 0; i--) {
        const id = j * cols + i;
        const x = cx(i);
        if (i < cols - 1) relax(id, x, y, id + 1);
        if (j < rows - 1) {
          relax(id, x, y, id + cols);
          if (i < cols - 1) relax(id, x, y, id + cols + 1);
          if (i > 0) relax(id, x, y, id + cols - 1);
        }
      }
    }
  }
  // 3. the sign (odd crossings to the left = inside, as the mesh), the half floats, the volume
  const data = new Uint16Array(N);
  const dCm = new Float32Array(N);
  let volume = 0;
  const area = TEXEL_CM * TEXEL_CM;
  for (let j = 0; j < rows; j++) {
    const y = cy(j);
    const xs: number[] = [];
    for (let s = 0; s < n; s++) if (ay[s] > y !== by[s] > y) xs.push(ax[s] + ((y - ay[s]) * (bx[s] - ax[s])) / (by[s] - ay[s]));
    xs.sort((p, q) => p - q);
    let k = 0;
    for (let i = 0; i < cols; i++) {
      const x = cx(i);
      while (k < xs.length && xs[k] < x) k++;
      const id = j * cols + i;
      const d = (k % 2 === 1 ? 1 : -1) * Math.sqrt(best[id]);
      data[id] = THREE.DataUtils.toHalfFloat(d);
      dCm[id] = d;
      if (d > 0) volume += prof.z(d) * area;
    }
  }
  const texture = new THREE.DataTexture(data, cols, rows, THREE.RedFormat, THREE.HalfFloatType);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return { texture, origin: [x0, y0], size: [cols * TEXEL_CM, rows * TEXEL_CM], cols, rows, bakeMs: performance.now() - t0, volumeCm3: volume, dCm, dispose: () => texture.dispose() };
}

/** the mesh's enclosed volume (the divergence theorem: Σ v0 · (v1 × v2) / 6 over its triangles), cm³ */
function meshVolume(g: THREE.BufferGeometry): number {
  const p = g.getAttribute("position");
  const idx = g.getIndex();
  if (!idx) return NaN;
  let v = 0;
  for (let t = 0; t < idx.count; t += 3) {
    const a = idx.getX(t);
    const b = idx.getX(t + 1);
    const c = idx.getX(t + 2);
    const ax = p.getX(a), ay = p.getY(a), az = p.getZ(a);
    const bx = p.getX(b), by = p.getY(b), bz = p.getZ(b);
    const cx = p.getX(c), cy = p.getY(c), cz = p.getZ(c);
    v += ax * (by * cz - bz * cy) - ay * (bx * cz - bz * cx) + az * (bx * cy - by * cx);
  }
  return Math.abs(v) / 6;
}

/**
 * ⛔ THE BLOBS, MIMICKED (10 November 2026; Carl: mimic the example's behaviour on the bench, then customise it). three.js's
 * `webgl_marchingcubes` (`updateCubes`, fetched from threejs.org 10 November 2026), its numbers kept:
 * - 10 balls, strength 1.2 / ((√10 − 1)/4 + 1), subtract 12, isolation 80; the clock at half speed (`time += delta ×
 *   speed × 0.5`, speed 1);
 * - each ball's path in box units: x = sin(i + 1.26 t (1.03 + 0.5 cos 0.21i)) × 0.27 + 0.5; y = |cos(i + 1.12 t cos(1.22 +
 *   0.1424 i))| × 0.77 (the bounce); z = cos(i + 1.32 t × 0.1 × sin(0.92 + 0.53 i)) × 0.27 + 0.5;
 * - the wall, `addPlaneX(2, 12)`, MIRRORED: the example's wall is the box's left face, ours its RIGHT (Carl: *"our wall
 *   will be on the right hand side"*). NO FLOOR (Carl, 9 November: *"they stay in the air"*).
 * OURS so far: the box SCALED to the logo's mass (`BLOBS.scale`; `__liquid.volume()` measures it), the wall's sheet
 * just outside the page frame's right edge (only its bulges in view), the box's foot `BLOBS.foot` above the floor, centred
 * on the text's face plane; the logo's material and reflection. Used by the liquid's WALL phase (below).
 */
const BLOB_N = 10;
const BLOBS = {
  /** cm per box unit, MEASURED (10 November 2026, `__liquid.volume(12, 1.5)` (then `__liquidBlobs`), 12 moments 2.5 s apart): at 129 (one
   *  ball's volume × 10) the median was 88,374 cm³ (merges inflate it; 81,901–100,123) → scaled by the cube root to put the
   *  MEDIAN on the field logo's 70,148 cm³. ⚠ The example does not hold its mass: it swings about ±12 % as balls merge (the
   *  volume curve, step 4, is where the mass is held) */
  scale: 119.5,
  strength: 1.2 / ((Math.sqrt(BLOB_N) - 1) / 4 + 1),
  subtract: 12,
  isolation: 80,
  /** the box's foot above the floor, and the wall sheet's gap outside the frame edge (cm) */
  foot: 15,
  sheetGap: 2,
  speed: 1,
} as const;
/** the page frame's right edge at the text's depth (cm): the logo's balanced gap, mirrored (`hero-logo.tsx`). A FUNCTION:
 *  `hero-logo.tsx` imports this file, so its constants are not yet defined while this module loads */
const frameRightCm = () => HERO_LOGO_PLACE.centreX + HERO_LOGO_PLACE.widthCm / 2 + HERO_LOGO_PLACE.gapCm;
/** the wall's own surface sits where 2/x² − 12 = isolation: x = √(2 / (iso + 12)) box units from its plane */
const WALL_OFFSET = Math.sqrt(2 / (BLOBS.isolation + 12));

function blobFrame(scale: number) {
  const wallX = frameRightCm() + BLOBS.sheetGap + WALL_OFFSET * scale;
  const zc = HERO_LOGO_PLACE.face;
  return {
    wallX,
    toWorld: (x: number, y: number, z: number, out: THREE.Vector4) => out.set(wallX - x * scale, BLOBS.foot + y * scale, zc + (z - 0.5) * scale, 1),
    min: new THREE.Vector3(wallX - scale, BLOBS.foot - 0.3 * scale, zc - 0.5 * scale),
    max: new THREE.Vector3(wallX, BLOBS.foot + scale, zc + 0.5 * scale),
  };
}
/** the example's paths (box units) at time t */
function blobPath(i: number, t: number): [number, number, number] {
  return [
    Math.sin(i + 1.26 * t * (1.03 + 0.5 * Math.cos(0.21 * i))) * 0.27 + 0.5,
    Math.abs(Math.cos(i + 1.12 * t * Math.cos(1.22 + 0.1424 * i))) * 0.77,
    Math.cos(i + 1.32 * t * 0.1 * Math.sin(0.92 + 0.53 * i)) * 0.27 + 0.5,
  ];
}
/** the balls' enclosed volume (cm³) at time t: the balls' field only (the wall is not mass), on a `step` cm grid */
function blobVolume(t: number, scale: number, step: number): number {
  const c = Array.from({ length: BLOB_N }, (_, i) => blobPath(i, t));
  const s = BLOBS.strength;
  const sub = BLOBS.subtract;
  const iso = BLOBS.isolation;
  const du = step / scale;
  const n = Math.ceil(1.6 / du);
  let count = 0;
  for (let ix = 0; ix < n; ix++) {
    const x = -0.3 + (ix + 0.5) * du;
    for (let iy = 0; iy < n; iy++) {
      const y = -0.3 + (iy + 0.5) * du;
      for (let iz = 0; iz < n; iz++) {
        const z = -0.3 + (iz + 0.5) * du;
        let F = 0;
        for (const b of c) {
          const v = s / (1e-6 + (x - b[0]) ** 2 + (y - b[1]) ** 2 + (z - b[2]) ** 2) - sub;
          if (v > 0) F += v;
        }
        if (F >= iso) count++;
      }
    }
  }
  return count * step ** 3;
}


/**
 * ⛔ THE LIQUID ON THE BENCH — PHRASE 1: EXPELLED, THEN THE WALL (10 November 2026; D-101). Carl: *"they get expelled out of
 * the logo over a 500ms time frame leaving nothing of the logo behing because its all liquid now. they travel over to the
 * right hand wall and boumce of it while partly merging with it as they do now."* ONE field (`liquidMaterial`): the logo,
 * the ten balls, the wall. On the JUMP's clock (session 2, below):
 * 1. HOLD — the lean, the jump and the landing's WOBBLE, played in full as approved (R-105): the solid logo, the MESH (the
 *    field hidden). ⛔ Carl, on take 1 (the expulsion at touchdown): *"The logo has lost its wobble"* — the blobs ate its
 *    bottom, the edge it rocks on, within 0.5 s. Take 2 starts the expulsion when the wobble ends (`start`, the jump's
 *    `settled`, touchdown + 2 s).
 * 2. EXPEL (0.5 s) — ⛔ the swap to the field at `start`. ⛔ FROM THE LANDED LOGO, ALL OF IT
 *    (session 2; Carl: *"We should use all the logo from which the blobs emerge. Top, middle and bottom ... each blob that
 *    emerges will have its own mass. The eqivalent mass must disappear from the logo"*): the logo is cut into ten REGIONS
 *    (`logoRegions`), each one blob's mass; ball i is BORN at its region's anchor (its strength 0 → its region's), staggered
 *    30 ms FROM THE BOTTOM UP (the shock travels up from the floor — the Builder's take), pushed out of the RIGHT FACE (the
 *    landed face looks right, toward the wall), and as it grows its region's FRONT closes in on the anchor, the region's
 *    remaining volume `1 − k^1.5` as the ball's grows `k^1.5` (`k` its strength's share). The field logo follows the
 *    landing's wobble (the jump's pose at the same clock).
 * 3. TRAVEL — ⛔ ONE FLUID PATH per ball (Carl's note, take 1: *"expelled, stop, get some momentum from somwhere and fly far
 *    too fast towards the wall ... it should all be onr "fluid" movement"*): a cubic Hermite from its spot, LEAVING THE FACE
 *    ALREADY MOVING (`exitSpeed` cm/s along the face's normal), to its place on the mimic's paths, ARRIVING WITH THAT
 *    PATH's VELOCITY (no seam), `travel` s after its birth. The mimic's clock runs from the expulsion's start, so the path it
 *    arrives on is already moving.
 * 4. WALL (3 s) — the mimic, as approved: the example's paths, its half-speed clock, the wall's swell.
 * ⚠ NOT YET: the middle (~3 s), the mould; the mass is not held (the field's volume swings; step 4's curve).
 */
/** ⛔ THE TRAVEL SLOWED (10 November 2026, session 2; Carl: *"They move far to fast towards the wall ... The blobs can amble
 *  over to the wall, much slower"* — the point is to SHOW the geometry, shaders and reflections). Was 2.5 s at 150 cm/s off
 *  the face (~2 m/s average); now 8 s, leaving at 40 cm/s (~0.6 m/s average over the ~4.5 m) — the Builder's take */
const LIQUID_T = { expel: 0.5, travel: 8, wall: 3, stagger: 0.03, exitSpeed: 40 } as const;
/** the crowd on the way (`HeroLiquid`'s frame): how far mid-travel pulls each ball to the group (0–1), and its jostle (cm) */
const CROWD = { gather: 0.75, jostleCm: 22 } as const;
/** the liquid's length after its START (s): the jump's landed phase runs the wobble plus this while the liquid is on */
export const LIQUID_LENGTH = (LIQUID_BALLS - 1) * LIQUID_T.stagger + LIQUID_T.travel + LIQUID_T.wall;
const smooth01 = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

/**
 * ⛔ THE LOGO's REGIONS — EACH BLOB's OWN MASS (10 November 2026, session 2; Carl, above). The logo's ink (the bake's
 * texels inside the outline, each weighed by the profile's height there — its VOLUME) cut into `n` regions by a
 * MASS-WEIGHTED k-means (Lloyd, `iters` rounds), seeded farthest-point from the c's end (the bottom when it stands): the
 * regions spread over the whole logo, top, middle and bottom, and come out UNEQUAL (the logo's strokes are), so are the
 * blobs (Carl, 8 November: *"the blobs should not be equal in volume"*). Per region:
 * - its VOLUME (cm³, Σ = the field logo's);
 * - its ANCHOR: the region's ink nearest its centre at least 3 cm in from the outline (the blob leaves from there, mid-
 *   thickness);
 * - its STRENGTH factor: (volume ÷ the mean)^(2/3) — a ball's volume goes as strength^1.5, so the blobs' sizes keep the
 *   regions' PROPORTIONS. ⚠ The mean stays 1 (the mimic's calibration, `BLOBS.scale`): the TOTAL is not held — step 4;
 * - its FRONT's RADII: the radius about the anchor holding each fraction of its volume (`fractions` + 1 entries, 0 → 1).
 * Run once after the bake, on the main thread; its time is published (`__liquid.stats.regionsMs`).
 */
const REGION = { iters: 12, fractions: 32, band: 3, tau: 3 } as const;
/** frames the empty field is drawn for, to START its compile before it is needed (`HeroLiquid`, the warm-up draw) */
const WARM_FRAMES = 2;
/** ⛔ THE GATE's numbers (the async-compile plan v1.2, APPROVED): the longest the logo may stand held after its wobble —
 *  Carl's 1 s (*"wait and beat are ok"*), WALL CLOCK (the jump's clock is held then, so it cannot measure the wait); and
 *  how late a ready may arrive and still open this loop — the clock's largest step (its delta clamp, 0.1 s) */
const GATE = { maxWaitMs: 1000, lateReadyS: 0.1 + 1e-6 } as const;
type LogoRegions = { centres: [number, number][]; anchors: THREE.Vector3[]; volumes: number[]; strengths: number[]; radii: Float32Array[]; ms: number };

function logoRegions(dist: LogoDistance, prof: LogoProfileCm, n: number): LogoRegions | null {
  const t0 = performance.now();
  const texel = dist.size[0] / dist.cols;
  const area = texel * texel;
  const ids: number[] = [];
  for (let i = 0; i < dist.dCm.length; i++) if (dist.dCm[i] > 0) ids.push(i);
  const M = ids.length;
  if (M < n) return null;
  const X = new Float32Array(M);
  const Y = new Float32Array(M);
  const W = new Float32Array(M);
  const D = new Float32Array(M);
  for (let k = 0; k < M; k++) {
    const id = ids[k];
    X[k] = dist.origin[0] + ((id % dist.cols) + 0.5) * texel;
    Y[k] = dist.origin[1] + (Math.floor(id / dist.cols) + 0.5) * texel;
    D[k] = dist.dCm[id];
    W[k] = prof.z(D[k]) * area;
  }
  // the seeds: farthest-point, from the lowest-x ink (the c's end)
  const cx = new Float64Array(n);
  const cy = new Float64Array(n);
  let first = 0;
  for (let k = 1; k < M; k++) if (X[k] < X[first]) first = k;
  cx[0] = X[first];
  cy[0] = Y[first];
  const near = new Float64Array(M).fill(Infinity);
  for (let s = 1; s < n; s++) {
    let far = 0;
    let best = -1;
    for (let k = 0; k < M; k++) {
      const d = (X[k] - cx[s - 1]) ** 2 + (Y[k] - cy[s - 1]) ** 2;
      if (d < near[k]) near[k] = d;
      if (near[k] > best) {
        best = near[k];
        far = k;
      }
    }
    cx[s] = X[far];
    cy[s] = Y[far];
  }
  // Lloyd, mass-weighted
  const lab = new Int32Array(M);
  const assign = () => {
    for (let k = 0; k < M; k++) {
      let b = 0;
      let bd = Infinity;
      for (let s = 0; s < n; s++) {
        const d = (X[k] - cx[s]) ** 2 + (Y[k] - cy[s]) ** 2;
        if (d < bd) {
          bd = d;
          b = s;
        }
      }
      lab[k] = b;
    }
  };
  for (let it = 0; it < REGION.iters; it++) {
    assign();
    const sx = new Float64Array(n);
    const sy = new Float64Array(n);
    const sw = new Float64Array(n);
    for (let k = 0; k < M; k++) {
      sx[lab[k]] += W[k] * X[k];
      sy[lab[k]] += W[k] * Y[k];
      sw[lab[k]] += W[k];
    }
    for (let s = 0; s < n; s++) {
      if (sw[s] <= 0) continue;
      cx[s] = sx[s] / sw[s];
      cy[s] = sy[s] / sw[s];
    }
  }
  assign();
  const volumes: number[] = [];
  const anchors: THREE.Vector3[] = [];
  const radii: Float32Array[] = [];
  for (let s = 0; s < n; s++) {
    const mine: number[] = [];
    let v = 0;
    let deepest = 0;
    for (let k = 0; k < M; k++)
      if (lab[k] === s) {
        mine.push(k);
        v += W[k];
        deepest = Math.max(deepest, D[k]);
      }
    if (!mine.length) return null;
    volumes.push(v);
    // the anchor: the region's ink nearest its centre, at least 3 cm in (or most of its deepest, for a thin region)
    const inBy = Math.min(3, 0.8 * deepest);
    let a = mine[0];
    let ad = Infinity;
    for (const k of mine) {
      if (D[k] < inBy) continue;
      const d = (X[k] - cx[s]) ** 2 + (Y[k] - cy[s]) ** 2;
      if (d < ad) {
        ad = d;
        a = k;
      }
    }
    anchors.push(new THREE.Vector3(X[a], Y[a], prof.top / 2));
    // the front's radii: the region's ink by distance from the anchor, its volume accumulated
    const byR = mine.map((k) => [Math.hypot(X[k] - X[a], Y[k] - Y[a]), W[k]] as const).sort((p, q) => p[0] - q[0]);
    const F = REGION.fractions;
    const r = new Float32Array(F + 1);
    r[0] = -REGION.band - 1;
    let cum = 0;
    let j = 1;
    for (const [d, w] of byR) {
      cum += w;
      while (j < F && cum >= (j / F) * v) r[j++] = d;
    }
    r[F] = byR[byR.length - 1][0];
    for (; j < F; j++) r[j] = r[F];
    radii.push(r);
  }
  const mean = volumes.reduce((p, q) => p + q, 0) / n;
  const strengths = volumes.map((v) => (v / mean) ** (2 / 3));
  const centres = Array.from({ length: n }, (_, s) => [cx[s], cy[s]] as [number, number]);
  return { centres, anchors, volumes, strengths, radii, ms: performance.now() - t0 };
}
/** the front's radius (cm) holding the fraction `f` (0–1) of region `i`'s volume */
function frontAt(reg: LogoRegions, i: number, f: number): number {
  const r = reg.radii[i];
  const x = Math.min(1, Math.max(0, f)) * REGION.fractions;
  const j = Math.min(REGION.fractions - 1, Math.floor(x));
  return r[j] + (r[j + 1] - r[j]) * (x - j);
}

export type LiquidShow = "auto" | "mesh" | "field";
type LiquidDev = {
  stats: { bakeMs: number; fieldVolumeCm3: number; meshVolumeCm3: number; volumeErrorPct: number; topErrorCm: number; regionsMs: number; regionVolumesCm3: number[]; regionStrengths: number[] } | null;
  play(on: boolean): void;
  /** freeze at a time since the expulsion's START (s; negative: the lean, the jump, the wobble) — the jump's clock */
  at(t: number): void;
  show(s: LiquidShow): void;
  debug(n: number): void;
  /** ⚠ diagnosis: terms forced off after the timeline is applied */
  override(o: { logoOff?: boolean; wallOff?: boolean; ballsOff?: boolean }): void;
  /** the time since the expulsion's start (s) */
  time(): number;
  material: THREE.Material | null;
  /** the mimic's balls-only volume at the wall (cm³), sampled over time */
  volume(samples?: number, step?: number): { min: number; median: number; max: number };
};

/** the clock the liquid shares with the jump (`hero-logo.tsx`): ONE clock for the phases (the note v1.5, §5) */
export type LiquidClock = { current: { playing: boolean; t: number } };
/** the logo's pose at a time on that clock — the jump's own (the lean, the flight, the landing's wobble) */
export type LiquidPoseAt = (t: number, outQ: THREE.Quaternion, outP: THREE.Vector3) => void;

/**
 * ⛔ THE LIQUID's OWNER — mounted by `HeroLogo` inside itself, on the JUMP (session 2): `landed` is the pose it lands in (the
 * proxy box is built about it), `logoMeshRef` the solid it replaces at `start` — its visibility and the field's are set
 * HERE, in the same frame (no React render between them), `clockRef` the jump's, `start` the expulsion's time on it (the
 * jump's `settled`), `poseAt` the jump's pose.
 */
export function HeroLiquid({ make, logoMaterial, logoGeometry, landed, logoMeshRef, clockRef, start, poseAt, asyncCompile, holdRef }: { make: () => THREE.Material; logoMaterial: THREE.MeshStandardMaterial; logoGeometry: THREE.BufferGeometry; landed: { position: [number, number, number]; quaternion: THREE.Quaternion }; logoMeshRef: { current: THREE.Mesh | null }; clockRef: LiquidClock; start: number; poseAt: LiquidPoseAt; asyncCompile?: (gl: unknown, material: THREE.Material) => AsyncCompileHandle; holdRef: JumpHold }) {
  const gl = useThree((s) => s.gl);
  const heightCm = useMemo(() => {
    logoGeometry.computeBoundingBox();
    const b = logoGeometry.boundingBox!;
    return b.max.y - b.min.y;
  }, [logoGeometry]);
  const prof = useMemo(() => logoProfileCm(heightCm), [heightCm]);
  // ⚠ the bake and the regions: on the main thread, a task after mount (this mounts after the reflection, so after the
  // hero is ready)
  const [dist, setDist] = useState<LogoDistance | null>(null);
  useEffect(() => {
    const id = window.setTimeout(() => setDist(bakeLogoDistance(heightCm, prof)), 0);
    return () => window.clearTimeout(id);
  }, [heightCm, prof]);
  useDisposeOnUnmount(dist ?? { dispose: () => {} });
  const regions = useMemo(() => (dist ? logoRegions(dist, prof, LIQUID_BALLS) : null), [dist, prof]);
  // the births' order: bottom first (the anchors' local x — the mesh's +X is UP when it stands)
  const rank = useMemo(() => {
    if (!regions) return [];
    const order = regions.anchors.map((a, i) => [a.x, i] as const).sort((p, q) => p[0] - q[0]);
    const r = new Array<number>(LIQUID_BALLS);
    order.forEach(([, i], k) => (r[i] = k));
    return r;
  }, [regions]);
  // the landed frame (world ← local): the proxy box is built about it
  const landedFrame = useMemo(() => new THREE.Matrix4().compose(new THREE.Vector3(...landed.position), landed.quaternion, new THREE.Vector3(1, 1, 1)), [landed]);
  const frame = useMemo(() => blobFrame(BLOBS.scale), []);
  // the proxy box: the landed logo's world bounds (+ the field's reach, which also holds the wobble's ~13 cm at its top)
  // united with the wall's box
  const box = useMemo(() => {
    const lb = logoGeometry.boundingBox!.clone().applyMatrix4(landedFrame);
    lb.expandByScalar(0.3 * BLOBS.scale);
    lb.union(new THREE.Box3(frame.min, frame.max));
    const g = new THREE.BoxGeometry(lb.max.x - lb.min.x, lb.max.y - lb.min.y, lb.max.z - lb.min.z);
    g.translate((lb.min.x + lb.max.x) / 2, (lb.min.y + lb.max.y) / 2, (lb.min.z + lb.max.z) / 2);
    return { geometry: g, min: lb.min.clone(), max: lb.max.clone(), dispose: () => g.dispose() };
  }, [logoGeometry, landedFrame, frame]);
  useDisposeOnUnmount(box);
  const material = useMemo(() => {
    if (!dist || !regions) return null;
    const m = make() as THREE.MeshStandardMaterial;
    m.color.copy(logoMaterial.color);
    m.metalness = logoMaterial.metalness;
    m.roughness = logoMaterial.roughness;
    m.envMap = logoMaterial.envMap;
    m.envMapIntensity = logoMaterial.envMapIntensity;
    m.envMapRotation.copy(logoMaterial.envMapRotation);
    const u = (m.userData as { liquid?: LiquidUniforms }).liquid;
    if (u) {
      u.distance.value = dist.texture;
      u.gridOrigin.value.set(dist.origin[0], dist.origin[1]);
      u.gridSize.value.set(dist.size[0], dist.size[1]);
      u.lip.value = prof.lip;
      u.wallH.value = prof.wallH;
      u.d1.value = prof.d1;
      u.zd1.value = prof.zd1;
      u.arcEnd.value = prof.arcEnd;
      u.rho.value = prof.rho;
      u.top.value = prof.top;
      u.slope.value = prof.slope;
      u.sinT.value = Math.sin(prof.theta);
      u.cosT.value = Math.cos(prof.theta);
      u.worldToLocal.value.copy(landedFrame).invert();
      u.boxMin.value.copy(box.min);
      u.boxMax.value.copy(box.max);
      u.scale.value = BLOBS.scale;
      u.strength.value = BLOBS.strength;
      u.subtract.value = BLOBS.subtract;
      u.isolation.value = BLOBS.isolation;
      u.wallX.value = frame.wallX;
      u.band.value = REGION.band;
      u.tau.value = REGION.tau;
      for (let i = 0; i < LIQUID_BALLS; i++) u.regions.array[i].set(regions.centres[i][0], regions.centres[i][1], regions.anchors[i].x, regions.anchors[i].y);
    }
    return m;
  }, [make, logoMaterial, dist, regions, prof, landedFrame, box, frame]);
  useDisposeOnUnmount(material ?? { dispose: () => {} });
  const uRef = useRef<LiquidUniforms | null>(null);
  useEffect(() => {
    uRef.current = (material?.userData as { liquid?: LiquidUniforms } | undefined)?.liquid ?? null;
  }, [material]);
  const ctl = useRef({ show: "auto" as LiquidShow, debug: 0, ov: {} as { logoOff?: boolean; wallOff?: boolean; ballsOff?: boolean } });
  const fieldRef = useRef<THREE.Mesh>(null);
  /**
   * ⛔ THE WARM-UP DRAW (10 November 2026, session 2; Carl: *"on a hard refresh the blobs take too long to emerge"*). The
   * field DRAWN EMPTY (no balls, no logo, no wall: every pixel discarded) for `WARM_FRAMES` frames as soon as its material
   * exists, during the LEAN. With the medium's ASYNC COMPILE (below) this STARTS the pipeline's build in the background
   * and the page keeps drawing; without it (a medium with no `asyncCompile`) the first draw compiles synchronously, the
   * stall in the lean, as first built (its clock waits through it: the delta clamp).
   */
  const warm = useRef(0);
  /**
   * ⛔ THE ASYNC COMPILE, THE GATE, THE FAILURE BRANCH (10 November 2026, session 2;
   * `live-work/structural-note-liquid-async-compile-10-november.md` v1.4, `live-work/plan-liquid-async-compile-10-november.md`
   * v1.2, APPROVED by Carl, cleared by the Architect).
   * - REGISTERED in a LAYOUT effect (the same commit as the material: a passive effect can run a frame late on this medium,
   *   `camera-bench.tsx`), and the warm-up WAITS for the handle — a warm-up drawn first would build synchronously.
   * - THE HOLD, written EVERY frame: while the pipeline is not ready (and the liquid not off), the jump's clock is clamped
   *   at `start` before it crosses (`hero-logo.tsx`): the logo stands after its wobble. Off once ready, or off, across
   *   every loop.
   * - THE GATE: the swap (solid → field) only when READY. A ready arriving more than the clock's largest step past `start`
   *   (the clamp never bound: a late registration) waits for the NEXT loop — no blobs appearing mid-flight.
   * - THE FAILURE BRANCH: `failed`, or the hold past Carl's 1 s of wall clock → OFF for this registration: the solid
   *   stays through the liquid's time, the loop runs on, a console WARNING (not an error) names why.
   * - WITHOUT a handle: everything as before (the warm-up runs, no hold, the swap at `start`).
   * ⚠ DEV: `window.__liquidCompile` — state, seen render objects, the last hold, why off, `force` (the probe's checks).
   */
  const handleRef = useRef<AsyncCompileHandle | null>(null);
  const offRef = useRef<{ off: boolean; why: string | null }>({ off: false, why: null });
  const gateRef = useRef({ open: false });
  const holdStartRef = useRef<number | null>(null);
  const holdMsRef = useRef<number | null>(null);
  useLayoutEffect(() => {
    if (!material || !asyncCompile) return;
    const h = asyncCompile(gl, material);
    handleRef.current = h;
    offRef.current = { off: false, why: null };
    // the hold's object is `HeroLogo`'s for its whole life: released here when the liquid leaves
    const holdState = holdRef.current;
    return () => {
      h.dispose();
      if (handleRef.current === h) handleRef.current = null;
      holdState.hold = false;
    };
  }, [material, asyncCompile, gl, holdRef]);
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    (window as unknown as { __liquidCompile?: unknown }).__liquidCompile = {
      state: () => handleRef.current?.state() ?? "none",
      seen: () => handleRef.current?.seenIds() ?? [],
      holdMs: () => holdMsRef.current,
      off: () => offRef.current.off,
      failedWhy: () => offRef.current.why,
      force: (kind: "fail" | "delay", ms?: number) => handleRef.current?.force(kind, ms),
    };
  }, []);
  // the solid comes back whenever the liquid leaves
  useEffect(() => {
    const solid = logoMeshRef.current;
    return () => {
      if (solid) solid.visible = true;
    };
  }, [logoMeshRef]);
  const devRef = useRef<LiquidDev | null>(null);
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const d: LiquidDev = {
      stats: null,
      play: (on) => void (clockRef.current.playing = on),
      at: (t) => {
        clockRef.current.playing = false;
        clockRef.current.t = start + t;
      },
      show: (s) => void (ctl.current.show = s),
      debug: (n) => void (ctl.current.debug = n),
      override: (o) => void (ctl.current.ov = o),
      time: () => clockRef.current.t - start,
      material: null,
      volume: (samples = 12, step = 1.5) => {
        const v = Array.from({ length: samples }, (_, k) => blobVolume(k * 2.5, BLOBS.scale, step)).sort((a, b) => a - b);
        return { min: Math.round(v[0]), median: Math.round(v[Math.floor(v.length / 2)]), max: Math.round(v[v.length - 1]) };
      },
    };
    devRef.current = d;
    (window as unknown as { __liquid?: LiquidDev }).__liquid = d;
  }, [clockRef, start]);
  useEffect(() => {
    const d = devRef.current;
    if (!d) return;
    d.material = material;
    if (dist && regions) {
      const meshV = meshVolume(logoGeometry);
      d.stats = {
        bakeMs: +dist.bakeMs.toFixed(1),
        fieldVolumeCm3: Math.round(dist.volumeCm3),
        meshVolumeCm3: Math.round(meshV),
        volumeErrorPct: +((100 * (dist.volumeCm3 - meshV)) / meshV).toFixed(3),
        topErrorCm: +(prof.top - logoGeometry.boundingBox!.max.z).toFixed(4),
        regionsMs: +regions.ms.toFixed(1),
        regionVolumesCm3: regions.volumes.map(Math.round),
        regionStrengths: regions.strengths.map((s) => +s.toFixed(3)),
      };
    }
  }, [material, dist, regions, logoGeometry, prof]);
  // per-frame scratch
  const tmp = useMemo(() => ({ start: new THREE.Vector3(), w: new THREE.Vector4(), wa: new THREE.Vector4(), wb: new THREE.Vector4(), dir: new THREE.Vector3(), q: new THREE.Quaternion(), p: new THREE.Vector3(), one: new THREE.Vector3(1, 1, 1), live: new THREE.Matrix4() }), []);
  useFrame(() => {
    const u = uRef.current;
    const field = fieldRef.current;
    if (!u || !regions || !field) return;
    // registered first (a layout effect): a warm-up drawn before it would build synchronously
    if (asyncCompile && !handleRef.current) return;
    if (warm.current < WARM_FRAMES) {
      warm.current++;
      field.visible = true;
      for (let i = 0; i < LIQUID_BALLS; i++) u.balls.array[i].setW(0);
      u.logoWeight.value = 0;
      u.wallOn.value = 0;
      u.masking.value = 1;
      return;
    }
    const c = ctl.current;
    const te = clockRef.current.t - start; // time since the expulsion's start — once the landing's wobble has played
    // ⛔ THE GATE (above): the failure branch, the hold, the swap
    const h = handleRef.current;
    const st = h ? h.state() : "ready";
    const off = offRef.current;
    if (h && !off.off) {
      if (st === "failed") off.why = "its pipeline reported an error";
      else if (st === "pending" && holdStartRef.current !== null && performance.now() - holdStartRef.current > GATE.maxWaitMs) off.why = `the ${GATE.maxWaitMs} ms wait ran out`;
      if (off.why) {
        off.off = true;
        console.warn(`[hero liquid] the liquid is OFF for this load: ${off.why}; the solid logo stays`);
      }
    }
    const hold = !!h && st !== "ready" && !off.off;
    holdRef.current.hold = hold;
    if (hold && Math.abs(te) < 1e-6) {
      if (holdStartRef.current === null) {
        holdStartRef.current = performance.now();
        h!.holding();
      }
    } else if (holdStartRef.current !== null) {
      holdMsRef.current = performance.now() - holdStartRef.current;
      holdStartRef.current = null;
    }
    if (te < 0) gateRef.current.open = false;
    else if (!gateRef.current.open && (!h || (st === "ready" && !off.off && te <= GATE.lateReadyS))) gateRef.current.open = true;
    const wantField = c.show === "field" || (c.show === "auto" && te >= 0 && gateRef.current.open);
    field.visible = wantField;
    const solid = logoMeshRef.current;
    if (solid) solid.visible = !wantField;
    u.debug.value = c.debug;
    // the field logo where the solid is now: the jump's pose at the same clock (the landing's wobble included)
    poseAt(clockRef.current.t, tmp.q, tmp.p);
    tmp.live.compose(tmp.p, tmp.q, tmp.one);
    u.worldToLocal.value.copy(tmp.live).invert();
    u.logoWeight.value = te < LIQUID_T.expel ? 1 : 0;
    u.masking.value = te >= 0 && te < LIQUID_T.expel ? 1 : 0;
    // the face's outward normal in world space (the mesh's +Z)
    tmp.dir.set(0, 0, 1).applyQuaternion(tmp.q);
    // the mimic's clock (box-path time) at a time since the expulsion began: half speed, from the expulsion's start
    const clk = (x: number) => Math.max(0, x) * BLOBS.speed * 0.5;
    const lastBirth = (LIQUID_BALLS - 1) * LIQUID_T.stagger;
    const grow = LIQUID_T.expel - lastBirth;
    const TT = LIQUID_T.travel;
    for (let i = 0; i < LIQUID_BALLS; i++) {
      const birth = rank[i] * LIQUID_T.stagger;
      const born = te - birth;
      const k = smooth01(born / grow);
      const ws = regions.strengths[i];
      // the region gives up what the ball takes: its remaining volume 1 − k^1.5
      u.fronts.array[i] = frontAt(regions, i, 1 - k ** 1.5);
      const v = u.balls.array[i];
      tmp.start.copy(regions.anchors[i]).applyMatrix4(tmp.live);
      if (born <= 0) {
        v.set(tmp.start.x, tmp.start.y, tmp.start.z, 0);
        continue;
      }
      if (born >= TT) {
        const [x, y, z] = blobPath(i, clk(te));
        frame.toWorld(x, y, z, v);
        v.w = c.ov.ballsOff ? 0 : ws;
        continue;
      }
      // the arrival: its place on the mimic's paths, and that path's velocity there (cm per second of the loop)
      const ta = birth + TT;
      const e = 0.01;
      let [x, y, z] = blobPath(i, clk(ta));
      frame.toWorld(x, y, z, tmp.w);
      [x, y, z] = blobPath(i, clk(ta + e));
      frame.toWorld(x, y, z, tmp.wb);
      [x, y, z] = blobPath(i, clk(ta - e));
      frame.toWorld(x, y, z, tmp.wa);
      // cubic Hermite in the travel's own time, u ∈ [0, 1]; the tangents are the velocities × the travel time
      const uu = born / TT;
      const h00 = 2 * uu ** 3 - 3 * uu ** 2 + 1;
      const h10 = uu ** 3 - 2 * uu ** 2 + uu;
      const h01 = -2 * uu ** 3 + 3 * uu ** 2;
      const h11 = uu ** 3 - uu ** 2;
      const m0 = LIQUID_T.exitSpeed * TT;
      const m1 = TT / (2 * e);
      v.set(
        h00 * tmp.start.x + h10 * m0 * tmp.dir.x + h01 * tmp.w.x + h11 * m1 * (tmp.wb.x - tmp.wa.x),
        h00 * tmp.start.y + h10 * m0 * tmp.dir.y + h01 * tmp.w.y + h11 * m1 * (tmp.wb.y - tmp.wa.y),
        h00 * tmp.start.z + h10 * m0 * tmp.dir.z + h01 * tmp.w.z + h11 * m1 * (tmp.wb.z - tmp.wa.z),
        c.ov.ballsOff ? 0 : k * ws,
      );
    }
    // ⛔ THE CROWD ON THE WAY (10 November 2026, session 2; Carl: *"they can merge and collide with each other a lot more
    // before they get to the wall"*). Mid-travel each ball is drawn toward the travelling group's CENTRE plus its own slow
    // JOSTLE (`CROWD.jostleCm`, its own phases), by `CROWD.gather × sin²(πu)` — zero, and zero in slope, at both ends of
    // its trip, so it still leaves the face and meets its wall path seamlessly; between, they bump, merge and part. The
    // Builder's take
    let n = 0;
    tmp.p.set(0, 0, 0);
    for (let i = 0; i < LIQUID_BALLS; i++) {
      const born = te - rank[i] * LIQUID_T.stagger;
      if (born > 0 && born < TT) {
        tmp.p.add(u.balls.array[i] as unknown as THREE.Vector3);
        n++;
      }
    }
    if (n > 1) {
      tmp.p.divideScalar(n);
      for (let i = 0; i < LIQUID_BALLS; i++) {
        const born = te - rank[i] * LIQUID_T.stagger;
        if (born <= 0 || born >= TT) continue;
        const s = Math.sin(Math.PI * (born / TT));
        const g = CROWD.gather * s * s;
        const J = CROWD.jostleCm;
        const v = u.balls.array[i];
        v.set(
          v.x + g * (tmp.p.x + J * Math.sin(1.3 * te + 2.1 * i) - v.x),
          v.y + g * (tmp.p.y + J * Math.cos(1.1 * te + 1.7 * i) - v.y),
          v.z + g * (tmp.p.z + J * Math.sin(0.9 * te + 0.8 * i) - v.z),
          v.w,
        );
      }
    }
    if (c.ov.logoOff) u.logoWeight.value = 0;
    u.wallOn.value = c.ov.wallOff ? 0 : 1;
  });
  if (!material) return null;
  return <mesh ref={fieldRef} name="hero liquid" geometry={box.geometry} material={material} visible={false} />;
}
