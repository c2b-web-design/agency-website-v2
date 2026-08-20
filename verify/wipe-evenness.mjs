/**
 * ⚠⚠ IS THE PHRASE WIPE EVEN — OR DOES IT PAUSE AFTER THE FIRST WORD?
 *
 * Carl, 12 August 2026, on every `?riseease=` arm alike: *"a noticable pause
 * after the first word. Not as bad as a stutter, but its there. After this pause
 * the rest of the reveal is even… Its like watching a runner who makes a
 * misstep."*
 *
 * ⚠ THIS CONTRADICTS WHAT THE BUILDER ASSERTED ALL DAY. I said repeatedly that
 * the wipe runs on the compositor and *cannot* stutter. **That is wrong.**
 * `clip-path: inset()` is a PAINT property, not a compositor property — unlike
 * `transform` and `opacity`, an animated inset re-rasterises the element on the
 * MAIN THREAD every frame. There is no `will-change` anywhere in `globals.css`,
 * so nothing is promoted to its own layer either.
 *
 * **So the wipe shares the main thread with everything else, including the
 * WebGL context creation measured at +78-105ms into the reveal — which is 6-8%
 * of a 1300ms wipe, i.e. right at the end of the first word.**
 *
 * ⚠ WHY EVERY EXISTING HARNESS MISSED IT. They measure FRAME GAPS — was a frame
 * late. A repaint that is slow but still delivered inside 16ms produces no gap
 * and no long task, yet the clip edge advances unevenly. **Carl is describing a
 * velocity discontinuity, not a dropped frame**, and nothing in `verify/` looks
 * for one.
 *
 * ⚠ SO THIS MEASURES THE CLIP EDGE'S POSITION PER FRAME and reports its VELOCITY
 * — the derivative. An even wipe has near-constant velocity (the animation is
 * `linear`). A misstep shows as a velocity dip at a specific percentage of the
 * travel, which is the thing Carl can see and the frame-gap harnesses cannot.
 *
 *   VERIFY_BASE_URL=http://localhost:3100 node verify/wipe-evenness.mjs 5
 */

import { chromium } from "@playwright/test";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3100";
const RUNS = Number(process.argv[2] ?? 5);

if (/:3000(\/|$)/.test(BASE)) {
  console.error("\n⚠⚠ REFUSING TO RUN AGAINST :3000 — paint cost on dev is not the shipped cost.\n");
  process.exit(1);
}

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
});

const allDips = [];

