/**
 * ⚠ WHAT PAINTS ON TOP OF THE CARD AREA, AT EVERY MOMENT SOMETHING OVERLAPS IT?
 *
 * Carl, 14 August 2026: *"Do not pick a z-index by eye. Reproduce the paint
 * order the canvas already had."*
 *
 * The pre-host build's paint order is an APPROVED FACT, not a preference. This
 * records it as data so the host build can be held to it.
 *
 *   VERIFY_BASE_URL=http://localhost:3100 node verify/paint-order.mjs --save pre-host
 *   VERIFY_BASE_URL=http://localhost:3100 node verify/paint-order.mjs --compare pre-host
 *   VERIFY_BASE_URL=http://localhost:3100 node verify/paint-order.mjs --compare pre-host --z 5
 *
 * ══ WHAT IS SAMPLED ══
 *
 * `document.elementsFromPoint()` — the FULL STACK, topmost first, not just the
 * top element. A fix that puts the right element on top but reorders three
 * others beneath it has still changed the paint order, and only the full stack
 * shows that.
 *
 * ⚠ PROBE POINTS ARE DERIVED FROM `.enquiry-answer-grid`, NEVER FROM THE HOST.
 * The host does not exist on the pre-host build, so any point defined from it
 * would be unsamplable there. The grid is byte-identical across both builds
 * (432,493 576x104 at 1440) which is exactly what makes it the valid anchor.
 *
 * Five card centres, plus the grid's own corners and midpoints — because a
 * regression that spares the card centres but changes the gaps between them is
 * still a change to what the visitor sees.
 *
 * ══ THE MOMENTS ══
 *
 * Sampled at every point where something is known to overlap the card band:
 *
 *   at-rest          entrance settled, nothing moving
 *   card-selected    a card lit, before Next step is pressed
 *   next-visible     the Next step button present and enabled
 *   mid-corridor     ⚠ DURING the 900ms move — the receding phrase at depth 1
 *                      is on screen and the active phrase is withheld entirely
 *   post-corridor    the move finished, next question's entrance settled
 *
 * ...at EVERY question Q5→Q1, because the memory rail grows one chip per step
 * and is a different overlap at Q1 than at Q5.
 *
 * ⚠ MID-CORRIDOR IS THE ONE THAT MATTERS MOST and the easiest to miss. The
 * active phrase is not rendered at all during the move; the only grid on screen
 * is the OUTGOING copy. A host that paints correctly at rest can still jump in
 * front of the receding phrase mid-move, and no at-rest sample would show it.
 */

import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "out", "paint-order");
const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3100";

if (/:3000(\/|$)/.test(BASE)) {
  console.error("\n⚠⚠ REFUSING TO RUN AGAINST :3000. Paint order on a dev build is not the shipped one.\n");
  process.exit(1);
}

const args = process.argv.slice(2);
const SAVE = args.includes("--save") ? args[args.indexOf("--save") + 1] : null;
const COMPARE = args.includes("--compare") ? args[args.indexOf("--compare") + 1] : null;
const Z = args.includes("--z") ? args[args.indexOf("--z") + 1] : null;

if (!SAVE && !COMPARE) {
  console.error("Usage: --save <name> | --compare <name> [--z <value>]");
  process.exit(1);
}

/**
 * Describe an element stably enough to compare across two builds.
 *
 * ⚠ NOT by class string alone: the host build legitimately has an extra
 * wrapper, and a raw class comparison would flag every sample as changed for a
 * reason that has nothing to do with paint order. Identity is testid → class →
 * tag, and the CARD LAYER is normalised, because "the cards" are a canvas child
 * pre-host and a host child after — the same thing in the visitor's eyes.
 */
const DESCRIBE = `(el) => {
  if (!el) return "(null)";
  const testid = el.getAttribute && el.getAttribute("data-testid");
  if (testid) {
    if (/^answer-card-hover-\\d+$/.test(testid)) return "CARD-HIT";
    if (testid === "answer-card-host") return "CARD-LAYER";
    return "#" + testid;
  }
  const cls = String(el.className || "");
  if (/answer-card-proto/.test(cls)) return "CARD-LAYER";
  if (el.tagName === "CANVAS") return "CARD-CANVAS";
  const first = cls.split(/\\s+/).filter(Boolean).find((c) => /^enquiry-/.test(c));
  if (first) return "." + first;
  if (cls) return "." + cls.split(/\\s+/)[0];
  return el.tagName;
}`;

