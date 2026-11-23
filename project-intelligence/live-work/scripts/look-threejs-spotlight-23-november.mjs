// A LOOK AT webgpu_lights_spotlight (23 November 2026; Carl added it to his list): 8 stills 1.5 s apart in Chrome, WebGPU on. READ-ONLY. ⚠ NOT WATCHED: motion between stills.
import { chromium } from "playwright";
const OUT = process.argv[2];
const b = await chromium.launch({ channel: "chrome", headless: false, args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await (await b.newContext({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 })).newPage();
const errs = []; p.on("pageerror", (e) => errs.push(String(e))); p.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") errs.push(m.text().slice(0, 200)); });
await p.goto("https://threejs.org/examples/webgpu_lights_spotlight.html", { waitUntil: "networkidle", timeout: 60000 }).catch((e) => console.log("goto", e.message.split("\n")[0]));
await p.waitForTimeout(3000);
for (let i = 0; i < 8; i++) { await p.screenshot({ path: `${OUT}/s${i}.png` }); await p.waitForTimeout(1500); }
const gpu = await p.evaluate(async () => !!navigator.gpu && !!(await navigator.gpu.requestAdapter()));
console.log(`webgpu adapter: ${gpu}; errors/warnings ${errs.length}`, errs.slice(0, 6));
await b.close();
