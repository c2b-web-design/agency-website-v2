/**
 * ⚠⚠ THE OUTGOING Q5 PHRASE, FRAME BY FRAME, AS IT RECEDES INTO THE RAIL.
 *
 * Carl, 11 August 2026: *"Q5 reveals. i chose card 1. Pressed next step and
 * then Q5 as it moved up into position stuttered."* And: **"just on Q5"** — it
 * does not happen on Q4→Q3, Q3→Q2 or Q2→Q1.
 *
 * ⚠ WHY THE EXISTING HARNESSES MISSED THIS, AND BOTH FAILURES ARE MINE:
 *
 *   `corridor-motion.mjs` reported **0.1% deviation** and I quoted it as
 *   "nothing moved". It samples the phrase's POSITION per frame and compares
 *   curves. **A dropped frame does not move the curve** — the frames that DO
 *   render still land on it. So it answers "did the phrase arrive correctly",
 *   never "did it arrive smoothly". ⚠ **A 0.1% position match and a visible
 *   stutter are perfectly compatible.**
 *
 *   `walk-cost.mjs` reported ~107ms for this step — the aggregate worst gap
 *   across the whole move, which does not say WHICH element hitched or WHERE
 *   in the 900ms it happened.
 *
 * **So this measures frame DELIVERY on the receding element itself:** inter-frame
 * gaps sampled while `.enquiry-phrase-anim` is in flight, reported as a
 * timeline rather than a single worst number, so the position of the hitch
 * inside the move is visible. *Where the stutter lands tells you where the work
 * landed* — `q5-stutter.mjs`'s own principle, and it is what cracked the reveal.
 *
 * ⚠ Q5→Q4 IS COMPARED AGAINST Q4→Q3 IN THE SAME RUN. Carl says the defect is
 * Q5-only; a harness that measures only Q5 cannot check that claim, and "it is
 * worse on Q5" is the single most diagnostic fact available.
 *
 *   VERIFY_BASE_URL=http://localhost:3100 node verify/q5-recede.mjs 5
 */

import { chromium } from "@playwright/test";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3100";
const RUNS = Number(process.argv[2] ?? 5);

if (/:3000(\/|$)/.test(BASE)) {
  console.error("\n⚠⚠ REFUSING TO RUN AGAINST :3000 — dev frame cost is noise.\n");
  process.exit(1);
}

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
});

const byStep = new Map([
  ["Q5→Q4", []],
  ["Q4→Q3", []],
]);

for (let run = 1; run <= RUNS; run++) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${BASE}/start`, { waitUntil: "networkidle" });

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
  await page.locator(".enquiry-answer-grid").waitFor({ state: "visible", timeout: 30000 });
  // The entrance must be over — ENTRANCE_END_MS is 5440ms from the anchor.
  await page.waitForTimeout(6200);

  console.log(`── run ${run} ──`);

  for (const step of ["Q5→Q4", "Q4→Q3"]) {
    await page.getByTestId("answer-card-hover-0").click();
    await page.waitForTimeout(700);

    // Sample per rAF, recording the receding phrase's own top edge alongside
    // the timestamp — so a gap can be tied to a position in the travel.
    await page.evaluate(() => {
      window.__rc = { samples: [], t0: performance.now() };
      const tick = () => {
        // The RECEDING phrase is the one leaving depth 0. During the move both
        // the outgoing and incoming phrases exist; `.enquiry-phrase-anim` is
        // the element carrying the 900ms eased transition.
        const el = document.querySelector(".enquiry-phrase-anim");
        const top = el ? Math.round(el.getBoundingClientRect().top) : null;
        window.__rc.samples.push({ t: performance.now(), top });
        window.__rc.raf = requestAnimationFrame(tick);
      };
      window.__rc.raf = requestAnimationFrame(tick);
    });

    await page.getByRole("button", { name: /next step/i }).click();
    await page.waitForTimeout(1500);

    const out = await page.evaluate(() => {
      cancelAnimationFrame(window.__rc.raf);
      const s = window.__rc.samples;
      const t0 = window.__rc.t0;
      // The move is the stretch where `top` is actually changing.
      const moving = s.filter((x) => x.top !== null);
      const gaps = [];
      for (let i = 1; i < moving.length; i++) {
        gaps.push({
          gap: Math.round(moving[i].t - moving[i - 1].t),
          at: Math.round(moving[i - 1].t - t0),
          top: moving[i - 1].top,
        });
      }
      const travel = moving.length
        ? { from: moving[0].top, to: moving[moving.length - 1].top }
        : null;
      return {
        frames: moving.length,
        travel,
        // Every gap above ~2 frames at 60Hz — a visible hitch, not jitter.
        hitches: gaps.filter((g) => g.gap >= 34),
        worst: gaps.length ? Math.max(...gaps.map((g) => g.gap)) : 0,
      };
    });

    byStep.get(step).push(out.worst);

    const t = out.travel ? `${out.travel.from}→${out.travel.to}px` : "no travel seen";
    console.log(`   ${step}   ${out.frames} frames  ${t}  worst ${out.worst}ms`);
    for (const h of out.hitches) {
      console.log(`       ⚠ ${String(h.gap).padStart(4)}ms gap at +${h.at}ms into the move  (phrase top ${h.top}px)`);
    }

    await page.waitForTimeout(600);
  }

  await page.close();
}

await browser.close();

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};

console.log("\n══════════════════════════════════════════════════");
console.log("  worst inter-frame gap on the RECEDING phrase");
console.log("══════════════════════════════════════════════════");
for (const [step, xs] of byStep) {
  if (!xs.length) continue;
  console.log(`  ${step}   ${String(median(xs)).padStart(4)}ms   [${xs.join(", ")}]`);
}
console.log("\n⚠ CARL REPORTS THE STUTTER ON Q5 ONLY. If Q5→Q4 is materially worse");
console.log("  than Q4→Q3 here, that asymmetry is the diagnosis — the two steps");
console.log("  differ in what has just finished running, not in the move itself.");
console.log("\n⚠ AND A CLEAN NUMBER HERE DOES NOT CLEAR THE DEFECT. Carl saw it;");
console.log("  a harness that disagrees with his eye is the harness that is wrong.");
