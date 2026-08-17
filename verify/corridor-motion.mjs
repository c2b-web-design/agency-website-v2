// The corridor's MOTION, sampled — so a restructure can be proved not to have
// changed it.
//
//   node verify/corridor-motion.mjs [label]
//
// ⚠⚠ CARL, 10 August 2026: *"the corridors movement is important, there is
// easing in there too."* He judges the motion by eye and that is the real gate.
// This exists so that between two builds there is also a NUMBER — an eye
// remembers a feeling, not a curve, and the two builds are minutes apart.
//
// ── WHAT IT SAMPLES ──────────────────────────────────────────────────────
//
// The phrase band animates `bottom` and `font-size` over 900ms on
// `cubic-bezier(0.37, 0, 0.63, 1)` (globals.css, `.enquiry-phrase-anim`). This
// samples the MOVING phrase's rendered geometry every frame across a corridor
// move and writes the trajectory to JSON.
//
// ⚠⚠ REBASED 17 AUGUST 2026 — IT HAD BEEN MEASURING SOMETHING STATIC.
//
// **Recorded as found, on Carl's instruction.** This harness sampled
// `.enquiry-pdepth-0` — the phrase ROOT. The 15 August extras split moved
// `bottom`/`opacity` off that root onto an inner `.enquiry-phrase-travel`
// wrapper (`globals.css:1650-1661`, and see `extras-hold-position.mjs` for why
// the split happened). **The root it sampled became static by design, and this
// harness kept reporting clean.**
//
// Measured on the unmodified tree, 17 August, before this rebase:
//
//     152 frames sampled across the move
//     phrase top   477 .. 477px
//     grid top     493 .. 493px   (152 frames)
//
// **One distinct value per channel, zero nulls, 2700ms span.** It would have
// reported 0% deviation against any change whatsoever. ⚠ Note the docblock in
// the compare path below still quotes endpoints "393..448" — that is THIS
// harness's own record of when it could still see the move, and the range a
// throwaway probe re-measured on `.enquiry-phrase-travel` (448.2 -> 392.8px,
// `bottom` 0 -> 58px, 54 distinct values). The animation never stopped; the
// sampler stopped being pointed at it.
//
// ⚠ HOW DEPTH IS RESOLVED ACROSS THE WHOLE SPAN — and it is NOT one selector.
// The phrase being sampled changes identity mid-move, so a selector that is
// correct during the move is wrong on either side of it:
//
//   BEFORE the click   the active phrase is `.enquiry-pdepth-0`; there is no
//                      depth-1 copy of it yet
//   DURING the move    ⚠ `.enquiry-pdepth-0` IS NOT IN THE DOM AT ALL —
//                      `enquiry-opening.tsx:1797` withholds the active phrase
//                      while `corridorMoving`. The mover is the receding copy at
//                      `.enquiry-pdepth-1`
//   AFTER it settles   the next question mounts at depth 0; the receded one
//                      stays at depth 1
//
// So the sampler prefers depth-1 and falls back to depth-0, and RECORDS WHICH IT
// TOOK on every frame (`depth` in each sample). A run whose frames are all
// depth-0 never caught the move; a run that never sees depth-1 is reported as an
// error rather than as 0% deviation.
//
// ⚠ THE SHAPE MATTERS, NOT JUST THE ENDPOINTS. A linear tween and an eased one
// arrive at the same place; the whole character of the corridor is in HOW they
// get there. So the samples are normalised 0..1 and compared as a curve, and
// the harness reports the largest deviation at any point along it.
//
// ⚠ AND THE ANSWER GRID IS SAMPLED SEPARATELY FROM THE PHRASE. That is the
// point of the exercise: the canvas currently lives INSIDE the phrase and
// inherits its motion for free. A shared-host restructure lifts it out, and the
// question this answers is whether the grid still travels exactly as the text
// does — or whether it has quietly become a second, hand-driven animation.
//
// ── HOW TO USE IT ────────────────────────────────────────────────────────
//
//   node verify/corridor-motion.mjs before     # on the current build
//   ...restructure...
//   node verify/corridor-motion.mjs after
//   node verify/corridor-motion.mjs --compare before after
//
// ⚠ PRODUCTION BUILD. Dev-server frame pacing is noise, and this measures
// pacing. The harness refuses :3000 for the reason recorded in
// transition-cost.mjs.

