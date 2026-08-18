// THE CARD EXIT — does it exist, and WHEN does the alpha drop happen?
//
//   node verify/card-exit.mjs
//
// ⚠⚠ FALSIFICATION FIRST. The exit DOES NOT EXIST on the current build. A correct
// instrument MUST report the hard cut here; if it comes back clean, IT IS WRONG.
//
// ⚠⚠ AND IT MUST MEASURE THE CUT, NOT ASSUME IT — Carl, 18 August 2026.
// The plan predicts the drop at ~1150ms (the epoch bump). CARL'S EYE PUT IT AT
// ~500-800ms AFTER THE CLICK. If the measured drop is not ~1150, the model of the
// boundary is wrong and everything derived from CORRIDOR_STEP_MS inherits that
// error. Reporting the TIME is the whole point of this run.
//
// ── ⚠⚠ WHY THIS READS PIXELS AND NOT THE SCENE ──────────────────────────────
//
// Two established routes were tried first and BOTH FAIL on this measurement.
// Recorded here so the next reader does not spend the same hour.
//
// 1. THE SCENE IS NOT REACHABLE FROM THE DOM ON A PRODUCTION BUILD. Measured
//    18 August: `canvas.__r3f` is UNDEFINED on all three canvases on the page,
//    inside the host and out. `satin-anisotropy-live.mjs` reaches `c.__r3f.store`
//    and that works in dev; here a scene-walking instrument reports "⛔ BROKEN"
//    on a perfectly healthy page.
//
// 2. ⚠ `__cardTrace` IS SILENT ACROSS THE ENTIRE BOUNDARY. It publishes from
//    INSIDE the tick loop, and the tick loop self-terminates at `t >= 1`
//    (canvas :2370). Measured across a Q5->Q4 step: 65 samples after the click,
//    the EARLIEST at +1816ms, every one of them Q4's INCOMING entrance.
//    **There is no sample anywhere in the window the cut happens in.**
//
//    ⚠ THIS IS ITSELF THE POINT. The channel the plan named as "the right
//    precedent" cannot see the defect, because the defect happens in the gap
//    where no loop is running. An exit instrument built on `__cardTrace` alone
//    would have reported a clean boundary forever.
//
// So this samples the RENDERED PIXELS of the host canvas — the cards' actual
// output, which is what Carl sees. `drawImage` into a small offscreen 2D canvas
// once per frame, mean luminance over the card band. ⚠ NOT a screenshot harness:
// no CDP round-trip, no ~84ms/capture, no main-thread stall. The cost is one
// GPU->2D blit per frame, inside the page.

import { chromium } from "playwright";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3100";
if (/:3000(\/|$)/.test(BASE)) {
  console.error(`\n⚠ REFUSING :3000 — this measures PACING. Production is the verdict.\n`);
  process.exit(1);
}

const EXIT_GAP_MS = 119;
const BOUNDARY_MS = 1150;

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(`${BASE}/start?beattrace=1&phasetrace=1`, { waitUntil: "networkidle" });

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

// Let the whole Q5 entrance land before stepping.
await page.waitForTimeout(13000);

const result = await page.evaluate(async () => {
  const host = document.querySelector('[data-testid="answer-card-host"]');
  const canvas = host?.querySelector("canvas");
  if (!canvas) return { error: "no host canvas" };

  // Per-card sample columns, from the SAME measured boxes the scene places cards
  // from — read off the hover targets so the columns cannot drift from the cards.
  const hostRect = canvas.getBoundingClientRect();
  const targets = [...document.querySelectorAll('[data-testid^="answer-card-hover-"]')];
  if (targets.length === 0) return { error: "no hover targets to locate cards" };
  const cols = targets.map((t) => {
    const r = t.getBoundingClientRect();
    return {
      x0: Math.max(0, Math.round(((r.left - hostRect.left) / hostRect.width) * canvas.width)),
      x1: Math.min(canvas.width, Math.round(((r.right - hostRect.left) / hostRect.width) * canvas.width)),
      y0: Math.max(0, Math.round(((r.top - hostRect.top) / hostRect.height) * canvas.height)),
      y1: Math.min(canvas.height, Math.round(((r.bottom - hostRect.top) / hostRect.height) * canvas.height)),
    };
  });

  // Downsample target — small, so the blit is cheap and the read is one call.
  const W = 160, H = 40;
  const off = document.createElement("canvas");
  off.width = W; off.height = H;
  const ctx = off.getContext("2d", { willReadFrequently: true });

  const samples = [];
  let running = true;

  const sample = () => {
    const row = [];
    for (const c of cols) {
      const w = c.x1 - c.x0, h = c.y1 - c.y0;
      if (w <= 0 || h <= 0) { row.push(null); continue; }
      ctx.clearRect(0, 0, W, H);
      // Blit just this card's band, scaled down.
      ctx.drawImage(canvas, c.x0, c.y0, w, h, 0, 0, W, H);
      const d = ctx.getImageData(0, 0, W, H).data;
      let sum = 0;
      // Mean luminance weighted by alpha — a faded card is dark AND transparent.
      for (let i = 0; i < d.length; i += 4) {
        const a = d[i + 3] / 255;
        sum += ((d[i] + d[i + 1] + d[i + 2]) / 3) * a;
      }
      row.push(sum / (d.length / 4));
    }
    samples.push({ t: performance.now(), row });
    if (running) requestAnimationFrame(sample);
  };
  requestAnimationFrame(sample);

  const btn = document.querySelector(".enquiry-nextstep-btn");
  const wrap = btn?.closest("div");
  if (wrap instanceof HTMLElement) {
    wrap.style.opacity = "1";
    wrap.style.pointerEvents = "auto";
  }
  await new Promise((r) => setTimeout(r, 400));
  const clickT = performance.now();
  if (btn instanceof HTMLElement) btn.click();

  await new Promise((r) => setTimeout(r, 2600));
  running = false;

  const phase = (window.__phaseTrace ?? []).map((p) => ({
    phase: p.phase, q: p.q, dt: Math.round(p.t - clickT),
  }));
  return { clickT, count: cols.length, samples, phase };
});

