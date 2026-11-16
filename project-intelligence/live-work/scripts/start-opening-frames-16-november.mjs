// /start's OPENING AS FRAMES (16 November 2026; D-101). Carl: "A way to buy us some time is instead of a subtext fade we
// could text reveal it at reading speed. Like at the start of the q+a section. go look." Screenshots of /start from load,
// every 0.5 s for 13 s (the heading's two lines, the subtext's 4.2 s wipe, the Begin button), into argv 2. READ-ONLY.
// NOT WATCHED: the frames between (the CSS runs continuously); a headed browser's scrollbar (headless has none).
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const OUT = process.argv[2];
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ channel: "chrome" });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await p.goto("http://localhost:3000/start", { waitUntil: "domcontentloaded" });
const t0 = Date.now();
for (let i = 0; i <= 26; i++) {
  const due = t0 + i * 500;
  const wait = due - Date.now();
  if (wait > 0) await p.waitForTimeout(wait);
  await p.screenshot({ path: `${OUT}/f${String(i).padStart(2, "0")}.png` });
}
await b.close();
console.log("frames written");
