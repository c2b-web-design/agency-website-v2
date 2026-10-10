/** THE LIGHTS MADE VISIBLE (10 October 2026) — /about?lighthelpers=1: Roles (the mark at rest), then the wheel 300 px into
 *  the runway (the mark mid-journey) — the shadow lights and the studio panels must have moved WITH the mark.
 *  ⚠ NOT WATCHED: Carl's Chrome. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const out = "project-intelligence/live-work/screenshots/about-lighthelpers-10-october";
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport: { width: 1412, height: 700 } })).newPage();
const errs = [];
p.on("pageerror", (e) => errs.push(e.message));
await p.goto("http://localhost:3000/about?lighthelpers=1", { waitUntil: "networkidle" });
await p.waitForTimeout(2500);
await p.getByRole("link", { name: "Roles", exact: true }).first().click();
await p.waitForTimeout(2500);
await p.screenshot({ path: `${out}/at-rest.png` });
await p.mouse.move(700, 350);
for (let i = 0; i < 3; i++) { await p.mouse.wheel(0, 100); await p.waitForTimeout(500); }
await p.waitForTimeout(1000);
await p.screenshot({ path: `${out}/runway-300.png` });
console.log("page errors:", errs.length ? errs : "none");
await b.close();
