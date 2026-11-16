// THE FIRST-RUN HITCH (16 November 2026; D-101). Carl: *"I opened a new browser window. The stutter was there"*. A FRESH
// browser each run (Playwright's own temporary profile: an EMPTY shader cache, as a first-time visitor), the bench LIVE (its
// own loop), from load through phase 1 to the end of the steam. Every frame's time is logged with the story's clock and the
// rain's and the steam's; reports the worst frames (a) from load to the lean's end (the warm-up's place) and (b) from 1 s
// before the first drops land to 5 s after (the hitch Carl saw), (c) story 1–6 s (the jump), and the frames over 50 ms in each. argv 2: "both" (rain and
// steam, the default) or "rain" (the steam OFF from load: the rain's own share); argv 3: runs (default 2).
// ⚠ NOT WATCHED / CAVEATS, printed: Playwright's Chrome (headless, AMD integrated), not Carl's; the frame cap ON (as Carl
// sees it); a frame's time includes everything in it (the hitch's cause is inferred from WHEN it lands, not measured).
import { chromium } from "playwright";
const [MODE = "both", RUNS = "2"] = process.argv.slice(2);
for (let run = 1; run <= +RUNS; run++) {
  const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const errors = [];
  p.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
  await p.addInitScript((mode) => {
    window.__frames = [];
    let last = 0;
    const tick = (t) => {
      const h = window.__heroBench?.hero;
      if (h && mode === "rain" && h.steam) h.steam.on = false;
      if (last) window.__frames.push([Math.round((t - last) * 10) / 10, h?.arrival?.t ?? -1, h?.rainInfo?.t ?? -1, h?.rainInfo?.leadS ?? 0]);
      last = t;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, MODE);
  await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
  await p.waitForFunction(() => window.__heroBench?.hero?.rainInfo, null, { timeout: 90000 });
  // to 5 s after the first drops land
  await p.waitForFunction(() => {
    const r = window.__heroBench.hero.rainInfo;
    return r && r.t - r.leadS > 5;
  }, null, { timeout: 120000, polling: 500 });
  const frames = await p.evaluate(() => window.__frames);
  const lean = frames.filter((f) => f[1] >= 0 && f[1] < 1.0);
  const jump = frames.filter((f) => f[1] >= 1.0 && f[1] < 6.0);
  const drops = frames.filter((f) => f[2] >= 0 && f[2] - f[3] >= -1 && f[2] - f[3] <= 5);
  const worst = (a) => [...a].sort((x, y) => y[0] - x[0]).slice(0, 5).map((f) => `${f[0]} ms @ ${f[2] >= 0 ? `drops ${Math.round((f[2] - f[3]) * 100) / 100}s` : `story ${f[1]}s`}`);
  const over = (a) => a.filter((f) => f[0] > 50).length;
  console.log(`run ${run} (${MODE}) — frames: lean ${lean.length}, around the drops ${drops.length}`);
  console.log(`  load → lean end (story 0–1 s): worst ${worst(lean).join(", ")}; > 50 ms: ${over(lean)}`);
  console.log(`  story 1–6 s (the hold's end, the jump; the warm-up's draw compiles in the background here): worst ${worst(jump).join(", ")}; > 50 ms: ${over(jump)}`);
  console.log(`  drops −1 s → +5 s: worst ${worst(drops).join(", ")}; > 50 ms: ${over(drops)}`);
  console.log(`  warm-up at load: the story's later programs ${await p.evaluate(() => window.__heroBench.hero.warmMs)} ms (in the background; the story does not wait), the steam ${await p.evaluate(() => window.__heroBench.hero.steamInfo?.warmMs)} ms`);
  if (errors.length) console.log("  page errors:", errors.slice(0, 3));
  await b.close();
}
console.log("⚠ Playwright's Chrome, a fresh profile each run (empty shader cache), frame cap ON; not Carl's Chrome");
