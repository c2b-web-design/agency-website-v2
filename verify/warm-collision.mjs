/**
 * WHAT stalls the card ladder at ~3.5s, and is the contact field's warm-up
 * guard actually holding?
 *
 * ⚠ CARL, 7 AUGUST 2026: *"cards 1+2 look good, 3 happens, then a pause, 3
 * flashes and 4+5 come on."* `verify/entrance-frames.mjs` measured the pause as
 * a single 1527ms frame gap at t≈3528ms — one stall, absorbed by whichever
 * cards are mid-rise when it lands.
 *
 * ⚠ THE GUARD IN `enquiry-opening.tsx` IS SUPPOSED TO PREVENT EXACTLY THIS. It
 * holds the contact canvas until `ENTRANCE_END_MS` (4890) has passed FROM THE
 * ENTRANCE'S OWN START — and 3528 is inside that window. So either the guard is
 * not running, its anchor never arrives, or the stall is something else
 * entirely.
 *
 * ⚠ DO NOT GUESS BETWEEN THOSE. This script watches the DOM for the contact
 * canvas appearing and correlates it with the long tasks and the frame gap, so
 * the answer is observed rather than inferred. A previous session lost hours
 * reasoning about which of two clocks was wrong.
 *
 *   node verify/warm-collision.mjs
 */

import { chromium } from "@playwright/test";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.addInitScript(() => {
  window.__ev = [];
  // Long tasks — the blocking work itself.
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) {
      window.__ev.push({ kind: "longtask", t: Math.round(e.startTime), dur: Math.round(e.duration) });
    }
  }).observe({ entryTypes: ["longtask"] });

  // Every canvas that appears, and when. The contact field's warm-up is a
  // SECOND WebGL context; its arrival is the thing under suspicion.
  const seen = new WeakSet();
  // ⚠ COUNT ALL CANVASES INCLUDING HIDDEN ONES. The contact field mounts inside
  // a `visibility: hidden` wrapper, so an earlier version of this check — which
  // only noticed VISIBLE canvases — reported "no canvas near the stall" and
  // wrongly exonerated it.
  new MutationObserver(() => {
    for (const c of document.querySelectorAll("canvas")) {
      if (seen.has(c)) continue;
      seen.add(c);
      const r = c.getBoundingClientRect();
      window.__ev.push({
        kind: "canvas",
        t: Math.round(performance.now()),
        w: Math.round(r.width),
        h: Math.round(r.height),
      });
    }
  }).observe(document.documentElement, { childList: true, subtree: true });

  // Frame gaps, so the stall is located independently of the card trace.
  let last = performance.now();
  const tick = () => {
    const now = performance.now();
    if (now - last > 200) {
      window.__ev.push({ kind: "framegap", t: Math.round(last), dur: Math.round(now - last) });
    }
    last = now;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});

await page.goto(`${BASE}/start?beattrace=1`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: /begin/i }).click();
const clicked = await page.evaluate(() => performance.now());
await page.getByTestId("answer-card-hover-0").waitFor({ timeout: 20000 });
await page.waitForTimeout(12000);

const ev = await page.evaluate(() => window.__ev);
const trace = await page.evaluate(() => window.__cardTrace ?? []);
const marks = await page.evaluate(() => performance.getEntriesByType("mark").map(m => ({ name: m.name, t: Math.round(m.startTime) })));
await browser.close();

console.log(`\n  Begin pressed at +${Math.round(clicked)}ms (page clock)\n`);

// Card rungs, from the entrance's own trace — the reference timeline.
if (trace.length) {
  const t0 = Math.min(...trace.map((e) => e.t));
  const cards = [...new Set(trace.map((e) => e.card))].sort((a, b) => a - b);
  console.log("── the ladder (card trace, relative to card 1's first frame) ──");
  for (const c of cards) {
    const mine = trace.filter((e) => e.card === c && e.raw > 0 && e.raw < 1).sort((a, b) => a.t - b.t);
    if (mine.length) {
      console.log(`  card ${String(c).padStart(4)}   starts ${String(mine[0].t - t0).padStart(5)}ms   frames ${mine.length}`);
    }
  }
}

// ⚠ THE MARKS ARE THE PHASE BOUNDARIES. `card-canvas-created` and
// `card-canvas-compiled` bracket the REAL canvas's setup; the `warmup-` pair
// bracket the hidden opening canvas. A long task falling between a created/
// compiled pair is that canvas's own work and nothing else's.
console.log("\n── performance marks ──");
for (const m of marks.sort((a, b) => a.t - b.t)) {
  console.log(`  +${String(m.t).padStart(6)}ms  ${m.name}`);
}

console.log("\n── events, in order (page clock) ──");
for (const e of ev.sort((a, b) => a.t - b.t)) {
  if (e.kind === "canvas") {
    console.log(`  +${String(e.t).padStart(6)}ms  CANVAS APPEARED  ${e.w}x${e.h}`);
  } else if (e.kind === "longtask" && e.dur >= 100) {
    console.log(`  +${String(e.t).padStart(6)}ms  long task  ${e.dur}ms`);
  } else if (e.kind === "framegap") {
    console.log(`  +${String(e.t).padStart(6)}ms  ⚠ FRAME GAP  ${e.dur}ms`);
  }
}

const gaps = ev.filter((e) => e.kind === "framegap" && e.dur > 400);
const canvases = ev.filter((e) => e.kind === "canvas");
console.log("\n─────────────────────────────────────────────");
if (!gaps.length) {
  console.log("  No frame gap over 400ms. The stall did not reproduce this run.");
} else {
  for (const g of gaps) {
    // A canvas created within 500ms before the gap is the prime suspect.
    const culprit = canvases.find((c) => c.t <= g.t + 200 && c.t > g.t - 1500);
    console.log(`  Stall of ${g.dur}ms at +${g.t}ms`);
    console.log(
      culprit
        ? `    ⚠ a ${culprit.w}x${culprit.h} canvas appeared at +${culprit.t}ms — ${g.t - culprit.t}ms before it.`
        : `    no canvas appeared near it — the cause is NOT a second WebGL context.`,
    );
  }
}
console.log("\n  ⚠ Verification is not approval.");
