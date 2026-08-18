// ⚠⚠ WHAT STEP 5 CHANGED BUT DID NOT MEASURE — the three gaps the warm-up
// deletion (98429af) opened and left unverified.
//
//   node verify/post-warmup-gaps.mjs [runs]      (default 6, every run COLD)
//
// ⛔ VERIFICATION ONLY. No fix, no experiment, no new candidate. This closes the
// gaps a committed change opened; the change itself stands.
//
// ─────────────────────────────────────────────────────────────────────────────
// 1. ⚠ THE ARMING PATH — a CORRECTNESS question about committed code
// ─────────────────────────────────────────────────────────────────────────────
//
// `armOpening` has four sources: `compile`, `ready-gate`, `backstop`,
// `reduced-motion`. First write wins. ⚠ **THE COMPILE PATH IS GONE** — it was
// `onCompiled` on the warm-up canvas, deleted in 98429af. So arming must now
// fall to the ready gate or the backstop, and NEITHER WAS EXERCISED POST-CHANGE.
//
// ⚠⚠ WHY THIS MATTERS AND IS NOT COSMETIC: `OPENING_ARM_CEILING_MS` (4000ms) is a
// BACKSTOP. The recorded failure mode in this project is a backstop quietly
// becoming the only path — the warm-up's `requestIdleCallback` did exactly that
// for two sessions, because the opening never went idle, and nothing reported it.
// **A backstop that fires routinely is not a backstop.** If the ready gate is now
// dead and the backstop carries every run, the opening waits 4 SECONDS and the
// page merely hides it.
//
// This reports the arming source BY NAME (`performance.mark`, not inference) over
// multiple COLD runs, and separately proves the backstop is still REACHABLE.
//
// ─────────────────────────────────────────────────────────────────────────────
// 2. mount → compiled — WHERE THE DELETED COST LANDED
// ─────────────────────────────────────────────────────────────────────────────
//
// Stage 1 measured `mount → compiled` at 106ms with the warm-up and 1353ms
// without. ⚠ **THAT COST DID NOT DISAPPEAR WITH THE WARM-UP — IT RELOCATED**, and
// nothing measured where it landed. Read here from the real canvas's own marks.
//
// ⚠ REPORTED AS A DISTRIBUTION, NOT A NUMBER. The 40–640ms run-to-run spread
// established on 18 August applies to anything measured in this region; a single
// figure here would be exactly the mistake that instrument exists to prevent.
//
// ─────────────────────────────────────────────────────────────────────────────
// 3. REDUCED MOTION — unexercised since the deletion
// ─────────────────────────────────────────────────────────────────────────────
//
// Under reduced motion the opening takes a different path entirely and arms via
// `reduced-motion`. Stage 2 recorded that such a visitor is clickable at +226ms
// while the warm-up compiled at ~2261ms — so they ALREADY paid the toll on the
// cards, and it was already the worse path. Confirm it still completes and arms.
//
// ⚠ EVERY RUN IS COLD — a fresh browser profile per run. A warm ANGLE shader
// cache changes compile timings, which is the quantity item 2 measures.

// ─────────────────────────────────────────────────────────────────────────────
// ⚠⚠ INSTRUMENT DEFECT IN THIS FILE, FOUND ON ITS FIRST RUN — RECORDED, NOT HIDDEN
// ─────────────────────────────────────────────────────────────────────────────
//
// The first version keyed everything on `card-canvas-created` / `-compiled` and
// treated the presence of `warmup-canvas-*` marks as proof the warm-up still
// existed. On the post-deletion build it therefore reported:
//
//     ⛔⛔ WARM-UP CANVAS MARKS PRESENT — the deletion did not take.
//     ⛔ NO card-canvas marks resolved — cannot report.
//
// ⚠ BOTH WERE WRONG, AND THE FIRST WOULD HAVE READ AS A FAILED COMMIT.
//
// `answer-card-canvas.tsx` names its marks from `warm && !active`, and **`warm`
// DEFAULTS TO TRUE** (`warm = true` in the props, since `b25fb5f` — long before
// step 5). The shared host is mounted `active={hostCardsVisible}`, which is false
// during the opening. So the ONE REMAINING CANVAS labels itself `warmup-canvas-*`.
//
// ⚠⚠ AND THE COLLISION IS PRE-EXISTING, NOT CAUSED BY THE DELETION: before step 5
// BOTH canvases satisfied `warm && !active` during the opening, so both wrote the
// SAME mark name. `getEntriesByName(...)[0]` takes the first. **Every
// mount→compiled figure on record may therefore describe whichever canvas mounted
// first, not the one the reader intended.** Recorded as a finding; NOT fixed here.
//
// The fix in this harness: judge the deletion on **DOM NODES**, and read
// mount→compiled from **either mark family**.
//
// ⚠⚠ UPDATE, 18 August 2026 — THE PRODUCT SIDE IS NOW FIXED. The marks are named
// unconditionally (`card-canvas-*`), so the `?? warmupCreated` fallbacks below
// are **belt-and-braces for OLD BUILDS ONLY** and should resolve via
// `card-canvas-*` on anything current. ⚠ **If a run reports `marks: warmup-*`,
// it is serving a build from 14–18 August and its figures are name-ambiguous.**
//
// ⚠ AND THE COLLISION WAS NOT NEW WHEN THIS HARNESS FOUND IT. It was measured on
// **14 August** and written into `verify/one-context.mjs`'s header — *"there is
// no `card-canvas-created` mark at all, and there are TWO `warmup-canvas-created`
// marks"*. That harness worked around it locally by counting both names. **The
// finding sat in one instrument's header for four days while every other reader
// kept inheriting the defect.** A workaround in one consumer is not a fix.

