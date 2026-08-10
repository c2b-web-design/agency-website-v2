// Diagnostic: WHERE does the time inside the Q5 reveal actually go?
//
//   node verify/reveal-cost.mjs
//
// ══════════════════════════════════════════════════════════════════════════
// WHY — TWO HYPOTHESES ARE ALREADY DEAD, AND THIS FILE EXISTS BECAUSE OF IT
// ══════════════════════════════════════════════════════════════════════════
//
// Carl, 10 August 2026, cold start: *"it stalls on the word 'here'. This is
// past the halfway point of the reveal. The halfway point triggers the fade in
// appearance of Card 1."*
//
// ⚠ RULED OUT — `verify/infolog-source.mjs`, per-context attribution:
//
//   context 1 (warm-up)  created -7624ms  566ms infoLog, 0ms inside the reveal
//   context 2 (real)     created  +108ms   22ms infoLog, 22ms inside the reveal
//
// **`checkShaderErrors` is NOT the remaining cost.** The two `onCreated` fixes
// (`answer-card-canvas.tsx:3563`, `contact-field-canvas.tsx:2143`) are working.
// A ~500ms `getProgramInfoLog` DOES exist but it is in the warm-up context at
// -7550ms — dead time, which is the design working as intended.
//
// ⚠ ALSO RULED OUT — a shader RELINK at card 1's rung. 20 programs are created
// after the reveal starts, 11 near the rung, and they cost almost nothing.
// Creation count is not cost.
//
// ⚠ AND AN EARLIER PROBE MISLED BY COMPARING RAW TIMESTAMPS ACROSS CONTEXTS.
// `midpoint-relink.mjs` reported "getProgramInfoLog 548ms at 703ms" — the
// duration belonged to one context and the offset was read as if it belonged
// to the reveal. **Attribute a cost to its source before believing its
// timestamp.** Same family as the two instrument faults recorded on 10 August.
//
// ── THE REMAINING FACT, AND IT IS THE INTERESTING ONE ────────────────────
//
// **The real card canvas creates its WebGL context at +108ms — INSIDE the
// reveal** — while the warm-up context was created at -7624ms and is torn down
// at ~+1450ms (`forceContextLoss`, 35ms in the CPU profile).
//
// So the warm-up pays ~566ms in dead time and the real canvas then starts from
// nothing during the reveal. The handoff's suspicion was right in shape:
// *"3a7cf1f's whole mechanism is keeping the warm context alive across Begin;
// if something now tears it down early, the fix is being undone."*
//
// ⚠ BUT A SEPARATE CONTEXT CANNOT INHERIT ANOTHER'S COMPILED PROGRAMS ANYWAY.
// GPU program caches are per-context. The warm-up can only help by warming the
// DRIVER's on-disk cache, which is why its value was measured as small and
// once as a NET COST (`answer-card-canvas.tsx:3229` — *"the warm-up is in fact
// a 329ms net COST to it"*).
//
// ── WHAT THIS MEASURES ───────────────────────────────────────────────────
//
// Everything expensive in the 0-1300ms window, attributed by kind rather than
// guessed: long tasks with their attribution, GC, layout/style, and the frame
// gaps — plus the app's own marks. It answers "what is the main thread DOING"
// rather than "is my suspect guilty".
//
// ⚠ IT NAMES NO SUSPECT. Prior sessions lost rounds to targeted fixes against
// an unlocalised fault; `q5-stall-10-august.md` records three in a row. This
// prints a ranked profile and stops.
//
// ⚠ HEADED, --enable-gpu, ABORTS ON A SOFTWARE RASTERISER.
// ⚠ RESTART THE DEV SERVER FIRST — Carl's report is a COLD start.

import { chromium } from "@playwright/test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
const REVEAL_MS = 1300;
// Query string appended to /start, e.g. `?parktraveller=1` for the A/B that
// tests whether 7b056c2's continuous rAF loop is the Q5 regression.
const QUERY = process.argv[2] ?? "";

const profile = mkdtempSync(join(tmpdir(), "reveal-cost-"));
const context = await chromium.launchPersistentContext(profile, {
  headless: false,
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
});
const page = await context.newPage();

await page.addInitScript(() => {
  const W = window;
  W.__rc = { frames: [], longTasks: [], revealStart: null, ctxCreate: [] };

  const origGetContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
    const s = performance.now();
    const ctx = origGetContext.call(this, type, ...rest);
    if (String(type).includes("webgl")) {
      W.__rc.ctxCreate.push({ at: s, dur: Math.round((performance.now() - s) * 100) / 100 });
    }
    return ctx;
  };

  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        W.__rc.longTasks.push({
          at: e.startTime,
          dur: Math.round(e.duration),
          // Attribution tells you WHICH frame/script, when the browser knows.
          attr: (e.attribution || []).map((a) => a.name || a.containerType || "?").join(","),
        });
      }
    }).observe({ entryTypes: ["longtask"] });
  } catch {}

  const tick = () => {
    W.__rc.frames.push(performance.now());
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});

