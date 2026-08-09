/**
 * WHAT ACTUALLY SETS THE FACE'S BRIGHTNESS? Differencing, not theorising.
 *
 *   node verify/face-drivers.mjs
 *
 * ⚠ THIS EXISTS BECAUSE A LAMBERT MODEL PREDICTED A CHANGE THAT DID NOT HAPPEN.
 * Raising the fill from 0.35 to 0.8 was calculated to lift the crown's dark side
 * substantially (swing 3.06x → 1.83x). Measured on the real GPU, the face moved
 * from **56 to 58** — essentially nothing.
 *
 * ⚠ SO THE MODEL WAS MEASURING THE WRONG SURFACE. `MeshPhysicalMaterial` with
 * sheen, anisotropy and a low `envMapIntensity` does not respond like the ideal
 * diffuse surface the hand calculation assumed. **A plausible cause measured
 * false — again — and this project's rule is that the measurement wins.**
 *
 * ⚠ WHAT THIS DOES: turns each candidate driver up and down IN THE REAL SCENE
 * and reports which ones actually move the face's pixels. No hypothesis about
 * the shading model survives contact with a difference image.
 */

import { chromium } from "playwright";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });

await page.goto(`${BASE}/start?travint=0`, { waitUntil: "networkidle" });
const renderer = await page
  .evaluate(() => {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    const d = gl && gl.getExtension("WEBGL_debug_renderer_info");
    return d ? gl.getParameter(d.UNMASKED_RENDERER_WEBGL) : "unknown";
  })
  .catch(() => "unknown");
console.log("renderer:", renderer, "\n");
if (/swiftshader|llvmpipe|software/i.test(String(renderer))) {
  console.error("⚠ ABORTING — software rasteriser.");
  await browser.close();
  process.exit(1);
}

/** Mean luminance of card 1's face, sampled ABOVE the baked label text. */
async function faceLuminance(url) {
  await page.goto(`${BASE}${url}`, { waitUntil: "networkidle" });
  const begin = page.getByRole("button", { name: /begin/i });
  await begin.waitFor({ state: "visible", timeout: 20000 });
  await begin.click();
  await page.waitForTimeout(4500);

  const clip = await page.evaluate(() => {
    const cs = [...document.querySelectorAll("canvas")];
    if (!cs.length) return null;
    const r = cs.map((c) => c.getBoundingClientRect()).sort((a, b) => b.width * b.height - a.width * a.height)[0];
    // Card 1's face, inset well past the rim so only the satin is sampled.
    const cx = r.x + r.width / 2 - 192;
    const cy = r.y + r.height / 2 - 28;
    return { x: cx - 60, y: cy - 16, width: 120, height: 10 };
  });
  if (!clip) return null;

  const b64 = (await page.screenshot({ clip })).toString("base64");
  return page.evaluate(async (s) => {
    const img = new Image();
    img.src = "data:image/png;base64," + s;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.width;
    c.height = img.height;
    const x = c.getContext("2d");
    x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height).data;
    let sum = 0;
    for (let i = 0; i < d.length; i += 4) sum += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
    return sum / (d.length / 4);
  }, b64);
}

// `?noglobal=` scales the WHOLE static rig (ambient + key + fill) — the one
// dial that is known to be wired, so it brackets how much the directionals can
// possibly be worth on this surface.
const arms = [
  ["static rig at full (baseline)", "/start?travint=0"],
  ["static rig at 0 — lights OFF", "/start?travint=0&noglobal=0"],
  ["static rig x0.5", "/start?travint=0&noglobal=0.5"],
  ["static rig x2", "/start?travint=0&noglobal=2"],
];

const results = [];
for (const [label, url] of arms) {
  const v = await faceLuminance(url);
  results.push([label, v]);
  console.log(`  ${label.padEnd(32)} face = ${v === null ? "n/a" : v.toFixed(2)}`);
}

const base = results[0][1];
const off = results[1][1];
console.log(`\n  lights full → off:  ${base.toFixed(2)} → ${off.toFixed(2)}   (difference ${(base - off).toFixed(2)})`);
console.log(
  off > base * 0.6
    ? "\n  ⚠⚠ THE DIRECTIONAL LIGHTS BARELY MATTER. Most of the face's brightness\n" +
        "     survives with the whole static rig at zero, so something else — the\n" +
        "     envMap, the sheen, or the baked albedo — is setting it. Tuning key\n" +
        "     and fill cannot fix the edges.\n"
    : "\n  The directional rig does drive the face. Tuning it is the right lever.\n",
);

await browser.close();