import { chromium } from "playwright";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3100";
if (/:3000(\/|$)/.test(BASE)) {
  console.error(`\n⚠ REFUSING :3000 — dev and production disagree. Production is the verdict.\n`);
  process.exit(1);
}

const RUNS = Number(process.argv[2] ?? 6);

// ⚠ A RANGE, NOT AN EQUALITY, AND NOT SHARED WITH THE PAGE. `OPENING_ARM_CEILING_MS`
// is 4000ms in the source. A harness that shares a constant with the thing it
// checks cannot fail in the direction that matters — `q5-stutter.mjs` reported
// 0/3 CLEAN on a visible defect for exactly that reason. Used only to decide how
// long to watch and to classify "near the ceiling", never asserted as equal.
const CEILING_HINT_MS = 4000;

async function oneRun({ reducedMotion }) {
  const profile = mkdtempSync(join(tmpdir(), "postwarmup-"));
  const context = await chromium.launchPersistentContext(profile, {
    headless: false,
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: reducedMotion ? "reduce" : "no-preference",
    args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
  });
  try {
    const page = await context.newPage();
    await page.addInitScript(() => {
      window.__pw = { nav: performance.now(), headingAt: null };
      document.addEventListener("animationstart", (e) => {
        if (window.__pw.headingAt === null && e.animationName.startsWith("enquiry-mask-reveal")) {
          window.__pw.headingAt = performance.now();
        }
      }, true);
    });

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

    // Watch past the ceiling so a backstop-armed run is still captured.
    await page.waitForTimeout(CEILING_HINT_MS + 3500);

    const d = await page.evaluate(() => {
      const nav = window.__pw.nav;
      const mark = (n) => {
        const e = performance.getEntriesByName(n, "mark");
        return e.length ? Math.round(e[0].startTime - nav) : null;
      };
      const armed = performance.getEntriesByType("mark")
        .filter((e) => e.name.startsWith("opening-armed-by-"))
        .sort((a, b) => a.startTime - b.startTime)[0];
      // ⚠ ALL arming marks, not just the first — proves "first write wins" and
      // shows whether a losing path fired later (i.e. is alive but slower).
      const allArms = performance.getEntriesByType("mark")
        .filter((e) => e.name.startsWith("opening-armed-by-"))
        .map((e) => ({ name: e.name.replace("opening-armed-by-", ""), at: Math.round(e.startTime - nav) }))
        .sort((a, b) => a.at - b.at);
      return {
        armedBy: armed ? armed.name.replace("opening-armed-by-", "") : null,
        armedAt: armed ? Math.round(armed.startTime - nav) : null,
        allArms,
        cardCreated: mark("card-canvas-created"),
        cardCompiled: mark("card-canvas-compiled"),
        warmupCreated: mark("warmup-canvas-created"),
        warmupCompiled: mark("warmup-canvas-compiled"),
        // ⚠ THE DOM IS THE AUTHORITY ON WHETHER THE WARM-UP EXISTS. A mark NAME
        // is not evidence of a node — see the defect note in the header.
        warmupNodes: document.querySelectorAll('[data-testid="answer-card-warmup"]').length,
        canvasCount: document.querySelectorAll("canvas").length,
        headingAt: window.__pw.headingAt === null ? null : Math.round(window.__pw.headingAt - nav),
        beginPresent: !!document.querySelector(".enquiry-begin-hit"),
      };
    });
    return { ...d, renderer };
  } finally {
    await context.close();
    rmSync(profile, { recursive: true, force: true });
  }
}

