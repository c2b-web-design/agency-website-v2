// THE EMERALD MARBLE ON perchance.org (23 November 2026; Carl: "yes run it"). Types the prompt, sets "No style", Square, 8,
// clicks generate, waits, then saves every generated image at its NATURAL size (read inside its own frame) + a screenshot.
// Sends only the marble prompt. ⚠ NOT WATCHED: the ➕ options (left at their defaults).
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
const OUT = process.argv[2];
const PROMPT = "seamless tileable texture of polished natural emerald marble, seen perfectly straight down, flat even shadowless lighting, no reflections, no glare, no vignette, the stone fills the whole frame edge to edge. Deep emerald and teal green stone broken into irregular angular plates, each plate its own tone: lighter teal, deep green, a few near-black pockets, cloudy depth like deep water. Thin sharp branching cracks with angular turns between and through the plates, a few long cracks across the slab, many short ones branching off and dying away; the cracks filled with metallic gold at their edges and cream-white calcite in the widest cores. Delicate fine white hairline crazing inside the plates. Real natural stone, high detail, sharp. Not liquid, not fluid art, not swirls, no text.";
const b = await chromium.launch({ channel: "chrome", headless: false });
const p = await (await b.newContext({ viewport: { width: 1400, height: 1000 } })).newPage();
await p.goto("https://perchance.org/ai-text-to-image-generator", { waitUntil: "load", timeout: 60000 });
await p.waitForTimeout(6000);
const gen = p.frames().find((f) => /perchance\.org\/ai-text-to-image-generator/.test(f.url()) && f !== p.mainFrame());
if (!gen) { console.log("no generator frame", p.frames().map((f) => f.url())); process.exit(1); }
const boxes = gen.locator("textarea");
let box = null;
for (let i = 0; i < (await boxes.count()); i++) { const ph = await boxes.nth(i).getAttribute("placeholder"); if (ph && ph.includes("boy, in a rainy city")) box = boxes.nth(i); }
if (!box) box = boxes.nth(1);
await box.fill(PROMPT);
const selects = gen.locator("select");
for (let i = 0; i < (await selects.count()); i++) {
  const opts = await selects.nth(i).locator("option").allInnerTexts();
  const want = opts.find((o) => o.includes("𝗡𝗼 𝘀𝘁𝘆𝗹𝗲")) ?? opts.find((o) => o.trim() === "Square") ?? (opts.includes("8") ? "8" : null);
  if (want) await selects.nth(i).selectOption({ label: want });
}
await gen.getByText("generate", { exact: false }).first().click();
console.log("generate clicked");
p.context().on("page", (np) => console.log("a new page opened:", np.url()));
p.on("close", () => console.log("the page closed"));
b.on("disconnected", () => console.log("the browser disconnected"));
for (let s = 10; s <= 120; s += 10) {
  try { await p.waitForTimeout(10000); await p.screenshot({ path: `${OUT}/t${s}.png` }); console.log(`t${s}s frames ${p.frames().length}`); }
  catch (e) { console.log(`stopped at ${s}s:`, String(e).split(String.fromCharCode(10))[0]); break; }
}
let n = 0;
for (const f of p.frames()) {
  let imgs = [];
  try {
    imgs = await f.evaluate(async () => {
      const out = [];
      for (const im of document.querySelectorAll("img")) {
        if (im.naturalWidth < 400) continue;
        try {
          const c = document.createElement("canvas"); c.width = im.naturalWidth; c.height = im.naturalHeight;
          c.getContext("2d").drawImage(im, 0, 0);
          out.push({ w: im.naturalWidth, h: im.naturalHeight, data: c.toDataURL("image/png") });
        } catch (e) { out.push({ w: im.naturalWidth, h: im.naturalHeight, err: String(e).slice(0, 80), src: im.src.slice(0, 80) }); }
      }
      return out;
    });
  } catch {}
  for (const im of imgs) {
    if (im.data) { writeFileSync(`${OUT}/perchance-${++n}.png`, Buffer.from(im.data.split(",")[1], "base64")); console.log(`saved perchance-${n}.png ${im.w}x${im.h}`); }
    else console.log("not readable", im);
  }
}
console.log(`images saved: ${n}`);
await b.close();
