// A plain screenshot of the Next step bench — no assertions, just pixels.
//
//   node verify/ns-shot.mjs "?zoom=5&litint=2.4" verify/out/ns-zoom5.png
//
// ⚠⚠ IT CLIPS TO THE CANVAS WRAPPER, NOT `#mesh-button`. `nextstep-look.mjs`
// clips to `#mesh-button`, which stays 116x41 whatever `?zoom=` is set to —
// so on a zoomed render that crop lands on background and the button is not in
// the frame at all. The first zoomed capture on 10 August 2026 came back as a
// flat navy rectangle with the label on it for exactly this reason.
//
// ⚠ THE WRAPPER IS THE THING THAT GROWS. `NextStepCanvas` sizes its own div from
// `?zoom=`, so `#mesh-button > div` is the box that actually contains the render.
//
// ⚠ SCREENSHOT, NEVER readPixels/toDataURL — `preserveDrawingBuffer: false` on a
// static canvas returns an empty buffer from both. Recorded at length in
// `nextstep-look.mjs`; it cost five wrong fixes.
//
// ⚠ HEADED, --enable-gpu, ABORTS ON A SOFTWARE RASTERISER.

import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
const query = process.argv[2] ?? "";
const out = process.argv[3] ?? "verify/out/ns-shot.png";

mkdirSync("verify/out", { recursive: true });

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({
  viewport: { width: 1100, height: 800 },
  deviceScaleFactor: 3,
});

await page.goto(`${BASE}/proto/nextstep${query}`, { waitUntil: "networkidle" });

const renderer = await page.evaluate(() => {
  const c = document.createElement("canvas");
  const gl = c.getContext("webgl2") || c.getContext("webgl");
  if (!gl) return "no webgl";
  const ext = gl.getExtension("WEBGL_debug_renderer_info");
  return ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "unknown";
});
if (/swiftshader|llvmpipe|software|no webgl/i.test(renderer)) {
  console.error(`⚠ ABORTING — renderer is "${renderer}": a software rasteriser.`);
  await browser.close();
  process.exit(1);
}
console.log(`renderer: ${renderer}`);

await page.waitForTimeout(2500);

const el = await page.$("#mesh-button > div");
if (!el) {
  console.error("canvas wrapper not found under #mesh-button");
  await browser.close();
  process.exit(1);
}
const bb = await el.boundingBox();
const pad = 6;
await page.screenshot({
  path: out,
  clip: { x: bb.x - pad, y: bb.y - pad, width: bb.width + pad * 2, height: bb.height + pad * 2 },
});
console.log(`saved ${out}  (wrapper ${Math.round(bb.width)}x${Math.round(bb.height)})`);

await browser.close();
