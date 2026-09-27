/**
 * THE §2 SEQUENCE, WALKED THE WAY CARL REACHES IT — 27 September 2026. Carl: "lets go from navigation in About and
 * press Roles. The rim should activate and then the text reveal start… CB should activate and then text reveal as
 * the last few words in CA are being read."
 *
 * Loads plain `/about` at the TOP (§1), checks NOTHING has started, clicks the nav's "Roles" (`#roles`), then reads
 * the page's own marks against the plan the page printed (`§2 sequence:` in the console):
 *   neon:ignite            the trigger fired (the sequence's downbeat)
 *   neon:strike:ca|cb      each rim's ignition began
 *   extrude:start:ca|cb    each card's text began
 * and films frames around CB's strike (CA's last line should be being written) and CB's text start.
 * ⚠ NOT WATCHED: scroll-in (only the anchor jump), scroll away and back, reduced motion, whether the moment READS
 * (Carl's eye). Timings are ±1 frame of a 60 Hz loop on this machine.
 *   node --no-warnings project-intelligence/live-work/scripts/sequence-roles-walk.mjs
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const out = "project-intelligence/live-work/screenshots/sequence-roles-27-september";
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 });
{ const p = await ctx.newPage(); await p.goto("http://localhost:3000/about", { waitUntil: "networkidle" }); await p.waitForTimeout(1000); await p.close(); }

const p = await ctx.newPage();
const logs = [];
p.on("console", (m) => { const t = m.text(); if (m.type() === "error" || t.startsWith("§2 sequence")) logs.push(`${m.type()}: ${t.slice(0, 400)}`); });
p.on("pageerror", (e) => logs.push(`pageerror: ${e.message}`));
await p.goto("http://localhost:3000/about", { waitUntil: "networkidle" });
await p.waitForTimeout(4000);
const marks = () => p.evaluate(() => Object.fromEntries(performance.getEntriesByType("mark").filter((m) => /^(neon:|extrude:start)/.test(m.name)).map((m) => [m.name, m.startTime])));
const before = await marks();
console.log(`at the top of §1, 4 s after load: ${Object.keys(before).length ? "⛔ STARTED: " + JSON.stringify(before) : "✅ nothing started"}`);
await p.screenshot({ path: `${out}/0-section1.png` });

await p.getByRole("link", { name: "Roles", exact: true }).first().click();
const clickAt = await p.evaluate(() => performance.now());
const planLine = logs.find((l) => l.includes("§2 sequence")) ?? "";
const plan = {};
for (const m of planLine.matchAll(/(ca|cb|cd|cs) rim ([\d.]+)s · text ([\d.]+)s/g)) plan[m[1]] = { rim: +m[2] * 1000, text: +m[3] * 1000 };
console.log(`plan (the page's own): ${planLine.replace(/^info: /, "")}`);

/* Frames: CA text start, just before / after CB's strike, CB's text start + 3 s. */
const shots = [
  ["1-ca-text-begins", (plan.ca?.text ?? 2200) + 1500],
  ["2-before-cb-strike", (plan.cb?.rim ?? 23800) - 700],
  ["3-cb-strikes", (plan.cb?.rim ?? 23800) + 600],
  ["4-cb-text-begins", (plan.cb?.text ?? 25600) + 3000],
];
for (const [name, atMs] of shots) {
  const now = await p.evaluate(() => performance.now());
  const wait = clickAt + atMs - now;
  if (wait > 0) await p.waitForTimeout(wait);
  await p.screenshot({ path: `${out}/${name}.png` });
}
const m = await marks();
const t0 = m["neon:ignite"];
console.log(`\nclick → trigger: ${t0 === undefined ? "⛔ NEVER FIRED" : `${(t0 - clickAt).toFixed(0)} ms`}`);
console.log("mark                 | after trigger | plan     | Δ");
for (const [name, key, field] of [["neon:strike:ca", "ca", "rim"], ["extrude:start:ca", "ca", "text"], ["neon:strike:cb", "cb", "rim"], ["extrude:start:cb", "cb", "text"]]) {
  const at = m[name] === undefined ? NaN : m[name] - t0;
  const want = plan[key]?.[field];
  console.log(`${name.padEnd(20)} | ${Number.isNaN(at) ? "  ⛔ absent " : (at / 1000).toFixed(2).padStart(9) + " s"} | ${want === undefined ? "   —    " : (want / 1000).toFixed(2).padStart(6) + " s"} | ${Number.isNaN(at) || want === undefined ? "" : ((at - want) / 1000).toFixed(3) + " s"}`);
}
for (const k of ["neon:strike:cd", "neon:strike:cs", "extrude:start:cd", "extrude:start:cs"]) if (m[k] !== undefined) console.log(`⛔ ${k} fired — CD/CS should be outside the sequence`);
console.log(`\nconsole: ${logs.filter((l) => !l.includes("§2 sequence")).join("\n") || "no errors"}`);
await b.close();