import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3100";
mkdirSync("verify/out", { recursive: true });

/**
 * ⚠⚠ THE NOISE FLOOR — UNESTABLISHED UNDER THE REBASED SAMPLING, AND SAYING SO
 * IS THE POINT.
 *
 * The old 5% was measured against a sampler now known to have been reading a
 * static element. **A threshold whose origin is wrong is worse than none**: it
 * looks like provenance. Until two captures on ONE unmodified tree have been
 * compared under the NEW sampling, this stays `null` and every channel is
 * reported as ⚠ UNJUDGED — the harness prints numbers and refuses a verdict.
 *
 * Set it to the measured figure once, with the two runs it came from named in
 * the comment beside it. `--floor <n>` overrides for the measuring run itself.
 */
/**
 * ⚠ MEASURED 17 AUGUST 2026 ON THE REBASED SAMPLING — three captures on ONE
 * unmodified tree (`402b1a3`), production build on :3100, compared pairwise:
 *
 *     probe1 vs probe2    phraseY 0.1%   travelBottom 0.1%   phraseSize 0.1%
 *     probe1 vs probe3    phraseY 0.1%   travelBottom 0.1%   phraseSize 0.1%
 *     probe2 vs probe3    phraseY 0.1%   travelBottom 0.1%   phraseSize 0.2%
 *
 * **Worst same-tree deviation: 0.2%.** ⚠ The old sampling's floor was 2.6-2.9%;
 * this one is an order of magnitude tighter because `travelBottom` is read from
 * computed style rather than inferred from a rect, so it carries no reflow.
 *
 * **1% is five times the worst observed noise**, and the injection it must catch
 * measured **9.2-13.0%** (eased -> linear: identical endpoints, identical
 * duration, different shape). Nine times of headroom either side.
 */
const FLOOR_MEASURED = 0.01;
const FLOOR_ARG = process.argv.includes("--floor")
  ? Number(process.argv[process.argv.indexOf("--floor") + 1])
  : null;
const FLOOR = FLOOR_ARG ?? FLOOR_MEASURED;

