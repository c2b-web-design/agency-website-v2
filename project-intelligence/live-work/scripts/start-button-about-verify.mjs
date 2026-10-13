/** THE GOLD `Start a conversation` BUTTON ON `/about` §4, VERIFIED (D-088, 13 October 2026). The home script's checks
 *  (whoweare-home-verify-roll.mjs), for a page that ALREADY has a canvas — so draw calls are counted PER CANVAS:
 *  1 WebGL contexts on the page — expect 2 (the room's + the button's).  2 the letters drawn (data-drawn = 1).
 *  3 one link named "Start a conversation", to /start.  4 the box 2× (~381.1 × 82, since 13 October — Carl: "too small"); §4 scaled with it (h2 48, p 20).
 *  5 ROLLING: the BUTTON's draw calls rise with §4 on screen (the room canvas's reported alongside, not judged).
 *  6 GATED: at the page top the button's draw calls stop.  7 FOCUS HOLDS: keyboard focus → data-hold = 1 (read before any
 *  screenshot).  8 REDUCED MOTION: the button draws nothing on screen.  9 NO WebGL: the CSS fallback stays.
 *  Stills to live-work/screenshots/gold-button-13-october/page/ (NOT the film folder — no filming of this build).
 *  ⚠ NOT WATCHED: the pointer hold on the page (bench only); other browsers; phones; Carl's Chrome; the bundle split. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "screenshots", "gold-button-13-october", "page");
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const A = '#start a[href="/start"]';
async function open({ noWebGL = false, reduced = false } = {}) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: reduced ? "reduce" : "no-preference" });
  await ctx.addInitScript((off) => {
    window.__ctx = 0; window.__draws = [];
    const orig = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
      if (/webgl/.test(type)) {
        if (off) return null;
        const c = orig.call(this, type, ...rest);
        if (c && this.dataset.gl === undefined) {
          const n = window.__ctx++; this.dataset.gl = String(n); window.__draws[n] = 0;
          for (const fn of ["drawElements", "drawArrays", "drawElementsInstanced", "drawArraysInstanced"]) {
            const f = c[fn]; if (typeof f === "function") c[fn] = function (...a) { window.__draws[n]++; return f.apply(this, a); };
          }
        }
        return c;
      }
      return orig.call(this, type, ...rest);
    };
  }, noWebGL);
  const p = await ctx.newPage();
  // ⚠ "load", not "networkidle": since the desk mark builds in a Web Worker (13 October) the page is never network-idle to
  // Playwright — the worker is shut down once it has answered, and the test browser never sees its last request end.
  await p.goto("http://localhost:3000/about", { waitUntil: "load" });
  await p.evaluate(() => document.fonts.ready);
  await p.evaluate(() => document.querySelector("#start").scrollIntoView({ block: "start" }));
  await p.evaluate(() => { document.querySelectorAll("nextjs-portal").forEach((e) => e.remove()); });
  await p.waitForTimeout(3500);
  // ⚠ Second run (13 October): the letters land at ~4 s on this page in dev, and a reduced-motion scene still draws ONCE for
  // them — a 1 s window opened at 3.5 s caught that draw and read it as motion (⛔ +158). Every check now opens after the
  // letters are drawn (or 20 s), plus 1 s to settle.
  p.__drawnAt = noWebGL ? null : await p.evaluate(async () => { const t0 = performance.now(); const a = () => document.querySelector('#start a[href="/start"]'); while (a().dataset.drawn !== "1" && performance.now() - t0 < 20000) await new Promise((r) => setTimeout(r, 100)); return a().dataset.drawn === "1" ? (3500 + performance.now() - t0) / 1000 : null; });
  await p.waitForTimeout(1000);
  return p;
}
const btnIdx = (p) => p.evaluate((A) => { const c = document.querySelector(`${A} canvas`); return c ? Number(c.dataset.gl) : -1; }, A);
const snap = (p) => p.evaluate(() => [...window.__draws]);
async function rising(p, ms = 1000) { const a = await snap(p); await p.waitForTimeout(ms); const z = await snap(p); return z.map((v, i) => v - (a[i] ?? 0)); }
const ok = (c) => (c ? "✅" : "⛔");

let p = await open();
const tDrawn = p.__drawnAt;
const bi = await btnIdx(p);
const r = await p.evaluate((A) => {
  const a = document.querySelector(A).getBoundingClientRect();
  const cs = (s) => parseFloat(getComputedStyle(document.querySelector(s)).fontSize);
  return { ctx: window.__ctx, drawn: document.querySelector(A).dataset.drawn, w: a.width, h: a.height, h2: cs("#start h2"), p: cs("#start p") };
}, A);
const named = await p.getByRole("link", { name: "Start a conversation" }).count();
console.log(`1 WebGL contexts: ${r.ctx} ${ok(r.ctx === 2)} (the button's is #${bi})`);
console.log(`2 letters drawn: data-drawn=${r.drawn} ${ok(r.drawn === "1")} — ${tDrawn ? `~${tDrawn.toFixed(1)} s after §4 was scrolled to (dev server)` : "not within 23.5 s"}`);
console.log(`3 links named "Start a conversation": ${named} ${ok(named === 1)}`);
console.log(`4 box ${r.w.toFixed(1)} × ${r.h.toFixed(1)} ${ok(Math.abs(r.h - 82) < 1 && Math.abs(r.w - 381.1) < 2)}; h2 ${r.h2}px ${ok(r.h2 === 48)}; p ${r.p}px ${ok(r.p === 20)}`);
const on = await rising(p);
console.log(`5 §4 on screen: button +${on[bi]} draw calls in 1 s ${ok(on[bi] > 0)}; room canvas +${on.filter((_, i) => i !== bi).join(",")} (reported)`);
await p.screenshot({ path: join(OUT, "about-s4_section.png") });
await p.evaluate(() => window.scrollTo(0, 0));
await p.waitForTimeout(800);
const off = await rising(p);
console.log(`6 page top: button +${off[bi]} ${ok(off[bi] === 0)}; room canvas +${off.filter((_, i) => i !== bi).join(",")} (reported)`);
await p.evaluate(() => document.querySelector("#start").scrollIntoView({ block: "start" }));
await p.waitForTimeout(800);
const back = await rising(p);
console.log(`  back at §4: button +${back[bi]} ${ok(back[bi] > 0)}`);
await p.keyboard.press("Tab");
for (let i = 0; i < 60; i++) { const at = await p.evaluate((A) => document.activeElement === document.querySelector(A), A); if (at) break; await p.keyboard.press("Tab"); }
await p.waitForTimeout(2500);
const held = await p.getAttribute(A, "data-hold");
console.log(`7 focused by keyboard: data-hold=${held} ${ok(held === "1")}`);
const clip = await p.evaluate((A) => { const e = document.querySelector(A).getBoundingClientRect(); return { x: e.x - 80, y: e.y - 50, width: e.width + 160, height: e.height + 100 }; }, A);
await p.screenshot({ path: join(OUT, "about-s4_focus-held.png"), clip });
await p.context().close();

p = await open({ reduced: true });
const bi2 = await btnIdx(p);
const still = await rising(p);
console.log(`8 reduced motion: button +${still[bi2]} ${ok(still[bi2] === 0)}`);
await p.context().close();

p = await open({ noWebGL: true });
const fb = await p.getAttribute(A, "data-drawn");
const clip2 = await p.evaluate((A) => { const e = document.querySelector(A).getBoundingClientRect(); return { x: e.x - 80, y: e.y - 50, width: e.width + 160, height: e.height + 100 }; }, A);
await p.screenshot({ path: join(OUT, "about-s4_no-webgl-fallback.png"), clip: clip2 });
console.log(`9 no WebGL: data-drawn=${fb} ${ok(fb === "0")}`);
await b.close();
console.log("⚠ NOT WATCHED: the pointer hold on the page (bench only); other browsers; phones; Carl's Chrome; the bundle split.");
