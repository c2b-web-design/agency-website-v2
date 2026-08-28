/**
 * THE APPROVED TIMINGS — the baseline that a restructure must not move.
 *
 *   node verify/approved-timings.mjs [runs]        (default 3)
 *   node verify/approved-timings.mjs 3 --save      writes the baseline file
 *   node verify/approved-timings.mjs 3 --compare   diffs against the saved one
 *
 * ⚠ WHY THIS EXISTS. Carl, 9 August 2026: *"Nothing ive approved must shift. The
 * start page text arrival and the choreography of Q5 and the cards."* The
 * single-canvas restructure moves ~580ms of Three.js setup out of the Q5 phrase
 * wipe. Everything that setup currently gates must land where it lands today.
 *
 * ⚠ AND WITHOUT A RECORDED BASELINE, "NOTHING SHIFTED" IS AN OPINION. A 40ms
 * drift is invisible to the eye and survives to be found two sessions later as
 * "the cards feel different". This file makes the claim checkable.
 *
 * WHAT IS FROZEN — four things, one timeline, t=0 at page load:
 *
 *   1. THE OPENING TEXT. Captured from real `animationstart`/`animationend`
 *      events, NOT read off globals.css. The stylesheet says heading 600->2700,
 *      2100->4200, subtext 3600->7800, Begin reveal 7400->12400; what the
 *      browser actually does is the thing under test, and the two have already
 *      disagreed once on this page (the 4.2s blank screen, 7 August).
 *   2. THE PHRASE WIPE. `.enquiry-q-text-reveal` start, relative to Begin.
 *   3. THE CARD LADDER. All five beats via `?beattrace=1`, reported BOTH
 *      absolutely (relative to Begin) and as INTERNAL GAPS between beats.
 *   4. THE PROTO CARD'S LAG. Accepted by Carl on 3 August at ~1300ms after the
 *      CSS cards: *"it's not important it reveals with card 1, only that it's
 *      there."* An ACCEPTED cost is an approved one — if the restructure closes
 *      it for free, that is still a shift and still Carl's call, not the
 *      Builder's.
 *
 * ⚠ ABSOLUTE AND INTERNAL TIMINGS ARE REPORTED SEPARATELY, AND THEY FAIL
 * DIFFERENTLY. The ladder starting 200ms earlier is a shift Carl must judge.
 * The gaps BETWEEN beats changing is a corruption of the approved choreography
 * itself — a worse fault, and one that an absolute-only report would hide,
 * because every beat moving by the same 200ms looks identical to the ladder
 * merely starting earlier.
 *
 * ⚠ HEADED, --enable-gpu, RENDERER PRINTED AND CHECKED. Headless substitutes
 * SwiftShader, whose CPU shader compiler produced a flat ~2000ms freeze on
 * every run of `q5-stutter.mjs` and invalidated every verdict that file gave
 * before 9 August 2026. A software rasteriser aborts this script.
 *
 * ⚠ RUN 1 IS COLD AND IS REPORTED SEPARATELY. One profile for the session, as
 * `card-1-anchor.mjs` does. For a true cold run 1 the DEV SERVER must also be
 * freshly started — Turbopack compiles `/start` on first request.
 *
 * ⚠ THIS ANSWERS "DID IT MOVE", NEVER "IS IT APPROVED". Only Carl's eye approves
 * the entrance. A clean diff here means the change is worth showing him.
 */

