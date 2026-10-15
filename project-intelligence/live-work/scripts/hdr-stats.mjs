import { readFileSync } from "node:fs";
import * as THREE from "three";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";
const buf = readFileSync(process.argv[2]);
const l = new HDRLoader(); l.setDataType(THREE.FloatType);
const r = l.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
const { width: w, height: h, data } = r;
const L = []; let sum = 0;
for (let i = 0; i < w * h; i++) { const v = 0.2126 * data[i * 4] + 0.7152 * data[i * 4 + 1] + 0.0722 * data[i * 4 + 2]; L.push(v); sum += v; }
const s = [...L].sort((a, b) => a - b);
const q = (p) => s[Math.floor(p * (s.length - 1))].toFixed(3);
console.log(w, h, "stride", data.length / (w * h));
console.log("percentiles 10/25/50/75/90/95/99/99.9/max:", [0.1,0.25,0.5,0.75,0.9,0.95,0.99,0.999,1].map(q).join(" "));
// energy share above thresholds
for (const t of [1, 2, 5, 10]) { let e = 0; for (const v of L) if (v > t) e += v; console.log(`share of light above L ${t}: ${(100 * e / sum).toFixed(1)}%  (${(100 * L.filter((v) => v > t).length / L.length).toFixed(2)}% of pixels)`); }
