/** WHEN DOES THE ROOM RENDER? (13 October 2026 — Carl: "When a user clicks on about and arrives in sect 1 does sect 2 start
 *  rendering then? if not at which point?") `/about` loaded at the top, as from the nav. The room canvas's creation time,
 *  then its draw calls per second while the page SITS still in each place for 4 s: §1 (landing), §1 again after 4 s, §2
 *  (scrolled to `#roles`), §3, §4 (`#start`), and back to §2. Also when the neon ignition fired (`neon:ignite` mark) and
 *  whether the room canvas is on screen at each stop.
 *  Usage: node …/about-room-render-by-section.mjs [base url]
 *  ⚠ NOT WATCHED: scroll speed (each stop is a jump, then a still wait); Carl's Chrome; draws per frame vs frames (the
 *  count is calls, not frames — a frame of the room is ~40 calls). */
import { chromium } from "playwright";
const BASE = process.argv[2] ?? "http://localhost:3000";
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => {
  const R = (window.__room = { created: null, draws: 0, frames: 0, lastFrameDraws: 0 });
  const orig = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
    const c = orig.call(this, type, ...rest);
    if (/webgl/.test(type) && c && !this.__r) {
      this.__r = true; const cv = c.canvas;
      queueMicrotask(() => { if (!cv.closest("#start") && R.created === null) R.created = performance.now(); });
      for (const fn of ["drawElements", "drawArrays"]) { const f = c[fn]; c[fn] = function (...a) { if (!cv.closest("#start")) R.draws++; return f.apply(this, a); }; }
    }
    return c;
  };
});
const p = await ctx.newPage();
await p.goto(BASE + "/about", { waitUntil: "load" });
await p.mouse.move(5, 5);
const where = async () => p.evaluate(() => {
  const c = [...document.querySelectorAll("canvas")].find((x) => !x.closest("#start"));
  const r = c?.getBoundingClientRect();
  const ign = performance.getEntriesByName("neon:ignite")[0];
  return { on: r ? r.bottom > 0 && r.top < innerHeight : null, ignite: ign ? ign.startTime : null, created: window.__room.created };
});
async function sit(label, go) {
  if (go) await p.evaluate(go);
  await p.waitForTimeout(300);
  const a = await p.evaluate(() => window.__room.draws);
  await p.waitForTimeout(4000);
  const z = await p.evaluate(() => window.__room.draws);
  const w = await where();
  console.log(`${label.padEnd(34)} room draw calls/s ${String(Math.round((z - a) / 4)).padStart(6)}  · room canvas ${w.on ? "ON screen" : "off screen"} · neon ignited ${w.ignite ? (w.ignite / 1000).toFixed(1) + " s" : "not yet"}`);
}
const w0 = await where();
console.log(`room canvas created at ${w0.created ? (w0.created / 1000).toFixed(2) + " s" : "—"} after navigation`);
await sit("§1, just landed");
await sit("§1, still sitting");
await sit("§2 (#roles)", () => document.querySelector("#roles")?.scrollIntoView({ block: "start" }));
await sit("§2, still sitting");
await sit("§3", () => { const s = [...document.querySelectorAll("section")]; s[2]?.scrollIntoView({ block: "start" }); });
await sit("§4 (#start)", () => document.querySelector("#start")?.scrollIntoView({ block: "start" }));
await sit("back to §2", () => document.querySelector("#roles")?.scrollIntoView({ block: "start" }));
await b.close();
console.log("⚠ NOT WATCHED: scrolling in motion; Carl's Chrome.");
