// FILM THE CARD EXIT — both widths, one walk each.
//
//   node verify/card-exit-film.mjs
//
// ⚠ NOTHING IN THE SPLIT WORK HAS BEEN FILMED. Carl judges the gesture by eye;
// the numbers in `card-exit.mjs` only prove it is what we think it is.
//
// ⚠⚠ NAMED THINGS TO WATCH — this is not a general look:
//
//   1. THE CHOSEN CARD'S FILAMENT DEPARTING LIT. **An UNAPPROVED visual change.**
//      `litCards` clears at the label swap (1150ms), but the cards now leave from
//      901ms — so the selected card leaves the stage still lit, its filament
//      fading with it. Before this, the filament died at the same instant the
//      card blinked out and nobody ever saw it go.
//   2. THE QUIET STRETCH — 252ms with the stage empty before the next reveal.
//      Approved on figures; does it read as calm, or as a hole?
//   3. ANY FLASH AT THE HANDOVER. The exit's final state is numerically identical
//      to the entrance's frame 0, so there should be none.
//   4. THE 5 -> 4 -> 3 -> 2 -> 1 UNWIND reading as ONE gesture, not five events.
//
// Video only — no screenshot-per-sample. ~84ms/capture on the animation's own
// thread is the recorded fault where a sampler "will invent a defect and hide a
// real one".

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3100";
if (/:3000(\/|$)/.test(BASE)) {
  console.error(`\n⚠ REFUSING :3000 — production is the verdict.\n`);
  process.exit(1);
}

const OUT = "verify/out/card-exit-film";
mkdirSync(OUT, { recursive: true });

// ⚠ BOTH WIDTHS. Mobile has never been looked at in this work — rects yes,
// pixels no. 390 is the narrow case the grid reflows for.
const WIDTHS = [
  { label: "desktop", width: 1440, height: 900 },
  { label: "narrow", width: 390, height: 844 },
];

for (const vp of WIDTHS) {
  const browser = await chromium.launch({
    headless: false,
    args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
  });
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    recordVideo: { dir: OUT, size: { width: vp.width, height: vp.height } },
  });
  const page = await context.newPage();
  await page.goto(`${BASE}/start`, { waitUntil: "networkidle" });

  const renderer = await page.evaluate(() => {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    if (!gl) return "no webgl";
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    return ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "unknown";
  });
  console.log(`[${vp.label}] renderer: ${renderer}`);
  if (/swiftshader|llvmpipe|software|no webgl/i.test(renderer)) {
    console.error(`⚠ ABORTING ${vp.label} — software rasteriser.`);
    await context.close();
    await browser.close();
    continue;
  }

  await page.waitForTimeout(9000);
  const begin = await page.$(".enquiry-begin-hit");
  if (!begin) {
    console.error(`[${vp.label}] ⚠ no Begin hit target — is the corridor reachable at this width?`);
    await context.close();
    await browser.close();
    continue;
  }
  await begin.click();
  await page.waitForTimeout(13000);

  // Select a card first, so the FILAMENT change (watch item 1) is on film.
  const hit = await page.$('[data-testid="answer-card-hover-2"]');
  if (hit) {
    await hit.dispatchEvent("pointerdown");
    await page.waitForTimeout(1200);
  } else {
    console.log(`[${vp.label}] ⚠ no hit target — filming without a selection.`);
  }

  // One step, then hold through the exit, the quiet stretch and the next arrival.
  await page.evaluate(async () => {
    const btn = document.querySelector(".enquiry-nextstep-btn");
    const wrap = btn?.closest("div");
    if (wrap instanceof HTMLElement) {
      wrap.style.opacity = "1";
      wrap.style.pointerEvents = "auto";
    }
    await new Promise((r) => setTimeout(r, 300));
    if (btn instanceof HTMLElement) btn.click();
  });
  await page.waitForTimeout(5000);

  await context.close();
  await browser.close();
  console.log(`[${vp.label}] filmed → ${OUT}/`);
}

console.log(`\nVideos in ${OUT}/ — one per width, newest two.`);
console.log(`Watch: filament departing lit · the 252ms quiet stretch · any handover flash · the unwind as one gesture.\n`);
