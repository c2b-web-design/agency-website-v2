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


// ⚠⚠ MARK NAMING CORRECTED 18 August 2026 — READ IF A FIGURE HERE LOOKS ODD.
//
// `answer-card-canvas.tsx` used to name its marks from `warm && !active`, and
// `warm` DEFAULTS TO TRUE. On the shared-host builds (14–18 August) the REAL
// canvas therefore emitted `warmup-canvas-*` and `card-canvas-*` never fired.
// **The marks are now named unconditionally: `card-canvas-created` /
// `card-canvas-compiled`, because there is exactly one canvas and it is the real
// one.**
//
// ⚠ CONSEQUENCE FOR THIS SCRIPT: on a build from 14–18 August it may resolve
// nothing, or resolve the wrong canvas. On the current build it is correct.
// ⚠ FIGURES RECORDED FROM THOSE BUILDS SHOULD BE TREATED AS NAME-AMBIGUOUS.

import { chromium } from "@playwright/test";
import { mkdtempSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
const RUNS = Number(process.argv[2] ?? 3);

// ⚠⚠ IMPORTED, NOT RETYPED — 16 August 2026. These were hand-copied literals
// with the comment "straight off `answer-card-geometry.ts`", which is exactly
// the claim a stale copy also makes. They are now read from the module itself,
// so they cannot drift from the code under test.
//
// ⚠ THIS IS NOT THE CIRCULARITY FIX. Importing the constant is the SAFE
// direction: it keeps the harness's EXPECTATION in step with the source. The
// circularity was reading the mark's NAME — a constant-derived label — as
// evidence of its TIMING. That is fixed by the ordering/identity assertions
// below, not by this import. See `beattrace-falsified-16-august.md`.
// ⚠ READ FROM SOURCE, NOT IMPORTED. `answer-card-geometry.ts` imports a sibling
// without a file extension, which Node's ESM loader rejects, so the module
// cannot be imported from a plain `.mjs` harness. The text is parsed instead —
// the same technique `cross-section.mjs` uses, and for the same reason.
//
// ⚠ IT THROWS RATHER THAN DEFAULTING. If a name is renamed or stops being a
// plain literal, this fails loudly with the name. A fallback here would
// reintroduce exactly the staleness the read exists to prevent.
const GEOM_SRC = readFileSync("components/enquiry/answer-card-geometry.ts", "utf8");
function geomNum(name) {
  const m = GEOM_SRC.match(new RegExp(`^export const ${name} = ([-\\d.]+);`, "m"));
  if (!m) {
    throw new Error(
      `card-1-anchor.mjs: could not read '${name}' from answer-card-geometry.ts.\n` +
        `It was renamed, removed, or is no longer a plain numeric literal.\n` +
        `⚠ DO NOT hardcode a value here to get past this — a hand-copied 650 is ` +
        `the exact defect this read replaced (16 August 2026).`,
    );
  }
  return Number(m[1]);
}

const Q5_REVEAL_MS = geomNum("Q5_REVEAL_MS");
const CARD_RISE_DURATION_MS = geomNum("CARD_RISE_DURATION_MS");
const CARD_OVERLAP = geomNum("CARD_OVERLAP");

// Derived exactly as the module derives them — see `answer-card-geometry.ts`.
const CARD_FIRST_ENTRANCE_MS = Math.round(Q5_REVEAL_MS / 2);
const CARD_RISE_GAP_MS = Math.round(CARD_RISE_DURATION_MS * (1 - CARD_OVERLAP));
const CARD_RISE_LADDER_MS = [0, 1, 2, 3, 4].map(
  (i) => CARD_FIRST_ENTRANCE_MS + i * CARD_RISE_GAP_MS,
);

const WATCH_MS = 22000;

/** How far a beat may sit from its expected rung before the ladder is wrong. */
const GAP_TOLERANCE_MS = 120;

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

    /**
     * ⚠⚠ THE LADDER'S INTEGRITY — ADDED 16 AUGUST 2026, AND IT IS THE POINT.
     *
     * `entranceZero` below subtracts `CARD_FIRST_ENTRANCE_MS` from a beat this
     * harness SELECTED because its NAME contains that same constant. The mark
     * name comes from `delayMs` (a constant); only the TIMESTAMP is observed.
     * **So the subtraction is circular unless something independently confirms
     * that this beat really is the first rung.**
     *
     * ⚠ PROVEN NECESSARY BY EXPERIMENT, NOT ARGUED. Injection A (16 August)
     * delayed card 3 by +800ms while leaving `CARD_RISE_LADDER_MS` untouched.
     * `card-beat-1770` then fired AFTER `card-beat-2330` — the ladder visibly
     * scrambled — and **this harness passed clean**, because card 1 was
     * unaffected and nothing here looked at the other four.
     *
     * Three checks, all reading data the instrument already published and
     * NOBODY consumed:
     *   1. COUNT     — five beats, not four (a suppressed card is invisible to
     *                  a presence-only check; see injection B)
     *   2. ORDERING  — beats must fire in rung order; injection A broke exactly
     *                  this and nothing noticed
     *   3. GAPS      — each beat within tolerance of its own rung, so a beat
     *                  cannot be late and still counted as its rung
     */
    const ladder = (() => {
      const expected = CARD_RISE_LADDER_MS;
      const faults = [];

      if (data.beats.length !== expected.length) {
        faults.push(`COUNT: ${data.beats.length} beats, expected ${expected.length}` +
          ` (missing rungs: ${expected.filter((r) => !data.beats.some((b) => b.rung === r)).join(", ") || "none"})`);
      }

      const byTime = [...data.beats].sort((a, b) => a.at - b.at);
      const outOfOrder = byTime.filter((b, i) => i > 0 && b.rung < byTime[i - 1].rung);
      if (outOfOrder.length) {
        faults.push(`ORDERING: fired ${byTime.map((b) => b.rung).join(" → ")}` +
          `, expected ascending`);
      }

      // Each beat's offset from card 1, against the rung it claims to be.
      if (card1 !== null) {
        for (const b of data.beats) {
          const expectedOffset = b.rung - CARD_FIRST_ENTRANCE_MS;
          const actualOffset = b.at - card1;
          const drift = actualOffset - expectedOffset;
          if (Math.abs(drift) > GAP_TOLERANCE_MS) {
            faults.push(`GAP: rung ${b.rung} sits ${actualOffset}ms after card 1,` +
              ` expected ${expectedOffset}ms (drift ${drift >= 0 ? "+" : ""}${drift}ms)`);
          }
        }
      }

      return { ok: faults.length === 0, faults };
    })();

    const entranceZero = card1 === null ? null : card1 - CARD_FIRST_ENTRANCE_MS;
    const target = revealStart === null ? null : revealStart + CARD_FIRST_ENTRANCE_MS;
    const revealEnd = revealStart === null ? null : revealStart + Q5_REVEAL_MS;
    const lateBy = card1 !== null && target !== null ? card1 - target : null;
    const precompileGap = entranceZero !== null && revealStart !== null ? entranceZero - revealStart : null;

    results.push({ run, revealStart, revealEnd, target, card1, entranceZero, lateBy, precompileGap, ladder, ...data });

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
    console.log(`  full ladder                 ${data.beats.map((b) => `${b.rung}@+${b.at}`).join(", ")}` +
      (data.lockup !== null ? `  lockup +${data.lockup}` : ""));
    if (ladder.ok) {
      console.log(`  ladder integrity            ✅ ${data.beats.length} beats, in order, gaps within ±${GAP_TOLERANCE_MS}ms`);
    } else {
      console.log(`  ladder integrity            ⛔ BROKEN`);
      for (const f of ladder.faults) console.log(`                              · ${f}`);
    }
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

/**
 * ⚠⚠ THE LADDER VERDICT — ADDED 16 AUGUST 2026, AND IT CAN FAIL THE RUN.
 *
 * Until now this script had NO exit code at all: it printed its findings and
 * exited 0 regardless of what it found. A harness that cannot fail is a report,
 * not a check.
 */
const broken = results.filter((r) => r.ladder && !r.ladder.ok);
console.log(`${"═".repeat(62)}`);
if (!broken.length) {
  console.log(`  ✅ LADDER INTEGRITY — all ${results.length} run(s): five beats, in rung order,`);
  console.log(`     each within ±${GAP_TOLERANCE_MS}ms of its own rung.`);
} else {
  console.log(`  ⛔ LADDER INTEGRITY FAILED in ${broken.length} of ${results.length} run(s):`);
  for (const r of broken) {
    console.log(`     run ${r.run}:`);
    for (const f of r.ladder.faults) console.log(`       · ${f}`);
  }
  console.log(`
  ⚠ THE CARD-1 FIGURES ABOVE ARE UNSAFE TO READ. \`entranceZero\` subtracts
    CARD_FIRST_ENTRANCE_MS from a beat selected by its NAME. When the ladder is
    broken, the beat named ${CARD_FIRST_ENTRANCE_MS} may not be the rung that actually fired
    first — which is precisely the circularity injection A exposed.`);
}
console.log(`${"═".repeat(62)}`);

console.log(`
  ⚠ This answers "where does card 1 land", not "does it look right". The overlap
    is a feel judgement and Carl's alone.

  ⚠ Verification is not approval.

  ⚠ SCOPE — WHAT THIS DOES NOT WATCH: it reads marks and timings, never pixels;
    it says nothing about whether a card was DRAWN, about opacity, the fade, the
    corridor step, or any question but Q5. ⚠ AND NEITHER CHANNEL CARRIES A
    QUESTION IDENTITY — after a step the trace still holds Q5's data. Do not run
    this past the first question and believe the result.
`);

process.exit(broken.length ? 1 : 0);
