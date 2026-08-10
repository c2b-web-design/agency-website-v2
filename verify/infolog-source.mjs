// Diagnostic: WHICH renderer is still paying getProgramInfoLog, and is the
// checkShaderErrors flag actually off when the blocking call happens?
//
//   node verify/infolog-source.mjs
//
// ══════════════════════════════════════════════════════════════════════════
// WHY
// ══════════════════════════════════════════════════════════════════════════
//
// `verify/midpoint-relink.mjs` measured ~500ms of `getProgramInfoLog` INSIDE
// the Q5 reveal on a cold start, 3/3 runs. That call is issued from
// `onFirstUse` (`three.module.js:7094`) and ONLY when
// `renderer.debug.checkShaderErrors` is true (`:7097`).
//
// ⚠ BUT THE FLAG IS ALREADY SET FALSE ON BOTH `<Canvas>` ELEMENTS —
// `answer-card-canvas.tsx:3563` and `contact-field-canvas.tsx:2143`. So either
// a THIRD renderer exists without the fix, or the flag is set too LATE to
// cover the calls that matter.
//
// `contact-field-canvas.tsx:2127` records the precedent exactly: *"Two
// separate `<Canvas>` elements mean two renderers. That component-boundary
// blindness is why this was missed twice."* This script exists so it is not
// missed a third time — by ATTRIBUTING each call to a context rather than
// counting calls globally.
//
// ── WHAT IT MEASURES ─────────────────────────────────────────────────────
//
// Every WebGL context gets an id at creation. For each blocking call we record
// which context issued it, how long it took, and — critically — what
// `checkShaderErrors` was on the renderer at that moment is inferred from
// WHETHER THE CALL HAPPENED AT ALL: with the flag off, `onFirstUse` issues no
// `getProgramInfoLog`. So a call IS the evidence the flag was on.
//
// ⚠ IT ASSERTS NOTHING ABOUT THE CAUSE. It prints per-context totals. If the
// expensive context is one of the two already fixed, the fix is landing too
// late; if it is a third, the fix has a hole. Both are findings.

import { chromium } from "@playwright/test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";

const profile = mkdtempSync(join(tmpdir(), "infolog-source-"));
const context = await chromium.launchPersistentContext(profile, {
  headless: false,
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
});
const page = await context.newPage();

await page.addInitScript(() => {
  const W = window;
  W.__il = { ctxs: [], calls: [], revealStart: null };
  let nextId = 0;

  const origGetContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
    const ctx = origGetContext.call(this, type, ...rest);
    if (!String(type).includes("webgl") || !ctx || ctx.__ilPatched) return ctx;
    ctx.__ilPatched = true;

    const id = nextId++;
    // Identify the canvas by its size and where it sits, so a context can be
    // matched back to a component without guessing from creation order.
    const rect = (() => {
      try {
        const r = this.getBoundingClientRect();
        return { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y) };
      } catch {
        return null;
      }
    })();
    W.__il.ctxs.push({ id, at: performance.now(), rect, canvasW: this.width, canvasH: this.height });
    ctx.__ilId = id;

    for (const fn of ["getProgramInfoLog", "getShaderInfoLog", "getProgramParameter", "linkProgram"]) {
      const orig = ctx[fn];
      if (typeof orig !== "function") continue;
      ctx[fn] = function (...args) {
        const s = performance.now();
        const out = orig.apply(this, args);
        const dur = performance.now() - s;
        W.__il.calls.push({ id, fn, at: s, dur: Math.round(dur * 100) / 100 });
        return out;
      };
    }
    return ctx;
  };
});

const res = await page.goto(`${BASE}/start`, { waitUntil: "domcontentloaded" });
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

await page.getByRole("button", { name: /begin/i }).click();

await page.waitForFunction(
  () => {
    const el = document.querySelector(".enquiry-q-text-reveal");
    const anim = el
      ?.getAnimations?.()
      .find((a) => a.animationName === "enquiry-mask-reveal-horizontal");
    if (!anim || typeof anim.startTime !== "number") return false;
    window.__il.revealStart = anim.startTime;
    return true;
  },
  { timeout: 30000 },
);

await page.waitForTimeout(2600);

const out = await page.evaluate(() => {
  const W = window;
  const base = W.__il.revealStart;
  const rel = (t) => Math.round(t - base);

  const byCtx = new Map();
  for (const c of W.__il.ctxs) {
    byCtx.set(c.id, { ...c, at: rel(c.at), infoLogMs: 0, infoLogCalls: 0, inReveal: 0, worst: 0, worstAt: null });
  }
  for (const call of W.__il.calls) {
    const e = byCtx.get(call.id);
    if (!e) continue;
    if (call.fn === "getProgramInfoLog" || call.fn === "getShaderInfoLog") {
      e.infoLogMs += call.dur;
      e.infoLogCalls++;
      const at = rel(call.at);
      if (call.dur > e.worst) { e.worst = call.dur; e.worstAt = at; }
      if (at >= 0 && at <= 1300) e.inReveal += call.dur;
    }
  }
  return [...byCtx.values()].map((e) => ({ ...e, infoLogMs: Math.round(e.infoLogMs) , inReveal: Math.round(e.inReveal) }));
});

console.log(`── per WebGL context ────────────────────────────────────────────`);
for (const c of out) {
  console.log(`  context ${c.id}  created ${c.at}ms (reveal-relative)`);
  console.log(`     canvas ${c.canvasW}x${c.canvasH}  css box ${c.rect ? `${c.rect.w}x${c.rect.h} at (${c.rect.x},${c.rect.y})` : "n/a"}`);
  console.log(`     infoLog: ${c.infoLogCalls} calls, ${c.infoLogMs}ms total, worst ${Math.round(c.worst)}ms at ${c.worstAt}ms`);
  console.log(`     ⚠ inside the 0-1300ms reveal: ${c.inReveal}ms`);
  console.log();
}

const guilty = out.filter((c) => c.inReveal > 50);
console.log(`══ verdict ══════════════════════════════════════════════════════`);
if (guilty.length === 0) {
  console.log(`  no context spends >50ms in infoLog during the reveal.`);
  console.log(`  checkShaderErrors is NOT the remaining cost — look elsewhere.`);
} else {
  for (const c of guilty) {
    console.log(`  ⚠ context ${c.id} spends ${c.inReveal}ms in infoLog INSIDE the reveal.`);
  }
  console.log();
  console.log(`  A getProgramInfoLog call only happens when checkShaderErrors is TRUE`);
  console.log(`  (three.module.js:7097). So for these contexts the flag was on at`);
  console.log(`  first-use — either the canvas has no onCreated fix, or the fix runs`);
  console.log(`  after the programs were first used.`);
}
console.log();
console.log(`  total contexts: ${out.length}. Two <Canvas> elements are fixed`);
console.log(`  (answer-card-canvas.tsx:3563, contact-field-canvas.tsx:2143);`);
console.log(`  the answer-card canvas mounts TWICE (warm-up + real).`);

await context.close();
rmSync(profile, { recursive: true, force: true });
