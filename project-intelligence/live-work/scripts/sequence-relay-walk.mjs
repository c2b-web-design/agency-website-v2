/**
 * THE §2 RELAY, WALKED FROM ROLES — 27 September 2026 (second take). Carl: "CA goes through 2 cycles of text. As
 * the reveal is about to catch up towards the end of the second cycle, the rim can go through the reverse process
 * flicker and as soon as the last word has completed the rim and the text should disappear together." Chosen:
 * the text vanishes at the last word; CB strikes at the end of CA's SECOND cycle.
 *
 * Plain `/about` at the TOP, nothing started; click the nav's "Roles"; then read the page's marks against the plan
 * it printed (`§2 sequence:` in the console):
 *   neon:strike:<id>    a rim's ignition began          extrude:start:<id>   its text began
 *   neon:settled:<id>   its track stopped (held, or OUT) extrude:end:<id>     its text VANISHED
 * ⛔ THE TEST OF "SIMULTANEOUSLY": `extrude:end:ca` and `neon:settled:ca` must fall in the same frame (< 17 ms).
 * Frames: CA's second cycle near its end, mid reverse flicker, the frame after it goes out, CB's text writing.
 * ⚠ NOT WATCHED: scroll-in, scroll away and back, reduced motion, the bloom's own decay, whether it READS.
 *   node --no-warnings project-intelligence/live-work/scripts/sequence-relay-walk.mjs
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const out = "project-intelligence/live-work/screenshots/sequence-relay-27-september";
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 });
{ const p = await ctx.newPage(); await p.goto("http://localhost:3000/about", { waitUntil: "networkidle" }); await p.waitForTimeout(1000); await p.close(); }

const p = await ctx.newPage();
const logs = [];
p.on("console", (m) => { const t = m.text(); if (m.type() === "error" || t.startsWith("§2 sequence")) logs.push(`${m.type()}: ${t.slice(0, 500)}`); });
p.on("pageerror", (e) => logs.push(`pageerror: ${e.message}`));
await p.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
await p.waitForTimeout(4000);
const marks = () => p.evaluate(() => Object.fromEntries(performance.getEntriesByType("mark").filter((m) => /^(neon:|extrude:(start|end))/.test(m.name)).map((m) => [m.name, m.startTime])));
const before = await marks();
console.log(`§1, 4 s after load: ${Object.keys(before).length ? "⛔ STARTED: " + JSON.stringify(before) : "✅ nothing started"}`);

await p.getByRole("link", { name: "Roles", exact: true }).first().click();
const clickAt = await p.evaluate(() => performance.now());
const planLine = (logs.filter((l) => l.includes("§2 sequence")).pop() ?? "").replace(/^info: /, "");
console.log(`plan (the page's own): ${planLine}`);
const plan = {};
for (const m of planLine.matchAll(/(ca|cb|cd|cs) rim ([\d.]+)s · text ([\d.]+)s(?: · out ([\d.]+)s)?/g)) plan[m[1]] = { rim: +m[2] * 1000, text: +m[3] * 1000, out: m[4] ? +m[4] * 1000 : undefined };
const outAt = plan.ca?.out ?? 56000;

const shots = [
  ["1-ca-second-cycle", outAt - 4000],
  ["2-ca-reverse-flicker", outAt - 700],
  ["3-ca-out", outAt + 120],
  ["4-cb-writing", (plan.cb?.text ?? outAt + 2000) + 3000],
];
for (const [name, atMs] of shots) {
  const wait = clickAt + atMs - (await p.evaluate(() => performance.now()));
  if (wait > 0) await p.waitForTimeout(wait);
  await p.screenshot({ path: `${out}/${name}.png` });
}
const m = await marks();
const t0 = m["neon:ignite"];
console.log(`\nclick → trigger: ${t0 === undefined ? "⛔ NEVER FIRED" : `${(t0 - clickAt).toFixed(0)} ms`}`);
console.log("mark                 | after trigger | plan     | Δ");
const rows = [["neon:strike:ca", "ca", "rim"], ["extrude:start:ca", "ca", "text"], ["neon:settled:ca", "ca", "out"], ["extrude:end:ca", "ca", "out"], ["neon:strike:cb", "cb", "rim"], ["extrude:start:cb", "cb", "text"]];
for (const [name, key, field] of rows) {
  const at = m[name] === undefined ? NaN : m[name] - t0;
  const want = plan[key]?.[field];
  console.log(`${name.padEnd(20)} | ${Number.isNaN(at) ? "  ⛔ absent " : (at / 1000).toFixed(3).padStart(9) + " s"} | ${want === undefined ? "   —    " : (want / 1000).toFixed(2).padStart(6) + " s"} | ${Number.isNaN(at) || want === undefined ? "" : ((at - want) / 1000).toFixed(3) + " s"}`);
}
const gap = Math.abs((m["extrude:end:ca"] ?? NaN) - (m["neon:settled:ca"] ?? NaN));
console.log(`\n⛔ SIMULTANEOUS? text out vs rim out: ${Number.isNaN(gap) ? "⛔ a mark is missing" : `${gap.toFixed(1)} ms apart — ${gap < 17 ? "✅ the same frame" : "⛔ NOT the same frame"}`}`);
for (const k of ["neon:strike:cd", "neon:strike:cs", "extrude:start:cd", "extrude:start:cs"]) if (m[k] !== undefined) console.log(`⛔ ${k} fired — CD/CS are outside the sequence`);
console.log(`\nconsole: ${logs.filter((l) => !l.includes("§2 sequence")).join("\n") || "no errors"}`);
await b.close();
