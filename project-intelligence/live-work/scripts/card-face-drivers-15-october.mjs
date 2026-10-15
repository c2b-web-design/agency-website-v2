/** WHAT LIGHTS THE CARD's FACE — separated (15 October 2026). `verify/face-drivers.mjs` zeroes only the static rig and names
 *  "the envMap, the sheen, or the baked albedo" together; it also finds card 1 by a fixed offset into the LARGEST canvas, which
 *  the shared host may have moved. This samples card 1 by its own hover box and separates the arms:
 *    full · rig 0 (`noglobal=0`: ambient + key + fill) · fader 0 (`light=0`: LIGHT_LEVEL, which also scales the face's env) ·
 *    both 0.
 *  A baked (albedo) colour cannot glow — with every light AND the environment at 0 the face must go dark; what survives "rig 0"
 *  but not "both 0" is the environment's (diffuse IBL + sheen + specular).
 *  Regions (css px inside the hover box): MID — 25% across, the band above the words; END — 6–14 px in from the left end at the
 *  vertical centre (where Carl sees the geometry lost).
 *  ⚠ NOT WATCHED: whether `light=` reaches every term (read from the code: the face's envMapIntensity = 0.22 × lightLevel);
 *  cards 2–5; Carl's display. */
import { chromium } from "playwright";
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })).newPage();
async function sample(q) {
  await p.goto("http://localhost:3000/start?" + q, { waitUntil: "load" });
  await p.waitForTimeout(8000);
  await p.getByRole("button", { name: /begin/i }).click();
  await p.locator(".enquiry-answer-grid").waitFor({ state: "visible", timeout: 30000 });
  await p.mouse.move(5, 5);
  await p.waitForTimeout(4500);
  const c = await p.getByTestId("answer-card-hover-0").boundingBox();
  const mean = async (clip) => p.evaluate(async (s) => {
    const img = new Image(); img.src = "data:image/png;base64," + s; await img.decode();
    const cv = document.createElement("canvas"); cv.width = img.width; cv.height = img.height;
    const x = cv.getContext("2d"); x.drawImage(img, 0, 0); const d = x.getImageData(0, 0, cv.width, cv.height).data;
    let sum = 0; for (let i = 0; i < d.length; i += 4) sum += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
    return sum / (d.length / 4);
  }, (await p.screenshot({ clip })).toString("base64"));
  return {
    mid: await mean({ x: c.x + c.width * 0.25 - 10, y: c.y + c.height * 0.5 - 13, width: 20, height: 4 }),
    end: await mean({ x: c.x + 6, y: c.y + c.height / 2 - 2, width: 8, height: 4 }),
  };
}
const arms = [["full", ""], ["rig 0", "noglobal=0"], ["fader 0", "light=0"], ["both 0", "noglobal=0&light=0"]];
const r = {};
for (const [n, q] of arms) { r[n] = await sample(q); console.log(`  ${n.padEnd(8)} MID ${r[n].mid.toFixed(1).padStart(6)}   END ${r[n].end.toFixed(1).padStart(6)}   (${q || "as shipped"})`); }
const share = (k) => ((r["rig 0"][k] - r["both 0"][k]) / Math.max(1e-6, r.full[k] - r["both 0"][k]) * 100).toFixed(0);
console.log(`\n  of the face's brightness above the floor ("both 0"): the ENVIRONMENT's share MID ${share("mid")}%, END ${share("end")}%`);
await b.close();
console.log("⚠ NOT WATCHED: whether `light=` reaches every term; cards 2–5; Carl's display.");
