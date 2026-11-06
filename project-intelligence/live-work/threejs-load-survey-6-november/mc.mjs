import { chromium } from "file:///C:/Users/Carl%20Buckley/agency-website-v2/node_modules/playwright/index.mjs";
import sharp from "file:///C:/Users/Carl%20Buckley/agency-website-v2/node_modules/sharp/lib/index.js";
const OUT = process.argv[2];
const b = await chromium.launch({ headless: false, args: ["--enable-gpu","--use-angle=default","--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p); await cdp.send("Network.enable");
let bytes = 0; cdp.on("Network.loadingFinished", (e) => (bytes += e.encodedDataLength));
const t0 = Date.now();
await p.goto("https://threejs.org/examples/webgl_marchingcubes.html", { waitUntil: "load" });
await p.waitForFunction(() => [...document.querySelectorAll("canvas")].some((c) => c.width > 300), null, { timeout: 30000 });
const canvasAt = Date.now() - t0;
// first frame actually drawn: poll until the canvas centre is not blank
let shotAt = null; const shots = [];
for (let i = 0; i < 12; i++) {
  const s = await p.screenshot(); shots.push(s);
  if (shotAt === null) shotAt = Date.now() - t0;
  await p.waitForTimeout(250);
}
const fps = await p.evaluate(() => new Promise((r) => { let n = 0; const s = performance.now(); const f = () => { n++; if (performance.now() - s < 2000) requestAnimationFrame(f); else r(n / 2); }; requestAnimationFrame(f); }));
console.log(`marchingcubes: canvas ${canvasAt} ms, first screenshot ${shotAt} ms, ${(bytes / 1048576).toFixed(2)} MB, ~${fps} fps (rAF)`);
const tiles = await Promise.all(shots.map(async (s, i) => ({ input: await sharp(s).resize(480, 270).png().toBuffer(), left: (i % 4) * 480, top: Math.floor(i / 4) * 270 })));
await sharp({ create: { width: 1920, height: 810, channels: 3, background: "#000" } }).composite(tiles).png().toFile(`${OUT}/marchingcubes.png`);
await b.close();
