/** FILM 04 PASS 2, STEP 0(b) — THE YAW PREDICTED ON PAPER (23 October 2026). Where are the studio's softboxes, and at what
 *  `envMapRotation` yaw does a flat face (normal +z) reflect one — front-on and at the bench's oblique pose (az 28°, el 16°)?
 *  ⚠ A PREDICTION ONLY: three's equirect mapping and the rotation's sign make paper easy to miss by 90° or 180° (the
 *  Architect) — the bench's measured sweep decides. Conventions read from three r185: equirectUv(d) = (atan(d.z, d.x)/2π
 *  + 0.5, asin(d.y)/π + 0.5) (common.glsl); the lookup is `envMapRotation * reflectVec`, the Euler NEGATED for a non-cube
 *  map (WebGLMaterials.js), so a yaw Y looks up R_y(−Y)·r.
 *    node …/film04-studio-yaw-predict-23-october.mjs [room]
 *  ⚠ NOT WATCHED: roughness (the PMREM blur) — a rough face averages a wide cone; this samples one direction, lightly blurred. */
import { readFileSync } from "node:fs";
import * as THREE from "three";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";

const ROOM = Number(process.argv[2] ?? 0.1);
const buf = readFileSync("public/env/monochrome_studio_02_1k.hdr");
const l = new HDRLoader();
l.setDataType(THREE.FloatType);
const { width: W, height: H, data } = l.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
// the room darkened as `loadStudioHdri` does (knee 1 → 2)
const lum = new Float32Array(W * H);
for (let i = 0; i < W * H; i++) {
  const L = 0.2126 * data[4 * i] + 0.7152 * data[4 * i + 1] + 0.0722 * data[4 * i + 2];
  const t = Math.min(1, Math.max(0, L - 1));
  lum[i] = L * (ROOM + (1 - ROOM) * t * t * (3 - 2 * t));
}
// ⚠ HDR rows run top (up) to bottom; equirectUv's v = 0.5 + asin(y)/π is measured from the BOTTOM in texture space with
// flipY false for DataTexture → row = (1 − v) · H. Recorded as an assumption the sweep tests.
const at = (u, v) => {
  let s = 0, n = 0;
  for (let dy = -4; dy <= 4; dy++)
    for (let dx = -4; dx <= 4; dx++) {
      const x = (((Math.floor(u * W) + dx) % W) + W) % W, y = Math.min(H - 1, Math.max(0, Math.floor((1 - v) * H) + dy));
      s += lum[y * W + x];
      n++;
    }
  return s / n;
};
// the softboxes: columns whose brightest pixel exceeds L 2
const cols = [];
for (let x = 0; x < W; x++) {
  let m = 0;
  for (let y = 0; y < H; y++) m = Math.max(m, lum[y * W + x]);
  cols.push(m);
}
const runs = [];
for (let x = 0; x < W; x++) if (cols[x] > 2 && (x === 0 || cols[x - 1] <= 2)) { let e = x; while (e + 1 < W && cols[e + 1] > 2) e++; runs.push([x, e]); }
console.log(`HDRI ${W}×${H}, room ${ROOM}. Bright column runs (L > 2), as u and as the direction's azimuth atan2(z, x):`);
for (const [a, b] of runs) {
  const u = (a + b) / 2 / W;
  console.log(`  columns ${a}–${b}: u ${u.toFixed(3)} → azimuth ${(((u - 0.5) * 360 + 540) % 360 - 180).toFixed(1)}°`);
}
const deg = Math.PI / 180;
const camDir = (az, el) => new THREE.Vector3(Math.sin(az * deg) * Math.cos(el * deg), Math.sin(el * deg), Math.cos(az * deg) * Math.cos(el * deg));
const reflect = (cam) => { const v = cam.clone().negate(); return v.sub(new THREE.Vector3(0, 0, 1).multiplyScalar(2 * v.z)); };
for (const [name, cam] of [["front", new THREE.Vector3(0, 0, 1)], ["oblique (az 28°, el 16°)", camDir(28, 16)]]) {
  const r = reflect(cam);
  const rows = [];
  for (let yaw = 0; yaw < 360; yaw += 15) {
    const d = r.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), -yaw * deg);
    const u = Math.atan2(d.z, d.x) / (2 * Math.PI) + 0.5, v = Math.asin(Math.max(-1, Math.min(1, d.y))) / Math.PI + 0.5;
    rows.push([yaw, at(u, v)]);
  }
  const best = [...rows].sort((a, b) => b[1] - a[1]).slice(0, 3);
  console.log(`${name}: reflect dir (${r.x.toFixed(3)}, ${r.y.toFixed(3)}, ${r.z.toFixed(3)}); luminance by yaw (15° steps): ${rows.map(([y, L]) => `${y}:${L.toFixed(2)}`).join(" ")}`);
  console.log(`  PREDICTED brightest yaw: ${best.map(([y, L]) => `${y}° (${L.toFixed(2)})`).join(", ")}`);
}
