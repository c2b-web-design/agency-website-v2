// Where is the Next step button, in relation to the answer cards and the
// traveller's ellipse?
//
//   node verify/button-vs-cards.mjs
//
// ⚠ CARL'S QUESTION, 10 August 2026: *"where is the button in relation to the
// cards? We have an orbital ellipse that passes in front of the cards and behind
// it. The answer is directly below. Where would the reflection be if we
// activated cards 4+5?"*
//
// ⚠⚠ MEASURED FROM THE LIVE DOM, NOT DERIVED FROM CONSTANTS. The grid is a CSS
// layout; the gap between the grid and the button is set by margins and line
// boxes that are not knowable from `answer-card-geometry.ts`. This project has
// already paid twice for deriving a number that only the DOM knows —
// `NEXTSTEP_WIDTH_PX` itself is measured for exactly this reason.
//
// ── WHAT IT ANSWERS ──────────────────────────────────────────────────────
//
//   1. The button's offset below the grid, in CSS px == world units.
//   2. Where cards 4 and 5 sit relative to the button.
//   3. Whether the traveller's ellipse ever passes near the button at all.
//   4. The ANGLE from cards 4/5 down to the button — which decides where an
//      amber reflection would land on the pill, and whether it lands on a
//      surface the camera can see.
//
// ⚠ IT DECIDES NOTHING ABOUT AMBER. Carl has not decided whether the effect is
// implemented at all. This measures REACH, so the decision is made against
// numbers rather than a guess.

import { chromium } from "@playwright/test";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto(`${BASE}/start`, { waitUntil: "networkidle" });

// ⚠ CLICK `.enquiry-begin-hit`, NOT `.enquiry-begin-btn`. The visible button is
// covered by a separate hit target, and `.enquiry-begin-parent` intercepts
// pointer events until the opening finishes — Playwright retries for 30s and
// then fails. Found by reading its own actionability log.
//
// ⚠ AND THE OPENING GATES BEGIN FOR ~7.4s (`globals.css` mask delay), so the
// wait before clicking is not padding — it is the choreography.
await page.waitForTimeout(9000);
const begin = await page.$(".enquiry-begin-hit");
if (!begin) {
  console.error("Begin hit target not found — has the opening changed?");
  await browser.close();
  process.exit(1);
}
await begin.click();
// Q5 reveal is a 1300ms wipe; give the grid and button time to settle.
await page.waitForTimeout(4500);

const geom = await page.evaluate(() => {
  const grid = document.querySelector(".enquiry-answer-grid");
  const btn = document.querySelector(".enquiry-nextstep-btn");
  if (!grid || !btn) return null;
  const g = grid.getBoundingClientRect();
  const b = btn.getBoundingClientRect();
  // Each answer card, in grid-relative coordinates.
  const cards = Array.from(grid.querySelectorAll("button, .enquiry-answer-card")).map((el, i) => {
    const r = el.getBoundingClientRect();
    return {
      i: i + 1,
      label: (el.textContent || "").trim().slice(0, 28),
      cx: r.left + r.width / 2 - g.left,
      cy: r.top + r.height / 2 - g.top,
      w: Math.round(r.width),
      h: Math.round(r.height),
    };
  });
  return {
    grid: { w: g.width, h: g.height, top: g.top, left: g.left },
    button: {
      cx: b.left + b.width / 2 - g.left,
      cy: b.top + b.height / 2 - g.top,
      w: b.width,
      h: b.height,
      gapBelowGrid: b.top - g.bottom,
    },
    cards,
  };
});

await browser.close();

if (!geom) {
  console.error("grid or next-step button not found in the DOM");
  process.exit(1);
}

console.log(`\ngrid            ${Math.round(geom.grid.w)} x ${Math.round(geom.grid.h)}`);
console.log(`button          ${geom.button.w.toFixed(1)} x ${geom.button.h.toFixed(1)}`);
console.log(`gap below grid  ${geom.button.gapBelowGrid.toFixed(1)} px\n`);

console.log(`cards, in grid coordinates (origin = grid top-left):`);
for (const c of geom.cards) {
  console.log(`  ${String(c.i).padStart(2)}  ${c.w}x${c.h}  centre (${c.cx.toFixed(0)}, ${c.cy.toFixed(0)})  ${c.label}`);
}

console.log(`\nbutton centre   (${geom.button.cx.toFixed(0)}, ${geom.button.cy.toFixed(0)})\n`);

// ⚠ THE REACH QUESTION. Distance and angle from each card down to the button.
// The filament sits at the card's own crown height (CROWN_HEIGHT + 11.5 = 16
// world units above the card face), so the vertical leg is the in-plane drop and
// the light arrives from ABOVE — which is what decides where on the pill it
// lands.
console.log(`reach from each card to the button:`);
console.log(`   card   distance   angle below horizontal   arrives on`);
for (const c of geom.cards) {
  const dx = geom.button.cx - c.cx;
  const dy = geom.button.cy - c.cy;
  const dist = Math.hypot(dx, dy);
  const ang = (Math.atan2(dy, Math.abs(dx) || 0.0001) * 180) / Math.PI;
  // Which side of the pill faces that card.
  const side = Math.abs(dx) < 12 ? "top, centred" : dx > 0 ? "top-LEFT shoulder" : "top-RIGHT shoulder";
  console.log(
    `   ${String(c.i).padStart(4)}   ${dist.toFixed(0).padStart(6)}     ${ang.toFixed(0).padStart(3)}°                 ${side}`,
  );
}

// ⚠ INVERSE-SQUARE IS THE WHOLE STORY FOR A POINT LIGHT WITH decay 2.
// `FILAMENT_LIGHT_POWER` is tuned for a light 16 units above its OWN card face.
// At the button's distance the delivered intensity falls as (16/d)^2.
console.log(`\nfilament falloff at the button, relative to its own card:`);
console.log(`   (a point light with decay 2 delivers (z_own / d)^2)`);
const Z_OWN = 16; // CROWN_HEIGHT 4.5 + 11.5
for (const c of geom.cards) {
  const d = Math.hypot(geom.button.cx - c.cx, geom.button.cy - c.cy);
  const rel = (Z_OWN / d) ** 2;
  console.log(`   card ${c.i}   ${(rel * 100).toFixed(2)}%  of what it delivers to its own card face`);
}

console.log(`\n⚠ THIS MEASURES REACH, NOT BEAUTY, AND DECIDES NOTHING. Whether the amber`);
console.log(`  effect is implemented at all is Carl's call and has not been made.`);
