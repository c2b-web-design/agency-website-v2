/** THE ANSWERED LINES, PLATINUM BLUE (17 October 2026; D-023 chunk 3). Carl: "The previous qustion should be brand
 *  platinum blue. the answer that comes with it should be a slightly lighter shade of that blue" — and the gold Q
 *  number its question's shade. /start at Carl's screen (1920 × 952, DPR 1): Begin → Q5…Q2 answered (card 1, Next
 *  step) → Q1 settled, the frame of Carl's screenshot. Prints each depth's COMPUTED colours and travel opacity.
 *  Usage: node …/answered-lines-platinum-17-october.mjs <outDir>
 *  ⚠ NOT WATCHED: how far lines "register" (Carl's eye); mid-transition frames; Carl's GPU/Chrome. */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [OUT] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1920, height: 952 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const errs = [];
p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
await p.goto("http://localhost:3000/start", { waitUntil: "load" });
await p.waitForTimeout(9000);
await p.getByRole("button", { name: /begin/i }).click();
await p.mouse.move(5, 5);
for (const q of [5, 4, 3, 2]) {
  await p.waitForTimeout(q === 5 ? 7000 : 5000);
  const bx = await p.getByTestId("answer-card-hover-0").boundingBox();
  await p.mouse.click(bx.x + bx.width / 2, bx.y + bx.height / 2);
  await p.mouse.move(5, 5);
  await p.waitForTimeout(2500);
  const nb = await p.getByRole("button", { name: /next step/i }).first().boundingBox();
  await p.mouse.click(nb.x + nb.width / 2, nb.y + nb.height / 2);
  await p.mouse.move(5, 5);
}
await p.waitForTimeout(6000);
writeFileSync(join(OUT, "q1.png"), await p.screenshot());
const rows = await p.evaluate(() =>
  [0, 1, 2, 3, 4].map((d) => {
    const r = document.querySelector(`.enquiry-pdepth-${d}`);
    if (!r) return `depth ${d}: —`;
    const c = (s) => { const e = r.querySelector(s); return e ? getComputedStyle(e).color : "—"; };
    const t = r.querySelector(".enquiry-phrase-travel");
    return `depth ${d}: Q# ${c(".enquiry-phrase-cue")}  question ${c(".enquiry-phrase-question")}  answer ${c(".enquiry-phrase-answers")}  opacity ${t ? getComputedStyle(t).opacity : "—"}`;
  }),
);
rows.forEach((r) => console.log(r));
console.log("console errors:", errs.length, errs.slice(0, 2));
await b.close();
console.log("⚠ NOT WATCHED: Carl's eye on how far lines register; mid-transition; Carl's GPU/Chrome. →", OUT);
