// THE SUBTEXT LETTERS' START TIMES AND THE STILL GAPS BETWEEN THEM (28 November 2026; Carl: "a slight stall after the W"). READ-ONLY.
// Reads each 2D subtext letter's animation delay from the dev bench; a gap = the next letter starting after the previous one has finished.
// NOT WATCHED: anything but the 2D subtext's CSS schedule (no freezes, no 3D).
import { chromium } from "playwright";
const b = await chromium.launch({ channel: "chrome" });
const p = await b.newPage({ viewport: { width: 1896, height: 946 }, deviceScaleFactor: 1 });
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForTimeout(1500);
const lines = await p.evaluate(() => [1, 2].map((n) => [...document.getElementById("hero-flow-sub" + n).querySelectorAll("span")].map((s) => ({ ch: s.textContent, d: parseFloat(getComputedStyle(s).animationDelay), dur: parseFloat(getComputedStyle(s).animationDuration) }))));
await b.close();
for (const [k, l] of lines.entries()) {
  const D = l[0].dur;
  const gaps = [];
  for (let i = 1; i < l.length; i++) {
    if (l[i].ch.trim() === "") continue;
    let j = i - 1;
    while (j >= 0 && l[j].ch.trim() === "") j--;
    const dead = l[i].d - (l[j].d + D);
    if (dead > 0.04) gaps.push(`${l[j].ch}→${l[i].ch} ${(dead * 1000).toFixed(0)}ms`);
  }
  console.log(`line ${k + 1}: starts ${l[0].d}s, last letter ${l.at(-1).d}s; still gaps (>40 ms, ${D} s fades): ${gaps.join(", ") || "none"}`);
}
