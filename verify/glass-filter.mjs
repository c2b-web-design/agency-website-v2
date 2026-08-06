// Diagnostic: does the filament's light actually FILTER the glass it sits in?
//
//   node verify/glass-filter.mjs
//
// CARL'S BRIEF, and the distinction is the whole of it:
//   "So do I want amber frosted glass? No. I need the frosted glass to be tinged
//    by the light. To have the most subtle effect to confirm and reinforce that
//    this is a 3D object."
//
// Amber glass is a MATERIAL — the same colour whether the filament lives or
// dies. Glass tinged by light is a RESPONSE — it exists only while there is
// light to tinge it. This script tests for the response, not the colour.
//
// WHAT IT MEASURES. The face's specular band is the mirrored image of the
// studio's two COOL env panels. When the card lights, that reflection should
// warm — Carl: "when card 1 is locally lit, that white reflection wouldn't stay
// white, the amber would overpower it."
//
// ⚠ THE FALSIFYING CONTROL IS `?tinge=0`. With the filter switched off, lighting
// the card must produce NO warm shift on the face's reflection. If the sweep
// still reports one, the script is measuring something else — the rim's emissive
// bleeding into the sample, or its own noise — and every number is void.
//
// ⚠ AND A SILENT NO-OP IS THE SPECIFIC RISK HERE. `radiance` is written at
// lights_fragment_maps:33 and CONSUMED by RE_IndirectSpecular inside
// lights_fragment_end:16. Injecting after that include compiles, runs, and does
// nothing. A flat result at tinge=1 would then read as "the premise was wrong"
// rather than "the insertion point was" — so the tinge=0 vs tinge=1 pair is what
// distinguishes those two, and neither reading alone can.
//
// ⚠ HEADED, --enable-gpu. Headless substitutes SwiftShader, which renders
// transmission, PMREM and specular differently.

import { chromium } from "@playwright/test";
import { readFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";

// ⚠ RE-READ FROM SOURCE. A harness holding its own copy of a constant is how
// q5-stutter.mjs reported 0/3 CLEAN on a visible defect.
const glassSrc = readFileSync("components/enquiry/answer-card-glass.ts", "utf8");
const transmittance = /GLASS_FILTER_TRANSMITTANCE = "(#[0-9a-fA-F]{6})"/.exec(glassSrc)?.[1];
const strength = /GLASS_FILTER_STRENGTH = ([\d.]+)/.exec(glassSrc)?.[1];
console.log(`GLASS_FILTER_TRANSMITTANCE from source: ${transmittance}`);
console.log(`GLASS_FILTER_STRENGTH        from source: ${strength}`);
if (!transmittance) {
  console.error("Could not read the transmittance — has it been renamed?");
  process.exit(1);
}

const profile = mkdtempSync(join(tmpdir(), "glass-filter-"));
const context = await chromium.launchPersistentContext(profile, {
  headless: false, viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1,
  args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
});

// Card 1 spans grid x 0-186.66, y 0-48. Its face interior starts ~8 in from each
// edge. The band sits high on the crown, so sample across the upper face.
// ⚠ THE UPPER BAND ONLY. A first version also sampled the face's mid-line at
// y=24 and that row read Δwarm 5.8 with the filter OFF — it sits over the
// lockup's teal showing THROUGH the glass, which shifts for its own reasons when
// the card lights. One bad sample point then condemned three good ones, because
// the verdict took the worst row across all four.
//
// The band Carl is describing is high on the crown, where the env panel's
// reflection lands. Sample there and nowhere else.
const FACE = [
  ["upper face 30%", 56, 16],
  ["upper face 50%", 93, 16],
  ["upper face 70%", 130, 16],
];

const run = async (tinge) => {
  const page = await context.newPage();
  await page.goto(`${BASE}/start?tinge=${tinge}`, { waitUntil: "domcontentloaded" });
  const begin = page.getByRole("button", { name: /begin/i });
  await begin.waitFor({ state: "visible", timeout: 30000 });
  await page.waitForFunction(() => {
    const el = [...document.querySelectorAll("button")].find((x) => /begin/i.test(x.textContent ?? ""));
    return el && !el.disabled && getComputedStyle(el).pointerEvents !== "none";
  }, { timeout: 30000 });
  await begin.click();
  await page.waitForSelector('[data-testid="answer-card-proto"]', { timeout: 30000, state: "attached" });
  await page.waitForTimeout(9000);

  const box = await (await page.locator('[data-testid="answer-card-proto"] canvas').first()).boundingBox();
  const pts = Object.fromEntries(FACE.map(([label, gx, gy]) => [label, {
    x: Math.round(box.x + (gx / 576) * box.width),
    y: Math.round(box.y + (gy / 104) * box.height),
  }]));

  const sample = async () => {
    const b64 = (await page.screenshot()).toString("base64");
    return await page.evaluate(async ({ b64, pts }) => {
      const img = new Image();
      await new Promise((r) => { img.onload = r; img.src = "data:image/png;base64," + b64; });
      const c = document.createElement("canvas");
      c.width = img.width; c.height = img.height;
      const ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0);
      // ⚠ SCALE FROM THE IMAGE, never from an assumed deviceScaleFactor.
      const s = img.width / window.innerWidth;
      const out = {};
      for (const [k, p] of Object.entries(pts)) {
        const d = ctx.getImageData(Math.round(p.x * s) - 4, Math.round(p.y * s) - 4, 9, 9).data;
        let r = 0, g = 0, b = 0, n = 0;
        for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
        out[k] = { r: r / n, g: g / n, b: b / n };
      }
      return out;
    }, { b64, pts });
  };

  const before = await sample();
  await page.locator('[data-testid="answer-card-hover-0"]').dispatchEvent("pointerdown");
  await page.waitForTimeout(3500);
  const after = await sample();
  await page.close();
  return { before, after };
};

