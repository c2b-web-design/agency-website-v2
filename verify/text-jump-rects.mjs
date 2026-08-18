// The depth-0 -> depth-1 TEXT JUMP, measured as raw rects with a HORIZONTAL channel.
//
//   node verify/text-jump-rects.mjs
//
// ⚠ Rewritten 18 August 2026. The 17 August original was a throwaway, written for
// one question and deleted afterwards (`text-jump-17-august.md`). NO harness in
// this repo has a horizontal channel: corridor-motion.mjs is vertical-only and
// normalises 0..1, which removes a displaced ORIGIN by construction.
//
// Samples per frame across the depth flip and reports per-element dx/dy on the
// single frame the depth class changes, unnormalised, against the 17 August
// baseline. Production only — this measures pacing.

import { chromium } from "playwright";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3100";
if (/:3000(\/|$)/.test(BASE)) {
  console.error(`\n⚠ REFUSING :3000 — production is the verdict.\n`);
  process.exit(1);
}

const BASELINE = {
  cue:      { dx: -3.53, dy: +4.40 },
  question: { dx: -3.52, dy: +3.66 },
  travel:   { dx:  0.00, dy: +4.40 },
  qrow:     { dx:  0.00, dy: +4.40 },
};

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

const frames = await page.evaluate(async () => {
  const out = [];
  let running = true;

  const rectOf = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width };
  };

  const sample = () => {
    // Whichever depth copy is present — the active phrase is withheld during the
    // move, so depth-1 is the mover. Record which was taken on every frame.
    const d1 = document.querySelector(".enquiry-pdepth-1");
    const d0 = document.querySelector(".enquiry-pdepth-0");
    const phrase = d1 || d0;
    const depth = d1 ? 1 : d0 ? 0 : null;
    const cue = phrase?.querySelector(".enquiry-phrase-cue");
    const q = phrase?.querySelector(".enquiry-phrase-question");
    const travel = phrase?.querySelector(".enquiry-phrase-travel");
    const qrow = phrase?.querySelector(".enquiry-phrase-qrow");
    const cs = cue ? getComputedStyle(cue) : null;
    const qs = q ? getComputedStyle(q) : null;
    const rs = qrow ? getComputedStyle(qrow) : null;
    out.push({
      t: performance.now(),
      depth,
      cue: rectOf(cue),
      question: rectOf(q),
      travel: rectOf(travel),
      qrow: rectOf(qrow),
      gap: rs ? rs.gap ?? rs.columnGap : null,
      letterSpacing: cs ? cs.letterSpacing : null,
      fontSize: qs ? parseFloat(qs.fontSize) : null,
      fontWeight: qs ? qs.fontWeight : null,
    });
    if (running) requestAnimationFrame(sample);
  };
  requestAnimationFrame(sample);

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

// The flip frame: first frame whose depth is 1, with a depth-0 frame before it.
const flipIdx = frames.findIndex((f, i) => i > 0 && f.depth === 1 && frames[i - 1].depth === 0);
if (flipIdx < 0) {
  console.error(`\n⚠ NO DEPTH FLIP CAPTURED — the click did not produce a 0 -> 1 transition.`);
  console.error(`  depths seen: ${[...new Set(frames.map((f) => f.depth))].join(", ")}`);
  process.exit(1);
}

const before = frames[flipIdx - 1];
const after = frames[flipIdx];

console.log(`\nframes sampled: ${frames.length}   flip at index ${flipIdx}`);
console.log(`\n── ON THE FLIP FRAME ───────────────────────────────────────────`);
console.log(`  gap             ${before.gap} -> ${after.gap}`);
console.log(`  letter-spacing  ${before.letterSpacing} -> ${after.letterSpacing}`);
console.log(`  font-size       ${before.fontSize} -> ${after.fontSize}`);
console.log(`  font-weight     ${before.fontWeight} -> ${after.fontWeight}`);

console.log(`\n── PER-ELEMENT dx/dy vs 17 AUGUST BASELINE ─────────────────────`);
console.log(`  element     dx        dy        | baseline dx    dy`);
for (const key of ["cue", "question", "travel", "qrow"]) {
  const b = before[key], a = after[key];
  if (!b || !a) { console.log(`  ${key.padEnd(10)} MISSING`); continue; }
  const dx = a.x - b.x, dy = a.y - b.y;
  const base = BASELINE[key];
  console.log(
    `  ${key.padEnd(10)} ${dx >= 0 ? "+" : ""}${dx.toFixed(2).padEnd(8)} ${dy >= 0 ? "+" : ""}${dy.toFixed(2).padEnd(8)} | ` +
    `${base.dx >= 0 ? "+" : ""}${base.dx.toFixed(2).padEnd(9)} ${base.dy >= 0 ? "+" : ""}${base.dy.toFixed(2)}`
  );
}

// Does x continue from the displaced position, or return? Track the question's x
// across the frames after the flip.
const xs = frames.slice(flipIdx, flipIdx + 14).map((f) => f.question?.x).filter((v) => v != null);
console.log(`\n── QUESTION x AFTER THE FLIP (displaced origin check) ──────────`);
console.log(`  resting ${before.question?.x.toFixed(2)}  ->  ${xs.map((v) => v.toFixed(2)).join(", ")}`);

// Subpixel jitter on the cue as glyphs re-place under letter-spacing interpolation.
const cueW = frames.slice(flipIdx, flipIdx + 60).map((f) => f.cue?.w).filter((v) => v != null);
const deltas = cueW.slice(1).map((v, i) => v - cueW[i]);
const signFlips = deltas.slice(1).filter((d, i) => d !== 0 && deltas[i] !== 0 && Math.sign(d) !== Math.sign(deltas[i])).length;
console.log(`\n── CUE WIDTH ACROSS THE EASE (jitter check) ───────────────────`);
console.log(`  ${cueW.length} frames, ${cueW[0]?.toFixed(2)} -> ${cueW[cueW.length - 1]?.toFixed(2)}, direction changes: ${signFlips}`);

// Frame pacing across the 900ms — gap animating means layout every frame.
const flipT = after.t;
const during = frames.filter((f) => f.t >= flipT && f.t <= flipT + 900);
const ivs = during.slice(1).map((f, i) => f.t - during[i].t);
if (ivs.length) {
  const sorted = [...ivs].sort((a, b) => a - b);
  const med = sorted[Math.floor(sorted.length / 2)];
  const long = ivs.filter((v) => v > 20).length;
  console.log(`\n── FRAME PACING ACROSS THE 900ms EASE ─────────────────────────`);
  console.log(`  ${during.length} frames, median interval ${med.toFixed(2)}ms, max ${Math.max(...ivs).toFixed(2)}ms, >20ms: ${long}`);
}
console.log("");
