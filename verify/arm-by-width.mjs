/**
 * Does the opening's arm path depend on VIEWPORT WIDTH?
 *
 * ⚠ TWO HONEST INSTRUMENTS DISAGREED, AND THIS RECONCILES THEM. On 7 August
 * `verify/opening-arm.mjs` reported the compile arming the opening 3/3 at
 * 1440px. An independent audit reported the OPPOSITE: no canvas on the route at
 * all, `onCompiled` never firing, and the 4000ms ceiling as the only path — with
 * a fixed ~4.2s arm time across four loads.
 *
 * ⚠ BOTH CAN BE TRUE. `AnswerCardCanvas` returns `null` unless the viewport is
 * at least `PROTO_MIN_VIEWPORT_PX` (1280). Below that there is no canvas, so
 * nothing ever reports `compiled` and the backstop is the ONLY exit — the exact
 * failure mode `OPENING_ARM_CEILING_MS`'s own comment warns about: *"IF THIS IS
 * EVER THE THING THAT STARTS THE OPENING ON A NORMAL RUN, THE GATE IS BROKEN AND
 * THE PAGE IS MERELY HIDING IT."*
 *
 * ⚠ AND A LAPTOP AT 1280 CSS px IS A NORMAL RUN. This is not an edge case.
 *
 *   node verify/arm-by-width.mjs
 */
import { chromium } from "@playwright/test";
const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
const WIDTHS = [1440, 1280, 1279, 1180, 1024];

const browser = await chromium.launch({ headless: false, args: ["--enable-gpu","--use-angle=default","--ignore-gpu-blocklist"] });

console.log("\n  width   canvases   marks   heading starts   armed by");
console.log("  ─────────────────────────────────────────────────────────────");

for (const width of WIDTHS) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.goto(`${BASE}/start`, { waitUntil: "networkidle" });
  await page.waitForTimeout(6500);

  const r = await page.evaluate(() => {
    let start = null;
    for (const a of document.getAnimations()) {
      if (a.animationName === "enquiry-mask-reveal-horizontal" && typeof a.startTime === "number") {
        if (start === null || a.startTime < start) start = a.startTime;
      }
    }
    return {
      canvases: document.querySelectorAll("canvas").length,
      marks: performance.getEntriesByType("mark").filter(m => m.name.includes("canvas")).length,
      start: start === null ? null : Math.round(start),
    };
  });
  await page.close();

  // The heading's own delay is 600ms, so arm time is start - 600.
  const armAt = r.start === null ? null : r.start - 600;
  // The ceiling is 4000ms. Anything within ~250ms of it, with no canvas, is the
  // backstop firing rather than a compile reporting.
  const viaCeiling = armAt !== null && armAt > 3700;
  console.log(
    `  ${String(width).padStart(5)}   ${String(r.canvases).padStart(8)}   ${String(r.marks).padStart(5)}   ${String(r.start ?? "-").padStart(14)}   ${
      armAt === null ? "?" : viaCeiling ? "⚠ THE CEILING (backstop)" : "the compile"
    }`,
  );
}

await browser.close();
console.log("\n  ⚠ Verification is not approval.");
