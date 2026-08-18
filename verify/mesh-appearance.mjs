// ⚠⚠ THE APPEARANCE GATE — DOES THE ARM STILL RENDER THE CHROME?
//
//   node verify/mesh-appearance.mjs [--nobtn]
//
// ⛔ RUN THIS BEFORE TRUSTING ANY TIMING OR CONTEXT NUMBER FROM AN ARM.
//
// ─────────────────────────────────────────────────────────────────────────────
// ⚠⚠ WHY THIS EXISTS — 18 August 2026
// ─────────────────────────────────────────────────────────────────────────────
//
// Commit 1 of the Q5 freeze repair moved the button's canvas to a persistent
// host. The host was mounted inside a TRANSFORMED ancestor, so `position: fixed`
// resolved against the shell instead of the viewport: the mesh painted ~411px
// right and ~248px below the button. **Carl saw a flat white DOM pill.**
//
// ⚠⚠ AND A CONTEXT-COUNT CHECK WAS ONE COMMAND FROM CERTIFYING IT AS FIXED.
// The count read the structural target met — 2 contexts, down from 8 — which is
// EXACTLY what a build renders when the mesh never mounts at all. Carl:
//
//   *"2 contexts is exactly what a build renders when the mesh never mounts.
//    A context-count check on this build reports the structural change as
//    achieved while the button is functionally deleted."*
//
// Same class as version 3 of the reveal instrument reporting a filmed freeze
// clean: **a true number about a visibly broken page.**
//
// ⛔ A STRUCTURAL CHANGE THAT DELETES THE THING IT WAS PRESERVING IS NOT A
// STRUCTURAL CHANGE.
//
// ─────────────────────────────────────────────────────────────────────────────
// ⚠ WHAT THIS IS AND IS NOT
// ─────────────────────────────────────────────────────────────────────────────
//
// **It is a FLOOR, not a verdict.** It confirms that something chrome-like is
// painted where the button is. It CANNOT confirm the material is right — the
// blue, the crown, the end caps, the traveller. **Carl judges the chrome by eye
// and that judgement is not replaceable by this or any harness.**
//
// It answers exactly one question: *did the mesh render at the button, at all?*

import { chromium } from "playwright";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3100";
if (/:3000(\/|$)/.test(BASE)) {
  console.error(`\n⚠ REFUSING :3000 — production is the verdict.\n`);
  process.exit(1);
}

const NOBTN = process.argv.includes("--nobtn");
const URL_START = `${BASE}/start${NOBTN ? "?nobtnmesh=1" : ""}`;

console.log(`\n⚠ MESH APPEARANCE GATE`);
console.log(`   url: ${URL_START}`);
console.log(`   arm: ${NOBTN ? "?nobtnmesh=1 — mesh SHOULD be absent" : "baseline — mesh MUST be present"}\n`);

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
});
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(URL_START, { waitUntil: "networkidle" });
await page.waitForTimeout(9000);
const begin = await page.$(".enquiry-begin-hit");
if (!begin) {
  console.error(`⛔ no Begin hit target.`);
  process.exit(1);
}
await begin.click();
await page.waitForTimeout(11000);

// ⚠ A SELECTION IS REQUIRED — the button's wrapper is `opacity: 0` until one
// exists, so a shot taken without selecting films a transparent button and
// would report the mesh missing on a healthy build.
const hits = await page.$$('[data-testid^="answer-card-hover-"]');
if (!hits.length) {
  console.error(`\n⛔ NO CARD HIT TARGETS — cannot make a selection, so the button never appears.`);
  console.error(`   This is a HARNESS failure, not a product verdict. See the reachability gate.\n`);
  process.exit(1);
}
await hits[0].dispatchEvent("pointerdown");
await page.waitForTimeout(1200);

const state = await page.evaluate(() => {
  const btn = document.querySelector(".enquiry-nextstep-btn");
  const host = document.querySelector('[data-testid="nextstep-surface-host"]');
  if (!btn) return { err: "no button" };
  const br = btn.getBoundingClientRect();
  const hr = host ? host.getBoundingClientRect() : null;
  return {
    btn: { l: br.left, t: br.top, w: br.width, h: br.height },
    host: hr ? { l: hr.left, t: hr.top, w: hr.width, h: hr.height } : null,
    hostVisible: host ? getComputedStyle(host).visibility : null,
    cbOk: host ? host.getAttribute("data-cb-ok") : null,
    cbDrift: host ? host.getAttribute("data-cb-drift") : null,
    hasMeshClass: btn.className.includes("enquiry-nextstep-btn--mesh"),
  };
});

if (state.err) {
  console.error(`⛔ ${state.err}`);
  process.exit(1);
}

console.log(`  button      ${JSON.stringify(state.btn)}`);
console.log(`  host        ${JSON.stringify(state.host)}   visibility=${state.hostVisible}`);
console.log(`  --mesh cls  ${state.hasMeshClass}`);

// ⚠⚠ THE CONTAINING-BLOCK ASSERTION, read from the host itself. The component
// sets `data-cb-ok=0` and logs when its painted rect disagrees with the rect it
// was given. **This is the fault that produced the flat white pill.**
if (state.cbOk === "0") {
  console.error(`\n⛔⛔ CONTAINING BLOCK IS NOT THE VIEWPORT — drift ${state.cbDrift}px.`);
  console.error(`   An ancestor has transform/filter/perspective/contain/will-change.`);
  console.error(`   The mesh is painting somewhere other than the button. FIGURES VOID.\n`);
  process.exit(1);
}

