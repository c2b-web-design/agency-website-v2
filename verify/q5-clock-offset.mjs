/**
 * How far apart are the TWO CLOCKS?
 *
 * The phrase reveal is a CSS animation on `.enquiry-q-text-reveal` (1300ms,
 * no delay) that starts when the element mounts. The card ladder is a rAF loop
 * in `useCardEntrance` whose zero is the `active` prop flipping. Nothing ties
 * them together, so `CARD_FIRST_ENTRANCE_MS = Q5_REVEAL_MS / 2` is measured
 * from a different origin than the reveal it is supposed to be half of.
 *
 * This reads the CSS animation's OWN currentTime — the authoritative clock,
 * not a pixel estimate — at the moment card 1 first becomes visible.
 *
 *   node verify/q5-clock-offset.mjs
 */

import { chromium } from "playwright";

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto("http://localhost:3000/start", { waitUntil: "networkidle" });
await page.getByRole("button", { name: /begin/i }).click();
await page.getByTestId("answer-card-hover-0").waitFor({ timeout: 20000 });

const result = await page.evaluate(async () => {
  const el = document.querySelector(".enquiry-q-text-reveal");
  if (!el) return { error: "no .enquiry-q-text-reveal on the page" };

  const anims = el.getAnimations();
  if (!anims.length) return { error: "element has no running animation" };
  const reveal = anims[0];

  const dur = reveal.effect.getTiming().duration;
  const samples = [];
  const t0 = performance.now();

  // Poll the animation's own clock alongside the card group's visibility.
  while (performance.now() - t0 < 3000) {
    samples.push({
      wall: Math.round(performance.now() - t0),
      anim: typeof reveal.currentTime === "number" ? Math.round(reveal.currentTime) : null,
      state: reveal.playState,
    });
    await new Promise((r) => requestAnimationFrame(r));
  }

  return { duration: dur, samples };
});

if (result.error) {
  console.log("FAILED:", result.error);
} else {
  console.log(`reveal duration: ${result.duration}ms`);
  const first = result.samples[0];
  console.log(`\nAt the moment the card canvas was ready (harness t=0):`);
  console.log(`  reveal currentTime = ${first.anim}ms  (${((first.anim / result.duration) * 100).toFixed(0)}% through)`);
  console.log(`  playState = ${first.state}`);

  const finished = result.samples.find((s) => s.state === "finished");
  if (finished) {
    console.log(`\n  reveal FINISHED at harness t=${finished.wall}ms`);
  } else {
    console.log(`\n  reveal still running at the end of the window`);
  }
  console.log(`\n⚠ Card 1 is scheduled 650ms after the CARD clock's zero.`);
  console.log(`  If the reveal is already ${first.anim}ms in at that zero, card 1`);
  console.log(`  effectively lands at ${first.anim + 650}ms of a ${result.duration}ms reveal.`);
}

await browser.close();
