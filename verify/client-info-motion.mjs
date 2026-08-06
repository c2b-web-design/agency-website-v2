/**
 * The contact field IN MOTION — the orbiting light, sampled across its circuit.
 *
 * ⚠ WRITTEN BECAUSE A SINGLE FRAME WAS REPORTED AS THOUGH IT DESCRIBED THE
 * OBJECT. Carl, 6 August 2026: *"did you see a single snapshot or many. this
 * thing has an orbital light and the gradient 'appears' to be animated."* One
 * screenshot of a moving object is a claim about one instant, and describing it
 * as the thing itself is the same error as judging the card's form from a frozen
 * light.
 *
 * ⚠ THE ORBIT IS 9000ms — `ORBIT_FRONT_MS` 6000 across the visible half plus
 * `ORBIT_BACK_MS` 3000 for the hidden return (`contact-field-light-rig.tsx`).
 * The phase is deliberately NOT sampled on a divisor of that: a harness whose
 * interval shares a period with what it samples reproduces the same instants
 * every run and cannot see the thing move. That trap cost two wrong diagnoses
 * earlier today.
 *
 * ⚠ AND THE SHINE IS TWO THINGS ON ONE CLOCK. The WebGL light orbits the boxes,
 * while the Send button — a DOM element that no WebGL light can reach — is
 * driven through the `--opal-shine` custom property written on the same frame.
 * Both are captured here, so a drift between them would show.
 *
 *   node verify/client-info-motion.mjs
 */

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import sharp from "sharp";

const OUT = "verify/out";
mkdirSync(OUT, { recursive: true });

const ORBIT_MS = 9000;
const FRAMES = 8;
/** Not a divisor of 9000 — the phase drifts so the sheet covers the circuit. */
const SAMPLE_MS = 1150;

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

await page.goto("http://localhost:3000/start?skip=1", { waitUntil: "networkidle" });
// FIELD_ENTRANCE_END_MS is 8100; wait it out plus a margin so the boxes have
// finished arriving and only the orbit is moving.
await page.waitForTimeout(11000);

// The four boxes plus the Send button, framed together.
const box = await page.evaluate(() => {
  const inputs = Array.from(document.querySelectorAll("input, textarea"));
  const send = Array.from(document.querySelectorAll("button")).find((b) =>
    /send/i.test(b.textContent || ""),
  );
  const els = [...inputs, ...(send ? [send] : [])];
  if (!els.length) return null;
  const r = els.map((e) => e.getBoundingClientRect());
  const x = Math.min(...r.map((b) => b.left));
  const y = Math.min(...r.map((b) => b.top));
  return {
    x: x - 30,
    y: y - 40,
    width: Math.max(...r.map((b) => b.right)) - x + 60,
    height: Math.max(...r.map((b) => b.bottom)) - y + 70,
  };
});
if (!box) throw new Error("contact field not found");

const tiles = [];
for (let i = 0; i < FRAMES; i++) {
  const shine = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("--opal-shine").trim(),
  );

  const buf = await page.screenshot({ clip: box });
  const m = await sharp(buf).metadata();

  const phase = Math.round((((i * SAMPLE_MS) % ORBIT_MS) / ORBIT_MS) * 360);
  const label = Buffer.from(
    `<svg width="${m.width}" height="30">
       <rect width="100%" height="100%" fill="#000"/>
       <text x="8" y="21" font-family="monospace" font-size="16" fill="#fff">orbit ~${phase}°   opal-shine ${shine || "—"}</text>
     </svg>`,
  );

  tiles.push(
    await sharp({
      create: { width: m.width, height: m.height + 30, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } },
    })
      .composite([{ input: label, top: 0, left: 0 }, { input: buf, top: 30, left: 0 }])
      .png()
      .toBuffer(),
  );

  console.log(`frame ${i + 1}/${FRAMES}  ~${phase}°  shine ${shine || "—"}`);
  if (i < FRAMES - 1) await page.waitForTimeout(SAMPLE_MS);
}

const tm = await sharp(tiles[0]).metadata();
const perRow = 2;
const rows = [];
for (let r = 0; r < Math.ceil(tiles.length / perRow); r++) {
  const rowTiles = tiles.slice(r * perRow, (r + 1) * perRow);
  rows.push(
    await sharp({
      create: { width: tm.width * perRow, height: tm.height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } },
    })
      .composite(rowTiles.map((input, i) => ({ input, top: 0, left: i * tm.width })))
      .png()
      .toBuffer(),
  );
}

await sharp({
  create: {
    width: tm.width * perRow,
    height: tm.height * rows.length,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 1 },
  },
})
  .composite(rows.map((input, i) => ({ input, top: i * tm.height, left: 0 })))
  .png()
  .toFile(`${OUT}/client-info-motion.png`);

console.log(`\nsheet: ${OUT}/client-info-motion.png`);
console.log("watch: http://localhost:3000/start?skip=1");

await browser.close();
