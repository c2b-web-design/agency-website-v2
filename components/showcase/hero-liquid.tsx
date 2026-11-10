"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { LOGO_ASPECT, LOGO_OUTLINE, LOGO_R_CAP, LOGO_STEM } from "@/components/about/logo-mark-outline";
import { LOGO_MARK_DEFAULTS } from "@/components/about/logo-mark-geometry";
import { useDisposeOnUnmount } from "@/lib/use-dispose-on-unmount";
import type { LiquidFieldUniforms } from "./hero-liquid-webgpu";

/**
 * ⛔ THE LIQUID, ROUTE B — PROBE 2 (10 November 2026; THROWAWAY until the choice; D-101). `live-work/structural-note-hero-
 * liquid-9-november.md` v1.5, APPROVED, the live plan's STEP 2: the logo in the field, the first handover, ONE blob out of
 * the logo's right face, the drain's look. Plain three only: the node material comes from the hero's WebGPU part through
 * `HeroLogo`'s slot (`liquidFieldMaterial`, `hero-liquid-webgpu.tsx`); `HeroLogo` mounts this inside itself.
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
  return { texture, origin: [x0, y0], size: [cols * TEXEL_CM, rows * TEXEL_CM], cols, rows, bakeMs: performance.now() - t0, volumeCm3: volume, dispose: () => texture.dispose() };
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
 * ⛔ THE BLOB (part 3; the Builder's TAKE, Carl judges by eye): ONE sphere out of the logo's RIGHT FACE (the mesh's +Z; at
 * the lean, world right), at the b's STEM (`LOGO_STEM`'s centre), the largest blob's size (Ø 41 cm, the note's 50 %).
 * Its centre rides out along the face's normal, h radii above the face (−0.2 → 1.8); its radius grows to R while it
 * crosses the face, never reaching through the logo's BACK (r ≤ 0.9 × the thickness ÷ (1 − h)). The smooth minimum
 * (6 cm; less while the blob is under 10 cm across, since a smooth minimum with a POINT still bulges the face by a quarter
 * of its width) makes the bulge and the neck; it pinches off once the gap passes the blend. A PING-PONG on the bench: out
 * 2.5 s, held 0.5 s, back in 2.5 s, held 0.5 s (no pop at the loop).
 * ⚠ The radius grows from nothing: NO MASS ACCOUNTING HERE. The logo's weight does not fall as the blob leaves; the
 * drain (part 4) and the volume curve (step 4) are where the mass is kept.
 */
const BLOB = { radius: 20.5, blend: 6, h0: -0.2, h1: 1.8, grow: 0.45, out: 2.5, hold: 0.5 } as const;
const smooth = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};
function blobAt(s: number, top: number, at: THREE.Vector2, out: THREE.Vector3): number {
  const h = BLOB.h0 + (BLOB.h1 - BLOB.h0) * s;
  const cap = h < 1 ? (0.9 * top) / Math.max(1 - h, 1e-3) : Infinity;
  const r = Math.min(BLOB.radius * smooth(s / BLOB.grow), cap);
  out.set(at.x, at.y, top + h * r);
  return r;
}
function loopS(time: number): number {
  const T = 2 * (BLOB.out + BLOB.hold);
  const u = ((time % T) + T) % T;
  if (u < BLOB.out) return u / BLOB.out;
  if (u < BLOB.out + BLOB.hold) return 1;
  if (u < 2 * BLOB.out + BLOB.hold) return 1 - (u - BLOB.out - BLOB.hold) / BLOB.out;
  return 0;
}

export type LiquidShow = "field" | "mesh";
type LiquidDev = {
  stats: { bakeMs: number; cols: number; rows: number; fieldVolumeCm3: number; meshVolumeCm3: number; volumeErrorPct: number; profileTopCm: number; meshTopCm: number; topErrorCm: number } | null;
  show(s: LiquidShow): void;
  blob(on: boolean): void;
  play(on: boolean): void;
  at(s: number): void;
  erode(cm: number): void;
  debug(n: number): void;
  /** a view-space normal material for the mesh's side of the normal comparison (a harness has no import of three) */
  normalMaterial(): THREE.Material;
  material: THREE.Material | null;
};

/** the probe's proxy box margin around the logo, and the blob's reach out of the face (cm) */
const BOX_MARGIN = 3;

