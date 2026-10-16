/** THE PLANET FADES IN ON BEGIN (16 October 2026). Carl: "when the button is pressed and only the text remains it should
 *  fade in at this point as the first question is revealed and the cards make their appearance."
 *  /start at Carl's screen (1920 × 952, DPR 1), cold: the planet layer's COMPUTED opacity sampled through the opening (must
 *  read 0 throughout, credit included), then from the Begin click every 100 ms for 5.5 s; stills at Begin −0.1 s and
 *  +0.5 / 1.3 / 2.6 / 4.9 s; then the same click under reduced motion (must read 1 at once). (The CSS edit is comment-only, so a stale served
 *  stylesheet cannot change this result; the fade's duration is read off the samples.)
 *  Usage: node …/planet-at-begin-16-october.mjs <outDir> [baseUrl, default http://localhost:3000]
 *  ⚠ NOT WATCHED: Carl's GPU/Chrome; the completion cross-fade (unchanged, measured 15 Oct); production's network. */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [OUT, BASE = "http://localhost:3000"] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const read = (p) =>
  p.evaluate(() => {
    const L = [...document.querySelectorAll(".enquiry-space-layer")];
    // By the CREDIT, not the <img>: since the priority change (16 Oct) the <img> mounts only when the opening arms.
    const planet = L.find((l) => /Exoplanet/.test(l.textContent ?? ""));
    const gal = L.find((l) => l !== planet);
    return { planet: +getComputedStyle(planet).opacity, galactic: +getComputedStyle(gal).opacity };
  });
for (const reduced of [false, true]) {
  const ctx = await b.newContext({ viewport: { width: 1920, height: 952 }, deviceScaleFactor: 1, reducedMotion: reduced ? "reduce" : "no-preference" });
  const p = await ctx.newPage();
  const errs = [];
  p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  await p.goto(BASE + "/start", { waitUntil: "load" });
  const opening = [];
  const t0 = Date.now();
  const begin = p.getByRole("button", { name: /begin/i });
  // Through the opening: sample until Begin is pressable.
  while (Date.now() - t0 < 20000) {
    opening.push((await read(p)).planet);
    if ((await begin.getAttribute("aria-disabled")) === null && Date.now() - t0 > 1000) break;
    await p.waitForTimeout(200);
  }
  await p.waitForTimeout(reduced ? 300 : 5200); // let the Begin reveal finish
  const tag = reduced ? "reduced" : "motion";
  if (!reduced) writeFileSync(join(OUT, `${tag}-0-before-begin.png`), await p.screenshot());
  await begin.click();
  const tc = Date.now();
  const samples = [];
  const stills = reduced ? [] : [500, 1300, 2600, 4900];
  while (Date.now() - tc < (reduced ? 400 : 5500)) {
    const t = Date.now() - tc;
    samples.push(`${t}:${(await read(p)).planet.toFixed(2)}`);
    if (stills.length && t >= stills[0]) writeFileSync(join(OUT, `${tag}-${stills.shift()}ms.png`), await p.screenshot());
    await p.waitForTimeout(100);
  }
  console.log(`\n[${tag}] opening: ${opening.length} samples, planet opacity max ${Math.max(...opening)} ${Math.max(...opening) === 0 ? "✅ hidden throughout" : "❌ SHOWN"}`);
  console.log(`[${tag}] from the Begin click (ms:opacity): ${samples.join("  ")}`);
  console.log(`[${tag}] galactic at the end: ${(await read(p)).galactic}`);
  console.log(`[${tag}] console errors: ${errs.length}`, errs.slice(0, 2));
  await ctx.close();
}
await b.close();
console.log("\n⚠ NOT WATCHED: Carl's GPU/Chrome; the completion cross-fade (unchanged); production's network. →", OUT);
