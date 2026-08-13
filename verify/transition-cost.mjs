// What does a corridor move (Q5 -> Q4) cost, in frames?
//
//   node verify/transition-cost.mjs [runs]
//
// ⚠⚠ THIS IS THE CONTROL FOR STAGE B, AND IT MUST RUN BEFORE THE WIRING.
//
// Stage B makes an answer canvas mount and another unmount on EVERY question
// step. `renderPhrase` keys each question (`enquiry-opening.tsx:1219`) and the
// grid lives inside `enquiry-phrase-extras`, gated on `showExtras` (`:1216`) —
// so the context churn is structural, not a consequence of how the canvas is
// keyed.
//
// ⚠ AND WEBGL CONTEXT CREATION INSIDE AN ANIMATING TRANSITION IS THE Q5 STALL'S
// DOCUMENTED MECHANISM. The reveal measures 118-135ms *because that happens
// once*. Stage B points the same mechanism at the corridor move, which has
// never been measured. Establishing today's cost first is what makes the
// after-figure mean anything.
//
// ══════════════════════════════════════════════════════════════════════════
// ⚠⚠ READ THIS BEFORE CITING ANY NUMBER FROM THIS FILE
// ══════════════════════════════════════════════════════════════════════════
//
// **THE CORRIDOR CANNOT ADVANCE IN THIS BUILD.** `toggleOption` has no caller,
// so `selected` is always empty and `handleNextStep` is unreachable by a user.
// This harness forces the wrapper interactive and calls `.click()`, which
// bypasses `pointer-events: none`.
//
// ⚠ WHAT THAT DOES AND DOES NOT INVALIDATE — Architect's review, 10 August 2026,
// and the correction is finer than "the harness is wrong":
//
//   ✅ THE TRANSITION ITSELF IS REAL. `handleNextStep` runs the same
//      `setCorridorMoving` -> `setActiveQ` sequence however it is invoked, so
//      the corridor move being measured is the genuine one.
//
//   ⚠ BUT THE CONTROL IS MEASURED WITH `selected` EMPTY, AND THE REAL PATH
//      NEVER IS. `answersSnap` is `Array.from(selected).join(" • ")` — with no
//      selections it is `""`, so the memory chip renders EMPTY. The real move
//      renders chip text, which is real work inside the same window.
//
// **So the arms differ from the real path in the same direction, and the DELTA
// is the defensible figure — not either absolute number.** The 65ms control is
// a floor, not "what a corridor move costs today".
//
// ⚠ THE HONEST CONTROL NEEDS SELECTION WIRED FIRST. Sequence the Architect
// prescribed, and it fails safe:
//
//     commit 1a   B1+B3 wiring, `qNum === 5` RETAINED   -> real move, no canvas
//                 on the far side. THIS is the control.
//     measure
//     commit 1b   remove the gate                       -> same move, canvas
//                 both sides. This is the arm.
//
// The delta is then context creation and nothing else, on a path a user can
// actually take. If the delta is bad you stop at 1a with a corridor that walks.
//
// **Until 1a exists, treat the figures below as indicative of the MECHANISM's
// cost, not as a measurement of the product.**
//
// ⚠ PRODUCTION BUILD ONLY. Dev-server numbers are worthless here and this
// project has the scars: the first Stage A attempt read 231ms with the mesh
// against 269ms WITHOUT it — indistinguishable, because Turbopack and
// unminified three.js dominate the window. Run `npm run build && npx next start`
// and point VERIFY_BASE_URL at it.
//
// ⚠ HEADED, --enable-gpu, ABORTS ON A SOFTWARE RASTERISER.

import { chromium } from "@playwright/test";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3100";
const RUNS = Number(process.argv[2] ?? 3);
// ⚠ ADDED 11 AUGUST 2026 — a query string, so the label-texture dials can be
// tested ON THE MOVE and not only in the reveal. `?labeltex=` cut the reveal by
// 45-78ms; whether any of that reaches the transition is a separate measurement,
// because the reveal mounts a canvas ONCE and the move does it every step.
const QUERY = process.argv[3] ?? "";

