import { chromium } from "file:///C:/Users/Carl%20Buckley/agency-website-v2/node_modules/playwright/index.mjs";
const OUT = process.argv[2];
const b = await chromium.launch({ headless: false, args: ["--enable-gpu","--use-angle=default","--ignore-gpu-blocklist","--enable-unsafe-webgpu"] });
const ctx = await b.newContext({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1, recordVideo: { dir: OUT, size: { width: 1600, height: 900 } } });
const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p); await cdp.send("Network.enable");
let bytes = 0; cdp.on("Network.loadingFinished", (e) => (bytes += e.encodedDataLength));
const t0 = Date.now();
await p.goto("https://threejs.org/examples/webgpu_tsl_vfx_linkedparticles.html", { waitUntil: "load" });
await p.waitForFunction(() => [...document.querySelectorAll("canvas")].some((c) => c.width > 300), null, { timeout: 30000 });
console.log(`loaded ${Date.now() - t0} ms, ${(bytes / 1048576).toFixed(2)} MB`);
await p.waitForTimeout(1500);
// the pointer: a slow figure-of-eight, then a fast sweep, then still
const cx = 750, cy = 450;
for (let k = 0; k < 240; k++) { const a = (k / 240) * Math.PI * 4; await p.mouse.move(cx + 450 * Math.sin(a), cy + 220 * Math.sin(2 * a)); await p.waitForTimeout(25); }
for (let k = 0; k < 60; k++) { await p.mouse.move(150 + k * 20, 150 + k * 10); await p.waitForTimeout(16); }
await p.waitForTimeout(3000);
const fps = await p.evaluate(() => new Promise((r) => { let n = 0; const s = performance.now(); const f = () => { n++; if (performance.now() - s < 3000) requestAnimationFrame(f); else r(n / 3); }; requestAnimationFrame(f); }));
console.log(`~${fps.toFixed(0)} fps (pointer still)`);
await ctx.close(); await b.close();
