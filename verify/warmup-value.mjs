// Diagnostic: does the hidden warm-up canvas buy the REAL Q5 canvas anything?
//
//   node verify/warmup-value.mjs [runs]      (default 3 runs per arm)
//
// THE QUESTION, and it is the one thing holding up every decision about the
// Begin stall. The warm-up canvas at `enquiry-opening.tsx:1232` mounts a whole
// second WebGL context during the opening, and its scheduling is what puts a
// 641ms blocking task on the Begin reveal. Removing it is only correct if it
// buys nothing.
//
// ⚠ A WEBGL CONTEXT IS PER-CANVAS. Programs, PMREM and the transmission target
// all die when the warm-up unmounts, so the real canvas rebuilds them from
// scratch. On that reasoning the only thing that can cross between the two is
// ANGLE's on-disk binary shader cache.
//
// ⚠ BUT "ONLY THE BINARY CACHE CROSSES" IS NOT "THE BINARY CACHE IS WORTH
// 641ms". That is the untested leap, and this script exists to test it rather
// than to confirm it. Architect, 5 August:
// `live-work/architect-answer-begin-stall.md` Step 2.
//
// WHAT IT MEASURES — mount → compiled on the REAL canvas only:
//   `card-canvas-created`   performance.mark at the Canvas `onCreated`
//   `card-canvas-compiled`  performance.mark inside `markWarm`
// The gap between them is the real canvas's setup cost. That is the number.
//
//   ARM A  warm-up present (today's behaviour)
//   ARM B  warm-up absent  (?nowarmup=1)
//
// B ≈ A  → the warm-up buys nothing → it can be deleted
// B ≫ A  → the binary cache is real → the warm-up must be restructured, not cut
//
// ⚠ RUN THIS ONLY AFTER THE STEP 1 UNHOOK HAS LANDED. Before it, arm B is the
// 4 August failure again: `cardCanvasWarm` gated the real canvas too, so with no
// warm-up the cards never entered at all — and the entrance then "got faster"
// only because a beat that never ran cannot be slow. That reading fooled this
// project once already.
//
// ⚠ COLD GPU PROFILE EVERY RUN. Each run gets a fresh `--user-data-dir`, which
// is the whole reason this test can fail. ANGLE's program cache lives on disk
// and survives a normal context close, so a shared profile would make arm B warm
// too and both arms would look identical — a null result produced by the
// instrument, not by the code. This project has already recorded two theories
// retired by tests that never exercised the knob.
//
// ⚠ HEADED, WITH --enable-gpu, AND IT PRINTS THE RENDERER STRING. Headless
// Playwright has no GPU and silently substitutes SwiftShader, which invalidated
// a whole investigation on 4 August. If the renderer string says SwiftShader,
// the numbers are worthless — the script says so and exits.
//
// Requires the dev server (npm run dev).

import { chromium } from "@playwright/test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
const RUNS = Number(process.argv[2] ?? 3);

// Long enough to cover Begin becoming pressable (7400ms) plus the entrance and
// the async precompile behind it, which has measured ~1944ms after mount.
const WATCH_MS = 12000;

async function runOnce(arm) {
  // A FRESH BROWSER PROFILE PER RUN — see the header. This is the control that
  // lets arm B actually be cold.
  const profile = mkdtempSync(join(tmpdir(), `warmup-${arm}-`));
  const context = await chromium.launchPersistentContext(profile, {
    headless: false,
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    args: [
      "--enable-gpu",
      "--use-gl=angle",
      "--ignore-gpu-blocklist",
      "--disable-gpu-program-cache",   // belt and braces alongside the fresh profile
      "--disable-gpu-shader-disk-cache",
    ],
  });

  try {
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });

    await page.addInitScript(() => {
      window.__wv = { longTasks: [], frames: [], t0: null };
      const mark = () => (window.__wv.t0 === null ? null : performance.now() - window.__wv.t0);
      try {
        new PerformanceObserver((list) => {
          for (const e of list.getEntries()) {
            const at = mark();
            if (at !== null) window.__wv.longTasks.push({ at: Math.round(at), dur: Math.round(e.duration) });
          }
        }).observe({ entryTypes: ["longtask"] });
      } catch {}
      const tick = () => {
        const at = mark();
        if (at !== null) window.__wv.frames.push(at);
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });

    // ⚠ THE RENDERER STRING, PRINTED — not assumed. SwiftShader invalidates the run.
    const url = arm === "B" ? `${BASE}/start?nowarmup=1` : `${BASE}/start`;
    const res = await page.goto(url, { waitUntil: "domcontentloaded" });
    if (!res || !res.ok()) {
      console.error(`FAILED: ${res?.status() ?? "no response"} — is the dev server running? (npm run dev)`);
      process.exit(1);
    }

    const renderer = await page.evaluate(() => {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2") || c.getContext("webgl");
      if (!gl) return "no webgl";
      const ext = gl.getExtension("WEBGL_debug_renderer_info");
      return ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "unknown";
    });

    const begin = page.getByRole("button", { name: /begin/i });
    await begin.waitFor({ state: "visible", timeout: 25000 });
    await page.waitForFunction(
      () => {
        const b = [...document.querySelectorAll("button")].find((el) => /begin/i.test(el.textContent ?? ""));
        return b && !b.disabled && getComputedStyle(b).pointerEvents !== "none";
      },
      { timeout: 25000 },
    );

    // Whether the warm-up canvas actually mounted — the arm's own control.
    //
    // ⚠ CHECKED, NOT ASSUMED: a gate that silently never opens has shipped here
    // before, and it looked exactly like a successful arm B.
    //
    // ⚠ AND IT MUST BE CHECKED AFTER A WAIT, NOT AT BEGIN-PRESSABLE. The mount
    // needs `beginActive` (the reveal's `animationstart`, 7400ms) PLUS
    // OPENING_WARM_LEAD_MS PLUS an idle callback. Polling the instant Begin
    // becomes clickable finds nothing every time — which is exactly what the
    // first version of this script did, reporting "arm A did not take effect" on
    // all three runs while the node was in fact mounting shortly afterwards.
    // A control that samples before the thing it controls for cannot pass.
    const warmupPresent = await page
      .waitForSelector('[data-testid="answer-card-warmup"]', { timeout: 4000, state: "attached" })
      .then(() => true)
      .catch(() => false);

    await page.evaluate(() => { window.__wv.t0 = performance.now(); });
    await begin.click();
    await page.waitForTimeout(WATCH_MS);

    const data = await page.evaluate(() => {
      const t = window.__wv;
      const get = (n) => {
        const e = performance.getEntriesByName(n, "mark");
        return e.length ? e[0].startTime : null;
      };
      const created = get("card-canvas-created");
      const compiled = get("card-canvas-compiled");
      const gaps = [];
      for (let i = 1; i < t.frames.length; i++) {
        gaps.push({ at: Math.round(t.frames[i - 1]), gap: Math.round(t.frames[i] - t.frames[i - 1]) });
      }
      const worst = gaps.reduce((m, g) => (g.gap > m.gap ? g : m), { at: 0, gap: 0 });
      return {
        created,
        compiled,
        setupMs: created !== null && compiled !== null ? Math.round(compiled - created) : null,
        longTasks: t.longTasks.filter((l) => l.dur >= 50),
        worstGap: worst,
        droppedFrames: gaps.filter((g) => g.gap > 32).length,
      };
    });

    return { ...data, renderer, warmupPresent };
  } finally {
    await context.close();
    try { rmSync(profile, { recursive: true, force: true }); } catch {}
  }
}

