/** COLD (a new browser per run) — THE CARDS' NEW LOOK — WHAT IT COSTS `/start` (D-051, R-062, 15 October 2026). A/B INTERLEAVED (one ordered pair lies):
 *    NEW = the default (the glass tube, the shell studio — `/start` now fetches the 1.56 MB HDRI and builds the cards' env from it)
 *    OLD = `?cardrim=metal&cardenv=panels` (the August look, no HDRI)
 *  Per run, a fresh browser context at 1412 × 700, DPR 1 (`nextstep-q5-reveal-probe.mjs`'s frame):
 *    OPENING — every animation-frame gap from load to 9 s (worst, count > 50 ms) and long tasks (> 50 ms) in that window;
 *    HDRI    — when the .hdr finished arriving (resource timing, ms after navigation) — must precede the cards;
 *    REVEAL  — the 3 s after Begin: worst frame, count > 50 ms (the 18 August instrument's window);
 *    STEP    — an answer chosen, Next step clicked: the 2.6 s after it, worst frame, count > 50 ms.
 *  Usage: node …/cards-studio-cost-ab-15-october.mjs [runs per arm, default 3]
 *  ⚠ NOT WATCHED: Carl's Chrome and GPU; production (Vercel's network for the 1.56 MB); throttled networks; phones; the
 *  frames' CONTENT (a "grey then brighter" would show as a look, not a time — see the frames). */
import { chromium } from "playwright";
const runs = Number(process.argv[2] ?? 3);
// ⛔ COLD: a NEW BROWSER PER RUN (a fresh profile — no compiled-shader cache), because a first visit is always cold and the
// shared-browser runs hid a ~750 ms task in every arm's first run only. Arms split the change: the glass rim alone, the
// studio shell alone.
const ARMS = [["NEW", ""], ["OLD", "?cardrim=metal&cardenv=panels"], ["RIM", "?cardenv=panels"], ["SHELL", "?cardrim=metal"]];
let b;
const watch = (p, ms) => p.evaluate((ms) => new Promise((res) => {
  let last = performance.now(), worst = 0, over = 0; const end = last + ms;
  const tick = (t) => { const g = t - last; worst = Math.max(worst, g); if (g > 50) over++; last = t; if (t < end) requestAnimationFrame(tick); else res({ worst: Math.round(worst), over }); };
  requestAnimationFrame(tick);
}), ms);
const rows = { NEW: [], OLD: [], RIM: [], SHELL: [] };
for (let r = 0; r < runs; r++) {
  for (const [arm, q] of ARMS) {
    b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
    const ctx = await b.newContext({ viewport: { width: 1412, height: 700 } });
    await ctx.addInitScript(() => {
      window.__long = [];
      try { new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__long.push({ at: Math.round(e.startTime), d: Math.round(e.duration) }))).observe({ type: "longtask", buffered: true }); } catch {}
      window.__open = { worst: 0, over: 0 };
      let last = performance.now();
      const tick = (t) => { const g = t - last; if (t < 9000) { window.__open.worst = Math.max(window.__open.worst, g); if (g > 50) window.__open.over++; } last = t; if (t < 9500) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    });
    const p = await ctx.newPage();
    await p.goto("http://localhost:3000/start" + q, { waitUntil: "load" });
    await p.waitForTimeout(9200);
    const open = await p.evaluate(() => ({ worst: Math.round(window.__open.worst), over: window.__open.over, long: window.__long.filter((e) => e.at < 9000), hdr: Math.round(performance.getEntriesByType("resource").find((e) => e.name.endsWith(".hdr"))?.responseEnd ?? -1) }));
    const rev = watch(p, 3000);
    await p.getByRole("button", { name: /begin/i }).click();
    const reveal = await rev;
    await p.waitForTimeout(800);
    await p.getByTestId("answer-card-hover-0").dispatchEvent("pointerdown");
    await p.mouse.move(5, 5);
    await p.waitForTimeout(2500);
    const st = watch(p, 2600);
    await p.locator(".enquiry-nextstep-btn").click();
    const step = await st;
    const longSum = open.long.reduce((a, e) => a + e.d, 0);
    rows[arm].push({ open, reveal, step });
    console.log(`${arm} run ${r + 1}: OPENING worst ${String(open.worst).padStart(4)} ms, >50 ×${open.over}, long tasks ${open.long.length} (${longSum} ms${open.long.length ? ": " + open.long.map((e) => `${e.d}@${e.at}`).join(" ") : ""}) · HDRI ${open.hdr < 0 ? "not fetched" : open.hdr + " ms"} · REVEAL worst ${reveal.worst} ms, >50 ×${reveal.over} · STEP worst ${step.worst} ms, >50 ×${step.over}`);
    await ctx.close();
    await b.close();
  }
}
for (const arm of ["NEW", "OLD", "RIM", "SHELL"]) {
  const R = rows[arm], max = (f) => Math.max(...R.map(f));
  console.log(`\n${arm}: opening worst ${max((x) => x.open.worst)} ms · reveal worst ${max((x) => x.reveal.worst)} ms (>50 total ${R.reduce((a, x) => a + x.reveal.over, 0)}) · step worst ${max((x) => x.step.worst)} ms (>50 total ${R.reduce((a, x) => a + x.step.over, 0)})`);
}
console.log("⚠ NOT WATCHED: Carl's Chrome and GPU; production's network; throttling; phones; the frames' content.");
