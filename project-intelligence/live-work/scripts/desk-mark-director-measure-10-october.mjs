/** THE LIGHT, DIRECTED — MEASURED (10 October 2026). The journey held at 41 points (?markfall=0..1), each shot with the
 *  director ON and OFF (?markdirect=0), in the view it is seen from (§2 after Roles up to 0.875; §3 for the drop), plus
 *  ?mark=0 in each view for the mask. Per frame: the mark's pixels (differ from the no-mark frame), their MEAN luminance
 *  and the share BRIGHTER than 90/255. ⚠ The mask is "pixels that changed" — a dark mark over a dark ground may be
 *  under-counted; NOT WATCHED: Carl's Chrome; anything between the held points. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const out = "project-intelligence/live-work/screenshots/desk-mark-director-10-october";
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport: { width: 1412, height: 700 } })).newPage();
const shoot = async (q, view, name) => {
  await p.goto(`http://localhost:3000/about?marktie=0&${q}`, { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  await p.getByRole("link", { name: "Roles", exact: true }).first().click();
  await p.waitForTimeout(1600);
  if (view === "examples") { await p.evaluate(() => document.getElementById("examples").scrollIntoView()); await p.waitForTimeout(700); }
  await p.screenshot({ path: `${out}/${name}.png` });
};
await shoot("mark=0", "roles", "bg-roles");
await shoot("mark=0", "examples", "bg-examples");
for (let i = 0; i <= 40; i++) {
  const f = (i / 40).toFixed(3), view = i / 40 <= 0.875 ? "roles" : "examples";
  await shoot(`markfall=${f}`, view, `on-${f}`);
  if (!process.argv.includes("--on-only")) await shoot(`markfall=${f}&markdirect=0`, view, `off-${f}`);
}
await b.close();
console.log("shot");
