// OPTION C's HAND-OVER PROBE (26 November 2026): on the dev bench (`/proto/hero`, the opening B + C), every animation frame from the start: the opening
// still's element and its animation's time and opacity, and the scene's opening clock and light. READ-ONLY.
import { chromium } from "playwright";
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1896, height: 946 } });
await p.addInitScript(() => {
  window.__probe = [];
  const tick = () => {
    const i = document.getElementById("hero-opening-poster");
    const a = i?.getAnimations?.()[0];
    const h = window.__heroBench?.hero;
    window.__probe.push({ now: Math.round(performance.now()), img: !!i, cur: a ? a.currentTime : null, state: a?.playState, op: i ? getComputedStyle(i).opacity : null, wrapOp: document.getElementById("hero-opening-poster-wrap")?.style.opacity ?? null, t: h?.openingInfo?.t ?? null, lit: h?.openingInfo?.lit ?? null });
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForTimeout(6000);
const pr = await p.evaluate(() => window.__probe);
const first = pr.findIndex((x) => x.t !== null);
const keep = [...pr.slice(0, 4), ...pr.slice(Math.max(0, first - 3), first + 12)];
for (const x of keep) console.log(JSON.stringify(x));
await b.close();
