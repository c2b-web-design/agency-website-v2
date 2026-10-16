/** THE SPACE IMAGES' PRIORITY, A/B (16 October 2026). Carl: "the planets proiority is changed. As long as it aeeives as it
 *  does mow, that is the goal. how that is achieced is down to you."
 *  THE GOAL, as a test: the planet COMPLETE IN A FRAME BEFORE BEGIN IS PRESSABLE (the fade on Begin then runs over the whole
 *  image, as approved, R-072); the galactic centre complete long before the questions end. THE BENEFIT looked for: the
 *  opening ARMS earlier (it waits on fonts + the page's script, which the images shared the line with).
 *  Cold /start, fresh context per run, cache disabled, 1920 × 952 DPR 1, against a PRODUCTION build (`next start`; the dev
 *  build's script is unminified and far larger — useless for loading). The server's image cache is warmed first, as
 *  production's HIT. Per run: FCP; ARMED (no element still carries `enquiry-opening-held`); BEGIN PRESSABLE (the Begin
 *  button's aria-disabled cleared); the planet and galactic centre each first complete in a frame (rAF poll from before any
 *  page script). Begin is clicked the moment it is pressable; the run then waits 12 s for the galactic centre.
 *  Usage: node …/space-priority-ab-16-october.mjs <label> <baseUrl> [runs per network, default 3]
 *  ⚠ NOT WATCHED: Carl's GPU/Chrome; real phones (emulated throttling on localhost — no real latency or edge); Vercel's
 *  HTTP/2 prioritisation (localhost serves HTTP/1.1); reduced motion. */
import { chromium } from "playwright";

const [LABEL, BASE, RUNS = "3"] = process.argv.slice(2);
const NETS = [
  { name: "unthrottled", cond: null },
  { name: "fast-4g", cond: { offline: false, latency: 60, downloadThroughput: (9 * 1024 * 1024) / 8, uploadThroughput: (1.5 * 1024 * 1024) / 8 } },
  { name: "slow-4g", cond: { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 } },
];
for (const n of ["exoplanet-gj9827d", "galactic-centre"]) await fetch(`${BASE}/_next/image?url=%2Fspace%2F${n}.jpg&w=1920&q=90`);

const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const rows = [];
for (const net of NETS) {
  for (let r = 1; r <= +RUNS; r++) {
    const ctx = await b.newContext({ viewport: { width: 1920, height: 952 }, deviceScaleFactor: 1 });
    await ctx.addInitScript(() => {
      const T = (window.__t = {});
      const tick = () => {
        const now = performance.now();
        document.querySelectorAll(".enquiry-space-layer img").forEach((img) => {
          const k = /exoplanet/.test(decodeURIComponent(img.currentSrc || img.src)) ? "planet" : "galactic";
          if (img.complete && img.naturalWidth > 0 && T[k] === undefined) T[k] = now;
        });
        if (T.armed === undefined && document.querySelector(".enquiry-begin-hit") && !document.querySelector(".enquiry-opening-held")) T.armed = now;
        const btn = document.querySelector(".enquiry-begin-hit");
        if (T.begin === undefined && btn && !btn.hasAttribute("aria-disabled")) T.begin = now;
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    const p = await ctx.newPage();
    const cdp = await ctx.newCDPSession(p);
    await cdp.send("Network.enable");
    await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
    if (net.cond) await cdp.send("Network.emulateNetworkConditions", net.cond);
    const errs = [];
    p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
    await p.goto(BASE + "/start", { waitUntil: "commit", timeout: 120000 });
    await p.waitForFunction(() => window.__t?.begin !== undefined, null, { timeout: 60000, polling: 50 });
    await p.locator(".enquiry-begin-hit").click();
    const clickedAt = await p.evaluate(() => performance.now());
    await p.waitForTimeout(12000);
    const t = await p.evaluate(() => ({ ...window.__t, fcp: performance.getEntriesByName("first-contentful-paint")[0]?.startTime }));
    const R = (v) => (v === undefined ? "never" : Math.round(v));
    rows.push({
      arm: LABEL, net: net.name, run: r, fcp: R(t.fcp), armed: R(t.armed), begin: R(t.begin), planet: R(t.planet),
      "planet before Begin": t.planet !== undefined && t.planet < t.begin ? `✅ ${Math.round(t.begin - t.planet)} ms` : "❌",
      galactic: R(t.galactic), "galactic after click": t.galactic !== undefined ? Math.round(t.galactic - clickedAt) : "never", errors: errs.length,
    });
    await ctx.close();
  }
}
await b.close();
console.table(rows);
console.log("All times ms from navigation. ⚠ NOT WATCHED: Carl's Chrome; real phones (localhost, emulated throttling); Vercel's HTTP/2 prioritisation; reduced motion.");