if (/:3000(\/|$)/.test(BASE)) {
  console.error(`\n⚠⚠ REFUSING TO RUN AGAINST :3000 — that is the dev server.`);
  console.error(`   Frame cost measured on a dev build is noise. Build and serve:`);
  console.error(`     npm run build && npx next start -p 3100`);
  console.error(`   then re-run. Override with VERIFY_BASE_URL if you really mean it.\n`);
  process.exit(1);
}

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
});

const results = [];

for (let run = 0; run < RUNS; run++) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${BASE}/start${QUERY}`, { waitUntil: "networkidle" });

  if (run === 0) {
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
    console.log(`base:     ${BASE}\n`);
  }

  // The opening gates Begin for ~7.4s and `.enquiry-begin-parent` intercepts
  // pointer events until then. Click the hit target, not the visible pill.
  await page.waitForTimeout(9000);
  const begin = await page.$(".enquiry-begin-hit");
  if (!begin) {
    console.error("Begin hit target not found");
    await browser.close();
    process.exit(1);
  }
  await begin.click();
  // Let the Q5 reveal and the card entrance finish, so the transition is
  // measured on its own rather than on top of the opening.
  await page.waitForTimeout(12000);

  // Start sampling frame gaps, then fire the corridor move.
  const gaps = await page.evaluate(async () => {
    const samples = [];
    let last = performance.now();
    let running = true;
    const tick = () => {
      const now = performance.now();
      samples.push(now - last);
      last = now;
      if (running) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    // ⚠ THE BUTTON IS opacity:0 / pointer-events:none WITH NOTHING SELECTED.
    // Force the wrapper interactive and click — this drives the corridor's own
    // handleNextStep without pretending a selection was made.
    const btn = document.querySelector(".enquiry-nextstep-btn");
    const wrap = btn?.closest("div");
    if (wrap instanceof HTMLElement) {
      wrap.style.opacity = "1";
      wrap.style.pointerEvents = "auto";
    }
    await new Promise((r) => setTimeout(r, 300));
    const t0 = performance.now();
    if (btn instanceof HTMLElement) btn.click();

    // The Q5->Q4 choreography runs ~1200ms; sample past it.
    await new Promise((r) => setTimeout(r, 2600));
    running = false;

    // Only the gaps that fall inside the transition window.
    const startIdx = samples.findIndex((_, i) => {
      let acc = 0;
      for (let k = 0; k <= i; k++) acc += samples[k];
      return acc >= t0 - performance.timeOrigin;
    });
    void startIdx;
    return samples;
  });

  await page.close();

  const sorted = gaps.slice().sort((a, b) => b - a);
  results.push({
    worst: sorted[0] ?? 0,
    second: sorted[1] ?? 0,
    over50: gaps.filter((g) => g > 50).length,
    frames: gaps.length,
  });
  console.log(
    `  run ${run + 1}   worst ${sorted[0]?.toFixed(0).padStart(4)}ms   ` +
      `2nd ${sorted[1]?.toFixed(0).padStart(4)}ms   ` +
      `gaps>50ms ${String(results[results.length - 1].over50).padStart(2)}   ` +
      `frames ${gaps.length}`,
  );
}

await browser.close();

const worsts = results.map((r) => r.worst);
const mean = worsts.reduce((a, b) => a + b, 0) / worsts.length;
console.log(`\n  worst frame gap across the Q5->Q4 move:`);
console.log(`    ${worsts.map((w) => w.toFixed(0) + "ms").join("   ")}      mean ${mean.toFixed(0)}ms`);
console.log(`\n  ⚠ A PROFILE, NOT A VERDICT. It says what the main thread did during a`);
console.log(`    corridor move. Whether it READS as a stutter is Carl's eye, and the`);
console.log(`    ~50ms visible threshold recorded in current-sprint.md is the rough guide.`);
