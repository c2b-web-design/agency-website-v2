// THE SEND OPAL, LOOKED AT (23 November 2026; Carl: "Go look at the Send button in Client info.", on the hero's marble).
// /start?skip=1 (the dev door to client info), its entrance waited out (12 s), then the page and the Send button close up,
// six frames across one light orbit (~10 s). READ-ONLY. ⚠ NOT WATCHED: Carl's Chrome; hover; phones.
import { chromium } from "playwright";
const OUT = process.argv[2];
const b = await chromium.launch({ channel: "chrome", headless: false, args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 2 })).newPage();
await p.goto("http://localhost:3000/start?skip=1", { waitUntil: "load" });
await p.waitForTimeout(12000);
await p.screenshot({ path: `${OUT}/page.png` });
const btn = p.locator(".enquiry-send-btn").first();
console.log("send button:", await btn.count(), await btn.boundingBox());
for (let i = 0; i < 6; i++) {
  await btn.screenshot({ path: `${OUT}/send-${i}.png` });
  await p.waitForTimeout(1700);
}
await b.close();
