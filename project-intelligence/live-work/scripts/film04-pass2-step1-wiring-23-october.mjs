/** FILM 04 PASS 2, STEP 1 — DO THE DIALS REACH THE SHADER? (23 October 2026; plan v2.1, the Architect's step 1)
 *  The line in `?mode=material` (one brass over face and sides alike), 1920 × 1080, DPR 1, dev server, badge hidden.
 *    A. THE YAW SWEEP (step 0(b)'s paper prediction tested): the canvas's mean luminance above the page ground at 15° steps,
 *       front and at the FIXED oblique pose (`?cam=28,16`).
 *    B. THE WIRING, at the oblique pose and the sweep's brightest oblique yaw:
 *       ⛔ the RED RUN first — rotation 0 vs 0 must differ by NOTHING (the comparison is not measuring noise);
 *       then rotation 0 vs π/2, anisotropy 0 vs 0.8, yaw Y vs Y+180 must differ; pure-black pixels (a broken tangent frame
 *       renders NaN → black; the page ground is #0a0a0a, so (0,0,0) is never ground) must be 0; and the highlight's
 *       ORIENTATION: R = Σ Gx² / Σ Gy² over the canvas (a blur along x lowers Gx, along y lowers Gy).
 *       ⛔ THE PREDICTION, WRITTEN BEFORE THE RUN: three stretches the highlight along the tangent (+x here), so rotation 0
 *       smears ALONG X (R lower) and π/2 ALONG Y (R higher) — vertical streaks, across the horizontal grain, need π/2.
 *    C. THE TONE MAPPING, PRINTED per mode, and the ROUND TRIP: material → clay in the same page must match step 0's
 *       baseline frame exactly (the restore works).
 *    D. THE BUILD MARK, WITH ITS POSITIVE CONTROL: `showcase:build` seen FIRING on a depth change, then NOT on a material change.
 *    node …/film04-pass2-step1-wiring-23-october.mjs <base> <outDir> <baselineDir>
 *  ⚠ NOT WATCHED: whether it LOOKS right (Carl's eye); Carl's GPU; any view but these two poses. */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const [BASE = "http://localhost:3000", OUT = ".", BASELINE = "."] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const TONE = { 0: "NoToneMapping", 1: "Linear", 2: "Reinhard", 3: "Cineon", 4: "ACESFilmic", 5: "Custom", 6: "AgX", 7: "Neutral" };
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 })).newPage();
const errors = [];
p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
const load = async (q) => {
  await p.goto(`${BASE}/proto/showcase?layout=line&${q}`, { waitUntil: "networkidle" });
  await p.waitForFunction(() => window.__showcaseBench?.ready, null, { timeout: 60000 });
  await p.addStyleTag({ content: "nextjs-portal{display:none!important}" });
  await p.waitForTimeout(700);
};
const shot = async (name) => {
  const box = await p.locator("canvas").first().boundingBox();
  const buf = await p.screenshot({ clip: box });
  if (name) writeFileSync(`${OUT}/${name}.png`, buf);
  const { data, info } = await sharp(buf).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
};
const lumOf = (d, i) => 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
const meanAbove = ({ data }) => { let s = 0; for (let i = 0; i < data.length; i += 3) s += Math.max(0, lumOf(data, i) - 10); return s / (data.length / 3); };
const diff = (a, c) => { let n = 0, sum = 0; for (let i = 0; i < a.data.length; i++) { const d = Math.abs(a.data[i] - c.data[i]); if (d) n++; sum += d; } return { n, mean: sum / a.data.length }; };
const black = ({ data }) => { let n = 0; for (let i = 0; i < data.length; i += 3) if (data[i] === 0 && data[i + 1] === 0 && data[i + 2] === 0) n++; return n; };
const orient = ({ data, w, h }) => {
  let gx = 0, gy = 0;
  for (let y = 1; y < h - 1; y++)
    for (let x = 1; x < w - 1; x++) {
      const i = (y * w + x) * 3;
      const dx = lumOf(data, i + 3) - lumOf(data, i - 3), dy = lumOf(data, i + 3 * w) - lumOf(data, i - 3 * w);
      gx += dx * dx; gy += dy * dy;
    }
  return gx / gy;
};
const log = [];
const say = (s) => { console.log(s); log.push(s); };

// A. the sweep
say("A. THE YAW SWEEP — mean luminance above the ground (0–245), room 0.1, strength 1, rotation π/2, anisotropy 0.8");
const sweep = {};
for (const [view, extra] of [["front", "view=front"], ["oblique", "view=oblique&cam=28,16"]]) {
  const row = [];
  for (let yaw = 0; yaw < 360; yaw += 15) {
    await load(`mode=material&${extra}&yaw=${yaw}`);
    row.push([yaw, meanAbove(await shot())]);
  }
  sweep[view] = row;
  const best = [...row].sort((x, y) => y[1] - x[1]).slice(0, 3);
  say(`  ${view}: ${row.map(([y, m]) => `${y}:${m.toFixed(2)}`).join(" ")}`);
  say(`  ${view} brightest: ${best.map(([y, m]) => `${y}° (${m.toFixed(2)})`).join(", ")}   [paper predicted ${view === "front" ? "15° / 240°" : "345° / 210°"}]`);
}
const Y = [...sweep.oblique].sort((x, y) => y[1] - x[1])[0][0];