// ── compare mode ─────────────────────────────────────────────────────────
if (process.argv[2] === "--compare") {
  const a = process.argv[3];
  const b = process.argv[4];
  const pa = `verify/out/motion-${a}.json`;
  const pb = `verify/out/motion-${b}.json`;
  if (!existsSync(pa) || !existsSync(pb)) {
    console.error(`need both ${pa} and ${pb}`);
    process.exit(1);
  }
  const A = JSON.parse(readFileSync(pa, "utf8"));
  const B = JSON.parse(readFileSync(pb, "utf8"));

  /**
   * ⚠⚠ THE MOVING SEGMENT IS EXTRACTED FIRST, AND THE FIRST VERSION OF THIS
   * FUNCTION DID NOT DO THAT — IT REPORTED 92-100% DEVIATION BETWEEN TWO RUNS
   * OF IDENTICAL CODE.
   *
   * The sample window is ~158 frames but the move occupies only ~18→86 of them;
   * the rest is idle before and after. Normalising across the WHOLE window meant
   * a one-frame shift in when the click landed rescaled everything, so two
   * identical trajectories compared as completely different curves.
   *
   * ⚠ AND IT ALMOST SHIPPED AS A FINDING. The first before/after comparison
   * reported "phraseY 7.9% ⚠ CHANGED" and I was one step from reporting that as
   * a real effect of the wiring. **The same-build control is what caught it** —
   * run it, always, exactly as this project has required since
   * `approved-timings.mjs` reported four false "SHIFTED" rows on unchanged code.
   *
   * Endpoints were identical the whole time (393..448, starting and ending at
   * 444 in both runs). **The data was fine; the comparison was wrong.**
   */
  const segment = (vals) => {
    const v = vals.filter((x) => x !== null);
    if (v.length < 3) return [];
    const first = v[0], last = v[v.length - 1];
    // Trim the idle head and tail: the frames that have not started moving, and
    // the ones that have already arrived.
    let s = 0;
    while (s < v.length - 1 && Math.abs(v[s] - first) <= 0.5) s++;
    let e = v.length - 1;
    while (e > s && Math.abs(v[e] - last) <= 0.5) e--;
    // One frame of lead-in and lead-out, so the curve's ends are included.
    return v.slice(Math.max(0, s - 1), Math.min(v.length, e + 2));
  };

  const cmp = (key) => {
    const na = normalise(segment(A.samples.map((s) => s[key])));
    const nb = normalise(segment(B.samples.map((s) => s[key])));
    if (!na.length || !nb.length) return { worst: 0, at: 0, frames: [na.length, nb.length] };
    // Resample both onto a common 100-point axis: same FRACTION through the
    // move, which is what "the same moment in the animation" means when the two
    // runs have different frame counts.
    const N = 100;
    let worst = 0, at = 0;
    for (let i = 0; i < N; i++) {
      const f = i / (N - 1);
      const fa = na[Math.round(f * (na.length - 1))];
      const fb = nb[Math.round(f * (nb.length - 1))];
      const d = Math.abs(fa - fb);
      if (d > worst) { worst = d; at = f; }
    }
    return { worst, at, frames: [na.length, nb.length] };
  };

  console.log(`\n  comparing "${a}" -> "${b}"\n`);
  console.log(`  channel        worst deviation   at      moving frames`);
  for (const key of ["phraseY", "travelBottom", "gridY", "phraseSize"]) {
    const { worst, at, frames } = cmp(key);
    /**
     * ⚠ 5% WAS ABOVE THE MEASURED NOISE FLOOR **OF THE OLD SAMPLING**. Two runs
     * of the SAME build differed by 2.6–2.9%, purely from one-frame differences
     * in where the sampler catches the move.
     *
     * ⚠⚠ THAT PROVENANCE DIED WITH THE 17 AUGUST REBASE. The floor is a property
     * of THIS HARNESS's sampling, and the sampling changed — root -> travel
     * wrapper, depth-0 -> depth-1. The old figure was measured against a sampler
     * that, as it turned out, was reading a static element; it cannot be carried
     * forward. **The instruction on the line below was already written here and
     * was not followed when the split landed** — that is how the blindness
     * survived.
     *
     * ⚠ RE-MEASURE THE FLOOR IF THE SAMPLING CHANGES. It is a property of this
     * harness, not of the corridor. Two captures on ONE unmodified tree,
     * compared against each other; that number is the floor.
     */
    const flag = FLOOR === null ? "  ⚠ UNJUDGED" : worst > FLOOR ? "  ⚠ CHANGED" : "";
    console.log(
      `  ${key.padEnd(12)}   ${(worst * 100).toFixed(1).padStart(5)}%           ${(at * 100).toFixed(0).padStart(3)}%    ${frames[0]} vs ${frames[1]}${flag}`,
    );
  }
  if (FLOOR === null) {
    console.log(`\n  ⚠⚠ NO NOISE FLOOR IS ESTABLISHED for this sampling, so NOTHING above is a`);
    console.log(`     verdict. The old 5% was measured against the pre-rebase sampler, which was`);
    console.log(`     reading a static element — carrying it forward would be a threshold whose`);
    console.log(`     origin is wrong. Measure it: two captures on ONE unmodified tree, compared.\n`);
  } else {
    console.log(`\n  ⚠ >${(FLOOR * 100).toFixed(1)}% ANYWHERE ALONG THE CURVE IS A REAL CHANGE IN THE MOTION, even if`);
    console.log(`    the endpoints match. Carl judges by eye; this says where to look.\n`);
  }
  process.exit(0);
}

// ── capture mode ─────────────────────────────────────────────────────────
const LABEL = process.argv[2] ?? "run";

if (/:3000(\/|$)/.test(BASE)) {
  console.error(`\n⚠ REFUSING :3000 — this measures PACING, and dev-server pacing is noise.`);
  console.error(`  npm run build && npx next start -p 3100\n`);
  process.exit(1);
}

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(`${BASE}/start`, { waitUntil: "networkidle" });

