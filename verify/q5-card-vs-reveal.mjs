/**
 * WHERE does card 1 arrive relative to the Q5 phrase reveal?
 *
 * ⚠ CARL, 6 August: *"the entrance of card 1 should happen halfway between the
 * Q5 text reveal. its happening after."*
 *
 * The constants already SAY halfway — `CARD_FIRST_ENTRANCE_MS` is
 * `Q5_REVEAL_MS / 2` = 650ms. So if it lands late, the ladder's clock zero is
 * not the moment the reveal starts. This measures both on ONE timeline instead
 * of trusting either constant:
 *
 *   - the phrase text's own coverage, sampled from the phrase band
 *   - the card region's luminance, which leaves the ground plane when card 1
 *     becomes visible
 *
 * Reported as: reveal start, reveal end, card-1 first light, and where that
 * falls as a percentage of the reveal.
 *
 *   node verify/q5-card-vs-reveal.mjs
 */

import { chromium } from "playwright";
import sharp from "sharp";

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto("http://localhost:3000/start", { waitUntil: "networkidle" });
await page.getByRole("button", { name: /begin/i }).click();

const card = await page.getByTestId("answer-card-hover-0").boundingBox({ timeout: 20000 });
if (!card) throw new Error("card 0 not found");

// The phrase sits above the answer grid. Sample the band directly above the
// cards, full width, so the wipe's progress is visible as rising ink coverage.
const band = {
  x: Math.max(0, card.x - 40),
  y: Math.max(0, card.y - 150),
  width: Math.min(1200, 1440 - Math.max(0, card.x - 40)),
  height: 110,
};

const samples = [];
const t0 = Date.now();
while (Date.now() - t0 < 3200) {
  const t = Date.now() - t0;
  const [cardBuf, bandBuf] = await Promise.all([
    page.screenshot({ clip: card }),
    page.screenshot({ clip: band }),
  ]);
  const cardStat = await sharp(cardBuf).greyscale().stats();
  const bandStat = await sharp(bandBuf).greyscale().stats();
  samples.push({
    t,
    card: cardStat.channels[0].mean,
    // Text arriving on a dark background RAISES both mean and spread; stdev is
    // the steadier signal because it does not move when the card lights up.
    band: bandStat.channels[0].stdev,
  });
}
await page.close();
await browser.close();

const bandVals = samples.map((s) => s.band);
const bandMin = Math.min(...bandVals);
const bandMax = Math.max(...bandVals);
const span = bandMax - bandMin;

// Reveal start/end: first and last crossing of 10% / 90% of the band's range.
const at = (frac) => {
  const target = bandMin + span * frac;
  const hit = samples.find((s) => s.band >= target);
  return hit ? hit.t : null;
};
const revealStart = at(0.1);
const revealEnd = at(0.9);

// Card 1 first light: the card region leaving the ground plane for good.
const ground = samples[0].card;
const cardLit = samples.find((s) => s.card > ground + 2);

console.log("\n── the Q5 reveal, measured from the phrase band ──");
console.log(`  band stdev ${bandMin.toFixed(2)} .. ${bandMax.toFixed(2)}`);
console.log(`  reveal starts (10%)  t=${revealStart}ms`);
console.log(`  reveal ends   (90%)  t=${revealEnd}ms`);

console.log("\n── card 1 ──");
console.log(`  ground luminance ${ground.toFixed(2)}`);
console.log(`  first light          t=${cardLit ? cardLit.t : "NEVER"}ms`);

if (revealStart !== null && revealEnd !== null && cardLit) {
  const pct = ((cardLit.t - revealStart) / (revealEnd - revealStart)) * 100;
  console.log(`\n  card 1 arrives at ${pct.toFixed(0)}% OF THE REVEAL`);
  if (pct > 65) {
    console.log("  ⚠ LATE — Carl asked for halfway (50%).");
  } else if (pct < 35) {
    console.log("  ⚠ EARLY — Carl asked for halfway (50%).");
  } else {
    console.log("  ✅ within range of halfway.");
  }
}

console.log("\n── trace ──");
let next = 0;
for (const s of samples) {
  if (s.t >= next) {
    console.log(`  t=${String(s.t).padStart(4)}  band ${s.band.toFixed(2).padStart(6)}  card ${s.card.toFixed(2).padStart(6)}`);
    next = s.t + 100;
  }
}
