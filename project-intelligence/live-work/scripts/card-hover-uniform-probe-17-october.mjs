/** TEMPORARY DIAGNOSTIC (17 October 2026): reads window.__hovProbe — the hover ease's own samples, pushed by a temporary
 *  line in answer-card-mesh.tsx — while the pointer rests on card 1. Usage: node …/card-hover-uniform-probe-17-october.mjs */
import { chromium } from "playwright";
const AFTER_BEGIN = Number(process.argv[2] ?? 7000); // ms from the Begin click to the hover
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1920, height: 952 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
p.on("console", (m) => m.type() === "error" && console.log("console error:", m.text().slice(0, 200)));
await p.goto("http://localhost:3000/start", { waitUntil: "load" });
await p.waitForTimeout(9000);
await p.getByRole("button", { name: /begin/i }).click();
await p.mouse.move(5, 5);
const tBegin = await p.evaluate(() => Math.round(performance.now()));
await p.waitForTimeout(AFTER_BEGIN);
await p.evaluate(() => { window.__hovProbe = []; });
const hb = await p.getByTestId("answer-card-hover-0").boundingBox();
await p.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2);
await p.waitForTimeout(5000);
console.log("Begin at", tBegin, "· pointer on card 1 at", await p.evaluate(() => Math.round(performance.now())) - 5000);
const s = await p.evaluate(() => window.__hovProbe);
console.log(`${s.length} samples; first 5:`, s.slice(0, 5), "\nlast 5:", s.slice(-5));
const byId = {};
for (const x of s) { const [t, tg, v, id] = x.split(" "); (byId[id] ??= []).push(`${t}:${tg}:${v}`); }
for (const [id, a] of Object.entries(byId)) console.log(id, a.length, "samples ·", a.slice(0, 3).join(" "), "…", a.slice(-3).join(" "));
await b.close();
