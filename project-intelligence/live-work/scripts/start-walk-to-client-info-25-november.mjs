// THE WALK TO CLIENT INFO, AS A VISITOR (25 November 2026; Carl, on the `?skip=1` door's two dev issues: "There are no
// visible issues so it was just your shortcut to get there. Implement 1." — retire the door). READ-ONLY. /start from the
// top: Begin → Q5…Q1 (card 1, Next step: the 17 October walk, `logo-return-timing-17-october.mjs`) → client info. Then
// the Send button must exist (`.enquiry-send-btn`), and every console error / page error since load and the Next.js dev
// overlay's issue badge are reported. Screenshot of client info: argv[2] (a folder; optional).
// ⚠ NOT WATCHED: production (the overlay is dev-only); Carl's Chrome; answers other than card 1; phones.
import { chromium } from "playwright";
const OUT = process.argv[2];
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1920, height: 952 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const log = [];
p.on("console", (m) => { if (m.type() === "error") log.push(`[error] ${m.text().slice(0, 300)}`); });
p.on("pageerror", (e) => log.push(`[pageerror] ${String(e).slice(0, 300)}`));
const t0 = Date.now();
await p.goto("http://localhost:3000/start", { waitUntil: "load" });
await p.waitForTimeout(9000);
await p.getByRole("button", { name: /begin/i }).click();
await p.mouse.move(5, 5);
for (const q of [5, 4, 3, 2, 1]) {
  await p.waitForTimeout(q === 5 ? 7000 : 5000);
  const bx = await p.getByTestId("answer-card-hover-0").boundingBox();
  if (!bx) throw new Error(`Q${q}: answer card 1 not found — the walk did not reach Q${q}`);
  await p.mouse.click(bx.x + bx.width / 2, bx.y + bx.height / 2);
  await p.mouse.move(5, 5);
  await p.waitForTimeout(2500);
  const nb = await p.getByRole("button", { name: /next step/i }).first().boundingBox();
  if (!nb) throw new Error(`Q${q}: no Next step button after selecting card 1`);
  await p.mouse.click(nb.x + nb.width / 2, nb.y + nb.height / 2);
  await p.mouse.move(5, 5);
}
await p.waitForTimeout(12000);
const send = await p.locator(".enquiry-send-btn").count();
if (OUT) await p.screenshot({ path: `${OUT}/client-info-walked.png` });
const badge = await p.evaluate(() => {
  for (const el of document.querySelectorAll("nextjs-portal")) {
    const r = el.shadowRoot;
    const btn = r && [...r.querySelectorAll("button, [role=button]")].find((x) => /issue/i.test(x.getAttribute("aria-label") || "") || /issue/i.test(x.textContent || ""));
    if (btn) return (btn.textContent || btn.getAttribute("aria-label") || "").trim();
  }
  return null;
});
console.log(`reached client info: ${send > 0 ? "YES" : "NO"} (Send buttons: ${send}); walk ${Math.round((Date.now() - t0) / 1000)} s`);
console.log(`dev overlay issue badge: ${badge ?? "none"}`);
console.log(`console errors / page errors since load (${log.length}):${log.length ? "\n" + log.join("\n") : " none"}`);
console.log("⚠ NOT WATCHED: production; Carl's Chrome; answers other than card 1.");
await b.close();
if (!send) process.exit(1);
