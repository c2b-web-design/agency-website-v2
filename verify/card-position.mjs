// CARD POSITION FROM SCREENSHOTS — never from the DOM.
//
//   node card-position.mjs <width> [--save <label>] [--compare <label>] [--offset N]
//
// ⚠⚠ WHY THIS EXISTS. On 12 August the shared host rendered the five cards
// ~230px too high and THREE separate instruments stayed green, because every
// one of them compared two `getBoundingClientRect` calls. The DOM hit targets
// (`answer-card-hover-*`) live in the phrase's own grid and were never wrong —
// the CANVAS was. An instrument reading the same value as the code cannot
// catch the code.
//
// So this finds the cards IN THE IMAGE and nowhere else. No DOM rect is read
// for the assertion.
//
// ⚠ --offset N deliberately translates the canvas host by N px via injected
// CSS, to prove this harness goes RED. An instrument that has never failed has
// not been tested (amendment F).
//
// METHOD. The cards are lit and sit on the #101010 ground (luminance 16). At
// the moment they are fully entered, each card is a bright blob. We threshold
// the screenshot, find connected bright regions in the grid band, and report
// each blob's CENTROID in viewport pixels. Centroids are compared to a saved
// baseline with a +/-4px tolerance (amendment E) — the primary assertion.
// "Cards below the phrase baseline" is computed too, but it is SECONDARY: it
// would pass a 30px error.

