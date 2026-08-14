/**
 * ⛔⛔ UNFALSIFIED AND NEVER RUN. DO NOT TRUST ITS OUTPUT.
 *
 * **This script has never been executed once, against any build.** It was
 * written on 14 August 2026 and the session moved to a different diagnosis
 * before it was used. It has therefore never produced a frame, never been
 * proven to capture the moment it claims to capture, and never been shown to
 * fail when it should.
 *
 * ⚠ THE STANDING RULE: *an instrument that has never gone red has not been
 * tested.* This one has not gone red OR green. Every failure mode below is
 * unexercised and at least these are live:
 *
 *   - The band is measured from `.enquiry-pdepth-0 .enquiry-answer-grid`, which
 *     **does not exist during a corridor move** — the active phrase is withheld
 *     while `corridorMoving`. The measurement is taken BEFORE the move starts,
 *     so it should hold, but that has not been verified.
 *   - `--step N` walks by clicking card 0. On a build where the cards are
 *     unclickable that throws; on a build where selection state persists it may
 *     TOGGLE the previous answer off instead of selecting.
 *   - The screenshot loop is unthrottled and its real capture rate across a
 *     ~900ms move is unknown. It may sample far too coarsely to show a
 *     one-frame artefact — which is the very thing it was written to show.
 *   - `page.video()` after `context.close()` is untested here.
 *
 * **Before believing anything it prints: run it, look at the frames, and prove
 * it can show a defect you have deliberately introduced.** Until then it is a
 * draft, not an instrument.
 *
 * ── ORIGINAL HEADER ──────────────────────────────────────────────────────
 *
 * ⚠⚠ FILM THE CORRIDOR MOVE. FOR CARL'S EYE — NOT FOR A VERDICT.
 *
 * 14 August 2026. **This exists because I reported a 1.7px trail as a number
 * and asked Carl to adjudicate it, having never shown him the thing.** Carl:
 * *"You were told not to blindly follow the numbers and my eyes would give you
 * both confirmation and information."*
 *
 * ⚠ THIS SCRIPT HAS NO PASS AND NO FAIL, DELIBERATELY. It prints no verdict and
 * exits 0 whatever it sees. Its only job is to produce pictures of the ~900ms
 * corridor move so a human can look at it. **Any conclusion in this file would
 * be the exact error it was written to correct.**
 *
 *   VERIFY_BASE_URL=http://localhost:3100 node verify/corridor-filmstrip.mjs
 *   node verify/corridor-filmstrip.mjs --step 2      (film the Q4->Q3 move)
 *
 * ── WHAT IT SHOOTS ───────────────────────────────────────────────────────
 *
 * A band wide enough to hold **the receding phrase AND the card grid in the
 * same frame**, because the question is whether they travel together. Cropping
 * to the cards alone would make a trail impossible to see — there would be
 * nothing to trail BEHIND.
 *
 * Writes:
 *   verify/out/corridor-frames/*.png   the stills, in order
 *   verify/out/corridor-frames/*.webm  a video of the whole move
 *
 * ⚠ WHY THE VIDEO MATTERS MORE THAN THE STILLS. Screenshots cost ~40-80ms each,
 * so the stills are a coarse sample of a 900ms move. The screencast is recorded
 * by the browser at its own rate and shows the motion as motion. **A lag of one
 * frame is a MOTION artefact; it may be invisible in any single still and
 * obvious in playback, or the reverse.**
 */

import { chromium } from "@playwright/test";
import { mkdirSync, rmSync } from "node:fs";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3100";
const OUT = "verify/out/corridor-frames";
const STEP = Number(
  process.argv.includes("--step") ? process.argv[process.argv.indexOf("--step") + 1] : 1,
);

if (/:3000(\/|$)/.test(BASE)) {
  console.error("\n⚠⚠ REFUSING TO RUN AGAINST :3000. Dev-server frame pacing is not the shipped motion.\n");
  process.exit(1);
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  recordVideo: { dir: OUT, size: { width: 1440, height: 900 } },
});
const page = await context.newPage();

await page.goto(`${BASE}/start`, { waitUntil: "domcontentloaded" });

const renderer = await page.evaluate(() => {
  const gl = document.createElement("canvas").getContext("webgl2");
  if (!gl) return "no webgl";
  const ext = gl.getExtension("WEBGL_debug_renderer_info");
  return ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "unknown";
});
if (/swiftshader|llvmpipe|software/i.test(renderer)) {
  console.error(`\n⚠ ABORTING — renderer is "${renderer}": a software rasteriser.`);
  process.exit(1);
}
console.log(`renderer: ${renderer}\nbase:     ${BASE}\nfilming corridor step ${STEP}\n`);

await page.getByRole("button", { name: /begin/i }).click();
await page.locator(".enquiry-answer-grid").waitFor({ state: "visible", timeout: 30000 });
await page.waitForTimeout(6200);

// Walk to the requested step so a later move can be filmed too — the first move
// is the `firstRecede` ghost crossfade and is not representative of the others.
for (let s = 1; s < STEP; s++) {
  await page.getByTestId("answer-card-hover-0").click();
  await page.waitForTimeout(700);
  await page.getByRole("button", { name: /next step/i }).click();
  await page.waitForTimeout(6800);
}

// ⚠ THE BAND MUST CONTAIN BOTH THE PHRASE AND THE CARDS. Measured from the live
// page rather than hard-coded, so it stays correct if the layout moves.
const band = await page.evaluate(() => {
  const grid = document.querySelector(".enquiry-pdepth-0 .enquiry-answer-grid") || document.querySelector(".enquiry-answer-grid");
  const bandEl = document.querySelector(".enquiry-phrase-band");
  const g = grid.getBoundingClientRect();
  const b = bandEl ? bandEl.getBoundingClientRect() : null;
  const top = Math.max(0, Math.min(b ? b.top : g.top, g.top) - 20);
  const bottom = Math.min(900, g.bottom + 30);
  return {
    x: Math.max(0, Math.round(g.left - 40)),
    y: Math.round(top),
    width: Math.min(1440, Math.round(g.width + 80)),
    height: Math.round(bottom - top),
  };
});
console.log(`band: ${band.width}x${band.height} at (${band.x}, ${band.y})   — phrase + cards together`);

await page.getByTestId("answer-card-hover-0").click();
await page.waitForTimeout(700);

console.log("\nfilming the move…");
const t0 = Date.now();
const shots = [];
// Fire the move, then shoot continuously across it and past its end.
await page.getByRole("button", { name: /next step/i }).click();
while (Date.now() - t0 < 1800) {
  const t = Date.now() - t0;
  const buf = await page.screenshot({ clip: band });
  shots.push({ t, buf });
}

for (let i = 0; i < shots.length; i++) {
  const name = `f${String(i).padStart(3, "0")}_t${String(shots[i].t).padStart(4, "0")}ms.png`;
  writeFileSync(join(OUT, name), shots[i].buf);
}

const video = page.video();
await context.close();
const videoPath = video ? await video.path() : null;
await browser.close();

console.log(`\ncaptured ${shots.length} stills over ${shots[shots.length - 1].t}ms`);
console.log(`  stills  ${OUT}/f*.png`);
if (videoPath) console.log(`  video   ${videoPath}`);
console.log(`
⚠ NO VERDICT IS PRINTED HERE, AND THAT IS DELIBERATE.
  The move is ~900ms. Watch the video first — a one-frame lag is a motion
  artefact and may be invisible in any single still.

  The question is not "how many pixels". It is whether the cards feel attached
  to the phrase or feel dragged behind it, and whether anything else about the
  move looks wrong that no probe here is measuring.
`);