const renderer = await page.evaluate(() => {
  const c = document.createElement("canvas");
  const gl = c.getContext("webgl2") || c.getContext("webgl");
  if (!gl) return "no webgl";
  const ext = gl.getExtension("WEBGL_debug_renderer_info");
  return ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "unknown";
});
if (/swiftshader|llvmpipe|software|no webgl/i.test(renderer)) {
  console.error(`⚠ ABORTING — "${renderer}" is a software rasteriser.`);
  await browser.close();
  process.exit(1);
}
console.log(`renderer: ${renderer}`);

await page.waitForTimeout(9000);
const begin = await page.$(".enquiry-begin-hit");
if (!begin) { console.error("Begin hit target not found"); await browser.close(); process.exit(1); }
await begin.click();
await page.waitForTimeout(12000);

const samples = await page.evaluate(async () => {
  const out = [];
  let running = true;

  const sample = () => {
    // ⚠ THE MOVER, NOT THE ROOT. `bottom`/`opacity` animate on
    // `.enquiry-phrase-travel`; the depth root is static since the 15 August
    // split. Depth-1 first — during the move that is the receding copy, and
    // depth-0 does not exist at all. See the header for the full resolution.
    const d1 = document.querySelector(".enquiry-pdepth-1");
    const d0 = document.querySelector(".enquiry-pdepth-0");
    const phrase = d1 || d0;
    const depth = d1 ? 1 : d0 ? 0 : null;
    const travel = phrase?.querySelector(".enquiry-phrase-travel");
    const q = phrase?.querySelector(".enquiry-phrase-question");
    // ⚠ The grid rides the STATIC root by design (Carl, 15 August: the cards
    // "fade in and out IN PLACE and never move"), so it is sampled for the
    // record but is expected to be flat. `extras-hold-position.mjs` is what
    // asserts that; a change here would show up as gridY acquiring motion.
    const grid = phrase?.querySelector(".enquiry-answer-grid");
    const tr = travel?.getBoundingClientRect();
    const gr = grid?.getBoundingClientRect();
    out.push({
      t: performance.now(),
      depth,
      phraseY: tr ? tr.top : null,
      travelBottom: travel ? parseFloat(getComputedStyle(travel).bottom) : null,
      gridY: gr ? gr.top : null,
      phraseSize: q ? parseFloat(getComputedStyle(q).fontSize) : null,
    });
    if (running) requestAnimationFrame(sample);
  };
  requestAnimationFrame(sample);

  // Force the button interactive and fire the move. See transition-cost.mjs:
  // there is no reachable corridor move until selection is wired.
  const btn = document.querySelector(".enquiry-nextstep-btn");
  const wrap = btn?.closest("div");
  if (wrap instanceof HTMLElement) {
    wrap.style.opacity = "1";
    wrap.style.pointerEvents = "auto";
  }
  await new Promise((r) => setTimeout(r, 300));
  if (btn instanceof HTMLElement) btn.click();

  await new Promise((r) => setTimeout(r, 2400));
  running = false;
  return out;
});

await browser.close();

const clean = samples.filter((s) => s.phraseY !== null);

const ys = clean.map((s) => s.phraseY);
const gs = clean.map((s) => s.gridY).filter((v) => v !== null);
const sawDepth1 = clean.some((s) => s.depth === 1);
const distinctY = new Set(ys.map((v) => v.toFixed(1))).size;
const spanY = ys.length ? Math.max(...ys) - Math.min(...ys) : 0;

/**
 * ⚠⚠ THE LIVENESS CHECK IS ON `travelBottom`, NOT ON `phraseY` — AND THAT WAS
 * DECIDED BY AN INJECTION THAT FAILED TO GO RED, NOT BY REASONING.
 *
 * `phraseY` is a rendered rect, so it carries REFLOW from the font-size
 * transition on the cue and question spans. Pinning `bottom` outright still left
 * `phraseY` moving **7.0px across 28 distinct values** — enough to clear a naive
 * liveness threshold and exit 0 on a recession that had been completely
 * suppressed. The harness would have passed its own no-motion injection.
 *
 * `travelBottom` is the animated PROPERTY, read from computed style. Under the
 * same injection it collapsed to **a single value (0)** against **55 distinct
 * values spanning 0→58px** on the honest run. It cannot pick up reflow from a
 * neighbouring transition because it is not a rect.
 */
