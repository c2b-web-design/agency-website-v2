// THE ARRIVAL's NUMBERS, read from the scene (18 November 2026): the hold, the flight, touchdown, the wobble's end
// (`hero.arrival`, printed from `arrivalPlan`, not typed). READ-ONLY.
import { chromium } from "playwright";
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.arrival, null, { timeout: 120000 });
console.log(JSON.stringify(await p.evaluate(() => window.__heroBench.hero.arrival)));
await b.close();
