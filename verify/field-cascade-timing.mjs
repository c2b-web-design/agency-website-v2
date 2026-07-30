// Diagnostic: do the FOUR contact-field boxes enter on the approved cascade?
//
//   node verify/field-cascade-timing.mjs
//
// THE TIMINGS UNDER TEST, on the COMPLETION CLOCK — zero being the moment the
// `complete` stage mounts, itself 900ms after Q1 "Next step".
//
// ⚠ TRIAL VALUES, 30 July 2026, awaiting Carl's eye. He judged the original
// contract (700ms fades 500ms apart, in
// `live-work/contact-form-current-timing-reference.md` §Field-cascade contract)
// too fast on the rendered 2x2 build. Current trial:
//
//   Name           3600-6600ms     box 1, top-left
//   Business name  4100-7100ms     box 2, top-right
//   Website URL    4600-7600ms     box 3, bottom-left
//   Email          5100-8100ms     box 4, bottom-right
//   opal (Send)    8600-11600ms    the fifth element of the same flow
//
// 3000ms fades, 500ms apart. Each value hand-entered; nothing derives from a ratio.
//
// ⚠ THE PROPORTIONAL MODEL WAS ABANDONED, 30 July 2026. Every timing used to derive
// from one spacing RATIO, which made the elements untunable: moving box 2 moved
// boxes 3, 4, the acknowledgement and the opal with it. Four attempts at the ratio
// (75/50/33/10%) failed to land for that reason. Carl: *"The mistake is not to have
// them as one system... break them apart and not have them so reliant on proportion
// and ratios... We will judge it by eye and input the numbers."*
//
// Each element now carries its own hand-entered delay and duration. Boxes 3, 4 and
// the opal were MASKED while the fade speed was judged with nothing else moving;
// all are unmasked now. `start: null` still means "must never appear" and is
// checked, so the mechanism survives for the next time a chunk needs isolating.
//
// ⚠ AND WHEN JUDGING, READ THE LUMINANCE TRACE, NOT THE START TIMES. At a 75%
// ratio every start landed within ~200ms of target and the order was correct —
// this script reported a clean pass — yet Carl could see no overlap between boxes 1
// and 2. The pixels showed why: box 1 was at 98% of final brightness when box 2
// began. A linear fade looks finished well before opacity reaches 1.0.
//
// ⚠ WHY THIS SCRIPT EXISTS RATHER THAN REUSING field-entrance-timing.mjs. That
// one polls the COMPUTED CSS OPACITY of `.enquiry-contact-layer`, which was the
// right probe when a CSS animation drove a single box. The cascade now runs per
// box on the Three.js MATERIALS, and the CSS fade was removed (it would have
// multiplied with the material fade and squared box 1's ramp). A CSS-opacity
// probe would therefore now read a constant 1 and report success without
// measuring anything.
//
// That is the exact failure this project hit on 30 July 2026 with the Q5
// stutter: `verify/q5-stutter.mjs` reported 0/3 CLEAN on a plainly visible
// defect because its window shared a wrong constant with the fix. A harness must
// probe the OBSERVABLE, not the mechanism the fix happens to use.
//
// SO THIS MEASURES PIXELS. Each box occupies a known screen rectangle derived
// from the same measured geometry the mesh uses (58px row pitch, 8px gutter,
// 50px top offset). We screenshot the canvas repeatedly and track each region's
// mean luminance over time. A box that is fading up gets brighter; one that has
// not started stays at the background level.
//
// WHAT IT CANNOT DO: it cannot see material opacity directly, so "visible" is
// defined as a luminance rise above the pre-entrance floor. That is the right
// definition here — it is what the eye sees — but it means the reported start is
// the moment the box becomes MEASURABLY brighter, which lags true opacity 0 by
// however long the fade takes to clear the noise floor. Expect starts to read a
// little late and judge the SPACING (500ms) and ORDER as the primary signals.

import { chromium } from "@playwright/test";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
// No explicit poll interval: a screenshot round-trip is ~40-60ms and sets the
// sampling rate on its own. Adding a sleep on top would only coarsen it.
const WATCH_MS = 12500;

// The current timings, for comparison against what is measured.
// Keep these in step with `FIELD_ENTRANCES` in contact-field-canvas.tsx.
// All four unmasked, 30 July 2026. 3000ms fades, 500ms apart.
const EXPECTED = [
  { id: "name", label: "Name          (top-left)", start: 3600 },
  { id: "business", label: "Business name (top-right)", start: 4100 },
  { id: "website", label: "Website URL   (bottom-left)", start: 4600 },
  { id: "email", label: "Email         (bottom-right)", start: 5100 },
];

