/**
 * verify/about-neon.mjs — the wall pair neon (CA + CB): identity, profile, frames.
 *
 *   npm run verify -- about-neon.mjs baseline
 *   npm run verify -- about-neon.mjs identity [--inject <peak>]
 *   npm run verify -- about-neon.mjs floor
 *   npm run verify -- about-neon.mjs profile
 *   npm run verify -- about-neon.mjs frames
 *
 * Plan: `project-intelligence/live-work/wall-neon-plan-23-september.md`, amended by
 * the Architect's review (`architect-plan-response-wall-neon-23-september.md`).
 *
 * ⚠⚠ THIS IS A MEASUREMENT TOOL WITH NO RECORDED RED RUN. `verify/proven.json`'s
 * proven array is empty (D-064, VERIFY-UNPROVEN): **no pass from this file is
 * admissible as proof.** Its numbers inform; Carl's eye decides.
 *
 * ⚠ OUTPUT RULES — Architect F7. `run.mjs` reads a line-leading ⛔ as a failure
 * mark (`FAIL_MARK`), so a clean run that declares its blind spots with ⛔ would
 * be classified "disagree". **Blind-spot lines here lead with ⚠, never ⛔.** And
 * every mode ends with the `##VERDICT:` sentinel, which the runner honours ahead
 * of both marks — the first harness to emit it.
 *
 * ⚠ ARGUMENTS — Architect F8. The mode is a STRING in the first positional, the
 * exact shape of verify defect 3 (`Number("--falsify")` = NaN = a silent no-op).
 * **Parsed through `verify/lib/args.mjs`**, never by hand, and an unknown mode
 * exits as NOT A VERDICT.
 *
 * MODES
 *   baseline  Capture the canvas at /about#roles TWICE per width, before any neon
 *             exists, and report the HEAD-against-HEAD noise floor. ⚠ Must be run
 *             at the commit BEFORE the neon lands; the files it writes are the
 *             reference every other mode compares against.
 *   identity  `?neon=none` and `?neon=off` against the baseline. Both must be
 *             pixel-identical (the plan's identity gate). `--inject <peak>` swaps
 *             the `off` arm for a lit one at that peak — the RED RUN, which must
 *             come back different or the instrument cannot see what it gates.
 *   floor     Architect F9: sweep the peak until the differing count first clears
 *             the noise floor. The red run is filed at ~2x the number found.
 *   profile   The glow outward from CA's and CB's top rim: `?neon=full` MINUS
 *             `?neon=off` (Architect F3 — same code path, one variable), averaged
 *             over 21 columns, as a % of the peak. D-090's target: 8% by 4px, a
 *             faint shelf to ~24px, gone by ~48px.
 *   frames    requestAnimationFrame intervals across the ignition on /about#roles.
 */

import { chromium } from "playwright";
import { mkdirSync, existsSync } from "node:fs";
import sharp from "sharp";
import { positionals } from "./lib/args.mjs";

const BASE = process.env.VERIFY_BASE_URL ?? process.env.BASE ?? "http://localhost:3000";
const OUT = "verify/out";
mkdirSync(OUT, { recursive: true });

/** Two widths — the same pair every capture uses, so arms are comparable. */
const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
];

/**
 * ⚠ SETTLE, not a guess at "done": the canvas renders on demand and the room's
 * textures suspend the tree until loaded. 3s clears load on this machine; the
 * noise floor measured by `baseline` is what says whether it was enough.
 */
const SETTLE_MS = 3000;

const USAGE = "npm run verify -- about-neon.mjs <baseline|identity|floor|profile|frames> [--inject <peak>]";

const argv = process.argv.slice(2);
const [mode] = positionals(argv, ["--inject", "--query"]);
/**
 * `profile --query "bloom=0.3&neonca=6"` — faders appended to BOTH arms, so a
 * candidate can be measured before it is committed. ⚠ Both arms get it: the
 * subtraction stays one variable (Architect F3).
 */
