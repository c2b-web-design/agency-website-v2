/** THE PLATINUM BLUE `Next step` ON `/start` — VERIFIED (D-088, 14 October 2026; structural note
 *  `live-work/structural-note-nextstep-rollout-14-october.md`). `/start` at 1412 × 700, headed, real GPU (the house args).
 *  Instruments, installed before any page script: every WebGL context created (counted), every draw call (per canvas).
 *   1. Built during the OPENING: the family canvas exists inside the host before Begin.
 *   2. NO FRAMES WHILE HIDDEN: the family canvas's draw calls over 2 s before Begin, and over 1.5 s at Q5 before an answer = 0.
 *   3. THE LETTERS (at Q5): the host's hidden copy sets "Next step" where the real button does — the box, and each glyph's x from
 *      the centre (≤ 0.5 px).
 *   4. THE Q5 REVEAL: the longest frame and frames > 50 ms in the 3 s after Begin (the 18 August freeze lived here).
 *   5. ON SELECTION: the host's containing-block check (`data-cb-ok`), drawing (draw calls rise), a frame of the button.
 *   6. THE HOLD: the pointer over the button → `data-hold` 1.
 *   7. THE WALK Q5 → Q1 with REAL clicks on Next step: no WebGL context created after Begin; 7b. at Q4–Q2, an answer chosen
 *      and the pointer away, the roll RUNS (not held, drawing) — added after Carl's "it only rolls on Q5".
 *   8. A COLD LOAD (a fresh browser context): load → the family canvas's first draw, ms.
 *  ⚠ NOT WATCHED: reduced motion; Carl's Chrome; phones; production; the contrast at Q5 (measured on the bench, R-054/R-055 —
 *  the same scene and tone mapping, not re-measured here); Send. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const OUT = "project-intelligence/live-work/screenshots/nextstep-family-14-october/rollout";
mkdirSync(OUT, { recursive: true });
const INSTRUMENT = () => {
  window.__ctxCount = 0;
  const seen = new WeakSet();
  const orig = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
    const ctx = orig.call(this, type, ...rest);
    if (ctx && /webgl/.test(type) && !seen.has(this)) { seen.add(this); window.__ctxCount++; window.__ctxAt = (window.__ctxAt || []).concat(performance.now()); }
    return ctx;
  };
  for (const P of [window.WebGL2RenderingContext, window.WebGLRenderingContext]) {
    if (!P) continue;
    for (const fn of ["drawElements", "drawArrays", "drawElementsInstanced", "drawArraysInstanced"]) {
      const o = P.prototype[fn];
      if (!o) continue;
      P.prototype[fn] = function (...a) { const c = this.canvas; c.__draws = (c.__draws || 0) + 1; c.__firstDraw ??= performance.now(); return o.apply(this, a); };
    }
  }
};
const args = ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"];
let fails = 0;
const ok = (c, m) => { console.log(`${c ? "✅" : "⛔"} ${m}`); if (!c) fails++; };
const b = await chromium.launch({ headless: false, args });
const ctx = await b.newContext({ viewport: { width: 1412, height: 700 } });
await ctx.addInitScript(INSTRUMENT);
const p = await ctx.newPage();
await p.goto("http://localhost:3000/start", { waitUntil: "load" });
const fam = () => p.evaluate(() => { const c = document.querySelector('[data-testid="nextstep-surface-host"] [data-family-next] canvas'); return c ? { draws: c.__draws || 0, paused: c.closest("[data-family-next]").dataset.paused, hold: c.closest("[data-family-next]").dataset.hold } : null; });
const longest = (ms) => p.evaluate((d) => new Promise((res) => { let last = performance.now(), worst = 0, over = 0; const end = last + d; const tick = (t) => { const g = t - last; worst = Math.max(worst, g); if (g > 50) over++; last = t; if (t < end) requestAnimationFrame(tick); else res({ worst: Math.round(worst), over }); }; requestAnimationFrame(tick); }), ms);

// 1–2. the opening
await p.waitForTimeout(9000);
let f0 = await fam();
ok(!!f0, `1. the family canvas is built inside the host during the opening (before Begin)`);
await p.waitForTimeout(2000);
let f1 = await fam();
ok(f0 && f1 && f1.draws - f0.draws === 0, `2. no frames while hidden, before Begin: ${f1 ? f1.draws - f0.draws : "?"} draw calls over 2 s (paused=${f1?.paused})`);

// 4. the Q5 reveal
const ctxBeforeBegin = await p.evaluate(() => window.__ctxCount);
const reveal = longest(3000);
await p.getByRole("button", { name: /begin/i }).click();
const rv = await reveal;
ok(rv.worst < 100, `4. the Q5 reveal: longest frame ${rv.worst} ms, ${rv.over} frame(s) over 50 ms in 3 s`);
await p.locator(".enquiry-answer-grid").waitFor({ state: "visible", timeout: 30000 });
await p.waitForTimeout(4000);
f0 = await fam(); await p.waitForTimeout(1500); f1 = await fam();
ok(f1.draws - f0.draws === 0, `2b. no frames while hidden at Q5 before an answer: ${f1.draws - f0.draws} draw calls over 1.5 s`);
const ctxAtQ5 = await p.evaluate(() => window.__ctxCount);

// 3. the letters (at Q5: the real button exists only once the questions render — moved here 14 October after the first run found nothing to compare before Begin)
const glyphs = await p.evaluate(() => {
  const pos = (el) => { const r = el.getBoundingClientRect(); const cx = r.left + r.width / 2; const n = [...el.childNodes].find((x) => x.nodeType === 3 && x.textContent.trim()); const rg = document.createRange(); const xs = []; const t = n.textContent; const off = t.indexOf("N"); for (let i = off; i < off + "Next step".length; i++) { rg.setStart(n, i); rg.setEnd(n, i + 1); xs.push(rg.getBoundingClientRect().left - cx); } return { w: r.width, h: r.height, xs }; };
  const real = document.querySelector(".enquiry-nextstep-btn");
  const copy = document.querySelector('[data-testid="nextstep-surface-host"] > span');
  return real && copy ? { real: pos(real), copy: pos(copy) } : null;
});
if (glyphs) {
  const dx = Math.max(...glyphs.real.xs.map((x, i) => Math.abs(x - glyphs.copy.xs[i])));
  ok(Math.abs(glyphs.real.w - glyphs.copy.w) <= 0.5 && Math.abs(glyphs.real.h - glyphs.copy.h) <= 0.5 && dx <= 0.5,
    `3. the hidden copy sets the words as the real button: box ${glyphs.copy.w.toFixed(1)}×${glyphs.copy.h.toFixed(1)} vs ${glyphs.real.w.toFixed(1)}×${glyphs.real.h.toFixed(1)}; worst glyph Δx ${dx.toFixed(2)} px`);
} else ok(false, "3. the real button or the hidden copy was not found");


// 5. on selection
await p.getByTestId("answer-card-hover-0").dispatchEvent("pointerdown");
await p.waitForTimeout(1200);
const cb = await p.evaluate(() => document.querySelector('[data-testid="nextstep-surface-host"]').dataset.cbOk);
f0 = await fam(); await p.waitForTimeout(800); f1 = await fam();
ok(cb === "1", `5. the host sits on the button (containing-block check data-cb-ok=${cb})`);
ok(f1.draws > f0.draws && f1.paused === "0", `5b. drawing once an answer is chosen: +${f1.draws - f0.draws} draw calls over 0.8 s (paused=${f1.paused})`);
await p.mouse.move(5, 5); await p.waitForTimeout(300);
await p.screenshot({ path: `${OUT}/q5_selected.png` });
const br = await p.evaluate(() => { const r = document.querySelector(".enquiry-nextstep-btn").getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
for (let i = 0; i < 4; i++) { await p.screenshot({ path: `${OUT}/button_${i}.png`, clip: { x: br.x - 50, y: br.y - 35, width: br.w + 100, height: br.h + 70 } }); await p.waitForTimeout(900); }

// 6. the hold
// ⚠ The screenshots just taken fire stray pointer events (`live-work/screenshot-fires-pointermove-12-october.md`); the pointer
// is moved in steps and the state read after they have settled (the first form, one move + 300 ms, read 0 once in three runs).
await p.waitForTimeout(500);
await p.mouse.move(br.x + br.w / 2, br.y + br.h / 2, { steps: 8 }); await p.waitForTimeout(600);
const held = await fam();
ok(held.hold === "1", `6. the pointer over the button holds the roll (data-hold=${held.hold})`);

// 7. the walk, real clicks on Next step
// 7b (added 14 October, after Carl: "it only rolls on Q5"): at each question after the first click, an answer chosen and the
// pointer far away, the roll must be RUNNING — not held (a removed, focused button fires no blur) and drawing.
const rolling = [];
for (let s = 0; s < 4; s++) {
  if (s > 0) {
    await p.getByTestId("answer-card-hover-0").dispatchEvent("pointerdown");
    await p.mouse.move(5, 5); await p.waitForTimeout(1200);
    const a = await fam(); await p.waitForTimeout(600); const z = await fam();
    rolling.push(`Q${5 - s}: hold=${z.hold} paused=${z.paused} +${z.draws - a.draws}`);
    if (z.hold !== "0" || z.paused !== "0" || z.draws <= a.draws) fails++;
  }
  await p.locator(".enquiry-nextstep-btn").click();
  await p.waitForTimeout(2600);
}
console.log(`${rolling.every((r) => / hold=0 paused=0 \+[1-9]/.test(r)) ? "✅" : "⛔"} 7b. rolling at every question after Q5 (pointer away): ${rolling.join(" · ")}`);
const ctxEnd = await p.evaluate(() => window.__ctxCount);
const stage = await p.evaluate(() => document.querySelector(".enquiry-answer-grid") ? "a question" : "past the questions");
ok(ctxEnd === ctxAtQ5, `7. Q5 → Q1 with real clicks: WebGL contexts ${ctxAtQ5} at Q5 → ${ctxEnd} at the end (${ctxBeforeBegin} before Begin); now at ${stage}`);
await p.screenshot({ path: `${OUT}/after_walk.png` });
await ctx.close();

// 8. a cold load
const cctx = await b.newContext({ viewport: { width: 1412, height: 700 } });
await cctx.addInitScript(INSTRUMENT);
const cp = await cctx.newPage();
const t0 = Date.now();
await cp.goto("http://localhost:3000/start", { waitUntil: "load" });
let first = null;
for (let i = 0; i < 100 && first === null; i++) { await cp.waitForTimeout(100); first = await cp.evaluate(() => { const c = document.querySelector('[data-testid="nextstep-surface-host"] [data-family-next] canvas'); return c && c.__firstDraw ? Math.round(c.__firstDraw) : null; }); }
ok(first !== null, `8. cold load: the family canvas first drew ${first} ms after navigation start (load took ${Date.now() - t0} ms wall)`);
await cctx.close();
await b.close();
console.log(fails ? `\n⛔ ${fails} check(s) failed` : "\n✅ all checks passed");
console.log("⚠ NOT WATCHED: reduced motion; Carl's Chrome; phones; production; the contrast at Q5 (bench-measured); Send.");
console.log(OUT);
