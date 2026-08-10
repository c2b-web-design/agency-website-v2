// The corridor's MOTION, sampled — so a restructure can be proved not to have
// changed it.
//
//   node verify/corridor-motion.mjs [label]
//
// ⚠⚠ CARL, 10 August 2026: *"the corridors movement is important, there is
// easing in there too."* He judges the motion by eye and that is the real gate.
// This exists so that between two builds there is also a NUMBER — an eye
// remembers a feeling, not a curve, and the two builds are minutes apart.
//
// ── WHAT IT SAMPLES ──────────────────────────────────────────────────────
//
// The phrase band animates `bottom` and `font-size` over 900ms on
// `cubic-bezier(0.37, 0, 0.63, 1)` (globals.css, `.enquiry-phrase-anim`). This
// samples the ACTIVE phrase's rendered geometry every frame across a corridor
// move and writes the trajectory to JSON.
//
// ⚠ THE SHAPE MATTERS, NOT JUST THE ENDPOINTS. A linear tween and an eased one
// arrive at the same place; the whole character of the corridor is in HOW they
// get there. So the samples are normalised 0..1 and compared as a curve, and
// the harness reports the largest deviation at any point along it.
//
// ⚠ AND THE ANSWER GRID IS SAMPLED SEPARATELY FROM THE PHRASE. That is the
// point of the exercise: the canvas currently lives INSIDE the phrase and
// inherits its motion for free. A shared-host restructure lifts it out, and the
// question this answers is whether the grid still travels exactly as the text
// does — or whether it has quietly become a second, hand-driven animation.
//
// ── HOW TO USE IT ────────────────────────────────────────────────────────
//
//   node verify/corridor-motion.mjs before     # on the current build
//   ...restructure...
//   node verify/corridor-motion.mjs after
//   node verify/corridor-motion.mjs --compare before after
//
// ⚠ PRODUCTION BUILD. Dev-server frame pacing is noise, and this measures
// pacing. The harness refuses :3000 for the reason recorded in
// transition-cost.mjs.

import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3100";
mkdirSync("verify/out", { recursive: true });

// ── compare mode ─────────────────────────────────────────────────────────
if (process.argv[2] === "--compare") {
  const a = process.argv[3];
  const b = process.argv[4];
  const pa = `verify/out/motion-${a}.json`;
  const pb = `verify/out/motion-${b}.json`;
  if (!existsSync(pa) || !existsSync(pb)) {
    console.error(`need both ${pa} and ${pb}`);
    process.exit(1);
  }
  const A = JSON.parse(readFileSync(pa, "utf8"));
  const B = JSON.parse(readFileSync(pb, "utf8"));

  const cmp = (key) => {
    const na = normalise(A.samples.map((s) => s[key]));
    const nb = normalise(B.samples.map((s) => s[key]));
    const n = Math.min(na.length, nb.length);
    let worst = 0, at = 0;
    for (let i = 0; i < n; i++) {
      // Compare at the same fraction through the move, not the same frame index.
      const fa = na[Math.floor((i / n) * na.length)];
      const fb = nb[Math.floor((i / n) * nb.length)];
      const d = Math.abs(fa - fb);
      if (d > worst) { worst = d; at = i / n; }
    }
    return { worst, at };
  };

  console.log(`\n  comparing "${a}" -> "${b}"\n`);
  console.log(`  channel        worst deviation   at`);
  for (const key of ["phraseY", "gridY", "phraseSize"]) {
    const { worst, at } = cmp(key);
    const flag = worst > 0.05 ? "  ⚠ CHANGED" : "";
    console.log(`  ${key.padEnd(12)}   ${(worst * 100).toFixed(1).padStart(5)}%           ${(at * 100).toFixed(0)}%${flag}`);
  }
  console.log(`\n  ⚠ >5% ANYWHERE ALONG THE CURVE IS A REAL CHANGE IN THE MOTION, even if`);
  console.log(`    the endpoints match. Carl judges by eye; this says where to look.\n`);
  process.exit(0);
}

