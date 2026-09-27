/**
 * ONE FRAME of plain /about with the face's highlight cap — 27 September 2026. Both lights, dips at their default
 * (off), cap at its default, rims held full, held at CS's worst lap point. Console errors printed (a failed shader
 * patch shows up there first).
 *   node --no-warnings project-intelligence/live-work/scripts/highlight-cap-frame.mjs [lap=0.70] [extra=]
 * ⚠ A FROZEN frame — Carl: "Its a lot different when its moving". The judgement is his eye, on the moving page.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const lap = process.argv[2] ?? "0.70";
const extra = process.argv[3] ?? "";
const out = "project-intelligence/live-work/screenshots/highlight-cap-frame-27-september";
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 });
{ const p = await ctx.newPage(); await p.goto("http://localhost:3000/about#roles", { waitUntil: "networkidle" }); await p.waitForTimeout(1500); await p.close(); }
const p = await ctx.newPage();
const errors = [];
p.on("console", (m) => { if (m.type() === "error" || /shader|program|GLSL/i.test(m.text())) errors.push(`${m.type()}: ${m.text().slice(0, 300)}`); });
p.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
await p.goto(`http://localhost:3000/about?lighthelpers=0&neon=full&seq=ca,cb,cd,cs&textstatic=1&lmfreeze=${lap}${extra ? "&" + extra : ""}#roles`, { waitUntil: "networkidle" });
await p.waitForTimeout(3000);
const file = `${out}/lap-${lap}${extra ? "-" + extra.replace(/[^a-z0-9.]+/gi, "_") : ""}.png`;
await p.screenshot({ path: file });
console.log(file);
console.log(errors.length ? errors.join("\n") : "console: no errors");
await b.close();
