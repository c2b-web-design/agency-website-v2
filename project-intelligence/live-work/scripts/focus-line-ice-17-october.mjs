/** THE QUESTION IN FOCUS AND ITS Q NUMBER, ICE BLUE (17 October 2026; D-023 chunk 2). Carl: "the same colours" — the
 *  question, its Q number and the cards' resting labels all #CFE6FF.
 *  /start at Carl's screen (1920 × 952, DPR 1): Begin → Q5 settled (frame + measure) → card 1 picked, Next step → Q4
 *  settled (frame + measure). Each measure: the computed colour of the focus question and cue, and the rendered glyph
 *  CORE (brightest 30% of pixels with luminance > 120 inside the element's rect) of each, plus card 1's label core.
 *  Usage: node …/focus-line-ice-17-october.mjs <outDir>
 *  ⚠ NOT WATCHED: the answered lines (later chunks); hover/selection colours; mid-transition frames; Carl's GPU/Chrome. */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const [OUT] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1920, height: 952 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const errs = [];
p.on("console", (m) => m.type() === "error" && errs.push(m.text()));

const L = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
async function core(rect) {
  const clip = { x: Math.floor(rect.x), y: Math.floor(rect.y), width: Math.ceil(rect.w), height: Math.ceil(rect.h) };
  const { data, info } = await sharp(await p.screenshot({ clip })).raw().toBuffer({ resolveWithObject: true });
  const px = [];
  for (let i = 0; i < data.length; i += info.channels) if (L(data[i], data[i + 1], data[i + 2]) > 120) px.push([data[i], data[i + 1], data[i + 2]]);
  px.sort((a, c) => L(...c) - L(...a));
  const c = px.slice(0, Math.max(1, Math.floor(px.length * 0.3)));
  const med = (k) => c.map((q) => q[k]).sort((x, y) => x - y)[Math.floor(c.length / 2)];
  return `rgb(${med(0)}, ${med(1)}, ${med(2)})`;
}
async function measure(tag) {
  writeFileSync(join(OUT, `${tag}.png`), await p.screenshot());
  const r = await p.evaluate(() => {
    const box = (el) => { const q = el.getBoundingClientRect(); return { x: q.x, y: q.y, w: q.width, h: q.height }; };
    const root = document.querySelector(".enquiry-pdepth-0");
    const q = root.querySelector(".enquiry-phrase-question"), c = root.querySelector(".enquiry-phrase-cue");
    const g = root.querySelector(".enquiry-answer-grid");
    return { q: box(q), c: box(c), g: box(g), qc: getComputedStyle(q).color, cc: getComputedStyle(c).color, qt: q.textContent, ct: c.textContent };
  });
  const card = { x: r.g.x + r.g.w / 6 - 110, y: r.g.y + r.g.h * 0.25 - 9, w: 220, h: 18 };
  console.log(`\n[${tag}] ${r.ct} "${r.qt}"`);
  console.log(`  question  computed ${r.qc}   rendered core ${await core(r.q)}`);
  console.log(`  Q number  computed ${r.cc}   rendered core ${await core(r.c)}`);
  console.log(`  card 1 label (rest)                      rendered core ${await core(card)}`);
}

await p.goto("http://localhost:3000/start", { waitUntil: "load" });
await p.waitForTimeout(9000);
await p.getByRole("button", { name: /begin/i }).click();
await p.mouse.move(5, 5);
await p.waitForTimeout(7000);
await measure("q5");
const bx = await p.getByTestId("answer-card-hover-0").boundingBox();
await p.mouse.click(bx.x + bx.width / 2, bx.y + bx.height / 2);
await p.mouse.move(5, 5);
await p.waitForTimeout(2500);
const nb = await p.getByRole("button", { name: /next step/i }).first().boundingBox();
await p.mouse.click(nb.x + nb.width / 2, nb.y + nb.height / 2);
await p.mouse.move(5, 5);
await p.waitForTimeout(6000);
await measure("q4");
console.log("\ntarget ice blue rgb(207, 230, 255) · console errors:", errs.length, errs.slice(0, 2));
await b.close();
console.log("⚠ NOT WATCHED: the answered lines (later chunks); hover/selection; mid-transition; Carl's GPU/Chrome. →", OUT);
