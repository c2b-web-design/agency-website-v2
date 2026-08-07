// Diagnostic: what armed the opening, and how long did the visitor wait for it?
//
//   node verify/opening-arm.mjs [runs]      (default 3 runs, run 1 cold)
//
// Step 4 holds the opening's animated classes until the warm-up canvas reports
// `compiled`, then applies them together. Two things must be checked, and the
// second is the one that goes wrong silently.
//
//   1. THE COLD DELAY. How long the page sits still before the heading starts.
//      This is the trade Carl accepted; it must be reported, not assumed.
//
//   2. ⚠ WHICH OF THE TWO EXITS ACTUALLY FIRED — the compile, or the backstop?
//      `OPENING_ARM_CEILING_MS` exists so the opening still runs if the compile
//      never reports. If the BACKSTOP is what starts the opening on a normal
//      run, the gate is broken and the page is merely hiding it.
//
// ⚠ THAT IS EXACTLY HOW THE PREVIOUS DESIGN FAILED. The warm-up's
// `requestIdleCallback` had a timeout intended as a backstop; because the
// opening never went idle, the timeout became THE ONLY PATH — and nothing
// reported that, so it looked like a working idle gate for two sessions.
//
// A backstop that fires routinely is not a backstop. This script names which
// one fired so the question is answered by the instrument rather than by
// reading the code and assuming.

import { chromium } from "@playwright/test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
const RUNS = Number(process.argv[2] ?? 3);

// Must match `OPENING_ARM_CEILING_MS` in `enquiry-opening.tsx`.
//
// ⚠ READ IT, DO NOT TRUST THIS COPY. A harness that shares a constant with the
// thing it checks cannot fail the way it needs to — `verify/q5-stutter.mjs`
// reported 0/3 CLEAN on a visible defect for exactly this reason. The check
// below is a RANGE, not equality, so a drifted constant shows up as an
// ambiguous verdict rather than a false pass.
const ARM_CEILING_MS = 4000;

const profile = mkdtempSync(join(tmpdir(), "opening-arm-"));
const results = [];

for (let run = 1; run <= RUNS; run++) {
  const context = await chromium.launchPersistentContext(profile, {
    headless: false,
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
  });

  try {
    const page = await context.newPage();

    await page.addInitScript(() => {
      window.__oa = { nav: performance.now(), headingAnimStart: null };
      // The heading's own animationstart is the visitor-visible moment the
      // opening begins. Captured at the document so it cannot be missed by a
      // listener attached after the fact.
      document.addEventListener(
        "animationstart",
        (e) => {
          if (
            window.__oa.headingAnimStart === null &&
            e.animationName === "enquiry-mask-reveal-horizontal"
          ) {
            window.__oa.headingAnimStart = performance.now();
          }
        },
        true,
      );
    });

    const res = await page.goto(`${BASE}/start`, { waitUntil: "domcontentloaded" });
    if (!res || !res.ok()) {
      console.error(`FAILED: ${res?.status() ?? "no response"} — is the dev server running?`);
      process.exit(1);
    }

    const renderer = await page.evaluate(() => {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2") || c.getContext("webgl");
      if (!gl) return "no webgl";
      const ext = gl.getExtension("WEBGL_debug_renderer_info");
      return ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "unknown";
    });
    if (/swiftshader|llvmpipe|software/i.test(renderer)) {
      console.error(`\n⚠ ABORTING — renderer is "${renderer}": a software rasteriser.`);
      process.exit(1);
    }

    // Watch past the ceiling so a backstop-armed run is still captured.
    await page.waitForTimeout(ARM_CEILING_MS + 3000);

    const d = await page.evaluate(() => {
      const nav = window.__oa.nav;
      const m = (n) => {
        const e = performance.getEntriesByName(n, "mark");
        return e.length ? Math.round(e[0].startTime - nav) : null;
      };
      return {
        warmupCreated: m("warmup-canvas-created"),
        warmupCompiled: m("warmup-canvas-compiled"),
        headingAt:
          window.__oa.headingAnimStart === null
            ? null
            : Math.round(window.__oa.headingAnimStart - nav),
      };
    });

    // Which exit fired?
    //
    // ⚠ THE HEADING DOES NOT START WHEN THE GATE OPENS — it starts
    // HEADING_DELAY_MS LATER, because `.enquiry-heading-line1-mask` carries
    // `600ms` of animation-delay. Comparing the heading directly against the
    // compile mark therefore never matched, and the first version of this script
    // reported "0/3 armed by COMPILE" on a gate that was in fact working
    // perfectly. The arming moment is `headingAt - HEADING_DELAY_MS`.
    //
    // ⚠ AND THAT IS THE SAME CLASS OF ERROR THIS FILE WARNS ABOUT ABOVE: the
    // instrument disagreed with the code and the instrument was wrong. Reading
    // the raw numbers — compile at +1199, heading at +1813, a clean 614ms apart
    // in every run — is what caught it.
    const HEADING_DELAY_MS = 600;
    const armedAt = d.headingAt === null ? null : d.headingAt - HEADING_DELAY_MS;

    // ⚠ THERE ARE THREE EXITS NOW, NOT TWO, AND THIS CLASSIFIER USED TO KNOW
    // ONLY TWO. On 7 August the opening gained a READY GATE — `document.fonts.
    // ready` plus a committed frame — because the compile path does not exist at
    // all below `PROTO_MIN_VIEWPORT_PX` (1280), where the card canvas renders
    // `null` and the 4000ms ceiling was arming every single load.
    //
    // ⚠ WITH ONLY TWO BRANCHES THIS SCRIPT REPORTED THE FIX AS A FAILURE. Arming
    // at +275ms against a compile at +1299ms scored as "not the compile,
    // therefore the backstop" — and printed the gate-is-broken warning at the
    // exact moment the gate started working. **A classifier that cannot name a
    // new-but-correct state will call it a regression.**
    //
    // The ready gate is the EXPECTED path now: it fires on fonts + one frame,
    // which lands in the low hundreds of ms, well before either other exit.
    let armedBy = "unknown";
    if (armedAt !== null) {
      if (Math.abs(armedAt - ARM_CEILING_MS) < 400) {
        // Checked FIRST: the ceiling is the only genuinely bad answer, and it
        // must not be shadowed by a coincidental match against a slow compile.
        armedBy = "BACKSTOP";
      } else if (armedAt < 900) {
        armedBy = "READY GATE";
      } else if (d.warmupCompiled !== null && Math.abs(armedAt - d.warmupCompiled) < 250) {
        armedBy = "COMPILE";
      } else {
        armedBy = "neither cleanly — investigate";
      }
    }

    results.push({ ...d, armedBy, armedAt });

    console.log(`\n─── RUN ${run} of ${RUNS}${run === 1 ? "  (cold GPU profile)" : "  (warm)"} ${"─".repeat(20)}`);
    console.log(`  Renderer                 ${renderer}`);
    console.log(`  warm-up canvas created   ${d.warmupCreated === null ? "NEVER ⚠" : `+${d.warmupCreated}ms`}`);
    console.log(`  warm-up canvas compiled  ${d.warmupCompiled === null ? "NEVER ⚠" : `+${d.warmupCompiled}ms`}`);
    console.log(`  opening ARMED at         ${armedAt === null ? "?" : `+${armedAt}ms`}   (heading start minus its own 600ms delay)`);
    console.log(`  heading reveal starts    ${d.headingAt === null ? "NEVER ⚠" : `+${d.headingAt}ms`}   ← the visitor's wait`);
    console.log(`  armed by                 ${d.armedBy}${d.armedBy === "BACKSTOP" ? "   ⚠ THE GATE IS NOT WORKING — see header" : ""}`);
  } finally {
    await context.close();
  }
}