const queryIdx = argv.indexOf("--query");
const extraQuery = queryIdx === -1 ? "" : `&${String(argv[queryIdx + 1] ?? "").replace(/^[?&]/, "")}`;
const MODES = ["baseline", "identity", "floor", "profile", "frames"];
if (!MODES.includes(mode)) {
  console.error(`\n⚠ NO RUNS EXECUTED — unknown mode ${JSON.stringify(mode)}.\n  Usage: ${USAGE}\n  Nothing was measured. This is not a verdict.\n`);
  console.log("##VERDICT: NONE");
  process.exit(2);
}
const injectIdx = argv.indexOf("--inject");
const inject = injectIdx === -1 ? null : Number(argv[injectIdx + 1]);
if (injectIdx !== -1 && !(Number.isFinite(inject) && inject > 0)) {
  console.error(`\n⚠ NO RUNS EXECUTED — --inject needs a positive number, got ${JSON.stringify(argv[injectIdx + 1])}.\n  This is not a verdict.\n`);
  console.log("##VERDICT: NONE");
  process.exit(2);
}

/**
 * HEADED, GPU ON — the project's standard for anything WebGL (`approved-timings.mjs`
 * explains why headless substitutes a software renderer). The renderer string is
 * printed so a SwiftShader run cannot pass itself off as a GPU one.
 */
const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"],
});

/**
 * ⛔⛔ EVERY URL THIS HARNESS OPENS CARRIES `extrude=0` — since 24 September 2026
 * (session 2). Plain `/about` now carries CA's extruded text with the neon NOT
 * MOUNTED (D-094; `extrudeEnabled` in `card-extrude.tsx`), so without it every
 * neon arm would measure a page with no neon, and the identity arms would compare
 * the text take against a pre-neon baseline that never had it. ⚠ `?extrude=0` is
 * the previous `/about` exactly — the identity gate is the proof, at 0 px.
 * ⚠ Appended here, in the ONE place a URL is built, so no mode can miss it.
 */
const PIN = "extrude=0";
async function openCanvas(query, viewport, { initScript } = {}) {
  const page = await browser.newPage({ viewport });
  if (initScript) await page.addInitScript(initScript);
  const q = query ? `${query}&${PIN}` : `?${PIN}`;
  await page.goto(`${BASE}/about${q}#roles`, { waitUntil: "networkidle" });
  const canvas = page.locator("canvas").first();
  await canvas.waitFor({ state: "visible", timeout: 20000 });
  await canvas.scrollIntoViewIfNeeded();
  return { page, canvas };
}

async function rendererString(page) {
  return page.evaluate(() => {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    if (!gl) return "NO WEBGL";
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
  });
}

/** Capture the canvas element's box. Returns raw RGBA + size. */
async function capture(query, viewport, file) {
  const { page, canvas } = await openCanvas(query, viewport);
  await page.waitForTimeout(SETTLE_MS);
  const renderer = await rendererString(page);
  const png = await canvas.screenshot({ animations: "disabled" });
  await page.close();
  if (file) await sharp(png).toFile(file);
  const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height, renderer };
}

