/** /start's LAST WHITE TEXTS TO ICE BLUE (17 October 2026; D-023). Carl: the nav links from Begin over the heading's 2.6 s;
 *  "Understood."; the client-info card headings; the Send pill's text.
 *  /start at Carl's screen (1920 × 952, DPR 1): the nav's first link colour in the opening, then every 200 ms for 3.2 s
 *  from Begin; a hover check (pointer on the link 300 ms, then off 300 ms — the 200 ms hover must survive); then Q5…Q1
 *  answered and, 5 s into completion, the computed colours of "Understood.", the field labels and the Send button, with a
 *  still. Usage: node …/start-ice-blue-texts-17-october.mjs <outDir>
 *  ⚠ NOT WATCHED: phones (the nav is hidden below md); Carl's GPU/Chrome. */
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
const navColour = () => p.evaluate(() => getComputedStyle(document.querySelector(".start-nav a")).color);
console.log("nav in the opening:", await navColour());
await p.getByRole("button", { name: /begin/i }).click();
const tb = Date.now();
const cs = [];
while (Date.now() - tb < 3200) { cs.push(`${Date.now() - tb}:${(await navColour()).replace(/rgb\(|\)| /g, "")}`); await p.waitForTimeout(200); }
console.log("nav from Begin (ms:r,g,b):", cs.join("  "));
const link = await p.locator(".start-nav a").first().boundingBox();
await p.mouse.move(link.x + link.width / 2, link.y + link.height / 2);
await p.waitForTimeout(300);
console.log("nav link hovered 300 ms:", await navColour());
await p.mouse.move(5, 5);
await p.waitForTimeout(300);
console.log("nav link 300 ms after leaving:", await navColour());
for (const q of [5, 4, 3, 2, 1]) {
  await p.waitForTimeout(q === 5 ? 4000 : 5000);
  const bx = await p.getByTestId("answer-card-hover-0").boundingBox();
  await p.mouse.click(bx.x + bx.width / 2, bx.y + bx.height / 2);
  await p.mouse.move(5, 5);
  await p.waitForTimeout(2500);
  const nb = await p.getByRole("button", { name: /next step/i }).first().boundingBox();
  await p.mouse.click(nb.x + nb.width / 2, nb.y + nb.height / 2);
  await p.mouse.move(5, 5);
}
await p.waitForTimeout(2050 + 5000);
writeFileSync(join(OUT, "completion+5s.png"), await p.screenshot());
const c = await p.evaluate(() => ({
  understood: getComputedStyle(document.querySelector(".enquiry-q5-question")).color,
  understoodSubtext: getComputedStyle(document.querySelector(".enquiry-q5-heading + p")).color,
  labels: [...document.querySelectorAll("label[for^='contact-field-']")].map((l) => `${l.textContent}: ${getComputedStyle(l).color}`),
  send: (() => { const s = document.querySelector(".enquiry-send-btn"); return s ? `${getComputedStyle(s).color}${s.disabled ? " (disabled)" : ""}` : "—"; })(),
  nav: getComputedStyle(document.querySelector(".start-nav a")).color,
}));
console.log("at completion +5 s:", JSON.stringify(c, null, 1));
console.log("target ice blue rgb(207, 230, 255) · console errors:", errs.length, errs.slice(0, 2));
await b.close();
console.log("⚠ NOT WATCHED: phones; Carl's GPU/Chrome. →", OUT);
