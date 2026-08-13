/**
 * ⚠ DOES CARD 1 FIRE AT THE HALFWAY POINT OF THE Q5 REVEAL?
 *
 * Carl, 11 August 2026: *"The Q5 reveal should trigger Card 1 at halfway
 * through the reveal. Thats 650ms. This can be a ballpark figure and plus or
 * minus 30ms is acceptable."*
 *
 * So this harness has a PASS/FAIL, which most of `verify/` deliberately does
 * not: the spec is numeric and the tolerance is stated. 650 +/- 30ms, measured
 * against the reveal animation's own `startTime`.
 *
 * ⚠ WHY THE MARK AND NOT THE PIXELS. `q5-card-vs-reveal.mjs` samples luminance
 * and answers a DIFFERENT question -- when card 1 is first SEEN, which includes
 * the visibility gate and the alpha ramp after the rung fires. Both are worth
 * knowing and they are not the same number; `q5-card-latency.mjs`'s header
 * records a ~680ms spread between them. **This one measures the TRIGGER**,
 * which is what Carl's sentence is about.
 *
 * ⚠ AND THE MARK IS THE AUTHORITATIVE CLOCK. Four pixel-reading instruments
 * failed to answer "did the entrance run" before `?beattrace=1` existed
 * (`q5-card-latency.mjs`). `card-beat-650` is emitted by `useCardEntrance`
 * itself at the moment the rung is consumed.
 *
 * ⚠ RUNS AGAINST PRODUCTION BY DEFAULT, and that is not a preference. Dev-server
 * frame numbers on this page are worthless -- a mesh arm read 231ms against
 * 269ms without, indistinguishable. Both older q5 harnesses hardcode :3000.
 *
 *   npm run build && npx next start -p 3100
 *   VERIFY_BASE_URL=http://localhost:3100 node verify/q5-card1-halfway.mjs
 *   VERIFY_BASE_URL=http://localhost:3100 node verify/q5-card1-halfway.mjs 3   (3 runs)
 *
 * ⚠ ONE REVEAL PER PAGE LOAD. Each run is a fresh browser context, so repeat
 * runs are independent -- but see the note on run order at the foot of this
 * file: a single reading on this page has measured the order rather than the
 * change before now.
 */

import { chromium } from "playwright";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3100";
const RUNS = Number(process.argv[2] ?? 1);

const TARGET_MS = 650;
const TOLERANCE_MS = 30;

if (BASE.includes(":3000")) {
  console.error("\n⚠ REFUSING TO RUN AGAINST :3000.");
  console.error("  Dev-server timing on this page is not trustworthy. Build and");
  console.error("  serve production, then set VERIFY_BASE_URL=http://localhost:3100.\n");
  process.exit(1);
}

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"],
});

/** Abort on a software rasteriser -- every harness in this folder does. */
{
  const probe = await browser.newPage();
  await probe.goto("about:blank");
  const renderer = await probe.evaluate(() => {
    const gl = document.createElement("canvas").getContext("webgl2");
    if (!gl) return "NO WEBGL2";
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : "UNKNOWN";
  });
  console.log(`\nrenderer: ${renderer}`);
  if (/swiftshader|llvmpipe|software/i.test(String(renderer))) {
    console.error("⚠ SOFTWARE RASTERISER — numbers would be meaningless. Aborting.");
    await browser.close();
    process.exit(1);
  }
  await probe.close();
}

const results = [];

for (let run = 1; run <= RUNS; run++) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await page.goto(`${BASE}/start?beattrace=1`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /begin/i }).click();

  // Wait for the card 1 mark rather than a fixed sleep: the ladder is gated on
  // `compiled`, whose cost has moved repeatedly during this project.
  await page.waitForFunction(
    () => performance.getEntriesByName("card-beat-650").length > 0,
    null,
    { timeout: 20000 },
  ).catch(() => {});

  const reading = await page.evaluate(() => {
    const mark = performance.getEntriesByName("card-beat-650")[0];
    const el = document.querySelector(".enquiry-q-text-reveal");
    // ⚠ MATCHED BY NAME, NOT INDEX -- `getAnimations()[0]` is order-dependent,
    // and a transition on this element would hand back the wrong clock. The
    // component's own anchor does exactly this; the harness must not be laxer
    // than the code it is checking.
    const anim = el
      ?.getAnimations?.()
      .find((a) => a.animationName === "enquiry-mask-reveal-horizontal");
    return {
      markTime: mark ? mark.startTime : null,
      revealStart: anim && typeof anim.startTime === "number" ? anim.startTime : null,
      revealDuration: anim ? anim.effect.getTiming().duration : null,
      allBeats: performance
        .getEntriesByType("mark")
        .filter((m) => m.name.startsWith("card-beat-"))
        .map((m) => ({ name: m.name, t: Math.round(m.startTime) })),
    };
  });

  await context.close();

  if (reading.markTime === null || reading.revealStart === null) {
    console.log(`\nrun ${run}: UNMEASURABLE — ` +
      `${reading.markTime === null ? "no card-beat-650 mark" : "no reveal animation"}`);
    results.push(null);
    continue;
  }

  const intoReveal = reading.markTime - reading.revealStart;
  const pct = (intoReveal / reading.revealDuration) * 100;
  results.push(intoReveal);

  console.log(`\n── run ${run} ──`);
  console.log(`  reveal startTime   ${reading.revealStart.toFixed(0)}ms, duration ${reading.revealDuration}ms`);
  console.log(`  card-beat-650 at   ${reading.markTime.toFixed(0)}ms`);
  console.log(`  → card 1 fires     ${intoReveal.toFixed(0)}ms into the reveal (${pct.toFixed(1)}%)`);
  if (reading.allBeats.length > 1) {
    const ladder = reading.allBeats
      .map((b) => `${b.name.replace("card-beat-", "")}@${b.t}`)
      .join("  ");
    console.log(`  the whole ladder:  ${ladder}`);
  }
}

await browser.close();

const measured = results.filter((r) => r !== null);
if (!measured.length) {
  console.log("\nNOTHING MEASURED.\n");
  process.exit(1);
}

const sorted = [...measured].sort((a, b) => a - b);
const median = sorted[Math.floor(sorted.length / 2)];
const drift = median - TARGET_MS;
const pass = Math.abs(drift) <= TOLERANCE_MS;

console.log("\n════════════════════════════════════════════════");
console.log(`  spec      ${TARGET_MS}ms ± ${TOLERANCE_MS}ms  (Carl, 11 August 2026)`);
console.log(`  measured  ${median.toFixed(0)}ms   (median of ${measured.length})`);
console.log(`  drift     ${drift >= 0 ? "+" : ""}${drift.toFixed(0)}ms`);
console.log(`  ${pass ? "✅ WITHIN TOLERANCE" : "❌ OUTSIDE TOLERANCE"}`);
console.log("════════════════════════════════════════════════");

console.log("\n⚠ THIS MEASURES THE TRIGGER, NOT WHAT CARL SEES. The rung firing at");
console.log("  650ms and card 1 being VISIBLE at 650ms are different claims — the");
console.log("  visibility gate and the alpha ramp sit between them. Use");
console.log("  `q5-card-vs-reveal.mjs` for first light, and Carl's eye to approve.");

if (measured.length === 1) {
  console.log("\n⚠ ONE RUN IS ONE READING. Identical code on this page has varied by");
  console.log("  more than the effects being hunted. Pass a run count for a median.");
}

process.exit(pass ? 0 : 1);
