/**
 * Profile the 1.5s stall and name the function responsible.
 *
 * ⚠ THE PREVIOUS ATTEMPT FAILED HONESTLY AND THAT IS WHY THIS ONE EXISTS.
 * `verify/stall-source.mjs` wrapped `PMREMGenerator.fromScene` and friends via
 * `window`, but three.js is bundled — it is never a global — so the wrap never
 * took and the run proved nothing. **An instrument that cannot fire is not a
 * negative result.**
 *
 * The CDP profiler needs no cooperation from the bundle: it samples the JS stack
 * and reports self-time per function, minified names and all.
 *
 * ⚠ WHAT IS ALREADY ESTABLISHED, so this does not re-litigate it:
 *   - the stall is a ~1490ms long task at ~+12400ms, reproducible
 *   - it lands ~330ms AFTER card 4's rung and delays card 5 by ~1.2s
 *   - the card canvas is compiled at +10092ms, well before it
 *   - NO canvas element appears near it — not the contact field's mount
 *   - it is 2874ms inside the window `ENTRANCE_END_MS` is supposed to protect
 *
 *   node verify/stall-profile.mjs
 */

import { chromium } from "@playwright/test";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const client = await page.context().newCDPSession(page);

await page.goto(`${BASE}/start`, { waitUntil: "networkidle" });

await client.send("Profiler.enable");
await client.send("Profiler.setSamplingInterval", { interval: 200 });
await client.send("Profiler.start");

await page.getByRole("button", { name: /begin/i }).click();
await page.getByTestId("answer-card-hover-0").waitFor({ timeout: 20000 });
await page.waitForTimeout(9000);

const { profile } = await client.send("Profiler.stop");
await browser.close();

// Self-time per node, from the sample stream.
const byId = new Map(profile.nodes.map((n) => [n.id, n]));
const self = new Map();
const deltas = profile.timeDeltas ?? [];
const samples = profile.samples ?? [];

for (let i = 0; i < samples.length; i++) {
  const id = samples[i];
  const dt = (deltas[i] ?? 0) / 1000; // µs -> ms
  self.set(id, (self.get(id) ?? 0) + dt);
}

const rows = [...self.entries()]
  .map(([id, ms]) => {
    const n = byId.get(id);
    const f = n?.callFrame ?? {};
    return {
      ms,
      name: f.functionName || "(anonymous)",
      url: (f.url || "").replace(/^https?:\/\/[^/]+/, ""),
      line: f.lineNumber,
    };
  })
  .filter((r) => r.ms >= 20)
  .sort((a, b) => b.ms - a.ms)
  .slice(0, 25);

console.log("\n── heaviest functions by SELF time during the entrance ──\n");
for (const r of rows) {
  const where = r.url ? `${r.url}:${r.line}` : "";
  console.log(`  ${r.ms.toFixed(0).padStart(6)}ms  ${r.name.padEnd(34)} ${where}`);
}

// The idle/program buckets are noise; call them out so they are not read as
// findings.
console.log(
  "\n  ('(program)', '(idle)' and '(garbage collector)' are engine buckets, not app code.)",
);
console.log("\n  ⚠ Verification is not approval.");