const stat = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  const med = s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
  return { min: s[0], max: s[s.length - 1], median: med, n: s.length };
};

console.log(`\n⚠ POST-WARMUP GAP VERIFICATION — ${RUNS} cold runs, production.`);
console.log(`  base: ${BASE}   viewport 1440x900   fresh profile every run\n`);

// ── 1 + 2 ────────────────────────────────────────────────────────────────────
const runs = [];
for (let i = 1; i <= RUNS; i++) {
  const r = await oneRun({ reducedMotion: false });
  runs.push(r);
  if (i === 1) console.log(`renderer: ${r.renderer}\n`);
  // ⚠ EITHER MARK FAMILY. The surviving host names its own marks from
  // `warm && !active`, and `warm` DEFAULTS TO TRUE — so during the opening the
  // real canvas emits `warmup-canvas-*`. Keying only on `card-canvas-*` reported
  // "no marks resolved" on a healthy page. See the header defect note.
  const created = r.cardCreated ?? r.warmupCreated;
  const compiled = r.cardCompiled ?? r.warmupCompiled;
  const m2c = created !== null && compiled !== null ? compiled - created : null;
  console.log(
    `  run ${String(i).padStart(2)}  armed by ${String(r.armedBy).padEnd(12)} @ ${String(r.armedAt).padStart(5)}ms` +
    `  | mount ${String(created).padStart(5)} → compiled ${String(compiled).padStart(5)}` +
    `  = ${m2c === null ? "  n/a" : String(m2c).padStart(5)}ms` +
    `  | heading @ ${String(r.headingAt).padStart(5)}ms` +
    `  | warm-up NODES ${r.warmupNodes}  canvases ${r.canvasCount}` +
    `  | marks: ${r.cardCreated !== null ? "card-*" : ""}${r.warmupCreated !== null ? "warmup-*" : ""}`
  );
}

console.log(`\n── 1. THE ARMING PATH ──`);
const byPath = {};
for (const r of runs) byPath[r.armedBy ?? "NONE"] = (byPath[r.armedBy ?? "NONE"] ?? 0) + 1;
for (const [k, v] of Object.entries(byPath)) console.log(`     ${String(k).padEnd(14)} ${v}/${runs.length} runs`);

const armTimes = runs.filter((r) => r.armedAt !== null).map((r) => r.armedAt);
if (armTimes.length) {
  const a = stat(armTimes);
  console.log(`     armed at: median ${a.median}ms   range ${a.min}-${a.max}ms`);
}

// ⚠ The compile path must be GONE — its owner was deleted. If it appears, the
// deletion did not fully take and the tombstone is lying.
if (runs.some((r) => r.armedBy === "compile")) {
  console.log(`     ⛔⛔ "compile" ARMED A RUN — but its only call site was DELETED in 98429af.`);
}
// ⚠⚠ THE DELETION IS JUDGED ON DOM NODES, NEVER ON MARK NAMES. The first version
// of this harness asserted on the mark name and reported "THE DELETION DID NOT
// TAKE" on a build with ZERO warm-up nodes. See the header defect note.
if (runs.some((r) => r.warmupNodes > 0)) {
  console.log(`     ⛔⛔ WARM-UP DOM NODES PRESENT — the deletion did not take.`);
} else {
  console.log(`     ✅ zero warm-up DOM nodes on every run — the deletion took.`);
}
if (runs.some((r) => r.warmupCreated !== null)) {
  console.log(`     ⚠ ...but the surviving host still emits \`warmup-canvas-*\` marks.`);
  console.log(`       NOT a failed deletion — a STALE MARK NAME. \`warm\` defaults to`);
  console.log(`       true and the host renders \`active={false}\` during the opening,`);
  console.log(`       so \`warm && !active\` picks the warm-up name. PRE-EXISTING.`);
}

const backstopRuns = runs.filter((r) => r.armedBy === "backstop").length;
if (backstopRuns > 0) {
  console.log(`     ⛔ THE BACKSTOP ARMED ${backstopRuns}/${runs.length} NORMAL RUNS.`);
  console.log(`        A backstop that fires routinely is not a backstop — the gate is broken.`);
}

console.log(`\n── 2. mount → compiled (the relocated cost) ──`);
const m2cs = runs
  .map((r) => ({ c: r.cardCreated ?? r.warmupCreated, k: r.cardCompiled ?? r.warmupCompiled }))
  .filter((x) => x.c !== null && x.k !== null)
  .map((x) => x.k - x.c);
