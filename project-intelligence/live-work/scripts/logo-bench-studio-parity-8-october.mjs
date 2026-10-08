/** The bench's studio moved into shared data (`LOGO_JUDGING_STUDIO`, 8 October 2026) — check the bench is UNCHANGED:
 *  shoot front-gold and oblique-gold exactly as logo-pass1-shots-7-october.mjs did, into a separate folder, and diff
 *  against 7 October's frames. ⚠ NOT WATCHED: blue/crossing modes (same studio component). */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const OUT = "project-intelligence/live-work/screenshots/logo-studio-parity-8-october";
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 })).newPage();
for (const [name, q] of [["front-gold", "view=front&mode=gold"], ["oblique-gold", "view=oblique&mode=gold"]]) {
  await p.goto(`http://localhost:3000/proto/logo?${q}`, { waitUntil: "networkidle" });
  await p.waitForFunction(() => window.__logoBench?.ready === true, null, { timeout: 120000 });
  await p.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
  await p.waitForTimeout(1500);
  await p.locator("div.relative.border").first().screenshot({ path: `${OUT}/${name}.png` });
}
await b.close();
