// Films and times three.js's webgpu_compute_cloth with its controls played (Carl, 8 November 2026: "Our logo is wet now").
import { chromium } from "file:///C:/Users/Carl%20Buckley/agency-website-v2/node_modules/playwright/index.mjs";
const OUT = process.argv[2];
const RECORD = process.argv[3] !== "norec";
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, ...(RECORD ? { recordVideo: { dir: OUT, size: { width: 1920, height: 1080 } } } : {}) });
const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p); await cdp.send("Network.enable");
let bytes = 0; cdp.on("Network.loadingFinished", (e) => (bytes += e.encodedDataLength));
await p.mouse.move(1900, 1060);
const t0 = Date.now();
await p.goto("https://threejs.org/examples/webgpu_compute_cloth.html", { waitUntil: "load" });
await p.waitForFunction(() => document.querySelectorAll('input[type="range"]').length > 0, null, { timeout: 60000 });
console.log(`controls up ${Date.now() - t0} ms`);
await p.waitForTimeout(4000);
console.log(`${(bytes / 1048576).toFixed(2)} MB by +4 s`);
const fps = async (label) => console.log(label, (await p.evaluate(() => new Promise((r) => { let n = 0; const s = performance.now(); const f = () => { n++; if (performance.now() - s < 3000) requestAnimationFrame(f); else r(n / 3); }; requestAnimationFrame(f); }))).toFixed(0), "fps");
await fps("default:");
const rows = await p.evaluate(() => [...document.querySelectorAll('input')].filter((e) => e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().x > 1400).map((e) => { const r = e.getBoundingClientRect(); return { type: e.type, min: e.min, max: e.max, value: e.value, x: r.x, y: r.y, w: r.width, h: r.height }; }));
console.log(rows.map((r) => `${r.type} ${r.min}-${r.max} =${r.value} @${Math.round(r.x)},${Math.round(r.y)}`).join("\n"));
const ranges = rows.filter((r) => r.type === "range"), checks = rows.filter((r) => r.type === "checkbox");
async function drag(r, to, ms) {
  const pad = 6, x = (v) => r.x + pad + ((v - Number(r.min)) / (Number(r.max) - Number(r.min))) * (r.w - 2 * pad), y = r.y + r.h / 2;
  const from = Number(r.value);
  await p.mouse.move(x(from), y, { steps: 10 }); await p.mouse.down();
  const n = Math.max(10, Math.round(ms / 25));
  for (let k = 1; k <= n; k++) { await p.mouse.move(x(from) + ((x(to) - x(from)) * k) / n, y); await p.waitForTimeout(25); }
  await p.mouse.up(); r.value = String(to);
}
const click = async (c) => { await p.mouse.move(c.x + c.w / 2, c.y + c.h / 2, { steps: 10 }); await p.mouse.click(c.x + c.w / 2, c.y + c.h / 2); };
const [stiff, wind] = ranges; const [wire, sphere] = checks;
await p.waitForTimeout(3000);
await drag(wind, 5, 4000); await p.waitForTimeout(5000);        // wind up to 5
await fps("wind 5:");
await drag(wind, 0, 3000); await p.waitForTimeout(5000);        // no wind: it hangs
await drag(wind, 1, 1500);
await drag(stiff, 0.5, 2500); await p.waitForTimeout(4000);     // stiffer
await drag(stiff, 0.1, 3000); await p.waitForTimeout(4000);     // looser
await drag(stiff, 0.2, 1500);
if (wire) { await click(wire); await p.waitForTimeout(5000); await click(wire); } // the springs and points
if (sphere) { await click(sphere); await p.waitForTimeout(4000); await click(sphere); } // the sphere off and on
await p.mouse.move(1900, 1060, { steps: 10 }); await p.waitForTimeout(4000);
const v = RECORD ? p.video() : null;
await ctx.close(); await b.close();
if (v) console.log("video:", await v.path());
