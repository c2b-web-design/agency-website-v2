/** How much the moving lamp changes the pill, frame against frame (13 October): mean and 99th-percentile per-pixel luminance
 *  change of each frozen lamp point against the 0.15 point, inside the pill. Gold (pass 3) vs the approved teal (bench, 1×).
 *  ⚠ NOT WATCHED: motion; the teal at 2× on the page. The 0.15 point itself carries some lamp (the fade is 0–0.15). */
import sharp from "sharp";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const D = join(dirname(fileURLToPath(import.meta.url)), "..", "screenshots", "gold-button-13-october", "pass3");
const lum = async (f) => { const { data, info } = await sharp(join(D, f)).removeAlpha().raw().toBuffer({ resolveWithObject: true }); const L = new Float32Array(info.width * info.height); for (let i = 0; i < L.length; i++) L[i] = 0.2126 * data[3 * i] + 0.7152 * data[3 * i + 1] + 0.0722 * data[3 * i + 2]; return L; };
async function cmp(a, b) { const A = await lum(a), B = await lum(b); const d = []; for (let i = 0; i < A.length; i++) if (A[i] > 30 || B[i] > 30) d.push(Math.abs(A[i] - B[i])); d.sort((x, y) => x - y); const mean = d.reduce((s, x) => s + x, 0) / d.length; return `${b}: mean ${mean.toFixed(1)}, p99 ${d[Math.floor(d.length * 0.99)].toFixed(0)} (of 255)`; }
for (const mt of ["0.3", "0.5", "0.7", "0.85"]) console.log("gold ", await cmp("4x_mt0.15.png", `4x_mt${mt}.png`));
console.log("teal ", await cmp("teal_4x_mt0.15.png", "teal_4x_mt0.3.png"));
console.log("control (same file):", await cmp("4x_mt0.15.png", "4x_mt0.15.png"));
