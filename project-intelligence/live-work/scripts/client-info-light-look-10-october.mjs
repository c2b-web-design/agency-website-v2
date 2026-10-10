/** THE CLIENT INFO LIGHT, LOOKED AT (10 October 2026) — Carl: "go and look at the client info section- see what the
 *  light is doing", for the desk mark's light. /start?skip=1 (the dev door), the field's entrance waited out (8.1 s +
 *  margin), then frames over ~11 s (one 10 s orbit and a bit), each named by its time. ⚠ NOT WATCHED: Carl's Chrome. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const out = "project-intelligence/live-work/screenshots/client-info-light-10-october";
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport: { width: 1412, height: 700 } })).newPage();
await p.goto("http://localhost:3000/start?skip=1", { waitUntil: "networkidle" });
await p.waitForTimeout(11000);
const t0 = Date.now();
while (Date.now() - t0 < 11000) {
  await p.screenshot({ path: `${out}/t${String(Date.now() - t0).padStart(5, "0")}.png` });
  await p.waitForTimeout(350);
}
await b.close();
