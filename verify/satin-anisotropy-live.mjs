/**
 * IS THE ANISOTROPY ACTUALLY REACHING THE MATERIAL?
 *
 *   node verify/satin-anisotropy-live.mjs
 *
 * ⚠ THE QUESTION, AND WHY IT NEEDS AN INSTRUMENT RATHER THAN AN OPINION.
 * `MeshPhysicalMaterial.anisotropy` works in TANGENT SPACE. With no `tangent`
 * attribute three derives one from screen-space UV derivatives; with no `uv`
 * either, the direction is undefined. In both cases the dial appears to do
 * NOTHING while every value in the source is correct — and the natural reading
 * of that is "the value is wrong", which sends the next hour into retuning a
 * number that was never being read.
 *
 * ⚠ THIS PROJECT HAS MADE EXACTLY THAT MISTAKE'S COUSIN BEFORE: a warm-up gate
 * that was a *silent no-op* because the canvas it gated did not exist yet, and
 * a shader tint inserted AFTER the variable it wrote was consumed — *"it
 * compiles, runs, and does nothing"*. A dial that is not wired looks identical
 * to a dial that is wired and badly set.
 *
 * WHAT IT DOES. Reads the live material off the rendered scene and reports what
 * three actually holds — not what the source says it passed:
 *
 *   - the face geometry's attributes (is `tangent` present? `uv`?)
 *   - the material's anisotropy, rotation, sheen and roughness AS THREE HAS THEM
 *   - whether the shader program was compiled WITH the anisotropy define
 *
 * ⚠ THE DEFINE IS THE PROOF. Three only compiles the anisotropy path when
 * `material.anisotropy > 0` at program-build time. If the define is absent the
 * feature is not in the shader at all, whatever the property now says.
 */

import { chromium } from "playwright";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
const SETTLE_MS = 9000;

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto(`${BASE}/start`, { waitUntil: "networkidle" });

const renderer = await page
  .evaluate(() => {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    const d = gl && gl.getExtension("WEBGL_debug_renderer_info");
    return d ? gl.getParameter(d.UNMASKED_RENDERER_WEBGL) : "unknown";
  })
  .catch(() => "unknown");
console.log("renderer:", renderer);

// ⚠ THE SCENE IS REACHED THROUGH R3F'S OWN STORE, not through a global the app
// does not publish. `__r3f` is attached to the canvas element by the renderer.
await page.addInitScript(() => {
  window.__satinProbe = true;
});

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

const report = await page.evaluate(() => {
  const canvases = [...document.querySelectorAll("canvas")];
  const out = [];

  for (const c of canvases) {
    const store = c.__r3f?.store ?? c.__r3f?.root?.store;
    if (!store) continue;
    const state = store.getState ? store.getState() : null;
    if (!state || !state.scene) continue;

    state.scene.traverse((obj) => {
      const m = obj.material;
      if (!m || !obj.geometry) return;
      // The face is the only mesh carrying sheen in this scene.
      if (m.sheen === undefined || m.anisotropy === undefined) return;
      if (!(m.anisotropy > 0 || m.sheen > 0)) return;

      const attrs = Object.keys(obj.geometry.attributes || {});
      out.push({
        name: obj.name || "(unnamed)",
        type: m.type,
        attributes: attrs,
        hasTangent: attrs.includes("tangent"),
        hasUV: attrs.includes("uv"),
        anisotropy: m.anisotropy,
        anisotropyRotation: m.anisotropyRotation,
        sheen: m.sheen,
        sheenRoughness: m.sheenRoughness,
        sheenColor: m.sheenColor ? `#${m.sheenColor.getHexString()}` : null,
        color: m.color ? `#${m.color.getHexString()}` : null,
        roughness: m.roughness,
        metalness: m.metalness,
        transmission: m.transmission,
        envMapIntensity: m.envMapIntensity,
        // ⚠ THE PROOF. Three sets USE_ANISOTROPY on the program only when the
        // feature was live at compile time.
        defines: m.defines ? Object.keys(m.defines) : [],
        programDefines: (() => {
          try {
            const p = m.program;
            return p && p.defines ? Object.keys(p.defines) : null;
          } catch {
            return null;
          }
        })(),
      });
    });
  }
  return out;
});

await browser.close();

if (!report.length) {
  console.log("\n⚠ NO SATIN MATERIAL FOUND on any canvas. Either the scene did not");
  console.log("  mount, or the face no longer carries sheen/anisotropy.");
  process.exit(1);
}

for (const r of report) {
  console.log(`\n${"═".repeat(58)}`);
  console.log(`${r.type}  ${r.name}`);
  console.log(`${"═".repeat(58)}`);
  console.log(`  geometry attributes    ${r.attributes.join(", ")}`);
  console.log(`  ⚠ tangent present      ${r.hasTangent ? "YES" : "NO — anisotropy is INERT"}`);
  console.log(`  ⚠ uv present           ${r.hasUV ? "yes" : "NO"}`);
  console.log(`  anisotropy             ${r.anisotropy}`);
  console.log(`  anisotropyRotation     ${r.anisotropyRotation}`);
  console.log(`  sheen                  ${r.sheen}`);
  console.log(`  sheenRoughness         ${r.sheenRoughness}`);
  console.log(`  sheenColor             ${r.sheenColor}`);
  console.log(`  color (albedo)         ${r.color}`);
  console.log(`  roughness              ${r.roughness}`);
  console.log(`  metalness              ${r.metalness}`);
  console.log(`  transmission           ${r.transmission}`);
  console.log(`  envMapIntensity        ${r.envMapIntensity}`);
  console.log(`  material defines       ${r.defines.join(", ") || "(none)"}`);

  if (!r.hasTangent) {
    console.log(`
  ⚠ THE TANGENT ATTRIBUTE IS MISSING. The anisotropy value above is being
    read by three but has no direction to work along — the highlight will
    not stretch, or will stretch inconsistently per triangle. Fix the
    GEOMETRY, not the value.`);
  }
  if (r.anisotropy === 0) {
    console.log(`
  ⚠ ANISOTROPY IS ZERO. The material is a plain rough surface; there is no
    satin smear in the shader at all.`);
  }
}

console.log(`\n  ⚠ Verification is not approval. This says what three HOLDS.\n`);
