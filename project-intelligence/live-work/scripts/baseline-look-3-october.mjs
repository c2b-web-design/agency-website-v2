/** THE 3 OCTOBER BASELINE, LOOKED AT — rims on, all four texts static, no lights. Plain /about, top, press Roles;
 *  frames at 8 s and 60 s (CA used to go out at 56 s); console errors. ⚠ NOT WATCHED: Carl's Chrome. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const out = "project-intelligence/live-work/screenshots/baseline-3-october";
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 });
{ const p = await ctx.newPage(); await p.goto("http://localhost:3000/about", { waitUntil: "networkidle" }); await p.waitForTimeout(1500); await p.close(); }
const p = await ctx.newPage();
const errs = [];
p.on("console", (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 300)); });
p.on("pageerror", (e) => errs.push(e.message.slice(0, 300)));
await p.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
await p.waitForTimeout(2000);
await p.getByRole("link", { name: "Roles", exact: true }).first().click();
await p.waitForTimeout(8000);
await p.screenshot({ path: `${out}/at-8s.png` });
await p.waitForTimeout(52000);
await p.screenshot({ path: `${out}/at-60s.png` });
console.log(errs.length ? errs.join("\n") : "no console errors");
await b.close();
