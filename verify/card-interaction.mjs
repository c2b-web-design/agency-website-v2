/**
 * ⚠⚠ CAN A VISITOR ACTUALLY CLICK THE CARDS, AND WALK THE WHOLE ENQUIRY?
 *
 * **No harness in this repo asserted clickability until 14 August 2026, which is
 * why a completely dead page passed every check it had.** The host commit
 * `1e031cd` rendered all five cards in exactly the right place — position
 * verified to 0.5px at three widths, containing block verified — **and no card
 * could receive a pointer event.** Both of those checks passed and were right to
 * pass. Geometry was never the defect.
 *
 *   VERIFY_BASE_URL=http://localhost:3100 node verify/card-interaction.mjs
 *   node verify/card-interaction.mjs --falsify
 *
 * ══ WHAT IS ASSERTED ══
 *
 *   1. REACHABILITY — `document.elementFromPoint()` at each of the five card
 *      centres returns THAT card's hit target. ⚠ This is the only honest test of
 *      "can it be clicked": a rect from `getBoundingClientRect` proves the
 *      element is THERE, not that a pointer can REACH it. The dead build had
 *      perfect rects.
 *
 *   2. THE FULL WALK — Q5 → Q1 by real user actions, four steps. A card that is
 *      reachable at Q5 but not at Q2 is still a broken page, and only walking
 *      finds that.
 *
 *   3. ⚠⚠ THE COMPLETION STATE, PAST Q1 — added 14 August 2026, because its
 *      ABSENCE hid a defect. This harness previously asserted reachability at
 *      Q1 and exited, so everything after answering the last question was
 *      outside every instrument in this repo. Carl found a fault there by eye.
 *      **`stage === "complete"` is a condition the host's visibility gate reads
 *      directly, and it was edited with no check that reaches it.**
 *
 *   4. ⚠ SELECTION STATE, FROM `data-lit-cards` — NOT FROM PIXELS. `litCards`
 *      is React state driving a Three.js mesh, so it has no natural DOM
 *      representation; `answer-card-canvas.tsx` carries a test-only attribute
 *      for exactly this. **A brightness probe was tried first and produced a
 *      contradiction — pressing a card LOWERED its mean luminance, because the
 *      travelling spotlight varies per-card brightness by design.** An
 *      instrument must not key on a property the design deliberately varies.
 *
 * ⚠ REAL CLICKS, NOT `dispatchEvent`. `page.dispatchEvent("pointerdown")`
 * bypasses hit-testing entirely and would have passed on the dead build — it is
 * how the other harnesses walk the questions, and it is exactly why they never
 * caught this. `locator.click()` goes through the browser's real hit-test.
 *
 * ══ FALSIFICATION ══ (standing rule: proven RED before trusted GREEN)
 *
 *   node verify/card-interaction.mjs --falsify
 *
 * Drops a transparent full-band overlay over the cards — the same shape as the
 * real defect, where `.enquiry-answer-grid` sat on top. A working harness MUST
 * report ⛔ here. If it goes green, the instrument is blind.
 *
 * ⚠ THE REAL DEFECT IS ITSELF A FALSIFICATION. Run this against `1e031cd` with
 * no flags and it must fail; that is not a bug in the harness, it is the
 * harness working. Recorded here so a future reader does not "fix" it.
 */

import { chromium } from "@playwright/test";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3100";
const FALSIFY = process.argv.includes("--falsify");

if (/:3000(\/|$)/.test(BASE)) {
  console.error("\n⚠⚠ REFUSING TO RUN AGAINST :3000. Hit-testing on a dev build is not the shipped page.\n");
  process.exit(1);
}

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const failures = [];
const note = (msg) => { failures.push(msg); console.log(`     ⛔ ${msg}`); };

/**
 * Reachability at all five card centres.
 *
 * ⚠ THE POINT IS TAKEN FROM THE HIT TARGET'S OWN RECT, then tested against what
 * the browser says is on top there. If the target has no rect at all that is
 * also a failure — reported distinctly, because "not painted" and "covered" are
 * different defects with different fixes.
 */
const reachability = () =>
  page.evaluate(() => {
    const out = [];
    for (let i = 0; i < 5; i++) {
      const el = document.querySelector(`[data-testid="answer-card-hover-${i}"]`);
      if (!el) { out.push({ i, state: "MISSING", detail: "no hit target in the DOM" }); continue; }
      const b = el.getBoundingClientRect();
      if (b.width < 1 || b.height < 1) { out.push({ i, state: "NO-RECT", detail: `${b.width}x${b.height}` }); continue; }
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.display === "none") {
        out.push({ i, state: "HIDDEN", detail: `visibility=${cs.visibility} display=${cs.display}` });
        continue;
      }
      const top = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
      const id = top?.getAttribute?.("data-testid");
      if (id === `answer-card-hover-${i}`) { out.push({ i, state: "OK" }); continue; }
      out.push({
        i,
        state: "COVERED",
        detail: `by ${id ? "#" + id : "." + (String(top?.className || "").split(/\s+/)[0] || top?.tagName || "nothing")}`,
      });
    }
    return out;
  });

