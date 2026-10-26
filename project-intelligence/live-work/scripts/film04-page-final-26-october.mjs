/** FILM 04 — THE APPROVED PAGE, ONE CLEAN TAKE (26 October 2026, R-094). `/proto/your-words` at 1920 × 1080, DPR 1, dev server,
 *  badge hidden: viewport 1 held `hold1` s → a slow eased scroll to viewport 2 over `scroll` s → the arch's full journey
 *  (`journey` s; its clock starts as viewport 2 comes on screen). Playwright's WebM; convert to 1080p30 CFR for Resolve.
 *    node …/film04-page-final-26-october.mjs <base> <outDir> <name> [hold1] [scroll] [journey]
 *  ⚠ NOT WATCHED: whether it is good (Carl's eye); a dev server's frame pacing is not production's. */
import { chromium } from "playwright";
import { mkdirSync, renameSync } from "node:fs";

const [BASE = "http://localhost:3000", OUT = ".", NAME = "page-final", HOLD1 = "5", SCROLL = "2.5", JOURNEY = "32"] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const VP = { width: 1920, height: 1080 };
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: VP, deviceScaleFactor: 1, recordVideo: { dir: OUT, size: VP } });
const p = await ctx.newPage();
const t0 = Date.now();
const at = () => ((Date.now() - t0) / 1000).toFixed(2);
await p.goto(`${BASE}/proto/your-words`, { waitUntil: "networkidle" });
await p.addStyleTag({ content: "nextjs-portal{display:none!important}" });
await p.waitForTimeout(1500);
console.log(`viewport 1 held from ${at()} s`);
await p.waitForTimeout(Number(HOLD1) * 1000);
console.log(`scroll begins at ${at()} s`);
await p.evaluate(async (ms) => {
  const from = window.scrollY, to = window.innerHeight, start = performance.now();
  await new Promise((done) => {
    const step = (now) => {
      const x = Math.min(1, (now - start) / ms);
      window.scrollTo(0, from + (to - from) * x * x * (3 - 2 * x));
      if (x < 1) requestAnimationFrame(step);
      else done();
    };
    requestAnimationFrame(step);
  });
}, Number(SCROLL) * 1000);
console.log(`viewport 2 settled at ${at()} s`);
await p.waitForTimeout(Number(JOURNEY) * 1000);
const v = p.video();
await ctx.close();
renameSync(await v.path(), `${OUT}/${NAME}.webm`);
console.log(`→ ${OUT}/${NAME}.webm`);
await b.close();