const res = await page.goto(`${BASE}/start${QUERY}`, { waitUntil: "domcontentloaded" });
if (QUERY) console.log(`query: ${QUERY}\n`);
if (!res || !res.ok()) {
  console.error(`FAILED: ${res?.status() ?? "no response"} — is the dev server running?`);
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
  console.error(`\n⚠ ABORTING — renderer is "${renderer}": a software rasteriser.`);
  await context.close();
  rmSync(profile, { recursive: true, force: true });
  process.exit(1);
}
console.log(`renderer: ${renderer}\n`);

// CDP profiler across the reveal, so the cost has FUNCTION NAMES rather than
// just a duration. This is what named getProgramInfoLog on 10 August.
const cdp = await page.context().newCDPSession(page);
await cdp.send("Profiler.enable");
await cdp.send("Profiler.setSamplingInterval", { interval: 200 });

await page.getByRole("button", { name: /begin/i }).click();

// Start profiling just before the reveal begins, not at Begin — the cards
// arrive ~6.9s later and profiling that whole stretch buries the signal.
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
await cdp.send("Profiler.start");
await page.evaluate(() => {
  const el = document.querySelector(".enquiry-q-text-reveal");
  const anim = el
    ?.getAnimations?.()
    .find((a) => a.animationName === "enquiry-mask-reveal-horizontal");
  window.__rc.revealStart = anim.startTime;
});

await page.waitForTimeout(REVEAL_MS + 700);
const { profile: cpu } = await cdp.send("Profiler.stop");

const out = await page.evaluate(
  ({ revealMs }) => {
    const W = window;
    const base = W.__rc.revealStart;
    const rel = (t) => Math.round(t - base);

    const frames = W.__rc.frames.map(rel).sort((a, b) => a - b);
    const gaps = [];
    for (let i = 1; i < frames.length; i++) {
      gaps.push({ gap: frames[i] - frames[i - 1], at: frames[i - 1] });
    }
    const inReveal = gaps.filter((g) => g.at >= -100 && g.at <= revealMs + 400);
    inReveal.sort((a, b) => b.gap - a.gap);

    return {
      worstInReveal: inReveal.slice(0, 5),
      longTasks: W.__rc.longTasks
        .map((t) => ({ ...t, at: rel(t.at) }))
        .filter((t) => t.at >= -200 && t.at <= revealMs + 500 && t.dur >= 30)
        .sort((a, b) => b.dur - a.dur),
      ctxCreate: W.__rc.ctxCreate.map((c) => ({ at: rel(c.at), dur: c.dur })),
    };
  },
  { revealMs: REVEAL_MS },
);

// Fold the CPU profile into self-time per function.
const nodes = new Map((cpu.nodes || []).map((n) => [n.id, n]));
const self = new Map();
const total = (cpu.timeDeltas || []).reduce((a, b) => a + Math.max(0, b), 0);
for (let i = 0; i < (cpu.samples || []).length; i++) {
  const id = cpu.samples[i];
  const dt = Math.max(0, (cpu.timeDeltas || [])[i] || 0);
  const n = nodes.get(id);
  if (!n) continue;
  const f = n.callFrame || {};
  const name = `${f.functionName || "(anonymous)"}${f.url ? ` — ${String(f.url).split("/").pop()}:${f.lineNumber ?? "?"}` : ""}`;
  self.set(name, (self.get(name) || 0) + dt);
}
const ranked = [...self.entries()]
  .map(([name, us]) => ({ name, ms: Math.round(us / 1000) }))
  .filter((e) => e.ms >= 5)
  .sort((a, b) => b.ms - a.ms)
  .slice(0, 18);

console.log(`── frame gaps in the reveal window ──────────────────────────────`);
for (const g of out.worstInReveal) {
  const off = g.at - REVEAL_MS / 2;
  console.log(`  ${String(g.gap).padStart(6)}ms at ${String(g.at).padStart(6)}ms   (${off >= 0 ? "+" : ""}${off}ms from card 1's rung)`);
}

console.log(`\n── long tasks (>=30ms) in the window ────────────────────────────`);
if (!out.longTasks.length) console.log(`  none`);
for (const t of out.longTasks) console.log(`  ${String(t.dur).padStart(6)}ms at ${String(t.at).padStart(6)}ms  ${t.attr}`);

console.log(`\n── WebGL context creation ───────────────────────────────────────`);
for (const c of out.ctxCreate) console.log(`  ${String(c.dur).padStart(6)}ms at ${String(c.at).padStart(6)}ms`);

console.log(`\n── CPU self-time across the reveal (${Math.round(total / 1000)}ms sampled) ──`);
for (const e of ranked) console.log(`  ${String(e.ms).padStart(6)}ms  ${e.name}`);

console.log(`\n══ read this as a PROFILE, not a verdict ════════════════════════`);
console.log(`  It names what the main thread did. It does not name a fix, and`);
console.log(`  nothing here has been approved by Carl's eye.`);

await context.close();
rmSync(profile, { recursive: true, force: true });
