// Bisect: WHICH COMMIT UNDID D-046?
//
//   node verify/stall-bisect.mjs            measure every arm
//   node verify/stall-bisect.mjs <sha>      measure one arm (already built)
//
// ══════════════════════════════════════════════════════════════════════════
// WHY — A NUMBER THAT WAS APPROVED HAS MOVED
// ══════════════════════════════════════════════════════════════════════════
//
// D-046 (`3a7cf1f`, 9 August) fixed the Q5 stutter and Carl approved it by eye:
// *"it looks pretty clean"*. Recorded: **86ms worst frame gap, cold.**
//
// Today, 10 August, on the same defect:
//
//     verify/reveal-cost.mjs        262-323ms worst gap inside the reveal
//     (9 Aug, production build)     596ms   — q5-stall-10-august.md
//
// ⚠ THAT IS A REGRESSION, NOT D-046's KNOWN RESIDUE. D-046 accepted ~70ms
// still landing in the wipe. 262-323ms is three to four times that, and Carl
// sees it: *"it stalls on the word 'here'"*.
//
// ⚠ SO THE SHARED-HOST RESTRUCTURE IS NOT THE FIRST MOVE. D-046 scoped that
// route against the ~70ms residue and **explicitly did not authorise it**:
// *"A true single-canvas fix needs a host that never unmounts — a restructure
// of approved layout, with a known hazard: the canvas maps one world unit to
// one CSS pixel from its measured size, so a changed measurement path would
// reposition every card."* Restoring 86ms costs nothing approved; the
// restructure risks every card's position at every viewport.
//
// ── ⚠⚠ PRODUCTION BUILD PER ARM. THIS IS THE WHOLE POINT. ────────────────
//
// `q5-stall-10-august.md` records a bisect that produced a convincing
// staircase (161 -> 312 -> 620ms) and **convicted the wrong commits**. The
// measurements were taken right after `git checkout` on a LIVE DEV SERVER, so
// Turbopack was recompiling during the run:
//
//     ⚠ A BISECT THAT CHANGES FILES ON A LIVE DEV SERVER IS MEASURING THE
//       SERVER.
//
// This script therefore does, per arm: checkout -> `npm run build` -> start
// `npm start` -> measure -> stop. Slow and correct.
//
// ── WHAT IT MEASURES ─────────────────────────────────────────────────────
//
// Worst frame gap INSIDE the phrase reveal, reveal-relative (t=0 is the
// `enquiry-mask-reveal-horizontal` animation's own `startTime`), plus when the
// real canvas creates its WebGL context — the quantity `reveal-cost.mjs`
// identified as tracking the stall.
//
// ⚠ FRESH BROWSER PROFILE PER RUN. ANGLE keeps an on-disk binary shader cache
// that is worth ~758ms here (`verify/warmup-value.mjs`), so a shared profile
// would make later arms look artificially fast and invent a staircase — the
// same shape of error as the dev-server bisect.
//
// ⚠ HEADED, --enable-gpu, ABORTS ON A SOFTWARE RASTERISER. Every pre-9-August
// verdict in this project came from SwiftShader.
//
// ⚠ IT NAMES A COMMIT, NOT A CAUSE. A commit that moves the number is where to
// READ next, not a thing to revert on sight.

import { chromium } from "@playwright/test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
const REVEAL_MS = 1300;
const RUNS = Number(process.env.BISECT_RUNS ?? 2);

