// Capture the contact field at completion and MEASURE its rendered gold.
//
//   node verify/field-colour.mjs [label]
//
// Walks the corridor to the completion stage, waits for the field's entrance
// to finish, screenshots the contact layer, and reports the luminance
// distribution of the rendered pixels alongside the sampled logo reference.
//
// This answers "what colour is it ACTUALLY rendering", which is not the same
// question as "what hex is in the material" — on a metal, `color` tints the
// reflection, so the rendered result depends on the environment too.
//
// Output: project-intelligence/live-work/screenshots/field-colour-<label>.png
//
// Requires the dev server (npm run dev).

import { chromium } from "@playwright/test";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

/**
 * ⚠ A HARNESS THAT SHARES A STALE CONSTANT WITH THE THING IT MEASURES CANNOT
 * FAIL. This project has been burned by exactly that twice: verify/q5-stutter.mjs
 * reported 0/3 CLEAN on a visible defect because its window used the same wrong
 * 700ms as the fix, and this file's own 5200ms wait silently sampled mid-cascade
 * for every screenshot taken before 31 July 2026.
 *
 * So the entrance delays are re-read FROM SOURCE and checked against the value
 * this script waits on. It cannot import the TSX export, but it can prove the
 * copy still matches — which is the part that actually goes stale.
 */
async function assertEntranceEndMatches(expected) {
  const src = await readFile(
    path.join(process.cwd(), "components", "enquiry", "contact-field-canvas.tsx"),
    "utf8",
  );
  const block = src.slice(
    src.indexOf("const FIELD_ENTRANCES"),
    src.indexOf("export const FIELD_ENTRANCE_END_MS"),
  );
  const entries = [...block.matchAll(/\{\s*delay:\s*(\d+),\s*duration:\s*(\d+)\s*\}/g)];
  if (!entries.length) {
    console.error("\n  ✗ could not parse FIELD_ENTRANCES — check this guard, not the page.\n");
    process.exit(1);
  }
  const actual = Math.max(...entries.map(([, d, dur]) => Number(d) + Number(dur)));
  if (actual !== expected) {
    console.error(
      `\n  ✗ STALE HARNESS. FIELD_ENTRANCES now ends at ${actual}ms; this script ` +
        `waits on ${expected}ms.\n    Update the constant here — do not ignore this.\n`,
    );
    process.exit(1);
  }
}

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
const LABEL = process.argv[2] ?? "current";
const OUT_DIR = path.join(
  process.cwd(),
  "project-intelligence",
  "live-work",
  "screenshots",
);

// Sampled from brand-assets/logo/c2b-logo-gold-hero-transparent.png,
// 149,431 opaque non-black pixels sorted by luminance.
const LOGO = {
  shadow: [96, 61, 17],
  body: [173, 119, 45],
  midMean: [176, 120, 40],
  champagne: [242, 191, 97],
};

await mkdir(OUT_DIR, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

await page.goto(`${BASE}/start`, { waitUntil: "domcontentloaded" });
await page.waitForSelector('.enquiry-begin-hit[tabindex="0"]', { timeout: 20000 });
await page.click(".enquiry-begin-hit");

for (let q = 0; q < 5; q += 1) {
  const card = page.locator(".enquiry-card").first();
  await card.waitFor({ state: "visible", timeout: 10000 });
  await card.click();
  await page.waitForTimeout(250);
  const next = page.getByRole("button", { name: /next step|send/i }).first();
  await next.waitFor({ state: "visible", timeout: 10000 });
  await next.click();
  await page.waitForTimeout(q === 4 ? 100 : 1100);
}

// ⚠ CORRECTED 31 July 2026. This said "the entrance completes at ~4300ms" and
// waited 5200ms. The real end is FIELD_ENTRANCE_END_MS = 8100 — the last box
// starts at 5100 and fades for 3000. So every screenshot this harness took was
// sampled MID-CASCADE, with box 4 at roughly a third of its opacity, while the
// output was described as the settled state.
//
// ⚠ THIS IS THE THIRD HARD-CODED COPY OF THIS TIMING TO GO STALE. contact-field-
// canvas.tsx already carries two "an earlier version hard-coded this and went
// stale" warnings. The value cannot be imported here — this is a plain .mjs
// script and the constant lives in TSX — so it is restated WITH its derivation
// and a runtime assertion below, rather than as a bare number.
//
//   FIELD_ENTRANCES: delays 3600/4100/4600/5100, each 3000ms
//   => last box ends at 5100 + 3000 = 8100
const FIELD_ENTRANCE_END_MS = 8100;
const SETTLE_MARGIN_MS = 900;
await assertEntranceEndMatches(FIELD_ENTRANCE_END_MS);
await page.waitForTimeout(FIELD_ENTRANCE_END_MS + SETTLE_MARGIN_MS);

const layer = page.locator(".enquiry-contact-layer");
const file = path.join(OUT_DIR, `field-colour-${LABEL}.png`);
await layer.screenshot({ path: file });

// Measure the captured pixels.
const { data } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
// Isolate the LIT METAL. The contact layer is mostly near-black backdrop, which
// at a low luminance floor swamps the sample and reports the background instead
// of the object (measured: 422,805 px at #121212, warmth 0). Two filters:
//   - luminance above the backdrop
//   - a warmth floor (R > B), since the metal is gold and the backdrop is grey
const px = [];
for (let i = 0; i < data.length; i += 4) {
  const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
  if (a < 200) continue;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  if (lum < 40) continue; // above the near-black backdrop
  if (r - b < 12) continue; // warm pixels only — excludes grey rim and backdrop
  px.push({ r, g, b, lum });
}

const hex = (r, g, b) => `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;

console.log(`\nContact field — rendered gold (${LABEL})\n`);
console.log(`  saved: ${path.relative(process.cwd(), file)}`);

if (!px.length) {
  console.log("\n  ✗ no lit pixels found — the field may not have rendered.");
  await browser.close();
  process.exit(1);
}

px.sort((a, b) => a.lum - b.lum);
const at = (p) => {
  const s = px[Math.floor(px.length * p)];
  return `${hex(s.r, s.g, s.b)}  rgb(${s.r},${s.g},${s.b})  lum ${s.lum.toFixed(0)}`;
};

console.log(`\n  lit pixels: ${px.length}`);
console.log(`   5th pct  ${at(0.05)}`);
console.log(`  50th pct  ${at(0.5)}`);
console.log(`  75th pct  ${at(0.75)}`);
console.log(`  95th pct  ${at(0.95)}`);

const mid = px.slice(Math.floor(px.length * 0.4), Math.floor(px.length * 0.6));
const avg = (k) => Math.round(mid.reduce((s, p) => s + p[k], 0) / mid.length);
const [mr, mg, mb] = [avg("r"), avg("g"), avg("b")];

console.log(`\n  MID-BAND MEAN  ${hex(mr, mg, mb)}  rgb(${mr},${mg},${mb})`);
console.log(`  warmth (R-B)   ${mr - mb}`);

console.log(`\n  logo reference:`);
console.log(`    body       ${hex(...LOGO.body)}   warmth ${LOGO.body[0] - LOGO.body[2]}`);
console.log(`    mid mean   ${hex(...LOGO.midMean)}   warmth ${LOGO.midMean[0] - LOGO.midMean[2]}`);
console.log(`    champagne  ${hex(...LOGO.champagne)}   warmth ${LOGO.champagne[0] - LOGO.champagne[2]}`);
console.log(
  `\n  This reports what rendered. Whether it is RIGHT is Carl's call, not this script's.\n`,
);

await browser.close();