/**
 * ⚠⚠ TWO ANCHORS, DELIBERATELY — a fault found by looking at the first
 * baseline's output rather than at its exit code.
 *
 * **The active grid does not exist mid-corridor.** `phraseList` withholds the
 * active phrase entirely while `corridorMoving`, so the only `.enquiry-answer-
 * grid` on screen is the OUTGOING copy at depth 1 — and it has MOVED (493 → 480
 * at +300ms, measured). A harness anchored only to "the grid" therefore samples
 * a DIFFERENT ELEMENT AT A DIFFERENT POSITION mid-move, and reported the page
 * root because nothing else paints where it looked.
 *
 * That is precisely the class of error this repo keeps re-learning: the first
 * baseline run printed `.geist_…variable` at every mid-corridor point and
 * exited 0. **The exit code was clean and the samples were meaningless.**
 *
 *   GRID-ANCHORED points → follow whatever grid is on screen. Right for
 *                          at-rest, misleading mid-move.
 *   FIXED points         → the card band's AT-REST viewport rect, captured once
 *                          and reused. This is where the HOST paints (it is
 *                          `position: fixed` and does not move), so it is the
 *                          only anchor that answers "what covers the cards
 *                          while the corridor moves".
 *
 * ⚠ THE FIXED POINTS ARE THE ONES THAT DECIDE THE MID-CORRIDOR QUESTION.
 */
async function sampleStacks(page, fixedRect) {
  return page.evaluate(
    ({ describeSrc, fixedRect }) => {
      const describe = eval(describeSrc);
      const stackAt = (x, y) =>
        document
          .elementsFromPoint(x, y)
          .map(describe)
          // Trim the invariant tail — identical on every build, only noise.
          .filter((d) => d !== "BODY" && d !== "HTML" && !/^\.min-h-screen/.test(d) && !/^\.geist/.test(d))
          .slice(0, 6);

      const pointsFor = (b, prefix) => {
        const pts = [];
        const row1Y = b.top + b.height * 0.25;
        const row2Y = b.top + b.height * 0.75;
        for (let i = 0; i < 3; i++) pts.push({ name: `${prefix}card${i}`, x: b.left + b.width * ((i + 0.5) / 3), y: row1Y });
        for (let i = 0; i < 2; i++) pts.push({ name: `${prefix}card${i + 3}`, x: b.left + b.width * ((i + 0.5) / 2), y: row2Y });
        pts.push({ name: `${prefix}tl`, x: b.left + 2, y: b.top + 2 });
        pts.push({ name: `${prefix}br`, x: b.left + b.width - 2, y: b.top + b.height - 2 });
        pts.push({ name: `${prefix}mid`, x: b.left + b.width / 2, y: b.top + b.height / 2 });
        return pts;
      };

      const out = {};

      // ⚠ THE FIXED BAND — always sampled, exists at every moment including
      // mid-corridor. `fix-` prefixed.
      for (const p of pointsFor(fixedRect, "fix-")) out[p.name] = stackAt(p.x, p.y);

      // The live grid, when there is one. `.enquiry-pdepth-0` first — the ACTIVE
      // question, never the first in document order (instrument fault #11).
      const grid =
        document.querySelector(".enquiry-pdepth-0 .enquiry-answer-grid") ||
        document.querySelector(".enquiry-answer-grid");
      let gridRect = null;
      let gridIsActive = false;
      if (grid) {
        const b = grid.getBoundingClientRect();
        if (b.width >= 1 && b.height >= 1) {
          gridRect = { l: Math.round(b.left), t: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) };
          gridIsActive = !!grid.closest(".enquiry-pdepth-0");
          for (const p of pointsFor(b, "grid-")) out[p.name] = stackAt(p.x, p.y);
        }
      }

      return { gridRect, gridIsActive, stacks: out };
    },
    { describeSrc: DESCRIBE, fixedRect },
  );
}

