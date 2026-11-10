// ⛔ THE LIQUID's ASYNC COMPILE — THE PROBE (10 November 2026, session 2): step 4 of
// `live-work/plan-liquid-async-compile-10-november.md` v1.2 (APPROVED). Needs the dev server. Cold loads (fresh contexts) of
// `/proto/camera?blank=1`; every animation frame logged in the page (wall time, the liquid's time since the expulsion's
// start, the field's and the solid's visibility). BARS SET BEFORE THE RUN (the plan):
//  1. NO FREEZE in the COMPILE window: the largest frame gap from the warm-up draw to 2 s after the expulsion's start
//     ≤ 100 ms (the gap INTO the warm-up frame included). The bake's and the regions' gaps (before it) reported apart.
//  2. CLEAN CONSOLE: errors from load to 2 s after ready ≤ the BEFORE count (0, `liquid-stall-split-10-november.md`).
//  3. THE GATE's HOLD: `holdMs` reported (none expected here).
//  4. THE FAILURE BRANCH, forced (`fail`): the solid stays, the field never shown, the clock passes the start within
//     1 s + one frame of wall clock, no new errors.
//  5. THE KEPT RENDER OBJECTS ARE THE LIVE ONES (own load): after ready, `material.side` changed (in the render object's
//     key): the seen id CHANGES, one seen, state back to ready. (The rebuild stalls: the window is closed — reported.)
//  6. THE HOLD ON ITS WAY TO READY, forced (`delay` 600, from the hold's start) and FILMED: a hold of ~600 ms, the clock
//     never stepped back, the field's first frame at te ≤ 0.1 s (one clock step).
//  7. THE 1 s TIMEOUT, forced (`delay` 1500): off by the timeout at ~1 s, the solid stays, the clock goes on, and on the
//     NEXT loop the liquid stays OFF.
// argv: OUT dir (the film of check 6 goes there). Checks 1–3 on WebGPU and the WebGL 2 fallback, two runs each; 4–7 WebGPU.
// ⚠ NOT WATCHED (printed): Carl's Chrome; real slower devices (6, 7 force the paths); third person (Carl: no PiP); production.
import { chromium } from "file:///C:/Users/Carl Buckley/agency-website-v2/node_modules/playwright/index.mjs";
import { mkdirSync } from "node:fs";
const OUT = process.argv[2];
mkdirSync(OUT, { recursive: true });
const ARGS = ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"];
const results = [];
const verdict = (name, pass, detail) => {
  results.push({ name, pass });
  console.log(`${pass ? "PASS" : "FAIL"} — ${name}: ${detail}`);
};

