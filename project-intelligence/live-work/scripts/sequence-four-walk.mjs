/**
 * THE §2 SEQUENCE, ALL FOUR, WALKED FROM ROLES — 27 September 2026. Carl: "On CB first cycle, that should activate
 * CD and the off mechanism as CB nears the end of its second cycle. The timings will all differ because of the
 * length of the copy. What will be the same is the point that the next card is activated or turned off."
 *
 * Plain `/about` at the TOP, nothing started; click "Roles"; read every card's marks against the plan the page
 * printed (`§2 sequence:`):
 *   neon:strike:<id>   rim ignition began     extrude:start:<id>  text began
 *   neon:settled:<id>  rim OUT (its on/off track ended)    extrude:end:<id>  text VANISHED
 * ⛔ Per card: text out and rim out in the SAME frame (< 17 ms apart).
 * Frames at each handover (the next card striking) and each exit, in `sequence-four-27-september/`.
 * ⚠ NOT WATCHED: scroll-in, scroll away and back, reduced motion, the bloom's decay, whether it READS.
 *   node --no-warnings project-intelligence/live-work/scripts/sequence-four-walk.mjs
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const out = "project-intelligence/live-work/screenshots/sequence-four-27-september";
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 });
{ const p = await ctx.newPage(); await p.goto("http://localhost:3000/about", { waitUntil: "networkidle" }); await p.waitForTimeout(1000); await p.close(); }

const p = await ctx.newPage();
const logs = [];
p.on("console", (m) => { const t = m.text(); if (m.type() === "error" || t.startsWith("§2 sequence")) logs.push(`${m.type()}: ${t.slice(0, 600)}`); });
p.on("pageerror", (e) => logs.push(`pageerror: ${e.message}`));
await p.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
await p.waitForTimeout(4000);
const marks = () => p.evaluate(() => Object.fromEntries(performance.getEntriesByType("mark").filter((m) => /^(neon:|extrude:(start|end))/.test(m.name)).map((m) => [m.name, m.startTime])));
const before = await marks();
console.log(`§1, 4 s after load: ${Object.keys(before).length ? "⛔ STARTED: " + JSON.stringify(before) : "✅ nothing started"}`);

await p.getByRole("link", { name: "Roles", exact: true }).first().click();
const clickAt = await p.evaluate(() => performance.now());
const planLine = (logs.filter((l) => l.includes("§2 sequence")).pop() ?? "").replace(/^info: /, "");
console.log(`plan (the page's own): ${planLine}\n`);
const ids = ["ca", "cb", "cd", "cs"];
const plan = {};
for (const m of planLine.matchAll(/(ca|cb|cd|cs) rim ([\d.]+)s · text ([\d.]+)s(?: · out ([\d.]+)s)?/g)) plan[m[1]] = { rim: +m[2] * 1000, text: +m[3] * 1000, out: m[4] ? +m[4] * 1000 : undefined };

const shots = [];
for (const [i, id] of ids.entries()) {
  const next = ids[i + 1];
  if (next && plan[next]) shots.push([`${String(shots.length + 1).padStart(2, "0")}-${next}-strikes`, plan[next].rim + 500]);
  if (plan[id]?.out !== undefined) {
    shots.push([`${String(shots.length + 1).padStart(2, "0")}-${id}-flickering-off`, plan[id].out - 700]);
    shots.push([`${String(shots.length + 1).padStart(2, "0")}-${id}-out`, plan[id].out + 150]);
  }
}
shots.sort((a, b) => a[1] - b[1]);
shots.forEach((sh, i) => { sh[0] = String(i + 1).padStart(2, "0") + sh[0].slice(2); }); // numbered in TIME order (the first run numbered them before sorting)
for (const [name, atMs] of shots) {
  const wait = clickAt + atMs - (await p.evaluate(() => performance.now()));
  if (wait > 0) await p.waitForTimeout(wait);
  await p.screenshot({ path: `${out}/${name}.png` });
}
await p.waitForTimeout(500);
const m = await marks();
const t0 = m["neon:ignite"];
console.log(`card | rim strike (plan)    | text start (plan)    | rim out   | text out  | plan out | same frame?`);
const f = (x) => (x === undefined || Number.isNaN(x) ? "   ⛔ —  " : `${(x / 1000).toFixed(2).padStart(7)}s`);
let bad = 0;
for (const id of ids) {
  const at = (k) => (m[k] === undefined ? undefined : m[k] - t0);
  const rimOut = at(`neon:settled:${id}`), textOut = at(`extrude:end:${id}`);
  const gap = rimOut === undefined || textOut === undefined ? NaN : Math.abs(rimOut - textOut);
  const ok = gap < 17;
  if (!ok) bad++;
  console.log(`${id}   | ${f(at(`neon:strike:${id}`))} (${f(plan[id]?.rim)}) | ${f(at(`extrude:start:${id}`))} (${f(plan[id]?.text)}) | ${f(rimOut)} | ${f(textOut)} | ${f(plan[id]?.out)} | ${Number.isNaN(gap) ? "⛔ missing" : `${gap.toFixed(1)} ms ${ok ? "✅" : "⛔"}`}`);
}
console.log(`\n${bad ? `⛔ ${bad} card(s) did not go out in one frame` : "✅ every card's rim and text went out in the same frame"}`);
console.log(`\nconsole: ${logs.filter((l) => !l.includes("§2 sequence")).join("\n") || "no errors"}`);
await b.close();