const arms = { A: [], B: [] };

for (const arm of ["A", "B"]) {
  const label = arm === "A" ? "warm-up PRESENT" : "warm-up ABSENT";
  for (let run = 1; run <= RUNS; run++) {
    const d = await runOnce(arm);
    arms[arm].push(d);

    if (/swiftshader|llvmpipe|software/i.test(d.renderer)) {
      console.error(`\n⚠ ABORTING — renderer is "${d.renderer}".`);
      console.error(`  That is a software rasteriser, not the GPU. Every number this`);
      console.error(`  script produces would be measuring the wrong machine.`);
      process.exit(1);
    }

    console.log(`\n─── ARM ${arm} (${label}) — run ${run} of ${RUNS} ${"─".repeat(20)}`);
    console.log(`  Renderer                   ${d.renderer}`);
    console.log(`  Warm-up canvas in DOM      ${d.warmupPresent ? "yes" : "no"}` +
      (arm === "B" && d.warmupPresent ? "   ⚠ EXPECTED ABSENT — arm B did not take effect" : "") +
      (arm === "A" && !d.warmupPresent ? "   ⚠ EXPECTED PRESENT — arm A did not take effect" : ""));
    console.log(`  Real canvas mount→compiled ${d.setupMs === null ? "NOT REACHED ⚠" : `${d.setupMs}ms`}`);
    console.log(`  Long tasks >50ms           ${d.longTasks.length}` +
      (d.longTasks.length ? `  (worst ${Math.max(...d.longTasks.map((l) => l.dur))}ms at +${d.longTasks.reduce((m, l) => (l.dur > m.dur ? l : m)).at}ms)` : ""));
    console.log(`  Worst frame gap            ${d.worstGap.gap}ms (at +${d.worstGap.at}ms)`);
    console.log(`  Dropped frames (>32ms)     ${d.droppedFrames}`);
  }
}

const median = (xs) => {
  const v = xs.filter((x) => x !== null).sort((a, b) => a - b);
  return v.length ? v[Math.floor(v.length / 2)] : null;
};

const aSetup = median(arms.A.map((r) => r.setupMs));
const bSetup = median(arms.B.map((r) => r.setupMs));

console.log(`\n${"═".repeat(62)}`);
console.log(`VERDICT — ${RUNS} run(s) per arm, cold GPU profile each run`);
console.log(`${"═".repeat(62)}`);
console.log(`  Median mount→compiled, ARM A (warm-up present): ${aSetup === null ? "n/a" : `${aSetup}ms`}`);
console.log(`  Median mount→compiled, ARM B (warm-up absent):  ${bSetup === null ? "n/a" : `${bSetup}ms`}`);

if (aSetup === null || bSetup === null) {
  console.log(`
  → INCONCLUSIVE. The real canvas never reported compiled in at least one arm.
    That is a finding in itself: check the marks are present and that the cards
    actually entered. Do NOT read a missing number as a fast one.`);
} else {
  const delta = bSetup - aSetup;
  const pct = aSetup > 0 ? Math.round((delta / aSetup) * 100) : 0;
  console.log(`  Difference:                                     ${delta >= 0 ? "+" : ""}${delta}ms (${pct >= 0 ? "+" : ""}${pct}%)`);
  console.log(`
  → ${Math.abs(delta) < 100
      ? "THE WARM-UP BUYS ESSENTIALLY NOTHING. Removing it is on the table (Step 3a)."
      : delta > 0
        ? "THE WARM-UP BUYS REAL TIME. It must be restructured, not deleted (Step 3b)."
        : "ARM B IS FASTER THAN ARM A — the warm-up is a net COST to the real canvas."}`);
}

console.log(`
  ⚠ This answers "does the warm-up buy anything", NOT "is the stall fixed" and
    NOT "is this approved". A compile still has to happen somewhere, and every
    window between 600ms and 12400ms is inside an animation.

  ⚠ Verification is not approval.
`);
