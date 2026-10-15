/** THE CARDS ON THE SCREEN's PIXEL GRID — measured AT CARL's RATIO (15 October 2026; his `devicePixelRatio` 1.36).
 *  /start at Q5, 1440 × 900, deviceScaleFactor = DSF (default 1.36). Reports, in SCREEN pixels:
 *    the cards' canvas — page position × dpr (must be whole), backing vs CSS × dpr (must match);
 *    each card's tube edges FOUND IN THE PIXELS (not the DOM boxes): on the middle row of each card, the first column from
 *    the outside brighter than the ground + 40, from the left and from the right;
 *    card 1's LEFT strip vs its RIGHT strip mirrored, 8 screen px each from the found edge — identical when the card sits
 *    on the grid symmetrically.
 *  Usage: DSF=1.36 node …/card-pixel-grid-15-october.mjs [query]
 *  ⚠ NOT WATCHED: Carl's GPU and Chrome; top vs bottom (a column, not measured); cards' tops. A CONTROL: run with
 *  ?cardsnap=0 — the old placement must show the asymmetry this measures. */
import { chromium } from "playwright";
const DSF = Number(process.env.DSF ?? 1.36);
const Q = process.argv[2] ?? "";
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: DSF })).newPage();
await p.goto("http://localhost:3000/start" + Q, { waitUntil: "load" });
await p.waitForTimeout(9000);
await p.getByRole("button", { name: /begin/i }).click();
await p.locator(".enquiry-answer-grid").waitFor({ state: "visible", timeout: 30000 });
await p.mouse.move(5, 5);
await p.waitForTimeout(5000);
const cv = await p.evaluate(() => { const c = document.querySelector('[data-testid="answer-card-proto"] canvas'); const r = c.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, bw: c.width, bh: c.height, dpr: devicePixelRatio }; });
const fr = (v) => Math.abs(v - Math.round(v)).toFixed(2);
console.log(`DPR ${cv.dpr} ${Q || "(default)"}`);
console.log(`canvas: page × dpr = ${(cv.x * cv.dpr).toFixed(2)}, ${(cv.y * cv.dpr).toFixed(2)} (off whole by ${fr(cv.x * cv.dpr)}, ${fr(cv.y * cv.dpr)}) · backing ${cv.bw} × ${cv.bh} vs CSS × dpr ${(cv.w * cv.dpr).toFixed(2)} × ${(cv.h * cv.dpr).toFixed(2)}`);
const shot = await p.screenshot({ clip: { x: cv.x, y: cv.y, width: cv.w, height: cv.h } });
const boxes = await p.evaluate(() => [0, 1, 2, 3, 4].map((i) => { const r = document.querySelector(`[data-testid="answer-card-hover-${i}"]`).getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom }; }));
const res = await p.evaluate(async ({ s, boxes, cv }) => {
  const img = new Image(); img.src = "data:image/png;base64," + s; await img.decode();
  const c = document.createElement("canvas"); c.width = img.width; c.height = img.height; const g = c.getContext("2d"); g.drawImage(img, 0, 0);
  const sx = img.width / cv.w;
  const L = (x, y) => { const d = g.getImageData(x, y, 1, 1).data; return Math.round(0.2126 * d[0] + 0.7152 * d[1] + 0.0722 * d[2]); };
  return boxes.map((bx) => {
    const y = Math.round(((bx.t + bx.b) / 2 - cv.y) * sx);
    const x0 = Math.max(0, Math.round((bx.l - cv.x) * sx) - 6), x1 = Math.min(img.width - 1, Math.round((bx.r - cv.x) * sx) + 4);
    // ⚠ THE PAGE's BLACK, NOT A SAMPLE: card 1's tube touches the canvas's left edge, so a sample at x0 read the tube
    // (237) and the search never started (first run, 15 October).
    const ground = 20;
    let le = x0; while (le < x1 && L(le, y) < ground + 40) le++;
    let re = x1; while (re > x0 && L(re, y) < ground + 40) re--;
    const left = [], right = [];
    for (let k = 0; k < 8; k++) { left.push(L(le + k, y)); right.push(L(re - k, y)); }
    return { le, re, width: re - le + 1, left, right };
  });
}, { s: shot.toString("base64"), boxes, cv });
res.forEach((r, i) => console.log(`card ${i + 1}: tube edges at screen px ${r.le} … ${r.re} (width ${r.width})  LEFT ${r.left.map((v) => String(v).padStart(3)).join(" ")} | RIGHT ${r.right.map((v) => String(v).padStart(3)).join(" ")}  ${r.left.every((v, k) => Math.abs(v - r.right[k]) <= 6) ? "≈ mirror ✅" : "≠ ⛔"}`));
const widths = new Set(res.map((r) => r.width));
console.log(widths.size === 1 ? `✅ all five cards ${[...widths][0]} screen px wide` : `⛔ widths differ: ${[...widths].join(", ")}`);
await b.close();
console.log("⚠ NOT WATCHED: Carl's GPU and Chrome; top vs bottom; ≈ allows ±6 levels (the top-left key lights the two sides differently by design).");
