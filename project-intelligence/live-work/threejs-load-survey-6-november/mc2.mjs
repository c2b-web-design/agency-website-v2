import { chromium } from "file:///C:/Users/Carl%20Buckley/agency-website-v2/node_modules/playwright/index.mjs";
import sharp from "file:///C:/Users/Carl%20Buckley/agency-website-v2/node_modules/sharp/lib/index.js";
const OUT = process.argv[2];
const b = await chromium.launch({ headless: false, args: ["--enable-gpu","--use-angle=default","--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto("https://threejs.org/examples/webgl_marchingcubes.html", { waitUntil: "load" });
await p.waitForTimeout(2000);
const tile = async (s, label) => { const svg = Buffer.from(`<svg width="480" height="270"><rect width="150" height="28" fill="#000"/><text x="6" y="20" font-size="18" fill="#ff0" font-family="Arial">${label}</text></svg>`); return sharp(s).resize(480, 270).composite([{ input: svg }]).png().toBuffer(); };
const mats = ["shiny","chrome","liquid","matte","flat","textured","colors","multiColors","plastic","toon1","toon2","hatching","dotted"];
const tiles = [];
for (const m of mats) {
  await p.locator(".lil-gui button", { hasText: new RegExp(`^${m}$`) }).first().click();
  await p.waitForTimeout(900);
  tiles.push(await tile(await p.screenshot(), m));
}
await p.locator(".lil-gui button", { hasText: /^shiny$/ }).first().click();
// walls on
for (const w of ["wallx", "wallz"]) await p.locator(".lil-gui .controller", { hasText: w }).locator("input").check();
await p.waitForTimeout(900); tiles.push(await tile(await p.screenshot(), "shiny + walls"));
for (const w of ["wallx", "wallz"]) await p.locator(".lil-gui .controller", { hasText: w }).locator("input").uncheck();
// orbit: drag low, looking across the floor
await p.mouse.move(960, 540); await p.mouse.down(); await p.mouse.move(960, 380, { steps: 20 }); await p.mouse.up();
await p.waitForTimeout(900); tiles.push(await tile(await p.screenshot(), "orbit low"));
// liquid detail full-size
await p.locator(".lil-gui button", { hasText: /^liquid$/ }).first().click(); await p.waitForTimeout(900);
await sharp(await p.screenshot()).extract({ left: 460, top: 140, width: 1000, height: 800 }).png().toFile(`${OUT}/mc-liquid-full.png`);
await p.locator(".lil-gui button", { hasText: /^shiny$/ }).first().click(); await p.waitForTimeout(900);
await sharp(await p.screenshot()).extract({ left: 460, top: 140, width: 1000, height: 800 }).png().toFile(`${OUT}/mc-shiny-full.png`);
const comp = tiles.map((input, i) => ({ input, left: (i % 5) * 480, top: Math.floor(i / 5) * 270 }));
await sharp({ create: { width: 2400, height: 810, channels: 3, background: "#000" } }).composite(comp).png().toFile(`${OUT}/mc-materials.png`);
await b.close();
