// What does the button's continuous frameloop actually COST?
//
//   node verify/nextstep-cost.mjs
//
// ⚠ CARL AUTHORISED THE CONTINUOUS LOOP ON CONDITION IT BE MEASURED, 10 August
// 2026 — *"accept it, measure the cost"*. This is that measurement.
//
// ⚠⚠ IT MATTERS BECAUSE Q5's FRAME COST IS A LIVE WOUND. The reveal's worst
// frame gap is 167ms after this session's fix, against D-046's approved 82ms,
// and the structural cause (two canvas mount sites either side of a ternary) is
// untouched. **A second continuously-rendering canvas is exactly the kind of
// thing that regresses it.**
//
// It compares the bench with the traveller ON (`?travel=1`, the default) against
// OFF (`?travel=0`, a static canvas that draws once), on the same page, same
// GPU, same run — so the difference is the loop and nothing else.
//
// ⚠ INTERLEAVED, NOT SEQUENTIAL. `verify/run-bisect.sh` learned this the
// expensive way: an A/B that runs all of A then all of B measures RUN ORDER as
// much as it measures the change — thermal state, driver caches and background
// load all drift across a run. Alternating cancels it.
//
// ══════════════════════════════════════════════════════════════════════════
// ⚠⚠ ITS NULL RESULT IS WEAK EVIDENCE AND MUST NOT BE CITED AS "FREE"
// ══════════════════════════════════════════════════════════════════════════
//
// On 10 August 2026 this reported **+0.00ms** — 16.7ms median on both arms.
// The Architect flagged the reading the same day, and the objection is correct:
//
// **This samples rAF gaps FROM INSIDE THE PAGE, and the page's rAF is scheduled
// by the same vsync as the render loop.** So both arms report ~16.7ms whether
// the GPU is working hard or idling. The instrument cannot distinguish "the
// sweep is cheap" from "the sweep is invisible to this measurement" — a null
// result is equally consistent with both.
//
// ⚠ SAME ADJACENCY CLASS AS THE SEVEN RECORDED ON 9-10 AUGUST: the instrument
// answered a question next to the one asked. Here the question asked was "does
// this cost GPU time" and the question answered was "is the compositor still
// hitting vsync".
//
// ⚠ WHAT WOULD ACTUALLY ANSWER IT: GPU frame timings from the trace
// (`Profiler`/`chrome://tracing` categories, or `EXT_disjoint_timer_query`), or
// a proxy that saturates — many canvases, or a deliberately heavy scene — so
// that a real cost has somewhere to show. **Until then, treat the sweep's cost
// as UNMEASURED rather than as zero.**
//
// ⚠ AND THE MITIGATION NO LONGER DEPENDS ON THE ANSWER. `TravellingReflection`
// is now gated on `active`, so in the corridor the loop does not run while the
// button is invisible. That removes the risk this harness was built to size.
//
// ⚠ HEADED, --enable-gpu, ABORTS ON A SOFTWARE RASTERISER.

import { chromium } from "@playwright/test";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
const ROUNDS = Number(process.argv[2] ?? 3);
const SAMPLE_MS = 4000;

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1100, height: 800 } });

// ⚠ THE RENDERER GUARD RUNS ON THE FIRST NAVIGATION, inside `samplePage`.
let rendererChecked = false;

const on = [];
const off = [];
for (let i = 0; i < ROUNDS; i++) {
  // ⚠ ALTERNATE, and flip which arm leads each round, so neither is
  // systematically favoured by warm-up.
  if (i % 2 === 0) {
    on.push(await samplePage("?travel=1"));
    off.push(await samplePage("?travel=0"));
  } else {
    off.push(await samplePage("?travel=0"));
    on.push(await samplePage("?travel=1"));
  }
}

async function samplePage(q) {
  await page.goto(`${BASE}/proto/nextstep${q}`, { waitUntil: "networkidle" });
  if (!rendererChecked) {
    rendererChecked = true;
    const r = await page.evaluate(() => {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2") || c.getContext("webgl");
      if (!gl) return "no webgl";
      const ext = gl.getExtension("WEBGL_debug_renderer_info");
      return ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "unknown";
    });
    if (/swiftshader|llvmpipe|software|no webgl/i.test(r)) {
      console.error(`⚠ ABORTING — renderer is "${r}": a software rasteriser.`);
      await browser.close();
      process.exit(1);
    }
    console.log(`renderer: ${r}`);
  }
  await page.waitForTimeout(1500);
  return page.evaluate(
    (ms) =>
      new Promise((resolve) => {
        const gaps = [];
        let last = performance.now();
        const t0 = last;
        const tick = () => {
          const now = performance.now();
          gaps.push(now - last);
          last = now;
          if (now - t0 < ms) requestAnimationFrame(tick);
          else {
            const s = gaps.slice().sort((a, b) => a - b);
            resolve({
              frames: s.length,
              median: s[Math.floor(s.length / 2)],
              p95: s[Math.floor(s.length * 0.95)],
              worst: s[s.length - 1],
            });
          }
        };
        requestAnimationFrame(tick);
      }),
    SAMPLE_MS,
  );
}

await browser.close();

const mean = (a, k) => a.reduce((s, x) => s + x[k], 0) / a.length;

console.log(`\n  ${ROUNDS} interleaved rounds, ${SAMPLE_MS}ms each\n`);
console.log(`                    frames   median    p95    worst`);
console.log(
  `  traveller ON      ${mean(on, "frames").toFixed(0).padStart(6)}   ${mean(on, "median").toFixed(1).padStart(6)}  ${mean(on, "p95").toFixed(1).padStart(5)}  ${mean(on, "worst").toFixed(1).padStart(6)}`,
);
console.log(
  `  traveller OFF     ${mean(off, "frames").toFixed(0).padStart(6)}   ${mean(off, "median").toFixed(1).padStart(6)}  ${mean(off, "p95").toFixed(1).padStart(5)}  ${mean(off, "worst").toFixed(1).padStart(6)}`,
);

const dMedian = mean(on, "median") - mean(off, "median");
console.log(`\n  median frame gap delta: ${dMedian >= 0 ? "+" : ""}${dMedian.toFixed(2)}ms\n`);

if (mean(on, "median") > 20) {
  console.log(`  ⚠⚠ THE LOOP IS NOT HOLDING 60fps (median ${mean(on, "median").toFixed(1)}ms > 16.7ms).`);
} else if (dMedian > 3) {
  console.log(`  ⚠ THE LOOP COSTS ${dMedian.toFixed(1)}ms PER FRAME. Weigh that against Q5's 167ms.`);
} else {
  console.log(`  ✅ the loop holds frame rate — ${dMedian >= 0 ? "+" : ""}${dMedian.toFixed(2)}ms median against a static canvas.`);
}

console.log(`  ⚠ THIS IS THE BENCH, NOT THE CORRIDOR. The real question is what it costs`);
console.log(`    ALONGSIDE the card canvas during the Q5 reveal — measure there before`);
console.log(`    wiring the button in.`);
