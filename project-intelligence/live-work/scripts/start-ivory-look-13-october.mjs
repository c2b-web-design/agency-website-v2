/** `/start` WITH THE IVORY BUTTON, LOOKED AT (13 October 2026 — Carl: "go look at the start page with the ivory button and
 *  tell me what happens"). A cold load at 1440 × 900; a frame every 250 ms for 9 s (then one at 12 s), filmed as well; the
 *  ivory button's state each frame (visible? clickable? its computed opacity / pointer-events), and the WebGL contexts.
 *  ⚠ NOT WATCHED: what happens after Begin is pressed; Carl's Chrome. */
import { chromium } from "playwright";
import { mkdirSync, readdirSync, renameSync } from "node:fs";
import { join } from "node:path";
const OUT = "project-intelligence/live-work/screenshots/start-ivory-13-october";
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: join(OUT, "v"), size: { width: 1440, height: 900 } } });
await ctx.addInitScript(() => { window.__ctx = 0; const o = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t, ...r) { const c = o.call(this, t, ...r); if (/webgl/.test(t) && c && !this.__c) { this.__c = 1; window.__ctx++; } return c; }; });
const p = await ctx.newPage();
const t0 = Date.now();
await p.goto("http://localhost:3000/start", { waitUntil: "commit" });
for (let i = 0; i <= 36; i++) {
  const at = i * 250;
  while (Date.now() - t0 < at) await new Promise((r) => setTimeout(r, 10));
  const s = await p.evaluate(() => {
    const btn = document.querySelector(".enquiry-begin-btn") ?? [...document.querySelectorAll("button, a")].find((e) => /begin/i.test(e.textContent));
    if (!btn) return { btn: null, ctx: window.__ctx };
    const cs = getComputedStyle(btn), r = btn.getBoundingClientRect();
    let o = 1; for (let e = btn; e; e = e.parentElement) o *= parseFloat(getComputedStyle(e).opacity);
    return { btn: btn.textContent.trim().slice(0, 20), opacity: o.toFixed(2), pe: cs.pointerEvents, vis: cs.visibility, y: Math.round(r.y), ctx: window.__ctx };
  }).catch(() => null);
  await p.screenshot({ path: join(OUT, `t${String(at).padStart(5, "0")}.png`) }).catch(() => {});
  console.log(`${(at / 1000).toFixed(2)}s ${JSON.stringify(s)}`);
}
await p.waitForTimeout(3000);
await p.screenshot({ path: join(OUT, "t12000.png") });
await ctx.close(); await b.close();
const v = readdirSync(join(OUT, "v")).find((f) => f.endsWith(".webm")); if (v) renameSync(join(OUT, "v", v), join(OUT, "start_cold-load.webm"));
console.log(OUT);