async function load(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

/** Count pixels where any channel differs; report the largest channel delta. */
function diff(a, b) {
  if (a.width !== b.width || a.height !== b.height) {
    return { size: false, count: Infinity, max: Infinity };
  }
  let count = 0;
  let max = 0;
  for (let i = 0; i < a.data.length; i += 4) {
    const d = Math.max(
      Math.abs(a.data[i] - b.data[i]),
      Math.abs(a.data[i + 1] - b.data[i + 1]),
      Math.abs(a.data[i + 2] - b.data[i + 2]),
    );
    if (d > 0) count++;
    if (d > max) max = d;
  }
  return { size: true, count, max };
}

const basePath = (w, tag) => `${OUT}/about-neon-baseline-${w}-${tag}.png`;

function requireBaseline() {
  for (const v of VIEWPORTS) {
    if (!existsSync(basePath(v.width, "a"))) {
      console.error(`\n⚠ NO BASELINE at ${basePath(v.width, "a")} — run the baseline mode at HEAD before the neon lands.\n  Nothing was compared. This is not a verdict.\n`);
      console.log("##VERDICT: NONE");
      process.exit(3);
    }
  }
}

// ── baseline ────────────────────────────────────────────────────────────────
if (mode === "baseline") {
  console.log("\nBASELINE — /about#roles canvas, captured twice per width, at the current commit.");
  let floorClean = true;
  for (const v of VIEWPORTS) {
    const a = await capture("", v, basePath(v.width, "a"));
    const b = await capture("", v, basePath(v.width, "b"));
    const d = diff(a, b);
    console.log(`  ${v.width}x${v.height}  canvas ${a.width}x${a.height}  renderer: ${a.renderer}`);
    console.log(`    HEAD vs HEAD: ${d.count} px differ (max channel delta ${d.max})`);
    if (d.count !== 0) floorClean = false;
  }
  console.log("\n  ⚠ NOT WATCHED: anything outside the canvas box; whether the frame is CORRECT —");
  console.log("    only whether two captures of the same code agree.");
  if (floorClean) {
    console.log("\n  Noise floor is ZERO — the identity gate can judge exact equality.");
    console.log("##VERDICT: NONE");
    await browser.close();
    process.exit(0);
  }
  console.log("\n  ⚠ Noise floor is NOT zero — the identity gate cannot demand exact equality.");
  console.log("    Plan stop condition: report before building on this instrument.");
  console.log("##VERDICT: NONE");
  await browser.close();
  process.exit(3);
}

// ── identity ────────────────────────────────────────────────────────────────
if (mode === "identity") {
  requireBaseline();
  const arms = [
    ["?neon=none", "none"],
    inject === null
      ? ["?neon=off", "off"]
      : [`?neon=full&neonca=${inject}&neoncb=${inject}`, `INJECTED peak ${inject}`],
  ];
  console.log(`\nIDENTITY — each arm against the HEAD baseline.${inject !== null ? "  ⚠ RED RUN: the second arm is deliberately lit." : ""}`);
  let allZero = true;
  for (const v of VIEWPORTS) {
    const ref = await load(basePath(v.width, "a"));
    for (const [q, label] of arms) {
      const cap = await capture(q, v, `${OUT}/about-neon-identity-${v.width}-${label.split(" ")[0]}.png`);
      const d = diff(ref, cap);
      console.log(`  ${v.width}  ${label.padEnd(22)} ${d.size ? `${d.count} px differ (max ${d.max})` : "SIZE MISMATCH"}   [${cap.renderer}]`);
      if (d.count !== 0) allZero = false;
    }
  }
  console.log(`\n  ⚠ EVERY ARM CARRIES ${PIN}: this gates the neon page, NOT plain /about — which`);
  console.log("    since 24 September 2026 carries CA's extruded text with no neon, and is not compared here.");
  console.log("  ⚠ NOT WATCHED: CD and CS UNDER a lit neon (only the off/none paths are compared);");
  console.log("    anything outside the canvas; the ignition's in-between frames.");
  if (inject !== null) {
    console.log(allZero
      ? "\n  ⚠ The injected neon was NOT seen — this instrument cannot detect a neon at that peak."
      : "\n  The injected neon WAS seen — the instrument can go red at this peak.");
  }
  console.log(`##VERDICT: ${allZero ? "PASS" : "FAIL"}`);
  await browser.close();
  process.exit(allZero ? 0 : 1);
}

// ── floor (F9) ──────────────────────────────────────────────────────────────
if (mode === "floor") {
  requireBaseline();
  const PEAKS = [0.0005, 0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1];
  console.log("\nFLOOR — the smallest peak whose neon the identity gate can see (Architect F9).");
  for (const v of VIEWPORTS) {
    const ref = await load(basePath(v.width, "a"));
    let first = null;
    for (const p of PEAKS) {
      const cap = await capture(`?neon=full&neonca=${p}&neoncb=${p}`, v);
      const d = diff(ref, cap);
      console.log(`  ${v.width}  peak ${String(p).padEnd(7)} ${d.count} px differ (max ${d.max})`);
      if (first === null && d.count > 0) first = p;
    }
    console.log(`  ${v.width}  first visible peak: ${first ?? "none in sweep"} -> file the red run at ~${first === null ? "?" : 2 * first}`);
  }
  console.log("\n  ⚠ NOT WATCHED: bloom settings other than the committed defaults.");
  console.log("##VERDICT: NONE");
  await browser.close();
  process.exit(0);
}

// ── profile (F3) ────────────────────────────────────────────────────────────
if (mode === "profile") {
  /**
   * ⚠ PLATE FRACTIONS COPIED from `GUIDE_CA_QUAD` / `GUIDE_CB_QUAD` in
   * `about-card-geometry.ts`, top edge only. COPIED, NOT IMPORTED — they only aim
   * the sampler; the rim itself is FOUND as the peak of the difference image
   * inside a search band, so a small misalignment moves the band, not the result.
   */
  const TOP_EDGES = {
    CA: [{ x: 312 / 1800, y: 193 / 1200 }, { x: 843 / 1800, y: 242 / 1200 }],
    CB: [{ x: 1067 / 1800, y: 242 / 1200 }, { x: 1562 / 1800, y: 139 / 1200 }],
    /* ⚠ THE FLOOR PAIR — aim points READ OFF A LIT CAPTURE (1440, 23 September),
       not derived: the floor cards are placed on rails in 3D, not by plate quads.
       A two-point "edge" at one x; the search band finds the rim. */
    CD: [{ x: 0.3, y: 0.58 }, { x: 0.3, y: 0.58 }],
    CS: [{ x: 0.6, y: 0.59 }, { x: 0.6, y: 0.59 }],
  };
  const OFFSETS = [0, 2, 4, 8, 16, 24, 32, 48];
  const luma = (d, i) => 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
  console.log("\nPROFILE — neon's own contribution (full MINUS off), outward (up) from each top rim.");
  console.log("  D-090 target, % of core:  0px 100 · 2px ~89 · 4px ~8 · 8-24px ~8-10 · 48px ~0");
  for (const v of VIEWPORTS) {
    if (extraQuery) console.log(`  (faders: ${extraQuery.slice(1)})`);
    const on = await capture(`?neon=full${extraQuery}`, v, `${OUT}/about-neon-profile-${v.width}-full.png`);
    const off = await capture(`?neon=off${extraQuery}`, v);
    const { width: W, height: H } = on;
    for (const [name, [p0, p1]] of Object.entries(TOP_EDGES)) {
      const mx = (p0.x + p1.x) / 2;
      const my = (p0.y + p1.y) / 2;
      const cx = Math.round(mx * W);
      const cy = Math.round(my * H);
      // Column-averaged (21 columns) difference, per row, in a search band.
      const rowVal = (y) => {
        let s = 0;
        for (let x = cx - 10; x <= cx + 10; x++) {
          const i = (y * W + x) * 4;
          s += Math.max(0, luma(on.data, i) - luma(off.data, i));
        }
        return s / 21;
      };
      let peakY = cy;
      let peak = -1;
      for (let y = Math.max(0, cy - 40); y <= Math.min(H - 1, cy + 40); y++) {
        const r = rowVal(y);
        if (r > peak) { peak = r; peakY = y; }
      }
      const cells = OFFSETS.map((o) => {
        const y = peakY - o;
        if (y < 0) return "  -  ";
        return `${((100 * rowVal(y)) / (peak || 1)).toFixed(0).padStart(4)}%`;
      });
      console.log(`  ${v.width} ${name}  rim row ${peakY}, core +${peak.toFixed(1)} luma   ${OFFSETS.map((o) => `${o}px`.padStart(5)).join(" ")}`);
      console.log(`  ${" ".repeat(String(v.width).length)} ${" ".repeat(name.length)}  ${" ".repeat(26)}${cells.join(" ")}`);
    }
  }
  console.log("\n  ⚠ NOT WATCHED: the rim's own COLOUR (luma only); the sides and bottom edges;");
  console.log("    whether the numbers LOOK right — the target is a guide, Carl's eye is the verdict.");
  console.log("##VERDICT: NONE");
  await browser.close();
  process.exit(0);
}

// ── frames ──────────────────────────────────────────────────────────────────
if (mode === "frames") {
  /**
   * ⚠ SPLIT ON THE STRIKE. `neon-bloom.tsx` marks `neon:ignite` on the first
   * frame of an ignition; intervals are reported BEFORE it (load) and in the
   * IGNITION window after it, separately — a long frame during load must not be
   * read as the neon's. ⚠ And a CONTROL arm (`?neon=none`, no neon mounted) is
   * measured over the same offsets, so the neon's own cost is the DIFFERENCE.
   */
  const WINDOW_MS = 8000;
  const IGNITION_MS = 8500; // All four cards: CS settles at 6400 + 1690 ms; margin for the tail.
  const stats = (d) => {
    const s = [...d].sort((a, b) => a - b);
    const q = (p) => (s.length ? s[Math.min(s.length - 1, Math.floor(p * s.length))] : NaN);
    return `${String(d.length).padStart(3)} intervals  p50 ${q(0.5).toFixed(1)}  p95 ${q(0.95).toFixed(1)}  max ${(s.at(-1) ?? NaN).toFixed(1)}ms  >33: ${d.filter((x) => x > 33).length}  >50: ${d.filter((x) => x > 50).length}`;
  };
  console.log(`\nFRAMES — rAF intervals on /about#roles, split on the ignition's own mark.`);
  for (const v of VIEWPORTS) {
    let markAt = null;
    for (const [q, label] of [["", "ignition"], ["?neon=none", "control (no neon)"]]) {
      const { page } = await openCanvas(q, v, {
        initScript: () => {
          const t = [];
          window.__neonFrames = t;
          const tick = (ts) => { t.push(ts); requestAnimationFrame(tick); };
          requestAnimationFrame(tick);
        },
      });
      await page.waitForTimeout(WINDOW_MS);
      const renderer = await rendererString(page);
      const { ts, mark } = await page.evaluate(() => ({
        ts: window.__neonFrames.slice(),
        mark: performance.getEntriesByName("neon:ignite")[0]?.startTime ?? null,
      }));
      await page.close();
      if (label === "ignition") {
        markAt = mark;
        if (mark === null) console.log(`  ${v.width}  ⚠ NO neon:ignite MARK — the ignition never struck in ${WINDOW_MS}ms.`);
      }
      // The control has no mark of its own: split it at the ignition arm's offset.
      const split = markAt ?? Infinity;
      const pre = [];
      const ign = [];
      const long = [];
      for (let i = 1; i < ts.length; i++) {
        const dt = ts[i] - ts[i - 1];
        if (ts[i] < split) pre.push(dt);
        else if (ts[i] < split + IGNITION_MS) ign.push(dt);
        if (dt > 50) long.push(`${(ts[i] - split).toFixed(0)}ms:${dt.toFixed(0)}`);
      }
      console.log(`  ${v.width}  ${label.padEnd(18)} strike at ${markAt === null ? "-" : `${markAt.toFixed(0)}ms`}   [${renderer}]`);
      console.log(`         before strike   ${stats(pre)}`);
      console.log(`         ignition ${IGNITION_MS}ms ${stats(ign)}`);
      console.log(`         frames >50ms (time rel. strike: length) ${long.join("  ") || "none"}`);
    }
  }
  console.log("\n  ⚠ NOT WATCHED: GPU time per frame (rAF pacing shows main-thread stalls, not GPU cost);");
  console.log("    whether a stutter LOOKS right — that is Carl's eye at checkpoint 2.");
  console.log("##VERDICT: NONE");
  await browser.close();
  process.exit(0);
}
