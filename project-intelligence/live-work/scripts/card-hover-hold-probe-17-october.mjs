/** Does the hover box keep :hover with the pointer still? (17 October 2026) — the platinum hover read back to ice
 *  ~0.5 s after the pointer arrived and stayed still. Samples :hover on answer-card-hover-0 and the element under the
 *  pointer every 250 ms for 3 s, with NO screenshots taken. Usage: node …/card-hover-hold-probe-17-october.mjs
 *  ⚠ NOT WATCHED: uHover itself (React state, not in the DOM). */
import { chromium } from "playwright";
const AFTER_BEGIN = Number(process.argv[2] ?? 7000); // ms from the Begin click to the hover
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1920, height: 952 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto("http://localhost:3000/start", { waitUntil: "load" });
await p.waitForTimeout(9000);
await p.getByRole("button", { name: /begin/i }).click();
await p.mouse.move(5, 5);
await p.waitForTimeout(AFTER_BEGIN);
const tStart = await p.evaluate(() => Math.round(performance.now()));
const hb = await p.getByTestId("answer-card-hover-0").boundingBox();
const x = hb.x + hb.width / 2, y = hb.y + hb.height / 2;
await p.evaluate(() => {
  window.__ev = [];
  const el = document.querySelector('[data-testid="answer-card-hover-0"]');
  for (const t of ["pointerenter", "pointerleave", "pointerover", "pointerout"]) el.addEventListener(t, () => window.__ev.push(`${Math.round(performance.now())} ${t}`));
});
await p.mouse.move(x, y);
for (let i = 0; i < 12; i++) {
  const s = await p.evaluate(([x, y]) => {
    const el = document.querySelector('[data-testid="answer-card-hover-0"]');
    const top = document.elementFromPoint(x, y);
    return `${el.matches(":hover") ? "HOVER" : "-----"} top=${top?.tagName}.${(top?.className || "").toString().slice(0, 40)} testid=${top?.dataset?.testid ?? ""}`;
  }, [x, y]);
  console.log(`${(i * 0.25).toFixed(2)}s ${s}`);
  await p.waitForTimeout(250);
}
console.log("pointer moved at ~", tStart, "· events:", await p.evaluate(() => window.__ev));
await b.close();
