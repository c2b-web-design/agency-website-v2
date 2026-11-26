// THE FLOWING OPENING, PLAYED LIVE (26 November 2026): every animation frame on the dev bench (`/proto/hero`) at Carl's
// window — the HTML headline's fade time, the scene's opening clock, the headline's depth, each subtext line's extrusion
// start and done flag, the logo's fade, the HTML parts' opacity. READ-ONLY. Prints the moments each action starts and ends.
import { chromium } from "playwright";
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu"] });
const p = await b.newPage({ viewport: { width: 1896, height: 946 } });
await p.addInitScript(() => {
  window.__fl = [];
  const tick = () => {
    const h = document.getElementById("hero-flow-head");
    const a = h?.getAnimations?.()[0];
    const o = window.__heroBench?.hero?.openingInfo;
    const op = (id) => (document.getElementById(id) ? getComputedStyle(document.getElementById(id)).opacity : null);
    window.__fl.push({ now: Math.round(performance.now()), css: a && typeof a.currentTime === "number" ? Math.round(a.currentTime) / 1000 : null, headOp: h ? getComputedStyle(h).opacity : null, wrap: op("hero-flow-headwrap"), sub1: op("hero-flow-sub1"), sub2: op("hero-flow-sub2"), o: o ? { t: o.t, d: o.headDepth, g: o.growAt, s: o.subExtrudeAt, sd: o.subDone, f: o.fadeAtS, done: o.done, lo: o.logoOpacity } : null });
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});
await p.goto("http://localhost:3000/proto/hero", { waitUntil: "load" });
await p.waitForTimeout(16000);
const fl = await p.evaluate(() => window.__fl);
const first = (f) => fl.find(f);
const pr = (label, x) => console.log(label.padEnd(34), x ? JSON.stringify(x) : "never");
pr("first frame of the page", fl[0]);
pr("HTML headline fully in", first((x) => x.headOp === "1"));
pr("scene's first step", first((x) => x.o && x.o.t > 0));
pr("headline growth starts (HTML out)", first((x) => x.o && x.o.d > 0));
pr("headline fully deep", first((x) => x.o && x.o.d >= 1));
pr("logo fade starts", first((x) => x.o && x.o.f >= 0));
pr("opening done (story starts)", first((x) => x.o && x.o.done));
pr("subtext line 1 extruded", first((x) => x.o && x.o.sd[0]));
pr("subtext line 2 extruded", first((x) => x.o && x.o.sd[1]));
const gaps = fl.slice(1).map((x, i) => [x.now - fl[i].now, fl[i].now]).filter(([g]) => g > 100);
console.log("frames > 100 ms apart:", JSON.stringify(gaps.slice(0, 12)));
await b.close();
