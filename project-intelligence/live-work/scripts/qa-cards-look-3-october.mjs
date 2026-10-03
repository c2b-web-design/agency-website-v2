/** Q+A CARDS, ONE FRAME — 3 October 2026, for comparing their light with /about's. Carl: "go look at the q+a section".
 *  /start, wait for Begin, press it, frame the Q5 cards. ⚠ NOT WATCHED: anything but one frame. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const out = "project-intelligence/live-work/screenshots/qa-look-3-october";
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 });
const p = await ctx.newPage();
await p.goto("http://localhost:3000/start", { waitUntil: "networkidle" });
const begin = p.getByRole("button", { name: "Begin", exact: true }).first();
await begin.waitFor({ state: "visible", timeout: 30000 });
await p.waitForTimeout(1500);
await begin.click();
await p.waitForTimeout(7000);
await p.screenshot({ path: `${out}/q5-cards.png` });
await p.waitForTimeout(5000);
await p.screenshot({ path: `${out}/q5-cards-5s-later.png` });
await b.close();