async function load({ medium = "webgpu", secs = 25, force = null, video = false, during = null }) {
  const b = await chromium.launch({ channel: "chrome", args: ARGS });
  const ctx = await b.newContext({ viewport: { width: 1909, height: 934 }, deviceScaleFactor: 1, ...(video ? { recordVideo: { dir: OUT, size: { width: 1909, height: 934 } } } : {}) });
  const p = await ctx.newPage();
  const errs = [];
  const warns = [];
  p.on("console", (m) => (m.type() === "error" ? errs : m.type() === "warning" ? warns : []).push({ at: Date.now(), text: m.text().slice(0, 200) }));
  p.on("pageerror", (e) => errs.push({ at: Date.now(), text: "pageerror: " + e.message.slice(0, 200) }));
  await p.addInitScript((force) => {
    const log = (window.__probe = { ticks: [], forced: false });
    let last = performance.now();
    const tick = (now) => {
      const L = window.__liquid;
      const C = window.__liquidCompile;
      if (force && C && !log.forced) {
        C.force(force[0], force[1]);
        log.forced = true;
      }
      let field = false;
      let solid = null;
      window.__benchScene?.traverse((o) => {
        if (o.name === "hero liquid") field = o.visible;
        if (o.name === "hero logo") solid = o.visible;
      });
      log.ticks.push({ t: now, gap: now - last, te: L ? L.time() : null, field, solid, state: C ? C.state() : null });
      last = now;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, force);
  const t0 = Date.now();
  await p.goto(`http://localhost:3000/proto/camera?blank=1${medium === "fallback" ? "&forcewebgl=1" : ""}`, { waitUntil: "load" });
  if (during) await during(p);
  await p.waitForTimeout(Math.max(0, secs * 1000 - (Date.now() - t0)));
  const data = await p.evaluate(() => ({
    ticks: window.__probe.ticks,
    holdMs: window.__liquidCompile?.holdMs() ?? null,
    off: window.__liquidCompile?.off() ?? null,
    why: window.__liquidCompile?.failedWhy() ?? null,
    stats: window.__liquid?.stats ?? null,
    backend: document.querySelector("[data-camera-bench]")?.dataset.mediumBackend ?? null,
  }));
  await ctx.close();
  await b.close();
  return { ...data, errs, warns };
}

// the warm-up frame (the field first visible), the expulsion's start (te first ≥ 0), the first ready
const marks = (ticks) => {
  const warm = ticks.findIndex((k) => k.field && k.te !== null && k.te < -0.5);
  const start = ticks.findIndex((k) => k.te !== null && k.te >= -1e-6 && k.te < 5);
  const ready = ticks.findIndex((k) => k.state === "ready");
  return { warm, start, ready };
};

// ── checks 1–3: both media, two runs each
for (const medium of ["webgpu", "fallback"]) {
  for (let run = 1; run <= 2; run++) {
    const r = await load({ medium, secs: 25 });
    const { warm, start, ready } = marks(r.ticks);
    if (warm < 0 || start < 0) {
      verdict(`1 no freeze (${medium} ${run})`, false, `warm-up ${warm}, start ${start} — not found (backend ${r.backend})`);
      continue;
    }
    const end = r.ticks.findIndex((k, i) => i > start && k.t - r.ticks[start].t > 2000);
    const win = r.ticks.slice(warm, end < 0 ? undefined : end);
    const big = win.reduce((m, k) => (k.gap > m.gap ? k : m), { gap: 0 });
    const before = r.ticks.slice(0, warm).reduce((m, k) => Math.max(m, k.gap), 0);
    verdict(`1 no freeze (${medium} ${run})`, big.gap <= 100, `largest gap ${big.gap.toFixed(0)} ms at te ${big.te?.toFixed(2)} (window: warm-up → start + 2 s); before the warm-up (the bake, the regions, the load) ${before.toFixed(0)} ms, reported apart; backend ${r.backend}; bake ${r.stats?.bakeMs} ms, regions ${r.stats?.regionsMs} ms`);
    const readyAt = ready >= 0 ? r.ticks[ready].t : Infinity;
    verdict(`2 clean console (${medium} ${run})`, r.errs.length === 0, `${r.errs.length} errors ${JSON.stringify(r.errs.slice(0, 3).map((e) => e.text))}; ready at frame ${ready} (${ready >= 0 ? (readyAt - r.ticks[0].t).toFixed(0) : "never"} ms after the first frame)`);
    console.log(`     3 the gate's hold (${medium} ${run}): holdMs ${r.holdMs === null ? "none" : r.holdMs.toFixed(0)}; off ${r.off}${r.why ? " — " + r.why : ""}`);
  }
}

// ── check 4: the failure branch, forced
{
  const r = await load({ secs: 25, force: ["fail"] });
  const { start } = marks(r.ticks);
  const shown = r.ticks.some((k) => k.field && k.te !== null && k.te >= 0);
  const solidAfter = r.ticks.filter((k) => k.te !== null && k.te >= 0 && k.te < 3).every((k) => k.solid === true);
  // the clock passing the start: first te ≥ 0 to first te > 0.2, in wall clock
  const past = r.ticks.findIndex((k, i) => i > start && k.te > 0.2);
  const passMs = start >= 0 && past >= 0 ? r.ticks[past].t - r.ticks[start].t : Infinity;
  verdict("4 failure branch (fail)", !shown && solidAfter && r.off === true && passMs <= 1000 + 120 && r.errs.length === 0, `field shown ${shown}; solid kept ${solidAfter}; off ${r.off} (${r.why}); clock past start + 0.2 s in ${passMs.toFixed(0)} ms; errors ${r.errs.length}`);
}

// ── check 5: the kept render objects are the live ones (own load)
{
  let before = null;
  let after = null;
  const r = await load({
    secs: 30,
    during: async (p) => {
      await p.waitForFunction(() => window.__liquidCompile?.state() === "ready", null, { timeout: 25000 });
      before = await p.evaluate(() => window.__liquidCompile.seen());
      await p.evaluate(() => window.__benchScene.traverse((o) => {
        if (o.name === "hero liquid") {
          o.material.side = 2; // THREE.DoubleSide — part of the render object's cache key
          o.material.needsUpdate = true;
        }
      }));
      // the field must be drawn for three to replace its render object: show it
      await p.evaluate(() => window.__liquid.show("field"));
      await p.waitForTimeout(3000);
      after = await p.evaluate(() => ({ seen: window.__liquidCompile.seen(), state: window.__liquidCompile.state() }));
      await p.evaluate(() => window.__liquid.show("auto"));
    },
  });
  const changed = before && after && after.seen.length === 1 && before[0] !== after.seen[0];
  const stallAfter = r.ticks.reduce((m, k) => Math.max(m, k.gap), 0);
  verdict("5 kept render objects live", !!changed && after.state === "ready", `seen before ${JSON.stringify(before)} → after ${JSON.stringify(after?.seen)}, state ${after?.state}; the rebuild (window closed) — largest gap in the load ${stallAfter.toFixed(0)} ms, reported`);
}

// ── check 6: the hold on its way to ready (delay 600), filmed
{
  const r = await load({ secs: 25, force: ["delay", 600], video: true });
  const { start } = marks(r.ticks);
  // the clock never stepped back: te never decreases outside a loop wrap (a drop of more than 1 s)
  let back = 0;
  for (let i = 1; i < r.ticks.length; i++) {
    const a = r.ticks[i - 1].te;
    const c = r.ticks[i].te;
    if (a !== null && c !== null && c < a - 1e-6 && a - c < 1) back++;
  }
  const first = r.ticks.findIndex((k, i) => i >= start && k.field && k.te >= 0);
  const firstTe = first >= 0 ? r.ticks[first].te : null;
  verdict("6 hold to ready (delay 600)", r.holdMs !== null && r.holdMs >= 550 && r.holdMs <= 800 && back === 0 && firstTe !== null && firstTe <= 0.1 + 1e-6 && r.off === false, `holdMs ${r.holdMs?.toFixed(0)}; clock steps back ${back}; the field's first frame at te ${firstTe?.toFixed(3)}; off ${r.off}; film in ${OUT}`);
}

// ── check 7: the 1 s timeout (delay 1500), and the next loop stays off
{
  const r = await load({ secs: 45, force: ["delay", 1500] });
  const starts = [];
  for (let i = 1; i < r.ticks.length; i++) if (r.ticks[i].te !== null && r.ticks[i - 1].te !== null && r.ticks[i - 1].te < -1e-6 && r.ticks[i].te >= -1e-6) starts.push(i);
  const anyField = r.ticks.some((k) => k.field && k.te !== null && k.te >= 0);
  const why = r.why ?? "";
  const nextLoop = starts.length >= 2;
  verdict("7 timeout (delay 1500)", r.off === true && /wait ran out/.test(why) && r.holdMs !== null && r.holdMs >= 950 && r.holdMs <= 1150 && !anyField && nextLoop && r.errs.length === 0, `off ${r.off} (${why}); holdMs ${r.holdMs?.toFixed(0)}; field ever shown ${anyField}; loops seen ${starts.length} (the next loop ${nextLoop ? "reached, stayed off" : "NOT reached"}); errors ${r.errs.length}; warnings ${JSON.stringify(r.warns.map((w) => w.text).filter((t) => /hero liquid/.test(t)))}`);
}

console.log(`\n${results.filter((x) => x.pass).length}/${results.length} PASS`);
console.log("⚠ NOT WATCHED: Carl's Chrome; real slower devices (6, 7 force the paths); third person (Carl: no PiP); production builds");
