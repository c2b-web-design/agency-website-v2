/**
 * THE §2 LOOP, WALKED FROM ROLES — 27 September 2026. Carl: "Now on CS first cycle, that should trigger CA and then
 * we will have a loop cycle between all 4 cards."
 *
 * Plain `/about` at the TOP, nothing started; click "Roles"; run PAST THE WRAP to CA's SECOND exit (~2.5 min), then
 * read every mark — they repeat once per lap:
 *   neon:strike:<id> · extrude:start:<id> · neon:out:<id> (rim reached 0) · extrude:end:<id> (text vanished)
 * ⛔ Checks: lap 2 strikes exactly one LOOP after lap 1 (the page's printed period); CA re-strikes as CS's FIRST cycle
 * reaches its 3rd-last word; every exit, both laps, rim and text in the SAME frame (< 17 ms).
 * ⚠ NOT WATCHED: more than two laps (drift over minutes), scroll away and back, reduced motion, whether it READS.
 *   node --no-warnings project-intelligence/live-work/scripts/sequence-loop-walk.mjs
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const out = "project-intelligence/live-work/screenshots/sequence-loop-27-september";
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 });
{ const p = await ctx.newPage(); await p.goto("http://localhost:3000/about", { waitUntil: "networkidle" }); await p.waitForTimeout(1000); await p.close(); }

const p = await ctx.newPage();
const logs = [];
p.on("console", (m) => { const t = m.text(); if (m.type() === "error" || t.startsWith("§2 sequence")) logs.push(`${m.type()}: ${t.slice(0, 700)}`); });
p.on("pageerror", (e) => logs.push(`pageerror: ${e.message}`));
await p.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
await p.waitForTimeout(4000);
const allMarks = () => p.evaluate(() => {
  const o = {};
  for (const m of performance.getEntriesByType("mark")) if (/^(neon:|extrude:(start|end))/.test(m.name)) (o[m.name] ??= []).push(m.startTime);
  return o;
});
const before = await allMarks();
console.log(`§1, 4 s after load: ${Object.keys(before).length ? "⛔ STARTED: " + JSON.stringify(before) : "✅ nothing started"}`);

await p.getByRole("link", { name: "Roles", exact: true }).first().click();
const clickAt = await p.evaluate(() => performance.now());
const planLine = (logs.filter((l) => l.includes("§2 sequence")).pop() ?? "").replace(/^info: /, "");
console.log(`plan (the page's own): ${planLine}\n`);
const plan = {};
for (const m of planLine.matchAll(/(ca|cb|cd|cs) rim ([\d.]+)s · text ([\d.]+)s(?: · out ([\d.]+)s)?/g)) plan[m[1]] = { rim: +m[2] * 1000, text: +m[3] * 1000, out: m[4] ? +m[4] * 1000 : undefined };
const loopMs = +(planLine.match(/LOOP every ([\d.]+)s/)?.[1] ?? NaN) * 1000;
if (Number.isNaN(loopMs)) console.log("⛔ the page printed NO LOOP");

const shots = [
  ["1-cs-first-cycle-ca-restrikes", loopMs + 600],
  ["2-ca-lap2-writing", plan.ca.text + loopMs + 4000],
  ["3-ca-lap2-out", plan.ca.out + loopMs + 150],
];
for (const [name, atMs] of shots) {
  const wait = clickAt + atMs - (await p.evaluate(() => performance.now()));
  if (wait > 0) await p.waitForTimeout(wait);
  await p.screenshot({ path: `${out}/${name}.png` });
}
await p.waitForTimeout(500);
const m = await allMarks();
const t0 = m["neon:ignite"]?.[0];
const s = (x) => (x === undefined ? "  ⛔ —   " : `${(x / 1000).toFixed(2).padStart(7)}s`);
let bad = 0;
console.log("card | lap | strike (plan)      | text (plan)        | rim out   | text out  | same frame?");
for (const id of ["ca", "cb", "cd", "cs"]) {
  for (let lap = 0; lap < 2; lap++) {
    const get = (k) => (m[`${k}:${id}`]?.[lap] === undefined ? undefined : m[`${k}:${id}`][lap] - t0);
    const want = (x) => (x === undefined ? undefined : x + lap * loopMs);
    const rimOut = get("neon:out"), textOut = get("extrude:end");
    if (get("neon:strike") === undefined && lap === 1 && id !== "ca") continue; // only CA's second lap is inside the walk
    const gap = rimOut === undefined || textOut === undefined ? NaN : Math.abs(rimOut - textOut);
    const exitSeen = rimOut !== undefined || textOut !== undefined;
    if (exitSeen && !(gap < 17)) bad++;
    console.log(`${id}   |  ${lap + 1}  | ${s(get("neon:strike"))} (${s(want(plan[id]?.rim))}) | ${s(get("extrude:start"))} (${s(want(plan[id]?.text))}) | ${s(rimOut)} | ${s(textOut)} | ${!exitSeen ? "(not reached)" : Number.isNaN(gap) ? "⛔ one missing" : `${gap.toFixed(1)} ms ${gap < 17 ? "✅" : "⛔"}`}`);
  }
}
const caLap2 = m["neon:strike:ca"]?.[1];
console.log(`\nCA comes round: ${caLap2 === undefined ? "⛔ NEVER" : `${((caLap2 - t0) / 1000).toFixed(2)} s — one loop ${(loopMs / 1000).toFixed(2)} s, Δ ${((caLap2 - t0 - loopMs) / 1000).toFixed(3)} s`}`);
console.log(bad ? `⛔ ${bad} exit(s) not in one frame` : "✅ every exit seen: rim and text in the same frame");
console.log(`\nconsole: ${logs.filter((l) => !l.includes("§2 sequence")).join("\n") || "no errors"}`);
await b.close();
