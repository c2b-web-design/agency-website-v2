// Films three.js's webgl_marchingcubes with WALLX on (Carl, 8 November 2026: "It gives the blobs something to bounce off").
import { chromium } from "file:///C:/Users/Carl%20Buckley/agency-website-v2/node_modules/playwright/index.mjs";
const OUT = process.argv[2];
const SECONDS = Number(process.argv[3] ?? 30);
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, recordVideo: { dir: OUT, size: { width: 1920, height: 1080 } } });
const p = await ctx.newPage();
await p.goto("https://threejs.org/examples/webgl_marchingcubes.html", { waitUntil: "load" });
await p.waitForTimeout(1500);
const wall = p.locator(".lil-gui .controller", { hasText: "wallx" }).locator("input");
await wall.check();
console.log("wallx checked:", await wall.isChecked(), " floor:", await p.locator(".lil-gui .controller", { hasText: "floor" }).locator("input").isChecked());
await p.mouse.move(1900, 1060); // pointer out of the way
await p.waitForTimeout(SECONDS * 1000);
const fps = await p.evaluate(() => new Promise((r) => { let n = 0; const s = performance.now(); const f = () => { n++; if (performance.now() - s < 3000) requestAnimationFrame(f); else r(n / 3); }; requestAnimationFrame(f); }));
console.log(`~${fps.toFixed(0)} fps under automation`);
const v = p.video();
await ctx.close(); await b.close();
console.log("video:", await v.path());