const report = (label, rows) => {
  const ok = rows.every((r) => r.state === "OK");
  console.log(`  ${label.padEnd(22)} ${rows.map((r) => `${r.i}:${r.state}`).join("  ")}`);
  for (const r of rows) if (r.state !== "OK") note(`${label} — card ${r.i} ${r.state} ${r.detail ?? ""}`);
  return ok;
};

await page.goto(`${BASE}/start`, { waitUntil: "domcontentloaded" });

const renderer = await page.evaluate(() => {
  const c = document.createElement("canvas");
  const gl = c.getContext("webgl2") || c.getContext("webgl");
  if (!gl) return "no webgl";
  const ext = gl.getExtension("WEBGL_debug_renderer_info");
  return ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "unknown";
});
if (/swiftshader|llvmpipe|software/i.test(renderer)) {
  console.error(`\n⚠ ABORTING — renderer is "${renderer}": a software rasteriser.`);
  process.exit(1);
}
console.log(`renderer: ${renderer}\nbase:     ${BASE}${FALSIFY ? "\n⚠ FALSIFY MODE — an overlay is injected; ⛔ is the PASS" : ""}\n`);

await page.getByRole("button", { name: /begin/i }).click();
await page.locator(".enquiry-answer-grid").waitFor({ state: "visible", timeout: 30000 });
await page.waitForTimeout(6200);

// ⚠ FALSIFICATION: a transparent sheet over the card band — the same shape as
// the real defect. Re-applied after every question, since the corridor rebuilds.
const injectOverlay = async () => {
  if (!FALSIFY) return;
  await page.evaluate(() => {
    if (document.getElementById("__falsify_overlay")) return;
    const g = document.querySelector(".enquiry-pdepth-0 .enquiry-answer-grid") || document.querySelector(".enquiry-answer-grid");
    if (!g) return;
    const b = g.getBoundingClientRect();
    const d = document.createElement("div");
    d.id = "__falsify_overlay";
    Object.assign(d.style, {
      position: "fixed", left: `${b.left}px`, top: `${b.top}px`,
      width: `${b.width}px`, height: `${b.height}px`,
      zIndex: "9999", background: "transparent",
    });
    document.body.appendChild(d);
  });
};
await injectOverlay();

/**
 * The lit-card state, read from the test-only attribute rather than pixels.
 * Returns e.g. "10000", or null if the attribute is absent (an older build).
 */
const litState = () =>
  page.evaluate(() => {
    const n = document.querySelector("[data-lit-cards]");
    return n ? n.getAttribute("data-lit-cards") : null;
  });

let walked = 0;
let walkBroke = null;

for (let step = 0; step < 5; step++) {
  const q = await page.evaluate(() =>
    (document.querySelector(".enquiry-pdepth-0 .enquiry-phrase-cue")?.textContent || "?").trim(),
  );
  console.log(`\n── ${q} ──`);
  const rows = await reachability();
  report(`${q} reachability`, rows);

  /**
   * ⚠ A QUESTION MUST NOT ARRIVE WITH A CARD ALREADY LIT. The visitor has
   * chosen nothing here yet. Pre-host this held for free because the canvas was
   * destroyed and rebuilt per question, taking its state with it; a host that
   * never unmounts must clear it deliberately.
   */
  const litOnArrival = await litState();
  if (litOnArrival === null) {
    console.log(`     ⚠ no [data-lit-cards] on this build — selection state NOT asserted`);
  } else {
    console.log(`  ${`${q} litCards on arrival`.padEnd(22)} ${litOnArrival}`);
    if (litOnArrival.includes("1")) {
      note(`${q} — arrived with a card ALREADY LIT (${litOnArrival}); nothing was chosen here`);
    }
  }

  if (step === 4) break;

  // ⚠ A REAL CLICK through the browser's hit-test — the whole point. If the
  // cards are covered this THROWS, which is the correct outcome.
  try {
    await page.getByTestId("answer-card-hover-0").click({ timeout: 8000 });
  } catch {
    note(`${q} — REAL CLICK on card 0 did not land (hit-test blocked)`);
    walkBroke = q;
    break;
  }
  await page.waitForTimeout(700);

  try {
    await page.getByRole("button", { name: /next step/i }).click({ timeout: 8000 });
  } catch {
    note(`${q} — "Next step" did not accept a click after selecting card 0`);
    walkBroke = q;
    break;
  }
  await page.waitForTimeout(6800);
  walked += 1;
  await injectOverlay();
}

const finalQ = await page.evaluate(() =>
  (document.querySelector(".enquiry-pdepth-0 .enquiry-phrase-cue")?.textContent || "?").trim(),
);

/**
 * ⚠⚠ PAST Q1 — THE COMPLETION STATE. This is the leg whose ABSENCE hid a
 * defect, so it runs even when the walk failed earlier; a harness that only
 * checks completion on a perfect run cannot report completion faults.
 */
