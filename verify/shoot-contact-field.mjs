// Screenshots of the client info section (the contact field).
//
//   node verify/shoot-contact-field.mjs
//
// ⚠ IT WALKS THERE, IT DOES NOT USE `?skip=1`. The dev door exists because the
// corridor could not reach completion — but selection was restored on
// 11 August (step 1a), so the real path works now. **Walking it means the field
// is entered the way a visitor enters it**, with the corridor's own state and
// timing behind it, rather than mounted cold by a query param.
//
// ⚠ THE `?skip=1` COMMENT IN `enquiry-opening.tsx` IS NOW STALE — it still says
// *"the corridor cannot reach completion right now"*. That was true when
// written and is not any more. Flagged, not fixed here.
//
// ⚠ FIVE QUESTIONS, EACH NEEDING A SELECTION AND A CLICK. The walk is slow by
// construction: 900ms corridor moves, a staggered card ladder per question, and
// the completion choreography at the end.

import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3100";
mkdirSync("verify/out/contact", { recursive: true });

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

await page.goto(`${BASE}/start`, { waitUntil: "networkidle" });

const renderer = await page.evaluate(() => {
  const c = document.createElement("canvas");
  const gl = c.getContext("webgl2") || c.getContext("webgl");
  if (!gl) return "no webgl";
  const ext = gl.getExtension("WEBGL_debug_renderer_info");
  return ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "unknown";
});
if (/swiftshader|llvmpipe|software|no webgl/i.test(renderer)) {
  console.error(`⚠ ABORTING — "${renderer}" is a software rasteriser.`);
  await browser.close();
  process.exit(1);
}
console.log(`renderer: ${renderer}\n`);

const shot = async (name, waitMs = 0) => {
  if (waitMs) await page.waitForTimeout(waitMs);
  await page.screenshot({ path: `verify/out/contact/${name}.png` });
  console.log(`  ${name}.png`);
};

// The opening gates Begin for ~7.4s.
await page.waitForTimeout(9000);
await (await page.$(".enquiry-begin-hit")).click();
await page.waitForTimeout(12000);

// Walk Q5 → Q1. Each question: select the first card, press Next step.
for (let step = 0; step < 5; step++) {
  const cue = await page.evaluate(
    () => (document.querySelector(".enquiry-pdepth-0 .enquiry-phrase-cue")?.textContent || "").trim(),
  );
  const target = await page.$('[data-testid="answer-card-hover-0"]');
  if (!target) {
    console.log(`  ⚠ no card at ${cue} — stopping the walk here`);
    break;
  }
  await target.click();
  await page.waitForTimeout(900);
  const btn = await page.$(".enquiry-nextstep-btn");
  if (!btn) {
    console.log(`  ⚠ no Next step at ${cue} — stopping`);
    break;
  }
  await btn.click();
  console.log(`  walked ${cue}`);
  // 900ms corridor move + the next question's card ladder.
  await page.waitForTimeout(step === 4 ? 3000 : 7000);
}

// ── the client info section ──────────────────────────────────────────────
console.log(`\ncapturing:`);
await shot("01-arrival", 2000);
await shot("02-settled", 6000);

// Scroll it into view properly — the field sits below the corridor's tail.
await page.evaluate(() => {
  const f = document.querySelector(".enquiry-contact-field, [data-testid='contact-field']")
    || document.querySelector("input")?.closest("div");
  f?.scrollIntoView({ block: "center", behavior: "instant" });
});
await shot("03-in-view", 1200);

// Focus each field in turn, so the interaction states are captured.
const inputs = await page.$$("input");
console.log(`  (${inputs.length} inputs found)`);
for (let i = 0; i < inputs.length; i++) {
  await inputs[i].focus();
  await page.waitForTimeout(700);
  await shot(`04-focus-${i + 1}`);
}

// Typed state.
if (inputs.length) {
  await inputs[0].focus();
  await page.keyboard.type("Carl Buckley", { delay: 60 });
  await shot("05-typed", 900);
}

await browser.close();
console.log(`\n  saved to verify/out/contact/`);
console.log(`  ⚠ WALKED, NOT SKIPPED — the field was entered through the corridor.`);