async function measureOnce() {
  const profile = mkdtempSync(join(tmpdir(), "stall-bisect-"));
  const context = await chromium.launchPersistentContext(profile, {
    headless: false,
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
  });
  const page = await context.newPage();

  // ⚠⚠ PROVE THE PAGE IS ALIVE AND IS THIS ARM'S BUILD.
  //
  // Architect, 10 August: the first run of this bisect measured a ZOMBIE
  // SERVER. `kill $!` in the driver killed the npm shim, not the `next start`
  // grandchild (Windows has no process-group signal delivery), so the orphan
  // kept :3000. The next arm's own server hit EADDRINUSE and exited, while
  // `curl localhost:3000/start` still returned 200 — from the PREVIOUS arm.
  //
  // ⚠ AND THE ORPHAN SERVES A BUILD THAT NO LONGER EXISTS. The new arm's
  // `npm run build` rewrites `.next` with new content-hashed chunks; the
  // resident server SSRs fine from its own bundle, so `res.ok()` passes, but
  // every client chunk 404s and **React never hydrates**. An un-hydrated page
  // renders exactly `aria-disabled="true"` forever — which reads as "this
  // commit is broken" rather than "nothing measured this commit".
  //
  // Confirmed: `netstat` showed PID 4308 holding :3000 with no server
  // intentionally running.
  const chunk404s = [];
  page.on("response", (r) => {
    if (r.status() === 404 && r.url().includes("/_next/")) chunk404s.push(r.url());
  });

  await page.addInitScript(() => {
    const W = window;
    W.__sb = { frames: [], ctx: [], revealStart: null };
    const origGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
      const ctx = origGetContext.call(this, type, ...rest);
      if (String(type).includes("webgl") && ctx) W.__sb.ctx.push(performance.now());
      return ctx;
    };
    const tick = () => {
      W.__sb.frames.push(performance.now());
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  try {
    const res = await page.goto(`${BASE}/start`, { waitUntil: "domcontentloaded" });
    if (!res || !res.ok()) throw new Error(`HTTP ${res?.status() ?? "none"}`);

    const renderer = await page.evaluate(() => {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2") || c.getContext("webgl");
      if (!gl) return "no webgl";
      const ext = gl.getExtension("WEBGL_debug_renderer_info");
      return ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "unknown";
    });
    if (/swiftshader|llvmpipe|software|no webgl/i.test(renderer)) {
      throw new Error(`software rasteriser: ${renderer}`);
    }

    // ⚠ HYDRATION FIRST — IS THE PAGE ALIVE AT ALL?
    //
    // Architect, 10 August: this is what separates UNMEASURABLE from a slow
    // arm. Every backstop in `enquiry-opening.tsx` is client-side — the 4000ms
    // `OPENING_ARM_CEILING_MS` is a `setTimeout` inside an effect — so a page
    // that never hydrates has no path to arming at all, and waiting longer
    // cannot help.
    //
    // The mask's Animation object is the honest signal: it exists only if
    // React ran, applied the class, and the browser created the animation.
    // ⚠ IT SHARES NO CONSTANT WITH THE THING UNDER TEST — not
    // `OPENING_ARM_CEILING_MS`, not the 7400ms delay, not `REVEAL_MS`. It
    // observes what the browser actually did. `q5-stutter.mjs` is this
    // project's standing example of a harness that "confirmed the fix instead
    // of testing it" by sharing its window with the fix.
    const hydrated = await page
      .waitForFunction(
        () => {
          const m = document.querySelector(".enquiry-button-mask");
          return (
            !!m &&
            !!m.getAnimations?.().some((a) => a.animationName === "enquiry-mask-reveal-radial")
          );
        },
        { timeout: 20000 },
      )
      .then(() => true)
      .catch(() => false);

    if (!hydrated) {
      const why = chunk404s.length
        ? `page never hydrated — ${chunk404s.length} /_next/ chunk 404s (STALE SERVER: this is not this arm's build)`
        : `page never hydrated — no /_next/ 404s, so investigate before trusting any number`;
      const e = new Error(why);
      e.unmeasurable = true;
      throw e;
    }

    // Only NOW is `aria-disabled` meaningful. Note this is the same predicate
    // Playwright's own `click()` actionability uses — `coreBundle.js:19872`
    // waits on ["visible","enabled","stable"], and "enabled" resolves via
    // `getAriaDisabled` → `hasExplicitAriaDisabled`, which reads
    // `aria-disabled="true"`. So the explicit poll below is not stricter than a
    // bare `.click()`; it just fails with a better message.
    const begin = page.getByRole("button", { name: /begin/i });
    await begin.waitFor({ state: "visible", timeout: 30000 });
    await page
      .waitForFunction(
        () => {
          const b = [...document.querySelectorAll("button")].find((el) =>
            /begin/i.test(el.textContent || ""),
          );
          return !!b && b.getAttribute("aria-disabled") !== "true" && !b.disabled;
        },
        { timeout: 30000 },
      )
      .catch(() => {
        const e = new Error("hydrated, but Begin never enabled — the opening never armed");
        e.unmeasurable = true;
        throw e;
      });
    await begin.click();
    await page.waitForFunction(
      () => {
        const el = document.querySelector(".enquiry-q-text-reveal");
        const anim = el
          ?.getAnimations?.()
          .find((a) => a.animationName === "enquiry-mask-reveal-horizontal");
        if (!anim || typeof anim.startTime !== "number") return false;
        window.__sb.revealStart = anim.startTime;
        return true;
      },
      { timeout: 30000 },
    );
    await page.waitForTimeout(REVEAL_MS + 800);

    return await page.evaluate(
      ({ revealMs }) => {
        const W = window;
        const base = W.__sb.revealStart;
        const rel = (t) => Math.round(t - base);
        const frames = W.__sb.frames.map(rel).sort((a, b) => a - b);
        let worst = { gap: 0, at: null };
        for (let i = 1; i < frames.length; i++) {
          const gap = frames[i] - frames[i - 1];
          if (frames[i - 1] >= -100 && frames[i - 1] <= revealMs + 400 && gap > worst.gap) {
            worst = { gap, at: frames[i - 1] };
          }
        }
        return { worst, ctxInWindow: W.__sb.ctx.map(rel).filter((t) => t > -1000 && t < revealMs + 400) };
      },
      { revealMs: REVEAL_MS },
    );
  } finally {
    await context.close();
    rmSync(profile, { recursive: true, force: true });
  }
}

// ⚠⚠ THREE OUTCOMES, NEVER TWO.
//
// Architect, 10 August: the first run collapsed "could not measure" and
// "measured badly" into one `MEASURE FAILED` line, printed beside real
// numbers. Six arms were reported as if they had been tested; none had been.
//
//   MEASURED n     a real number from a live page serving this arm's build
//   UNMEASURABLE   the page never hydrated / never armed — says NOTHING
//                  about the commit
//   DRIVER FAILED  the harness itself broke
const out = [];
let unmeasurable = null;

try {
  for (let i = 0; i < RUNS; i++) out.push(await measureOnce());
} catch (err) {
  if (err && err.unmeasurable) {
    console.log(`  UNMEASURABLE  ${err.message}`);
    console.log(`  ⚠ THIS SAYS NOTHING ABOUT THE COMMIT — do not read it as a slow arm.`);
    process.exit(2);
  }
  console.log(`  DRIVER FAILED  ${err?.message ?? err}`);
  process.exit(3);
}
void unmeasurable;

const gaps = out.map((r) => r.worst.gap);
const ats = out.map((r) => r.worst.at);
const ctxs = out.map((r) => r.ctxInWindow.join(","));

console.log(JSON.stringify({ gaps, ats, ctxs }));
console.log(`  MEASURED`);
console.log(`  worst gaps  ${gaps.join("ms, ")}ms`);
console.log(`  at          ${ats.join("ms, ")}ms`);
console.log(`  ctx in window ${ctxs.map((c) => `[${c}]`).join(" ")}`);
