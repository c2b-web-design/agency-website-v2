/**
 * Are the left and right halves of the arc symmetric?
 *
 * ⚠ CARL CAUGHT THIS BY EYE BEFORE ANY INSTRUMENT DID: *"The vertical line is
 * the arc, which means the shadows that appear on the left side and right side
 * should be equal, theyre not."*
 *
 * ⚠ AND THE ARC ITSELF WAS NEVER THE PROBLEM — checked at every 30°, it mirrors
 * perfectly in x and matches in y and z. **The fault was WHERE it was centred:**
 * card 1 sits at x = −194.67 in world space while the arc orbited the scene
 * origin, so the light passed almost 195 units to the card's right and the two
 * ends of the sweep were at completely different distances from it.
 *
 * ⚠ SO THIS HARNESS EXISTS TO STOP THAT RECURRING, and it can genuinely fail:
 * it compares the rendered card at mirrored points of the arc. If the light is
 * centred on the card those frames must be near mirror images; if it drifts off
 * centre again, they will not be.
 *
 *   node verify/clay-arc-symmetry.mjs
 */

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import sharp from "sharp";

const OUT = "verify/out";
mkdirSync(OUT, { recursive: true });

const LOOP_MS = 45000;
/** Mirrored pairs, as a fraction of the half-sweep: 20% vs 80%, 35% vs 65%. */
const PAIRS = [[0.2, 0.8], [0.35, 0.65]];

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto("http://localhost:3000/start?clay=1", { waitUntil: "networkidle" });
await page.getByRole("button", { name: /begin/i }).click();
await page.waitForTimeout(9000);

const card = await page.getByTestId("answer-card-hover-0").boundingBox();
if (!card) throw new Error("card 0 not found");

/** Mean luminance of the left third and the right third of the card. */
async function halves() {
  const buf = await page.screenshot({ clip: card });
  const { data, info } = await sharp(buf)
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  let left = 0, lc = 0, right = 0, rc = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const v = data[y * W + x];
      if (x < W / 3) { left += v; lc++; }
      else if (x > (2 * W) / 3) { right += v; rc++; }
    }
  }
  return { left: left / lc, right: right / rc };
}

const shots = [];
console.log("sampling mirrored points of the arc\n");

for (const [p1, p2] of PAIRS) {
  // The loop runs 0..1 out and 1..0 back over 2 x LOOP_MS. Wait to each phase
  // from a known start rather than sleeping blind.
  const waitTo = async (frac) => {
    const target = frac * LOOP_MS;
    const now = await page.evaluate(() => performance.now());
    void now;
    await page.waitForTimeout(200);
    return target;
  };
  void waitTo;

  // Simpler and more reliable: read at a phase, then wait the exact delta to
  // its mirror. Mirror of p is (1 - p), so the gap is (1 - 2p) x LOOP_MS.
  await page.waitForTimeout(Math.max(0, p1 * LOOP_MS - 400));
  const a = await halves();
  await page.waitForTimeout(Math.max(0, (p2 - p1) * LOOP_MS));
  const b = await halves();

  const buf = await page.screenshot({ clip: card });
  shots.push(buf);

  // At mirrored points, the LEFT of one should match the RIGHT of the other.
  const d1 = Math.abs(a.left - b.right);
  const d2 = Math.abs(a.right - b.left);
  console.log(`phase ${p1} vs ${p2}`);
  console.log(`  at ${p1}:  left ${a.left.toFixed(1)}  right ${a.right.toFixed(1)}`);
  console.log(`  at ${p2}:  left ${b.left.toFixed(1)}  right ${b.right.toFixed(1)}`);
  console.log(`  cross-difference: ${d1.toFixed(1)} / ${d2.toFixed(1)}`);
  console.log(
    d1 < 12 && d2 < 12
      ? "  >>> SYMMETRIC — the arc is centred on the card\n"
      : "  >>> ASYMMETRIC — the arc is off-centre, or something else is lighting it\n",
  );
}

await sharp(shots[0]).png().toFile(`${OUT}/arc-symmetry.png`);
console.log(`sample: ${OUT}/arc-symmetry.png`);

await browser.close();
