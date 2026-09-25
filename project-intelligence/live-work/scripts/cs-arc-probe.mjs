/**
 * THE ARC ACROSS CS — reflected or transmitted? 25 September 2026 (third session). Carl: "there is an arc of a
 * streak accross the face of CS. Why is this?" CS cropped and enlarged under each condition, moving light held off
 * the cards (`?lmfreeze=0.45`), helpers off:
 *   base      — plain /about
 *   noenv     — `?envmap=0`: no reflection of the room
 *   nolight   — `?lmexp=0`: the moving light at 0
 *   rough35   — reserved (CS back at 0.35 needs a code change; compare with the earlier frame)
 *   node --no-warnings project-intelligence/live-work/scripts/cs-arc-probe.mjs
 * ⚠ NOT WATCHED: motion; what the arc looks like to Carl.
 */
import { chromium } from "playwright";
import sharp from "sharp";
import { mkdirSync } from "node:fs";
const out = "project-intelligence/live-work/screenshots/cs-arc-25-september";
mkdirSync(out, { recursive: true });
/* Run 1 (the cause): base · noenv · nolight. Run 2 (the fix, ENV_BLUR_SIGMA): pass "blur" as the first argument. */
const CASES = process.argv[2] === "blur"
  ? { "blur-0": "&envblur=0", "blur-035": "", "blur-070-size128": "&envsize=128&envblur=0.07" }
  : { base: "", noenv: "&envmap=0", nolight: "&lmexp=0" };
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 });
for (const [name, q] of Object.entries(CASES)) {
  const p = await ctx.newPage();
  await p.goto(`http://localhost:3000/about?lighthelpers=0&lmfreeze=0.45${q}#roles`, { waitUntil: "networkidle" });
  await p.waitForTimeout(3000);
  const png = await p.screenshot();
  await p.close();
  await sharp(png).extract({ left: 590, top: 60, width: 500, height: 200 }).resize(1000).toFile(`${out}/${name}.png`);
  console.log(`saved ${name}`);
}
await b.close();
