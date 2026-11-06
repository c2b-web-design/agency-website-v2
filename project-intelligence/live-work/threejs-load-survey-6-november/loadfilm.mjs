import { chromium } from "file:///C:/Users/Carl%20Buckley/agency-website-v2/node_modules/playwright/index.mjs";
import sharp from "file:///C:/Users/Carl%20Buckley/agency-website-v2/node_modules/sharp/lib/index.js";
const OUT = process.argv[2];
const SITES = [
  ["slop-newyork","https://mrdoob.github.io/slop-newyork/"],
  ["rainyworlds","https://rainyworlds.com/"],
  ["basement","https://basement.studio/"],
  ["igloo","http://igloo.inc/"],
  ["utsubo","http://utsubo.com/"],
  ["locomotive","http://locomotive.ca/"],
  ["junni","https://junni.co.jp/"],
  ["bruno-simon","https://bruno-simon.com/"],
  ["messenger","https://messenger.abeto.co/"],
  ["hublot","https://hublot.darkroom.engineering/"],
  ["lempens","https://sebastien-lempens.com/"],
  ["ex-keyframes","https://threejs.org/examples/webgl_animation_keyframes.html"],
  ["ex-shadowmap","https://threejs.org/examples/webgl_shadowmap.html"],
  ["ex-instancing","https://threejs.org/examples/webgl_instancing_performance.html"],
];
const TIMES = [250, 500, 1000, 2000, 3000, 5000, 8000, 12000];
const b = await chromium.launch({ headless: false, args: ["--enable-gpu","--use-angle=default","--ignore-gpu-blocklist","--enable-unsafe-webgpu"] });
for (const [name, url] of SITES) {
  const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  await cdp.send("Network.enable");
  let bytes = 0; const at = []; const t0 = Date.now();
  cdp.on("Network.loadingFinished", (e) => { bytes += e.encodedDataLength; at.push([Date.now() - t0, bytes]); });
  const shots = []; let canvasAt = null, dcl = null, load = null;
  p.on("domcontentloaded", () => (dcl = Date.now() - t0));
  p.on("load", () => (load = Date.now() - t0));
  p.goto(url, { timeout: 30000 }).catch((e) => console.log(name, "goto:", String(e).slice(0, 80)));
  for (const t of TIMES) {
    const wait = t0 + t - Date.now(); if (wait > 0) await p.waitForTimeout(wait);
    try {
      if (canvasAt === null && (await p.evaluate(() => [...document.querySelectorAll("canvas")].some((c) => c.width > 300 && c.height > 200)).catch(() => false))) canvasAt = Date.now() - t0;
      shots.push(await p.screenshot({ timeout: 4000 }));
    } catch { shots.push(null); }
  }
  const mb = (n) => (n / 1048576).toFixed(1);
  const by = (ms) => mb((at.filter(([t]) => t <= ms).pop() || [0, 0])[1]);
  console.log(`${name.padEnd(14)} DCL ${dcl ?? "—"} ms, load ${load ?? "—"} ms, big canvas by ${canvasAt ?? "—"} ms; MB by 1s ${by(1000)}, 3s ${by(3000)}, 12s ${mb(bytes)}`);
  const tiles = await Promise.all(shots.map(async (s, i) => {
    const base = s ? sharp(s).resize(480, 270) : sharp({ create: { width: 480, height: 270, channels: 3, background: "#400" } });
    const label = Buffer.from(`<svg width="480" height="270"><rect x="0" y="0" width="90" height="30" fill="#000"/><text x="8" y="22" font-size="20" fill="#ff0" font-family="Arial">${TIMES[i] / 1000}s</text></svg>`);
    return { input: await base.composite([{ input: label }]).png().toBuffer(), left: (i % 4) * 480, top: Math.floor(i / 4) * 270 };
  }));
  await sharp({ create: { width: 1920, height: 540, channels: 3, background: "#000" } }).composite(tiles).png().toFile(`${OUT}/${name}.png`);
  await ctx.close();
}
await b.close();