const applyZ = async (page) => {
  if (!Z) return;
  await page.evaluate((z) => {
    const h = document.querySelector('[data-testid="answer-card-host"]');
    if (h) h.style.zIndex = z;
  }, Z);
};

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const record = {};
let FIXED = null;
const note = async (key) => {
  const s = await sampleStacks(page, FIXED);
  record[key] = s;
  const fixTop = ["fix-card0", "fix-card1", "fix-card2", "fix-card3", "fix-card4"].map((k) => (s.stacks[k] || ["-"])[0]);
  const gridNote = s.gridRect
    ? `grid@${s.gridRect.t}${s.gridIsActive ? "" : " ⚠OUTGOING"}`
    : "⚠ NO GRID";
  console.log(`  ${key.padEnd(26)} fixed-band: ${fixTop.join(" ")}   ${gridNote}`);
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
console.log(`renderer: ${renderer}\nbase:     ${BASE}${Z ? `\n⚠ z-index ${Z} applied to the host` : ""}\n`);

await page.getByRole("button", { name: /begin/i }).click();
await page.locator(".enquiry-answer-grid").waitFor({ state: "visible", timeout: 30000 });
await page.waitForTimeout(6200);
await applyZ(page);

// ⚠ THE FIXED BAND, CAPTURED ONCE AT REST, then reused for every sample. It is
// the card band's viewport rect — where the `fixed` host paints and does not
// move. Asserted against the known geometry so a mis-capture cannot silently
// become the definition of "the card band".
FIXED = await page.evaluate(() => {
  const g = document.querySelector(".enquiry-pdepth-0 .enquiry-answer-grid") || document.querySelector(".enquiry-answer-grid");
  const b = g.getBoundingClientRect();
  return { left: b.left, top: b.top, width: b.width, height: b.height };
});
if (!FIXED || FIXED.width < 100 || FIXED.height < 40) {
  console.error(`\n⛔ REFUSING TO CONTINUE — fixed band captured as ${JSON.stringify(FIXED)}, which is not a card band.`);
  console.error(`  A harness that records a measurement it has already identified as wrong makes`);
  console.error(`  the bad number the definition of "unchanged" (standing rule 1).`);
  process.exit(1);
}
console.log(`fixed band: ${Math.round(FIXED.left)},${Math.round(FIXED.top)} ${Math.round(FIXED.width)}x${Math.round(FIXED.height)}   ← reused at every moment\n`);

for (let step = 0; step < 5; step++) {
  const q = await page.evaluate(() =>
    (document.querySelector(".enquiry-pdepth-0 .enquiry-phrase-cue")?.textContent || "?").trim(),
  );
  const chips = await page.evaluate(() => document.querySelectorAll(".enquiry-memory-chip, [class*='memory']").length);
  console.log(`\n── ${q}   (memory elements on screen: ${chips}) ──`);

  await note(`${q}|at-rest`);

  if (step === 4) break;

  // Select a card. ⚠ `pointerdown`, not click — the trigger is the mouse BUTTON
  // (answer-card-canvas.tsx:4158). On the host build as shipped this lands on
  // whatever is on top, which is the defect; dispatchEvent bypasses hit-testing
  // so the WALK still proceeds and the paint order is still what is measured.
  await page.getByTestId("answer-card-hover-0").dispatchEvent("pointerdown");
  await page.waitForTimeout(700);
  await note(`${q}|card-selected`);
  await note(`${q}|next-visible`);

  // ⚠ SAMPLE DURING THE MOVE. 900ms morph — 300ms in, the receding copy is on
  // screen and the active phrase is withheld entirely.
  const nextBtn = page.getByRole("button", { name: /next step/i });
  await nextBtn.click({ timeout: 10000 });
  await page.waitForTimeout(300);
  await note(`${q}|mid-corridor`);

  await page.waitForTimeout(6500);
  await note(`${q}|post-corridor`);
  await applyZ(page);
}

await browser.close();

mkdirSync(OUT, { recursive: true });

if (SAVE) {
  const f = join(OUT, `${SAVE}.json`);
  writeFileSync(f, JSON.stringify(record, null, 2));
  console.log(`\n✅ saved ${Object.keys(record).length} samples → ${f}`);
  console.log(`\n⚠ This is a RECORD, not a verdict. It is the approved order only because it was`);
  console.log(`  captured on the pre-host build Carl has already accepted.`);
  process.exit(0);
}

const f = join(OUT, `${COMPARE}.json`);
if (!existsSync(f)) {
  console.error(`\n⛔ no baseline at ${f} — run --save ${COMPARE} on the pre-host build first.`);
  process.exit(1);
}
const baseline = JSON.parse(readFileSync(f, "utf8"));

console.log(`\n${"═".repeat(66)}`);
console.log(`PAINT-ORDER DIFF vs "${COMPARE}"${Z ? `   (host z-index ${Z})` : "   (no z applied)"}`);
console.log(`${"═".repeat(66)}`);

let changed = 0;
let matched = 0;
const missing = [];

for (const key of Object.keys(baseline)) {
  const b = baseline[key];
  const c = record[key];
  if (!c) { missing.push(key); continue; }
  if (!b || !c.stacks) continue;

  // ⚠ THE UNION OF BOTH KEY SETS, not just the baseline's. A point that exists
  // only in the new run is a change too — skipping it would let an added layer
  // pass unnoticed.
  const allPts = new Set([...Object.keys(b.stacks), ...Object.keys(c.stacks)]);
  for (const pt of allPts) {
    const inB = Object.prototype.hasOwnProperty.call(b.stacks, pt);
    const inC = Object.prototype.hasOwnProperty.call(c.stacks, pt);
    const bs = inB ? (b.stacks[pt] || []).join(" > ") : "(point absent)";
    const cs = inC ? (c.stacks[pt] || []).join(" > ") : "(point absent)";
    if (inB && inC && bs === cs) { matched += 1; continue; }
    changed += 1;
    console.log(`\n  ⛔ ${key}  @${pt}`);
    console.log(`      was: ${bs}`);
    console.log(`      now: ${cs}`);
  }
}

console.log(`\n  ${matched} probe points identical, ${changed} changed.`);
if (missing.length) console.log(`  ⚠ ${missing.length} moment(s) missing from this run: ${missing.join(", ")}`);

if (changed === 0 && !missing.length) {
  console.log(`
  ✅ THE PAINT ORDER IS REPRODUCED EXACTLY at every probe point and every moment.
     ⚠ This says the STACK matches. It does not say the page looks right —
     screenshot diffs and Carl's eye decide that.`);
  process.exit(0);
}
console.log(`
  ⛔ The paint order differs. ${Z ? `z-index ${Z} does not reproduce the approved order.` : "Apply --z to test a candidate."}`);
process.exit(1);
