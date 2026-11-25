// THE PLINTH, TAKE (25 November 2026): the story run to phase 4 at HOME; stills as it appears and settled; the logo's and
// the text's tops on screen; the frame gaps across its appearance. READ-ONLY. Output: argv[2] (a folder).
// ⚠ NOT WATCHED: any camera but HOME; Carl's Chrome (this is Playwright's Chrome, the same GPU); the loop.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const out = process.argv[2];
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1896, height: 946 }, deviceScaleFactor: 1 });
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForFunction(() => window.__heroBench?.hero?.warmed === true, null, { timeout: 300000 });
// frame gaps from now on
await p.evaluate(() => { window.__gaps = []; let last = performance.now(); const f = (t) => { window.__gaps.push([t, t - last]); last = t; requestAnimationFrame(f); }; requestAnimationFrame(f); });
await p.waitForFunction(() => window.__heroBench.hero.marble.info.plinthCm.risen > 0, null, { timeout: 300000, polling: 16 });
const t0 = await p.evaluate(() => performance.now());
await p.screenshot({ path: `${out}/01_appears.png` });
await p.waitForTimeout(4000);
await p.screenshot({ path: `${out}/02_settled-4s.png` });
const r = await p.evaluate((t0) => {
  const { hero, camera } = window.__heroBench;
  const V = camera.position.constructor;
  const B = (obj) => { const pa = obj.geometry.getAttribute("position"); let hi = -Infinity; const v = new V(); obj.updateMatrixWorld(true); for (let i = 0; i < pa.count; i++) hi = Math.max(hi, v.fromBufferAttribute(pa, i).applyMatrix4(obj.matrixWorld).y); return hi; };
  const textTop = Math.max(...hero.text.children.map(B));
  hero.logo.updateMatrixWorld(true);
  const logoTop = B(hero.logo);
  const py = (y) => Math.round((1 - new V(0, y, 0).project(camera).y) * 473);
  const gaps = window.__gaps.filter(([t]) => t > t0 - 1500 && t < t0 + 3000).map(([, d]) => d);
  const all = window.__gaps.map(([, d]) => d).slice(-200);
  return { plinth: hero.marble.info.plinthCm, upc: hero.unitsPerCm, topsCm: { text: textTop / hero.unitsPerCm, logo: logoTop / hero.unitsPerCm }, topsPxAtHome: { text: py(textTop), logo: py(logoTop) }, aroundAppear: { frames: gaps.length, maxMs: Math.round(Math.max(...gaps)), over20: gaps.filter((d) => d > 20).map(Math.round) }, last200: { meanMs: Math.round(all.reduce((a, c) => a + c, 0) / all.length * 10) / 10, maxMs: Math.round(Math.max(...all)) }, camera: camera.position.toArray().map(Math.round) };
}, t0);
console.log(JSON.stringify(r, null, 1));
await b.close();
