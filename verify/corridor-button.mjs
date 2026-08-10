// Does the Next step mesh render in the REAL corridor, at the real box?
//
//   node verify/corridor-button.mjs [viewportWidth]
//
// ⚠⚠ THE CORRIDOR CANNOT ADVANCE PAST Q5 IN THIS BUILD, AND THAT IS DELIBERATE.
// Carl, chunk 3: *"just remove the 5 cards that are there now and build"* and
// *"we do not need to advance atm."* `toggleOption` (enquiry-opening.tsx:1131)
// has no caller, so `selected` is always empty and the Next step button's
// wrapper stays `opacity: 0; pointer-events: none`.
//
// **So the button cannot be reached by clicking.** This harness forces the
// wrapper visible from the outside — it does NOT simulate a selection, and it
// must not be read as proving the flow works. It answers one question:
// *when the button IS shown, does the mesh render behind it at the right size?*
//
// ⚠ IT ALSO CHECKS THE SIZE MATCHES THE DOM BUTTON, which is the rollout
// constraint: Carl — *"Send is a different width."* `NextStepMeshButton`
// measures its own box rather than reading NEXTSTEP_WIDTH_PX, and this is what
// verifies that measurement actually tracks the label.
//
// ⚠ SCREENSHOT, NEVER readPixels/toDataURL — `preserveDrawingBuffer: false`.
// ⚠ HEADED, --enable-gpu, ABORTS ON A SOFTWARE RASTERISER.
//
// ══════════════════════════════════════════════════════════════════════════
// ⚠⚠ THE REVEAL COST WAS MEASURED ON A PRODUCTION BUILD, AND THE DEV NUMBERS
// WERE WORTHLESS. Recorded here because the first attempt nearly misled.
// ══════════════════════════════════════════════════════════════════════════
//
// `verify/reveal-cost.mjs` against the DEV server reported a 231ms worst frame
// gap with the mesh in — apparently a regression on the recorded 167ms, with
// `crownHeight` and `usePillGeometry` visible in the profile, which made a
// tidy story. **The control run without the mesh measured 269ms.** The arms
// were indistinguishable: dev-server variance dwarfed the effect.
//
// On `next start` (production), four runs with the mesh:
//
//     118ms   124ms   132ms   135ms        against a recorded 167ms
//
// ⚠ SO THE GEOMETRY IN THE DEV PROFILE WAS REAL BUT NOT DECISIVE — Turbopack
// compilation and unminified three.js dominate the window it appeared in. This
// project has recorded the same trap twice: a bisect that measured Turbopack,
// and a bisect that measured a zombie server. **Measure the reveal on a
// production build, per arm, or do not measure it.**
//
// ⚠ AND A ZOMBIE SERVER NEARLY DID IT AGAIN: an `&`-backgrounded `next start`
// survived a TaskStop, held port 3100, and answered 200 to a readiness probe
// while a NEWER build sat unserved. Kill by PID on the port and confirm the
// port is free before trusting any number that comes off it.

import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
const WIDTH = Number(process.argv[2] ?? 1440);

mkdirSync("verify/out", { recursive: true });

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({
  viewport: { width: WIDTH, height: 900 },
  deviceScaleFactor: 2,
});

await page.goto(`${BASE}/start`, { waitUntil: "networkidle" });

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
console.log(`viewport: ${WIDTH}x900\n`);

// ⚠ THE OPENING GATES BEGIN FOR ~7.4s, and `.enquiry-begin-parent` intercepts
// pointer events until then. Click the hit target, not the visible button.
await page.waitForTimeout(9000);
const begin = await page.$(".enquiry-begin-hit");
if (!begin) {
  console.error("Begin hit target not found");
  await browser.close();
  process.exit(1);
}
await begin.click();
await page.waitForTimeout(5000);

// ⚠ FORCE THE WRAPPER VISIBLE. See the header: there is no way to select an
// answer in this build, so the button is never shown by the normal path.
await page.evaluate(() => {
  const btn = document.querySelector(".enquiry-nextstep-btn");
  const wrap = btn?.closest("div");
  if (wrap instanceof HTMLElement) {
    wrap.style.opacity = "1";
    wrap.style.pointerEvents = "auto";
  }
});
await page.waitForTimeout(1500);