const results = {};
for (const tinge of [0, 1, 2]) results[tinge] = await run(tinge);

const f = (v) => v.toFixed(1).padStart(7);
console.log(`\n${"═".repeat(78)}`);
console.log("GLASS FILTER — card 1 lit. Change in the face's reflection, by filter strength.");
console.log(`${"═".repeat(78)}`);
console.log("\n  Δ = lit minus unlit.  warm(R-B) rising means the cool band is being filtered warm.\n");

for (const [label] of FACE.map((x) => [x[0]])) {
  console.log(`  ${label}`);
  for (const tinge of [0, 1, 2]) {
    const a = results[tinge].before[label], b = results[tinge].after[label];
    const dWarm = (b.r - b.b) - (a.r - a.b);
    const dLum = 0.2126 * (b.r - a.r) + 0.7152 * (b.g - a.g) + 0.0722 * (b.b - a.b);
    console.log(`    tinge=${tinge}   Δwarm ${f(dWarm)}   Δlum ${f(dLum)}   RGB ${f(b.r)}${f(b.g)}${f(b.b)}`);
  }
}

// The verdict rests on the tinge=0 control, not on the tinge=1 reading.
const warmAt = (t) => FACE.reduce((m, [label]) => {
  const a = results[t].before[label], b = results[t].after[label];
  return Math.max(m, Math.abs((b.r - b.b) - (a.r - a.b)));
}, 0);

const off = warmAt(0), on = warmAt(1), more = warmAt(2);
console.log(`\n${"─".repeat(78)}`);
console.log(`  worst |Δwarm| at tinge=0 (control): ${off.toFixed(2)}`);
console.log(`  worst |Δwarm| at tinge=1:           ${on.toFixed(2)}`);
console.log(`  worst |Δwarm| at tinge=2:           ${more.toFixed(2)}`);

if (off > 2) {
  console.log(`
  ⚠ THE CONTROL MOVED. With the filter OFF the face's reflection still shifted,
    so these samples are picking up something other than the filter — most likely
    the rim's emissive bleeding into the patch. Move the sample points inward and
    re-run before reading anything above.`);
} else if (on <= off + 1) {
  console.log(`
  ⚠ THE FILTER DID NOTHING. tinge=1 is indistinguishable from tinge=0. The most
    likely cause is a SILENT NO-OP: check the injection landed BEFORE
    "#include <lights_fragment_end>" and not after — after it, radiance has
    already been consumed by RE_IndirectSpecular and the write is discarded.`);
} else if (more <= on) {
  console.log(`
  ⚠ NOT MONOTONIC. Doubling the filter did not deepen the effect, which a
    Beer-Lambert pow() must. Check uAmber is reaching the shader unclamped.`);
} else {
  console.log(`
  → THE FILTER WORKS AND SCALES. The control is flat, tinge=1 shifts the band
    warm, and tinge=2 deepens it — which is what pow(T, density) should do.

    ⚠ This says the mechanism is live, NOT that the value is right. The brief is
    "the most subtle effect"; the setting is Carl's, on [b]. Verification is not
    approval.`);
}
console.log();

await context.close();
try { rmSync(profile, { recursive: true, force: true }); } catch {}
