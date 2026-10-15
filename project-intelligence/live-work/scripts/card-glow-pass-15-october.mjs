/** ONE PASS OF THE CARDS' WARMTH ON `Next step`, LEFT RUNNING FOR CARL TO WATCH LIVE (15 October 2026, session 3).
 *  Carl: "On some passes it had no effect. Do the passes one by one and i will let you know. How many cards and which ones."
 *  (The stills could not judge it: the light lands on the pill's top and back edges, and only the ROLL shows it.)
 *  /start at Carl's screen (1920 × 952, DPR 1), Q5, the named cards selected, the pointer away so the button ROLLS; a label
 *  top left says which cards and whether the warmth is on. The window stays open HOLD_S seconds (default 900) or until killed.
 *  Usage: node …/card-glow-pass-15-october.mjs "<label>" "<card indices, e.g. 3 or 0,1,2,3,4>" [query, e.g. cardglow=0]
 *  Cards at Q5: 0 Premium new website · 1 Current site feels dated · 2 Better quality enquiries · 3 Less manual admin ·
 *  4 Not sure yet. ⚠ NOT WATCHED: anything — this is for Carl's eye. */
import { chromium } from "playwright";
const [LABEL, CARDS, Q = ""] = process.argv.slice(2);
const sel = CARDS.split(",").map(Number);
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist", "--window-size=1940,1080"] });
const ctx = await b.newContext({ viewport: { width: 1920, height: 952 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto("http://localhost:3000/start" + (Q ? "?" + Q : ""), { waitUntil: "load" });
await p.waitForTimeout(9000);
await p.getByRole("button", { name: /begin/i }).click();
await p.locator(".enquiry-answer-grid").waitFor({ state: "visible", timeout: 30000 });
await p.mouse.move(5, 5);
await p.waitForTimeout(3000);
for (const i of sel) {
  const bx = await p.getByTestId(`answer-card-hover-${i}`).boundingBox();
  await p.mouse.click(bx.x + bx.width / 2, bx.y + bx.height / 2);
  await p.waitForTimeout(150);
}
await p.mouse.move(5, 5);
await p.evaluate((t) => {
  const d = document.createElement("div");
  d.textContent = t;
  Object.assign(d.style, { position: "fixed", left: "16px", top: "16px", zIndex: 99999, font: "600 18px system-ui", color: "#fff", background: "rgba(0,0,0,.7)", padding: "8px 12px", borderRadius: "6px", pointerEvents: "none" });
  document.body.appendChild(d);
}, LABEL);
console.log("running:", LABEL);
await p.waitForTimeout((Number(process.env.HOLD_S) || 900) * 1000);
await b.close();
