import { chromium } from "file:///C:/Users/Carl%20Buckley/agency-website-v2/node_modules/playwright/index.mjs";
import sharp from "file:///C:/Users/Carl%20Buckley/agency-website-v2/node_modules/sharp/lib/index.js";
const OUT = process.argv[2];
const b = await chromium.launch({ headless: false, args: ["--enable-gpu","--use-angle=default","--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto("https://threejs.org/examples/webgl_effects_parallaxbarrier.html", { waitUntil: "load" });
await p.waitForTimeout(1500);
const shots = [];
const path = [[960,540],[300,300],[300,800],[1600,800],[1600,250],[960,100],[960,1000],[200,540],[1700,540],[960,540],[600,700],[1300,350]];
for (const [x, y] of path) { await p.mouse.move(x, y, { steps: 12 }); await p.waitForTimeout(700); shots.push(await p.screenshot()); }
await sharp(shots[3]).extract({ left: 760, top: 340, width: 400, height: 400 }).png().toFile(`${OUT}/parallaxbarrier-crop.png`);
const tiles = await Promise.all(shots.map(async (s, i) => ({ input: await sharp(s).resize(480, 270).png().toBuffer(), left: (i % 4) * 480, top: Math.floor(i / 4) * 270 })));
await sharp({ create: { width: 1920, height: 810, channels: 3, background: "#000" } }).composite(tiles).png().toFile(`${OUT}/parallaxbarrier.png`);
await b.close();
