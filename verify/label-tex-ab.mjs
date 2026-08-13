/**
 * ⚠ THE LABEL TEXTURE A/B — DOES THE 2048x512 UPLOAD DOMINATE THE Q5 REVEAL?
 *
 * Architect, 11 August 2026: the residue at `1c9b8d7` is HYPOTHESISED to be
 * upload + mip generation of five 4 MiB label textures, painted synchronously
 * in the commit that mounts the real canvas — inside the reveal.
 *
 * ⚠⚠ THIS HARNESS EXISTS TO FALSIFY THAT, NOT TO CONFIRM IT.
 *
 *   If the hypothesis HOLDS  — the resolution arms recover most of the gap.
 *   If the hypothesis FAILS  — they buy nothing, the cost is the Canvas2D
 *                              PAINT, and the fix is a canvas cache instead,
 *                              which is pixel-identical and needs no eye.
 *
 * **Either result names the fix.** A null result here is a success, not a
 * wasted run — record it that way.
 *
 * ⚠ INTERLEAVED, NOT SEQUENTIAL, AND THAT IS LOAD-BEARING. A first
 * `?parktraveller=1` A/B on this page measured 740 vs 388ms and looked
 * decisive; interleaved it collapsed to ~30-70ms and the rest was cache warmth.
 * **Measured variance on IDENTICAL code was 399-750ms — larger than the
 * regression being hunted.** Arms alternate within each round; medians only.
 *
 * ⚠ FRESH BROWSER PROFILE PER RUN, so no arm inherits another's GPU caches.
 *
 *   npm run build && npx next start -p 3100
 *   VERIFY_BASE_URL=http://localhost:3100 node verify/label-tex-ab.mjs 3
 *
 * Arms are `?labeltex=` values; `control` is the shipped 2048 default.
 * ⚠ `?nolabel=` IS DELIBERATELY NOT AN ARM HERE — it can never ship and a card
 * with no map is a different material variant. It bounds the prize; it does not
 * name a fix. Run it separately and last, if at all.
 */

import { chromium } from "@playwright/test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3100";
const ROUNDS = Number(process.argv[2] ?? 3);
const REVEAL_MS = 1300;

if (BASE.includes(":3000")) {
  console.error("\n⚠ REFUSING TO RUN AGAINST :3000 — dev frame numbers on this");
  console.error("  page are worthless (231ms vs 269ms, indistinguishable).\n");
  process.exit(1);
}

/** label texture width → query. `null` = shipped default. */
const ARMS =
  process.env.AB_ARMS === "cache"
    ? [
        // ⚠ CACHE OFF IS THE CONTROL HERE, because the cache SHIPS ON. The
        // control must be the state being compared against, not the default.
        // Both arms are ONE build, so this cannot measure the build.
        { name: "cache OFF", query: "?nolabelcache=1" },
        { name: "cache ON", query: "" },
      ]
    : process.env.AB_ARMS === "combined"
      ? [
          // ⚠ THE SHIPPING QUESTION: do the two savings ADD, or do they overlap?
          // "Baseline" here is both features off — the state before this work.
          { name: "2048 nocache", query: "?nolabelcache=1" },
          { name: "2048 cache", query: "" },
          { name: "1024 cache", query: "?labeltex=1024" },
        ]
      : [
          { name: "control 2048", query: "" },
          { name: "1024", query: "?labeltex=1024" },
          { name: "512", query: "?labeltex=512" },
        ];