// ── THE PIXEL TEST ──────────────────────────────────────────────────────────
// ⚠ CROP TO THE BUTTON'S OWN BOX and ask whether it looks like chrome or like a
// flat painted pill. The mesh is a blue-tinted metallic gradient; the CSS
// fallback is a near-uniform surface. **Colour VARIANCE across the box is what
// separates them** — a rendered mesh has a specular ramp, a fallback does not.
const shot = await page.screenshot({
  clip: { x: state.btn.l, y: state.btn.t, width: state.btn.w, height: state.btn.h },
});

const stats = await page.evaluate(async (b64) => {
  const img = new Image();
  img.src = "data:image/png;base64," + b64;
  await img.decode();
  const c = document.createElement("canvas");
  c.width = img.width; c.height = img.height;
  const g = c.getContext("2d");
  g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, c.width, c.height).data;
  let n = 0, sum = 0, sumSq = 0, blueish = 0;
  const lums = [];
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], gg = d[i + 1], bb = d[i + 2];
    const lum = 0.2126 * r + 0.7152 * gg + 0.0722 * bb;
    lums.push(lum);
    sum += lum; sumSq += lum * lum; n++;
    if (bb > r + 6) blueish++;
  }
  const mean = sum / n;
  const sd = Math.sqrt(sumSq / n - mean * mean);
  lums.sort((x, y) => x - y);
  return {
    n, mean: +mean.toFixed(1), sd: +sd.toFixed(1),
    p05: +lums[Math.floor(n * 0.05)].toFixed(1),
    p95: +lums[Math.floor(n * 0.95)].toFixed(1),
    bluePct: +(100 * blueish / n).toFixed(1),
  };
}, shot.toString("base64"));

console.log(`\n  pixels      n=${stats.n}  mean lum=${stats.mean}  sd=${stats.sd}`);
console.log(`  ramp        p05=${stats.p05}  p95=${stats.p95}  spread=${(stats.p95 - stats.p05).toFixed(1)}`);
console.log(`  blue-ish    ${stats.bluePct}%  (blue channel above red)`);

// ─────────────────────────────────────────────────────────────────────────────
// ⚠⚠ THE DISCRIMINATOR IS STRUCTURAL, NOT PIXEL STATISTICS. Read why.
// ─────────────────────────────────────────────────────────────────────────────
//
// The first version of this gate used luminance spread + "blue leads red" over
// the button's crop, and it PASSED THE SUPPRESSED ARM — reporting chrome present
// on a build where `--mesh` was false and the host was `visibility: hidden`.
//
// ⚠ THE CAUSE, and it is worth carrying: the crop is dominated by the PAGE
// BACKGROUND and the WHITE LABEL TEXT, not by either surface. And the CSS
// fallback's `--refl-*` variables are permanently 0 (the JS that set them was
// deleted), so its gradients are fully transparent — **both arms crop to nearly
// the same pixels.** A statistic that cannot separate two states is not a test
// of them, however plausible its thresholds look.
//
// ⛔ SO THE GATE ASKS THE DOM WHAT IT ACTUALLY RENDERED. `--mesh` is applied only
// when the canvas is really there (`box && !suppressMesh`), and the host reports
// its own visibility and its containing-block check. Those are the states that
// differ. The pixel stats are still PRINTED — they are useful context and they
// would catch a black or empty canvas — but they do not decide the verdict.
//
// ⚠ THIS IS THE SAME LESSON AS THE REVEAL INSTRUMENT: measure the channel where
// the difference actually lives, not the one that is easiest to compute.
const meshRendered =
  state.hasMeshClass === true &&
  state.hostVisible === "visible" &&
  state.host !== null &&
  state.host.w > 1 &&
  state.host.h > 1;

// ⚠ A canvas that mounted but drew nothing would still pass the structural
// check, so the pixel floor is kept as a SECOND condition on the positive arm:
// a fully uniform crop means nothing was painted at all.
const NOT_BLANK_MIN = 8;   // luminance spread p05..p95
const notBlank = (stats.p95 - stats.p05) >= NOT_BLANK_MIN;

const present = meshRendered && notBlank;

console.log("");
if (NOBTN) {
  if (present) {
    console.error(`  ⛔ MESH PRESENT ON THE SUPPRESSED ARM — ?nobtnmesh=1 is not taking effect.`);
    process.exit(1);
  }
  console.log(`  ✅ mesh absent, as expected on ?nobtnmesh=1.`);
} else {
  if (!present) {
    console.error(`  ⛔⛔ NO CHROME AT THE BUTTON.`);
    console.error(`     --mesh class ${state.hasMeshClass}   host visibility ${state.hostVisible}   host box ${JSON.stringify(state.host)}`);
    console.error(`     crop spread ${(stats.p95 - stats.p05).toFixed(1)} (need >=${NOT_BLANK_MIN})`);
    console.error(`     This is the flat-DOM-pill state. ⛔ DO NOT TRUST ANY TIMING OR`);
    console.error(`     CONTEXT NUMBER FROM THIS BUILD.\n`);
    process.exit(1);
  }
  console.log(`  ✅ CHROME PRESENT at the button.`);
  console.log(`  ⚠ A FLOOR, NOT A VERDICT — this says something metallic rendered in the`);
  console.log(`    right place. It does NOT say the material is right. Carl judges by eye.`);
}
console.log("");
await ctx.close();
await browser.close();