// B. the wiring
say(`B. THE WIRING — oblique (cam 28,16), yaw ${Y}° (the sweep's brightest)`);
say("  PREDICTION (written before the run): R = ΣGx²/ΣGy² is LOWER at rotation 0 (smear along x) than at π/2 (smear along y).");
const q = (o) => `mode=material&view=oblique&cam=28,16&yaw=${o.yaw ?? Y}&aniso=${o.aniso ?? 0.8}&anisorot=${o.rot ?? 0}`;
await load(q({ rot: 0 })); const r0 = await shot("wire-rot0");
await load(q({ rot: 0 })); const r0b = await shot("wire-rot0-again");
await load(q({ rot: Math.PI / 2 })); const r90 = await shot("wire-rot90");
await load(q({ aniso: 0 })); const a0 = await shot("wire-aniso0");
await load(q({ rot: 0, yaw: Y + 180 })); const y180 = await shot("wire-yaw180");
const red = diff(r0, r0b);
say(`  ${red.n === 0 ? "✅" : "⛔"} RED RUN rotation 0 vs 0: ${red.n} channel values differ (must be 0)`);
for (const [name, a, c] of [["rotation 0 vs π/2", r0, r90], ["anisotropy 0.8 vs 0 (rotation 0)", r0, a0], [`yaw ${Y}° vs ${Y + 180}°`, r0, y180]]) {
  const d = diff(a, c);
  say(`  ${d.n > 0 ? "✅" : "⛔"} ${name}: ${d.n} channel values differ, mean |Δ| ${d.mean.toFixed(3)}`);
}
for (const [name, f] of [["rot 0", r0], ["rot π/2", r90], ["aniso 0", a0], ["yaw +180", y180]]) say(`  ${black(f) === 0 ? "✅" : "⛔"} pure-black pixels, ${name}: ${black(f)}`);
const R0 = orient(r0), R90 = orient(r90), RA = orient(a0);
say(`  ORIENTATION R = ΣGx²/ΣGy²: rotation 0 ${R0.toFixed(4)} · π/2 ${R90.toFixed(4)} · anisotropy 0 ${RA.toFixed(4)}`);
say(`  ${R0 < R90 ? "✅ the prediction HOLDS" : "⛔ the prediction FAILS"}: rotation 0 ${R0 < R90 ? "lower" : "not lower"} than π/2`);

// C. tone mapping + the round trip
say("C. THE TONE MAPPING, PRINTED, AND THE ROUND TRIP");
for (const view of ["front", "oblique"]) {
  await load(`mode=material&view=${view}`);
  const tmM = await p.evaluate(() => window.__showcaseToneMapping);
  await p.locator("select").nth(1).selectOption("clay");
  await p.waitForTimeout(900);
  const tmC = await p.evaluate(() => window.__showcaseToneMapping);
  const box = await p.locator("canvas").first().boundingBox();
  const now = await sharp(await p.screenshot({ clip: box })).removeAlpha().raw().toBuffer();
  const base = await sharp(`${BASELINE}/line_${view}_clay.png`).removeAlpha().raw().toBuffer();
  let n = 0; for (let i = 0; i < base.length; i++) if (base[i] !== now[i]) n++;
  say(`  ${view}: material → ${TONE[tmM]} · clay after the switch → ${TONE[tmC]} · ${tmM === 7 && tmC === 4 ? "✅" : "⛔"}`);
  say(`  ${n === 0 ? "✅" : "⛔"} round trip material → clay vs step 0's line_${view}_clay.png: ${n} channel values differ`);
}

// D. the build mark, with its positive control
say("D. THE BUILD MARK — seen firing on a geometry change, then not on a material change");
await load("mode=material&view=front");
const count = () => p.evaluate(() => performance.getEntriesByName("showcase:build").length);
const slide = (label, v) =>
  p.evaluate(([label, v]) => {
    const el = [...document.querySelectorAll('input[type="range"]')].find((e) => e.closest("label")?.textContent?.startsWith(label));
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    set.call(el, String(v));
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }, [label, v]);
const c0 = await count();
await slide("depth", 0.25); await p.waitForTimeout(600);
const c1 = await count();
await slide("tone", 0.4); await p.waitForTimeout(600);
await slide("face roughness", 0.5); await p.waitForTimeout(600);
const c2 = await count();
say(`  ${c1 > c0 ? "✅" : "⛔"} POSITIVE CONTROL: depth change → build marks ${c0} → ${c1}`);
say(`  ${c2 === c1 ? "✅" : "⛔"} material changes (tone, face roughness) → build marks ${c1} → ${c2}`);

say(`console errors: ${errors.length}${errors.length ? " — " + errors.slice(0, 3).join(" | ") : ""}`);
say("⚠ NOT WATCHED: whether it looks right (Carl's eye); Carl's GPU; views other than front and the oblique 28,16.");
writeFileSync(`${OUT}/step1-report.txt`, log.join("\n"));
await b.close();
