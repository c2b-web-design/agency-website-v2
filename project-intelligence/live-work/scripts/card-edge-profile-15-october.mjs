/** THE CARD's EDGES — where the geometry is "lost" (15 October 2026; Carl: "At the edges, especially the sides, it seems that
 *  some of the geometry is lost. This was worse at one point as the face appeared disconnected from the rim.").
 *  /start at Q5, card 1 at rest, DPR 3. Two luminance profiles (Rec. 709 on sRGB 0–255, as `face-drivers.mjs` reports):
 *    SIDE — a row through the card's vertical centre, from outside the left rim to 30% of the width in;
 *    TOP  — a column at the card's horizontal quarter (clear of the words), from outside the top rim to the centre.
 *  Each printed every device pixel as a value, so the rim, the bevel and the face can be read off by where they change.
 *  Also writes the card at DPR 3 and a 3× crop of its left end.
 *  ⚠ NOT WATCHED: the other cards (card 1 only); hover; selection; Carl's display. Bounds from the hover box, not the mesh. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
const OUT = process.argv[2];
const Q = process.argv[3] ?? "";
mkdirSync(OUT, { recursive: true });
const DPR = 3;
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: DPR })).newPage();
await p.goto("http://localhost:3000/start" + Q, { waitUntil: "load" });
await p.waitForTimeout(9000);
await p.getByRole("button", { name: /begin/i }).click();
await p.locator(".enquiry-answer-grid").waitFor({ state: "visible", timeout: 30000 });
await p.mouse.move(5, 5);
await p.waitForTimeout(5000);
const c = await p.getByTestId("answer-card-hover-0").boundingBox();
const m = 10;
const clip = { x: c.x - m, y: c.y - m, width: c.width + 2 * m, height: c.height + 2 * m };
const png = await p.screenshot({ path: join(OUT, "card1.png"), clip });
await p.screenshot({ path: join(OUT, "card1-left-end.png"), clip: { x: c.x - m, y: c.y - m, width: 50, height: c.height + 2 * m } });
const prof = await p.evaluate(async ({ b64, m, w, h, DPR }) => {
  const img = new Image(); img.src = "data:image/png;base64," + b64; await img.decode();
  const cv = document.createElement("canvas"); cv.width = img.width; cv.height = img.height;
  const g = cv.getContext("2d"); g.drawImage(img, 0, 0);
  const lum = (x, y) => { const d = g.getImageData(x, y, 1, 1).data; return 0.2126 * d[0] + 0.7152 * d[1] + 0.0722 * d[2]; };
  const cy = Math.round((m + h / 2) * DPR), side = [];
  for (let x = 0; x < Math.round((m + w * 0.3) * DPR); x++) side.push(Math.round(lum(x, cy)));
  const qx = Math.round((m + w * 0.25) * DPR), top = [];
  for (let y = 0; y < Math.round((m + h / 2) * DPR); y++) top.push(Math.round(lum(qx, y)));
  return { side, top };
}, { b64: png.toString("base64"), m, w: c.width, h: c.height, DPR });
const show = (name, a) => { console.log(`${name} (device px from outside the rim, ${DPR}/css px):`); for (let i = 0; i < a.length; i += 16) console.log("  " + String(i).padStart(3) + ": " + a.slice(i, i + 16).map((v) => String(v).padStart(3)).join(" ")); };
show("SIDE — row through the vertical centre", prof.side);
show("TOP — column at 25% of the width", prof.top);
console.log(`card 1 hover box ${c.width.toFixed(1)} × ${c.height.toFixed(1)} css → ${OUT}`);
await b.close();
console.log("⚠ NOT WATCHED: cards 2–5; hover; selection; Carl's display.");
