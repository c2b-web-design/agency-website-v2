/** THE NAV'S FADE TO ICE BLUE — SMOOTH TO THE END? (17 October 2026; D-023). Carl saw "a sort of pulse" as it reached
 *  ice: the first take's links lagged an inherited fade (their own 200 ms hover transition chasing it) and caught up 34% in
 *  ~0.2 s. /start at 1920 × 952, DPR 1: from the Begin click, an in-page rAF sampler records the first nav link's colour
 *  every frame for 3.2 s; progress = its OKLab lightness between neutral-400 and #cfe6ff, against a linear 2.6 s; the
 *  largest progress step between frames (a pulse shows as one). Then the hover both ways (300 ms on, 300 ms off).
 *  Usage: node …/nav-ice-smoothness-17-october.mjs
 *  ⚠ NOT WATCHED: phones (the nav hides below md); Carl's GPU/Chrome. */
import { chromium } from "playwright";
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1920, height: 952 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const errs = [];
p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
await p.goto("http://localhost:3000/start", { waitUntil: "load" });
await p.waitForTimeout(9000);
await p.evaluate(() => {
  window.__nav = [];
  document.addEventListener("click", () => {
    const t0 = performance.now();
    const a = document.querySelector(".start-nav a");
    const c = document.createElement("canvas").getContext("2d");
    const tick = () => {
      c.fillStyle = "#000"; c.fillStyle = getComputedStyle(a).color; // normalises any colour space to sRGB hex/rgba
      c.fillRect(0, 0, 1, 1);
      const [r, g, bb] = c.getImageData(0, 0, 1, 1).data;
      window.__nav.push([Math.round(performance.now() - t0), r, g, bb]);
      if (performance.now() - t0 < 3200) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, { once: true, capture: true });
});
await p.getByRole("button", { name: /begin/i }).click();
await p.waitForTimeout(3500);
const s = await p.evaluate(() => window.__nav);
const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const okL = (r, g, b) => { [r, g, b] = [lin(r), lin(g), lin(b)]; const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b), m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b), q = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b); return 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * q; };
const L0 = okL(161, 161, 161), L1 = okL(207, 230, 255);
const prog = s.map(([t, r, g, bb]) => [t, (okL(r, g, bb) - L0) / (L1 - L0)]);
let big = 0, at = 0;
for (let i = 1; i < prog.length; i++) { const d = prog[i][1] - prog[i - 1][1]; if (d > big) { big = d; at = prog[i][0]; } }
const dev = Math.max(...prog.map(([t, f]) => Math.abs(f - Math.min(t / 2600, 1))));
for (const [t, f] of prog.filter((_, i) => i % 15 === 0)) console.log(`  ${String(t).padStart(5)} ms  expected ${(Math.min(t / 2600, 1) * 100).toFixed(0).padStart(3)}%  measured ${(f * 100).toFixed(0).padStart(3)}%`);
console.log(`largest step between frames: ${(big * 100).toFixed(1)}% at ${at} ms · worst deviation from linear: ${(dev * 100).toFixed(1)}% · final rgb(${s.at(-1).slice(1).join(", ")})`);
const link = await p.locator(".start-nav a").first().boundingBox();
const col = () => p.evaluate(() => getComputedStyle(document.querySelector(".start-nav a")).color);
await p.mouse.move(link.x + link.width / 2, link.y + link.height / 2);
await p.waitForTimeout(300);
console.log("hovered 300 ms:", await col());
await p.mouse.move(5, 5);
await p.waitForTimeout(300);
console.log("300 ms after leaving:", await col());
console.log("console errors:", errs.length, errs.slice(0, 2));
await b.close();
console.log("⚠ NOT WATCHED: phones; Carl's GPU/Chrome.");
