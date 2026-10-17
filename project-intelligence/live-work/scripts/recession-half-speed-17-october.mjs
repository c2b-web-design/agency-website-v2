/** THE RECESSION AT HALF SPEED (17 October 2026; D-023). Carl: the heading's movement and the recession 900 → 1800 ms; the
 *  step grows with it (CORRIDOR_STEP_MS 1150 → 2050) so the next question waits for the lines to settle; the reveal untouched.
 *  /start at Carl's screen (1920 × 952, DPR 1): Begin → Q5…Q1 (card 1, Next step). From EVERY Next step press, an in-page
 *  rAF sampler records: the receding line's `bottom` and opacity (the phrase now at depth 1), the heading's font-size and
 *  opacity, `__arrivingEdgeAt` (the step's own edge), and the first frame the new question's text has width (its reveal).
 *  Per step: when the line and the heading stop moving, the arriving edge, the reveal, and any frame-to-frame JUMP larger
 *  than the eased curve allows (a snap). The Q1 → complete step is reported separately (its hold is 900 ms, unchanged).
 *  Usage: node …/recession-half-speed-17-october.mjs
 *  ⚠ NOT WATCHED: phones; reduced motion; Carl's GPU/Chrome. */
import { chromium } from "playwright";

const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1920, height: 952 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const errs = [];
p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
await p.goto("http://localhost:3000/start", { waitUntil: "load" });
await p.waitForTimeout(9000);
await p.getByRole("button", { name: /begin/i }).click();
await p.mouse.move(5, 5);
await p.evaluate(() => {
  window.__rs = [];
  window.__step = (q) => {
    const t0 = performance.now();
    const rows = [];
    window.__rs.push({ q, rows });
    const tick = () => {
      const t = performance.now() - t0;
      const line = document.querySelector(".enquiry-pdepth-1 .enquiry-phrase-travel");
      const h = document.querySelector(".enquiry-heading");
      const act = document.querySelector(".enquiry-pdepth-0 .enquiry-phrase-question");
      const hs = getComputedStyle(h);
      rows.push({
        t: Math.round(t),
        lb: line ? parseFloat(getComputedStyle(line).bottom) : null,
        lo: line ? +getComputedStyle(line).opacity : null,
        hf: parseFloat(hs.fontSize), ho: +hs.opacity,
        edge: window.__arrivingEdgeAt ? Math.round(window.__arrivingEdgeAt - t0) : null,
        aw: act ? act.getBoundingClientRect().width : 0, aq: act?.textContent ?? "",
      });
      if (t < 3600) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
});
for (const q of [5, 4, 3, 2, 1]) {
  await p.waitForTimeout(q === 5 ? 7000 : 6000);
  const bx = await p.getByTestId("answer-card-hover-0").boundingBox();
  await p.mouse.click(bx.x + bx.width / 2, bx.y + bx.height / 2);
  await p.mouse.move(5, 5);
  await p.waitForTimeout(2500);
  const nb = await p.getByRole("button", { name: /next step/i }).first().boundingBox();
  await p.evaluate((q) => window.__step(q), q);
  await p.mouse.click(nb.x + nb.width / 2, nb.y + nb.height / 2);
  await p.mouse.move(5, 5);
}
await p.waitForTimeout(4000);
const steps = await p.evaluate(() => window.__rs);
await b.close();

const stopAt = (rows, k) => {
  // the last frame on which the value changed by more than a hair
  let last = 0;
  for (let i = 1; i < rows.length; i++) if (rows[i][k] !== null && rows[i - 1][k] !== null && Math.abs(rows[i][k] - rows[i - 1][k]) > 0.01) last = rows[i].t;
  return last;
};
const maxJump = (rows, k, until) => {
  let m = 0, at = 0;
  for (let i = 1; i < rows.length && rows[i].t <= until; i++) {
    if (rows[i][k] === null || rows[i - 1][k] === null) continue;
    const d = Math.abs(rows[i][k] - rows[i - 1][k]);
    if (d > m) { m = d; at = rows[i].t; }
  }
  return `${m.toFixed(2)} @${at}ms`;
};
for (const { q, rows } of steps) {
  const edge = rows.find((r) => r.edge !== null && r.edge >= 0)?.edge ?? "—";
  const first = rows.find((r) => r.aw > 0 && !r.aq.includes(rows[0].aq || "∅") && r.t > 50);
  console.log(`\nQ${q} → ${q > 1 ? `Q${q - 1}` : "complete"} (${rows.length} frames)`);
  console.log(`  receding line: moving until ${stopAt(rows, "lb")} ms · opacity until ${stopAt(rows, "lo")} ms · largest per-frame bottom jump ${maxJump(rows, "lb", 3600)}px`);
  console.log(`  heading: font moving until ${stopAt(rows, "hf")} ms · opacity until ${stopAt(rows, "ho")} ms · largest font jump ${maxJump(rows, "hf", 3600)}px · largest opacity jump ${maxJump(rows, "ho", 3600)}`);
  console.log(`  arriving edge ${edge} ms · next question text first has width at ${first ? first.t + " ms" : "—"}`);
  const sample = rows.filter((_, i) => i % 15 === 0).map((r) => `${r.t}: b ${r.lb?.toFixed(0)} o ${r.lo?.toFixed(2)} hf ${r.hf.toFixed(1)} ho ${r.ho.toFixed(3)}`);
  console.log("  " + sample.join("  ·  "));
}
console.log("\nconsole errors:", errs.length, errs.slice(0, 2));
console.log("⚠ NOT WATCHED: phones; reduced motion; Carl's GPU/Chrome.");
