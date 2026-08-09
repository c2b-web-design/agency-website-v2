/**
 * DOES THE ANSWER TEXT TAKE THE FILAMENT'S COLOUR WHEN A CARD IS SELECTED?
 *
 *   node verify/label-lit.mjs
 *
 * ⚠ THE QUESTION, Carl 9 August 2026: *"Can the answer text change colour?"*
 * The label is now drawn into the face's ALBEDO (`map`), not as an emissive —
 * which was a deliberate choice, so the glyphs are lit by whatever light reaches
 * the surface rather than glowing at a fixed brightness.
 *
 * ⚠ SO THE ANSWER MAY ALREADY BE YES, FOR FREE. If the selected state's amber
 * arrives as LIGHT, the text should warm with the card without a line of code.
 * This measures whether it actually does, rather than assuming the theory holds
 * — the same theory-vs-measurement gap that has caught this project repeatedly.
 *
 * Samples the label's pixels unlit, then clicks the card to fire the filament
 * and samples again, reporting the hue shift on the GLYPHS specifically rather
 * than on the whole card.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const OUT = "verify/out/label-lit";
mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:3000";
const browser = await chromium.launch({ headless: false, args: ["--enable-gpu","--use-angle=default","--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await page.goto(`${BASE}/start`, { waitUntil: "networkidle" });
const begin = page.getByRole("button", { name: /begin/i });
await begin.waitFor({ state: "visible", timeout: 25000 });
await page.waitForFunction(() => { const b=[...document.querySelectorAll("button")].find(el=>/begin/i.test(el.textContent??"")); return b && !b.disabled && getComputedStyle(b).pointerEvents!=="none"; }, { timeout: 25000 });
await begin.click();
await page.waitForTimeout(9000);

const box = await page.evaluate(() => {
  const el = document.querySelector("[data-testid='answer-card-hover-0']");
  const r = el.getBoundingClientRect();
  return { x: r.x, y: r.y, width: r.width, height: r.height };
});

// ⚠ THE BRIGHTEST PIXELS IN THE LABEL BAND ARE THE GLYPHS. Sampling the whole
// card would average the ink into the surface and report almost no change.
async function sampleGlyphs(tag) {
  const buf = await page.screenshot({ path: `${OUT}/${tag}.png`, clip: box });
  const p = await browser.newPage();
  const r = await p.evaluate(async (u) => {
    const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = u; });
    const c = document.createElement("canvas");
    c.width = img.width; c.height = img.height;
    c.getContext("2d").drawImage(img, 0, 0);
    const { data, width, height } = c.getContext("2d").getImageData(0, 0, img.width, img.height);
    const px = [];
    for (let y = Math.round(height*0.30); y < Math.round(height*0.70); y++) {
      for (let x = Math.round(width*0.12); x < Math.round(width*0.88); x++) {
        const i = (y*width+x)*4;
        const lum = 0.2126*data[i]+0.7152*data[i+1]+0.0722*data[i+2];
        px.push({ lum, r: data[i], g: data[i+1], b: data[i+2] });
      }
    }
    px.sort((a,b)=>b.lum-a.lum);
    const top = px.slice(0, Math.max(1, Math.round(px.length*0.03)));
    const avg = k => top.reduce((s,p)=>s+p[k],0)/top.length;
    return { r: avg("r"), g: avg("g"), b: avg("b"), lum: avg("lum"), n: top.length };
  }, `data:image/png;base64,${buf.toString("base64")}`);
  await p.close();
  return r;
}

const unlit = await sampleGlyphs("unlit");
await page.mouse.click(box.x + box.width/2, box.y + box.height/2);
await page.waitForTimeout(3200);
const lit = await sampleGlyphs("lit");
await browser.close();

const fmt = s => `rgb(${s.r.toFixed(0)}, ${s.g.toFixed(0)}, ${s.b.toFixed(0)})  lum ${s.lum.toFixed(1)}`;
console.log(`\n  glyphs UNLIT   ${fmt(unlit)}`);
console.log(`  glyphs LIT     ${fmt(lit)}`);
const warmthU = unlit.r - unlit.b;
const warmthL = lit.r - lit.b;
console.log(`\n  warmth (R-B)   unlit ${warmthU.toFixed(1)}   lit ${warmthL.toFixed(1)}   shift ${(warmthL-warmthU).toFixed(1)}`);
console.log("");
if (warmthL - warmthU > 8) {
  console.log(`  ✅ THE TEXT ALREADY WARMS WITH THE CARD. The label is albedo, so the`);
  console.log(`     filament's light colours it exactly as it colours the surface.`);
  console.log(`     No code needed for a warm selected state.`);
} else {
  console.log(`  ⚠ THE TEXT DOES NOT WARM MEANINGFULLY (shift ${(warmthL-warmthU).toFixed(1)}).`);
  console.log(`    Either the filament's light is not reaching the face, or the`);
  console.log(`    glyphs are too bright to take a tint. Changing the colour would`);
  console.log(`    then need the texture redrawn — a real change, not free.`);
}
console.log(`\n  ${OUT}/\n`);
