/** THE ROLLOUT, VERIFIED ON THE RUNNING HOME PAGE (D-088, 12 October 2026 — the structural note's promises).
 *  1 WebGL contexts created on the home page (counted by wrapping getContext before any script runs) — expect 1.
 *  2 the extruded letters drawn (the link's data-drawn = 1) and the CSS fallback dropped.
 *  3 the link's accessible name is "Who we are" (what a screen reader reads).
 *  4 the focus ring, by keyboard (a still). 5 with NO WebGL: the fallback stays (a still). 6 ?lighthelpers=1 (a still).
 *  Stills to the film folder's `06 On the page`. ⚠ NOT WATCHED: other browsers; mobile; Carl's Chrome; the bundle split. */
import { chromium } from "playwright";
import { appendFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
const FILM = join(homedir(), "Videos", "C2B Films", "01 Who we are button"), BIN = "06 On the page";
const pad = (n) => String(n).padStart(2, "0"), d = new Date();
const stamp = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
const log = (f, note) => appendFileSync(join(FILM, "shot-list.md"), `| ${d.toISOString().slice(0, 16).replace("T", " ")} | ${BIN}/${f} | page | ${note} | - |\n`);
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
async function open(q = "", noWebGL = false) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await ctx.addInitScript((off) => {
    window.__ctx = 0;
    const orig = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
      if (/webgl/.test(type)) { if (off) return null; const c = orig.call(this, type, ...rest); if (c && !this.__counted) { this.__counted = true; window.__ctx++; } return c; }
      return orig.call(this, type, ...rest);
    };
  }, noWebGL);
  const p = await ctx.newPage();
  await p.goto("http://localhost:3000/" + q, { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready);
  await p.evaluate(() => document.querySelector("#contact").scrollIntoView({ block: "start" }));
  await p.evaluate(() => { document.querySelectorAll("nextjs-portal").forEach((e) => e.remove()); });
  await p.waitForTimeout(3000);
  return p;
}
const clipOf = async (p, padX = 80, padY = 50) => { const r = await p.evaluate(() => { const e = document.querySelector('#contact a[href="/about"]').getBoundingClientRect(); return { x: e.x, y: e.y, w: e.width, h: e.height }; }); return { x: r.x - padX, y: r.y - padY, width: r.w + padX * 2, height: r.h + padY * 2 }; };
let p = await open();
const r1 = await p.evaluate(() => ({ ctx: window.__ctx, canvases: document.querySelectorAll("canvas").length, drawn: document.querySelector('#contact a[href="/about"]').dataset.drawn }));
const name = await p.getByRole("link", { name: "Who we are" }).count();
console.log(`1 WebGL contexts on the home page: ${r1.ctx} (canvases: ${r1.canvases}) ${r1.ctx === 1 ? "✅" : "⛔ expected 1"}`);
console.log(`2 extruded letters drawn: data-drawn=${r1.drawn} ${r1.drawn === "1" ? "✅" : "⛔ still on the fallback"}`);
console.log(`3 links named "Who we are": ${name} ${name === 1 ? "✅" : "⛔"}`);
await p.keyboard.press("Tab");
for (let i = 0; i < 30; i++) { const on = await p.evaluate(() => document.activeElement?.getAttribute("href") === "/about" && document.activeElement.closest("#contact")); if (on) break; await p.keyboard.press("Tab"); }
await p.waitForTimeout(400);
const f4 = `${stamp}_page_after_focus-ring.png`; await p.screenshot({ path: join(FILM, BIN, f4), clip: await clipOf(p) }); log(f4, "after: focused by keyboard, the focus ring"); console.log(`4 focus ring still: ${f4}`);
await p.context().close();
p = await open("", true);
const r5 = await p.evaluate(() => document.querySelector('#contact a[href="/about"]').dataset.drawn);
const f5 = `${stamp}_page_after_no-webgl-fallback.png`; await p.screenshot({ path: join(FILM, BIN, f5), clip: await clipOf(p) }); log(f5, "after: with NO WebGL, the CSS fallback (teal pill, ice-blue words)");
console.log(`5 no WebGL: data-drawn=${r5} ${r5 === "0" ? "✅ fallback kept" : "⛔"}  still: ${f5}`);
await p.context().close();
p = await open("?lighthelpers=1");
const f6 = `${stamp}_page_after_lighthelpers.png`; await p.screenshot({ path: join(FILM, BIN, f6), clip: await clipOf(p, 200, 130) }); log(f6, "after: ?lighthelpers=1, the static light from the right drawn");
console.log(`6 light helpers still: ${f6}`);
await b.close();
console.log("⚠ NOT WATCHED: other browsers; mobile; Carl's Chrome; whether three.js stayed out of the page's first chunk.");
