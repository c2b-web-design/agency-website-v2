/** FILM 04 — THE PAGE `/proto/your-words` CHECKED (23 October 2026, session 2). 1920 × 1080, DPR 1, dev badge hidden:
 *   - each viewport's state (`data-your-words`: pending | drawn | failed) — every one must reach "drawn";
 *   - the WebGL contexts the page creates (counted by wrapping `getContext` before any script) — the note's option A: 2;
 *   - console errors; the page's accessible text (the h1, the two h2s);
 *   - a still of each viewport (scrolled to it), and the page's height in windows (expected 2).
 *    node …/film04-your-words-check-23-october.mjs <base> <outDir> [take] [nowebgl]
 *  `nowebgl`: Chromium with WebGL disabled — every viewport must reach "failed" with its words SHOWN as text, no canvas.
 *  ⚠ NOT WATCHED: how it looks (Carl's eye); frames after the first (both pieces are still until pass 3); Carl's GPU. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const [BASE = "http://localhost:3000", OUT = ".", TAKE = "take1", MODE = ""] = process.argv.slice(2);
const NOGL = MODE === "nowebgl";
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ headless: false, args: NOGL ? ["--disable-webgl", "--disable-3d-apis"] : ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await ctx.addInitScript(() => {
  window.__contexts = 0;
  const orig = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
    const had = this.__ctxType;
    const c = orig.call(this, type, ...rest);
    if (c && /webgl/.test(type) && !had) { window.__contexts++; this.__ctxType = type; }
    return c;
  };
});
const p = await ctx.newPage();
const errors = [];
p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
p.on("pageerror", (e) => errors.push(String(e)));
const t0 = Date.now();
await p.goto(`${BASE}/proto/your-words`, { waitUntil: "networkidle" });
await p.addStyleTag({ content: "nextjs-portal{display:none!important}" });
await p.waitForFunction(() => [...document.querySelectorAll("[data-your-words]")].every((s) => s.dataset.yourWords !== "pending"), null, { timeout: 30000 }).catch(() => {});
const states = await p.evaluate(() => [...document.querySelectorAll("[data-your-words]")].map((s) => s.dataset.yourWords));
console.log(`states: ${states.join(" · ")} (${((Date.now() - t0) / 1000).toFixed(1)} s from navigation)`);
const info = await p.evaluate(() => ({
  contexts: window.__contexts,
  canvases: document.querySelectorAll("canvas").length,
  windows: document.documentElement.scrollHeight / window.innerHeight,
  text: [...document.querySelectorAll("h1, h2")].map((e) => `${e.tagName} "${e.textContent}"`),
  title: document.title,
  robots: document.querySelector('meta[name="robots"]')?.getAttribute("content"),
}));
console.log(`WebGL contexts ${info.contexts} · canvases ${info.canvases} · page ${info.windows.toFixed(2)} windows tall`);
console.log(`text: ${info.text.join(" · ")} · title "${info.title}" · robots "${info.robots}"`);
await p.waitForTimeout(600);
const secs = await p.locator("[data-your-words]").all();
for (const [i, s] of secs.entries()) {
  await s.scrollIntoViewIfNeeded();
  await p.evaluate((k) => window.scrollTo(0, k * window.innerHeight), i);
  await p.waitForTimeout(700);
  await p.screenshot({ path: `${OUT}/your-words-${TAKE}_viewport${i + 1}.png` });
}
console.log(`console errors: ${errors.length}${errors.length ? "\n  " + errors.join("\n  ") : ""}`);
if (NOGL) {
  const shown = await p.evaluate(() => [...document.querySelectorAll("[data-your-words]")].map((s) => ({ text: s.querySelector("h2").getBoundingClientRect().width > 50, canvases: s.querySelectorAll("canvas").length })));
  const ok = states.every((s) => s === "failed") && shown.every((x) => x.text && x.canvases === 0);
  console.log(`${ok ? "✅" : "⛔"} VERDICT (no WebGL) — every viewport fell back: the words shown as text, no canvas.  ⚠ NOT WATCHED: a GPU that fails silently (the deadline's case).`);
} else {
  const pass = states.every((s) => s === "drawn") && info.contexts === 2 && errors.length === 0;
  console.log(`${pass ? "✅" : "⛔"} VERDICT — both viewports drawn, 2 WebGL contexts, no console errors.  ⚠ NOT WATCHED: how it looks; Carl's GPU.`);
}
await b.close();
