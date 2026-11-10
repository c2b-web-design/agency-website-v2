// ⛔ THE LIQUID's EMERGENCE FROM THE LANDED LOGO — FRAME-STEPPED STILLS (10 November 2026, session 2; D-101). Needs the dev
// server and `?blank=1`'s dev hooks (`__liquid`, `__heroJump`). argv: OUT dir, [debug value for the field, e.g. 2 = rays
// that ran out of steps shown green]. Freezes the jump's clock at times since TOUCHDOWN and screenshots the bench; prints
// `__liquid.stats` (the regions' volumes and strengths) and console errors.
// ⚠ NOT WATCHED (printed): motion between the stills (Carl's eye on the running bench); the mass while it moves (not
// measured — step 4); other camera angles; the WebGL 2 fallback; phones.
import { chromium } from "file:///C:/Users/Carl Buckley/agency-website-v2/node_modules/playwright/index.mjs";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const OUT = process.argv[2];
const DEBUG = Number(process.argv[3] ?? 0);
const TIMES = (process.argv[4] ?? "-0.05,0,0.05,0.1,0.15,0.2,0.25,0.3,0.35,0.4,0.5,0.6,1").split(",").map(Number);
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1909, height: 934 }, deviceScaleFactor: 1 });
const errs = [];
p.on("console", (m) => m.type() === "error" && errs.push(m.text().slice(0, 300)));
p.on("pageerror", (e) => errs.push("pageerror: " + e.message.slice(0, 300)));
const t0 = Date.now();
await p.goto("http://localhost:3000/proto/camera?blank=1", { waitUntil: "load" });
await p.waitForSelector('[data-camera-bench="drawn"]', { timeout: 180000 });
await p.waitForFunction(() => !!window.__liquid?.stats && !!window.__liquid?.material, null, { timeout: 60000 });
console.log("ready after", ((Date.now() - t0) / 1000).toFixed(1), "s");
const backend = await p.evaluate(() => document.querySelector("[data-camera-bench]").dataset.mediumBackend);
console.log("backend", backend);
console.log("stats", JSON.stringify(await p.evaluate(() => window.__liquid.stats)));
const box = await p.evaluate(() => { const r = document.querySelector("canvas").getBoundingClientRect(); return { x: Math.ceil(r.x) + 2, y: Math.ceil(r.y) + 2, width: Math.floor(r.width) - 4, height: Math.floor(r.height) - 4 }; });
await p.evaluate((d) => window.__liquid.debug(d), DEBUG);
// the first show of the field compiles its shader: time it (one frame past touchdown)
const c0 = Date.now();
await p.evaluate(() => window.__liquid.at(0.01));
await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
console.log("first field frames after", ((Date.now() - c0) / 1000).toFixed(2), "s (includes the compile)");
for (const t of TIMES) {
  await p.evaluate((t) => window.__liquid.at(t), t);
  await p.waitForTimeout(1200);
  writeFileSync(join(OUT, `te_${t.toFixed(2)}.png`), await p.screenshot({ clip: box }));
}
console.log("errors", errs.length, JSON.stringify(errs.slice(0, 5)));
console.log("⚠ NOT WATCHED: motion between stills; the mass while moving (step 4); other angles; the WebGL 2 fallback; phones");
await b.close();
