// Films and times three.js's webgpu_custom_fog (Carl, 8 November 2026: "could double for steam. it may be compute heavy").
import { chromium } from "file:///C:/Users/Carl%20Buckley/agency-website-v2/node_modules/playwright/index.mjs";
const OUT = process.argv[2];
const RECORD = process.argv[3] !== "norec";
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, ...(RECORD ? { recordVideo: { dir: OUT, size: { width: 1920, height: 1080 } } } : {}) });
const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p); await cdp.send("Network.enable");
let bytes = 0; cdp.on("Network.loadingFinished", (e) => (bytes += e.encodedDataLength));
await p.mouse.move(960, 540); // FirstPersonControls steer toward the pointer: centre = hold still
const t0 = Date.now();
await p.goto("https://threejs.org/examples/webgpu_custom_fog.html", { waitUntil: "load" });
// first frame = the canvas's centre is no longer blank
const firstFrame = await p.waitForFunction(() => { const c = [...document.querySelectorAll("canvas")].find((c) => c.width > 300); return !!c; }, null, { timeout: 60000 }).then(() => Date.now() - t0);
await p.waitForTimeout(6000);
console.log(`canvas ${firstFrame} ms; ${(bytes / 1048576).toFixed(2)} MB by +6 s`);
const fps = async (label) => console.log(label, (await p.evaluate(() => new Promise((r) => { let n = 0; const s = performance.now(); const f = () => { n++; if (performance.now() - s < 3000) requestAnimationFrame(f); else r(n / 3); }; requestAnimationFrame(f); }))).toFixed(0), "fps");
await fps("held still:");
// a slow look around: pointer drifts right, then left, then back to centre
for (let k = 0; k <= 120; k++) { await p.mouse.move(960 + 300 * Math.sin((k / 120) * Math.PI * 2), 540 + 60 * Math.sin((k / 120) * Math.PI * 4)); await p.waitForTimeout(50); }
await p.mouse.move(960, 540, { steps: 10 });
await p.waitForTimeout(4000);
await fps("after the look:");
const v = RECORD ? p.video() : null;
await ctx.close(); await b.close();
if (v) console.log("video:", await v.path());
