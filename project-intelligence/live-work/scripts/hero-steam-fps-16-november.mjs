// THE STEAM's FRAME COST (16 November 2026; D-101, D-108; `components/hero/hero-steam.ts`). The bench LIVE (its own loop),
// from HOME, the steam on HOLD (emitting) so it stays live; waits for the story to reach the first drops and for the RAIN
// TO FINISH (so the rain's cost is not in it); then frames timed by requestAnimationFrame for `SECONDS` per condition:
// the steam OFF, then ON at each cell size (argv 2, comma list; default 3,2.5,2). Prints fps (mean) and the frame time
// (median, 95th percentile). An item "2.5@16" also sets the ray steps (the draw's share of the cost). READ-ONLY.
// ⚠ NOT WATCHED / CAVEATS, printed with the result: Playwright's Chrome (headless, ANGLE D3D11 on the integrated AMD
// Radeon — checked by the adapter line), NOT Carl's own Chrome; the frame-rate cap REMOVED (--disable-gpu-vsync
// --disable-frame-rate-limit) so a cost under 60 fps' budget still shows: these fps are NOT comparable with a capped 60;
// the steam held ON (the real burst is ~3 s, then it costs nothing); the blobs are not out at this point of the story.
import { chromium } from "playwright";
const [CELLS = "3,2.5,2", SECONDS = "5"] = process.argv.slice(2);
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu", "--disable-gpu-vsync", "--disable-frame-rate-limit"] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const errors = [];
p.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.steamInfo && window.__heroBench.hero.warmed !== false, null, { timeout: 90000 });
const adapter = await p.evaluate(async () => {
  const a = await navigator.gpu?.requestAdapter();
  const i = a?.info ?? {};
  return `${i.vendor ?? "?"} / ${i.architecture ?? "?"} / ${i.description ?? "?"}`;
});
await p.evaluate(() => {
  const { hero } = window.__heroBench;
  hero.steam.hold = true;
  hero.replayArrival();
});
// the story to the first drops, then the rain done (it runs ~6 s, then a fall)
await p.waitForFunction(() => {
  const { hero } = window.__heroBench;
  const s = hero.steamInfo;
  const r = hero.rainInfo;
  return s && s.live && r && r.t > 1 && !r.running;
}, null, { timeout: 120000, polling: 250 });
const measure = (secs) =>
  p.evaluate(
    (secs) =>
      new Promise((done) => {
        const ts = [];
        const t0 = performance.now();
        const tick = (t) => {
          ts.push(t);
          if (t - t0 < secs * 1000) requestAnimationFrame(tick);
          else {
            const d = ts.slice(1).map((v, i) => v - ts[i]).sort((a, b) => a - b);
            const q = (f) => d[Math.min(d.length - 1, Math.floor(f * d.length))];
            done({ fps: Math.round(((ts.length - 1) / ((ts[ts.length - 1] - ts[0]) / 1000)) * 10) / 10, medianMs: Math.round(q(0.5) * 10) / 10, p95Ms: Math.round(q(0.95) * 10) / 10 });
          }
        };
        requestAnimationFrame(tick);
      }),
    secs,
  );
const settle = () => p.waitForTimeout(1500);
const rows = [];
await p.evaluate(() => (window.__heroBench.hero.steam.on = false));
await settle();
rows.push({ steam: "OFF", ...(await measure(+SECONDS)) });
for (const item of CELLS.split(",")) {
  const [c, steps] = item.split("@").map(Number);
  await p.evaluate(([c, steps]) => {
    const { hero } = window.__heroBench;
    hero.steam.cellCm = c;
    hero.steam.steps = steps || 48;
    hero.steam.on = true;
  }, [c, steps]);
  // the rebuild, the first steps and their shaders compile here: not timed
  await p.waitForFunction(() => window.__heroBench.hero.steamInfo?.live, null, { timeout: 60000 });
  await p.waitForTimeout(4000);
  const info = await p.evaluate(() => window.__heroBench.hero.steamInfo);
  rows.push({ steam: `ON, cell ${c} cm, ray steps ${steps || 48}`, cells: info.count, gpuMB: info.gpuMB, stepsLastFrame: info.stepsLastFrame, ...(await measure(+SECONDS)) });
}
await b.close();
console.log(`adapter: ${adapter}`);
console.log("⚠ Playwright's Chrome, frame cap REMOVED, steam HELD on, after the rain; not Carl's Chrome; not comparable with a capped 60");
for (const r of rows) console.log(JSON.stringify(r));
console.log(`page errors: ${errors.length}`, errors.slice(0, 5));
