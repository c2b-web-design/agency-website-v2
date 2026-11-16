// THE MAPS WORKER, CHECKED (16 November 2026, session 2; D-101; `hero-maps.worker.ts`). Loads /proto/hero?mapcheck=1 (dev):
// the page builds every map in the worker AND inline and counts the mismatched values (`loadTimes.mapCheckFace`,
// `mapCheckLanded`; 0 = identical). Also prints the load's main-thread steps and any "[hero maps]" console line (a worker
// failure falls back inline: the check would then compare inline with inline). READ-ONLY.
// ⚠ NOT WATCHED: whether the maps equal HEAD's (that is the source diff of the lifted functions); Playwright's Chrome.
import { chromium } from "playwright";
const ARGS = ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"];
const b = await chromium.launch({ channel: "chrome", args: ARGS });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
const logs = [];
p.on("console", (m) => { if (/hero maps|worker/i.test(m.text())) logs.push(`${m.type()}: ${m.text()}`); });
p.on("pageerror", (e) => logs.push(`pageerror: ${e.message}`));
await p.goto("http://localhost:3000/proto/hero?mapcheck=1", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.loadTimes?.mapCheckLanded !== undefined, null, { timeout: 120000, polling: 250 });
const lt = await p.evaluate(() => window.__heroBench.hero.loadTimes);
const info = await p.evaluate(() => ({ flow: window.__heroBench.hero.flow?.check, steam: window.__heroBench.hero.steamInfo }));
console.log("loadTimes:", JSON.stringify(lt));
console.log(`VERDICT: worker vs inline mismatches — face ${lt.mapCheckFace}, landed ${lt.mapCheckLanded} (0 = identical)`);
console.log("flow check:", JSON.stringify(info.flow));
console.log("steam:", JSON.stringify(info.steam)?.slice(0, 400));
console.log("console:", logs.length ? logs.join("\n  ") : "(no [hero maps] line: the worker ran)");
console.log("⚠ NOT WATCHED: equality with HEAD's maps (the source diff covers that); not Carl's Chrome");
await b.close();
