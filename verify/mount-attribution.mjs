// ⚠⚠ COMPONENT ATTRIBUTION OF THE NextStepMeshButton MOUNT — 18 August 2026.
//
//   node verify/mount-attribution.mjs [runs] [--sync] [--nobtn]
//
// The `?nobtnmesh=1` experiment removed FIVE things at once and proved the BUNDLE
// causes the Q5 reveal freeze. It could not say WHICH component does. This reads
// per-component marks emitted under `?mounttrace=1`.
//
// ─────────────────────────────────────────────────────────────────────────────
// ⚠ WHAT IT CAN AND CANNOT SEPARATE — declared, per spec §7
// ─────────────────────────────────────────────────────────────────────────────
//
//  1-context-creation          GPU   ⚠ LOWER BOUND. The stamp is taken in a layout
//                                    effect that runs AFTER R3F's own mount effect,
//                                    so part of context creation is already spent.
//  2a-studio-build             MAIN  scene, shell, shader panels
//  2b-pmrem-fromScene          GPU   the bake — cubemap + roughness convolution
//  4-geometry-total            MAIN  52,800-vertex height field (nx 220 * ny 240)
//  4b-geometry-buffers         MAIN  subset of the above: typed-array assembly only
//  3+4+5-firstdraw-composite   GPU   ⛔ NOT SEPARABLE. three.js links the program
//                                    lazily on FIRST RENDER, so the material link,
//                                    the geometry's GPU upload and the draw all fall
//                                    in one call. Splitting it would mean inventing
//                                    a division the instrument cannot see.
//  0-floor-noop                --    THE INSTRUMENT'S OWN COST, measured not assumed.
//
// ⚠ `performance.now()` brackets time SUBMISSION for GPU work, not completion.
// `--sync` adds `gl.finish()` (via `?mountsync=1`) which times completion but
// SERIALISES THE PIPELINE — perturbing by design. The DIFFERENCE between the two
// runs is the queue depth. Neither alone is the truth.
//
// ⚠⚠ FALSIFICATION: with `--nobtn` the button is suppressed and this MUST report
// ZERO marks. If it reports a PMREM bake on the arm with no button, it is
// measuring something else (most likely the card host's env) and every figure is
// void.

import { chromium } from "playwright";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3100";
if (/:3000(\/|$)/.test(BASE)) {
  console.error(`\n⚠ REFUSING :3000 — production is the verdict.\n`);
  process.exit(1);
}

const args = process.argv.slice(2);
const RUNS = Number(args.find((a) => /^\d+$/.test(a)) ?? 5);
const SYNC = args.includes("--sync");
const NOBTN = args.includes("--nobtn");

const q = ["mounttrace=1"];
if (SYNC) q.push("mountsync=1");
if (NOBTN) q.push("nobtnmesh=1");
const URL_START = `${BASE}/start?${q.join("&")}`;

console.log(`\n⚠ MOUNT ATTRIBUTION — ${RUNS} runs, production, cold.`);
console.log(`   url:  ${URL_START}`);
console.log(`   mode: ${SYNC ? "SYNC (gl.finish — times COMPLETION, perturbing)" : "async (times SUBMISSION)"}`);
console.log(`   arm:  ${NOBTN ? "?nobtnmesh=1 — FALSIFICATION, expect ZERO marks" : "baseline (button present)"}\n`);

const byLabel = new Map();

