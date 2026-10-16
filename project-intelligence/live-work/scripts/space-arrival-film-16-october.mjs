/** THE SPACE IMAGES ARRIVING ON PRODUCTION, FILMED (16 October 2026): a cold /start under emulated "slow" (1.6 Mbps / 150 ms)
 *  or "fast" (9 Mbps / 60 ms) 4G; a still every ~250 ms for 12 s, named by ms since navigation, and every resource with its
 *  bytes, start and end. Usage: node …/space-arrival-film-16-october.mjs <outDir> [slow|fast]
 *  ⚠ NOT WATCHED: Carl's GPU/Chrome; real phones; Carl's edge region. Stills are as fast as Playwright gives. */
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
const OUT = process.argv[2];
const NET = process.argv[3] || "slow";
const cond = NET === "slow" ? { offline: false, latency: 150, downloadThroughput: (1.6*1024*1024)/8, uploadThroughput: (750*1024)/8 } : { offline: false, latency: 60, downloadThroughput: (9*1024*1024)/8, uploadThroughput: (1.5*1024*1024)/8 };
const b = await chromium.launch({ headless: false, args: ["--enable-gpu","--use-angle=default","--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1920, height: 952 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const cdp = await ctx.newCDPSession(p);
await cdp.send("Network.enable"); await cdp.send("Network.setCacheDisabled",{cacheDisabled:true});
await cdp.send("Network.emulateNetworkConditions", cond);
const t0 = Date.now(); const shots = [];
let go = true;
const film = (async () => { while (go) { const s = await p.screenshot().catch(()=>null); if (s) shots.push({ t: Date.now()-t0, s }); await new Promise(r=>setTimeout(r,250)); } })();
await p.goto("https://agency-website-v2-awjv.vercel.app/start", { waitUntil: "commit" });
await p.waitForTimeout(12000); go = false; await film;
const res = await p.evaluate(() => ({ nav: Math.round(performance.timeOrigin), fcp: Math.round(performance.getEntriesByName("first-contentful-paint")[0]?.startTime), r: performance.getEntriesByType("resource").map(e => ({ n: decodeURIComponent(e.name).replace(location.origin,"").slice(0,90), kb: Math.round(e.transferSize/1024), s: Math.round(e.startTime), e: Math.round(e.responseEnd), pr: e.renderBlockingStatus })) }));
console.log("FCP", res.fcp); console.table(res.r.sort((a,b)=>a.s-b.s));
shots.forEach((x,i)=>writeFileSync(`${OUT}/${String(i).padStart(3,"0")}-${x.t}ms.png`, x.s));
await b.close();
