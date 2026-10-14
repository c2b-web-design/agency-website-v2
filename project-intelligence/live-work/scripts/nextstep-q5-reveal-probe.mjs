/** THE Q5 REVEAL, ONE ARM (14 October 2026) — the longest frame and frames > 50 ms in the 3 s after Begin, on `/start` at
 *  1412 × 700, a fresh browser context per run; also the draw calls of every canvas over 2 s before Begin (to see a drip).
 *  Run interleaved by the caller with the old pill and the new (the project's rule: one ordered pair lies).
 *  Usage: node …/nextstep-q5-reveal-probe.mjs <label> [runs]   ⚠ NOT WATCHED: Carl's Chrome; production. */
import { chromium } from "playwright";
const label = process.argv[2] ?? "arm";
const runs = Number(process.argv[3] ?? 2);
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
for (let r = 0; r < runs; r++) {
  const ctx = await b.newContext({ viewport: { width: 1412, height: 700 } });
  await ctx.addInitScript(() => {
    for (const P of [window.WebGL2RenderingContext, window.WebGLRenderingContext]) {
      if (!P) continue;
      for (const fn of ["drawElements", "drawArrays"]) { const o = P.prototype[fn]; P.prototype[fn] = function (...a) { const c = this.canvas; c.__draws = (c.__draws || 0) + 1; return o.apply(this, a); }; }
    }
  });
  const p = await ctx.newPage();
  await p.goto("http://localhost:3000/start", { waitUntil: "load" });
  await p.waitForTimeout(9000);
  const drawsBy = () => p.evaluate(() => [...document.querySelectorAll("canvas")].map((c) => ({ where: c.closest("[data-testid]")?.dataset.testid ?? c.parentElement?.className?.toString().slice(0, 20) ?? "?", draws: c.__draws || 0 })));
  const d0 = await drawsBy(); await p.waitForTimeout(2000); const d1 = await drawsBy();
  const drip = d1.map((c, i) => `${c.where}:+${c.draws - (d0[i]?.draws ?? 0)}`).join(" ");
  const watch = p.evaluate(() => new Promise((res) => { let last = performance.now(), worst = 0, over = 0; const end = last + 3000; const tick = (t) => { const g = t - last; worst = Math.max(worst, g); if (g > 50) over++; last = t; if (t < end) requestAnimationFrame(tick); else res({ worst: Math.round(worst), over }); }; requestAnimationFrame(tick); }));
  await p.getByRole("button", { name: /begin/i }).click();
  const w = await watch;
  console.log(`${label} run ${r + 1}: Q5 reveal longest ${w.worst} ms, ${w.over} > 50 ms · draws over 2 s before Begin: ${drip}`);
  await ctx.close();
}
await b.close();