const info = await page.evaluate(() => {
  const btn = document.querySelector(".enquiry-nextstep-btn");
  if (!btn) return null;
  const host = btn.parentElement; // the <span> NextStepMeshButton renders
  const canvasEl = host?.querySelector("canvas");
  const b = btn.getBoundingClientRect();
  const c = canvasEl?.getBoundingClientRect();
  return {
    hasMeshClass: btn.className.includes("enquiry-nextstep-btn--mesh"),
    button: { w: b.width, h: b.height, x: b.left, y: b.top },
    canvas: c ? { w: c.width, h: c.height, x: c.left, y: c.top } : null,
    label: (btn.textContent || "").trim(),
    // The painted surface must be gone where the mesh renders.
    bgImage: getComputedStyle(btn).backgroundImage,
  };
});

if (!info) {
  console.error("next-step button not found in the corridor");
  await browser.close();
  process.exit(1);
}

console.log(`  label            "${info.label}"`);
console.log(`  button box       ${info.button.w.toFixed(1)} x ${info.button.h.toFixed(1)}`);
console.log(`  canvas box       ${info.canvas ? `${info.canvas.w.toFixed(1)} x ${info.canvas.h.toFixed(1)}` : "— NO CANVAS —"}`);
console.log(`  --mesh class     ${info.hasMeshClass ? "yes" : "NO"}`);
console.log(`  background-image ${info.bgImage === "none" ? "none (mesh is the surface)" : "STILL PAINTED"}`);
console.log();

let bad = 0;

if (!info.canvas) {
  console.log(`  ⚠⚠ NO CANVAS. The mesh is not mounting in the corridor.`);
  bad++;
} else {
  // The canvas is padded by NEXTSTEP_CANVAS_PAD_PX (14) on each side.
  const PAD = 14;
  const dw = Math.abs(info.canvas.w - (info.button.w + PAD * 2));
  const dh = Math.abs(info.canvas.h - (info.button.h + PAD * 2));
  if (dw > 2 || dh > 2) {
    console.log(`  ⚠⚠ THE CANVAS DOES NOT MATCH THE BUTTON. Expected the button's box`);
    console.log(`     plus ${PAD}px padding each side; off by ${dw.toFixed(1)} x ${dh.toFixed(1)}.`);
    console.log(`     **This is the rollout constraint failing** — the mesh must be sized`);
    console.log(`     from the MEASURED label, never from NEXTSTEP_WIDTH_PX.`);
    bad++;
  } else {
    console.log(`  ✅ the canvas tracks the button's measured box (+${PAD}px padding).`);
  }
}

if (!info.hasMeshClass) {
  console.log(`  ⚠ THE --mesh CLASS IS ABSENT, so the painted CSS surface is still drawn`);
  console.log(`    underneath. Expected once the box is measured.`);
  bad++;
} else if (info.bgImage !== "none") {
  console.log(`  ⚠⚠ THE CSS SURFACE IS STILL PAINTED behind the mesh — two domes, one`);
  console.log(`     painted and one geometric. Expect a seam at the rim.`);
  bad++;
} else {
  console.log(`  ✅ the painted CSS surface is suppressed; the mesh is the material.`);
}

const host = await page.$(".enquiry-nextstep-btn");
const hb = await host.boundingBox();
const pad = 26;
await page.screenshot({
  path: `verify/out/corridor-button-${WIDTH}.png`,
  clip: { x: hb.x - pad, y: hb.y - pad, width: hb.width + pad * 2, height: hb.height + pad * 2 },
});
console.log(`\n  saved verify/out/corridor-button-${WIDTH}.png`);

await browser.close();

console.log(`\n  ⚠ THIS FORCED THE BUTTON VISIBLE. It proves the mesh renders and is sized`);
console.log(`    correctly — NOT that the corridor can be walked. Selection does not`);
console.log(`    exist in this build.`);
process.exit(bad > 0 ? 1 : 0);
