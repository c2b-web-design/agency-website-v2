/**
 * ⚠⚠ THE WIPE, AT COMPOSITOR FRAME RATE, VIA CDP SCREENCAST.
 *
 * Carl, 12 August 2026: *"a noticable pause after the first word… After this
 * pause the rest of the reveal is even. Its like watching a runner who makes a
 * misstep."*
 *
 * ⚠ FOUR INSTRUMENTS HAVE NOW FAILED TO SEE THIS, EACH FOR A DIFFERENT REASON,
 * and the pattern is worth stating because it is the day's whole lesson:
 *
 *   walk-cost.mjs        rAF gaps      — a slow-but-delivered repaint is not a gap
 *   corridor-motion.mjs  getBoundingClientRect — layout, not paint
 *   wipe-evenness.mjs    animation.currentTime — the CLOCK advances even when
 *                                          the pixels do not
 *   wipe-filmstrip.mjs   page.screenshot()     — 40-80ms per shot, so the whole
 *                                          1300ms wipe fell between samples
 *
 * **Every one asked the page how it was doing. The page said fine.**
 *
 * ⚠ `Page.startScreencast` IS DIFFERENT: the browser PUSHES a frame each time it
 * composites, so the sample rate is the compositor's, not the harness's, and a
 * frame that took 60ms to paint appears as a 60ms gap between pushed frames.
 * **This is the only instrument here that samples the real output at real rate.**
 *
 * It reports, per screencast frame, the revealed width of the phrase — so an
 * uneven advance is visible as an advance-per-frame column that dips and
 * recovers.
 *
 *   VERIFY_BASE_URL=http://localhost:3100 node verify/wipe-screencast.mjs
 */

import { chromium } from "@playwright/test";
import sharp from "sharp";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3100";

if (/:3000(\/|$)/.test(BASE)) {
  console.error("\n⚠⚠ REFUSING TO RUN AGAINST :3000.\n");
  process.exit(1);
}

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(`${BASE}/start`, { waitUntil: "domcontentloaded" });

const renderer = await page.evaluate(() => {
  const gl = document.createElement("canvas").getContext("webgl2");
  if (!gl) return "no webgl";
  const ext = gl.getExtension("WEBGL_debug_renderer_info");
  return ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "unknown";
});
console.log(`renderer: ${renderer}\nbase:     ${BASE}\n`);

const cdp = await page.context().newCDPSession(page);

const frames = [];
cdp.on("Page.screencastFrame", async (ev) => {
  frames.push({ t: Date.now(), data: ev.data });
  try {
    await cdp.send("Page.screencastFrameAck", { sessionId: ev.sessionId });
  } catch {}
});

/**
 * ⚠⚠ THE CAST MUST START BEFORE THE WIPE, AND THE FIRST VERSION OF THIS FILE
 * DID NOT — it awaited the phrase element, took a `boundingBox()`, and by the
 * time the cast began the 1300ms wipe was over. Every frame read edge 308: a
 * table of perfectly even zeros describing an animation that had already
 * finished. **An instrument that starts late reports a still life and calls it
 * smooth.**
 *
 * The phrase's geometry is fixed by the layout, so it is captured ONCE on a
 * throwaway load and reused — no await sits between Begin and the cast.
 */
const box = await (async () => {
  const probe = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await probe.goto(`${BASE}/start`, { waitUntil: "domcontentloaded" });
  await probe.getByRole("button", { name: /begin/i }).click();
  const el = probe.locator(".enquiry-q-text-reveal").first();
  await el.waitFor({ state: "attached", timeout: 30000 });
  await probe.waitForTimeout(1500);
  const b = await el.boundingBox();
  await probe.close();
  return b;
})();
if (!box) {
  console.error("no phrase box");
  await browser.close();
  process.exit(1);
}
console.log(`phrase band: ${Math.round(box.width)}x${Math.round(box.height)} at (${Math.round(box.x)}, ${Math.round(box.y)})`);
// ⚠⚠ WHICH BOX THIS CROP IS — D-052, 20 August 2026. The crop is DERIVED from
// `.enquiry-q-text-reveal`, which now resolves to the ROW, so the band cast
// below is wider than it was before that commit.
console.log("  SUBJECT: the band above is `.enquiry-phrase-qrow` (cue + gap +");
console.log("           question) — `.enquiry-q-text-reveal` moved to the row.");
console.log("  ⛔ CASTS FROM BEFORE THIS COMMIT FRAMED A NARROWER BAND and are");
console.log("     NOT comparable frame-for-frame.\n");