const tbs = clean.map((s) => s.travelBottom).filter((v) => v !== null);
const distinctTB = new Set(tbs.map((v) => v.toFixed(2))).size;
const spanTB = tbs.length ? Math.max(...tbs) - Math.min(...tbs) : 0;

console.log(`\n  ${clean.length} frames sampled across the move`);
console.log(`  travel top   ${ys.length ? Math.min(...ys).toFixed(0) : "-"} .. ${ys.length ? Math.max(...ys).toFixed(0) : "-"}px   (${distinctY} distinct values, span ${spanY.toFixed(1)}px)`);
console.log(`  travel bottom ${tbs.length ? Math.min(...tbs).toFixed(0) : "-"} .. ${tbs.length ? Math.max(...tbs).toFixed(0) : "-"}px  (${distinctTB} distinct values, span ${spanTB.toFixed(1)}px)  ← the animated property`);
console.log(`  depth seen   ${[...new Set(clean.map((s) => s.depth))].join(", ") || "-"}${sawDepth1 ? "" : "   ⚠ NEVER SAW DEPTH 1"}`);
if (gs.length) {
  console.log(`  grid top     ${Math.min(...gs).toFixed(0)} .. ${Math.max(...gs).toFixed(0)}px   (${gs.length} frames, expected FLAT)`);
}

/**
 * ⚠⚠ A CAPTURE THAT SAW NO MOTION IS AN ERROR, NOT A ZERO.
 *
 * **This is the failure this harness actually shipped**, and it is why the check
 * exists: it sampled a static root for days and reported `477 .. 477px` with a
 * clean exit code. A trajectory with no trajectory in it cannot be a baseline —
 * compared against anything later it yields 0% deviation and certifies a change
 * it never measured. Green-by-emptiness, the same class as `one-context.mjs`
 * watching the wrong canvas.
 *
 * ⚠ THRESHOLDS ARE DELIBERATELY CRUDE. This is not measuring the move, it is
 * asking whether a move happened at all. The real recession is ~55px over ~54
 * distinct values; anything under 5px and 5 values is not a corridor move on any
 * build, so this cannot reject a legitimately retimed one.
 */
if (!clean.length) {
  console.error(`\n  ⛔ NO SAMPLES AT ALL — the phrase was never resolvable. Nothing was measured.`);
  process.exit(1);
}
if (!sawDepth1) {
  console.error(`\n  ⛔ THE MOVE NEVER FIRED — no frame ever saw a depth-1 phrase.`);
  console.error(`     The receding copy is what travels; if it never appeared, the click did not`);
  console.error(`     take. This is NOT a baseline and has not been saved.`);
  process.exit(1);
}
if (spanTB < 20 || distinctTB < 15) {
  console.error(`\n  ⛔ THE RECESSION DID NOT RUN — travelBottom took ${distinctTB} distinct value(s) across`);
  console.error(`     ${clean.length} frames, span ${spanTB.toFixed(1)}px. The real move is 0->58px over ~55 values.`);
  console.error(`     A static sample is not a trajectory. Compared against a later run this would`);
  console.error(`     report 0% deviation and certify a change it never measured.`);
  console.error(`     ⚠ THIS IS EXACTLY THE FAULT THIS HARNESS SHIPPED WITH (477..477 for 152 frames).`);
  console.error(`     ⚠ AND phraseY WOULD NOT HAVE CAUGHT IT: under a suppressed recession it still`);
  console.error(`       moved 7.0px over 28 values, purely from font-size reflow.`);
  console.error(`     Not saved.`);
  process.exit(1);
}

const path = `verify/out/motion-${LABEL}.json`;
writeFileSync(path, JSON.stringify({ label: LABEL, samples: clean }, null, 2));
console.log(`\n  saved ${path}`);
console.log(`  compare with:  node verify/corridor-motion.mjs --compare <a> <b>\n`);

function normalise(vals) {
  const v = vals.filter((x) => x !== null);
  if (!v.length) return [];
  const lo = Math.min(...v), hi = Math.max(...v);
  const span = hi - lo || 1;
  return v.map((x) => (x - lo) / span);
}
