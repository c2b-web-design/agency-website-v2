/**
 * ⛔⛔ CHUNK 2a's A2 GATE — are all four /about cards STILL the diagnostic grey?
 *
 * ⚠⚠ WHY THIS EXISTS. `about-card-mesh.tsx` is shared by ALL FOUR room cards.
 * Chunk 2a puts a `meshPhysicalMaterial` with transmission on the face, behind a
 * prop that is OFF by default. **If that default ever flips, or a consumer starts
 * passing `glass`, the /about canvas is `alpha: true` and three clears the
 * transmission target to 50% WHITE** (`three.module.js:18019`) — every card
 * becomes a milky slab. ⛔ It would look exactly like *"the frost is too heavy"*
 * when nothing about the frost is wrong.
 *
 * ⚠⚠ WHAT THIS DOES **NOT** WATCH, stated next to the verdict and not only here,
 * per `context-rules.md` — *"an instrument that names a global property while
 * checking a local one lies by implication"*:
 *
 *   - It does NOT check the bench (/proto/card). Glass ON there is CORRECT.
 *   - It does NOT judge whether the grey is the RIGHT grey, or whether the cards
 *     are well placed, lit or shaped. It asks ONE question: has a transmissive
 *     material reached the room?
 *   - It samples the CARD REGIONS ONLY, from GUIDE_* plate fractions mapped onto
 *     the rendered canvas. It cannot see a card outside those boxes.
 *   - ⛔ NO VERDICT FROM THIS FILE IS ADMISSIBLE AS PROOF. `verify/proven.json`'s
 *     proven array is EMPTY (D-064, VERIFY-UNPROVEN). A red here is worth
 *     chasing; a green certifies nothing and Carl's eye is the instrument.
 *
 * ⚠ THE TEST IS ACHROMATIC SPREAD, NOT ABSOLUTE BRIGHTNESS. The diagnostic tones
 * are deliberately grey (#9a9a9a / #7a7a7a / #c8c8c8), so R, G and B agree
 * closely under white-ish light. A 50%-white transmission clear lifts the whole
 * card toward white AND the sampled region loses its dark surround. Brightness
 * alone would fire on a lighting change; this reports both so a human can tell
 * them apart.
 *
 *   node verify/about-cards-still-grey.mjs
 */

import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const OUT = "verify/out";
mkdirSync(OUT, { recursive: true });

const URL = process.env.BASE ?? "http://localhost:3000";

/**
 * ⚠ PLATE-SPACE FRACTIONS, copied from `about-card-geometry.ts`. ⛔ COPIED, NOT
 * IMPORTED, AND THAT IS A DELIBERATE WEAKNESS WORTH NAMING: a harness that shares
 * a constant with the thing it checks cannot fail on that constant. These are
 * only used to aim the sampler at roughly the right part of the frame — if the
 * cards move, this harness samples the wrong boxes and says so by reporting the
 * surround, rather than silently passing.
 */
