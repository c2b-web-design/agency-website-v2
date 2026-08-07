/**
 * Does card 1 FADE, and does card 2 begin before card 1 has finished?
 *
 * ⚠ CARL'S SPECIFICATION IS ABOUT THE RELATIONSHIP BETWEEN TWO CARDS, not about
 * one card's numbers: *"Cards 1 should fade in and just before it has finished
 * its fade, card 2 should fade in."* `CARD_OVERLAP` = 0.72 encodes it — card 2
 * starts when card 1 is 72% through its own rise.
 *
 * ⚠ PIXELS CANNOT RESOLVE THIS, AND TRYING COST TWO WRONG ANSWERS. A screenshot
 * per sample costs ~40-130ms: one harness left a 330ms hole in its own timeline
 * (long enough to hide an entire entrance and make a smooth ramp look like a
 * jump), and another reported cards 1 and 2 rising in perfect lockstep with a
 * 0ms gap. Both were instrument artefacts — the beat marks show the rungs firing
 * 568ms apart, exactly as `CARD_RISE_GAP_MS` specifies. **A sampler slower than
 * what it samples will invent a defect and hide a real one.**
 *
 * So this reads `window.__cardTrace`, which `useCardEntrance` publishes under
 * `?beattrace=1` — every card's own `raw` progress, once per animation frame.
 * Same principle as the beat marks: the animation's own clock is the honest
 * source.
 *
 *   node verify/entrance-fade.mjs
 */

import { chromium } from "playwright";

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto("http://localhost:3000/start?beattrace=1", { waitUntil: "networkidle" });
await page.getByRole("button", { name: /begin/i }).click();
await page.getByTestId("answer-card-hover-0").waitFor({ timeout: 20000 });
await page.waitForTimeout(11000);

const trace = await page.evaluate(() => window.__cardTrace ?? []);
await browser.close();

if (!trace.length) {
  console.log("⚠ NO TRACE — `?beattrace=1` published nothing.");
  process.exit(1);
}

const t0 = Math.min(...trace.map((e) => e.t));
const cards = [...new Set(trace.map((e) => e.card))].sort((a, b) => a - b);

console.log(`\n  ${trace.length} samples across ${cards.length} cards\n`);

// Per card: when it starts moving, when it finishes.
const spans = cards.map((card) => {
  const mine = trace.filter((e) => e.card === card).sort((a, b) => a.t - b.t);
  const moving = mine.filter((e) => e.raw > 0 && e.raw < 1);
  const done = mine.find((e) => e.raw >= 1);
  return {
    card,
    start: moving.length ? moving[0].t - t0 : null,
    end: done ? done.t - t0 : null,
    samples: moving.length,
  };
});

console.log("  card   starts    ends   frames in the rise");
for (const s of spans) {
  console.log(
    `  ${String(s.card).padStart(4)}  ${String(s.start).padStart(6)}ms ${String(s.end).padStart(6)}ms` +
      `   ${String(s.samples).padStart(4)}`,
  );
}

console.log("\n── the stagger ──");
let ok = true;
for (let i = 1; i < spans.length; i++) {
  const prev = spans[i - 1];
  const cur = spans[i];
  if (prev.start === null || cur.start === null || prev.end === null) continue;
  const gap = cur.start - prev.start;
  const intoPrev = ((cur.start - prev.start) / (prev.end - prev.start)) * 100;
  const overlaps = cur.start < prev.end;
  if (!overlaps) ok = false;
  console.log(
    `  card ${i + 1} starts ${gap}ms after card ${i} — ` +
      `${intoPrev.toFixed(0)}% into card ${i}'s rise   ${overlaps ? "✅ overlaps" : "⚠ NO OVERLAP"}`,
  );
}

console.log("\n── smoothness (largest single-frame jump in `raw`) ──");
for (const card of cards) {
  const mine = trace.filter((e) => e.card === card).sort((a, b) => a.t - b.t);
  let biggest = 0;
  for (let i = 1; i < mine.length; i++) {
    const d = mine[i].raw - mine[i - 1].raw;
    if (d > biggest) biggest = d;
  }
  console.log(`  card ${card}: +${(biggest * 100).toFixed(1)}% of the rise in one frame`);
}

console.log(
  "\n⚠ A fade at 60fps over 2000ms moves ~0.8% per frame. Anything much larger",
);
console.log("  is a jump, and a card whose rise has very few frames never faded.");
console.log(ok ? "\n✅ every card begins before its predecessor finishes." : "\n⚠ the overlap is broken.");