// Geometry, from contact-field-geometry.ts. Kept as literals rather than
// imported so this probe cannot inherit a bug from the module under test.
const FIELD_HEIGHT = 38;
const COLUMN_GAP = 8;
const OFFSET_TOP = 50;
const ROW_PITCH = 58;

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});

await page.goto(`${BASE}/start`, { waitUntil: "domcontentloaded" });

// Drive the flow to completion: Begin, then one answer per question, then Send's
// predecessor. The completion clock starts when `complete` mounts.
const begin = page.getByRole("button", { name: /begin/i });
await begin.waitFor({ state: "visible", timeout: 20000 });
await page.waitForFunction(
  () => {
    const b = [...document.querySelectorAll("button")].find((el) => /begin/i.test(el.textContent ?? ""));
    return b && !b.disabled && getComputedStyle(b).pointerEvents !== "none";
  },
  { timeout: 20000 },
);
await begin.click();

// Five questions: select the first card, press Next step. The last press starts
// the 900ms handoff into `complete`.
for (let q = 0; q < 5; q++) {
  const card = page.locator(".enquiry-card").first();
  await card.waitFor({ state: "visible", timeout: 20000 });
  await page.waitForTimeout(400); // let the card grid settle before clicking
  await card.click();
  const next = page.getByRole("button", { name: /next step/i });
  await next.waitFor({ state: "visible", timeout: 20000 });
  await next.click();
}

// t=0 is the `complete` stage mounting — 900ms after that final Next step. Wait
// for the contact layer to become visible, which is when `complete` renders.
await page.waitForFunction(
  () => {
    const el = document.querySelector(".enquiry-contact-layer");
    return el instanceof HTMLElement && getComputedStyle(el).visibility === "visible";
  },
  { timeout: 20000 },
);
const layerBox = await page.locator(".enquiry-contact-layer").boundingBox();
if (!layerBox) {
  console.error("FAILED: could not measure .enquiry-contact-layer");
  await browser.close();
  process.exit(1);
}

// Each box's screen rectangle, derived from the layer box the same way the mesh
// derives world positions from the measured layer size.
const fieldWidth = (layerBox.width - COLUMN_GAP) / 2;
const regions = [
  { col: 0, row: 0 },
  { col: 1, row: 0 },
  { col: 0, row: 1 },
  { col: 1, row: 1 },
].map(({ col, row }) => ({
  x: Math.round(layerBox.x + col * (fieldWidth + COLUMN_GAP)),
  y: Math.round(layerBox.y + OFFSET_TOP + row * ROW_PITCH),
  width: Math.round(fieldWidth),
  height: FIELD_HEIGHT,
}));

// Sample each region's mean luminance over time, BY SCREENSHOT.
//
// ⚠ TWO IN-PAGE ROUTES WERE TRIED FIRST AND BOTH READ ALL ZEROS. `gl.readPixels`
// and `drawImage(canvas, ...)` both depend on the WebGL colour buffer still
// holding the presented frame, and this canvas is created WITHOUT
// `preserveDrawingBuffer` — so the buffer is undefined once the frame is on
// screen. Calling `getContext` again with different attributes does NOT change
// that: it returns the EXISTING context and silently ignores the request.
//
// A probe that reads zeros looks EXACTLY like four invisible boxes. That is a
// false negative of the same family as the Q5 harness bug (30 July 2026), and it
// is why this script screenshots instead: Playwright's screenshot is taken by the
// browser's compositor, so it captures what is actually on screen regardless of
// context attributes.
//
// COST: a screenshot round-trip is ~30-60ms, so sampling resolution is coarser
// than a 50ms poll suggests. That is acceptable here — the signal being measured
// is 1500ms spacing between entrances, an order of magnitude larger.
// ⚠ CAPTURE FIRST, ANALYSE AFTER. A first version decoded each screenshot inside
// `page.evaluate` before taking the next one, which cost ~700ms per sample — too
// coarse to resolve 800ms spacing, so the measurement could not have distinguished
// the trial timings from the originals. The capture loop now does nothing but
// screenshot (~90ms), and every frame is decoded afterwards in one batch.
const shots = [];
const t0 = Date.now();
while (Date.now() - t0 < WATCH_MS) {
  const at = Date.now() - t0;
  const buf = await page.screenshot({
    clip: { x: layerBox.x, y: layerBox.y, width: layerBox.width, height: layerBox.height },
  });
  shots.push({ at, buf });
}

