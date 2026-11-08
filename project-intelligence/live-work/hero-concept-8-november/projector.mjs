// Films and times three.js's webgpu_lights_projector with its controls played (Carl, 8 November 2026: "We need a floor").
import { chromium } from "file:///C:/Users/Carl%20Buckley/agency-website-v2/node_modules/playwright/index.mjs";
const OUT = process.argv[2];
const RECORD = process.argv[3] !== "norec";
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu", "--autoplay-policy=no-user-gesture-required"] });
const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, ...(RECORD ? { recordVideo: { dir: OUT, size: { width: 1920, height: 1080 } } } : {}) });
const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p); await cdp.send("Network.enable");
const sizes = {}; let bytes = 0;
cdp.on("Network.responseReceived", (e) => (sizes[e.requestId] = e.response.url));
cdp.on("Network.loadingFinished", (e) => { bytes += e.encodedDataLength; if (/\.(ply|mp4|webm|png|jpg)/.test(sizes[e.requestId] ?? "")) console.log(`  ${(e.encodedDataLength / 1048576).toFixed(2)} MB ${sizes[e.requestId].split("/").pop()}`); });
await p.mouse.move(1900, 1060);
const t0 = Date.now();
await p.goto("https://threejs.org/examples/webgpu_lights_projector.html", { waitUntil: "load" });
await p.waitForFunction(() => document.querySelectorAll('input[type="range"]').length > 0, null, { timeout: 60000 });
console.log(`controls up ${Date.now() - t0} ms`);
await p.waitForTimeout(5000);
console.log(`${(bytes / 1048576).toFixed(2)} MB by +5 s`);
const fps = async (label) => console.log(label, (await p.evaluate(() => new Promise((r) => { let n = 0; const s = performance.now(); const f = () => { n++; if (performance.now() - s < 3000) requestAnimationFrame(f); else r(n / 3); }; requestAnimationFrame(f); }))).toFixed(0), "fps");
await fps("procedural:");
const ranges = await p.evaluate(() => [...document.querySelectorAll('input[type="range"]')].filter((e) => e.getBoundingClientRect().width > 0).map((e) => { const r = e.getBoundingClientRect(); return { min: e.min, max: e.max, value: e.value, x: r.x, y: r.y, w: r.width, h: r.height }; }));
console.log(ranges.map((r) => `${r.min}-${r.max} =${r.value}`).join(" | "));
async function drag(r, to, ms) {
  const pad = 6, x = (v) => r.x + pad + ((v - Number(r.min)) / (Number(r.max) - Number(r.min))) * (r.w - 2 * pad), y = r.y + r.h / 2;
  const from = Number(r.value);
  await p.mouse.move(x(from), y, { steps: 10 }); await p.mouse.down();
  const n = Math.max(10, Math.round(ms / 25));
  for (let k = 1; k <= n; k++) { await p.mouse.move(x(from) + ((x(to) - x(from)) * k) / n, y); await p.waitForTimeout(25); }
  await p.mouse.up(); r.value = String(to);
}
const [intensity, distance, angle, penumbra, decay, focus] = ranges;
const sel = p.locator("select").filter({ has: p.locator('option[value="procedural"]') }).first();
await p.waitForTimeout(3000);
await drag(intensity, 300, 3000); await p.waitForTimeout(2500); await drag(intensity, 100, 2000);
await drag(angle, 1.0, 3000); await p.waitForTimeout(2500);       // a wider pool
await drag(angle, 0.3, 3000); await p.waitForTimeout(2500);       // a tight one
await drag(angle, Math.PI / 6, 1500);
await drag(penumbra, 0, 2500); await p.waitForTimeout(2500);      // a hard edge
await drag(penumbra, 1, 2500);
await drag(focus, 0.2, 2500); await p.waitForTimeout(2500); await drag(focus, 1, 2000); // the shadow's softness
if (await sel.count()) {
  await sel.selectOption("video"); await p.waitForTimeout(7000); await fps("video:");
  await sel.selectOption("texture"); await p.waitForTimeout(5000);
  await sel.selectOption("procedural"); await p.waitForTimeout(4000);
} else console.log("type selector not found");
// orbit down to the floor, low, looking across it
await p.mouse.move(960, 600); await p.mouse.down(); await p.mouse.move(760, 520, { steps: 60 }); await p.mouse.up();
await p.mouse.move(1900, 1060, { steps: 10 }); await p.waitForTimeout(5000);
const v = RECORD ? p.video() : null;
await ctx.close(); await b.close();
if (v) console.log("video:", await v.path());
