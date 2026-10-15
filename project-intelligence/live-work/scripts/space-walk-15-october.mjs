/** THE WHOLE `/start` FLOW OVER A `?space=` TAKE, FILMED AS STILLS (15 October 2026, session 3). Carl: "go take a lot of
 *  screenshots of it, this thing aint static."
 *  /start at Carl's screen (1920 × 952, DPR 1): the opening → Begin → Q5…Q1 (card 1 picked, then Next step, by real clicks)
 *  → the completion → the client info (contact field). A screenshot every ~400 ms throughout, numbered, with the phase in
 *  the name; then a contact sheet per phase (frames 480 wide, 5 across).
 *  Usage: node …/space-walk-15-october.mjs <outDir> <query, e.g. space=2>
 *  ⚠ NOT WATCHED: Carl's GPU/Chrome; frames are as fast as Playwright gives (not every frame); hover; typing in the form. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
const [OUT, Q] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1920, height: 952 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const errs = [];
p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
let phase = "opening";
const frames = [];
let filming = true;
const film = (async () => {
  while (filming) {
    const png = await p.screenshot().catch(() => null);
    if (png) frames.push({ phase, png });
    await new Promise((r) => setTimeout(r, 400));
  }
})();
await p.goto("http://localhost:3000/start?" + Q, { waitUntil: "load" });
await p.waitForTimeout(9000);
await p.getByRole("button", { name: /begin/i }).click();
for (const q of [5, 4, 3, 2, 1]) {
  phase = `q${q}`;
  await p.locator(".enquiry-answer-grid").first().waitFor({ state: "visible", timeout: 30000 });
  await p.waitForTimeout(3500);
  const bx = await p.getByTestId("answer-card-hover-0").boundingBox();
  await p.mouse.click(bx.x + bx.width / 2, bx.y + bx.height / 2);
  await p.mouse.move(5, 5);
  await p.waitForTimeout(2500);
  const next = p.getByRole("button", { name: /next step/i }).first();
  const nb = await next.boundingBox();
  await p.mouse.click(nb.x + nb.width / 2, nb.y + nb.height / 2);
  await p.mouse.move(5, 5);
}
phase = "complete";
await p.waitForTimeout(9000);
phase = "client-info";
await p.waitForTimeout(6000);
filming = false;
await film;
await b.close();
const byPhase = {};
frames.forEach((f) => {
  (byPhase[f.phase] ??= []).push(f);
});
let k = 0;
for (const f of frames) await sharp(f.png).toFile(join(OUT, `${String(k++).padStart(3, "0")}-${f.phase}.png`));
for (const [ph, fs] of Object.entries(byPhase)) {
  const W = 480, H = Math.round((952 / 1920) * W), COLS = 5;
  const tiles = await Promise.all(fs.map((f) => sharp(f.png).resize(W, H).png().toBuffer()));
  await sharp({ create: { width: W * COLS, height: H * Math.ceil(tiles.length / COLS), channels: 3, background: "#000" } })
    .composite(tiles.map((input, i) => ({ input, left: (i % COLS) * W, top: Math.floor(i / COLS) * H })))
    .jpeg({ quality: 85 })
    .toFile(join(OUT, `sheet-${ph}.jpg`));
}
console.log(`${frames.length} frames:`, Object.entries(byPhase).map(([ph, fs]) => `${ph} ${fs.length}`).join(" · "));
console.log("console errors:", errs.length, errs.slice(0, 3));
console.log("⚠ NOT WATCHED: Carl's GPU/Chrome; not every frame; hover; typing. →", OUT);
