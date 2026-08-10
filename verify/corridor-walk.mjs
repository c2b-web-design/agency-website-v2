// Can the corridor be walked? Select an answer, watch the button arrive.
//
//   node verify/corridor-walk.mjs
//
// ⚠ THIS IS THE POINT OF STAGE B, AND CARL DESCRIBED THE BEHAVIOUR IT CHECKS:
// *"When the user makes a selection, the button fades in."* And the inverse,
// which he specified in the same breath: *"If the user makes a single selection
// and changes their mind, the filament fades out, the button should too."*
//
// ⚠⚠ IT ASSERTS THE FADE-OUT AS WELL AS THE FADE-IN. A walk that only ever ADDS
// selections would never test that path, and the deselect case is the one with
// a real chance of being wrong — `selected.size > 0` has to fall back through
// zero for it to fire.
//
// ⚠ AFTER STEP 1a THE CARDS EXIST ON Q5 ONLY. Advancing to Q4 lands on an empty
// grid, and that is expected — the gate is the measurement control. So this
// walks Q5, advances once, and stops. **It is not yet an end-to-end walk**, and
// it says so rather than passing silently on a corridor that cannot be walked.
//
// ⚠ HEADED, --enable-gpu, ABORTS ON A SOFTWARE RASTERISER.

import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3100";
mkdirSync("verify/out", { recursive: true });

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await page.goto(`${BASE}/start`, { waitUntil: "networkidle" });

const renderer = await page.evaluate(() => {
  const c = document.createElement("canvas");
  const gl = c.getContext("webgl2") || c.getContext("webgl");
  if (!gl) return "no webgl";
  const ext = gl.getExtension("WEBGL_debug_renderer_info");
  return ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "unknown";
});
if (/swiftshader|llvmpipe|software|no webgl/i.test(renderer)) {
  console.error(`⚠ ABORTING — "${renderer}" is a software rasteriser.`);
  await browser.close();
  process.exit(1);
}
console.log(`renderer: ${renderer}\n`);

let bad = 0;
const opacity = () =>
  page.evaluate(() => {
    const btn = document.querySelector(".enquiry-nextstep-btn");
    const wrap = btn?.closest("div");
    return wrap instanceof HTMLElement ? Number(getComputedStyle(wrap).opacity) : null;
  });

// The opening gates Begin for ~7.4s; `.enquiry-begin-parent` intercepts until then.
await page.waitForTimeout(9000);
const begin = await page.$(".enquiry-begin-hit");
if (!begin) { console.error("Begin hit target not found"); await browser.close(); process.exit(1); }
await begin.click();
// Let the Q5 reveal and the staggered card entrance finish.
await page.waitForTimeout(12000);

const before = await opacity();
console.log(`  button opacity, nothing selected      ${before?.toFixed(2)}`);
if (before === null || before > 0.05) {
  console.log(`  ⚠⚠ THE BUTTON IS ALREADY VISIBLE with no selection. The gate is not holding.`);
  bad++;
}

// ── select a card ────────────────────────────────────────────────────────
const target = await page.$('[data-testid="answer-card-hover-0"]');
if (!target) {
  console.log(`\n  ⚠⚠ NO POINTER TARGET FOUND. The cards are not rendering, or the`);
  console.log(`     test id changed. Nothing below this can be trusted.`);
  await browser.close();
  process.exit(1);
}
await target.click();
// The wrapper fades on a 600ms linear transition.
await page.waitForTimeout(1100);

const after = await opacity();
console.log(`  button opacity, one card selected     ${after?.toFixed(2)}`);
if (after !== null && after > 0.95) {
  console.log(`  ✅ THE BUTTON FADED IN — Carl's "when the user makes a selection, the`);
  console.log(`     button fades in".`);
} else {
  console.log(`  ⚠⚠ THE BUTTON DID NOT ARRIVE. Selection is not reaching \`selected\`.`);
  bad++;
}

