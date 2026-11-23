// A LOOK AT perchance.org's text-to-image generator (23 November 2026; Carl: "go here, its a little known but very good
// generator"). Opens the page, waits, screenshots it whole, and lists its visible controls' text. Nothing typed, nothing
// generated. READ-ONLY.
import { chromium } from "playwright";
const OUT = process.argv[2];
const b = await chromium.launch({ channel: "chrome", headless: false });
const p = await (await b.newContext({ viewport: { width: 1400, height: 1000 } })).newPage();
await p.goto("https://perchance.org/ai-text-to-image-generator", { waitUntil: "load", timeout: 60000 }).catch((e) => console.log("goto", e.message.split("\n")[0]));
await p.waitForTimeout(8000);
await p.screenshot({ path: `${OUT}/perchance.png`, fullPage: true });
const texts = [];
for (const f of p.frames()) {
  try {
    const t = await f.evaluate(() => [...document.querySelectorAll("label, button, select, option, h1, h2, h3, p, textarea")].map((e) => (e.tagName + ": " + (e.innerText || e.placeholder || e.value || "")).trim().slice(0, 140)).filter((s) => s.length > 6));
    texts.push(`--- frame ${f.url().slice(0, 90)}`, ...t.slice(0, 120));
  } catch {}
}
console.log(texts.join("\n"));
await b.close();
