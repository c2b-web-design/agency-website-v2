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

  /**
   * ⚠⚠ THE MOVING SEGMENT IS EXTRACTED FIRST, AND THE FIRST VERSION OF THIS
   * FUNCTION DID NOT DO THAT — IT REPORTED 92-100% DEVIATION BETWEEN TWO RUNS
   * OF IDENTICAL CODE.
   *
   * The sample window is ~158 frames but the move occupies only ~18→86 of them;
   * the rest is idle before and after. Normalising across the WHOLE window meant
   * a one-frame shift in when the click landed rescaled everything, so two
   * identical trajectories compared as completely different curves.
   *
   * ⚠ AND IT ALMOST SHIPPED AS A FINDING. The first before/after comparison
   * reported "phraseY 7.9% ⚠ CHANGED" and I was one step from reporting that as
   * a real effect of the wiring. **The same-build control is what caught it** —
   * run it, always, exactly as this project has required since
   * `approved-timings.mjs` reported four false "SHIFTED" rows on unchanged code.
   *
   * Endpoints were identical the whole time (393..448, starting and ending at
   * 444 in both runs). **The data was fine; the comparison was wrong.**
   */
  const segment = (vals) => {
    const v = vals.filter((x) => x !== null);
    if (v.length < 3) return [];
    const first = v[0], last = v[v.length - 1];
    // Trim the idle head and tail: the frames that have not started moving, and
    // the ones that have already arrived.
    let s = 0;
    while (s < v.length - 1 && Math.abs(v[s] - first) <= 0.5) s++;
    let e = v.length - 1;
    while (e > s && Math.abs(v[e] - last) <= 0.5) e--;
    // One frame of lead-in and lead-out, so the curve's ends are included.
    return v.slice(Math.max(0, s - 1), Math.min(v.length, e + 2));
  };

  const cmp = (key) => {
    const na = normalise(segment(A.samples.map((s) => s[key])));
    const nb = normalise(segment(B.samples.map((s) => s[key])));
    if (!na.length || !nb.length) return { worst: 0, at: 0, frames: [na.length, nb.length] };
    // Resample both onto a common 100-point axis: same FRACTION through the
    // move, which is what "the same moment in the animation" means when the two
    // runs have different frame counts.
    const N = 100;
    let worst = 0, at = 0;
    for (let i = 0; i < N; i++) {
      const f = i / (N - 1);
      const fa = na[Math.round(f * (na.length - 1))];
      const fb = nb[Math.round(f * (nb.length - 1))];
      const d = Math.abs(fa - fb);
      if (d > worst) { worst = d; at = f; }
    }
    return { worst, at, frames: [na.length, nb.length] };
  };

  console.log(`\n  comparing "${a}" -> "${b}"\n`);
  console.log(`  channel        worst deviation   at      moving frames`);
  for (const key of ["phraseY", "gridY", "phraseSize"]) {
    const { worst, at, frames } = cmp(key);
    /**
     * ⚠ 5% IS ABOVE THE MEASURED NOISE FLOOR, NOT A GUESS. Two runs of the SAME
     * build differ by 2.6–2.9%, purely from one-frame differences in where the
     * sampler catches the move. A threshold at or below that would flag every
     * run as changed; one far above it would miss a real shift.
     *
     * ⚠ RE-MEASURE THE FLOOR IF THE SAMPLING CHANGES. It is a property of this
     * harness, not of the corridor.
     */
    const flag = worst > 0.05 ? "  ⚠ CHANGED" : "";
    console.log(
      `  ${key.padEnd(12)}   ${(worst * 100).toFixed(1).padStart(5)}%           ${(at * 100).toFixed(0).padStart(3)}%    ${frames[0]} vs ${frames[1]}${flag}`,
    );
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
