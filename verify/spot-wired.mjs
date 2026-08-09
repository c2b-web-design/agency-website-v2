/**
 * Is the travelling SPOTLIGHT actually lighting anything?
 *
 *   node verify/spot-wired.mjs
 *
 * ⚠ THIS ANSWERS A QUESTION THE GEOMETRY CHECKS CANNOT. Distance, cone angle and
 * coverage all measured healthy while Carl reported *"i cant see it"*. Those
 * checks all assume the light is WIRED — that its target is in the scene graph
 * and that three.js is resolving the cone the way the maths assumes. A spotlight
 * whose `target` was never added to the scene silently aims at the origin, and
 * every geometric check would still pass.
 *
 * ⚠ SO THIS DIFFERENCES RENDERS INSTEAD OF INTROSPECTING. `satin-wired.mjs`
 * records that introspection FAILED on this R3F version; the reliable test is to
 * change the light and see whether pixels move. If turning the traveller off
 * changes nothing, it was never contributing.
 */

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const OUT = "verify/out/spot-wired";
mkdirSync(OUT, { recursive: true });

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

async function renderer() {
  return page
    .evaluate(() => {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2") || c.getContext("webgl");
      const d = gl && gl.getExtension("WEBGL_debug_renderer_info");
      return d ? gl.getParameter(d.UNMASKED_RENDERER_WEBGL) : "unknown";
    })
    .catch(() => "unknown");
}

/** Mean luminance of the card row, with the static rig off so only the traveller lights it. */
async function meanLuminance(url, label) {
  await page.goto(`${BASE}${url}`, { waitUntil: "networkidle" });
  const begin = page.getByRole("button", { name: /begin/i });
  await begin.waitFor({ state: "visible", timeout: 20000 });
  await begin.click();
  await page.waitForTimeout(4200);

  const clip = await page.evaluate(() => {
    const cs = [...document.querySelectorAll("canvas")];
    if (!cs.length) return null;
    const r = cs.map((c) => c.getBoundingClientRect()).sort((a, b) => b.width * b.height - a.width * a.height)[0];
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  });
  if (!clip) return null;

  // Several moments, because the light MOVES — one frame is one accident.
  const readings = [];
  for (const t of [0, 1400, 2900, 4600, 6300]) {
    if (t) await page.waitForTimeout(t - readings.at(-1)?.t || 0);
    const buf = await page.screenshot({ clip });
    await page.screenshot({ path: `${OUT}/${label}-t${t}.png`, clip });
    // Decode via the browser so no image library is needed.
    const mean = await page.evaluate(async (b64) => {
      const img = new Image();
      img.src = "data:image/png;base64," + b64;
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
    }, buf.toString("base64"));
    readings.push({ t, mean });
  }
  return readings;
}

console.log("renderer:", await page.goto(`${BASE}/start`).then(renderer), "\n");

// ARM A: the traveller alone, at its normal brightness.
const on = await meanLuminance("/start?noglobal=1", "traveller-on");
// ARM B: the traveller effectively off. If A and B match, the light does nothing.
const off = await meanLuminance("/start?noglobal=1&travint=0", "traveller-off");

console.log("mean luminance of the card row, static rig OFF:\n");
console.log("     t        traveller on    traveller off    difference");
let maxDiff = 0;
for (let i = 0; i < on.length; i++) {
  const d = Math.abs(on[i].mean - off[i].mean);
  if (d > maxDiff) maxDiff = d;
  console.log(
    `  ${String(on[i].t).padStart(5)}ms   ${on[i].mean.toFixed(2).padStart(12)}   ${off[i].mean
      .toFixed(2)
      .padStart(13)}   ${d.toFixed(3).padStart(10)}`,
  );
}

console.log(`\n  largest difference: ${maxDiff.toFixed(3)}`);
console.log(
  maxDiff < 0.5
    ? "\n  ⚠⚠ THE TRAVELLER IS CONTRIBUTING NOTHING. Turning it off changes no pixels.\n"
    : "\n  The traveller does light the cards. Whether it reads well is Carl's call.\n",
);

await browser.close();