const GUIDES = {
  CD: { x0: 0.1094, y0: 0.5725, x1: 0.4806, y1: 0.8492 },
  CS: { x0: 0.5294, y0: 0.5817, x1: 0.8972, y1: 0.8558 },
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(`${URL}/about`, { waitUntil: "networkidle" });

/**
 * ⛔ THE CANVAS RECT IS MEASURED FROM THE DOM, NOT ASSUMED FROM THE LAYOUT.
 * ⚠ An earlier draft of this harness hard-coded a section offset and a scale —
 * two numbers nothing in the page asserts. `context-rules.md`: *"am I relying on
 * a fact that nothing in code checks?"* Measuring it makes the sampler
 * self-correcting when the section moves, and makes it FAIL LOUDLY when the
 * canvas is absent rather than sampling empty page and reporting a calm dark
 * grey — which would read as a pass.
 */
const canvas = await page.locator("canvas").first();
await canvas.waitFor({ state: "visible", timeout: 15000 });
await canvas.scrollIntoViewIfNeeded();
// Let the canvas settle: the cards are drawn on demand.
await page.waitForTimeout(2500);

const rect = await canvas.boundingBox();
if (!rect || rect.width < 50 || rect.height < 50) {
  console.error(
    "\n  ⛔ NO USABLE CANVAS ON /about — this harness cannot answer its question.\n" +
      "     Not a pass. Investigate before reading anything else.\n",
  );
  await browser.close();
  process.exit(2);
}

const shot = `${OUT}/about-cards-still-grey.png`;
await canvas.screenshot({ path: shot });
await browser.close();

const img = sharp(shot);
const { data, info } = await img
  .raw()
  .toBuffer({ resolveWithObject: true });

/** Mean per-channel colour, and the max spread between channels, in a box. */
function sample(box) {
  /**
   * ⚠ FRACTIONS OF THE CANVAS, because the screenshot IS the canvas — cropped to
   * its measured rect above. ⛔ The plate and the canvas share the 1.5 framing
   * (both plates are 1.500), so the guide fractions land on the painted quads.
   * ⚠ This is an approximation good enough to AIM a sampler; it is not a
   * placement measurement and must not be read as one.
   */
  const x0 = Math.round(box.x0 * info.width);
  const x1 = Math.round(box.x1 * info.width);
  const y0 = Math.round(box.y0 * info.height);
  const y1 = Math.round(box.y1 * info.height);
  let r = 0, g = 0, b = 0, n = 0;
  for (let y = y0; y < y1; y += 3) {
    for (let x = x0; x < x1; x += 3) {
      if (y < 0 || y >= info.height || x < 0 || x >= info.width) continue;
      const i = (y * info.width + x) * info.channels;
      r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
    }
  }
  if (!n) return null;
  r /= n; g /= n; b /= n;
  const lum = (r + g + b) / 3;
  const spread = Math.max(r, g, b) - Math.min(r, g, b);
  return { r, g, b, lum, spread, n };
}

const rows = [];
for (const [name, box] of Object.entries(GUIDES)) {
  const s = sample(box);
  rows.push([name, s]);
}

const fmt = (v) => (v === null ? "—" : v.toFixed(1));

let worstLum = 0;
console.log("\n  A2 GATE — are the /about cards still the diagnostic grey?\n");
for (const [name, s] of rows) {
  if (!s) { console.log(`  ${name}  no samples`); continue; }
  worstLum = Math.max(worstLum, s.lum);
  console.log(
    `  ${name}   lum ${fmt(s.lum).padStart(6)}   ` +
      `rgb ${fmt(s.r)}/${fmt(s.g)}/${fmt(s.b)}   ` +
      `channel spread ${fmt(s.spread)}   (${s.n} px)`,
  );
}

/**
 * ⛔⛔ THIS THRESHOLD IS MEASURED FROM BOTH POPULATIONS. THE FIRST ONE WAS NOT,
 * AND IT MISSED THE DEFECT THIS FILE EXISTS TO CATCH.
 *
 * ⚠⚠ THE RED RUN, 18 September 2026. With `glass` forced ON for all four room
 * cards — the exact fault — the numbers moved:
 *
 *              grey (correct)   glass ON (the defect)
 *     CD           112.0              167.2
 *     CS            37.4              109.3
 *
 * ⛔ **THE FIRST THRESHOLD WAS 170 AND IT RETURNED PASS ON THAT RUN.** It was a
 * number chosen by assertion — *"a 50%-white clear reads well above 170"* —
 * written before either population had been measured, and it was wrong by 2.8
 * points. **The harness would have certified the milky slab as clean.**
 *
 * ⚠⚠ RECORDED RATHER THAN QUIETLY RETUNED. This is the project's most expensive
 * failure class arriving in a file written to prevent it: `q5-stutter.mjs` read
 * 0/3 CLEAN on a stall Carl could see; `one-context.mjs` read 2/2 while a context
 * was created every question. **Every one failed toward a PASS**, and so did
 * this one on its first run. ⛔ The lesson is not "pick better numbers" — it is
 * that a threshold nobody has seen fire is a guess wearing a constant's clothes.
 *
 * **140 sits between the two populations with margin on both sides** — 25 above
 * the correct CD, 27 below the defective CD. ⚠ It is still a TRIPWIRE, not a
 * spec: a value near it means READ THE SCREENSHOT, not adjust the number.
 */
const MILKY_LUM = 140;
const milky = worstLum > MILKY_LUM;

console.log(
  `\n  ${milky ? "⛔ SUSPECT" : "✅"} — brightest sampled card region is ` +
    `${fmt(worstLum)}; a 50%-white transmission clear reads well above ${MILKY_LUM} (measured: 167.2 with the defect, 112.0 without).`,
);
console.log(
  "  ⚠ NOT WATCHED: the bench (/proto/card), where glass ON is correct; whether\n" +
    "    the grey is the right grey; card placement, lighting or shape. This asks\n" +
    "    ONE question — has a transmissive material reached the room?\n" +
    "  ⛔ NOT ADMISSIBLE AS PROOF: proven.json is empty (D-064). Carl's eye decides.",
);
console.log(`\n  screenshot: ${shot}\n`);

/**
 * ⛔ THE VERDICT IS DECLARED, NOT INFERRED FROM MARKERS. This harness is REQUIRED
 * to print a ⛔-leading scope caveat (`context-rules.md`: declare what you do not
 * watch, in the output), and a marker-scanning gate reads that caveat as a
 * failure. ⚠ Recorded rather than worked around: a clean 3/3 run of
 * `one-context.mjs` was classified a product failure for exactly this reason on
 * 28 August 2026 — complying with the rule written to stop instruments lying is
 * what tripped the detector.
 */
console.log(`##VERDICT: ${milky ? "FAIL" : "PASS"}`);

process.exitCode = milky ? 1 : 0;
writeFileSync(
  `${OUT}/about-cards-still-grey.json`,
  JSON.stringify({ rows, worstLum, milky, MILKY_LUM }, null, 2),
);