export function HeroLiquid({ make, logoMaterial, logoGeometry, position, quaternion, onMeshVisible }: { make: () => THREE.Material; logoMaterial: THREE.MeshStandardMaterial; logoGeometry: THREE.BufferGeometry; position: [number, number, number]; quaternion: THREE.Quaternion; onMeshVisible: (v: boolean) => void }) {
  const heightCm = useMemo(() => {
    logoGeometry.computeBoundingBox();
    const b = logoGeometry.boundingBox!;
    return b.max.y - b.min.y;
  }, [logoGeometry]);
  const prof = useMemo(() => logoProfileCm(heightCm), [heightCm]);
  // ⚠ the bake: on the main thread, a task after mount (the hero is ready by then: this mounts after the reflection)
  const [dist, setDist] = useState<LogoDistance | null>(null);
  useEffect(() => {
    const id = window.setTimeout(() => setDist(bakeLogoDistance(heightCm, prof)), 0);
    return () => window.clearTimeout(id);
  }, [heightCm, prof]);
  useDisposeOnUnmount(dist ?? { dispose: () => {} });
  // ⛔ PARKED by default (10 November 2026): the bench shows the LOGO MESH, for Carl's eye on the fixed reflection; the field
  // and the blob are reached through `__liquid` until the drain (several blobs, ~500 ms, nothing left behind) is built
  const [show, setShow] = useState<LiquidShow>("mesh");
  const [blobOn, setBlobOn] = useState(false);
  const ctl = useRef({ playing: false, s: 0, erode: 0, debug: 0 });
  const box = useMemo(() => {
    const b = logoGeometry.boundingBox!;
    const min = new THREE.Vector3(b.min.x - BOX_MARGIN, b.min.y - BOX_MARGIN, b.min.z - BOX_MARGIN);
    const max = new THREE.Vector3(b.max.x + BOX_MARGIN, b.max.y + BOX_MARGIN, prof.top + (BLOB.h1 + 1) * BLOB.radius + BOX_MARGIN);
    const g = new THREE.BoxGeometry(max.x - min.x, max.y - min.y, max.z - min.z);
    g.translate((min.x + max.x) / 2, (min.y + max.y) / 2, (min.z + max.z) / 2);
    return { geometry: g, min, max, dispose: () => g.dispose() };
  }, [logoGeometry, prof]);
  useDisposeOnUnmount(box);
  // the material: a new one when the logo's material is replaced (its reflection arrived) or the bake lands
  const material = useMemo(() => {
    if (!dist) return null;
    const m = make() as THREE.MeshStandardMaterial;
    m.color.copy(logoMaterial.color);
    m.metalness = logoMaterial.metalness;
    m.roughness = logoMaterial.roughness;
    m.envMap = logoMaterial.envMap;
    m.envMapIntensity = logoMaterial.envMapIntensity;
    m.envMapRotation.copy(logoMaterial.envMapRotation);
    const u = (m.userData as { liquid?: LiquidFieldUniforms }).liquid;
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
      u.boxMin.value.copy(box.min);
      u.boxMax.value.copy(box.max);
      u.blend.value = BLOB.blend;
    }
    return m;
  }, [make, logoMaterial, dist, prof, box]);
  useDisposeOnUnmount(material ?? { dispose: () => {} });
  // the owner's mesh is hidden while the field draws the logo (the note: hidden, not unmounted)
  const fieldShown = !!material && show === "field";
  useEffect(() => {
    onMeshVisible(!fieldShown);
    return () => onMeshVisible(true);
  }, [fieldShown, onMeshVisible]);
  // ⚠ DEV: `window.__liquid`
  const devRef = useRef<LiquidDev | null>(null);
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const d: LiquidDev = {
      stats: null,
      show: setShow,
      blob: setBlobOn,
      play: (on) => void (ctl.current.playing = on),
      at: (s) => {
        ctl.current.playing = false;
        ctl.current.s = s;
      },
      erode: (cm) => void (ctl.current.erode = cm),
      debug: (n) => void (ctl.current.debug = n),
      normalMaterial: () => new THREE.MeshNormalMaterial(),
      material: null,
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
      const meshTop = logoGeometry.boundingBox!.max.z;
      d.stats = { bakeMs: +dist.bakeMs.toFixed(1), cols: dist.cols, rows: dist.rows, fieldVolumeCm3: Math.round(dist.volumeCm3), meshVolumeCm3: Math.round(meshV), volumeErrorPct: +((100 * (dist.volumeCm3 - meshV)) / meshV).toFixed(3), profileTopCm: +prof.top.toFixed(4), meshTopCm: +meshTop.toFixed(4), topErrorCm: +(prof.top - meshTop).toFixed(4) };
    }
  }, [material, dist, logoGeometry, prof]);
  const meshRef = useRef<THREE.Mesh>(null);
  const at = useMemo(() => new THREE.Vector2(((LOGO_STEM.x0 + LOGO_STEM.x1) / 2) * heightCm, ((LOGO_STEM.y0 + LOGO_STEM.y1) / 2) * heightCm), [heightCm]);
  // the uniforms, written per frame through a REF (the material itself is a hook's value: never mutated in render code)
  const uRef = useRef<LiquidFieldUniforms | null>(null);
  useEffect(() => {
    uRef.current = (material?.userData as { liquid?: LiquidFieldUniforms } | undefined)?.liquid ?? null;
  }, [material]);
  useFrame((state) => {
    const mesh = meshRef.current;
    const u = uRef.current;
    if (!mesh || !u) return;
    mesh.updateWorldMatrix(true, false);
    u.localToWorld.value.copy(mesh.matrixWorld);
    u.worldToLocal.value.copy(mesh.matrixWorld).invert();
    const c = ctl.current;
    if (c.playing) c.s = loopS(state.clock.elapsedTime);
    u.erode.value = c.erode;
    u.debug.value = c.debug;
    const r = blobOn ? blobAt(c.s, prof.top, at, u.blobCentre.value) : -1000;
    u.blobRadius.value = r;
    // the blend scales with a small blob: a smooth minimum with a POINT still bulges the surface by blend/4
    u.blend.value = Math.max(0.01, Math.min(BLOB.blend, 0.6 * r));
  });
  if (!material) return null;
  return <mesh ref={meshRef} name="hero liquid" geometry={box.geometry} material={material} position={position} quaternion={quaternion} visible={show === "field"} />;
}
