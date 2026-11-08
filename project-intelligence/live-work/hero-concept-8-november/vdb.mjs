// Films and times three.js webgl_loader_vdb (Carl, 8 November 2026: "This may be lighter and better").
import { chromium } from "file:///C:/Users/Carl%20Buckley/agency-website-v2/node_modules/playwright/index.mjs";
const OUT = process.argv[2];
const RECORD = process.argv[3] !== "norec";
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, ...(RECORD ? { recordVideo: { dir: OUT, size: { width: 1920, height: 1080 } } } : {}) });
const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p); await cdp.send("Network.enable");
let bytes = 0; cdp.on("Network.loadingFinished", (e) => (bytes += e.encodedDataLength));
await p.mouse.move(1900, 1060); // OrbitControls autoRotate: the pointer out of the way
const t0 = Date.now();
await p.goto("https://threejs.org/examples/webgl_loader_vdb.html", { waitUntil: "load" });
// first frame = the canvas's centre is no longer blank
const firstFrame = await p.waitForFunction(() => !!document.querySelector(".lil-gui") && [...document.querySelectorAll("canvas")].some((c) => c.width > 300), null, { timeout: 60000 }).then(() => Date.now() - t0);
await p.waitForTimeout(6000);
console.log(`canvas ${firstFrame} ms; ${(bytes / 1048576).toFixed(2)} MB by +6 s`);
const fps = async (label) => console.log(label, (await p.evaluate(() => new Promise((r) => { let n = 0; const s = performance.now(); const f = () => { n++; if (performance.now() - s < 3000) requestAnimationFrame(f); else r(n / 3); }; requestAnimationFrame(f); }))).toFixed(0), "fps");
await fps("held still:");
// a slow look around: pointer drifts right, then left, then back to centre
await p.waitForTimeout(6000);

await p.waitForTimeout(4000);
await fps("after 10 s more:");
const v = RECORD ? p.video() : null;
await ctx.close(); await b.close();
if (v) console.log("video:", await v.path());