// ── capture mode ─────────────────────────────────────────────────────────
const LABEL = process.argv[2] ?? "run";

if (/:3000(\/|$)/.test(BASE)) {
  console.error(`\n⚠ REFUSING :3000 — this measures PACING, and dev-server pacing is noise.`);
  console.error(`  npm run build && npx next start -p 3100\n`);
  process.exit(1);
}

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(`${BASE}/start`, { waitUntil: "networkidle" });

const renderer = await page.evaluate(() => {
  const c = document.createElement("canvas");
  const gl = c.getContext("webgl2") || c.getContext("webgl");
  if (!gl) return "no webgl";
  const ext = gl.getExtension("WEBGL_debug_renderer_info");
  return ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "unknown";
});
if (/swiftshader|llvmpipe|software|no webgl/i.test(renderer)) {
  console.error(`⚠ ABORTING — "${renderer}" is a software rasteriser.`);
  await browser.close();
  process.exit(1);
}
console.log(`renderer: ${renderer}`);

await page.waitForTimeout(9000);
const begin = await page.$(".enquiry-begin-hit");
if (!begin) { console.error("Begin hit target not found"); await browser.close(); process.exit(1); }
await begin.click();
await page.waitForTimeout(12000);

const samples = await page.evaluate(async () => {
  const out = [];
  let running = true;

  const sample = () => {
    // The ACTIVE phrase — depth 0. It is the one that moves away.
    const phrase = document.querySelector(".enquiry-pdepth-0") || document.querySelector(".enquiry-phrase");
    const q = phrase?.querySelector(".enquiry-phrase-question");
    const grid = phrase?.querySelector(".enquiry-answer-grid");
    const pr = phrase?.getBoundingClientRect();
    const gr = grid?.getBoundingClientRect();
    out.push({
      t: performance.now(),
      phraseY: pr ? pr.top : null,
      gridY: gr ? gr.top : null,
      phraseSize: q ? parseFloat(getComputedStyle(q).fontSize) : null,
    });
    if (running) requestAnimationFrame(sample);
  };
  requestAnimationFrame(sample);

  // Force the button interactive and fire the move. See transition-cost.mjs:
  // there is no reachable corridor move until selection is wired.
  const btn = document.querySelector(".enquiry-nextstep-btn");
  const wrap = btn?.closest("div");
  if (wrap instanceof HTMLElement) {
    wrap.style.opacity = "1";
    wrap.style.pointerEvents = "auto";
  }
  await new Promise((r) => setTimeout(r, 300));
  if (btn instanceof HTMLElement) btn.click();

  await new Promise((r) => setTimeout(r, 2400));
  running = false;
  return out;
});

await browser.close();

const clean = samples.filter((s) => s.phraseY !== null);
const path = `verify/out/motion-${LABEL}.json`;
writeFileSync(path, JSON.stringify({ label: LABEL, samples: clean }, null, 2));

console.log(`\n  ${clean.length} frames sampled across the move`);
const ys = clean.map((s) => s.phraseY);
const gs = clean.map((s) => s.gridY).filter((v) => v !== null);
console.log(`  phrase top   ${Math.min(...ys).toFixed(0)} .. ${Math.max(...ys).toFixed(0)}px`);
if (gs.length) {
  console.log(`  grid top     ${Math.min(...gs).toFixed(0)} .. ${Math.max(...gs).toFixed(0)}px   (${gs.length} frames)`);
} else {
  console.log(`  grid top     — not present in the active phrase during this move`);
}
console.log(`\n  saved ${path}`);
console.log(`  compare with:  node verify/corridor-motion.mjs --compare <a> <b>\n`);

function normalise(vals) {
  const v = vals.filter((x) => x !== null);
  if (!v.length) return [];
  const lo = Math.min(...v), hi = Math.max(...v);
  const span = hi - lo || 1;
  return v.map((x) => (x - lo) / span);
}
