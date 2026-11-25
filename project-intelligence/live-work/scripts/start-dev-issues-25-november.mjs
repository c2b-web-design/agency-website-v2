// ⚰️ USES /start?skip=1, THE DEV DOOR RETIRED 25 NOVEMBER 2026: rerun as is, it lands on the OPENING and measures the wrong screen. Reach client info with verify/lib/walk-to-client-info.mjs.
// THE "2 ISSUES" ON /start's CLIENT INFO (25 November 2026; Carl: "Apparently there are two issue there ... Go investigate
// and report."). READ-ONLY. /start?skip=1 (the dev door to client info) on the dev server: every console error / warning
// and page error from load; after the entrance (12 s), the Next.js dev overlay's issue badge read, opened, and its panel's
// text dumped (it lives in a shadow root). Also /start from the top (no skip) for the same counts, to see whether the
// issues belong to the door. ⚠ NOT WATCHED: production (the overlay is dev-only); Carl's Chrome; phones.
import { chromium } from "playwright";
const OUT = process.argv[2];
const b = await chromium.launch({ channel: "chrome", headless: false, args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"] });
const deep = () => {
  const out = [];
  const walk = (n) => {
    if (!n) return;
    if (n.shadowRoot) walk(n.shadowRoot);
    for (const c of n.children || []) walk(c);
    if (n.nodeType === 1 && n.children.length === 0 && n.textContent.trim()) out.push(n.textContent.trim());
  };
  for (const el of document.querySelectorAll("nextjs-portal")) walk(el);
  return out;
};
for (const url of ["http://localhost:3000/start?skip=1", "http://localhost:3000/start"]) {
  const p = await (await b.newContext({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 2 })).newPage();
  const log = [];
  p.on("console", (m) => { if (["error", "warning"].includes(m.type())) log.push(`[${m.type()}] ${m.text().slice(0, 600)}`); });
  p.on("pageerror", (e) => log.push(`[pageerror] ${String(e).slice(0, 600)}`));
  await p.goto(url, { waitUntil: "load" });
  await p.waitForTimeout(12000);
  const tag = url.includes("skip") ? "skip" : "top";
  await p.screenshot({ path: `${OUT}/${tag}_page.png` });
  console.log(`\n===== ${url}\n-- console/page errors and warnings (${log.length}):\n${log.join("\n")}`);
  console.log(`-- overlay text before opening:\n${JSON.stringify(await p.evaluate(deep))}`);
  // open the issues panel: the badge's issue count button
  const opened = await p.evaluate(() => {
    for (const el of document.querySelectorAll("nextjs-portal")) {
      const r = el.shadowRoot;
      if (!r) continue;
      const btn = [...r.querySelectorAll("button, [role=button]")].find((x) => /issue/i.test(x.textContent || "") || /issue/i.test(x.getAttribute("aria-label") || ""));
      if (btn) { btn.click(); return (btn.getAttribute("aria-label") || btn.textContent || "").trim(); }
    }
    return null;
  });
  await p.waitForTimeout(1500);
  console.log(`-- clicked: ${opened}`);
  await p.screenshot({ path: `${OUT}/${tag}_overlay.png` });
  console.log(`-- overlay text after opening:\n${(await p.evaluate(deep)).join("\n").slice(0, 6000)}`);
  // step through further issues if there is a "next" control
  for (let k = 0; k < 3; k++) {
    const moved = await p.evaluate(() => {
      for (const el of document.querySelectorAll("nextjs-portal")) {
        const btn = el.shadowRoot && [...el.shadowRoot.querySelectorAll("button")].find((x) => /next/i.test(x.getAttribute("aria-label") || ""));
        if (btn && !btn.disabled) { btn.click(); return true; }
      }
      return false;
    });
    if (!moved) break;
    await p.waitForTimeout(800);
    await p.screenshot({ path: `${OUT}/${tag}_overlay_${k + 2}.png` });
    console.log(`-- next issue (${k + 2}):\n${(await p.evaluate(deep)).join("\n").slice(0, 6000)}`);
  }
  await p.context().close();
}
await b.close();
