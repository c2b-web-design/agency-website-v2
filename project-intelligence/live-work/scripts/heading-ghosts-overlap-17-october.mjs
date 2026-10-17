/** THE HEADING AT THE FIRST NEXT STEP — DO THE LARGE AND SMALL COPIES OVERLAP? (17 October 2026; Carl.)
 *  /start at Carl's screen (1920 × 952, DPR 1): Begin → card 1 → Next step. From the press, every animation frame for
 *  1.2 s: each ghost's computed opacity and its two LINE boxes (a Range over each line's text, so the box is the ink's
 *  line box, not the full-width h1). Reports when both are visible at once, whether any large line box intersects any
 *  small line box, and stills at 0 / 200 / 400 / 600 / 800 ms.
 *  Usage: node …/heading-ghosts-overlap-17-october.mjs <outDir>
 *  ⚠ NOT WATCHED: glyph-level ink (line boxes include ascender/descender space); reduced motion; phones. */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [OUT] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1920, height: 952 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto("http://localhost:3000/start", { waitUntil: "load" });
await p.waitForTimeout(9000);
await p.getByRole("button", { name: /begin/i }).click();
await p.mouse.move(5, 5);
await p.waitForTimeout(7000);
writeFileSync(join(OUT, "before-press.png"), await p.screenshot());
const hb = await p.getByTestId("answer-card-hover-0").boundingBox();
await p.mouse.click(hb.x + hb.width / 2, hb.y + hb.height / 2);
await p.mouse.move(5, 5);
await p.waitForTimeout(2500);
const nb = await p.getByRole("button", { name: /next step/i }).first().boundingBox();

// The sampler runs IN the page on rAF from the press, so frames are not lost to round trips.
await p.evaluate(() => {
  window.__ghost = [];
  const lineBoxes = (h) =>
    [...h.querySelectorAll(":scope > div")].map((d) => {
      const r = document.createRange();
      r.selectNodeContents(d);
      const q = r.getBoundingClientRect();
      return { x: q.x, y: q.y, w: q.width, h: q.height };
    });
  const read = () => {
    const big = document.querySelector(".enquiry-opening-ghost");
    const small = document.querySelector(".enquiry-corridor-ghost");
    return {
      big: big ? { o: +getComputedStyle(big).opacity, lines: lineBoxes(big), fs: getComputedStyle(big).fontSize } : null,
      small: small ? { o: +getComputedStyle(small).opacity, lines: lineBoxes(small), fs: getComputedStyle(small).fontSize } : null,
    };
  };
  document.addEventListener("pointerdown", () => {
    const t0 = performance.now();
    const tick = () => {
      const t = performance.now() - t0;
      window.__ghost.push({ t: Math.round(t), ...read() });
      if (t < 1200) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, { once: true, capture: true });
});
await p.mouse.click(nb.x + nb.width / 2, nb.y + nb.height / 2);
const tc = Date.now();
for (const at of [0, 200, 400, 600, 800]) {
  const wait = at - (Date.now() - tc);
  if (wait > 0) await p.waitForTimeout(wait);
  writeFileSync(join(OUT, `press+${at}ms.png`), await p.screenshot());
}
await p.waitForTimeout(600);
const s = await p.evaluate(() => window.__ghost);
await b.close();

const hit = (a, c) => a.x < c.x + c.w && c.x < a.x + a.w && a.y < c.y + c.h && c.y < a.y + a.h;
const both = s.filter((f) => f.big && f.small && f.big.o > 0.01 && f.small.o > 0.01);
const inter = s.filter((f) => f.big && f.small && f.big.lines.some((l) => f.small.lines.some((m) => hit(l, m))));
const f = s.find((x) => x.big && x.small) ?? s[0];
const fmt = (l) => `x ${l.x.toFixed(0)}–${(l.x + l.w).toFixed(0)}, y ${l.y.toFixed(1)}–${(l.y + l.h).toFixed(1)}`;
console.log(`${s.length} frames sampled over 1.2 s from the press`);
if (f?.big) console.log(`LARGE (${f.big.fs}) lines:`, f.big.lines.map(fmt).join("  |  "));
if (f?.small) console.log(`SMALL (${f.small.fs}) lines:`, f.small.lines.map(fmt).join("  |  "));
if (f?.big && f?.small) {
  const gap = Math.min(...f.small.lines.map((m) => m.y)) - Math.max(...f.big.lines.map((l) => l.y + l.h));
  console.log(`vertical gap, large bottom → small top: ${gap.toFixed(1)} px  (negative = the boxes overlap)`);
}
console.log(`frames with BOTH visible (opacity > 0.01): ${both.length}` + (both.length ? `, ${both[0].t}–${both.at(-1).t} ms` : ""));
console.log(`frames where a large line box INTERSECTS a small line box: ${inter.length}`);
for (const x of s.filter((_, i) => i % 6 === 0)) console.log(`  ${String(x.t).padStart(4)} ms  large ${x.big ? x.big.o.toFixed(2) : "—"}  small ${x.small ? x.small.o.toFixed(2) : "—"}`);
console.log("⚠ NOT WATCHED: glyph ink vs line boxes; reduced motion; phones. →", OUT);
