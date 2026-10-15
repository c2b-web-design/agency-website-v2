/** THE CARDS IN THE STUDIO — a sweep (D-051, 15 October 2026). For each take (a query string on /start, Q5, DPR 2): card 1's
 *  face at its MIDDLE (25% across, the band above the words) and its END (6–14 css px in from the left end, vertical centre —
 *  where Carl sees the geometry lost), the END/MID ratio, the rim's peak (top edge, 25% across), and a crop of card 1 + the grid.
 *  Usage: node …/card-env-sweep-15-october.mjs <outDir> "name=query" …
 *  ⚠ NOT WATCHED: cards 2–5 (frames only); hover; selection; the opening's cost (a separate measure); Carl's display. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
const [OUT, ...takes] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })).newPage();
const mean = async (clip, peak = false) => p.evaluate(async ({ s, peak }) => {
  const img = new Image(); img.src = "data:image/png;base64," + s; await img.decode();
  const cv = document.createElement("canvas"); cv.width = img.width; cv.height = img.height;
  const x = cv.getContext("2d"); x.drawImage(img, 0, 0); const d = x.getImageData(0, 0, cv.width, cv.height).data;
  let sum = 0, mx = 0; for (let i = 0; i < d.length; i += 4) { const L = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]; sum += L; mx = Math.max(mx, L); }
  return peak ? mx : sum / (d.length / 4);
}, { s: (await p.screenshot({ clip })).toString("base64"), peak });
for (const t of takes) {
  const [name, q] = t.split(/=(.*)/s);
  await p.goto("http://localhost:3000/start?" + q, { waitUntil: "load" });
  await p.waitForTimeout(8000);
  await p.getByRole("button", { name: /begin/i }).click();
  await p.locator(".enquiry-answer-grid").waitFor({ state: "visible", timeout: 30000 });
  await p.mouse.move(5, 5);
  await p.waitForTimeout(4500);
  const c = await p.getByTestId("answer-card-hover-0").boundingBox();
  const mid = await mean({ x: c.x + c.width * 0.25 - 10, y: c.y + c.height * 0.5 - 13, width: 20, height: 4 });
  const end = await mean({ x: c.x + 6, y: c.y + c.height / 2 - 2, width: 8, height: 4 });
  const rim = await mean({ x: c.x + c.width * 0.25 - 10, y: c.y - 2, width: 20, height: 8 }, true);
  await p.screenshot({ path: join(OUT, `${name}_card1.png`), clip: { x: c.x - 10, y: c.y - 10, width: c.width + 20, height: c.height + 20 } });
  const g = await p.locator(".enquiry-answer-grid").boundingBox();
  await p.screenshot({ path: join(OUT, `${name}_grid.png`), clip: { x: g.x - 24, y: g.y - 24, width: g.width + 48, height: g.height + 48 } });
  console.log(`${name.padEnd(18)} MID ${mid.toFixed(1).padStart(6)}  END ${end.toFixed(1).padStart(6)}  END/MID ${(end / mid).toFixed(2)}  rim peak ${rim.toFixed(0).padStart(4)}   (${q || "as shipped"})`);
}
await b.close();
console.log("⚠ NOT WATCHED: cards 2–5 (frames only); hover; selection; the opening's cost; Carl's display.");
