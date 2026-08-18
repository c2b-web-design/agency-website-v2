// ⚠⚠ THE CONTENTION CANDIDATE — does removing the button free GPU capacity that
// the CARD HOST then uses? 18 August 2026.
//
//   node verify/host-contention.mjs [runs] [--nobtn]
//
// The attribution accounts for ~67ms of a 140ms freeze and rests on a FIT argument
// (the PMREM bake is GPU-side, matching a GPU-saturated / renderer-idle signature),
// NOT on causation. ⚠ If the card host takes up capacity freed by removing the
// button, no single button component is "the cause" — the freeze is a shared
// resource failure and hoisting the bake would move nothing.
//
// ─────────────────────────────────────────────────────────────────────────────
// ⚠⚠ WHY THE HOST IS IDENTIFIED BY RENDERER IDENTITY, NOT BY CANVAS LOOKUP
// ─────────────────────────────────────────────────────────────────────────────
//
// The arms differ in CANVAS COUNT — baseline 3 WebGL contexts, treatment 2. An
// instrument that found "the WebGL canvas" would read a DIFFERENT OBJECT on each
// arm and report a difference that is pure artefact. `?hosttrace=1` wraps the card
// host's OWN renderer in its `onCreated`, so both arms measure the same object.
//
// ⚠ TIMES SUBMISSION, NOT COMPLETION. A per-frame `gl.finish()` would serialise the
// pipeline on every frame — the 84ms-sampler trap. Deliberately not done.
//
// ⚠ THE WINDOW IS ANCHORED TO `__revealStart`, not to a fixed delay. A bracket that
// opens on one scheduling event and closes on another measures DELAY, NOT WORK —
// that is how `1-context-creation` came to report 150ms of which ~87ms was a gap.

import { chromium } from "playwright";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3100";
if (/:3000(\/|$)/.test(BASE)) {
  console.error(`\n⚠ REFUSING :3000 — production is the verdict.\n`);
  process.exit(1);
}

const args = process.argv.slice(2);
const RUNS = Number(args.find((a) => /^\d+$/.test(a)) ?? 8);
const NOBTN = args.includes("--nobtn");

const q = ["hosttrace=1"];
if (NOBTN) q.push("nobtnmesh=1");
const URL_START = `${BASE}/start?${q.join("&")}`;

// The reveal is 1300ms; take a little more so a late frame is not clipped.
const WINDOW_MS = 1400;

console.log(`\n⚠ CARD-HOST CONTENTION — ${RUNS} runs, production, cold.`);
console.log(`   url:  ${URL_START}`);
console.log(`   arm:  ${NOBTN ? "TREATMENT ?nobtnmesh=1 (2 contexts)" : "BASELINE (3 contexts)"}`);
console.log(`   window: __revealStart → +${WINDOW_MS}ms   channel: card host's own gl.render\n`);

const rows = [];

