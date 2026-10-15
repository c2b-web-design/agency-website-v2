/** THE GREY LINE UNDER THE TUBE (15 October 2026; Carl at 100%: "Whats that grey line undeneath the glass tube as it comes
 *  out of the corner?"). /start Q5, DPR 1: card 1's top-left 40 × 30 px enlarged 12× NEAREST (every pixel a block), and
 *  luminance COLUMNS from 4 px above the card down 14 px, at 16, 24 and 40 px in from the left — the tube's top run just
 *  out of the corner. Arms by query string so the source can be isolated.
 *  Usage: node …/card-topleft-probe-15-october.mjs <outDir> "name=query" …   ⚠ NOT WATCHED: Carl's GPU and Chrome. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
const [OUT, ...arms] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
for (const a of arms) {
  const [name, q] = a.split(/=(.*)/s);
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })).newPage();
  await p.goto("http://localhost:3000/start?" + q, { waitUntil: "load" });
  await p.waitForTimeout(9000);
  await p.getByRole("button", { name: /begin/i }).click();
  await p.locator(".enquiry-answer-grid").waitFor({ state: "visible", timeout: 30000 });
  await p.mouse.move(5, 5);
  await p.waitForTimeout(5000);
  const c = await p.getByTestId("answer-card-hover-0").boundingBox();
  const x0 = Math.floor(c.x) - 4, y0 = Math.floor(c.y) - 4;
  const png = await p.screenshot({ clip: { x: x0, y: y0, width: 44, height: 34 } });
  await sharp(png).resize(44 * 12, 34 * 12, { kernel: "nearest" }).toFile(join(OUT, `${name}_topleft-12x.png`));
  const cols = await p.evaluate(async (s) => {
    const img = new Image(); img.src = "data:image/png;base64," + s; await img.decode();
    const cv = document.createElement("canvas"); cv.width = img.width; cv.height = img.height; const g = cv.getContext("2d"); g.drawImage(img, 0, 0);
    const L = (x, y) => { const d = g.getImageData(x, y, 1, 1).data; return Math.round(0.2126 * d[0] + 0.7152 * d[1] + 0.0722 * d[2]); };
    return [20, 28, 40].map((x) => ({ x: x - 4, v: Array.from({ length: 18 }, (_, y) => L(x, y)) }));
  }, png.toString("base64"));
  console.log(`${name} (${q || "default"}):`);
  for (const col of cols) console.log(`  ${String(col.x).padStart(2)} px in, rows from 4 above the card: ${col.v.map((v) => String(v).padStart(3)).join(" ")}`);
  await p.context().close();
}
await b.close();
