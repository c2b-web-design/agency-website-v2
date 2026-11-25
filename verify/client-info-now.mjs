/**
 * The client info section — the contact field — as it stands.
 *
 * ⚠ REACHED BY WALKING THE CORRIDOR, as a visitor (`lib/walk-to-client-info.mjs`).
 * ⚰️ It used `?skip=1`, a dev door written when the corridor could not reach
 * completion; selection returned on 11 August and the door was RETIRED on
 * 25 November 2026 (its hydration failure was the dev overlay's "2 Issues").
 *
 * ⚠ WHY IT MATTERS. Carl, 6 August 2026: *"Its important that you see it,
 * because what comes before it, what weve been building, has more than a direct
 * relationship to what comes after."* The contact field is four boxes built from
 * the same rim/bevel/face vocabulary as the answer card — so the card's
 * rebuilt cross-section is implicitly a statement about the field too, and the
 * two cannot honestly be judged apart.
 *
 * ⚠ THE FIELD IS AN APPROVED LAYER AND IS NOT BEING CHANGED HERE. This captures
 * it so the two objects can be compared. Its constants are `protected` precisely
 * so tuning the card cannot move it.
 *
 *   node verify/client-info-now.mjs
 */

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { walkToClientInfo } from "./lib/walk-to-client-info.mjs";

const OUT = "verify/out";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

const errs = [];
page.on("pageerror", (e) => errs.push(e.message));

// ⚰️ was `/start?skip=1` (the dev door, retired 25 November 2026): now WALKED there, as a visitor (`lib/walk-to-client-info.mjs`)
await walkToClientInfo(page);

const renderer = await page
  .evaluate(() => {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    const d = gl && gl.getExtension("WEBGL_debug_renderer_info");
    return d ? gl.getParameter(d.UNMASKED_RENDERER_WEBGL) : "unknown";
  })
  .catch(() => "unknown");
console.log("renderer:", renderer);

// ⚠ FIELD_ENTRANCE_END_MS IS 8100 — the last box starts at 5100 and fades for
// 3000. A harness that waited 5200 was recorded as screenshotting a field that
// had not finished arriving; this waits the real end plus a margin.
await page.waitForTimeout(11000);

const state = await page.evaluate(() => ({
  canvases: document.querySelectorAll("canvas").length,
  inputs: document.querySelectorAll("input, textarea").length,
  sendVisible: !!Array.from(document.querySelectorAll("button")).find((b) =>
    /send/i.test(b.textContent || ""),
  ),
}));
console.log("state:", JSON.stringify(state));
if (errs.length) console.log("page errors:", errs.slice(0, 4).join(" | "));

await page.screenshot({ path: `${OUT}/client-info-now.png` });
console.log(`\n  ${OUT}/client-info-now.png`);

await browser.close();