const samples = [];
for (const shot of shots) {
  samples.push({ at: shot.at, lumas: await regionLumas(page, shot.buf, regions, layerBox) });
}

/**
 * Mean luminance of each region, by decoding the PNG in the page (where an image
 * decoder and a 2D canvas already exist) rather than adding a Node image
 * dependency to this repo.
 */
async function regionLumas(page, buf, regions, layerBox) {
  const base64 = buf.toString("base64");
  return page.evaluate(
    async ({ base64, regions, layerBox }) => {
      const img = new Image();
      img.src = `data:image/png;base64,${base64}`;
      await img.decode();

      const scratch = document.createElement("canvas");
      scratch.width = img.width;
      scratch.height = img.height;
      const ctx = scratch.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);

      return regions.map((r) => {
        const x = Math.max(0, Math.round(r.x - layerBox.x));
        const y = Math.max(0, Math.round(r.y - layerBox.y));
        const w = Math.max(1, Math.min(Math.round(r.width), scratch.width - x));
        const h = Math.max(1, Math.min(Math.round(r.height), scratch.height - y));
        const { data } = ctx.getImageData(x, y, w, h);
        let sum = 0;
        for (let i = 0; i < data.length; i += 4) {
          sum += (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) * (data[i + 3] / 255);
        }
        return sum / (w * h);
      });
    },
    { base64, regions, layerBox },
  );
}

// ⚠ SELF-CHECK BEFORE REPORTING ANYTHING. By the end of WATCH_MS every box is
// long past its entrance, so all four MUST read brightly. If they do not, this
// probe cannot see the canvas and any timing conclusion below would be an
// artefact of the instrument, not a fact about the app.
//
// This exists because two earlier versions of this script read all zeros and
// would have reported "no box ever entered" against a build where all four were
// plainly visible in a screenshot. A harness must fail LOUDLY when blind rather
// than quietly reporting the absence it cannot distinguish from a defect.
// Only UNMASKED boxes are expected to be bright — a masked box reading dark is the
// correct result, not a blind probe.
const finalLumas = samples[samples.length - 1]?.lumas ?? [];
const visibleIdx = EXPECTED.map((e, i) => (e.start === null ? -1 : i)).filter((i) => i >= 0);
const blind = visibleIdx.every((i) => (finalLumas[i] ?? 0) < 0.5);
if (blind) {
  console.error(`\nFAILED — THE PROBE IS BLIND, NOT THE BOXES INVISIBLE.`);
  console.error(`  Final-frame luminance per box: ${finalLumas.map((l) => l.toFixed(2)).join(", ")}`);
  console.error(`  Every UNMASKED box is past its entrance by +${WATCH_MS}ms and must read bright.`);
  console.error(`  Fix the probe before drawing any conclusion about the cascade.\n`);
  await browser.close();
  process.exit(1);
}

// ── Report ──────────────────────────────────────────────────────────────────
// Detection is by FRACTION OF FINAL BRIGHTNESS, not by an absolute rise above a
// floor.
//
// ⚠ WHY, because the obvious approach failed and failed QUIETLY. A first version
// averaged the samples before 2000ms as a floor and flagged the first sample
// exceeding floor + 2 luma. Boxes 3 and 4 then reported +0ms — an impossible
// result, since nothing is drawn there until 5200ms.
//
// The cause: the corridor Q&A text is still FADING OUT across those early
// samples (0-2600ms) and it overlaps the row-2 regions. So the "floor" was an
// average of a DECAYING signal, leaving it higher than the genuinely empty
// samples that followed. Every later sample sat below it, and the comparison
// tripped on sample one.
//
// ⚠ AND A FRACTION OF FINAL BRIGHTNESS FAILED TOO, for the opposite reason. 25%
// of a final 61.9 is 15.5, which is BELOW the empty-canvas floor of 18.2 — so it
// tripped on sample one as well. An absolute fraction of the target is meaningless
// unless it is measured from the floor.
//
// WHAT ACTUALLY WORKS, from the measured trace: the floor is a stable 18.2 (the
// dark background, once the corridor has cleared) and each box climbs to 61.9. So
// take the floor from the QUIETEST samples rather than the earliest ones — the
// minimum per region, which cannot be contaminated by the decaying corridor text —
// and trigger at a fraction of the way from floor to final.
const finals = regions.map((_, i) => samples[samples.length - 1].lumas[i]);
const floors = regions.map((_, i) => Math.min(...samples.map((s) => s.lumas[i])));
/** Fraction of the floor->final climb that counts as "arriving". */
const ARRIVAL_FRACTION = 0.25;
const thresholds = regions.map((_, i) => floors[i] + (finals[i] - floors[i]) * ARRIVAL_FRACTION);

