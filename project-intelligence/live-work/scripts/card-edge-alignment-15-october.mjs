/** IS THE LEFT EDGE MISALIGNED? (15 October 2026; Carl, at 1× on a 27" monitor: "it looks as if the left hand side vertical
 *  strip is misaligned"). /start at Q5, DPR 1, 1440 × 900. Reports: the cards' canvas — its CSS rect (fractional?) and its
 *  backing size (= CSS × DPR?); each card's hover box left/right in page px and their FRACTIONAL parts (the pixel phase);
 *  and for card 1 a row of luminance through the vertical middle across its LEFT edge and its RIGHT edge (mirrored), so the
 *  two can be compared column for column.
 *  Usage: node …/card-edge-alignment-15-october.mjs [query]   ⚠ NOT WATCHED: Carl's GPU and Chrome; zoom other than 100%. */
import { chromium } from "playwright";
const Q = process.argv[2] ?? "";
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })).newPage();
await p.goto("http://localhost:3000/start" + Q, { waitUntil: "load" });
await p.waitForTimeout(9000);
await p.getByRole("button", { name: /begin/i }).click();
await p.locator(".enquiry-answer-grid").waitFor({ state: "visible", timeout: 30000 });
await p.mouse.move(5, 5);
await p.waitForTimeout(5000);
const info = await p.evaluate(() => {
  const cs = [...document.querySelectorAll("canvas")].map((c) => { const r = c.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, bw: c.width, bh: c.height }; });
  const cards = [0, 1, 2, 3, 4].map((i) => { const e = document.querySelector(`[data-testid="answer-card-hover-${i}"]`); if (!e) return null; const r = e.getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom }; });
  return { cs, cards };
});
const f = (v) => (v - Math.floor(v)).toFixed(2);
for (const c of info.cs) console.log(`canvas at x ${c.x.toFixed(2)} (frac ${f(c.x)}), y ${c.y.toFixed(2)} (frac ${f(c.y)}); CSS ${c.w.toFixed(2)} × ${c.h.toFixed(2)}; backing ${c.bw} × ${c.bh}${Math.abs(c.bw - c.w) > 0.5 || Math.abs(c.bh - c.h) > 0.5 ? "  ⛔ backing ≠ CSS — the browser rescales it" : ""}`);
info.cards.forEach((c, i) => c && console.log(`card ${i + 1}: left ${c.l.toFixed(2)} (frac ${f(c.l)}), right ${c.r.toFixed(2)} (frac ${f(c.r)}), top ${c.t.toFixed(2)}, bottom ${c.b.toFixed(2)}`));
const c = info.cards[0];
const y = Math.round((c.t + c.b) / 2);
const row = async (x0) => { const png = await p.screenshot({ clip: { x: x0, y, width: 12, height: 1 } }); return p.evaluate(async (s) => { const img = new Image(); img.src = "data:image/png;base64," + s; await img.decode(); const cv = document.createElement("canvas"); cv.width = img.width; cv.height = 1; const g = cv.getContext("2d"); g.drawImage(img, 0, 0); const d = g.getImageData(0, 0, img.width, 1).data; const o = []; for (let i = 0; i < d.length; i += 4) o.push(Math.round(0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2])); return o; }, png.toString("base64")); };
const L = await row(Math.floor(c.l) - 3);
const R = (await row(Math.ceil(c.r) - 9)).reverse();
console.log(`card 1, row y ${y} — outside → in, one value per screen pixel:`);
console.log(`  LEFT  edge: ${L.map((v) => String(v).padStart(3)).join(" ")}`);
console.log(`  RIGHT edge: ${R.map((v) => String(v).padStart(3)).join(" ")}   (mirrored)`);
await b.close();
console.log("⚠ NOT WATCHED: Carl's GPU and Chrome; browser zoom ≠ 100%.");