// ⚠ CAST FIRST, THEN CLICK. Nothing awaited in between.
await cdp.send("Page.startScreencast", { format: "png", everyNthFrame: 1 });
const castStart = Date.now();
await page.getByRole("button", { name: /begin/i }).click();
// Begin is ~7.4s into the opening choreography; the wipe follows it.
await page.waitForTimeout(3000);
await cdp.send("Page.stopScreencast");

console.log(`captured ${frames.length} composited frames in 2000ms\n`);

if (frames.length < 10) {
  console.log("⚠ TOO FEW FRAMES — the screencast did not stream. Nothing can be concluded.");
  await browser.close();
  process.exit(1);
}

// Crop each frame to the phrase band and find the revealed edge.
console.log("   t(ms)   edge(px)   advance   gap(ms)");
const rows = [];
let prevEdge = null;
let prevT = null;
for (const f of frames) {
  const buf = Buffer.from(f.data, "base64");
  /**
   * ⚠⚠ SCAN THE WHOLE FRAME, NOT A PRE-MEASURED BOX — AND THIS IS THE THIRD
   * CROPPING BUG IN THIS HUNT.
   *
   * A `boundingBox()` taken from a probe page gives the phrase's SETTLED
   * position. During the opening the shell sits at `translateY(38vh - 5rem)`
   * and the phrase is somewhere else entirely, so cropping to the settled box
   * sampled empty background — and reported a perfectly even edge at 308px for
   * every frame of an animation it never saw. **Twice.**
   *
   * The wipe is the widest bright horizontal run in the middle band of the
   * page, so it can be found per frame with no prior geometry at all. An
   * instrument that needs to be told where to look will eventually be told
   * wrong.
   */
  let img;
  try {
    img = await sharp(buf).greyscale().raw().toBuffer({ resolveWithObject: true });
  } catch {
    continue;
  }
  const { data, info } = img;
  // Restrict to the vertical middle of the viewport, where the phrase lives at
  // every stage, then take the rightmost bright pixel across those rows.
  const yFrom = Math.round(info.height * 0.35);
  const yTo = Math.round(info.height * 0.75);
  let edge = 0;
  for (let x = info.width - 1; x >= 0; x--) {
    let found = false;
    for (let y = yFrom; y < yTo; y++) {
      if (data[y * info.width + x] > 90) { found = true; break; }
    }
    if (found) { edge = x; break; }
  }
  const t = f.t - castStart;
  const adv = prevEdge === null ? null : edge - prevEdge;
  const gap = prevT === null ? null : t - prevT;
  rows.push({ t, edge, adv, gap });
  prevEdge = edge;
  prevT = t;
}

// Only print the stretch where the wipe is actually travelling.
const first = rows.findIndex((r) => r.adv !== null && r.adv > 0);
const last = rows.length - 1 - [...rows].reverse().findIndex((r) => r.adv !== null && r.adv > 0);
const travel = rows.slice(Math.max(0, first - 2), Math.min(rows.length, last + 3));

for (const r of travel) {
  console.log(
    `  ${String(r.t).padStart(5)}   ${String(r.edge).padStart(8)}   ` +
    `${r.adv === null ? "     " : String(r.adv).padStart(5)}   ${r.gap === null ? "" : String(r.gap).padStart(5)}`,
  );
}

const moving = travel.filter((r) => r.adv !== null && r.adv > 0).map((r) => r.adv);
if (moving.length > 3) {
  const sorted = [...moving].sort((a, b) => a - b);
  const typical = sorted[Math.floor(sorted.length / 2)];
  const startEdge = travel[0].edge;
  const endEdge = travel[travel.length - 1].edge;
  const total = endEdge - startEdge;
  console.log(`\n  total travel ${total}px, typical advance ${typical}px/frame`);

  const stalls = travel.filter(
    (r) => r.adv !== null && r.adv === 0 && r.edge > startEdge && r.edge < endEdge,
  );
  if (stalls.length) {
    console.log("\n  ⚠ FRAMES WHERE THE EDGE DID NOT MOVE, MID-TRAVEL:");
    for (const s of stalls) {
      const pct = total ? Math.round(((s.edge - startEdge) / total) * 100) : 0;
      console.log(`     +${s.t}ms at ${pct}% of travel   (frame gap ${s.gap}ms)`);
    }
    console.log("\n  ⚠ A RUN OF THESE CLUSTERED EARLY IS THE MISSTEP CARL DESCRIBES.");
  } else {
    console.log("\n  no frozen frame mid-travel at compositor rate.");
  }
}

await browser.close();
