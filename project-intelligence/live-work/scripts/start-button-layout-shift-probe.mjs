/** DOES THE GOLD BUTTON MOVE IN THE DOCUMENT AFTER A SCROLL TO THE TOP? (13 October 2026 — it redraws ~1.6 s after the
 *  scroll with no event; R3F redraws a canvas whose measured box changes.) Logs the link's document position (rect.top +
 *  scrollY) and size every frame for 6 s after the scroll, and layout-shift entries. ⚠ NOT WATCHED: anything else. */
import { chromium } from "playwright";
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto("http://localhost:3000/about#start", { waitUntil: "load" });
await p.mouse.move(5, 5);
await p.waitForFunction(() => document.querySelector('#start a[href="/start"]')?.dataset.drawn === "1", null, { timeout: 60000 });
await p.waitForTimeout(2000);
const log = await p.evaluate(() => new Promise((done) => {
  const out = []; const a = document.querySelector('#start a[href="/start"]'); const t0 = performance.now();
  try { new PerformanceObserver((l) => l.getEntries().forEach((e) => out.push(`+${((e.startTime - t0) / 1000).toFixed(2)}s layout-shift ${e.value.toFixed(4)} ${(e.sources || []).map((s) => s.node?.nodeName + "." + (s.node?.className?.toString?.().slice(0, 40) ?? "")).join(", ")}`))).observe({ type: "layout-shift" }); } catch {}
  window.scrollTo(0, 0);
  let last = "";
  const tick = () => {
    const r = a.getBoundingClientRect(); const k = `${(r.top + scrollY).toFixed(1)} ${r.width.toFixed(1)}×${r.height.toFixed(1)}`;
    if (k !== last) { out.push(`+${((performance.now() - t0) / 1000).toFixed(2)}s link at y ${k}`); last = k; }
    if (performance.now() - t0 < 6000) requestAnimationFrame(tick); else done(out);
  };
  requestAnimationFrame(tick);
}));
console.log(log.join("\n"));
await b.close();