console.log(`\nFOUR-BOX ENTRANCE CASCADE — production build, completion clock`);
console.log("=".repeat(70));

// The raw trace. Printed FIRST and always, because the derived "start" numbers
// below depend on a floor estimate — and if the floor is wrong (a box already
// bright before its entrance) the derived numbers go silent while the trace shows
// it plainly. Read the trace before trusting the summary.
console.log(`\n  RAW LUMINANCE TRACE — box1 / box2 / box3 / box4`);
for (const s of samples) {
  console.log(`    +${String(s.at).padStart(4)}ms   ${s.lumas.map((l) => l.toFixed(1).padStart(6)).join("  ")}`);
}
console.log("");

const measured = [];
const maskLeaks = [];
regions.forEach((_, i) => {
  const exp = EXPECTED[i];
  const peak = samples.reduce((m, s) => Math.max(m, s.lumas[i]), 0);

  // MASKED: the only question is whether it stayed dark.
  //
  // ⚠ Judged against a VISIBLE box's brightness, never its own. A masked region's
  // own final value IS the dark value, so any threshold derived from it is
  // circular — and its floor-to-final range is noise, so a fraction of that range
  // is a few luma above nothing.
  //
  // Measured: a masked region reads 22.2, against a floor of 18.2 and a rendering
  // box at 61.9. That 4-luma lift is drop-shadow bleed from the box above, not the
  // masked box. The arrival threshold sat below it and reported both masked boxes
  // as LEAKED while a screenshot showed row 2 plainly empty. A false alarm trains
  // the reader to ignore the alarm.
  //
  // So the bar is half of what a REAL box reaches — far above any plausible bleed,
  // far below a box that is actually rendering.
  if (exp.start === null) {
    const visibleFull = Math.max(...visibleIdx.map((v) => finals[v]));
    const leaked = peak >= floors[i] + (visibleFull - floors[i]) * 0.5;
    if (leaked) maskLeaks.push(exp.label.trim());
    measured.push(null);
    console.log(
      `  ${exp.label}  MASKED — must never appear   ${leaked ? "*** LEAKED ***" : "stayed dark"}   peak luma ${peak.toFixed(1)}`,
    );
    return;
  }

  const first = samples.find((s) => s.lumas[i] >= thresholds[i]);
  measured.push(first ? first.at : null);
  const at = first ? `+${first.at}ms` : "NEVER";
  const delta = first ? `${first.at - exp.start >= 0 ? "+" : ""}${first.at - exp.start}ms` : "—";
  console.log(
    `  ${exp.label}  expected +${exp.start}ms   measured ${at.padStart(8)}  (${delta})   peak luma ${peak.toFixed(1)}`,
  );
});

// Gap between consecutive VISIBLE boxes, reported as an observation with no target
// value: each element's timing is now entered by hand, so there is no ratio for a
// gap to conform to. A gap of ~0 is correct when two boxes share a start.
console.log(`\n  GAP between successive visible starts (observation, no target):`);
let reported = false;
for (let i = 1; i < measured.length; i++) {
  if (measured[i] === null || measured[i - 1] === null) continue;
  console.log(`    box ${i} -> box ${i + 1}:  ${measured[i] - measured[i - 1]}ms`);
  reported = true;
}
if (!reported) console.log(`    (fewer than two visible boxes)`);

const expectedVisible = EXPECTED.filter((e) => e.start !== null).length;
const seen = measured.filter((m) => m !== null).length;

console.log(`\n${"=".repeat(70)}`);
console.log(`  Visible boxes entered:   ${seen} of ${expectedVisible}`);
console.log(`  Masked boxes stayed off: ${maskLeaks.length === 0 ? "YES" : `NO — ${maskLeaks.join(", ")}`}`);
console.log(`
  ⚠ Verification is not approval. This answers "did they enter in the right
    order, at roughly the right times". Whether the choreography LOOKS right is
    Carl's judgement, on rendered output (context-rules.md Rule 9).
`);

await browser.close();
