// THE HERO's COLD LOAD: WHAT THE BLACK VIEWPORT IS MADE OF (26 November 2026; Carl: "Take a look at the opening and loading and
// see if you can optimise it. Im trying to avoid a black viewport at the start."). READ-ONLY: measures, changes nothing.
// A PRODUCTION build (argv[2], default http://localhost:3100) of `/proto/hero` (+ argv[4], a query: the opening's takes), in Chrome with WebGPU, at Carl's window
// (1896 x 946, DPR 1), a FRESH profile (cold: empty HTTP cache, no compiled shaders), then a RELOAD in the same profile (a
// return visit). Per load: the page's timing (navigation, first paint, DOM, load), the scene's own marks ("hero:*"), every
// network request (start, end, size, host), and a SCREENCAST (CDP, each frame stamped) reduced to the viewport's mean
// brightness over time — the first frame brighter than black is "the first light". Out (argv[3]): report.json, frames/.
// ⚠ NOT WATCHED: the live loop's frame rate (only when things happen); the dev bench (production only); other browsers.
import { chromium } from "playwright";
import { mkdirSync, rmSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const [BASE = "http://localhost:3100", OUT = "hero-cold-load", QUERY = ""] = process.argv.slice(2);
rmSync(OUT, { recursive: true, force: true });
mkdirSync(`${OUT}/frames`, { recursive: true });
const profile = mkdtempSync(join(tmpdir(), "hero-cold-"));
const ctx = await chromium.launchPersistentContext(profile, {
  channel: "chrome",
  viewport: { width: 1896, height: 946 },
  deviceScaleFactor: 1,
  args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu", "--hide-scrollbars"],
});
const page = ctx.pages()[0] ?? (await ctx.newPage());
const report = {};
for (const run of ["cold", "return"]) {
  const cdp = await ctx.newCDPSession(page);
  const shots = [];
  cdp.on("Page.screencastFrame", async (f) => {
    shots.push({ t: f.metadata.timestamp, data: f.data });
    await cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
  });
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 60, everyNthFrame: 1, maxWidth: 948, maxHeight: 473 });
  const navWall = Date.now() / 1000;
  if (run === "cold") await page.goto(`${BASE}/proto/hero${QUERY}`, { waitUntil: "load" });
  else await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(16000);
  await cdp.send("Page.stopScreencast");
  const perf = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0];
    const paint = Object.fromEntries(performance.getEntriesByType("paint").map((p) => [p.name, Math.round(p.startTime)]));
    const marks = Object.fromEntries(performance.getEntriesByType("mark").filter((m) => m.name.startsWith("hero:")).map((m) => [m.name, Math.round(m.startTime)]));
    const res = performance.getEntriesByType("resource").map((r) => ({ name: r.name.replace(location.origin, ""), start: Math.round(r.startTime), end: Math.round(r.responseEnd), kb: Math.round((r.transferSize || r.encodedBodySize || 0) / 1024), type: r.initiatorType }));
    return { timeOrigin: performance.timeOrigin, dcl: Math.round(nav.domContentLoadedEventEnd), load: Math.round(nav.loadEventEnd), paint, marks, res, canvas: !!document.querySelector("canvas") };
  });
  // the screencast's brightness: decode each frame in the page (a 2D canvas), the mean of the frame
  const lum = [];
  for (let i = 0; i < shots.length; i++) {
    const v = await page.evaluate(async (d) => {
      const img = new Image();
      img.src = `data:image/jpeg;base64,${d}`;
      await img.decode();
      const c = new OffscreenCanvas(96, 48);
      const g = c.getContext("2d");
      g.drawImage(img, 0, 0, 96, 48);
      const px = g.getImageData(0, 0, 96, 48).data;
      let s = 0;
      let mx = 0;
      for (let k = 0; k < px.length; k += 4) {
        const y = 0.2126 * px[k] + 0.7152 * px[k + 1] + 0.0722 * px[k + 2];
        s += y;
        if (y > mx) mx = y;
      }
      return [s / (px.length / 4), mx];
    }, shots[i].data);
    const ms = Math.round((shots[i].t - perf.timeOrigin / 1000) * 1000);
    lum.push({ ms, mean: Math.round(v[0] * 10) / 10, max: Math.round(v[1]) });
    if (i % 4 === 0 || i < 40) writeFileSync(`${OUT}/frames/${run}-${String(ms).padStart(6, "0")}.jpg`, Buffer.from(shots[i].data, "base64"));
  }
  const firstLight = lum.find((l) => l.max > 40) ?? null;
  report[run] = { navWall, ...perf, firstLight, lum };
  const big = perf.res.filter((r) => r.end > 300).sort((a, b) => b.end - a.end).slice(0, 25);
  console.log(`\n== ${run}: DCL ${perf.dcl} ms, load ${perf.load} ms, first paint ${JSON.stringify(perf.paint)}, FIRST LIGHT ${firstLight ? firstLight.ms + " ms" : "none"}`);
  console.log("marks", JSON.stringify(perf.marks));
  console.log("slowest requests (end ms, kb, name):");
  for (const r of big) console.log(`  ${String(r.start).padStart(6)} → ${String(r.end).padStart(6)}  ${String(r.kb).padStart(5)} kb  ${r.name.slice(0, 110)}`);
  await cdp.detach();
}
writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 1));
await ctx.close();
rmSync(profile, { recursive: true, force: true });
