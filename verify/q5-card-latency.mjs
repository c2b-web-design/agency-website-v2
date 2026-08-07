/**
 * Card 1 is SCHEDULED at 650ms (halfway through a 1300ms reveal, and the two
 * clocks are only 17ms apart -- `verify/q5-clock-offset.mjs`). But it is not
 * SEEN until ~1347ms. Where do those ~680ms go?
 *
 * `useCardEntrance` already emits a `performance.mark` per card under
 * `?beattrace=1` -- the animation's own clock, added because four pixel-reading
 * instruments all failed to answer "did the entrance run". This reads those
 * marks against the reveal animation's currentTime and against first light, so
 * scheduled / started / drawn are three separate numbers on one timeline.
 *
 *   node verify/q5-card-latency.mjs
 */

import { chromium } from "playwright";
import sharp from "sharp";

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto("http://localhost:3000/start?beattrace=1", { waitUntil: "networkidle" });
await page.getByRole("button", { name: /begin/i }).click();

const card = await page.getByTestId("answer-card-hover-0").boundingBox({ timeout: 20000 });
if (!card) throw new Error("card 0 not found");

// Sample the card until it lights, recording wall time.
const t0 = Date.now();
let firstLight = null;
let ground = null;
while (Date.now() - t0 < 3000) {
  const buf = await page.screenshot({ clip: card });
  const stat = await sharp(buf).greyscale().stats();
  const lum = stat.channels[0].mean;
  if (ground === null) ground = lum;
  if (firstLight === null && lum > ground + 2) firstLight = Date.now() - t0;
}

const marks = await page.evaluate(() => {
  const out = performance.getEntriesByType("mark")
    .filter((m) => m.name.startsWith("card-beat-"))
    .map((m) => ({ name: m.name, time: Math.round(m.startTime) }));
  // Navigation-relative; also report the reveal animation's start if we can.
  const el = document.querySelector(".enquiry-q-text-reveal");
  const anim = el?.getAnimations?.()[0];
  return {
    marks: out,
    revealStart: anim && typeof anim.startTime === "number" ? Math.round(anim.startTime) : null,
    revealDuration: anim ? anim.effect.getTiming().duration : null,
  };
});

console.log("\n── beat marks (from `?beattrace=1`, the animation's own clock) ──");
if (!marks.marks.length) {
  console.log("  NONE — the trace did not fire.");
} else {
  for (const m of marks.marks) console.log(`  ${m.name.padEnd(20)} startTime ${m.time}ms`);
}

console.log("\n── the reveal ──");
console.log(`  animation startTime ${marks.revealStart}ms, duration ${marks.revealDuration}ms`);

if (marks.marks.length && marks.revealStart !== null) {
  const card1 = marks.marks.find((m) => m.name.endsWith("-650")) ?? marks.marks[0];
  const intoReveal = card1.time - marks.revealStart;
  console.log(`\n  card 1's rung fires ${intoReveal}ms into the reveal ` +
    `(${((intoReveal / marks.revealDuration) * 100).toFixed(0)}%)`);
}

console.log("\n── first light on screen ──");
console.log(`  harness t=${firstLight}ms (ground was ${ground?.toFixed(2)})`);
console.log("\n⚠ If the rung fires at ~50% but first light is much later, the");
console.log("  latency is between the rung and the first DRAWN frame -- the");
console.log("  visibility gate, the lighting ramp, or a demand-frame that");
console.log("  never got scheduled.");

await browser.close();
