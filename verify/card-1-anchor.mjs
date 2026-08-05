// Diagnostic: does card 1 enter at the MIDPOINT of the Q5 phrase reveal?
//
//   node verify/card-1-anchor.mjs [runs]      (default 3 runs, run 1 cold)
//
// CARL'S INSTRUCTION, and it is an approved one:
//   "Rather than wait for the line to end, card 1 can begin its appearance half
//    way through the text reveal."
//
// The reveal is a reading-speed instrument, so the OVERLAP is the point: the eye
// is still travelling along the line when the first card arrives beneath it.
//
// `CARD_FIRST_ENTRANCE_MS = Q5_REVEAL_MS / 2 = 650` implements exactly that and
// IS CORRECT. Measured 4 August, card 1 nevertheless arrived ~1.4s AFTER the
// reveal had finished — roughly 2 seconds late.
//
// ⚠ THE CAUSE IS THE ANCHOR, NOT THE VALUE. `CARD_FIRST_ENTRANCE_MS` counts from
// the ENTRANCE CLOCK, whose zero is when `active && compiled && warm` first goes
// true — i.e. after the async precompile. That is NOT when the reveal starts.
// The 4 August lateness equalled the precompile gap to within 5ms.
//
// ⚠ WHICH IS WHY THIS MUST BE RE-MEASURED RATHER THAN RECALIBRATED. The gap is
// not a constant: it contains shader compilation, which differs cold from warm
// and shrinks when precompile work lands. `references/card-1-anchor.md`:
// "If the precompile drops to ~100ms, card 1 lands inside the reveal, near its
// midpoint, and the defect repairs itself." A subtracted constant is guaranteed
// to go stale, and this project has recorded that happening twice.
//
// WHAT IT MEASURES, all from the Begin click:
//   reveal start   = the Q5 canvas mounting (`card-canvas-created`)
//   reveal end     = start + Q5_REVEAL_MS (1300)
//   TARGET         = start + 650  (the midpoint — what Carl asked for)
//   entrance zero  = `card-beat-650` minus 650
//   card 1 actual  = `card-beat-650`
//   precompile gap = entrance zero - reveal start
//
// ⚠ HEADED, --enable-gpu, RENDERER PRINTED. Headless has no GPU and silently
// substitutes SwiftShader, which invalidated a whole investigation on 4 August.
// Run 1 uses a fresh GPU profile (cold); later runs reuse it (warm), because the
// cold/warm difference is itself part of the finding.

import { chromium } from "@playwright/test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
const RUNS = Number(process.argv[2] ?? 3);

// Straight off `answer-card-geometry.ts` — not retyped from memory.
const Q5_REVEAL_MS = 1300;
const CARD_FIRST_ENTRANCE_MS = 650;
const WATCH_MS = 22000;

// One profile for the whole session: run 1 is cold, the rest warm.
const profile = mkdtempSync(join(tmpdir(), "card1-anchor-"));
const results = [];