await browser.close();

if (result.error) {
  console.error(`\n⛔ INSTRUMENT BROKEN — ${result.error}`);
  console.error(`   It cannot see the cards, so it cannot report the cut either way.\n`);
  process.exit(1);
}

const { clickT, count, samples, phase } = result;
console.log(`\ncard columns: ${count}   frames sampled: ${samples.length}`);
console.log(`phase edges : ${phase.map((p) => `${p.phase}(Q${p.q})@${p.dt}ms`).join("  ")}`);

// Baseline: the mean of each column over the 200ms before the click.
const pre = samples.filter((s) => s.t < clickT && s.t >= clickT - 200);
if (pre.length === 0) {
  console.error(`\n⛔ NO PRE-CLICK BASELINE — cannot say what "lit" looked like.\n`);
  process.exit(1);
}
const base = [];
for (let i = 0; i < count; i++) {
  const vals = pre.map((s) => s.row[i]).filter((v) => v !== null);
  base.push(vals.reduce((a, b) => a + b, 0) / (vals.length || 1));
}

console.log(`\n── WHEN DOES EACH CARD GO DARK? (ms after click) ───────────────`);
console.log(`  threshold: 50% of each card's own pre-click luminance`);
const drops = [];
for (let i = 0; i < count; i++) {
  const thresh = base[i] * 0.5;
  let dropAt = null;
  for (const s of samples) {
    if (s.t < clickT) continue;
    const v = s.row[i];
    if (v !== null && v <= thresh) { dropAt = s.t - clickT; break; }
  }
  drops.push(dropAt);
  console.log(
    `  card ${i}  baseline ${base[i].toFixed(2).padStart(7)}   ` +
    `dark at: ${dropAt === null ? "never" : dropAt.toFixed(1) + "ms"}`
  );
}

const seen = drops.filter((d) => d !== null);
if (seen.length === 0) {
  console.log(`\n⛔ NO DARKENING FOUND AT ALL.`);
  console.log(`   On a build with no exit the cards MUST go dark at the boundary.`);
  console.log(`   This is an INSTRUMENT FAULT, not a clean result. Fix it before trusting it.\n`);
  process.exit(1);
}

const first = Math.min(...seen);
const last = Math.max(...seen);
const spread = last - first;

console.log(`\n── THE MEASURED CUT ────────────────────────────────────────────`);
console.log(`  first card dark at : ${first.toFixed(1)}ms after click`);
console.log(`  last  card dark at : ${last.toFixed(1)}ms after click`);
console.log(`  spread (stagger)   : ${spread.toFixed(1)}ms   [a real exit needs ${EXIT_GAP_MS * 4}ms across five]`);

console.log(`\n── AGAINST THE PLAN'S PREDICTION ───────────────────────────────`);
console.log(`  predicted : ~${BOUNDARY_MS}ms (the epoch bump)`);
console.log(`  measured  : ~${first.toFixed(0)}ms`);
const delta = first - BOUNDARY_MS;
console.log(`  delta     : ${delta >= 0 ? "+" : ""}${delta.toFixed(1)}ms`);
if (Math.abs(delta) > 120) {
  console.log(`\n  ⚠⚠ THE MODEL OF THE BOUNDARY IS WRONG.`);
  console.log(`     The drop is not where CORRIDOR_STEP_MS says it is. Everything derived`);
  console.log(`     from it — the 249ms headroom, the 901ms fit, the label-swap invariant —`);
  console.log(`     inherits this error. STOP AND REPORT before building the exit.`);
} else {
  console.log(`\n  ✅ The cut is where the plan says it is. CORRIDOR_STEP_MS is a sound origin.`);
}

console.log(`\n── FALSIFICATION VERDICT (current build, no exit expected) ─────`);
if (spread < EXIT_GAP_MS) {
  console.log(`  ✅ HARD CUT CONFIRMED — ${spread.toFixed(1)}ms spread, no stagger.`);
  console.log(`     The instrument can see the defect. A green from it after the exit`);
  console.log(`     lands will therefore mean something.`);
} else {
  console.log(`  ⛔ ${spread.toFixed(1)}ms spread — that is a STAGGER, on a build with no exit.`);
  console.log(`     The instrument is measuring something other than the cut. FIX IT.`);
}

// The shape of the fall, so a one-frame cut is distinguishable from a fade.
console.log(`\n── LUMINANCE AROUND THE CUT (card 0, normalised) ───────────────`);
const around = samples.filter((s) => s.t - clickT >= first - 120 && s.t - clickT <= first + 200);
console.log(
  "  " +
  around
    .slice(0, 22)
    .map((s) => `${Math.round(s.t - clickT)}:${(s.row[0] / (base[0] || 1)).toFixed(2)}`)
    .join("  ")
);
console.log("");
