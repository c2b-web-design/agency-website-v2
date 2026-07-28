// Diagnostic: when does the contact field actually become visible, relative to
// the completion stage mounting?
//
//   node verify/field-entrance-timing.mjs
//
// The approved contract (contact-form-current-timing-reference.md) starts the
// first field at 3600ms on the COMPLETION CLOCK — zero being the moment the
// `complete` stage mounts, itself 900ms after Q1 "Next step" is pressed.
//
// Before this was restored, the layer snapped to opacity 1 at completion-clock
// 0ms, landing on top of "Understood." revealing (0–1100ms) and the corridor
// still fading clear (0–2600ms). This measures the OBSERVED opacity of the
// layer over time, so the answer is what renders rather than what the CSS says.
//
// Requires the dev server (npm run dev).

import { chromium } from "@playwright/test";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
const POLL_MS = 50;
const WATCH_MS = 8000;

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});

await page.goto(`${BASE}/start`, { waitUntil: "domcontentloaded" });

// Begin activates on the mask's animationstart; wait for it to be usable
// rather than guessing a delay.
await page.waitForSelector('.enquiry-begin-hit[tabindex="0"]', { timeout: 20000 });
await page.click(".enquiry-begin-hit");

// Walk the corridor: five questions, each answered then advanced. The corridor
// morph is 900ms, so each step waits for it to settle rather than racing it.
for (let q = 0; q < 5; q += 1) {
  const card = page.locator(".enquiry-card").first();
  await card.waitFor({ state: "visible", timeout: 10000 });
  await card.click();
  await page.waitForTimeout(250);

  const next = page.getByRole("button", { name: /next step|send/i }).first();
  await next.waitFor({ state: "visible", timeout: 10000 });
  await next.click();

  // The last press enters `complete`; the others run the 900ms phrase morph.
  await page.waitForTimeout(q === 4 ? 100 : 1100);
}

// Completion clock starts when the contact layer's stage flips. Mark t0 the
// moment the layer first becomes `visible`, which is the same React commit
// that adds the entrance class.
const t0 = await page.evaluate(async () => {
  const start = performance.now();
  return new Promise((resolve) => {
    const tick = () => {
      const el = document.querySelector(".enquiry-contact-layer");
      if (el && getComputedStyle(el).visibility === "visible") {
        resolve(performance.now());
        return;
      }
      if (performance.now() - start > 20000) resolve(null);
      requestAnimationFrame(tick);
    };
    tick();
  });
});

if (t0 === null) {
  console.error("FAIL: completion stage never mounted within 20s.");
  await browser.close();
  process.exit(1);
}

// Sample the layer's opacity across the window.
const samples = await page.evaluate(
  async ([pollMs, watchMs, zero]) => {
    const out = [];
    const el = document.querySelector(".enquiry-contact-layer");
    return new Promise((resolve) => {
      const id = setInterval(() => {
        const t = performance.now() - zero;
        out.push({ t: Math.round(t), o: Number(getComputedStyle(el).opacity) });
        if (t >= watchMs) {
          clearInterval(id);
          resolve(out);
        }
      }, pollMs);
    });
  },
  [POLL_MS, WATCH_MS, t0]
);

const firstVisible = samples.find((s) => s.o > 0.01);
const fullyIn = samples.find((s) => s.o >= 0.99);

console.log("\nContact field entrance — completion clock (0ms = `complete` mounts)\n");
console.log(`  first non-zero opacity : ${firstVisible ? `${firstVisible.t}ms` : "never"}`);
console.log(`  reaches opacity 1.0    : ${fullyIn ? `${fullyIn.t}ms` : "never"}`);
console.log(`\n  contract: starts 3600ms, 700ms linear → fully in by ~4300ms`);

// Report against the contract. A tolerance is applied because the completion
// clock is marked from a paint, not from React's own timer.
const TOL = 350;
const startOk = firstVisible && Math.abs(firstVisible.t - 3600) <= TOL;

if (!firstVisible) {
  console.log("\n  ✗ FAIL — the field never became visible.");
} else if (firstVisible.t < 1500) {
  console.log(
    `\n  ✗ FAIL — appears at ${firstVisible.t}ms, on top of the acknowledgement` +
      ` reveal (0–1100ms) and the corridor fade (0–2600ms). This is the defect.`
  );
} else if (startOk) {
  console.log(`\n  ✓ PASS — starts within ${TOL}ms of the approved 3600ms.`);
} else {
  console.log(
    `\n  ~ starts at ${firstVisible.t}ms, outside ${TOL}ms of the approved 3600ms.` +
      ` Not necessarily wrong — check against the sequence on screen.`
  );
}

console.log("\n  samples (first 0.01 → 1.0):");
for (const s of samples) {
  if (s.o > 0 && s.o < 1) console.log(`    ${String(s.t).padStart(5)}ms  ${s.o.toFixed(3)}`);
}
console.log("");

await browser.close();
