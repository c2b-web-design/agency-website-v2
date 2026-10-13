/** When does the gold button on /about report its letters drawn? data-drawn polled to 20 s, §4 on screen (13 October).
 *  Also the link's computed colour (transparent once drawn). ⚠ NOT WATCHED: anything else. */
import { chromium } from "playwright";
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
p.on("console", (m) => { if (/error|lost/i.test(m.text())) console.log("console:", m.text().slice(0, 200)); });
await p.goto("http://localhost:3000/about" + (process.argv[2] ?? ""), { waitUntil: "networkidle" });
await p.evaluate(() => document.querySelector("#start").scrollIntoView({ block: "start" }));
const t0 = Date.now();
for (let i = 0; i < 20; i++) {
  const s = await p.evaluate(() => { const a = document.querySelector('#start a[href="/start"]'); return `${a.dataset.drawn} ${getComputedStyle(a).color} canvas=${!!a.querySelector("canvas")}`; });
  console.log(`${((Date.now() - t0) / 1000).toFixed(1)}s  drawn=${s}`);
  await p.waitForTimeout(1000);
}
await b.close();