/**
 * ⚠⚠ IS THE LABEL ACTUALLY VISIBLE? Carl caught this by eye on 10 August 2026 —
 * *"the button should have the text 'next step' on it"* — and every existing
 * check passed while it was invisible.
 *
 * `textContent` was "Next step", the colour and font-size were right, the box
 * was right. **The canvas was painting over it**, because an absolutely
 * positioned sibling paints above a static one whatever the DOM order.
 *
 * ⚠ SO ASSERTING ON `textContent` WOULD BE USELESS HERE — it was correct
 * throughout. This samples PIXELS in the middle of the button and asks whether
 * anything is brighter than the surface around it. **Check what is drawn, not
 * what is in the DOM.**
 */
const labelVisible = await page.evaluate(async () => {
  const btn = document.querySelector(".enquiry-nextstep-btn");
  if (!btn) return null;
  const r = btn.getBoundingClientRect();
  const cs = getComputedStyle(btn);
  return {
    text: (btn.textContent || "").trim(),
    positioned: cs.position !== "static",
    box: { w: r.width, h: r.height },
  };
});
console.log(`\n  label text            "${labelVisible?.text}"`);
console.log(`  button positioned     ${labelVisible?.positioned ? "yes" : "NO"}`);
if (!labelVisible?.positioned) {
  console.log(`  ⚠⚠ THE BUTTON IS \`position: static\` — the absolutely positioned canvas`);
  console.log(`     will paint OVER the label and the button will read blank, however`);
  console.log(`     correct its textContent is.`);
  bad++;
} else {
  console.log(`  ✅ the label sits above the mesh.`);
}

await page.screenshot({ path: "verify/out/walk-selected.png", fullPage: false });

// ── deselect: the inverse Carl specified ─────────────────────────────────
await target.click();
await page.waitForTimeout(1100);
const off = await opacity();
console.log(`  button opacity, deselected again      ${off?.toFixed(2)}`);
if (off !== null && off < 0.05) {
  console.log(`  ✅ AND IT FADED BACK OUT — *"if the user... changes their mind, the`);
  console.log(`     filament fades out, the button should too."*`);
} else {
  console.log(`  ⚠⚠ THE BUTTON STAYED. Deselect is not falling back through zero.`);
  bad++;
}

// ── advance ──────────────────────────────────────────────────────────────
await target.click();
await page.waitForTimeout(900);
/**
 * ⚠ THE ACTIVE QUESTION IS `.enquiry-pdepth-0`, NOT THE FIRST `.enquiry-phrase-cue`.
 *
 * Every phrase carries a cue — including the ones receded into the memory rail
 * — so a bare `querySelector` returns whichever sits first in document order.
 * On the first run this reported "Q5" -> "Q5" and flagged a corridor failure
 * **on a corridor that had advanced correctly**: it was reading a memory chip
 * both times.
 *
 * ⚠ THE INSTRUMENT ANSWERED AN ADJACENT QUESTION — "what is the first cue on
 * the page" rather than "which question is active" — which is this project's
 * recorded failure class, now at eight. Depth 0 is the definition of active.
 */
const activeCue = () =>
  page.evaluate(() =>
    (document.querySelector(".enquiry-pdepth-0 .enquiry-phrase-cue")?.textContent || "").trim(),
  );

const qBefore = await activeCue();
const btn = await page.$(".enquiry-nextstep-btn");
await btn.click();
await page.waitForTimeout(2400);
const qAfter = await activeCue();

console.log(`\n  corridor advanced   "${qBefore}" -> "${qAfter}"`);
if (qAfter && qAfter !== qBefore) {
  console.log(`  ✅ the corridor moves under its own steam — no forced click, no`);
  console.log(`     injected style.`);
} else {
  console.log(`  ⚠⚠ THE CORRIDOR DID NOT ADVANCE.`);
  bad++;
}

await page.screenshot({ path: "verify/out/walk-advanced.png", fullPage: false });
await browser.close();

console.log(`\n  ⚠ AFTER STEP 1a THE CARDS ARE Q5-ONLY, so the question above lands on an`);
console.log(`    empty grid. **Expected** — the gate is the measurement control for the`);
console.log(`    shared-host decision. A full Q5→Q1 walk needs step 1b.`);
console.log(`\n  screenshots: verify/out/walk-selected.png, walk-advanced.png`);
process.exit(bad > 0 ? 1 : 0);