import { chromium } from "playwright";
import { mkdtempSync, rmSync, writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { positionals, wholeNumberArg } from "./lib/args.mjs";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";

// ⚠ SAME PARSE DEFECT, THIRD FAILURE MODE. This was `Number(process.argv[2] ??
// 1440)`, so `card-position.mjs --save baseline` made W = NaN.
//
// ⛔ AND HERE NaN IS NOT A LOOP BOUND — IT IS A VIEWPORT DIMENSION. It goes to
// the browser rather than to a counter, so the failure is neither a quiet
// no-op nor a throw: the shot is taken at a nonsense width and the centroids
// are compared against a baseline measured at a real one.
//
// ⚠⚠ AND --save/--compare/--offset TAKE VALUES HERE, unlike approved-timings.
// A naive "drop anything starting with --" filter would read the LABEL as the
// width: `--save baseline` would give W = Number("baseline") = NaN again, by a
// different route. That is why the value-taking flags are declared below.
// Reasoning: verify/lib/args.mjs.
const ARGS = process.argv.slice(2);
const W = wholeNumberArg(positionals(ARGS, ["--save", "--compare", "--offset"])[0], 1440, {
  name: "viewport width",
  usage: "node verify/card-position.mjs <width> [--save <label>] [--compare <label>] [--offset N]",
  min: 320,
});
const SAVE = ARGS.includes("--save") ? ARGS[ARGS.indexOf("--save") + 1] : null;
const COMPARE = ARGS.includes("--compare") ? ARGS[ARGS.indexOf("--compare") + 1] : null;
const OFFSET = ARGS.includes("--offset") ? Number(ARGS[ARGS.indexOf("--offset") + 1]) : 0;
const TOL = 4; // amendment E

const OUT = "verify/out/card-position";
const H = 900;

// Wait past the whole ladder AND its 700ms rise: card 5 starts at ~+2949ms
// from Begin, so it is not fully lit until ~+3650ms.
// ⚠ 4200ms WAS NOT ENOUGH — at 1440 the shot caught the question text instead
// of the cards, because the cards were still dark. Measured, not guessed: the
// failure is in verify/out/card-position/ if it recurs.
const SETTLE_AFTER_BEGIN_MS = 6000;

const profile = mkdtempSync(join(tmpdir(), "cardpos-"));
const context = await chromium.launchPersistentContext(profile, {
  headless: false,
  viewport: { width: W, height: H },
  deviceScaleFactor: 1,
  args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
});
const page = await context.newPage();

const res = await page.goto(`${BASE}/start`, { waitUntil: "domcontentloaded" });
if (!res || !res.ok()) { console.error("nav failed"); process.exit(1); }

const renderer = await page.evaluate(() => {
  const c = document.createElement("canvas");
  const gl = c.getContext("webgl2") || c.getContext("webgl");
  if (!gl) return "no webgl";
  const ext = gl.getExtension("WEBGL_debug_renderer_info");
  return ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "unknown";
});
if (/swiftshader|llvmpipe|software|no webgl/i.test(renderer)) {
  console.error(`⚠ ABORT — software rasteriser: ${renderer}`); process.exit(1);
}
console.log(`Renderer: ${renderer}`);

// ⚠ THE DELIBERATE BREAK. Shifts whatever hosts the canvas, to prove RED.
if (OFFSET) {
  await page.addStyleTag({
    content: `.enquiry-answer-grid > div[data-testid="answer-card-proto"],
              .enquiry-card-host { transform: translateY(${OFFSET}px) !important; }`,
  });
  console.log(`⚠ INJECTED OFFSET: translateY(${OFFSET}px) — this run SHOULD go red`);
}

const begin = page.getByRole("button", { name: /begin/i });
await begin.waitFor({ state: "visible", timeout: 25000 });
await page.waitForFunction(() => {
  const b = [...document.querySelectorAll("button")].find((el) => /begin/i.test(el.textContent ?? ""));
  return b && !b.disabled && getComputedStyle(b).pointerEvents !== "none";
}, { timeout: 25000 });
await begin.click();
await page.waitForTimeout(SETTLE_AFTER_BEGIN_MS);

mkdirSync(OUT, { recursive: true });
const shotPath = join(OUT, `shot-${W}${OFFSET ? `-offset${OFFSET}` : ""}.png`);
await page.screenshot({ path: shotPath });

// ── Find the cards in the IMAGE ────────────────────────────────────────────
const img = sharp(shotPath);
const { width: iw, height: ih } = await img.metadata();
const raw = await img.greyscale().raw().toBuffer();

// The ground is #101010 (luminance ~16). Lit cards are well above it.
const THRESH = 45;

// Column-profile approach: the five cards form bright vertical bands within a
// horizontal strip. Find the strip first (rows with many bright pixels), then
// segment columns inside it.
const rowCount = new Array(ih).fill(0);
for (let y = 0; y < ih; y++) {
  let n = 0;
  for (let x = 0; x < iw; x++) if (raw[y * iw + x] > THRESH) n++;
  rowCount[y] = n;
}
// The card band is the widest contiguous run of rows with >40 bright px.
let bands = [], cur = null;
for (let y = 0; y < ih; y++) {
  if (rowCount[y] > 40) { if (!cur) cur = { y0: y, y1: y }; else cur.y1 = y; }
  else if (cur) { bands.push(cur); cur = null; }
}
if (cur) bands.push(cur);
bands = bands.filter((b) => b.y1 - b.y0 >= 20).sort((a, b) => (b.y1 - b.y0) - (a.y1 - a.y0));

if (!bands.length) {
  console.error("⚠ NO CARD BAND FOUND IN THE IMAGE — cards are not where any band could be seen.");
  console.error(`   Screenshot: ${shotPath}`);
  await context.close(); rmSync(profile, { recursive: true, force: true });
  process.exit(2);
}

// ⚠ THE GRID IS 3 + 2, NOT ONE ROW — confirmed by looking at the screenshot
// rather than assuming. Three cards on the top row, two on the second. Taking
// only the widest/lowest band finds the 2-card row and silently reports two
// cards, which is how a position harness quietly measures the wrong thing.
//
// So: take the TWO lowest wide bands (the card rows), segment each into
// columns independently, and concatenate top row then bottom row.
const rowBands = bands
  .filter((b) => b.y1 - b.y0 >= 20)
  .sort((a, b) => b.y0 - a.y0)   // lowest first
  .slice(0, 2)
  .sort((a, b) => a.y0 - b.y0);  // back to top-to-bottom

const segment = (bd) => {
  const colCount = new Array(iw).fill(0);
  for (let y = bd.y0; y <= bd.y1; y++)
    for (let x = 0; x < iw; x++) if (raw[y * iw + x] > THRESH) colCount[x]++;
  let blobs = [], c2 = null;
  for (let x = 0; x < iw; x++) {
    if (colCount[x] > 3) { if (!c2) c2 = { x0: x, x1: x }; else c2.x1 = x; }
    else if (c2) { blobs.push(c2); c2 = null; }
  }
  if (c2) blobs.push(c2);
  return blobs.filter((b) => b.x1 - b.x0 >= 15).map((b) => {
    // ⚠⚠ GEOMETRIC CENTRE, NOT BRIGHTNESS-WEIGHTED — CORRECTED 14 August 2026.
    //
    // The first version weighted the centroid by luminance. That conflates
    // LIGHTING with POSITION: card 4's right half measured 107.5 mean against
    // its left half's 103.4, which dragged the "centroid" 4.1px right and
    // tripped the ±4px tolerance **while the card's edges were byte-identical
    // to baseline (529..716 in both)**.
    //
    // ⚠ IT WOULD HAVE REPORTED A POSITION REGRESSION THAT DID NOT EXIST — the
    // mirror image of the 12 August failure, and just as wrong. A position
    // harness must measure where the object IS, not where its light happens to
    // fall. The travelling spotlight makes per-card brightness vary by design.
    //
    // Edges are found by thresholding, so they are still image-derived: no DOM
    // rect is consulted anywhere in this file.
    let y0 = Infinity, y1 = -Infinity;
    for (let y = bd.y0; y <= bd.y1; y++)
      for (let x = b.x0; x <= b.x1; x++)
        if (raw[y * iw + x] > THRESH) { if (y < y0) y0 = y; if (y > y1) y1 = y; break; }
    return {
      cx: +(((b.x0 + b.x1) / 2)).toFixed(1),
      cy: +(((y0 + y1) / 2)).toFixed(1),
      x0: b.x0, x1: b.x1, y0, y1, row: bd.y0,
    };
  });
};

// ⚠ TEXT LOOKS LIKE CARDS TO A BRIGHTNESS THRESHOLD. At 1440 an early
// screenshot found the question text — 21 letter-shaped blobs at row ~325 —
// and reported them as cards. Letters are NARROW; a card is ~186px wide at
// 1440. Reject any band whose widest blob is under 100px: that is text, not a
// card row. Found by looking at the saved image, not by reasoning.
const MIN_CARD_W = 100;
const isCardRow = (bd) => segment(bd).some((b) => b.x1 - b.x0 >= MIN_CARD_W);

const cardRows = bands
  .filter((b) => b.y1 - b.y0 >= 20 && isCardRow(b))
  .sort((a, b) => a.y0 - b.y0)
  .slice(-2);

const cards = (cardRows.length ? cardRows : rowBands).flatMap(segment)
  .filter((b) => b.x1 - b.x0 >= MIN_CARD_W);

// SECONDARY: the phrase's bottom — the bright band above the FIRST card row.
const topRow = rowBands[0];
const above = bands.filter((b) => b.y1 < topRow.y0).sort((a, b) => b.y1 - a.y1)[0] ?? null;

console.log(`\n  viewport ${W}x${H}   card rows ${rowBands.map((b) => `${b.y0}..${b.y1}`).join("  ")}   cards found ${cards.length}`);
cards.forEach((c, i) => console.log(`    card ${i + 1}  centroid (${c.cx}, ${c.cy})   x ${c.x0}..${c.x1}`));
if (above) console.log(`    phrase band above ends at row ${above.y1}  (secondary check)`);

// ⚠⚠ THE CARD COUNT IS A HARD FAILURE, NOT A WARNING — and the first version
// of this file got that wrong. It printed "EXPECTED 5, FOUND 21" and then SAVED
// THE BASELINE ANYWAY. A harness that records a result it has already
// identified as wrong is worse than no harness: the bad number becomes the
// definition of "unchanged".
if (cards.length !== 5) {
  console.error(`\n  ⛔ EXPECTED 5 CARDS, FOUND ${cards.length} — segmentation is not seeing the grid.`);
  console.error(`     Nothing saved, nothing compared. Look at ${shotPath}.`);
  console.error(`     Most likely the cards had not finished entering when the shot fired.`);
  await context.close(); rmSync(profile, { recursive: true, force: true });
  process.exit(2);
}

const result = { width: W, rowBands, cards, phraseBottom: above ? above.y1 : null };

if (SAVE) {
  const p = join(OUT, `baseline-${SAVE}-${W}.json`);
  writeFileSync(p, JSON.stringify(result, null, 2));
  console.log(`\n  ✅ BASELINE SAVED → ${p}`);
}

let exitCode = 0;
if (COMPARE) {
  const p = join(OUT, `baseline-${COMPARE}-${W}.json`);
  if (!existsSync(p)) { console.error(`\n  ⚠ no baseline at ${p}`); process.exit(1); }
  const b = JSON.parse(readFileSync(p, "utf8"));
  console.log(`\n  DIFF vs ${COMPARE} (tolerance ±${TOL}px — PRIMARY assertion)`);
  if (b.cards.length !== cards.length) {
    console.log(`    ⚠ CARD COUNT CHANGED: ${b.cards.length} → ${cards.length}`);
    exitCode = 1;
  }
  const n = Math.min(b.cards.length, cards.length);
  let worst = 0;
  for (let i = 0; i < n; i++) {
    const dx = +(cards[i].cx - b.cards[i].cx).toFixed(1);
    const dy = +(cards[i].cy - b.cards[i].cy).toFixed(1);
    const bad = Math.abs(dx) > TOL || Math.abs(dy) > TOL;
    worst = Math.max(worst, Math.abs(dx), Math.abs(dy));
    console.log(`    card ${i + 1}   dx ${String(dx).padStart(7)}  dy ${String(dy).padStart(7)}  ${bad ? "⚠ OUT OF TOLERANCE" : "ok"}`);
    if (bad) exitCode = 1;
  }
  console.log(`\n    worst deviation ${worst.toFixed(1)}px`);
  // SECONDARY
  if (result.phraseBottom !== null && cards.length) {
    const topCard = Math.min(...cards.map((c) => c.cy));
    console.log(`    SECONDARY: cards below phrase? ${topCard > result.phraseBottom ? "yes" : "⚠ NO — cards are ABOVE the phrase"}`);
    if (topCard <= result.phraseBottom) exitCode = 1;
  }
  console.log(exitCode === 0
    ? `\n  ✅ POSITION UNCHANGED within ±${TOL}px.`
    : `\n  ⛔ POSITION CHANGED — this is the 12 August failure class.`);
}

console.log(`\n  screenshot: ${shotPath}`);
console.log(`  ⚠ Verification is not approval.`);

await context.close();
rmSync(profile, { recursive: true, force: true });
process.exit(exitCode);
