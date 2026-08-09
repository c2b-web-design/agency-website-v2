/**
 * The card row's travelling light, and the field's orbit, SIDE BY SIDE.
 *
 *   node verify/rest-vs-field.mjs
 *
 * ⚠ THIS SHOWS, IT DOES NOT MEASURE. Carl's instruction on 9 August was that the
 * Builder kept measuring when asked to show, and that he has the advantage
 * watching continuous motion. So this writes FRAMES for his eye. There is no
 * pass/fail line anywhere in it and there must not be one — the only verdict
 * that matters here is his.
 *
 * ⚠ WHY BOTH SECTIONS IN ONE RUN. Carl: *"reference the client info section,
 * this is similar."* The field's orbit is an APPROVED, working effect; the card
 * traveller is not. Capturing them in the same run, on the same GPU, at the same
 * scale factor is the only way the comparison is fair — two runs on two days
 * with two servers is how this project has misled itself before.
 *
 * ⚠ AND THE TWO RIGS ARE NOT THE SAME KIND OF LIGHT, which is the thing the
 * frames are meant to make visible:
 *
 *   | | field (approved) | cards (in progress) |
 *   |---|---|---|
 *   | type    | SpotLight, aimed at a target | PointLight, no aim |
 *   | decay   | 2 — physical falloff         | 0 — distance changes nothing |
 *   | intensity | DERIVED 1.6 x 341^2         | hand-picked 0.9 |
 *
 * A PointLight at decay 0 cannot produce the field's uneven, arriving glint,
 * because at decay 0 distance is not in the equation at all.
 */

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const OUT = "verify/out/rest-vs-field";
mkdirSync(OUT, { recursive: true });

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

// ⚠ RENDERER PRINTED AND SOFTWARE ABORTED. `q5-stutter.mjs` ran headless until
// 9 August and its numbers described SwiftShader, not Carl's machine. Every
// harness here checks.
async function assertRealGpu() {
  const renderer = await page
    .evaluate(() => {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2") || c.getContext("webgl");
      const d = gl && gl.getExtension("WEBGL_debug_renderer_info");
      return d ? gl.getParameter(d.UNMASKED_RENDERER_WEBGL) : "unknown";
    })
    .catch(() => "unknown");
  console.log("renderer:", renderer);
  if (/swiftshader|llvmpipe|software/i.test(String(renderer))) {
    console.error("\n⚠ ABORTING — software rasteriser. These frames would not be Carl's machine.");
    await browser.close();
    process.exit(1);
  }
}

/** Capture a strip of frames across a moving light, anchored to a real element. */
async function sweep(label, clip, moments) {
  let last = 0;
  for (const t of moments) {
    await page.waitForTimeout(t - last);
    last = t;
    await page.screenshot({ path: `${OUT}/${label}-t${String(t).padStart(5, "0")}.png`, clip });
  }
  console.log(`  ${label}: ${moments.length} frames`);
}

// ── THE CARD ROW ────────────────────────────────────────────────────────────
// Three passes: the rig as it stands, the traveller alone, and the traveller
// alone at an intensity high enough to actually judge the arc by.
// ⚠ THERE IS NO `?skip=` DOOR TO THE CARDS. `?skip=1` sets stage "complete",
// which is the CONTACT FIELD (enquiry-opening.tsx:477-479). The only way to the
// answer row is to press Begin and wait out the opening, so that is what this
// does — checked in the source rather than assumed, because a harness that
// screenshots the wrong stage produces confident pictures of nothing.
const CARD_PASSES = [
  ["cards-asis", "/start"],
  ["cards-alone", "/start?noglobal=1"],
  ["cards-alone-bright", "/start?noglobal=1&travint=6"],
  ["cards-path", "/start?lighthelpers=1&noglobal=1&travint=6"],
];

// The visible pass is 11000ms. Uneven samples so they cannot land in phase and
// report the same instant repeatedly.
const CARD_MOMENTS = [0, 900, 2100, 3400, 4800, 6300, 7700, 9200, 10600];

await assertRealGpu();

for (const [label, url] of CARD_PASSES) {
  await page.goto(`${BASE}${url}`, { waitUntil: "networkidle" });

  // Begin becomes active only after the opening mask's animationstart, so it is
  // waited for rather than clicked blind.
  const begin = page.getByRole("button", { name: /begin/i });
  await begin.waitFor({ state: "visible", timeout: 20000 });
  await begin.click();

  // The Q5 reveal is a 1300ms wipe; the cards follow it. Settle well past both
  // so the strip is the RESTING light and not the entrance.
  await page.waitForTimeout(4200);

  const clip = await page.evaluate(() => {
    const cards = [...document.querySelectorAll("canvas")];
    if (!cards.length) return null;
    // The answer-card canvas is the widest one on the page at this stage.
    const r = cards
      .map((c) => c.getBoundingClientRect())
      .sort((a, b) => b.width * b.height - a.width * a.height)[0];
    const m = 30;
    return {
      x: Math.max(0, r.x - m),
      y: Math.max(0, r.y - m),
      width: Math.min(1440 - Math.max(0, r.x - m), r.width + m * 2),
      height: r.height + m * 2,
    };
  });

  if (!clip || clip.width < 40 || clip.height < 40) {
    console.log(`  ${label}: no canvas found — skipped`);
    continue;
  }
  await sweep(label, clip, CARD_MOMENTS);
}

// ── THE CLIENT INFO FIELD, the approved reference ───────────────────────────
// Its circuit is 6000ms front + 3000ms back = 9000ms. Sampled across a FULL
// circuit so the hidden half is in the strip too — the return is part of the
// shape Carl drew, and a strip that only shows the front pass hides the very
// thing being compared.
const FIELD_MOMENTS = [0, 800, 1900, 3100, 4400, 5700, 6600, 7500, 8600];

await page.goto(`${BASE}/start?skip=1`, { waitUntil: "networkidle" });
await page.waitForTimeout(8100 + 2500); // entrance, then settle

const fieldClip = await page.evaluate(() => {
  const els = [...document.querySelectorAll("input, textarea")];
  if (!els.length) return null;
  const rs = els.map((e) => e.getBoundingClientRect());
  const x0 = Math.min(...rs.map((r) => r.x));
  const y0 = Math.min(...rs.map((r) => r.y));
  const x1 = Math.max(...rs.map((r) => r.x + r.width));
  const y1 = Math.max(...rs.map((r) => r.y + r.height));
  const m = 40;
  return { x: Math.max(0, x0 - m), y: Math.max(0, y0 - m), width: x1 - x0 + m * 2, height: y1 - y0 + m * 2 };
});

if (fieldClip) {
  await sweep("field-orbit", fieldClip, FIELD_MOMENTS);
} else {
  console.log("  field-orbit: no inputs found — the field may not be on screen at this stage");
}

await browser.close();
console.log(`\n  ${OUT}/`);
console.log(`\n  ⚠ These are frames, not a verdict. Verification is not approval.\n`);
