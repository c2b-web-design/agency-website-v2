/** FILM 04 PASS 2, STEP 2 — THE FACE AND THE SIDES, SPLIT BY MATERIAL (23 October 2026; plan v2.1, Verification 2).
 *  Runs the REAL module (`lettering-geometry.ts`, through jiti) in Node: `buildLettering` on "Your company" and "Bistro" (its
 *  "i" is TWO shapes, so three's groups run 0, 1, 0, 1 — the Architect's case), the words placed at the font's advances.
 *  Asserted: exactly two groups (0 = faces, 1 = sides); every group-0 triangle faces ±z; no group-1 triangle does; the total
 *  equals the letters' own triangles (nothing lost or doubled); "Your company" totals take 1's 13,676.
 *  ⛔ SEEN RED FIRST: the same check on a split by group POSITION (group 0 → face, the rest → sides) must FAIL on "Bistro".
 *    node project-intelligence/live-work/scripts/film04-pass2-groups-23-october.mjs
 *  ⚠ NOT WATCHED: the browser's kerned positions (advances stand in; groups do not depend on x); the render. */
import { readFileSync } from "node:fs";
import { createJiti } from "jiti";
import * as THREE from "three";
import { Font } from "three/examples/jsm/loaders/FontLoader.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

const jiti = createJiti(import.meta.url, { alias: { "@": process.cwd() } });
const G = await jiti.import("./components/showcase/lettering-geometry.ts".replace("./", process.cwd() + "/"));
const font = new Font(JSON.parse(readFileSync("public/fonts/geist-semibold.typeface.json", "utf8")));
const spec = { sizePx: 160, depthEm: 0.2, bevel: { sizeEm: 0.018, thicknessEm: 0.018, segments: 1 }, curveSegments: 12, creaseDeg: 10 };
const EM = 100000 / 72;
const glyphsFor = (words) => {
  const x = [];
  let pen = 0;
  for (const ch of words) { x.push(pen); pen += ((font.data.glyphs[ch]?.ha ?? 0) * spec.sizePx) / EM; }
  return { chars: words, x, baseline: 0 };
};
const faceZ = (geo, start, count) => {
  const p = geo.attributes.position;
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  let z = 0, n = 0;
  for (let t = start / 3; t < (start + count) / 3; t++) {
    a.fromBufferAttribute(p, 3 * t); b.fromBufferAttribute(p, 3 * t + 1); c.fromBufferAttribute(p, 3 * t + 2);
    const nn = new THREE.Vector3().subVectors(c, b).cross(new THREE.Vector3().subVectors(a, b));
    if (nn.lengthSq() < 1e-12) continue;
    n++;
    if (Math.abs(nn.normalize().z) > 0.999) z++;
  }
  return { z, n };
};
const check = (label, geo, expectTotal) => {
  const g = geo.groups;
  const f = faceZ(geo, g[0].start, g[0].count), s = faceZ(geo, g[1].start, g[1].count);
  const total = geo.attributes.position.count / 3;
  const ok = g.length === 2 && g[0].materialIndex === 0 && g[1].materialIndex === 1 && f.z === f.n && s.z === 0 && total === expectTotal;
  console.log(`${ok ? "✅" : "⛔"} ${label}: groups ${g.length} [${g.map((q) => q.materialIndex).join(",")}] · faces ${f.z}/${f.n} facing ±z · sides facing ±z ${s.z} of ${s.n} · total ${total} (expected ${expectTotal})`);
  return ok;
};
// the letters' own triangle count, and the WRONG split (by group position) for the red run
const own = (words) => [...words].filter((c) => c.trim() && font.data.glyphs[c]).reduce((n, ch) => n + G.glyphGeometry(font, ch, spec.sizePx, spec).attributes.position.count / 3, 0);
const byPosition = (words) => {
  const faces = [], sides = [];
  for (const ch of words) {
    if (!ch.trim() || !font.data.glyphs[ch]) continue;
    const g = G.glyphGeometry(font, ch, spec.sizePx, spec);
    const take = (grp) => { const q = new THREE.BufferGeometry(); for (const [k, a] of Object.entries(g.attributes)) q.setAttribute(k, new THREE.BufferAttribute(a.array.slice(grp.start * a.itemSize, (grp.start + grp.count) * a.itemSize), a.itemSize)); return q; };
    faces.push(take(g.groups[0]));
    g.groups.slice(1).forEach((grp) => sides.push(take(grp)));
  }
  return mergeGeometries([mergeGeometries(faces), mergeGeometries(sides)], true);
};
console.log("⛔ RED RUN — split by group POSITION (must FAIL on Bistro):");
const red = check("Bistro, by position", byPosition("Bistro"), own("Bistro"));
console.log(red ? "⛔ the red run did NOT fail — the check cannot see the defect" : "   (failed, as it must)");
console.log("THE REAL SPLIT — `splitByMaterial` inside `buildLettering`:");
const words = ["Your company", "Bistro"];
const results = words.map((w) => check(w, G.buildLettering(spec, font, glyphsFor(w)).geometry, own(w)));
console.log(`${own("Your company") === 13676 ? "✅" : "⛔"} "Your company" letters total ${own("Your company")} (take 1, R-088: 13,676)`);
console.log(!red && results.every(Boolean) ? "✅ VERDICT: faces and sides split by material, Bistro's i included" : "⛔ VERDICT: FAILED");

// ⛔ STEP 3 — ONE SHEET: every FACE vertex's uv equals its position's x, y EXACTLY (the grain runs through the word).
// Seen red first on three's own UVs (each letter from its own origin, before the placement is applied).
const sheet = (geo, start, count) => {
  const p = geo.attributes.position, uv = geo.attributes.uv;
  let off = 0, worst = 0;
  for (let v = start; v < start + count; v++) {
    const d = Math.max(Math.abs(uv.getX(v) - p.getX(v)), Math.abs(uv.getY(v) - p.getY(v)));
    if (d !== 0) off++;
    worst = Math.max(worst, d);
  }
  return { off, worst };
};
{
  const g = G.glyphGeometry(font, "m", spec.sizePx, spec);
  g.translate(500, 40, 0);
  const [face] = G.splitByMaterial(g);
  const r = sheet(face, 0, face.attributes.position.count);
  console.log(`${r.off > 0 ? "   (red, as it must)" : "⛔ the red run did NOT fail"} RED RUN three's own face UVs on a placed "m": ${r.off} vertices off, worst ${r.worst.toFixed(1)} px`);
}
for (const w of words) {
  const geo = G.buildLettering(spec, font, glyphsFor(w)).geometry;
  const r = sheet(geo, geo.groups[0].start, geo.groups[0].count);
  console.log(`${r.off === 0 ? "✅" : "⛔"} ONE SHEET "${w}": face vertices with uv ≠ position.xy: ${r.off} of ${geo.groups[0].count} (worst ${r.worst})`);
}
console.log("⚠ NOT WATCHED: the browser's kerned x (advances stand in — groups do not depend on x); the render.");
