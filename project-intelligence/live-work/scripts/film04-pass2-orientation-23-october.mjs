/** FILM 04 PASS 2, STEP 1 (continued) — WHICH WAY DOES THE BRUSHING SMEAR? Measured on the MIRROR PROBE (23 October 2026).
 *  Why: the first orientation reading, on the LETTERS, flipped between two yaws (285° → R 2.58 / 1.15; 30° → 1.12 / 2.70) —
 *  a whole-word gradient ratio depends on where a softbox edge happens to fall. So: a flat panel in the face material,
 *  UVs oriented as the faces' (`?probe=mirror`), reflecting the studio itself; the panel's CENTRAL region only; roughness
 *  0.15 (features sharp enough to blur); at every 30° of studio yaw and two camera poses, summed.
 *  For each rotation: fx = ΣGx(rotation) / ΣGx(no brushing), fy likewise. A smear ALONG an axis softens edges ACROSS it:
 *  smearing along x lowers Gx, so fx < fy means the highlight stretches HORIZONTALLY; fy < fx, VERTICALLY.
 *  ⛔ RED RUN first: no brushing vs no brushing must give fx = fy = 1 exactly.
 *  ⛔ WRITTEN BEFORE THE RUN (the plan's prediction, which the letters' first reading contradicted): rotation 0 → fx < fy
 *  (horizontal stretch, along the tangent); π/2 → fy < fx (vertical). Horizontal grain needs VERTICAL streaks.
 *    node …/film04-pass2-orientation-23-october.mjs <base> <outDir>
 *  ⚠ NOT WATCHED: the letters themselves (the probe stands in for their faces); the edge material; how it looks. */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const [BASE = "http://localhost:3000", OUT = "."] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 })).newPage();
const errors = [];
p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
const lum = (d, i) => 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
const frame = async (q, save) => {
  await p.goto(`${BASE}/proto/showcase?layout=line&mode=material&view=oblique&probe=mirror&froughness=0.15&${q}`, { waitUntil: "networkidle" });
  await p.waitForFunction(() => window.__showcaseBench?.ready, null, { timeout: 60000 });
  await p.addStyleTag({ content: "nextjs-portal{display:none!important}" });
  await p.waitForTimeout(600);
  const c = await p.locator("canvas").first().boundingBox();
  // the panel's central region: the middle 36% × 24% of the canvas (inside the panel at both poses — checked on the saved frames)
  const clip = { x: c.x + c.width * 0.32, y: c.y + c.height * 0.38, width: c.width * 0.36, height: c.height * 0.24 };
  const buf = await p.screenshot({ clip });
  if (save) writeFileSync(`${OUT}/${save}.png`, buf);
  const { data, info } = await sharp(buf).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  let gx = 0, gy = 0;
  const w = info.width;
  for (let y = 1; y < info.height - 1; y++)
    for (let x = 1; x < w - 1; x++) {
      const i = (y * w + x) * 3;
      const dx = lum(data, i + 3) - lum(data, i - 3), dy = lum(data, i + 3 * w) - lum(data, i - 3 * w);
      gx += dx * dx; gy += dy * dy;
    }
  return { gx, gy };
};
const log = [];
const say = (s) => { console.log(s); log.push(s); };
say("PREDICTION (written before the run): rotation 0 → fx < fy (horizontal stretch); π/2 → fy < fx (vertical stretch).");
const tot = { iso: { gx: 0, gy: 0 }, iso2: { gx: 0, gy: 0 }, r0: { gx: 0, gy: 0 }, r90: { gx: 0, gy: 0 } };
for (const cam of ["28,16", "-24,22"]) {
  for (let yaw = 0; yaw < 360; yaw += 30) {
    const base = `cam=${cam}&yaw=${yaw}`;
    const first = yaw === 0;
    const iso = await frame(`${base}&aniso=0`, first && `mirror-${cam}-iso`);
    const iso2 = await frame(`${base}&aniso=0`);
    const r0 = await frame(`${base}&aniso=0.8&anisorot=0`, first && `mirror-${cam}-rot0`);
    const r90 = await frame(`${base}&aniso=0.8&anisorot=${Math.PI / 2}`, first && `mirror-${cam}-rot90`);
    for (const [k, v] of Object.entries({ iso, iso2, r0, r90 })) { tot[k].gx += v.gx; tot[k].gy += v.gy; }
    say(`  cam ${cam} yaw ${String(yaw).padStart(3)}: rot0 fx ${(r0.gx / iso.gx).toFixed(3)} fy ${(r0.gy / iso.gy).toFixed(3)} · π/2 fx ${(r90.gx / iso.gx).toFixed(3)} fy ${(r90.gy / iso.gy).toFixed(3)}`);
  }
}
const f = (k) => [tot[k].gx / tot.iso.gx, tot[k].gy / tot.iso.gy];
const [rx, ry] = f("iso2");
say(`${rx === 1 && ry === 1 ? "✅" : "⛔"} RED RUN no brushing vs no brushing: fx ${rx.toFixed(6)} fy ${ry.toFixed(6)} (must be exactly 1)`);
const [ax, ay] = f("r0"), [bx, by] = f("r90");
say(`SUMMED over 24 frames: rotation 0 → fx ${ax.toFixed(3)} fy ${ay.toFixed(3)} → stretches ${ax < ay ? "HORIZONTALLY" : "VERTICALLY"}`);
say(`                       rotation π/2 → fx ${bx.toFixed(3)} fy ${by.toFixed(3)} → stretches ${bx < by ? "HORIZONTALLY" : "VERTICALLY"}`);
say(`${ax < ay && by < bx ? "✅ the written prediction HOLDS (π/2 gives vertical streaks)" : ay < ax && bx < by ? "⛔ the written prediction FAILS: rotation 0 gives vertical streaks" : "⚠ INCONCLUSIVE: both rotations stretch the same way"}`);
say(`console errors: ${errors.length}`);
say("⚠ NOT WATCHED: the letters (the probe stands in for their faces); the edge material; how it looks (Carl's eye).");
writeFileSync(`${OUT}/orientation-report.txt`, log.join("\n"));
await b.close();
