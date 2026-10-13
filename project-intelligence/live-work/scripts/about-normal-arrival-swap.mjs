/** THE NORMAL PATH (13 October 2026, option A): `/about` from the top, 6 s in §1/§2 (the room renders, the mark arrives,
 *  the room warms), then a jump to `#start`: is the gold button live AT ONCE (no wait — the room was warm) and is its roll
 *  smooth? Reports `room:warm`'s time, the swap's time relative to the jump, and late frames for 4 s.
 *  ⚠ NOT WATCHED: a slow scroll; Carl's Chrome. */
import { chromium } from "playwright";
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto("http://localhost:3000/about", { waitUntil: "load" });
await p.mouse.move(5, 5);
await p.waitForTimeout(6000);
const r = await p.evaluate(() => new Promise((done) => {
  const a = document.querySelector('#start a[href="/start"]');
  const warm = performance.getEntriesByName("room:warm")[0]?.startTime ?? null;
  const t0 = performance.now(); const frames = []; let swap = a.dataset.drawn === "1" ? t0 : null;
  document.querySelector("#start").scrollIntoView({ block: "start" });
  const tick = (t) => { frames.push(t); if (swap === null && a.dataset.drawn === "1") swap = t; if (t - t0 < 4000) requestAnimationFrame(tick); else done({ warm, t0, swap, frames }); };
  requestAnimationFrame(tick);
}));
const gaps = r.frames.slice(1).map((t, i) => t - r.frames[i]);
console.log(`room:warm at ${r.warm ? (r.warm / 1000).toFixed(2) + " s" : "NOT MARKED"} · gold button live ${r.swap === null ? "NEVER ⛔" : r.swap <= r.t0 + 50 ? "already, at the jump ✅" : `${((r.swap - r.t0) / 1000).toFixed(2)} s after the jump`} · frames > 34 ms in 4 s: ${gaps.filter((d) => d > 34).length} (worst ${Math.max(...gaps).toFixed(0)} ms)`);
await b.close();