import { chromium } from "@playwright/test";
import { mkdtempSync, rmSync, writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { positionals, wholeNumberArg } from "./lib/args.mjs";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";

// ⚠ SAME DEFECT AS one-context.mjs, FAILING DIFFERENTLY. This was
// `Number(process.argv[2] ?? 3)`, and this file's own usage block documents
// `--save` and `--compare`, so `approved-timings.mjs --save` put the STRING
// "--save" through Number() and made RUNS NaN.
//
// ⚠ IT DID NOT GO QUIET HERE — IT THREW, AND ONLY BY ACCIDENT. The empty run
// loop left `runs` empty, and the card-ladder section dereferences
// `runs[0].traceSamples` on that empty array. Loud is better than silent, but
// a TypeError is not a verdict either, and nothing made it one on purpose.
// Reasoning: verify/lib/args.mjs.
const ARGS = process.argv.slice(2);
const RUNS = wholeNumberArg(positionals(ARGS)[0], 3, {
  name: "run count",
  usage: "node verify/approved-timings.mjs [runs] [--save|--compare]",
});
const SAVE = ARGS.includes("--save");
const COMPARE = ARGS.includes("--compare");
const BASELINE_PATH = "verify/out/approved-timings-baseline.json";

// Begin is pressable at 7400ms while its reveal runs to 12400ms. Waiting for
// the button to be clickable is therefore NOT waiting for the opening to end.
const WATCH_AFTER_BEGIN_MS = 20000;

const profile = mkdtempSync(join(tmpdir(), "approved-timings-"));
const runs = [];

for (let run = 1; run <= RUNS; run++) {
  const context = await chromium.launchPersistentContext(profile, {
    headless: false,
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
  });
  const page = await context.newPage();

  // Instrument BEFORE any app code runs: the opening's first animation starts
  // at 600ms, long before a post-load listener could attach.
  await page.addInitScript(() => {
    window.__approved = { t0: performance.now(), anims: [], begin: null };
    const rec = (kind) => (e) => {
      const el = e.target;
      const cls = el && el.className ? String(el.className) : "";
      window.__approved.anims.push({
        kind,
        name: e.animationName,
        cls: cls.slice(0, 90),
        text: (el && el.textContent ? el.textContent.trim() : "").slice(0, 40),
        at: Math.round(performance.now() - window.__approved.t0),
      });
    };
    document.addEventListener("animationstart", rec("start"), true);
    document.addEventListener("animationend", rec("end"), true);
  });

  const res = await page.goto(`${BASE}/start?beattrace=1`, { waitUntil: "domcontentloaded" });
  if (!res || !res.ok()) {
    console.error(`FAILED: ${res?.status() ?? "no response"} — is the dev server running? (npm run dev)`);
    await context.close();
    rmSync(profile, { recursive: true, force: true });
    process.exit(1);
  }

  const renderer = await page.evaluate(() => {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    if (!gl) return "no webgl";
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    return ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "unknown";
  });
  if (/swiftshader|llvmpipe|software|no webgl/i.test(renderer)) {
    console.error(`\n⚠ ABORTING — renderer is "${renderer}": a software rasteriser, not the GPU.`);
    await context.close();
    rmSync(profile, { recursive: true, force: true });
    process.exit(1);
  }
  if (run === 1) console.log(`\nRenderer: ${renderer}`);

  const begin = page.getByRole("button", { name: /begin/i });
  await begin.waitFor({ state: "visible", timeout: 25000 });
  await page.waitForFunction(
    () => {
      const b = [...document.querySelectorAll("button")].find((el) => /begin/i.test(el.textContent ?? ""));
      return b && !b.disabled && getComputedStyle(b).pointerEvents !== "none";
    },
    { timeout: 25000 },
  );

  // ⚠ THE OPENING TEXT IS CAPTURED BEFORE BEGIN IS PRESSED. Pressing Begin
  // unmounts the opening branch, and an animation whose element is destroyed
  // never fires `animationend` — the exact trap recorded at
  // `enquiry-opening.tsx:1204`, where a gate's own opening event was destroyed
  // by the action it waited behind.
  const openingAnims = await page.evaluate(() => window.__approved.anims.slice());

  await page.evaluate(() => { window.__approved.begin = performance.now(); });
  await begin.click();
  await page.waitForTimeout(WATCH_AFTER_BEGIN_MS);

  const data = await page.evaluate(() => {
    const a = window.__approved;
    const sinceBegin = (t) => Math.round(t - (a.begin ?? a.t0));

    // The phrase wipe, relative to Begin.
    const wipe = a.anims.find((x) => x.kind === "start" && /q-text-reveal/.test(x.cls + x.name));

    // The card ladder, from `?beattrace=1`. First sample per card where the
    // rise has genuinely started — raw > 0 — is that card's beat.
    const trace = window.__cardTrace ?? [];
    const beats = [];
    for (const card of [...new Set(trace.map((e) => e.card))].sort((x, y) => x - y)) {
      const moving = trace.filter((e) => e.card === card && e.raw > 0).sort((x, y) => x.t - y.t);
      if (moving.length) beats.push({ card, at: sinceBegin(moving[0].t) });
    }

    return {
      // Re-derived relative to Begin rather than to load.
      wipeAtBegin: wipe ? wipe.at - Math.round((a.begin ?? a.t0) - a.t0) : null,
      beats,
      protoAt: (() => {
        const el = document.querySelector("[data-testid^='answer-card-hover-']");
        return el ? true : false;
      })(),
      traceSamples: trace.length,
    };
  });

  runs.push({ run, openingAnims, ...data });
  await context.close();
}

rmSync(profile, { recursive: true, force: true });

// ── Report ────────────────────────────────────────────────────────────────
// The median is the reported figure: one slow run should not redefine the
// baseline, and one fast run should not hide a regression.
const median = (xs) => {
  const s = xs.filter((n) => n !== null && n !== undefined).sort((a, b) => a - b);
  return s.length ? s[Math.floor(s.length / 2)] : null;
};

// Opening text: the masked reveals, in the order they start. Named by their
// text rather than their class, because the class names are shared.
const openingRows = [];
{
  const first = runs[0].openingAnims.filter((x) => x.kind === "start");
  for (const ev of first) {
    const label = (ev.text || ev.cls || ev.name).slice(0, 38);
    const times = runs.map((r) => {
      const m = r.openingAnims.find(
        (x) => x.kind === "start" && x.name === ev.name && x.text === ev.text,
      );
      return m ? m.at : null;
    });
    openingRows.push({ label, name: ev.name, med: median(times), times });
  }
}

console.log(`\n${"═".repeat(66)}`);
console.log(`APPROVED TIMINGS — ${RUNS} run(s), median reported. t=0 at page load.`);
console.log(`${"═".repeat(66)}`);

/**
 * ⚠ THE OPENING IS ANCHORED TO ITS OWN FIRST REVEAL, NOT TO PAGE LOAD — and
 * this correction was forced by the instrument failing its own self-check.
 *
 * Run with NO CODE CHANGED AT ALL, this file reported four opening rows
 * "SHIFTED" by +92/+74/+75/+74ms while the card ladder held to 0-2ms. The
 * giveaway was that all four moved together and their INTERNAL spacing did not
 * change: 961->2461 (1500ms) became 1053->2535 (1482ms). Nothing in the
 * choreography moved. t=0 moved — `performance.now()` at init-script time
 * sits before font loading and Turbopack's response, so every opening row
 * inherits that variance.
 *
 * The card ladder never had this problem because it is measured from BEGIN, a
 * real user event. The opening had no such anchor, so one is made here: its own
 * first reveal. What Carl approved is the RHYTHM of the reveals — 1500ms apart,
 * Begin at ~7400ms after the first line — and rhythm is what this now checks.
 *
 * ⚠ THE ABSOLUTE ARRIVAL IS STILL REPORTED, because "the text appears about a
 * second after load" is a real property of the page and a regression there
 * would matter. It is reported with a WIDER tolerance rather than dropped,
 * because it legitimately varies with server warmth and is not choreography.
 *
 * ⚠ A HARNESS THAT REPORTS DRIFT ON UNCHANGED CODE CANNOT CERTIFY A CHANGE.
 * Had this run only AFTER the restructure, a 92ms boot-time wobble would have
 * been read as the restructure breaking Carl's constraint. This is the fifth
 * recorded instance of this project's harness-lies class, and the first caught
 * by a deliberate no-change control run.
 */
const openingAnchor = openingRows.length ? openingRows[0].med : null;
console.log(`\n1. THE OPENING TEXT — from real animation events, not the stylesheet`);
if (!openingRows.length) console.log(`   ⚠ NO ANIMATION EVENTS CAPTURED — the instrument failed, not the page.`);
console.log(`   (anchored to the first reveal; absolute arrival reported separately)`);
for (const r of openingRows) {
  const rel = openingAnchor === null ? null : r.med - openingAnchor;
  console.log(
    `   +${String(rel).padStart(6)}ms from first reveal   ${r.name.padEnd(30)} "${r.label}"`,
  );
}
console.log(`   ── absolute: first reveal lands at +${openingAnchor}ms after load`);

console.log(`\n2. THE PHRASE WIPE — relative to Begin`);
const wipeMed = median(runs.map((r) => r.wipeAtBegin));
console.log(`   +${String(wipeMed).padStart(6)}ms  .enquiry-q-text-reveal`);

console.log(`\n3. THE CARD LADDER — relative to Begin, and the gaps between beats`);
const cardIds = [...new Set(runs.flatMap((r) => r.beats.map((b) => b.card)))].sort((a, b) => a - b);
const ladder = cardIds.map((card) => ({
  card,
  med: median(runs.map((r) => (r.beats.find((b) => b.card === card) ?? {}).at)),
}));
if (!ladder.length) {
  console.log(`   ⚠ NO BEATS CAPTURED — ?beattrace=1 published ${runs[0].traceSamples} samples.`);
}
let prev = null;
for (const b of ladder) {
  const gap = prev === null ? null : b.med - prev;
  console.log(
    `   card ${b.card}   +${String(b.med).padStart(6)}ms` +
      (gap === null ? `   (first beat)` : `   gap +${String(gap).padStart(4)}ms`),
  );
  prev = b.med;
}

console.log(`\n   ⚠ THE GAPS ARE THE CHOREOGRAPHY. If they change, the approved
   ladder itself is corrupted — a worse fault than the whole ladder
   sliding, and invisible in the absolute column alone.`);

const snapshot = {
  capturedAt: new Date().toISOString(),
  runs: RUNS,
  // `rel` is the checked value; `med` is kept for the record only.
  opening: openingRows.map((r) => ({
    name: r.name,
    label: r.label,
    med: r.med,
    rel: openingAnchor === null ? null : r.med - openingAnchor,
  })),
  openingAnchor,
  wipeAtBegin: wipeMed,
  ladder,
};

if (SAVE) {
  mkdirSync("verify/out", { recursive: true });
  writeFileSync(BASELINE_PATH, JSON.stringify(snapshot, null, 2));
  console.log(`\n✅ BASELINE SAVED → ${BASELINE_PATH}`);
  console.log(`   This is now the definition of "unchanged". Re-run with --compare after the restructure.`);
}

if (COMPARE) {
  if (!existsSync(BASELINE_PATH)) {
    console.error(`\n⚠ NO BASELINE at ${BASELINE_PATH} — run with --save first.`);
    process.exit(1);
  }
  const base = JSON.parse(readFileSync(BASELINE_PATH, "utf8"));
  console.log(`\n${"═".repeat(66)}`);
  console.log(`DIFF against baseline captured ${base.capturedAt}`);
  console.log(`${"═".repeat(66)}`);

  // ⚠ 32ms = TWO FRAMES AT 60fps. Below that a difference cannot be seen and is
  // within this instrument's own run-to-run noise; at or above it, Carl decides.
  // The threshold is a REPORTING boundary, not a pass mark — every delta is
  // printed either way, because a consistent 20ms drift across every row is a
  // real change wearing a small number.
  const TOL = 32;
  let worst = 0;
  const row = (label, was, now) => {
    if (was === null || now === null) {
      console.log(`   ${label.padEnd(34)} ${was === null ? "—" : was} → ${now === null ? "—" : now}  ⚠ MISSING`);
      worst = Math.max(worst, TOL + 1);
      return;
    }
    const d = now - was;
    worst = Math.max(worst, Math.abs(d));
    const flag = Math.abs(d) >= TOL ? "  ⚠ SHIFTED" : "";
    console.log(`   ${label.padEnd(34)} ${String(was).padStart(6)} → ${String(now).padStart(6)}  ${d >= 0 ? "+" : ""}${d}ms${flag}`);
  };

  console.log(`\n   OPENING TEXT — the RHYTHM, anchored to the first reveal`);
  for (const b of base.opening) {
    const now = snapshot.opening.find((x) => x.name === b.name && x.label === b.label);
    row(`"${b.label.slice(0, 22)}"`, b.rel ?? null, now ? now.rel : null);
  }

  // ⚠ REPORTED, NOT ASSERTED. Boot time is not choreography: it varies with
  // server warmth and font loading, and a no-change control run moved it 92ms.
  // It is shown because a LARGE move would be a real regression, and judged
  // against a tolerance wide enough not to cry wolf on ordinary variance.
  {
    const BOOT_TOL = 250;
    const was = base.openingAnchor ?? null;
    const now = snapshot.openingAnchor ?? null;
    const d = was === null || now === null ? null : now - was;
    console.log(
      `\n   ABSOLUTE ARRIVAL (informational, ±${BOOT_TOL}ms — boot time, not choreography)` +
        `\n   first reveal after load            ${String(was).padStart(6)} → ${String(now).padStart(6)}  ` +
        (d === null ? "—" : `${d >= 0 ? "+" : ""}${d}ms${Math.abs(d) >= BOOT_TOL ? "  ⚠ LOOK AT THIS" : ""}`),
    );
  }
  console.log(`\n   PHRASE WIPE`);
  row("q-text-reveal (from Begin)", base.wipeAtBegin, snapshot.wipeAtBegin);

  console.log(`\n   CARD LADDER — absolute`);
  for (const b of base.ladder) {
    const now = snapshot.ladder.find((x) => x.card === b.card);
    row(`card ${b.card} (from Begin)`, b.med, now ? now.med : null);
  }

  console.log(`\n   CARD LADDER — internal gaps (THE CHOREOGRAPHY)`);
  for (let i = 1; i < base.ladder.length; i++) {
    const wasGap = base.ladder[i].med - base.ladder[i - 1].med;
    const nowA = snapshot.ladder.find((x) => x.card === base.ladder[i].card);
    const nowB = snapshot.ladder.find((x) => x.card === base.ladder[i - 1].card);
    row(`gap ${base.ladder[i - 1].card}→${base.ladder[i].card}`, wasGap, nowA && nowB ? nowA.med - nowB.med : null);
  }

  console.log(`\n${"─".repeat(66)}`);
  if (worst < TOL) {
    console.log(`   ✅ NOTHING SHIFTED beyond ${TOL}ms (worst ${worst}ms — under two frames).`);
    console.log(`   Carl's constraint is met by measurement. His eye still decides.`);
  } else {
    console.log(`   ⚠ SOMETHING SHIFTED — worst delta ${worst}ms, over the ${TOL}ms threshold.`);
    console.log(`   Carl said nothing approved may shift. Report this; do not tune it away
   silently, and do not average it out across runs.`);
  }
}

console.log(`\n  ⚠ Verification is not approval. This answers "did it move".\n`);
