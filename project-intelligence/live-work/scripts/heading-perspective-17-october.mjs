/** THE HEADING'S OPACITY ON THE CORRIDOR'S LADDER, AND ITS STEPS ON THE LINES' TIMING (17 October 2026; D-023). Carl:
 *  "the heading much match the rules of perspective weve set with its opacity."
 *  /start at Carl's screen (1920 × 952, DPR 1): Begin → Q5…Q1 answered (card 1, Next step). An in-page rAF sampler runs
 *  from the first Next step to 4 s after the last: the heading's depth class, opacity, font-size, and the opacity of the
 *  corridor line at the SAME depth. Prints each settled step (heading dN vs line depth N), whether a d6 frame is ever
 *  visible before the completion fade, and the heading's opacity curve through one later step (eased vs linear check).
 *  Usage: node …/heading-perspective-17-october.mjs
 *  ⚠ NOT WATCHED: phones (their own heading values, mastering); reduced motion; Carl's GPU/Chrome. */
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
  window.__hp = [];
  let on = false;
  document.addEventListener("pointerdown", () => {
    if (on) return;
    on = true;
    const t0 = performance.now();
    const tick = () => {
      const h = document.querySelector(".enquiry-heading");
      const s = getComputedStyle(h);
      const d = +(/enquiry-heading-d(\d)/.exec(h.className)?.[1] ?? 0);
      const line = document.querySelector(`.enquiry-pdepth-${d} .enquiry-phrase-travel`);
      window.__hp.push({
        t: Math.round(performance.now() - t0), d, o: +s.opacity, fs: parseFloat(s.fontSize),
        moving: /deepening|travelling/.test(h.className), complete: /complete/.test(h.className),
        line: line ? +getComputedStyle(line).opacity : null,
        L: [1, 2, 3, 4, 5].map((n) => { const e = document.querySelector(`.enquiry-pdepth-${n} .enquiry-phrase-travel`); return e ? +getComputedStyle(e).opacity : null; }),
      });
      if (!window.__hpStop) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, { capture: true });
});
for (const q of [5, 4, 3, 2, 1]) {
  await p.waitForTimeout(q === 5 ? 7000 : 5000);
  const bx = await p.getByTestId("answer-card-hover-0").boundingBox();
  await p.mouse.click(bx.x + bx.width / 2, bx.y + bx.height / 2);
  await p.mouse.move(5, 5);
  await p.waitForTimeout(2500);
  const nb = await p.getByRole("button", { name: /next step/i }).first().boundingBox();
  await p.mouse.click(nb.x + nb.width / 2, nb.y + nb.height / 2);
  await p.mouse.move(5, 5);
}
await p.waitForTimeout(4000);
await p.evaluate(() => { window.__hpStop = true; });
const s = await p.evaluate(() => window.__hp);
await b.close();

// The last frame of each depth that is settled (not moving, not completing) — the resting state at that depth.
const rest = {};
for (const x of s) if (!x.moving && !x.complete && x.d) rest[x.d] = x;
// ⚠ No corridor line ever sits AT the heading's depth (it is always one rung below the deepest line), so the
// comparison is against the ladder's values — `.enquiry-pdepth-N .enquiry-phrase-travel` in globals.css, read off
// the page itself: each line's COMPUTED opacity at depth 1–5 while settled, not typed in. d6 has no rung (0.02, the ladder continued).
const ladder = {};
for (const x of s) if (!x.moving) x.L.forEach((o, i) => { if (o !== null) ladder[i + 1] = +o.toFixed(3); });
console.log("the corridor ladder as measured on the page (settled lines):", JSON.stringify(ladder));
console.log("settled: heading dN opacity vs the corridor ladder at depth N");
for (const [d, x] of Object.entries(rest))
  console.log(`  d${d}: heading ${x.o.toFixed(3)} (${x.fs}px)  ·  ladder ${ladder[d] ?? "— (no rung)"}  ${ladder[d] === undefined ? "" : Math.abs(x.o - ladder[d]) < 0.002 ? "✅ equal" : "❌ differ"}`);
const d6 = s.filter((x) => x.d === 6 && x.o > 0.005);
console.log(`d6 frames visible (opacity > 0.005): ${d6.length}` + (d6.length ? ` — max ${Math.max(...d6.map((x) => x.o)).toFixed(3)}, complete on them: ${d6.every((x) => x.complete)}` : ""));
// One later step, d2 → d3: the opacity curve should be LINEAR, font-size EASED.
const st = s.filter((x) => x.d === 3 && x.moving);
if (st.length) {
  const t0 = st[0].t;
  console.log("d2 → d3 step (ms: opacity / font):", st.filter((_, i) => i % 6 === 0).map((x) => `${x.t - t0}: ${x.o.toFixed(3)} / ${x.fs.toFixed(2)}`).join("  "));
}
console.log("console errors:", errs.length, errs.slice(0, 2));
console.log("⚠ NOT WATCHED: phones; reduced motion; Carl's GPU/Chrome.");