for (let run = 1; run <= RUNS; run++) {
  const browser = await chromium.launch({
    headless: false,
    args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(URL_START, { waitUntil: "networkidle" });

  const renderer = await page.evaluate(() => {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    if (!gl) return "no webgl";
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    return ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "unknown";
  });
  if (/swiftshader|llvmpipe|software|no webgl/i.test(renderer)) {
    console.error(`⚠ ABORTING — "${renderer}" is a software rasteriser.`);
    process.exit(1);
  }
  if (run === 1) console.log(`renderer: ${renderer}\n`);

  // ⚠ Q5 IS REACHED BY THE BEGIN CLICK, not a corridor step. Its button mounts
  // during the reveal, which is the window this attribution is about.
  await page.waitForTimeout(9000);
  const begin = await page.$(".enquiry-begin-hit");
  if (!begin) {
    console.error(`⛔ run ${run}: no Begin hit target.`);
    process.exit(1);
  }
  await begin.click();
  await page.waitForTimeout(12000);

  const marks = await page.evaluate(() => (window.__mountMarks ?? []).map((m) => ({ ...m })));

  // ⚠ Q5's button is the FIRST mount after Begin. Marks accumulate across the
  // page's life, so take the earliest occurrence of each label — later ones would
  // belong to a different question's button.
  const seen = new Set();
  const first = [];
  for (const m of marks) {
    if (seen.has(m.label)) continue;
    seen.add(m.label);
    first.push(m);
  }
  for (const m of first) {
    if (!byLabel.has(m.label)) byLabel.set(m.label, []);
    byLabel.get(m.label).push(m.ms);
  }

  console.log(`  run ${String(run).padStart(2)}  marks: ${marks.length}  distinct: ${first.length}`);

  await context.close();
  await browser.close();
}

console.log(`\n  ── PER-COMPONENT DISTRIBUTION, ${RUNS} runs ──\n`);

if (byLabel.size === 0) {
  if (NOBTN) {
    console.log(`  ✅ ZERO MARKS on ?nobtnmesh=1 — FALSIFICATION PASSED.`);
    console.log(`     The tracer sees the button's mount and nothing else.\n`);
  } else {
    console.log(`  ⛔ NO MARKS ON THE BASELINE ARM. The tracer did not fire —`);
    console.log(`     the flag, the build or the mount path is wrong. Figures void.\n`);
    process.exit(1);
  }
  process.exit(0);
}

if (NOBTN) {
  console.log(`  ⛔⛔ FALSIFICATION FAILED — marks reported on the arm with NO BUTTON.`);
  console.log(`      The tracer is measuring something other than this mount.`);
  console.log(`      EVERY FIGURE FROM THE BASELINE ARM IS VOID.\n`);
}

const med = (a) => {
  const s = [...a].sort((x, y) => x - y);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

const order = [
  "0-floor-noop",
  "1-context-creation",
  "2a-studio-build",
  "2b-pmrem-fromScene",
  "4-geometry-total",
  "4b-geometry-buffers",
  "3+4+5-firstdraw-composite",
];
const side = {
  "0-floor-noop": "--",
  "1-context-creation": "GPU",
  "2a-studio-build": "MAIN",
  "2b-pmrem-fromScene": "GPU",
  "4-geometry-total": "MAIN",
  "4b-geometry-buffers": "MAIN",
  "3+4+5-firstdraw-composite": "GPU",
};

let sumMedian = 0;
for (const label of order) {
  const vals = byLabel.get(label);
  if (!vals) continue;
  const m = med(vals);
  // ⚠ 4b is a SUBSET of 4 — never added into the total, or the geometry is counted twice.
  if (label !== "0-floor-noop" && label !== "4b-geometry-buffers") sumMedian += m;
  const lo = Math.min(...vals).toFixed(1);
  const hi = Math.max(...vals).toFixed(1);
  console.log(
    `  ${label.padEnd(28)} ${String(side[label]).padEnd(5)} median ${m.toFixed(1).padStart(7)}ms   range ${lo}-${hi}ms`,
  );
}

for (const [label, vals] of byLabel) {
  if (order.includes(label)) continue;
  console.log(`  ${label.padEnd(28)} ${"?".padEnd(5)} median ${med(vals).toFixed(1).padStart(7)}ms  (UNDECLARED)`);
}

const floor = byLabel.get("0-floor-noop");
console.log(`\n  SUM OF COMPONENT MEDIANS: ${sumMedian.toFixed(1)}ms   (4b excluded — subset of 4)`);
console.log(`  BASELINE FREEZE MEDIAN TODAY: 140ms (range 80-160)`);
if (floor) {
  console.log(`\n  ⚠ INSTRUMENT FLOOR: ${med(floor).toFixed(3)}ms per bracket, 7 brackets`);
  console.log(`    → ~${(med(floor) * 7).toFixed(2)}ms total tracer cost. Compare to the SMALLEST`);
  console.log(`      component above: any component near this figure is NOT trustworthy.`);
}
console.log(`\n  ⚠ GPU brackets time ${SYNC ? "COMPLETION (pipeline serialised — perturbing)" : "SUBMISSION, not completion"}.`);
console.log(`  ⛔ NO ATTRIBUTION BEYOND THE LABELS. This says how long, not why.\n`);
