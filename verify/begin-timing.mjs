// Diagnostic: when does the Begin button actually become usable?
//
//   node verify/begin-timing.mjs
//
// The hit target activates on the mask's `animationstart` for
// `enquiry-mask-reveal-radial`. This measures when that fires, and polls
// the button's own attributes so the answer is the observed state rather
// than the intended one.
//
// Requires the dev server (npm run dev).

import { chromium } from "@playwright/test";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
const WINDOW_MS = 15000;

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});

await page.addInitScript(() => {
  window.__b = { t0: performance.now(), animations: [], usableAt: null };

  document.addEventListener(
    "animationstart",
    (e) => {
      window.__b.animations.push({
        name: e.animationName,
        at: Math.round(performance.now() - window.__b.t0),
      });
    },
    true,
  );

  const poll = () => {
    if (window.__b.usableAt === null) {
      const btn = [...document.querySelectorAll("button")].find(
        (b) => b.textContent.trim() === "Begin",
      );
      if (btn && btn.getAttribute("tabindex") === "0") {
        window.__b.usableAt = Math.round(performance.now() - window.__b.t0);
      }
    }
    requestAnimationFrame(poll);
  };
  requestAnimationFrame(poll);
});

const res = await page.goto(`${BASE}/start`, { waitUntil: "domcontentloaded" });
if (!res || !res.ok()) {
  console.error(`FAILED: ${res?.status() ?? "no response"} — is the dev server running?`);
  await browser.close();
  process.exit(1);
}

await page.waitForTimeout(WINDOW_MS);

const b = await page.evaluate(() => window.__b);

console.log(`\nBEGIN BUTTON — measured over ${WINDOW_MS}ms\n`);

if (b.usableAt === null) {
  console.log("⚠ NEVER became usable within the window.");
} else {
  console.log(`Usable at              : +${b.usableAt}ms`);
}

const radial = b.animations.find((a) => a.name === "enquiry-mask-reveal-radial");
console.log(
  `enquiry-mask-reveal-radial fired: ${radial ? `+${radial.at}ms` : "⚠ NEVER — this is what activates the button"}`,
);

console.log(`\nAll animations that started (${b.animations.length}):`);
b.animations
  .sort((a, c) => a.at - c.at)
  .forEach((a) => console.log(`   +${String(a.at).padStart(5)}ms  ${a.name}`));
console.log();

await browser.close();
