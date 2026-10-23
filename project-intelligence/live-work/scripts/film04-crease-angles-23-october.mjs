/** FILM 04 — THE FACETED SIDE WALLS: where to set the crease (23 October 2026).
 *  Builds each letter of the lockup exactly as the bench does (`TextGeometry`, 160 px, depth 0.2 em, chamfer 0.018 em,
 *  curveSegments 12) and measures the DIHEDRAL angle across every shared edge: the angle between the two triangles' normals.
 *  Flat face triangles meet at 0°; the steps of a flattened curve meet at a few degrees; real corners and the chamfer meet
 *  at tens of degrees. A crease angle between the two groups smooths the first and keeps the second sharp.
 *    node project-intelligence/live-work/scripts/film04-crease-angles-23-october.mjs [chars]
 *  ⚠ NOT WATCHED: how the smoothed letters LOOK — that is Carl's eye, on the bench. */
import fs from "node:fs";
import * as THREE from "three";
import { Font } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

const CHARS = process.argv[2] ?? "YOURCOMPANYLOGO";
const font = new Font(JSON.parse(fs.readFileSync("public/fonts/geist-semibold.typeface.json", "utf8")));
const SIZE_PX = 160, EM_UNITS = 100000 / 72;
const size = (SIZE_PX * font.data.resolution) / EM_UNITS;
const thick = 0.018 * SIZE_PX, bevel = 0.018 * SIZE_PX;
const straight = 0.2 * SIZE_PX - 2 * thick;

const all = [];
const perChar = {};
for (const ch of [...new Set(CHARS)]) {
  const g = new TextGeometry(ch, { font, size, depth: straight, curveSegments: 12, bevelEnabled: true, bevelThickness: thick, bevelSize: bevel, bevelOffset: -bevel, bevelSegments: 1 });
  const p = g.attributes.position;
  const key = (i) => `${p.getX(i).toFixed(3)},${p.getY(i).toFixed(3)},${p.getZ(i).toFixed(3)}`;
  const edges = new Map();
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  for (let t = 0; t < p.count / 3; t++) {
    a.fromBufferAttribute(p, 3 * t); b.fromBufferAttribute(p, 3 * t + 1); c.fromBufferAttribute(p, 3 * t + 2);
    const n = new THREE.Vector3().subVectors(c, b).cross(new THREE.Vector3().subVectors(a, b));
    if (n.lengthSq() < 1e-12) continue;
    n.normalize();
    for (const [i, j] of [[0, 1], [1, 2], [2, 0]]) {
      const ki = key(3 * t + i), kj = key(3 * t + j);
      const k = ki < kj ? `${ki}|${kj}` : `${kj}|${ki}`;
      (edges.get(k) ?? edges.set(k, []).get(k)).push(n);
    }
  }
  const angles = [];
  for (const ns of edges.values()) if (ns.length === 2) angles.push((Math.acos(Math.max(-1, Math.min(1, ns[0].dot(ns[1])))) * 180) / Math.PI);
  const bent = angles.filter((x) => x > 0.01);
  perChar[ch] = bent;
  all.push(...bent);
  g.dispose();
}
const bins = [0, 2, 4, 6, 8, 10, 12, 15, 20, 25, 30, 35, 40, 44, 46, 60, 90, 180];
console.log(`dihedral angles across shared edges (0° excluded), ${CHARS}, 160 px, curveSegments 12, chamfer 0.018 em`);
for (let i = 0; i + 1 < bins.length; i++) {
  const n = all.filter((x) => x >= bins[i] && x < bins[i + 1]).length;
  console.log(`${String(bins[i]).padStart(3)}–${String(bins[i + 1]).padEnd(3)}° ${String(n).padStart(5)} ${"#".repeat(Math.ceil(n / 8))}`);
}
const steps = all.filter((x) => x < 20), corners = all.filter((x) => x >= 20);
console.log(`largest below 20°: ${Math.max(...steps).toFixed(2)}°   smallest at or above 20°: ${Math.min(...corners).toFixed(2)}°`);
for (const [ch, xs] of Object.entries(perChar)) {
  const lo = xs.filter((x) => x < 20), hi = xs.filter((x) => x >= 20).sort((p, q) => p - q);
  console.log(`${ch}: curve steps max ${lo.length ? Math.max(...lo).toFixed(2) : "-"}°  ·  corners ${hi.length ? `min ${hi[0].toFixed(1)}°` : "none"}  (${[...new Set(hi.map((x) => x.toFixed(0)))].slice(0, 8).join(", ")})`);
}

// ⛔ THE CREASE APPLIED (the bench's `glyphGeometry` path: `toCreasedNormals`, CREASE°). Asserted: the flat FACE keeps its
// normal exactly (no smear onto it from the chamfer); every vertex normal stays within the crease of its own triangle's.
// And it must be SEEN RED: at crease 0 nothing is smoothed, at 60° the chamfer is pulled into the face.
const { toCreasedNormals } = await import("three/examples/jsm/utils/BufferGeometryUtils.js");
for (const CREASE of [0, 10, 60]) {
  let faceBad = 0, faceN = 0, smoothed = 0, worst = 0;
  for (const ch of [...new Set(CHARS)]) {
    let g = new TextGeometry(ch, { font, size, depth: straight, curveSegments: 12, bevelEnabled: true, bevelThickness: thick, bevelSize: bevel, bevelOffset: -bevel, bevelSegments: 1 });
    if (CREASE > 0) g = toCreasedNormals(g, (CREASE * Math.PI) / 180);
    const p = g.attributes.position, nrm = g.attributes.normal;
    const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), v = new THREE.Vector3();
    for (let t = 0; t < p.count / 3; t++) {
      a.fromBufferAttribute(p, 3 * t); b.fromBufferAttribute(p, 3 * t + 1); c.fromBufferAttribute(p, 3 * t + 2);
      const fn = new THREE.Vector3().subVectors(c, b).cross(new THREE.Vector3().subVectors(a, b));
      if (fn.lengthSq() < 1e-12) continue;
      fn.normalize();
      for (let k = 0; k < 3; k++) {
        v.fromBufferAttribute(nrm, 3 * t + k).normalize();
        const dev = (Math.acos(Math.max(-1, Math.min(1, v.dot(fn)))) * 180) / Math.PI;
        if (Math.abs(fn.z) > 0.999) { faceN++; if (dev > 1e-3) faceBad++; }
        if (dev > 1e-3) smoothed++;
        worst = Math.max(worst, dev);
      }
    }
    g.dispose();
  }
  const verdict = smoothed === 0 ? "⛔ nothing smoothed (faceted)" : faceBad > 0 ? "⛔ the FACE smeared" : worst > CREASE + 0.01 ? "⛔ a normal bent past the crease" : "✅";
  console.log(`crease ${String(CREASE).padStart(2)}°: ${verdict} · face vertices off their normal ${faceBad} of ${faceN} · vertices smoothed ${smoothed} · worst deviation ${worst.toFixed(2)}°`);
}
