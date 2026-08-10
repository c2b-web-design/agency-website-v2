// Diagnostic: is the Q5 stall the WARM-UP TEARDOWN colliding with the real
// canvas's setup?
//
//   node verify/overlap-collision.mjs
//
// ══════════════════════════════════════════════════════════════════════════
// THE HYPOTHESIS, AND WHAT IS ALREADY RULED OUT
// ══════════════════════════════════════════════════════════════════════════
//
// Carl, 10 August 2026, cold start: *"it stalls on the word 'here'. This is
// past the halfway point of the reveal."*
//
// Measured by `verify/reveal-cost.mjs` on the real GPU, reveal-relative:
//
//     +294ms   the REAL card canvas creates its WebGL context
//     +310ms   95ms long task
//     +584ms   319ms FRAME GAP            <- "here"
//
//     CPU self-time across the reveal, largest NAMED entries:
//       305ms  (program)                  <- native/driver, no JS on the stack
//        33ms  WebGLRenderer.forceContextLoss
//        28ms  getParameters
//        18ms  getProgramInfoLog
//
// ⚠ EVERY JS FUNCTION IS SINGLE OR LOW-DOUBLE DIGITS. The cost is native
// driver work, and the largest named call is a context being DESTROYED.
//
// ── RULED OUT BY MEASUREMENT, NOT BY ARGUMENT ────────────────────────────
//
//   `checkShaderErrors` / getProgramInfoLog — `verify/infolog-source.mjs`
//      attributed per context: the 541ms call belongs to the WARM-UP context at
//      -7550ms (dead time). Only 22ms lands inside the reveal. The two
//      `onCreated` fixes are working.
//   a shader RELINK at card 1's rung — 20 programs created after the reveal
//      starts, 11 near the rung, costing almost nothing. Count is not cost.
//   the hover work — `q5-stall-10-august.md`: reverting both components to
//      7b056c2 still measured 626ms.
//
// ── THE HYPOTHESIS ───────────────────────────────────────────────────────
//
// `enquiry-opening.tsx:640` holds the warm-up node alive for
// `WARMUP_OVERLAP_MS = 900` past the stage change, so the real canvas can do
// its setup while the warm context still exists. The figure was DERIVED from
// *"161ms mount->compiled, plus the ~580ms initialisation behind it = ~740ms"*.
//
// **The real context is not created until +294ms into the reveal**, which is
// later than that budget assumed. If setup is still running at the 900ms mark,
// the teardown lands ON it — `forceContextLoss` is synchronous, and destroying
// one context while another initialises serialises in the driver.
//
// ⚠ AND THE CODE PREDICTED THIS EXACT SITUATION (`enquiry-opening.tsx:635`):
// *"IF THIS VALUE EVER NEEDS TUNING, THE OVERLAP IS THE WRONG FIX AND THE
// SHARED-HOST RESTRUCTURE IS THE RIGHT ONE. A number that has to grow to keep
// working is hiding a lifecycle problem rather than solving it."*
//
// ⚠ SO THIS SCRIPT DOES NOT PROPOSE RAISING 900. It tests whether the
// COLLISION is the mechanism, which is the question that decides whether the
// restructure is justified. Raising the constant would be exactly the fix the
// file forbids.
//
// ── THE ARMS ─────────────────────────────────────────────────────────────
//
//   A  normal                 warm-up present, torn down at ~900ms
//   B  ?nowarmup=1            no warm-up canvas at all — no teardown to collide
//
// ⚠ ARM B IS NOT A CANDIDATE FIX AND MUST NOT BE READ AS ONE.
// `verify/warmup-value.mjs` measured the warm-up as worth ~758ms via ANGLE's
// on-disk shader cache (161ms with, 919ms without). Removing it makes the
// stall WORSE overall. Arm B exists only to isolate the teardown.
//
// ⚠ EXPECTED IF THE HYPOTHESIS HOLDS: arm B loses the ~300ms frame gap at the
// "here" position but pays more total setup. If arm B stalls in the SAME PLACE
// the teardown is innocent and this hypothesis is dead — which is a result.
//
// ⚠ COLD PER ARM. The dev server is NOT restarted between arms (that is the
// caller's job before the run), but a FRESH BROWSER PROFILE per arm resets
// ANGLE's on-disk cache, which is the thing that matters here.
//
// ⚠ HEADED, --enable-gpu, ABORTS ON A SOFTWARE RASTERISER.

import { chromium } from "@playwright/test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
const REVEAL_MS = 1300;
const RUNS_PER_ARM = Number(process.argv[2] ?? 2);

const ARMS = [
  { name: "A  normal (warm-up torn down at ~900ms)", url: `${BASE}/start` },
  { name: "B  ?nowarmup=1 (no warm-up, no teardown)", url: `${BASE}/start?nowarmup=1` },
];

