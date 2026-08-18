// ⚠⚠ DOES Q5'S REVEAL STALL? — the deferred poller, built on the VIDEO TRACK.
//
//   node verify/reveal-stall.mjs [runs]      (default 5)
//
// Films N runs of Q5's question reveal on ONE build in ONE session, then measures
// the freeze in each. Reports a DISTRIBUTION — per-run duration, median, spread —
// because nobody has ever run this more than once and the record states twice that
// a single run is not a measurement (`q5-reveal-stall-reobserved-16-august.md`).
//
// ─────────────────────────────────────────────────────────────────────────────
// ⚠⚠ WHY THE VIDEO TRACK, AND NOT A COMPUTED-STYLE POLLER. Read before changing.
// ─────────────────────────────────────────────────────────────────────────────
//
// The reveal is `clip-path: inset()` (`globals.css:132-141`, applied at :1315).
// ⚠ Chromium does NOT composite `clip-path` — it is main-thread animated. So a
// `getComputedStyle().clipPath` poller reads the animation's INTENDED value.
//
// ⚠⚠ AND THE INTENT IS NOT WHERE THE DEFECT IS. A CDP trace names the freeze as
// `CommandBuffer::Flush` / `GpuChannel::ExecuteDeferredRequest` — ~164ms in four
// blocks, **with the renderer idle** (`enquiry-opening.tsx`, the shared-host
// comment). Stage 1 measured the main thread at 2.3ms busy of 210ms while the GPU
// process saturated. **The style advances smoothly while the GPU fails to present.**
//
//   channel                        thread          sees a GPU presentation freeze?
//   ─────────────────────────────  ──────────────  ───────────────────────────────
//   getComputedStyle().clipPath    MAIN (intent)   ❌ no
//   Animation.currentTime          MAIN (clock)    ❌ no
//   video track (recordVideo)      OUT-OF-PROCESS  ✅ yes
//
// A computed-style poller here would repeat `extras-hold-position.mjs` exactly:
// assert the channel that stays healthy, say nothing about the one that fails.
// The 15 August record puts it plainly — every purpose-built main-thread probe
// that week reported green, and the video track "is the only instrument in
// `verify/` that was capable of seeing this."
//
// ⚠ NO SCREENSHOT-PER-SAMPLE. ~84ms/capture on the animation's own thread is the
// recorded fault where a sampler invents a defect and hides a real one. The video
// track is captured out-of-process and is therefore UNPERTURBING.
//
// ─────────────────────────────────────────────────────────────────────────────
// ⚠ WHAT THIS DOES NOT WATCH — declared in the OUTPUT too, per spec §7
// ─────────────────────────────────────────────────────────────────────────────
//
//  - Desktop 1440x900 only. Mobile is unexercised (the reveal is 1300ms at both
//    widths, so this is a coverage gap, not a timing one).
//  - Q5 only — the reveal after Begin. Not Q4-Q1, not the corridor step.
//  - ⚠ 40ms QUANTISATION. 25fps is a FLOOR on resolution: a freeze shorter than
//    40ms is invisible here, and every duration is bounded, not exact.
//  - NO ATTRIBUTION. This says a freeze happened, where, and for how long. It
//    says NOTHING about why. Diagnosis is out of scope.
//
// ⚠ TIMING TRAP — Q5's reveal begins ~7.8s AFTER the Begin click, not ~2.5s. A
// short window films the opening and concludes the stall is gone. That has
// already happened once (`q5-reveal-stall-reobserved-16-august.md`, method note).