if (m2cs.length === 0) {
  console.log(`     ⛔ NO card-canvas marks resolved — cannot report. Not a clean result.`);
} else {
  const s = stat(m2cs);
  console.log(`     per run   ${m2cs.join("  ")}  ms`);
  console.log(`     median ${s.median}ms   range ${s.min}-${s.max}ms   spread ${s.max - s.min}ms   (n=${s.n})`);
  console.log(`     ⚠ Stage 1 reference: 106ms WITH the warm-up, 1353ms WITHOUT (its own arms).`);
  console.log(`     ⚠ A DISTRIBUTION, NOT A NUMBER — the 40-640ms spread applies in this region.`);
}

// ── 3. REDUCED MOTION ────────────────────────────────────────────────────────
console.log(`\n── 3. REDUCED MOTION ──`);
const rm = await oneRun({ reducedMotion: true });
console.log(`     armed by ${rm.armedBy} @ ${rm.armedAt}ms   | Begin present: ${rm.beginPresent}`);
console.log(`     mount ${rm.cardCreated ?? rm.warmupCreated} → compiled ${rm.cardCompiled ?? rm.warmupCompiled}`  + `   warm-up nodes ${rm.warmupNodes}`);
const rmOk = rm.armedBy !== null && rm.beginPresent;
console.log(rmOk
  ? `     ✅ the reduced-motion path COMPLETES AND ARMS.`
  : `     ⛔ the reduced-motion path did NOT arm or Begin is absent.`);

console.log(`\n⚠ WHAT THIS DOES NOT WATCH: mobile · the reveal freeze itself · Q4-Q1 ·`);
console.log(`  NextStepMeshButton's per-step context (the NEXT experiment, deliberately`);
console.log(`  out of scope) · WHY any figure is what it is (no attribution).\n`);

// ─────────────────────────────────────────────────────────────────────────────
// 1b. ⚠⚠ IS THE BACKSTOP REACHABLE, OR IS IT DEAD CODE?
// ─────────────────────────────────────────────────────────────────────────────
//
// "The ready gate wins every run" is only half the answer. The other half is
// whether the surviving fallback still WORKS — because if the ready gate ever
// fails, the backstop is the ONLY thing between the visitor and a permanently
// blank opening.
//
// ⚠ FORCED, NOT INFERRED. `document.fonts.ready` is stubbed to a promise that
// NEVER settles, which is exactly the failure the ceiling exists for. If the
// opening still arms, the backstop is alive and its cost is measured.
//
// ⚠ This is a PROBE OF A FAILURE PATH, not a change to the page.
console.log(`\n── 1b. IS THE BACKSTOP REACHABLE? (fonts.ready forced to never settle) ──`);
{
  const profile = mkdtempSync(join(tmpdir(), "postwarmup-bs-"));
  const context = await chromium.launchPersistentContext(profile, {
    headless: false,
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
  });
  try {
    const page = await context.newPage();
    await page.addInitScript(() => {
      window.__pw = { nav: performance.now() };
      try {
        Object.defineProperty(document, "fonts", {
          configurable: true,
          get: () => ({ ready: new Promise(() => {}), addEventListener() {}, removeEventListener() {} }),
        });
      } catch {}
    });
    await page.goto(`${BASE}/start`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(CEILING_HINT_MS + 4000);
    const r = await page.evaluate(() => {
      const nav = window.__pw.nav;
      const armed = performance.getEntriesByType("mark")
        .filter((e) => e.name.startsWith("opening-armed-by-"))
        .sort((a, b) => a.startTime - b.startTime)[0];
      return {
        armedBy: armed ? armed.name.replace("opening-armed-by-", "") : null,
        armedAt: armed ? Math.round(armed.startTime - nav) : null,
        beginPresent: !!document.querySelector(".enquiry-begin-hit"),
      };
    });
    console.log(`     armed by ${r.armedBy} @ ${r.armedAt}ms   | Begin present: ${r.beginPresent}`);
    if (r.armedBy === "backstop") {
      console.log(`     ✅ THE BACKSTOP IS REACHABLE — the ready gate is not the only exit.`);
      console.log(`        ⚠ Cost when it fires: the visitor waits ${r.armedAt}ms before the opening starts.`);
    } else if (r.armedBy === null) {
      console.log(`     ⛔⛔ NOTHING ARMED. With the ready gate blocked there is NO exit —`);
      console.log(`        the opening would never start. That is a correctness defect.`);
    } else {
      console.log(`     ⚠ armed by "${r.armedBy}" — the stub did not block the ready gate,`);
      console.log(`       so THIS PROBE PROVED NOTHING. Not evidence the backstop works.`);
    }
  } finally {
    await context.close();
    rmSync(profile, { recursive: true, force: true });
  }
}
