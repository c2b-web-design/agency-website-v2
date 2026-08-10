// Three phases of the traveller's sweep, captured in ONE page load.
//
// ⚠⚠ CAPTURING PHASES WITH REPEATED `ns-shot.mjs` RUNS DOES NOT WORK, and it
// produced three byte-identical frames on 10 August 2026 before this existed.
// Each run opens a FRESH BROWSER, so `performance.now()` and the animation's
// t0 restart from zero every time — every screenshot lands at the same phase.
// **The sweep was working; the instrument was resetting the clock it meant to
// sample.** One page load, several screenshots.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
mkdirSync("verify/out", { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu","--use-gl=angle","--ignore-gpu-blocklist"] });
const p = await b.newPage({ viewport: { width: 1100, height: 800 }, deviceScaleFactor: 3 });
await p.goto("http://localhost:3000/proto/nextstep?zoom=4", { waitUntil: "networkidle" });
await p.waitForTimeout(2000);
const el = await p.$("#mesh-button > div");
const bb = await el.boundingBox();
const gaps = [0, 3400, 3400];  // t=0, ~3.4s, ~6.8s across the 13.5s pass
for (let i = 0; i < gaps.length; i++) {
  if (gaps[i]) await p.waitForTimeout(gaps[i]);
  await p.screenshot({ path: `verify/out/ns-ph${i}.png`, clip: { x: bb.x, y: bb.y, width: bb.width, height: bb.height } });
  console.log(`ns-ph${i}.png`);
}
await b.close();
