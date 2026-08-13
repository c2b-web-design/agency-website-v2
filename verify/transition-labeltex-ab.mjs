/**
 * ⚠ DOES `?labeltex=` HELP THE CORRIDOR MOVE, OR ONLY THE REVEAL?
 *
 * Carl, 11 August 2026: *"Q5 looks good. Does that mean that Q4-1 wont be
 * affected?"* — the right question, and the two moments are NOT the same:
 *
 *   the REVEAL   mounts an answer canvas ONCE, in the opening
 *   the MOVE     mounts one and unmounts one on EVERY question step, four times
 *
 * ⚠⚠ AND THE LABEL WORK REACHES THEM DIFFERENTLY. The canvas cache cannot help
 * across questions at all — Q4's labels are different text, so a different key.
 * The RESOLUTION dial can, because every question's cards upload textures.
 * **Which of those dominates the move has never been measured.**
 *
 * ⚠ SEQUENTIAL RUNS OF `transition-cost.mjs` ARE NOT AN A/B. Running control
 * then arm measured 187ms vs 96ms on 11 August, which looks decisive — and the
 * canvas-cache arm produced an equally decisive-looking -22ms the same day that
 * **evaporated to +1ms and +13ms when repeated.** That was instrument fault #12:
 * a correct harness, correctly run, at too few rounds. This file exists so the
 * transition claim does not repeat it.
 *
 * Arms alternate within each round, rotate across rounds, fresh context per run.
 *
 *   npm run build && npx next start -p 3100
 *   VERIFY_BASE_URL=http://localhost:3100 node verify/transition-labeltex-ab.mjs 5
 */

import { chromium } from "@playwright/test";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3100";
const ROUNDS = Number(process.argv[2] ?? 5);

if (/:3000(\/|$)/.test(BASE)) {
  console.error("\n⚠⚠ REFUSING TO RUN AGAINST :3000 — dev frame cost is noise.\n");
  process.exit(1);
}

const ARMS = [
  { name: "control 2048", query: "" },
  { name: "1024", query: "?labeltex=1024" },
];

async function measureMove(browser, query) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${BASE}/start${query}`, { waitUntil: "networkidle" });

  await page.getByRole("button", { name: /begin/i }).click();

  // Cards must have arrived before a move means anything — the last rung is
  // +2890ms on the ladder's own clock, and the entrance runs past it.
  await page.locator(".enquiry-answer-grid").waitFor({ state: "visible", timeout: 30000 });
  await page.waitForTimeout(5200);

  // Select a card so `handleNextStep` is genuinely reachable. ⚠ THIS IS THE
  // REAL PATH NOW — selection was wired in step 1a, so unlike the older
  // harness's note this does not need to force a disabled control.
  await page.getByTestId("answer-card-hover-0").click();
  await page.waitForTimeout(700);

  await page.evaluate(() => {
    window.__tm = { frames: [] };
    const tick = () => {
      window.__tm.frames.push(performance.now());
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  const nextStep = page.getByRole("button", { name: /next step/i });
  await nextStep.click();
  // The move is 900ms eased; sample past its end.
  await page.waitForTimeout(1600);

  const worst = await page.evaluate(() => {
    const f = window.__tm.frames;
    let worst = 0;
    for (let i = 1; i < f.length; i++) worst = Math.max(worst, f[i] - f[i - 1]);
    return Math.round(worst);
  });

  await page.close();
  return worst;
}

const browser = await chromium.launch({
  headless: false,
  args: ["--enable-gpu", "--use-gl=angle", "--ignore-gpu-blocklist"],
});

const results = new Map(ARMS.map((a) => [a.name, []]));

console.log(`\nbase ${BASE} — ${ROUNDS} interleaved round(s), Q5→Q4\n`);

for (let round = 1; round <= ROUNDS; round++) {
  const order = ARMS.map((_, i) => ARMS[(i + round - 1) % ARMS.length]);
  for (const arm of order) {
    let worst;
    try {
      worst = await measureMove(browser, arm.query);
    } catch (err) {
      console.log(`  round ${round}  ${arm.name.padEnd(13)} FAILED — ${err.message.split("\n")[0]}`);
      continue;
    }
    results.get(arm.name).push(worst);
    console.log(`  round ${round}  ${arm.name.padEnd(13)} ${String(worst).padStart(4)}ms`);
  }
}

await browser.close();

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};

console.log("\n══════════════════════════════════════════════════");
console.log("  worst frame gap across the Q5→Q4 move — MEDIANS");
console.log("══════════════════════════════════════════════════");

const control = median(results.get("control 2048"));
for (const arm of ARMS) {
  const xs = results.get(arm.name);
  if (!xs.length) {
    console.log(`  ${arm.name.padEnd(13)}   no successful runs`);
    continue;
  }
  const m = median(xs);
  const tag = arm.name === ARMS[0].name ? "" : `  ${m - control >= 0 ? "+" : ""}${m - control}ms`;
  console.log(`  ${arm.name.padEnd(13)} ${String(m).padStart(4)}ms   [${xs.join(", ")}]${tag}`);
}

console.log("\n⚠ THE ~50ms VISIBLE THRESHOLD IS THE BAR, and it is a rough guide.");
console.log("  A move still above it after this arm means the RESTRUCTURE is still");
console.log("  the honest fix — the label work reduces the move, it does not");
console.log("  remove the context churn that causes it.");
console.log("\n⚠ AND THIS IS ONE STEP (Q5→Q4). A walk does it four times.");
