/** D-097 ACCEPTANCE — does the scaled site at DPR 1 reproduce what Carl approved at 1.36? (15 October 2026, session 2)
 *  REFERENCE = Carl's build environment: a 1412 × 608 CSS window at deviceScaleFactor 1.36 (scale computes 1 — unscaled).
 *  SCALED    = the same 1920 × 827 SCREEN px at DPR 1 — `lib/site-scale.ts` computes 1.36 from the window.
 *  Per stop: both screenshots, the % of pixels differing by > 8 and > 64 levels, every canvas's screen rect + backing,
 *  the applied zoom, and every section/header/footer's SCREEN height (must match between arms — added after the
 *  first run passed with every section collapsed: `--vh` was declared in `.dark`, and nothing here watched heights). Also: the scale at first paint vs settled (no jump), and the scale at 1280 × 800 and 390 × 844 (must be 1).
 *  Usage: node …/site-scale-verify-15-october.mjs <outDir> <page: home|about|start>
 *  ⚠ NOT WATCHED: motion and timing between stops, hover, the cold PRODUCTION load (dev server only), other browsers. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
const [OUT, PAGE = "home"] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ARMS = { ref: { viewport: { width: 1412, height: 608 }, deviceScaleFactor: 1.36 }, scaled: { viewport: { width: 1920, height: 827 }, deviceScaleFactor: 1 } };
const scrollTo = (sel) => async (p) => { await p.evaluate((s) => document.querySelector(s)?.scrollIntoView({ block: "start" }), sel); };
const scrollTo2 = (sel, block) => async (p) => { await p.evaluate(([s, b]) => document.querySelector(s)?.scrollIntoView({ block: b }), [sel, block]); await p.waitForTimeout(2500); };
const STOPS = {
  home: ["/", [["top", async () => {}], ["services", scrollTo("#services")], ["contact", scrollTo("#contact")]]],
  about: ["/about", [["top", async () => {}], ["wipe-mid", scrollTo2("#roles", "center")], ["s2", scrollTo2("#roles", "start")], ["s3", scrollTo2("#examples", "start")], ["s4", scrollTo2("#start", "start")]]],
  start: ["/start", [["opening", async (p) => { await p.waitForTimeout(6000); }],
    ["q5", async (p) => { await p.getByRole("button", { name: /begin/i }).click(); await p.waitForTimeout(5000); }],
    ["q5-picked", async (p) => { await p.getByTestId("answer-card-hover-0").click(); await p.waitForTimeout(1800); }],
    ["q1-picked", async (p) => { for (let i = 0; i < 4; i++) { await p.getByRole("button", { name: /next step/i }).click(); await p.mouse.move(2, 2); await p.waitForTimeout(4500); await p.getByTestId("answer-card-hover-0").click(); await p.waitForTimeout(1800); } }],
    ["complete", async (p) => { await p.getByRole("button", { name: /next step/i }).click(); await p.waitForTimeout(9000); }]]],
}[PAGE];
const state = (p) => p.evaluate(() => ({
  zoom: document.documentElement.currentCSSZoom,
  scale: getComputedStyle(document.documentElement).getPropertyValue("--site-scale").trim(),
  onBox: (() => {
    // ⛔ ABSOLUTE: each 3D layer must sit ON the page box it is drawn for (screen px, |Δ| per edge).
    const d = (a, b) => (a && b ? [a.left - b.left, a.top - b.top, a.width - b.width, a.height - b.height].map((v) => Math.round(v * devicePixelRatio)) : null);
    const R = (el) => el?.getBoundingClientRect();
    return {
      cards: d(R(document.querySelector('[data-testid="answer-card-proto"] canvas')), R(document.querySelector(".enquiry-pdepth-0 .enquiry-answer-grid"))),
      contact: d(R(document.querySelector(".enquiry-contact-layer canvas")), R(document.querySelector(".enquiry-contact-layer"))),
      nextOk: document.querySelector('[data-testid="nextstep-surface-host"]')?.getAttribute("data-cb-ok") ?? null,
    };
  })(),
  stage: Math.round((document.querySelector("[data-room-stage]")?.getBoundingClientRect().height ?? 0) * devicePixelRatio),
  heroBottom: Math.round((document.querySelector("section")?.getBoundingClientRect().bottom ?? 0) * devicePixelRatio),
  sections: [...document.querySelectorAll("section, footer")].map((e) => Math.round(e.getBoundingClientRect().height * devicePixelRatio)),
  canvases: [...document.querySelectorAll("canvas")].map((c) => { const r = c.getBoundingClientRect(); return { screen: [r.x, r.y, r.width, r.height].map((v) => Math.round(v * devicePixelRatio)), backing: [c.width, c.height] }; }),
}));
const shots = {};
for (const arm of ["ref", "scaled"]) {
  const ctx = await b.newContext(ARMS[arm]);
  await ctx.addInitScript(() => { document.addEventListener("DOMContentLoaded", () => { window.__firstScale = getComputedStyle(document.documentElement).getPropertyValue("--site-scale").trim(); window.__firstZoom = document.documentElement.currentCSSZoom; }); });
  const p = await ctx.newPage();
  const errs = [];
  p.on("console", (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 240)); });
  await p.goto("http://localhost:3000" + STOPS[0], { waitUntil: "load" });
  await p.waitForTimeout(4000);
  console.log(`${arm}: first paint scale=${await p.evaluate(() => window.__firstScale)} zoom=${await p.evaluate(() => window.__firstZoom)}`);
  for (const [label, act] of STOPS[1]) {
    await act(p);
    await p.mouse.move(2, 2);
    await p.waitForTimeout(3500);
    const f = join(OUT, `${PAGE}-${label}-${arm}.png`);
    await p.screenshot({ path: f });
    (shots[label] ||= {})[arm] = f;
    const st = await state(p);
    console.log(`${arm} ${label}`, JSON.stringify(st));
    // ⛔ AN ABSOLUTE CHECK, NOT A COMPARISON: both arms run TODAY's code, so a fault common to both passes the diff
    // (it did — `--vh` empty collapsed every section in both). Home: header + hero, and #contact + footer, = one window.
    if (PAGE === "about" && label === "top") {
      const win = Math.round(ARMS[arm].viewport.height * ARMS[arm].deviceScaleFactor);
      const short = st.sections.slice(0, -1).filter((h) => h < win - 2);
      console.log(`  WINDOW CHECK ${arm}: stage ${st.stage} vs window ${win}; sections under one window: ${short.length} → ${Math.abs(st.stage - win) <= 2 && !short.length ? "✅" : "❌"}`);
    }
    if (PAGE === "home" && label === "top") {
      const n = st.sections.length;
      const contactFooter = st.sections[n - 2] + st.sections[n - 1];
      const win = ARMS[arm].viewport.height * ARMS[arm].deviceScaleFactor;
      const ok = (v) => Math.abs(v - win) <= 2;
      console.log(`  WINDOW CHECK ${arm}: hero ends at ${st.heroBottom} / contact+footer ${contactFooter} vs window ${Math.round(win)} → ${ok(st.heroBottom) && ok(contactFooter) ? "✅" : "❌"}`);
    }
  }
  console.log(`${arm} console errors: ${errs.length}`, errs.slice(0, 3));
  await ctx.close();
}
for (const [label, { ref, scaled }] of Object.entries(shots)) {
  const a = await sharp(ref).raw().toBuffer({ resolveWithObject: true });
  const c = await sharp(scaled).raw().toBuffer({ resolveWithObject: true });
  if (a.info.width !== c.info.width || a.info.height !== c.info.height) { console.log(label, "SIZE DIFFERS", a.info.width, a.info.height, c.info.width, c.info.height); continue; }
  let d8 = 0, d64 = 0;
  for (let i = 0; i < a.data.length; i += a.info.channels) {
    const d = Math.max(Math.abs(a.data[i] - c.data[i]), Math.abs(a.data[i + 1] - c.data[i + 1]), Math.abs(a.data[i + 2] - c.data[i + 2]));
    if (d > 8) d8++; if (d > 64) d64++;
  }
  const n = a.info.width * a.info.height;
  console.log(`DIFF ${PAGE} ${label}: >8 ${(100 * d8 / n).toFixed(2)}%  >64 ${(100 * d64 / n).toFixed(2)}%   (target < 0.5% at >8)`);
}
for (const vp of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto("http://localhost:3000" + STOPS[0], { waitUntil: "load" });
  const s = await state(p);
  console.log(`BELOW ${vp.width}×${vp.height}: scale=${s.scale} zoom=${s.zoom} (must be 1)`);
  await ctx.close();
}
console.log("→", OUT);
await b.close();
