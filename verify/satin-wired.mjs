/**
 * IS THE ANISOTROPY WIRED? A differential test, not an introspection.
 *
 *   node verify/satin-wired.mjs
 *
 * ⚠ THE PROBLEM THIS SOLVES. `MeshPhysicalMaterial.anisotropy` is SILENTLY
 * INERT without a `tangent` attribute on the geometry — three falls back to
 * screen-space UV derivatives, and with no `uv` either the direction is
 * undefined. The dial then appears to do nothing while every value in the
 * source is correct, and the natural reading is "the value is wrong". That
 * sends the next hour into retuning a number nothing is reading.
 *
 * ⚠ AND INTROSPECTION FAILED HERE. Two attempts to read the live material — via
 * `canvas.__r3f` and by walking the React fiber tree — both returned NOTHING on
 * this version of R3F. **A probe that cannot find the object cannot clear it
 * either**, and reporting "no satin material found" as if it were a finding
 * about the material would have been a false negative of exactly the kind this
 * project keeps recording.
 *
 * ⚠ SO THIS ASKS THE QUESTION THE ONLY WAY THAT CANNOT LIE: change the input,
 * look at the OUTPUT. Anisotropy smears the specular lobe along the tangent.
 * Rotating that smear by 90° MUST change the rendered pixels on a curved,
 * lit surface. If rotation 0 and rotation π/2 are pixel-identical, the feature
 * is not reaching the shader and no value will fix it.
 *
 * ⚠ IT ALSO TESTS STRENGTH 0 vs FULL, which separates two different failures:
 *   - rot 0 == rot π/2  but  0 != full   ->  wired, but the TANGENT is degenerate
 *   - 0 == full                          ->  not wired at all
 *   - both differ                        ->  wired and working
 *
 * ⚠ HEADED, --enable-gpu. Headless substitutes SwiftShader, whose shading is not
 * the shading under test.
 */

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const OUT = "verify/out/satin-wired";
mkdirSync(OUT, { recursive: true });

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
const SETTLE_MS = 9000;

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"],
});

/** Render card 1 under a given query string and return its raw pixels. */
async function shoot(label, query) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await page.goto(`${BASE}/start?${query}`, { waitUntil: "networkidle" });

  const renderer = await page
    .evaluate(() => {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2") || c.getContext("webgl");
      const d = gl && gl.getExtension("WEBGL_debug_renderer_info");
      return d ? gl.getParameter(d.UNMASKED_RENDERER_WEBGL) : "unknown";
    })
    .catch(() => "unknown");
  if (/swiftshader|llvmpipe|software/i.test(String(renderer))) {
    console.error(`\n⚠ ABORTING — software rasteriser (${renderer}).`);
    await browser.close();
    process.exit(1);
  }

  const begin = page.getByRole("button", { name: /begin/i });
  await begin.waitFor({ state: "visible", timeout: 25000 });
  await page.waitForFunction(
    () => {
      const b = [...document.querySelectorAll("button")].find((el) => /begin/i.test(el.textContent ?? ""));
      return b && !b.disabled && getComputedStyle(b).pointerEvents !== "none";
    },
    { timeout: 25000 },
  );
  await begin.click();
  await page.waitForTimeout(SETTLE_MS);

  const box = await page.evaluate(() => {
    const el = document.querySelector("[data-testid='answer-card-hover-0']");
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  });
  if (!box) {
    console.error("\n⚠ CARD 1 NOT FOUND.");
    await browser.close();
    process.exit(1);
  }

  const buf = await page.screenshot({ path: `${OUT}/${label}.png`, clip: box });
  await page.close();
  return { label, buf, renderer };
}

/** Mean absolute per-pixel difference, via Chromium's own PNG decode. */
async function diff(a, b) {
  const p = await browser.newPage();
  const d = await p.evaluate(
    async ([ua, ub]) => {
      const load = async (u) => {
        const img = new Image();
        await new Promise((res, rej) => {
          img.onload = res;
          img.onerror = rej;
          img.src = u;
        });
        const c = document.createElement("canvas");
        c.width = img.width;
        c.height = img.height;
        c.getContext("2d").drawImage(img, 0, 0);
        return c.getContext("2d").getImageData(0, 0, img.width, img.height);
      };
      const A = await load(ua);
      const B = await load(ub);
      if (A.width !== B.width || A.height !== B.height) return { error: "size mismatch" };
      let sum = 0;
      let worst = 0;
      const n = A.data.length / 4;
      for (let i = 0; i < A.data.length; i += 4) {
        const dr = Math.abs(A.data[i] - B.data[i]);
        const dg = Math.abs(A.data[i + 1] - B.data[i + 1]);
        const db = Math.abs(A.data[i + 2] - B.data[i + 2]);
        const m = (dr + dg + db) / 3;
        sum += m;
        if (m > worst) worst = m;
      }
      return { mean: sum / n, worst };
    },
    [`data:image/png;base64,${a.buf.toString("base64")}`, `data:image/png;base64,${b.buf.toString("base64")}`],
  );
  await p.close();
  return d;
}

console.log("Rendering the same card under three material settings...\n");

const rot0 = await shoot("rot-0", "aniso=0.68&anisorot=0");
console.log("renderer:", rot0.renderer);
const rot90 = await shoot("rot-90", "aniso=0.68&anisorot=1.5708");
const off = await shoot("aniso-off", "aniso=0");

const dRot = await diff(rot0, rot90);
const dStrength = await diff(rot0, off);

await browser.close();

console.log(`\n${"═".repeat(60)}`);
console.log(`IS THE SATIN ANISOTROPY WIRED?`);
console.log(`${"═".repeat(60)}`);
console.log(`  rotation 0 vs 90°      mean ${dRot.mean?.toFixed(3)}  worst ${dRot.worst?.toFixed(1)}`);
console.log(`  strength 0.68 vs 0     mean ${dStrength.mean?.toFixed(3)}  worst ${dStrength.worst?.toFixed(1)}`);

// ⚠ THE THRESHOLD IS DELIBERATELY LOW. Anything above ~0.5 mean is far beyond
// dithering or AA noise between two renders of an identical static scene; the
// scene has no animation left running at this point.
const ROT_LIVE = (dRot.mean ?? 0) > 0.5;
const STRENGTH_LIVE = (dStrength.mean ?? 0) > 0.5;

console.log("");
if (ROT_LIVE && STRENGTH_LIVE) {
  console.log(`  ✅ WIRED AND WORKING. Both the strength and the direction change
     the rendered pixels, so the tangent is present and meaningful.`);
} else if (!STRENGTH_LIVE) {
  console.log(`  ⚠ NOT WIRED. Turning anisotropy from 0.68 to 0 changed nothing.
     The feature is not reaching the shader. Check that the geometry
     carries a \`tangent\` attribute — FIX THE GEOMETRY, NOT THE VALUE.`);
} else {
  console.log(`  ⚠ PARTIALLY WIRED. Strength has an effect but ROTATION does not,
     which means the tangent exists but is degenerate or uniform —
     the smear has no direction to rotate within.`);
}

console.log(`\n  ${OUT}/`);
console.log(`\n  ⚠ Verification is not approval. This answers "is it connected".\n`);