import { chromium } from "playwright";
import { mkdirSync, rmSync, readdirSync, renameSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3100";
if (/:3000(\/|$)/.test(BASE)) {
  console.error(`\n⚠ REFUSING :3000 — dev and production disagree. Production is the verdict.\n`);
  process.exit(1);
}

const RUNS = Number(process.argv[2] ?? 5);
const OUT = "verify/out/reveal-stall";

// ⚠ NOT verify/out/card-exit-film — that holds the two UNWATCHED films from the
// exit work and `corridor-filmstrip.mjs` rmSync's directories it records into.
// This clears only its OWN directory.
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

// ⚠ The Begin click is at ~9s (the opening's own span); Q5's reveal begins ~7.8s
// after that click. 16000ms of hold covers the reveal with room either side, so
// the freeze cannot sit against a capture boundary.
const PRE_BEGIN_MS = 9000;
const POST_BEGIN_MS = 16000;

console.log(`\n⚠ Q5 REVEAL STALL — ${RUNS} runs, one build, one session.`);
console.log(`   channel: VIDEO TRACK (out-of-process). NOT computed style — the`);
console.log(`   freeze is GPU-side with the renderer idle, and intent stays clean.`);
console.log(`   base: ${BASE}   viewport: 1440x900   fps: 25 (40ms quantisation)\n`);

let buildId = null;

for (let run = 1; run <= RUNS; run++) {
  const browser = await chromium.launch({
    headless: false,
    args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: OUT, size: { width: 1440, height: 900 } },
  });
  const page = await context.newPage();
  await page.goto(`${BASE}/start`, { waitUntil: "networkidle" });

  // ⚠ A software rasteriser cannot reproduce a GPU-scheduler freeze. Abort rather
  // than record a clean run that means nothing.
  const renderer = await page.evaluate(() => {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    if (!gl) return "no webgl";
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    return ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "unknown";
  });
  if (/swiftshader|llvmpipe|software|no webgl/i.test(renderer)) {
    console.error(`⚠ ABORTING — "${renderer}" is a software rasteriser.`);
    await context.close();
    await browser.close();
    process.exit(1);
  }

  // Record WHICH BUILD was filmed, and assert it does not change between runs —
  // a distribution across two builds is not a distribution.
  // ⚠ Next 16 does NOT emit `#__NEXT_DATA__` on App Router pages, and the build
  // id is not in a `_buildManifest` src either. It rides in the RSC flight
  // payload as `"b":"<id>"`. Read from the served HTML, which is the build
  // actually being measured — not from `.next/BUILD_ID` on disk, which can
  // differ from what the running server holds.
  const thisBuild = await page.evaluate(() => {
    const m = /\\"b\\":\\"([A-Za-z0-9_-]{6,})\\"/.exec(document.documentElement.innerHTML);
    return m ? m[1] : null;
  });
  if (run === 1) buildId = thisBuild;
  else if (thisBuild !== buildId) {
    console.error(`\n⛔ BUILD CHANGED MID-SESSION: ${buildId} → ${thisBuild}`);
    console.error(`   Runs across two builds are not one distribution. Aborting.\n`);
    await context.close(); await browser.close(); process.exit(1);
  }

  if (run === 1) {
    console.log(`renderer: ${renderer}`);
    console.log(`build:    ${thisBuild ?? "unknown"}\n`);

    // ⚠ RESOLUTION REPORT — spec §7: report what was resolved, every run. A
    // harness that finds no animation must FAIL LOUDLY, never pass vacuously.
    const resolved = await page.evaluate(() => {
      const el = document.querySelector(".enquiry-q-text-reveal");
      return { present: !!el, text: el ? (el.textContent || "").slice(0, 40) : null };
    });
    console.log(`  pre-Begin: .enquiry-q-text-reveal present=${resolved.present} (expected false — Q5 has not arrived)`);
  }

  await page.waitForTimeout(PRE_BEGIN_MS);
  const begin = await page.$(".enquiry-begin-hit");
  if (!begin) {
    console.error(`⛔ run ${run}: no Begin hit target — nothing was filmed.`);
    await context.close(); await browser.close(); process.exit(1);
  }
  await begin.click();

  await page.waitForTimeout(POST_BEGIN_MS);

  // ⚠ CONFIRM THE REVEAL ACTUALLY RAN. If it did not, this run filmed nothing and
  // a "no freeze found" verdict would be vacuous.
  const after = await page.evaluate(() => {
    const el = document.querySelector(".enquiry-phrase-question");
    const w = window;
    return {
      text: el ? (el.textContent || "").trim().slice(0, 48) : null,
      revealStart: typeof w.__revealStart === "number" ? w.__revealStart : null,
    };
  });

  await context.close();
  await browser.close();

  // Name the video by run so the analyser can pair them deterministically.
  const files = readdirSync(OUT).filter((f) => f.endsWith(".webm") && !/^run-/.test(f));
  if (files.length !== 1) {
    console.error(`⛔ run ${run}: expected 1 new .webm, found ${files.length}. Aborting.`);
    process.exit(1);
  }
  renameSync(join(OUT, files[0]), join(OUT, `run-${String(run).padStart(2, "0")}.webm`));

  const ok = after.text && after.revealStart !== null;
  console.log(
    `  run ${String(run).padStart(2)}  reveal ran: ${ok ? "yes" : "⚠ NO"}` +
    `  text: ${after.text ? `"${after.text}"` : "(none)"}`
  );
  if (!ok) {
    console.error(`\n⛔ run ${run} DID NOT REVEAL. A verdict from this film would be vacuous.\n`);
    process.exit(1);
  }
}

console.log(`\n✅ ${RUNS} films → ${OUT}/run-NN.webm`);
console.log(`   Now measure them:  node verify/reveal-stall-measure.mjs\n`);