let completion = { reached: false, contact: null, cardsGone: null, lit: null };
if (!walkBroke) {
  console.log(`\n── COMPLETION (answering ${finalQ}) ──`);
  try {
    await page.getByTestId("answer-card-hover-0").click({ timeout: 8000 });
    await page.waitForTimeout(700);
    await page.getByRole("button", { name: /next step/i }).click({ timeout: 8000 });
    await page.waitForTimeout(7000);

    completion = await page.evaluate(() => {
      const host = document.querySelector('[data-testid="answer-card-host"]');
      const hostCs = host ? getComputedStyle(host) : null;
      const hostRect = host ? host.getBoundingClientRect() : null;
      const litNode = document.querySelector("[data-lit-cards]");
      return {
        reached: true,
        // The contact field is what completion is FOR.
        contact: !!document.querySelector(".enquiry-contact-layer"),
        contactVisible: (() => {
          const c = document.querySelector(".enquiry-contact-layer");
          return c ? getComputedStyle(c).visibility : null;
        })(),
        // The cards must not still be sitting on the completion screen.
        cardsPresent: !!document.querySelector('[data-testid^="answer-card-hover-"]'),
        hostVisibility: hostCs ? hostCs.visibility : null,
        hostTop: hostRect ? Math.round(hostRect.top) : null,
        lit: litNode ? litNode.getAttribute("data-lit-cards") : null,
        stillHasActiveQuestion: !!document.querySelector(".enquiry-pdepth-0 .enquiry-phrase-cue"),
      };
    });

    console.log(`  contact layer present    ${completion.contact ? "yes" : "⛔ NO"}   visibility=${completion.contactVisible ?? "-"}`);
    console.log(`  answer cards present     ${completion.cardsPresent ? "yes" : "no"}`);
    console.log(`  host visibility          ${completion.hostVisibility ?? "-"}   top=${completion.hostTop ?? "-"}`);
    console.log(`  litCards at completion   ${completion.lit ?? "(no attribute)"}`);

    if (!completion.contact) note("completion — the contact layer never appeared");
    // ⚠ The host is `visibility: hidden` at completion BY DESIGN
    // (`hostCardsVisible` excludes "complete"). What must NOT happen is the
    // cards remaining VISIBLE over the contact field.
    if (completion.hostVisibility === "visible" && completion.cardsPresent) {
      note(`completion — the answer cards are still VISIBLE over the contact field (host top=${completion.hostTop})`);
    }
    if (completion.lit && completion.lit.includes("1")) {
      note(`completion — a card is still lit (${completion.lit}) after the enquiry ended`);
    }
  } catch (e) {
    note(`completion — could not answer ${finalQ}: ${String(e).split("\n")[0].slice(0, 70)}`);
  }
} else {
  console.log(`\n── COMPLETION — NOT REACHED (the walk broke at ${walkBroke}) ──`);
  note(`completion was never exercised: the walk broke at ${walkBroke}`);
}

await browser.close();

console.log(`\n${"═".repeat(62)}`);
console.log(`VERDICT${FALSIFY ? "   ⚠ FALSIFY MODE: ⛔ IS THE PASS" : ""}`);
console.log(`${"═".repeat(62)}`);
console.log(`  Walk: ${walked}/4 steps   final question: ${finalQ}`);
if (walked < 4 && !walkBroke) console.log(`  ⚠ the walk ended early without a click failure — investigate.`);
console.log(`  Completion reached: ${completion.reached ? "yes" : "NO"}`);
console.log(`  Failures: ${failures.length}`);

if (FALSIFY) {
  if (failures.length > 0) {
    console.log(`\n  ✅ FALSIFIED CORRECTLY — the injected overlay was detected.`);
    console.log(`     This instrument can go RED, so its GREEN verdicts mean something.`);
    process.exit(0);
  }
  console.log(`\n  ⛔⛔ THE OVERLAY WAS NOT DETECTED. THIS HARNESS IS BLIND — do not trust any`);
  console.log(`     green verdict from it. An instrument that has never failed has not been tested.`);
  process.exit(1);
}

if (failures.length > 0) {
  // ⚠ SAY WHICH KIND OF FAILURE IT IS. The first version printed "THE CARDS
  // CANNOT BE USED" for any failure at all, which became untrue the moment this
  // harness grew assertions about selection STATE — the cards were fully
  // clickable and the message said otherwise.
  const unreachable = failures.some((f) => /COVERED|MISSING|NO-RECT|HIDDEN|CLICK/.test(f));
  if (unreachable) {
    console.log(`\n  ⛔ THE CARDS CANNOT BE USED. A visitor cannot complete the enquiry.`);
    console.log(`     ⚠ Position and containing-block checks do NOT cover this — the`);
    console.log(`       1e031cd build passed both while every card was dead.`);
  } else {
    console.log(`\n  ⛔ The cards are reachable, but the enquiry misbehaves — see the failures`);
    console.log(`     above. Selection state and the completion screen are asserted here;`);
    console.log(`     neither is covered by any position, motion or timing harness.`);
  }
  process.exit(1);
}

console.log(`
  ✅ All five cards reachable at every question, and the full Q5→Q1 walk
     completes with real clicks.

  ⚠ Verification is not approval. Carl's eye decides.
`);
