/**
 * CA'S TEXT, PLAIN vs THE STATIC KEY/FILL BACK ON — 3 October 2026. Carl: "the text is dark, its barely legible."
 * Hypothesis: with the static key/fill OFF by default (D-090, `?lmglobal=1` restores them), CA's cool-white text
 * (#f2f4f7) is lit only by ambient 0.2 + the moving light (one lap = 40 s), so it reads only while the light is on CA.
 *
 * For each URL: top of /about, click Roles, crop CA's face every 6 s for one lap (42 s). Per crop: luminance of the
 * brightest 4% (the letters) vs the median (the face) — "contrast" = text / face. Inset well clear of the rim.
 * ⚠ NOT WATCHED: Carl's Chrome; CB/CD/CS; whether it READS — the crops are saved for that.
 *   node --no-warnings project-intelligence/live-work/scripts/ca-text-light-ab.mjs
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import sharp from "sharp";

const out = "project-intelligence/live-work/screenshots/ca-text-3-october";
mkdirSync(out, { recursive: true });
const lum = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

const run = async (query, tag) => {
  const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
  const ctx = await b.newContext({ viewport: { width: 1412, height: 700 }, deviceScaleFactor: 1.36 });
  const url = `http://localhost:3000/about${query}`;
  { const p = await ctx.newPage(); await p.goto(url, { waitUntil: "networkidle" }); await p.waitForTimeout(1500); await p.close(); }
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: "networkidle" });
  await p.waitForTimeout(3000);
  await p.getByRole("link", { name: "Roles", exact: true }).first().click();
  await p.waitForTimeout(800);
  const box = await p.evaluate(() => {
    const c = document.querySelector("#roles canvas").getBoundingClientRect();
    const x0 = 0.205, x1 = 0.395, y0 = 0.345, y1 = 0.535;
    return { x: c.left + x0 * c.width, y: c.top + y0 * c.height, width: (x1 - x0) * c.width, height: (y1 - y0) * c.height };
  });
  const t0 = Date.now();
  const rows = [];
  for (let s = 6; s <= 42; s += 6) {
    while (Date.now() - t0 < s * 1000) await p.waitForTimeout(50);
    const file = `${out}/${tag}-${String(s).padStart(2, "0")}s.png`;
    await p.screenshot({ path: file, clip: box });
    const { data } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const L = []; for (let i = 0; i < data.length; i += 3) L.push([lum(data[i], data[i + 1], data[i + 2]), data[i], data[i + 1], data[i + 2]]);
    L.sort((a, b) => b[0] - a[0]);
    const top = L.slice(0, Math.floor(L.length * 0.04));
    const tl = top.reduce((a, q) => a + q[0], 0) / top.length;
    const rgb = [1, 2, 3].map((k) => Math.round(top.reduce((a, q) => a + q[k], 0) / top.length));
    const face = L[Math.floor(L.length / 2)][0];
    rows.push(`${String(s).padStart(2)} s  letters L ${tl.toFixed(0).padStart(3)} rgb(${rgb.join(",")})  face L ${face.toFixed(0).padStart(3)}  contrast ${(tl / Math.max(1, face)).toFixed(2)}`);
  }
  await b.close();
  console.log(`\n── ${tag}  (${url})\n${rows.join("\n")}`);
};

await run("", "plain");
await run("?lmglobal=1", "lmglobal");
