import { chromium } from "playwright";
const b = await chromium.launch({ channel: "chrome" });
const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
const errs = [];
p.on("pageerror", (e) => errs.push(String(e).slice(0, 200)));
p.on("console", (m) => m.type() === "error" && errs.push(m.text().slice(0, 200)));
await p.goto("http://localhost:3000/about", { waitUntil: "load" });
await p.waitForTimeout(6000);
const h = await p.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < h; y += 400) { await p.evaluate((y) => window.scrollTo(0, y), y); await p.waitForTimeout(250); }
await p.waitForTimeout(4000);
console.log("about errors:", errs.length, errs.slice(0, 5));
await b.close();
