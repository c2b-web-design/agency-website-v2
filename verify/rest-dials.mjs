/**
 * The resting rig's dials, side by side — frames for Carl's eye.
 *
 *   node verify/rest-dials.mjs
 *
 * ⚠ WHY FRAMES AND NOT NUMBERS. Every measurement of this rig today has been
 * misleading: a narrow-strip luminance sampler reported "no change" on a scene
 * that was visibly animating, and reported the peak pinned at 38% while the
 * profile actually carried TWO bands. Carl's eye has been right each time and
 * the instrument wrong. So this renders the options and stops there.
 *
 * ⚠ THE DEFECT BEING CHASED, in his words: *"too dark at the edges"*, and
 * earlier *"it looks like the face is floating on its own... its reading as
 * black."* Two changes landed together and either could cause it — the
 * directional fill dropped 1.55 -> 0.16, and the arc became a tight ellipse at
 * radius 26 which rakes a narrow band and never reaches the outer edges.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const OUT = "verify/out/rest-dials";
mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:3000";

const COMBOS = [
  { tag: "arcx-70",  q: "arcx=70" },
  { tag: "arcx-90",  q: "arcx=90" },
  { tag: "arcx-115", q: "arcx=115" },
  { tag: "arcx-145", q: "arcx=145" },
  { tag: "arcx-180", q: "arcx=180" },
];

const browser = await chromium.launch({ headless: false, args: ["--enable-gpu","--use-angle=default","--ignore-gpu-blocklist"] });
for (const c of COMBOS) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await page.goto(`${BASE}/start${c.q ? "?" + c.q : ""}`, { waitUntil: "networkidle" });
  const begin = page.getByRole("button", { name: /begin/i });
  await begin.waitFor({ state: "visible", timeout: 25000 });
  await page.waitForFunction(() => { const b=[...document.querySelectorAll("button")].find(el=>/begin/i.test(el.textContent??"")); return b && !b.disabled && getComputedStyle(b).pointerEvents!=="none"; }, { timeout: 25000 });
  await begin.click();
  await page.waitForTimeout(9000);
  const grid = await page.evaluate(() => { const el=document.querySelector(".enquiry-answer-grid"); const r=el.getBoundingClientRect(); return {x:r.x-20,y:r.y-20,width:r.width+40,height:r.height+40}; });
  await page.screenshot({ path: `${OUT}/${c.tag}.png`, clip: grid });
  console.log(`  ${c.tag.padEnd(20)} ${c.q || "(defaults)"}`);
  await page.close();
}
await browser.close();
console.log(`\n  ${OUT}/`);
console.log(`\n  ⚠ Verification is not approval — these are options, not answers.\n`);
