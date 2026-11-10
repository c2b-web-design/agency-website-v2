"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { LOGO_ASPECT, LOGO_OUTLINE, LOGO_R_CAP } from "@/components/about/logo-mark-outline";
import { LOGO_MARK_DEFAULTS } from "@/components/about/logo-mark-geometry";
import { useDisposeOnUnmount } from "@/lib/use-dispose-on-unmount";
import { LIQUID_BALLS, type LiquidUniforms } from "./hero-liquid-webgpu";
import { HERO_LOGO_PLACE } from "./hero-logo";

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
 * the ten balls, the wall. A LOOP on the bench (`LIQUID_T`):
 * 1. HOLD — the solid logo, the MESH (the field hidden).
 * 2. EXPEL (0.5 s) — ⛔ the swap to the field at its first frame, as the first bulge starts (D2, Carl's: "yes"). Each ball
 *    is BORN inside the logo (its strength 0 → 1) at one of ten spots on its widest strokes, staggered 30 ms, and pushed
 *    out of its RIGHT FACE (the lean's face looks right, toward the wall); the logo's weight falls 1 → 0.55, below which
 *    nothing of it is left (the plate's half-thickness).
 * 3. TRAVEL — ⛔ ONE FLUID PATH per ball (Carl's note, take 1: *"expelled, stop, get some momentum from somwhere and fly far
 *    too fast towards the wall ... it should all be onr "fluid" movement"*): a cubic Hermite from its spot, LEAVING THE FACE
 *    ALREADY MOVING (`exitSpeed` cm/s along the face's normal), to its place on the mimic's paths, ARRIVING WITH THAT
 *    PATH's VELOCITY (no seam), `travel` s after its birth. The mimic's clock runs from the expulsion's start, so the path it
 *    arrives on is already moving.
 * 4. WALL (3 s) — the mimic, as approved: the example's paths, its half-speed clock, the wall's swell.
 * ⚠ NOT YET: the middle (~3 s), the mould; the mass is not held (the field's volume swings; step 4's curve).
 */
const LIQUID_T = { hold: 1, expel: 0.5, travel: 2.5, wall: 3, stagger: 0.03, exitSpeed: 150 } as const;
const smooth01 = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

/** ten spots on the logo's widest strokes (local cm, mid-thickness): the deepest texels first, at least `sep` apart */
function logoSpots(dist: LogoDistance, n: number, sep: number, top: number): THREE.Vector3[] {
  const cand: number[] = [];
  for (let i = 0; i < dist.dCm.length; i++) if (dist.dCm[i] >= 3) cand.push(i);
  cand.sort((a, b) => dist.dCm[b] - dist.dCm[a]);
  const texel = dist.size[0] / dist.cols;
  for (let s = sep; s >= 5; s *= 0.8) {
    const out: THREE.Vector3[] = [];
    for (const id of cand) {
      const x = dist.origin[0] + ((id % dist.cols) + 0.5) * texel;
      const y = dist.origin[1] + (Math.floor(id / dist.cols) + 0.5) * texel;
      if (out.every((q) => (q.x - x) ** 2 + (q.y - y) ** 2 >= s * s)) out.push(new THREE.Vector3(x, y, top / 2));
      if (out.length === n) return out;
    }
  }
  return [];
}

export type LiquidShow = "auto" | "mesh" | "field";
type LiquidDev = {
  stats: { bakeMs: number; fieldVolumeCm3: number; meshVolumeCm3: number; volumeErrorPct: number; topErrorCm: number; spots: number } | null;
  play(on: boolean): void;
  /** freeze at a time in the loop (s) */
  at(t: number): void;
  show(s: LiquidShow): void;
  debug(n: number): void;
  /** ⚠ diagnosis: terms forced off after the timeline is applied */
  override(o: { logoOff?: boolean; wallOff?: boolean; ballsOff?: boolean }): void;
  time(): number;
  material: THREE.Material | null;
  /** the mimic's balls-only volume at the wall (cm³), sampled over time */
  volume(samples?: number, step?: number): { min: number; median: number; max: number };
};

export function HeroLiquid({ make, logoMaterial, logoGeometry, position, quaternion, onMeshVisible }: { make: () => THREE.Material; logoMaterial: THREE.MeshStandardMaterial; logoGeometry: THREE.BufferGeometry; position: [number, number, number]; quaternion: THREE.Quaternion; onMeshVisible: (v: boolean) => void }) {
  const heightCm = useMemo(() => {
    logoGeometry.computeBoundingBox();
    const b = logoGeometry.boundingBox!;
    return b.max.y - b.min.y;
  }, [logoGeometry]);
  const prof = useMemo(() => logoProfileCm(heightCm), [heightCm]);
  // ⚠ the bake: on the main thread, a task after mount (this mounts after the reflection, so after the hero is ready)
  const [dist, setDist] = useState<LogoDistance | null>(null);
  useEffect(() => {
    const id = window.setTimeout(() => setDist(bakeLogoDistance(heightCm, prof)), 0);
    return () => window.clearTimeout(id);
  }, [heightCm, prof]);
  useDisposeOnUnmount(dist ?? { dispose: () => {} });
  // the logo's frame (world ← local), and the ten spots in world cm
  const logoFrame = useMemo(() => new THREE.Matrix4().compose(new THREE.Vector3(...position), quaternion, new THREE.Vector3(1, 1, 1)), [position, quaternion]);
  const spots = useMemo(() => (dist ? logoSpots(dist, LIQUID_BALLS, 30, prof.top) : []), [dist, prof]);
  const frame = useMemo(() => blobFrame(BLOBS.scale), []);
  // the proxy box: the logo's world bounds (+ the field's reach) united with the wall's box
  const box = useMemo(() => {
    const lb = logoGeometry.boundingBox!.clone().applyMatrix4(logoFrame);
    lb.expandByScalar(0.3 * BLOBS.scale);
    lb.union(new THREE.Box3(frame.min, frame.max));
    const g = new THREE.BoxGeometry(lb.max.x - lb.min.x, lb.max.y - lb.min.y, lb.max.z - lb.min.z);
    g.translate((lb.min.x + lb.max.x) / 2, (lb.min.y + lb.max.y) / 2, (lb.min.z + lb.max.z) / 2);
    return { geometry: g, min: lb.min.clone(), max: lb.max.clone(), dispose: () => g.dispose() };
  }, [logoGeometry, logoFrame, frame]);
  useDisposeOnUnmount(box);
  const material = useMemo(() => {
    if (!dist) return null;
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
      u.worldToLocal.value.copy(logoFrame).invert();
      u.boxMin.value.copy(box.min);
      u.boxMax.value.copy(box.max);
      u.scale.value = BLOBS.scale;
      u.strength.value = BLOBS.strength;
      u.subtract.value = BLOBS.subtract;
      u.isolation.value = BLOBS.isolation;
      u.wallX.value = frame.wallX;
    }
    return m;
  }, [make, logoMaterial, dist, prof, logoFrame, box, frame]);
  useDisposeOnUnmount(material ?? { dispose: () => {} });
  const uRef = useRef<LiquidUniforms | null>(null);
  useEffect(() => {
    uRef.current = (material?.userData as { liquid?: LiquidUniforms } | undefined)?.liquid ?? null;
  }, [material]);
  const ctl = useRef({ playing: true, t: 0, show: "auto" as LiquidShow, debug: 0, ov: {} as { logoOff?: boolean; wallOff?: boolean; ballsOff?: boolean } });
  // the mesh shows during the HOLD; the field from the first bulge on (D2)
  const [fieldOn, setFieldOn] = useState(false);
  useEffect(() => {
    onMeshVisible(!fieldOn);
    return () => onMeshVisible(true);
  }, [fieldOn, onMeshVisible]);
  const devRef = useRef<LiquidDev | null>(null);
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const d: LiquidDev = {
      stats: null,
      play: (on) => void (ctl.current.playing = on),
      at: (t) => {
        ctl.current.playing = false;
        ctl.current.t = t;
      },
      show: (s) => void (ctl.current.show = s),
      debug: (n) => void (ctl.current.debug = n),
      override: (o) => void (ctl.current.ov = o),
      time: () => ctl.current.t,
      material: null,
      volume: (samples = 12, step = 1.5) => {
        const v = Array.from({ length: samples }, (_, k) => blobVolume(k * 2.5, BLOBS.scale, step)).sort((a, b) => a - b);
        return { min: Math.round(v[0]), median: Math.round(v[Math.floor(v.length / 2)]), max: Math.round(v[v.length - 1]) };
      },
    };
    devRef.current = d;
    (window as unknown as { __liquid?: LiquidDev }).__liquid = d;
  }, []);
  useEffect(() => {
    const d = devRef.current;
    if (!d) return;
    d.material = material;
    if (dist) {
      const meshV = meshVolume(logoGeometry);
      d.stats = { bakeMs: +dist.bakeMs.toFixed(1), fieldVolumeCm3: Math.round(dist.volumeCm3), meshVolumeCm3: Math.round(meshV), volumeErrorPct: +((100 * (dist.volumeCm3 - meshV)) / meshV).toFixed(3), topErrorCm: +(prof.top - logoGeometry.boundingBox!.max.z).toFixed(4), spots: spots.length };
    }
  }, [material, dist, logoGeometry, prof, spots]);
  // per-frame scratch
  const tmp = useMemo(() => ({ start: new THREE.Vector3(), w: new THREE.Vector4(), wa: new THREE.Vector4(), wb: new THREE.Vector4(), dir: new THREE.Vector3() }), []);
  useFrame((_, delta) => {
    const u = uRef.current;
    if (!u || spots.length < LIQUID_BALLS) return;
    const c = ctl.current;
    const lastBirth = (LIQUID_BALLS - 1) * LIQUID_T.stagger;
    const T = LIQUID_T.hold + lastBirth + LIQUID_T.travel + LIQUID_T.wall;
    if (c.playing) c.t = (c.t + Math.min(delta, 0.1)) % T;
    const t = c.t;
    const te = t - LIQUID_T.hold; // time since the expulsion began
    const wantField = c.show === "field" || (c.show === "auto" && te >= 0);
    if (wantField !== fieldOn) setFieldOn(wantField);
    u.debug.value = c.debug;
    u.logoWeight.value = te < 0 ? 1 : te >= LIQUID_T.expel ? 0 : 1 - 0.45 * smooth01(te / LIQUID_T.expel);
    // the face's outward normal in world space (the mesh's +Z)
    tmp.dir.set(0, 0, 1).transformDirection(logoFrame);
    // the mimic's clock (box-path time) at a time since the expulsion began: half speed, from the expulsion's start
    const clock = (x: number) => Math.max(0, x) * BLOBS.speed * 0.5;
    const grow = LIQUID_T.expel - lastBirth;
    const TT = LIQUID_T.travel;
    for (let i = 0; i < LIQUID_BALLS; i++) {
      const birth = i * LIQUID_T.stagger;
      const born = te - birth;
      const k = smooth01(born / grow);
      const v = u.balls.array[i];
      tmp.start.copy(spots[i]).applyMatrix4(logoFrame);
      if (born <= 0) {
        v.set(tmp.start.x, tmp.start.y, tmp.start.z, 0);
        continue;
      }
      if (born >= TT) {
        const [x, y, z] = blobPath(i, clock(te));
        frame.toWorld(x, y, z, v);
        v.w = c.ov.ballsOff ? 0 : 1;
        continue;
      }
      // the arrival: its place on the mimic's paths, and that path's velocity there (cm per second of the loop)
      const ta = birth + TT;
      const e = 0.01;
      let [x, y, z] = blobPath(i, clock(ta));
      frame.toWorld(x, y, z, tmp.w);
      [x, y, z] = blobPath(i, clock(ta + e));
      frame.toWorld(x, y, z, tmp.wb);
      [x, y, z] = blobPath(i, clock(ta - e));
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
        c.ov.ballsOff ? 0 : k,
      );
    }
    if (c.ov.logoOff) u.logoWeight.value = 0;
    u.wallOn.value = c.ov.wallOff ? 0 : 1;
  });
  if (!material) return null;
  return <mesh name="hero liquid" geometry={box.geometry} material={material} visible={fieldOn} />;
}
