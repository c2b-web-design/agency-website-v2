/** THE ROLL ON THE HOME PAGE, VERIFIED (D-088, 12 October 2026, session 2 — Carl: "the roll looks great. Implement it along
 *  with the rest of the tweaks on the page"). The first rollout's checks (whoweare-home-verify.mjs) plus the roll's:
 *  1 WebGL contexts on the page — expect 1.  2 the letters drawn (data-drawn = 1).  3 one link named "Who we are".
 *  4 the box: 2× (expect ~259 × 82) and the section's type (h2 48 px, p 20 px).
 *  5 ROLLING: WebGL draw calls rise while the button is on screen.  6 GATED: scrolled off screen, draw calls stop rising.
 *  7 FOCUS HOLDS: the link focused by keyboard → data-hold = 1 (read BEFORE any screenshot — a screenshot fires stray
 *    pointer events, live-work/screenshot-fires-pointermove-12-october.md; focus does not depend on them).
 *  8 REDUCED MOTION: no frames while on screen (draw calls flat).  9 NO WebGL: the fallback stays.
 *  Stills to `06 On the page`. ⚠ NOT WATCHED: the pointer hold on the page (verified on the bench by probe); other browsers;
 *  phones; Carl's Chrome; the bundle split. */
import { chromium } from "playwright";
import { appendFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
const FILM = join(homedir(), "Videos", "C2B Films", "01 Who we are button"), BIN = "06 On the page";
const pad = (n) => String(n).padStart(2, "0"), d = new Date();
const stamp = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
const log = (f, note) => appendFileSync(join(FILM, "shot-list.md"), `| ${d.toISOString().slice(0, 16).replace("T", " ")} | ${BIN}/${f} | page | ${note} | - |\n`);
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const A = '#contact a[href="/about"]';
async function open({ noWebGL = false, reduced = false } = {}) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: reduced ? "reduce" : "no-preference" });
  await ctx.addInitScript((off) => {
    window.__ctx = 0; window.__draws = 0;
    const orig = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
      if (/webgl/.test(type)) {
        if (off) return null;
        const c = orig.call(this, type, ...rest);
        if (c && !this.__counted) {
          this.__counted = true; window.__ctx++;
          for (const fn of ["drawElements", "drawArrays", "drawElementsInstanced", "drawArraysInstanced"]) {
            const f = c[fn]; if (typeof f === "function") c[fn] = function (...a) { window.__draws++; return f.apply(this, a); };
          }
        }
        return c;
      }
      return orig.call(this, type, ...rest);
    };
  }, noWebGL);
  const p = await ctx.newPage();
  await p.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready);
  await p.evaluate(() => document.querySelector("#contact").scrollIntoView({ block: "start" }));
  await p.evaluate(() => { document.querySelectorAll("nextjs-portal").forEach((e) => e.remove()); });
  await p.waitForTimeout(3000);
  return p;
}
const draws = (p) => p.evaluate(() => window.__draws);
const rising = async (p, ms = 1000) => { const a = await draws(p); await p.waitForTimeout(ms); return (await draws(p)) - a; };
const ok = (c) => (c ? "✅" : "⛔");

let p = await open();
const r = await p.evaluate((A) => {
  const a = document.querySelector(A).getBoundingClientRect();
  const cs = (s) => parseFloat(getComputedStyle(document.querySelector(s)).fontSize);
  return { ctx: window.__ctx, drawn: document.querySelector(A).dataset.drawn, w: a.width, h: a.height, h2: cs("#contact h2"), p: cs("#contact p") };
}, A);
const named = await p.getByRole("link", { name: "Who we are" }).count();
console.log(`1 WebGL contexts: ${r.ctx} ${ok(r.ctx === 1)}`);
console.log(`2 letters drawn: data-drawn=${r.drawn} ${ok(r.drawn === "1")}`);
console.log(`3 links named "Who we are": ${named} ${ok(named === 1)}`);
console.log(`4 box ${r.w.toFixed(1)} × ${r.h.toFixed(1)} ${ok(Math.abs(r.h - 82) < 1)}; h2 ${r.h2}px ${ok(r.h2 === 48)}; p ${r.p}px ${ok(r.p === 20)}`);
const on = await rising(p);
console.log(`5 on screen: draw calls +${on} in 1 s ${ok(on > 0)}`);
await p.evaluate(() => window.scrollTo(0, 0));
await p.waitForTimeout(600);
const off = await rising(p);
console.log(`6 scrolled away: draw calls +${off} in 1 s ${ok(off === 0)}`);
await p.evaluate(() => document.querySelector("#contact").scrollIntoView({ block: "start" }));
await p.waitForTimeout(800);
const back = await rising(p);
console.log(`  back on screen: draw calls +${back} in 1 s ${ok(back > 0)}`);
const fp = `${stamp}_page_roll_section.png`;
await p.screenshot({ path: join(FILM, BIN, fp) }); log(fp, "the roll on the home page: the section at its new sizes, the button 2x, mid-roll");
await p.keyboard.press("Tab");
for (let i = 0; i < 40; i++) { const at = await p.evaluate((A) => document.activeElement === document.querySelector(A), A); if (at) break; await p.keyboard.press("Tab"); }
await p.waitForTimeout(2500);
const held = await p.getAttribute(A, "data-hold");
console.log(`7 focused by keyboard: data-hold=${held} ${ok(held === "1")}`);
const ff = `${stamp}_page_roll_focus-held.png`;
const bx = await p.evaluate((A) => { const e = document.querySelector(A).getBoundingClientRect(); return { x: e.x - 80, y: e.y - 50, width: e.width + 160, height: e.height + 100 }; }, A);
await p.screenshot({ path: join(FILM, BIN, ff), clip: bx }); log(ff, "focused by keyboard: the roll held on a face, the focus ring");
await p.context().close();

p = await open({ reduced: true });
const still = await rising(p);
console.log(`8 reduced motion: draw calls +${still} in 1 s ${ok(still === 0)}`);
await p.context().close();

p = await open({ noWebGL: true });
const fb = await p.getAttribute(A, "data-drawn");
const fn = `${stamp}_page_roll_no-webgl-fallback.png`;
const bx2 = await p.evaluate((A) => { const e = document.querySelector(A).getBoundingClientRect(); return { x: e.x - 80, y: e.y - 50, width: e.width + 160, height: e.height + 100 }; }, A);
await p.screenshot({ path: join(FILM, BIN, fn), clip: bx2 }); log(fn, "with NO WebGL: the CSS fallback at 2x");
console.log(`9 no WebGL: data-drawn=${fb} ${ok(fb === "0")}  still: ${fn}`);
await b.close();
console.log("⚠ NOT WATCHED: the pointer hold on the page (bench probe only); other browsers; phones; Carl's Chrome; the bundle split.");
