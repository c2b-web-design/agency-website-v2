/** THE DESK MARK FROM THE WORKER, CHECKED (13 October 2026). Loads `/about?markcheck=1` (dev only): the page builds the
 *  geometry inline as well and logs whether worker and inline agree, array by array (positions, normals, index and its
 *  type). Also reports any worker failure (the page would then fall back to inline) and whether the mark was drawn.
 *  ⚠ NOT WATCHED: production (the check is stripped there); the mark's look (judged by eye / the page's own frames). */
import { chromium } from "playwright";
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const logs = [];
p.on("console", (m) => { if (/markcheck|desk mark/i.test(m.text())) logs.push(m.text()); });
p.on("pageerror", (e) => logs.push("PAGE ERROR: " + e.message));
await p.goto("http://localhost:3000/about?markcheck=1", { waitUntil: "load" });
for (let i = 0; i < 60 && !logs.some((l) => /markcheck|failed/.test(l)); i++) await p.waitForTimeout(500);
console.log(logs.length ? logs.join("\n") : "⛔ no [markcheck] line within 30 s");
console.log(logs.some((l) => /IDENTICAL/.test(l)) ? "✅ worker = inline" : "⛔ not shown identical");
await b.close();
