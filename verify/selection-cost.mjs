/**
 * ⚠⚠ WHAT DOES SELECTING A CARD COST — THE MOMENT CARL NAMED.
 *
 * Carl, 11 August 2026: *"Q5 after it was selected stuttered into position.
 * Its worse."*
 *
 * ⚠ THIS MOMENT WAS NEVER MEASURED, AND MY OWN HARNESSES ARE WHY.
 * `walk-cost.mjs:90-94` clicks the card, waits 700ms, and only THEN starts the
 * frame sampler — so every "~100ms per step" figure reported today **excluded
 * the selection entirely**. `walk-dwell.mjs` sampled continuously but labelled
 * anything here "DWELL", which reads as idle time rather than as a user action
 * with work behind it.
 *
 * ⚠⚠ SO A ~400-485ms GAP AT Begin+~5250ms WAS SEEN REPEATEDLY TODAY AND
 * FILED AS "dwell". Carl's Q5 selection happens at roughly that offset. **The
 * instrument saw it and mislabelled it** — the adjacency failure, again.
 *
 * WHAT THIS MEASURES, on the SELECTION only — click to settled, no corridor
 * move involved:
 *
 *   - worst frame gap from the click
 *   - when it lands relative to the click
 *   - WebGL contexts created in the window (by mark, so the contact-field
 *     canvas is distinguishable from the answer cards')
 *   - long tasks with attribution
 *
 * ⚠ SELECTION SHOULD BE NEARLY FREE. It sets `selected`, lights a card, and
 * fades the Next step button in over 600ms. **Nothing about that should create
 * a WebGL context or upload a texture.** If something expensive is happening
 * here it is unintended.
 *
 *   VERIFY_BASE_URL=http://localhost:3100 node verify/selection-cost.mjs 5
 *
 * ⚠ MEASURES Q5's FIRST SELECTION BY DEFAULT — the one Carl named. Pass a
 * second arg to walk deeper first, e.g. `... 5 2` selects on Q4.
 */

import { chromium } from "@playwright/test";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3100";
const RUNS = Number(process.argv[2] ?? 5);
const DEPTH = Number(process.argv[3] ?? 1); // 1 = Q5, 2 = Q4, ...

if (/:3000(\/|$)/.test(BASE)) {
  console.error("\n⚠⚠ REFUSING TO RUN AGAINST :3000 — dev frame cost is noise.\n");
  process.exit(1);
}

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
});

const worsts = [];

for (let run = 1; run <= RUNS; run++) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.addInitScript(() => {
    const W = window;
    W.__sel = { frames: [], longTasks: [] };
    try {
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          W.__sel.longTasks.push({ at: e.startTime, dur: Math.round(e.duration) });
        }
      }).observe({ entryTypes: ["longtask"] });
    } catch {}
    const tick = () => {
      W.__sel.frames.push(performance.now());
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

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
    console.log(`renderer: ${renderer}\nbase:     ${BASE}\nquestion: ${6 - DEPTH}\n`);
  }

  await page.getByRole("button", { name: /begin/i }).click();
  await page.locator(".enquiry-answer-grid").waitFor({ state: "visible", timeout: 30000 });
  // ⚠ THE ENTRANCE MUST BE OVER. `ENTRANCE_END_MS` is 5440ms from the entrance
  // anchor; selecting mid-entrance would measure the ladder, not the selection.
  await page.waitForTimeout(6200);

  // Walk to the requested question without measuring those steps.
  for (let d = 1; d < DEPTH; d++) {
    await page.getByTestId("answer-card-hover-0").click();
    await page.waitForTimeout(700);
    await page.getByRole("button", { name: /next step/i }).click();
    await page.waitForTimeout(2000);
  }

  // ── THE WINDOW: from the click, through the button's 600ms fade, to settled.
  const clickAt = await page.evaluate(() => {
    window.__sel.mark = performance.now();
    return window.__sel.mark;
  });
  await page.getByTestId("answer-card-hover-0").click();
  await page.waitForTimeout(1500);

  const out = await page.evaluate((start) => {
    const s = window.__sel;
    let worst = 0;
    let worstAt = 0;
    for (let i = 1; i < s.frames.length; i++) {
      if (s.frames[i - 1] < start) continue;
      const gap = s.frames[i] - s.frames[i - 1];
      if (gap > worst) {
        worst = gap;
        worstAt = s.frames[i - 1];
      }
    }
    const marks = performance
      .getEntriesByType("mark")
      .filter((m) => m.startTime >= start && /canvas-created|canvas-compiled/.test(m.name))
      .map((m) => `${m.name}@+${Math.round(m.startTime - start)}ms`);
    return {
      worst: Math.round(worst),
      worstAt: Math.round(worstAt - start),
      marks,
      longTasks: s.longTasks
        .filter((t) => t.at >= start)
        .map((t) => `${t.dur}ms@+${Math.round(t.at - start)}ms`),
    };
  }, clickAt);

  worsts.push(out.worst);
  const flag = out.worst > 50 ? "  ⚠ ABOVE THE ~50ms VISIBLE THRESHOLD" : "";
  console.log(`  run ${run}   worst ${String(out.worst).padStart(4)}ms at +${out.worstAt}ms${flag}`);
  if (out.longTasks.length) console.log(`          long tasks: ${out.longTasks.join("  ")}`);
  if (out.marks.length) console.log(`          ⚠ canvas work: ${out.marks.join("  ")}`);

  await page.close();
}

await browser.close();

const sorted = [...worsts].sort((a, b) => a - b);
console.log("\n══════════════════════════════════════════════════");
console.log(`  SELECTING A CARD — worst frame gap`);
console.log(`  median ${sorted[Math.floor(sorted.length / 2)]}ms   [${worsts.join(", ")}]`);
console.log("══════════════════════════════════════════════════");
console.log("\n⚠ SELECTION SETS STATE AND FADES A BUTTON IN. Anything here above");
console.log("  the ~50ms threshold is unintended work, not a cost of the feature.");
