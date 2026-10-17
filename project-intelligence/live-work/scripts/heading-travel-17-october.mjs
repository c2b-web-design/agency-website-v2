/** THE HEADING TRAVELS, AND TURNS ICE BLUE ON BEGIN (17 October 2026; D-023). Carl: one element moving and shrinking from
 *  the opening's place to the corridor's head, eased as the question lines travel; white → ice blue over the planet's 2.6 s.
 *  /start at Carl's screen (1920 × 952, DPR 1). (1) From the Begin click: the heading's computed colour every 200 ms for
 *  3.2 s. (2) Card 1 → Next step: from the press, every animation frame for 1.4 s, the heading's font-size, opacity,
 *  transform and its two line boxes; a count of h1 elements (must stay 1 — no ghosts); stills at 0/150/300/450/600/900/1200.
 *  Usage: node …/heading-travel-17-october.mjs <outDir>
 *  ⚠ NOT WATCHED: phones (mastering); reduced motion (corridorMoving never sets there); Carl's GPU/Chrome. */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [OUT] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1920, height: 952 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const errs = [];
p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
await p.goto("http://localhost:3000/start", { waitUntil: "load" });
await p.waitForTimeout(9000);
const colour = () => p.evaluate(() => getComputedStyle(document.querySelector(".enquiry-heading")).color);
console.log("opening colour:", await colour());
await p.getByRole("button", { name: /begin/i }).click();
const tb = Date.now();
const cs = [];
while (Date.now() - tb < 3200) { cs.push(`${Date.now() - tb}:${(await colour()).replace(/rgb\(|\)| /g, "")}`); await p.waitForTimeout(200); }
console.log("from Begin (ms:r,g,b):", cs.join("  "));
await p.mouse.move(5, 5);
await p.waitForTimeout(4000);
const hb = await p.getByTestId("answer-card-hover-0").boundingBox();
await p.mouse.click(hb.x + hb.width / 2, hb.y + hb.height / 2);
await p.mouse.move(5, 5);
await p.waitForTimeout(2500);
const nb = await p.getByRole("button", { name: /next step/i }).first().boundingBox();
await p.evaluate(() => {
  window.__h = [];
  document.addEventListener("pointerdown", () => {
    const t0 = performance.now();
    const tick = () => {
      const t = performance.now() - t0;
      const hs = document.querySelectorAll("h1");
      const h = document.querySelector(".enquiry-heading");
      const s = getComputedStyle(h);
      const lines = [...h.querySelectorAll(".hidden.sm\\:block > div")].map((d) => {
        const r = document.createRange(); r.selectNodeContents(d); const q = r.getBoundingClientRect();
        return { x: q.x, y: q.y, w: q.width, h: q.height };
      });
      window.__h.push({ t: Math.round(t), n: hs.length, fs: parseFloat(s.fontSize), o: +s.opacity, tf: s.transform, cls: h.className, lines });
      if (t < 1400) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, { once: true, capture: true });
});
await p.mouse.click(nb.x + nb.width / 2, nb.y + nb.height / 2);
const tc = Date.now();
for (const at of [0, 150, 300, 450, 600, 900, 1200]) {
  const w = at - (Date.now() - tc);
  if (w > 0) await p.waitForTimeout(w);
  writeFileSync(join(OUT, `press+${String(at).padStart(4, "0")}ms.png`), await p.screenshot());
}
await p.waitForTimeout(400);
const s = await p.evaluate(() => window.__h);
await b.close();
const ty = (tf) => (tf === "none" ? 0 : +tf.split(",")[5]);
console.log(`\n${s.length} frames from the Next step press · h1 count max ${Math.max(...s.map((x) => x.n))} (must be 1)`);
for (const x of s.filter((_, i) => i % 5 === 0 || i === s.length - 1))
  console.log(`  ${String(x.t).padStart(4)} ms  font ${x.fs.toFixed(2)}px  opacity ${x.o.toFixed(3)}  translateY ${ty(x.tf).toFixed(1)}px  line1 y ${x.lines[0]?.y.toFixed(1)}  line2 bottom ${(x.lines[1] ? x.lines[1].y + x.lines[1].h : NaN).toFixed(1)}  ${/travelling/.test(x.cls) ? "travelling" : ""}`);
const mono = s.every((x, i) => !i || x.fs <= s[i - 1].fs + 0.01);
console.log(`font-size never grows: ${mono ? "✅" : "❌"} · last frame classes: ${s.at(-1).cls}`);
console.log("console errors:", errs.length, errs.slice(0, 2));
console.log("⚠ NOT WATCHED: phones; reduced motion; Carl's GPU/Chrome. →", OUT);