for (let run = 1; run <= RUNS; run++) {
  const context = await chromium.launchPersistentContext(profile, {
    headless: false,
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
  });

  try {
    const page = await context.newPage();
    const res = await page.goto(`${BASE}/start?beattrace=1`, { waitUntil: "domcontentloaded" });
    if (!res || !res.ok()) {
      console.error(`FAILED: ${res?.status() ?? "no response"} — is the dev server running? (npm run dev)`);
      process.exit(1);
    }

    const renderer = await page.evaluate(() => {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2") || c.getContext("webgl");
      if (!gl) return "no webgl";
      const ext = gl.getExtension("WEBGL_debug_renderer_info");
      return ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "unknown";
    });
    if (/swiftshader|llvmpipe|software/i.test(renderer)) {
      console.error(`\n⚠ ABORTING — renderer is "${renderer}": a software rasteriser, not the GPU.`);
      process.exit(1);
    }

    const begin = page.getByRole("button", { name: /begin/i });
    await begin.waitFor({ state: "visible", timeout: 25000 });
    await page.waitForFunction(
      () => {
        const b = [...document.querySelectorAll("button")].find((el) => /begin/i.test(el.textContent ?? ""));
        return b && !b.disabled && getComputedStyle(b).pointerEvents !== "none";
      },
      { timeout: 25000 },
    );

    // t=0 at the click, so every number below is relative to Begin.
    await page.evaluate(() => { window.__t0 = performance.now(); });
    await begin.click();
    await page.waitForTimeout(WATCH_MS);

    const data = await page.evaluate(() => {
      const t0 = window.__t0;
      const mark = (n) => {
        const e = performance.getEntriesByName(n, "mark");
        return e.length ? Math.round(e[0].startTime - t0) : null;
      };
      const beats = performance
        .getEntriesByType("mark")
        .filter((m) => m.name.startsWith("card-beat-"))
        .map((m) => ({ rung: Number(m.name.replace("card-beat-", "")), at: Math.round(m.startTime - t0) }))
        .sort((a, b) => a.rung - b.rung);
      return {
        // ⚠ THE REAL Q5 CANVAS, NOT THE WARM-UP. Since Step 4 the warm-up
        // compiles ~6-7s BEFORE Begin, so reading a shared mark name gave a
        // NEGATIVE reveal start and a meaningless verdict. The two canvases now
        // emit distinct names; both are reported so the difference is visible
        // rather than assumed.
        canvasCreated: mark("card-canvas-created"),
        canvasCompiled: mark("card-canvas-compiled"),
        warmupCreated: mark("warmup-canvas-created"),
        warmupCompiled: mark("warmup-canvas-compiled"),
        lockup: mark("lockup-beat-6"),
        beats,
      };
    });

    const revealStart = data.canvasCreated;
    const card1 = data.beats.find((b) => b.rung === CARD_FIRST_ENTRANCE_MS)?.at ?? null;
    const entranceZero = card1 === null ? null : card1 - CARD_FIRST_ENTRANCE_MS;
    const target = revealStart === null ? null : revealStart + CARD_FIRST_ENTRANCE_MS;
    const revealEnd = revealStart === null ? null : revealStart + Q5_REVEAL_MS;
    const lateBy = card1 !== null && target !== null ? card1 - target : null;
    const precompileGap = entranceZero !== null && revealStart !== null ? entranceZero - revealStart : null;

    results.push({ run, revealStart, revealEnd, target, card1, entranceZero, lateBy, precompileGap, ...data });

    console.log(`\n─── RUN ${run} of ${RUNS}${run === 1 ? "  (cold GPU profile)" : "  (warm)"} ${"─".repeat(22)}`);
    console.log(`  Renderer                    ${renderer}`);
    console.log(`  warm-up canvas compiled     ${data.warmupCompiled === null ? "n/a" : `${data.warmupCompiled}ms`}` +
      (data.warmupCompiled !== null && data.warmupCompiled < 0 ? "   (before Begin — Step 4 working)" : ""));
    console.log(`  Q5 canvas mounts / reveal   +${revealStart ?? "?"}ms`);
    console.log(`  reveal MIDPOINT — target    +${target ?? "?"}ms   ← where card 1 should start`);
    console.log(`  reveal ends                 +${revealEnd ?? "?"}ms`);
    console.log(`  precompile gap              ${precompileGap === null ? "?" : `${precompileGap}ms`}`);
    console.log(`  entrance clock zero         +${entranceZero ?? "?"}ms`);
    console.log(`  CARD 1 ACTUALLY ENTERS      +${card1 ?? "NEVER"}ms`);
    console.log(`  → late by                   ${lateBy === null ? "?" : `${lateBy >= 0 ? "+" : ""}${lateBy}ms`}` +
      (lateBy !== null && revealEnd !== null && card1 > revealEnd ? `   ⚠ AFTER THE REVEAL HAS FINISHED` : ""));
    console.log(`  full ladder                 ${data.beats.map((b) => `+${b.at}`).join(", ")}` +
      (data.lockup !== null ? `  lockup +${data.lockup}` : ""));
  } finally {
    await context.close();
  }
}

try { rmSync(profile, { recursive: true, force: true }); } catch {}

const lates = results.map((r) => r.lateBy).filter((x) => x !== null);
const gaps = results.map((r) => r.precompileGap).filter((x) => x !== null);
const med = (xs) => (xs.length ? [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)] : null);

console.log(`\n${"═".repeat(62)}`);
console.log(`VERDICT — ${RUNS} run(s). Target: card 1 at the reveal's midpoint (+${CARD_FIRST_ENTRANCE_MS}ms from reveal start)`);
console.log(`${"═".repeat(62)}`);
console.log(`  Median lateness:       ${med(lates)}ms`);
console.log(`  Median precompile gap: ${med(gaps)}ms`);

const ml = med(lates);
if (ml !== null && Math.abs(ml) <= 120) {
  console.log(`
  → CARD 1 IS AT THE MIDPOINT, within a frame or two. The anchor defect has
    repaired itself — which is what the record predicted would happen if the
    precompile shrank. Confirm by eye before recording it as met.`);
} else if (ml !== null && ml > 120) {
  console.log(`
  → CARD 1 IS STILL LATE by ~${ml}ms.
    Compare it with the precompile gap above: if the two match, the cause is
    unchanged — the entrance clock starts after the precompile, not at the
    reveal. ⚠ DO NOT FIX BY SUBTRACTING A CONSTANT: the gap contains shader
    compilation and is not stable cold-to-warm. The honest fix is to anchor the
    first beat to the REVEAL'S START rather than to the entrance clock's zero.`);
} else {
  console.log(`
  → CARD 1 IS EARLY by ${Math.abs(ml)}ms — it now precedes the midpoint.`);
}

console.log(`
  ⚠ This answers "where does card 1 land", not "does it look right". The overlap
    is a feel judgement and Carl's alone.

  ⚠ Verification is not approval.
`);
