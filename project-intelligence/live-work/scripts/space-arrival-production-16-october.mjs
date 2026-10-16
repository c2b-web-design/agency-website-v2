/** THE SPACE IMAGES' ARRIVAL ON PRODUCTION (16 October 2026). The handoff's open Builder item: the planet (corridor) and
 *  the galactic centre (client info) were measured on localhost only ("loaded before first paint, ~100 KB each").
 *  COLD loads of /start on the production alias at Carl's screen (1920 × 952, DPR 1), each in a FRESH context (no browser
 *  cache), under three networks: unthrottled, Chrome's "Fast 4G" (9 Mbps / 60 ms) and "Slow 4G" (1.6 Mbps / 150 ms).
 *  Per run: first contentful paint; per image — the URL requested (width, quality), bytes over the wire, Vercel's cache
 *  verdict (x-vercel-cache), when the response ended, and when the <img> first read complete in a frame (rAF poll from
 *  before any page script). A still at the first frame of each throttled run, to show what stands in before the planet.
 *  Usage: node …/space-arrival-production-16-october.mjs <outDir> [runs per network, default 3]
 *  ⚠ NOT WATCHED: Carl's GPU/Chrome; real phones (throttling is emulated, latency is added on top of this line's own);
 *  the edge region Carl is served from may differ from this machine's; the cross-fade (measured 15 Oct on dev). */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [OUT, RUNS = "3"] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const URL = "https://agency-website-v2-awjv.vercel.app/start";
const NETS = [
  { name: "unthrottled", cond: null },
  { name: "fast-4g", cond: { offline: false, latency: 60, downloadThroughput: (9 * 1024 * 1024) / 8, uploadThroughput: (1.5 * 1024 * 1024) / 8 } },
  { name: "slow-4g", cond: { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 } },
];
const IS_SPACE = (u) => /exoplanet-gj9827d|galactic-centre/.test(decodeURIComponent(u));
const label = (u) => (/exoplanet/.test(decodeURIComponent(u)) ? "planet" : "galactic");

const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const rows = [];
for (const net of NETS) {
  for (let r = 1; r <= +RUNS; r++) {
    const ctx = await b.newContext({ viewport: { width: 1920, height: 952 }, deviceScaleFactor: 1 });
    await ctx.addInitScript(() => {
      window.__space = {};
      const tick = () => {
        if (window.__firstFrame === undefined) window.__firstFrame = performance.now();
        document.querySelectorAll(".enquiry-space-layer img").forEach((img) => {
          const k = /exoplanet/.test(decodeURIComponent(img.currentSrc || img.src)) ? "planet" : "galactic";
          if (img.complete && img.naturalWidth > 0 && window.__space[k] === undefined) window.__space[k] = performance.now();
        });
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    const p = await ctx.newPage();
    const cdp = await ctx.newCDPSession(p);
    await cdp.send("Network.enable");
    await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
    if (net.cond) await cdp.send("Network.emulateNetworkConditions", net.cond);
    const headers = {};
    p.on("response", (res) => {
      if (IS_SPACE(res.url())) headers[label(res.url())] = { status: res.status(), cache: res.headers()["x-vercel-cache"] ?? "-", type: res.headers()["content-type"] };
    });
    let still = null;
    if (net.cond && r === 1) {
      // The first frame that has painted anything: poll for FCP, shoot at once.
      p.on("domcontentloaded", async () => {
        for (let i = 0; i < 200 && !still; i++) {
          const fcp = await p.evaluate(() => performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? null).catch(() => null);
          if (fcp !== null) still = await p.screenshot().catch(() => null);
          else await new Promise((res) => setTimeout(res, 25));
        }
      });
    }
    await p.goto(URL, { waitUntil: "load", timeout: 120000 });
    await p.waitForTimeout(net.cond ? 12000 : 5000);
    const m = await p.evaluate(() => {
      const fcp = performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? null;
      const res = performance
        .getEntriesByType("resource")
        .filter((e) => /exoplanet-gj9827d|galactic-centre/.test(decodeURIComponent(e.name)))
        .map((e) => {
          const u = new URL(e.name);
          return {
            k: /exoplanet/.test(decodeURIComponent(e.name)) ? "planet" : "galactic",
            w: u.searchParams.get("w"),
            q: u.searchParams.get("q"),
            kb: Math.round(e.transferSize / 1024),
            start: Math.round(e.startTime),
            end: Math.round(e.responseEnd),
          };
        });
      return { fcp: fcp && Math.round(fcp), firstFrame: Math.round(window.__firstFrame), shown: Object.fromEntries(Object.entries(window.__space).map(([k, v]) => [k, Math.round(v)])), res };
    });
    if (still) writeFileSync(join(OUT, `${net.name}-first-paint.png`), still);
    for (const e of m.res) {
      const h = headers[e.k] ?? {};
      rows.push({ net: net.name, run: r, img: e.k, w: e.w, q: e.q, kb: e.kb, type: h.type, vercel: h.cache, fcp: m.fcp, reqStart: e.start, resEnd: e.end, inFrame: m.shown[e.k] ?? "never", vsFcp: m.shown[e.k] !== undefined && m.fcp ? m.shown[e.k] - m.fcp : "-" });
    }
    await ctx.close();
  }
}
await b.close();
console.table(rows);
writeFileSync(join(OUT, "rows.json"), JSON.stringify(rows, null, 2));
console.log("vsFcp = ms from first contentful paint to the image first complete in a frame (≤ 0: there at first paint).");
console.log("⚠ NOT WATCHED: Carl's GPU/Chrome; real phones (emulated throttling on top of this line); Carl's edge region; the cross-fade. →", OUT);