async function measure(query) {
  const profile = mkdtempSync(join(tmpdir(), "labeltex-"));
  const context = await chromium.launchPersistentContext(profile, {
    headless: false,
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
  });
  const page = await context.newPage();

  await page.addInitScript(() => {
    const W = window;
    W.__ab = { frames: [], revealStart: null };
    const tick = () => {
      W.__ab.frames.push(performance.now());
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  const cleanup = async () => {
    await context.close();
    rmSync(profile, { recursive: true, force: true });
  };

  const res = await page.goto(`${BASE}/start${query}`, { waitUntil: "domcontentloaded" });
  if (!res || !res.ok()) {
    await cleanup();
    throw new Error(`server said ${res?.status() ?? "nothing"}`);
  }

  const renderer = await page.evaluate(() => {
    const gl = document.createElement("canvas").getContext("webgl2");
    if (!gl) return "no webgl";
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    return ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "unknown";
  });
  if (/swiftshader|llvmpipe|software|no webgl/i.test(renderer)) {
    await cleanup();
    throw new Error(`software rasteriser: ${renderer}`);
  }

  await page.getByRole("button", { name: /begin/i }).click();
  await page.waitForFunction(
    () => {
      const el = document.querySelector(".enquiry-q-text-reveal");
      const anim = el
        ?.getAnimations?.()
        .find((a) => a.animationName === "enquiry-mask-reveal-horizontal");
      return !!anim && typeof anim.startTime === "number";
    },
    { timeout: 30000 },
  );
  await page.evaluate(() => {
    const el = document.querySelector(".enquiry-q-text-reveal");
    const anim = el
      ?.getAnimations?.()
      .find((a) => a.animationName === "enquiry-mask-reveal-horizontal");
    window.__ab.revealStart = anim.startTime;
  });

  await page.waitForTimeout(REVEAL_MS + 700);

  const worst = await page.evaluate(
    ({ revealMs }) => {
      const W = window;
      const base = W.__ab.revealStart;
      const frames = W.__ab.frames.map((t) => t - base).sort((a, b) => a - b);
      let worst = 0;
      for (let i = 1; i < frames.length; i++) {
        const at = frames[i - 1];
        if (at < -100 || at > revealMs + 400) continue;
        worst = Math.max(worst, frames[i] - frames[i - 1]);
      }
      return Math.round(worst);
    },
    { revealMs: REVEAL_MS },
  );

  await cleanup();
  return { worst, renderer };
}

const results = new Map(ARMS.map((a) => [a.name, []]));
let renderer = "";

console.log(`\nbase ${BASE} — ${ROUNDS} interleaved round(s)\n`);

for (let round = 1; round <= ROUNDS; round++) {
  // ⚠ ARM ORDER ROTATES PER ROUND, so no arm is always first (and therefore
  // always coldest). Interleaving alone does not remove an order effect if the
  // order is identical every round.
  const order = ARMS.map((_, i) => ARMS[(i + round - 1) % ARMS.length]);
  for (const arm of order) {
    const { worst, renderer: r } = await measure(arm.query);
    renderer = r;
    results.get(arm.name).push(worst);
    console.log(`  round ${round}  ${arm.name.padEnd(13)} ${String(worst).padStart(4)}ms`);
  }
}

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};

console.log(`\nrenderer: ${renderer}`);
console.log("\n══════════════════════════════════════════════════");
console.log("  worst frame gap inside the reveal — MEDIANS");
console.log("══════════════════════════════════════════════════");

const controlMedian = median(results.get(ARMS[0].name));
for (const arm of ARMS) {
  const xs = results.get(arm.name);
  const m = median(xs);
  const delta = m - controlMedian;
  const tag = arm.name === ARMS[0].name
    ? ""
    : `  ${delta >= 0 ? "+" : ""}${delta}ms vs control`;
  console.log(`  ${arm.name.padEnd(13)} ${String(m).padStart(4)}ms   [${xs.join(", ")}]${tag}`);
}

console.log("\n── READING THIS ──");
console.log("  D-046's approved state measured 82ms. The reveal today is 118-135ms.");
console.log("  If 1024 lands near 82ms, the upload hypothesis holds and the arm is");
console.log("  a candidate — SUBJECT TO CARL'S EYE ON CRISPNESS, which no number here");
console.log("  can stand in for.");
console.log("\n  If 1024 and 512 both sit on top of the control, the hypothesis is");
console.log("  FALSE: the cost is the Canvas2D paint, not the upload, and the fix is");
console.log("  the shared canvas cache — pixel-identical, no eye needed.");
console.log("\n⚠ THIS MEASURES A FRAME GAP. It does not know what the label LOOKS like.");