try { rmSync(profile, { recursive: true, force: true }); } catch {}

const waits = results.map((r) => r.headingAt).filter((x) => x !== null);
const med = (xs) => (xs.length ? [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)] : null);
// ⚠ THE QUESTION IS "DID THE BACKSTOP FIRE", NOT "DID THE COMPILE WIN". Either
// real gate — the ready gate or the compile — is a pass; the ceiling is the only
// failure. Counting COMPILE alone made the ready gate look like a regression.
const byBackstop = results.filter((r) => r.armedBy === "BACKSTOP").length;
const byReady = results.filter((r) => r.armedBy === "READY GATE").length;
const byCompile = results.filter((r) => r.armedBy === "COMPILE").length;

console.log(`\n${"═".repeat(62)}`);
console.log(`VERDICT — ${RUNS} run(s)`);
console.log(`${"═".repeat(62)}`);
console.log(`  Cold wait before the opening starts:  ${results[0]?.headingAt ?? "?"}ms`);
console.log(`  Median wait across runs:              ${med(waits) ?? "?"}ms`);
console.log(`  Armed by the READY GATE: ${byReady}/${RUNS}   by the COMPILE: ${byCompile}/${RUNS}   ⚠ by the BACKSTOP: ${byBackstop}/${RUNS}`);

if (byBackstop > 0) {
  console.log(`
  ⚠ AT LEAST ONE RUN WAS ARMED BY THE BACKSTOP. That is the failure mode this
    script exists to catch: the gate is not doing the work and the ceiling is
    hiding it. Do not read the timings above as a working inversion.

    ⚠ RUN \`verify/arm-by-width.mjs\` NEXT. This script tests ONE viewport, and
    the 4.2s blank screen it missed for days was visible only below 1280px —
    where the card canvas does not render and the compile path does not exist.`);
} else {
  console.log(`
  → A real gate armed the opening on every run; the backstop was never needed.
    The wait above is the real cold-load cost, and whether it is acceptable is
    Carl's judgement, not this script's.

    ⚠ ONE VIEWPORT ONLY. \`verify/arm-by-width.mjs\` sweeps the widths, and it is
    the one that catches a canvas-dependent gate failing on narrow screens.`);
}
console.log(`
  ⚠ Verification is not approval.
`);
