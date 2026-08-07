/**
 * Which branch of the contact-field warm-up guard lets the stall through?
 *
 * ⚠ THE GUARD LOOKS CORRECT IN SOURCE AND IS NOT HOLDING. It waits for
 * `ENTRANCE_END_MS` (4890) from the entrance's own start, yet a 1495ms task
 * lands 2874ms inside that window. The anchor is set by a callback from another
 * component, so whether it has ARRIVED at each check cannot be read off the
 * code — it has to be observed. `?warmtrace=1` publishes every evaluation.
 *
 *   node verify/warm-guard.mjs
 */
import { chromium } from "@playwright/test";
const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
const browser = await chromium.launch({ headless: false, args: ["--enable-gpu","--use-angle=default","--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript(() => {
  window.__long = [];
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) if (e.duration >= 200) window.__long.push({ t: Math.round(e.startTime), dur: Math.round(e.duration) });
  }).observe({ entryTypes: ["longtask"] });
});
await page.goto(`${BASE}/start?warmtrace=1&beattrace=1`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: /begin/i }).click();
await page.getByTestId("answer-card-hover-0").waitFor({ timeout: 20000 });
await page.waitForTimeout(12000);
const warm = await page.evaluate(() => window.__warmTrace ?? []);
const long = await page.evaluate(() => window.__long ?? []);
const marks = await page.evaluate(() => performance.getEntriesByType("mark").map(m => ({ name: m.name, t: Math.round(m.startTime) })));
await browser.close();

console.log("\n── card beats ──");
for (const m of marks.filter(m => m.name.startsWith("card-beat")).sort((a,b)=>a.t-b.t)) console.log(`  +${String(m.t).padStart(6)}ms  ${m.name}`);

console.log("\n── guard evaluations ──");
if (!warm.length) console.log("  none — the guard never ran after Begin (?warmtrace=1 published nothing).");
for (const e of warm) {
  if (e.passedGuards) console.log(`  +${String(e.t).padStart(6)}ms  ⚠⚠ ALL GUARDS PASSED — warming now`);
  else console.log(`  +${String(e.t).padStart(6)}ms  check: entranceStarted=${e.entranceStarted === null ? "NULL (anchor not set)" : e.entranceStarted + "ms ago"}  sinceBegin=${e.sinceBegin}ms`);
}

console.log("\n── long tasks >=200ms ──");
for (const l of long.sort((a,b)=>a.t-b.t)) console.log(`  +${String(l.t).padStart(6)}ms  ${l.dur}ms`);
console.log("\n  ⚠ Verification is not approval.");
