// Film the header mark on /start from the Begin press — 7 October 2026 (Carl: "after the ivory begin button is
// pressed look what the Logo does"). Headed, real GPU, Carl's viewport at DPR 4 (to read the mark). Frames of the mark every ~60 ms for 1.8 s.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const OUT = "project-intelligence/live-work/screenshots/start-logo-7-october";
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 4 });
const p = await ctx.newPage();
await p.goto("http://localhost:3000/start", { waitUntil: "networkidle" });
await p.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
await p.waitForTimeout(9000);
const mark = p.locator('img[src*="c2b-logo-blue-mark"]').first();
const box = await mark.evaluate((el) => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
console.log("mark box", box);
const clip = { x: Math.max(0, box.x - 20), y: Math.max(0, box.y - 12), width: box.w + 40, height: box.h + 24 };
await p.screenshot({ path: `${OUT}/00-before.png`, clip });
await p.screenshot({ path: `${OUT}/page-before.png` });
await p.getByRole("button", { name: /begin/i }).click();
const t0 = Date.now();
for (let i = 1; i <= 30; i++) {
  await p.screenshot({ path: `${OUT}/${String(i).padStart(2, "0")}-${Date.now() - t0}ms.png`, clip });
}
await p.waitForTimeout(1500);
await p.screenshot({ path: `${OUT}/zz-after.png`, clip });
await p.screenshot({ path: `${OUT}/page-after.png` });
await b.close();