for (let run = 1; run <= RUNS; run++) {
  const browser = await chromium.launch({
    headless: false,
    args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // ⚠ ARM CONFIRMED BY CONTEXT COUNT, never by the flag in the URL — a flag that
  // arrives but does not take is the failure this would otherwise hide.
  await page.addInitScript(() => {
    window.__webglContexts = 0;
    const orig = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
      const c = orig.call(this, type, ...rest);
      // Attached canvases only — the harness's own renderer probe is detached.
      if (c && /webgl/i.test(String(type)) && document.contains(this)) {
        window.__webglContexts++;
      }
      return c;
    };
  });

  await page.goto(URL_START, { waitUntil: "networkidle" });

  const renderer = await page.evaluate(() => {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    if (!gl) return "no webgl";
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    return ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "unknown";
  });
  if (/swiftshader|llvmpipe|software|no webgl/i.test(renderer)) {
    console.error(`⚠ ABORTING — "${renderer}" is a software rasteriser.`);
    process.exit(1);
  }
  if (run === 1) console.log(`renderer: ${renderer}\n`);

  await page.waitForTimeout(9000);
  const begin = await page.$(".enquiry-begin-hit");
  if (!begin) {
    console.error(`⛔ run ${run}: no Begin hit target.`);
    process.exit(1);
  }
  await begin.click();
  await page.waitForTimeout(12000);

  const out = await page.evaluate((win) => {
    const w = window;
    const frames = (w.__hostFrames ?? []).map((f) => ({ ...f }));
    const rs = typeof w.__revealStart === "number" ? w.__revealStart : null;
    // ⚠ FLOOR — the wrapper's own cost, taken through the same push+now path.
    let floor = 0;
    const probe = [];
    for (let i = 0; i < 200; i++) {
      const t0 = performance.now();
      probe.push({ ms: performance.now() - t0, t: 0 });
    }
    floor = probe.reduce((a, b) => a + b.ms, 0) / probe.length;
    if (rs === null) return { rs: null, frames: [], floor, contexts: w.__webglContexts ?? null, hostSeen: frames.length };
    const inWin = frames.filter((f) => f.t >= rs && f.t <= rs + win);
    return {
      rs,
      frames: inWin,
      floor,
      contexts: w.__webglContexts ?? null,
      hostSeen: frames.length,
      firstOffset: inWin.length ? Math.round(inWin[0].t - rs) : null,
      lastOffset: inWin.length ? Math.round(inWin[inWin.length - 1].t - rs) : null,
    };
  }, WINDOW_MS);

  const expected = NOBTN ? 2 : 3;
  if (out.contexts !== expected) {
    console.error(`\n⛔ run ${run}: ARM NOT CONFIRMED — webgl contexts ${out.contexts}, expected ${expected}.`);
    console.error(`   Aborting rather than file a run under an unverified arm label.\n`);
    process.exit(1);
  }
  if (out.hostSeen === 0) {
    console.error(`\n⛔ run ${run}: THE CARD HOST WAS NEVER SEEN RENDERING — 0 frames total.`);
    console.error(`   The tracer did not attach. Figures would be vacuous. Aborting.\n`);
    process.exit(1);
  }
  if (out.rs === null) {
    console.error(`⛔ run ${run}: no __revealStart — the reveal did not run.`);
    process.exit(1);
  }

  const total = out.frames.reduce((a, f) => a + f.ms, 0);
  const sorted = out.frames.map((f) => f.ms).sort((a, b) => a - b);
  const med = sorted.length
    ? (sorted.length % 2 ? sorted[(sorted.length - 1) / 2]
      : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2)
    : 0;

  rows.push({ n: out.frames.length, total, med, floor: out.floor, first: out.firstOffset, last: out.lastOffset });
  console.log(
    `  run ${String(run).padStart(2)}  frames ${String(out.frames.length).padStart(3)}  total ${total.toFixed(1).padStart(7)}ms  median/frame ${med.toFixed(2).padStart(5)}ms  first +${out.firstOffset}ms  last +${out.lastOffset}ms`,
  );

  await context.close();
  await browser.close();
}

const med = (a) => {
  const s = [...a].sort((x, y) => x - y);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

console.log(`\n  ── ${NOBTN ? "TREATMENT" : "BASELINE"}, ${RUNS} runs, card host inside the reveal window ──`);
const counts = rows.map((r) => r.n);
const totals = rows.map((r) => r.total);
const meds = rows.map((r) => r.med);
const firsts = rows.map((r) => r.first);
console.log(`     frames        median ${med(counts).toFixed(1)}   range ${Math.min(...counts)}-${Math.max(...counts)}`);
console.log(`     total render  median ${med(totals).toFixed(1)}ms   range ${Math.min(...totals).toFixed(1)}-${Math.max(...totals).toFixed(1)}ms`);
console.log(`     per-frame     median ${med(meds).toFixed(2)}ms   range ${Math.min(...meds).toFixed(2)}-${Math.max(...meds).toFixed(2)}ms`);
console.log(`     first frame   median +${med(firsts).toFixed(0)}ms after reveal start`);
console.log(`\n  ⚠ INSTRUMENT FLOOR: ${med(rows.map((r) => r.floor)).toFixed(4)}ms per bracket —`);
console.log(`    compare to the per-frame median above.`);
console.log(`  ⚠ Times SUBMISSION, not completion. ⛔ Says how long, never why.\n`);
