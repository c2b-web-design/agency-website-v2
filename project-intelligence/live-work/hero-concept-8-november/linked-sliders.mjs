// Films three.js's webgpu_tsl_vfx_linkedparticles with every slider played and the pointer drawing between them
// (Carl, 8 November 2026: "i want to take from it the principle, the look. i dont want connected lines ... use the sliders").
import { chromium } from "file:///C:/Users/Carl%20Buckley/agency-website-v2/node_modules/playwright/index.mjs";
const OUT = process.argv[2];
const RECORD = process.argv[3] !== "norec";
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, ...(RECORD ? { recordVideo: { dir: OUT, size: { width: 1920, height: 1080 } } } : {}) });
const p = await ctx.newPage();
await p.goto("https://threejs.org/examples/webgpu_tsl_vfx_linkedparticles.html", { waitUntil: "load" });
await p.waitForFunction(() => document.querySelectorAll('input[type="range"]').length > 0, null, { timeout: 60000 });
await p.waitForTimeout(2000);
const ranges = await p.evaluate(() => [...document.querySelectorAll('input[type="range"]')].filter((e) => e.getBoundingClientRect().width > 0).map((e) => {
  const r = e.getBoundingClientRect();
  let row = e.parentElement; while (row && row.textContent.trim().length < 2) row = row.parentElement;
  return { label: row.textContent.trim().replace(/[\d.\-]+$/, "").trim().slice(0, 30), min: +e.min, max: +e.max, value: +e.value, x: r.x, y: r.y, w: r.width, h: r.height };
}));
console.log(ranges.map((r) => `${r.label}: ${r.min}–${r.max} =${r.value}`).join("\n"));
async function drag(r, to, ms) {
  const pad = 6, x = (v) => r.x + pad + ((v - r.min) / (r.max - r.min)) * (r.w - 2 * pad), y = r.y + r.h / 2;
  await p.mouse.move(x(r.value), y, { steps: 8 }); await p.mouse.down();
  const n = Math.max(8, Math.round(ms / 25));
  for (let k = 1; k <= n; k++) { await p.mouse.move(x(r.value) + ((x(to) - x(r.value)) * k) / n, y); await p.waitForTimeout(25); }
  await p.mouse.up(); r.value = to;
}
// the pointer draws a slow figure-of-eight in the scene (the particles are born where it is)
async function swirl(ms) { const n = Math.round(ms / 30); for (let k = 0; k < n; k++) { const a = (k / n) * Math.PI * 2; await p.mouse.move(800 + 380 * Math.sin(a), 540 + 200 * Math.sin(2 * a)); await p.waitForTimeout(30); } }
await swirl(5000);
for (const r of ranges) {
  const start = r.value;
  console.log("playing", r.label);
  await drag(r, r.max, 1500); await swirl(3500);
  await drag(r, r.min, 1500); await swirl(3500);
  await drag(r, start, 800); await swirl(1200);
}
// last: NO LINES — links width to 0, the particles alone
const links = ranges.find((r) => /link/i.test(r.label));
if (links) { await drag(links, links.min, 1200); console.log("links width ->", links.min); await swirl(10000); }
const v = RECORD ? p.video() : null;
await ctx.close(); await b.close();
if (v) console.log("video:", await v.path());