for (let run = 1; run <= RUNS; run++) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.addInitScript(() => {
    window.__wipe = { samples: [] };
  });

  await page.goto(`${BASE}/start`, { waitUntil: "domcontentloaded" });

  if (run === 1) {
    const renderer = await page.evaluate(() => {
      const gl = document.createElement("canvas").getContext("webgl2");
      if (!gl) return "no webgl";
      const ext = gl.getExtension("WEBGL_debug_renderer_info");
      return ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "unknown";
    });
    if (/swiftshader|llvmpipe|software|no webgl/i.test(renderer)) {
      console.error(`\n⚠ ABORTING — "${renderer}" is a software rasteriser.\n`);
      await browser.close();
      process.exit(1);
    }
    console.log(`renderer: ${renderer}\nbase:     ${BASE}\n`);
  }

  await page.getByRole("button", { name: /begin/i }).click();

  // Sample the animation's own currentTime AND the computed clip-path, per
  // frame, from the moment the wipe exists.
  await page.waitForFunction(
    () => {
      const el = document.querySelector(".enquiry-q-text-reveal");
      const a = el?.getAnimations?.().find((x) => x.animationName === "enquiry-mask-reveal-horizontal");
      return !!a && typeof a.startTime === "number";
    },
    { timeout: 30000 },
  );

  await page.evaluate(() => {
    const el = document.querySelector(".enquiry-q-text-reveal");
    const anim = el.getAnimations().find((x) => x.animationName === "enquiry-mask-reveal-horizontal");
    const tick = () => {
      const cp = getComputedStyle(el).clipPath;
      // `inset(0px A 0px 0px)` — A is the distance still hidden from the right.
      const m = /inset\([^ ]+ ([0-9.]+)(px|%)/.exec(cp);
      window.__wipe.samples.push({
        t: performance.now(),
        ct: typeof anim.currentTime === "number" ? anim.currentTime : null,
        hidden: m ? parseFloat(m[1]) : null,
        unit: m ? m[2] : null,
        w: el.getBoundingClientRect().width,
      });
      if (!anim.currentTime || anim.currentTime < 1400) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  await page.waitForTimeout(2000);

  const out = await page.evaluate(() => {
    const s = window.__wipe.samples.filter((x) => x.hidden !== null && x.ct !== null);
    if (s.length < 10) return null;
    // Convert "hidden from the right" into revealed fraction 0..1.
    const rev = s.map((x) => ({
      ct: x.ct,
      p: x.unit === "%" ? 1 - x.hidden / 100 : 1 - x.hidden / (x.w || 1),
    }));
    // Velocity per frame, in fraction-of-width per ms.
    const vel = [];
    for (let i = 1; i < rev.length; i++) {
      const dt = rev[i].ct - rev[i - 1].ct;
      if (dt <= 0) continue;
      vel.push({ at: rev[i - 1].p, v: (rev[i].p - rev[i - 1].p) / dt, ct: rev[i - 1].ct });
    }
    const mid = vel.filter((x) => x.at > 0.3 && x.at < 0.9).map((x) => x.v).sort((a, b) => a - b);
    const nominal = mid.length ? mid[Math.floor(mid.length / 2)] : 0;
    // A dip is a frame whose velocity falls well below the steady-state rate.
    const dips = vel
      .filter((x) => nominal > 0 && x.v < nominal * 0.55 && x.at < 0.95)
      .map((x) => ({ at: Math.round(x.at * 1000) / 10, ct: Math.round(x.ct), ratio: Math.round((x.v / nominal) * 100) }));
    return { frames: rev.length, nominal, dips };
  });

  await page.close();

  if (!out) {
    console.log(`  run ${run}: could not read the clip edge — computed style may not expose it.`);
    continue;
  }

  const dipTxt = out.dips.length
    ? out.dips.map((d) => `${d.at}% (${d.ratio}% speed, +${d.ct}ms)`).join("   ")
    : "none";
  console.log(`  run ${run}   ${String(out.frames).padStart(3)} frames   dips: ${dipTxt}`);
  allDips.push(...out.dips.map((d) => d.at));
}

await browser.close();

console.log("\n══════════════════════════════════════════════════");
// ⚠⚠ WHICH BOX THIS MEASURED — D-052, 20 August 2026. Declared in the OUTPUT,
// not only in the header: a scope caveat in a comment is read once by whoever
// opens the file; the verdict is read every run by whoever is deciding
// something. `context-rules.md` — "every harness must declare what it does NOT
// watch, IN ITS OUTPUT".
console.log("  SUBJECT: `.enquiry-q-text-reveal` now resolves to the ROW");
console.log("           (.enquiry-phrase-qrow = cue + gap + question), NOT the");
console.log("           question span. clipPath and width below are the ROW's.");
console.log("  ⛔ FIGURES FROM BEFORE THIS COMMIT ARE NOT COMPARABLE — they");
console.log("     measured a narrower box. This is not a re-scaling: a % of a");
console.log("     different box is a different quantity.");
console.log("──────────────────────────────────────────────────");
if (!allDips.length) {
  console.log("  No velocity dip found. ⚠ THAT DOES NOT CLEAR THE DEFECT —");
  console.log("  Carl can see it, and a harness that disagrees with his eye is");
  console.log("  the thing that is wrong. It means THIS instrument is looking in");
  console.log("  the wrong place, not that the wipe is even.");
} else {
  const sorted = [...allDips].sort((a, b) => a - b);
  console.log(`  velocity dips at (% of wipe travel): ${sorted.join(", ")}`);
  console.log(`  median: ${sorted[Math.floor(sorted.length / 2)]}%`);
  console.log("\n  ⚠ A 5-6 WORD PHRASE PUTS THE FIRST WORD AT ROUGHLY 15-20%.");
  console.log("  Dips clustered below that are the misstep Carl is describing.");
}
console.log("══════════════════════════════════════════════════");