async function measure(url) {
  const profile = mkdtempSync(join(tmpdir(), "overlap-collision-"));
  const context = await chromium.launchPersistentContext(profile, {
    headless: false,
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
  });
  const page = await context.newPage();

  await page.addInitScript(() => {
    const W = window;
    W.__oc = { frames: [], ctx: [], lost: 0, revealStart: null };

    const origGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
      const ctx = origGetContext.call(this, type, ...rest);
      if (String(type).includes("webgl") && ctx) W.__oc.ctx.push(performance.now());
      return ctx;
    };

    // Count context losses. `forceContextLoss` fires webglcontextlost on the
    // canvas, so observing the event needs no three.js patching.
    const origAdd = HTMLCanvasElement.prototype.addEventListener;
    void origAdd;
    document.addEventListener(
      "webglcontextlost",
      () => {
        W.__oc.lost++;
      },
      true,
    );

    const tick = () => {
      W.__oc.frames.push(performance.now());
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  const res = await page.goto(url, { waitUntil: "domcontentloaded" });
  if (!res || !res.ok()) {
    await context.close();
    rmSync(profile, { recursive: true, force: true });
    throw new Error(`${res?.status() ?? "no response"} — is the dev server running?`);
  }

  const renderer = await page.evaluate(() => {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    if (!gl) return "no webgl";
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    return ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "unknown";
  });
  if (/swiftshader|llvmpipe|software|no webgl/i.test(renderer)) {
    await context.close();
    rmSync(profile, { recursive: true, force: true });
    throw new Error(`software rasteriser: ${renderer}`);
  }

  await page.getByRole("button", { name: /begin/i }).click();
  await page.waitForFunction(
    () => {
      const el = document.querySelector(".enquiry-q-text-reveal");
      const anim = el
        ?.getAnimations?.()
        .find((a) => a.animationName === "enquiry-mask-reveal-horizontal");
      if (!anim || typeof anim.startTime !== "number") return false;
      window.__oc.revealStart = anim.startTime;
      return true;
    },
    { timeout: 30000 },
  );

  await page.waitForTimeout(REVEAL_MS + 900);

  const out = await page.evaluate(
    ({ revealMs }) => {
      const W = window;
      const base = W.__oc.revealStart;
      const rel = (t) => Math.round(t - base);
      const frames = W.__oc.frames.map(rel).sort((a, b) => a - b);

      let worst = { gap: 0, at: null };
      for (let i = 1; i < frames.length; i++) {
        const gap = frames[i] - frames[i - 1];
        // Only the reveal window — the warm-up's own cost sits ~7s earlier and
        // is not what Carl sees.
        if (frames[i - 1] >= -100 && frames[i - 1] <= revealMs + 400 && gap > worst.gap) {
          worst = { gap, at: frames[i - 1] };
        }
      }
      return {
        worst,
        realCtxAt: W.__oc.ctx.map(rel).filter((t) => t > -1000),
        lost: W.__oc.lost,
      };
    },
    { revealMs: REVEAL_MS },
  );

  await context.close();
  rmSync(profile, { recursive: true, force: true });
  return { ...out, renderer };
}

const results = {};
for (const arm of ARMS) {
  results[arm.name] = [];
  for (let i = 0; i < RUNS_PER_ARM; i++) {
    const r = await measure(arm.url);
    results[arm.name].push(r);
    if (i === 0 && arm === ARMS[0]) console.log(`renderer: ${r.renderer}\n`);
  }
}

console.log(`── worst frame gap INSIDE the reveal, per arm ───────────────────`);
for (const arm of ARMS) {
  const rs = results[arm.name];
  const gaps = rs.map((r) => r.worst.gap);
  const ats = rs.map((r) => r.worst.at);
  console.log(`\n  ${arm.name}`);
  console.log(`     worst gaps   ${gaps.join("ms, ")}ms`);
  console.log(`     at           ${ats.join("ms, ")}ms  (card 1's rung is 650ms)`);
  console.log(`     ctx created in window   ${rs.map((r) => `[${r.realCtxAt.join(",")}]`).join(" ")}`);
  console.log(`     context-lost events     ${rs.map((r) => r.lost).join(", ")}`);
}

const a = results[ARMS[0].name].map((r) => r.worst.gap);
const b = results[ARMS[1].name].map((r) => r.worst.gap);
const medA = a.sort((x, y) => x - y)[Math.floor(a.length / 2)];
const medB = b.sort((x, y) => x - y)[Math.floor(b.length / 2)];

console.log(`\n══ verdict ══════════════════════════════════════════════════════`);
console.log(`  median worst gap in reveal:  A ${medA}ms   B ${medB}ms`);
console.log();
if (medB < medA * 0.6) {
  console.log(`  ⚠ REMOVING THE WARM-UP REMOVES MOST OF THE IN-REVEAL STALL.`);
  console.log(`    That is consistent with the TEARDOWN colliding with the real`);
  console.log(`    canvas's setup — the collision, not the compilation, is the cost.`);
  console.log();
  console.log(`  ⚠ THIS DOES NOT MAKE ?nowarmup=1 THE FIX. warmup-value.mjs measured`);
  console.log(`    the warm-up as worth ~758ms of ANGLE on-disk cache. The indicated`);
  console.log(`    direction is the SHARED-HOST RESTRUCTURE that enquiry-opening.tsx:635`);
  console.log(`    already names — one canvas that is never destroyed — NOT deletion,`);
  console.log(`    and NOT raising WARMUP_OVERLAP_MS.`);
} else if (medB > medA * 1.4) {
  console.log(`  the warm-up is HELPING inside the reveal too — removing it is worse.`);
  console.log(`  The teardown-collision hypothesis is NOT supported.`);
} else {
  console.log(`  no clear difference. The teardown is NOT the dominant cost and this`);
  console.log(`  hypothesis is dead. Believe this over the reasoning that motivated it.`);
}
console.log();
console.log(`  ⚠ A PROFILE, NOT AN APPROVAL. Nothing here has been seen by Carl.`);
