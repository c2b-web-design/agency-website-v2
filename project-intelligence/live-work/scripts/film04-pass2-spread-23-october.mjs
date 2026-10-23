/** FILM 04 PASS 2, STEP 4 — THE REFLECTION WIDENED (23 October 2026). Carl: "the C O and M is the look we want. The
 *  reflection should also reach the left and right sides but without blowing out the centre." Target: the MIDDLE fifth at
 *  take 3's C-O-M level (39.3), the ends as close to it as possible. The face's roughness (wider, flatter reflection) ×
 *  its strength (the level), at the studio's 305°, perspective front; bands as `film04-pass2-balance-23-october.mjs`.
 *  Also: the share of the letters' pixels at ≥ 250 (blown). ⚠ Roughness > 0.5 clips the grain's doubled roughness at 1.
 *    node …/film04-pass2-spread-23-october.mjs <base>
 *  ⚠ NOT WATCHED: how it looks; the brushing's character at higher roughness (Carl's eye). */
import { chromium } from "playwright";
import sharp from "sharp";
const [BASE = "http://localhost:3000"] = process.argv.slice(2);
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 })).newPage();
const X0 = 266, X1 = 1565, Y0 = 254, Y1 = 420; // the letters' extent, measured by the balance script at this framing
const bands = [[0, 0.2], [0.4, 0.6], [0.8, 1]].map(([a, c]) => [X0 + a * (X1 - X0), X0 + c * (X1 - X0)]);
const rows = [];
for (const r of [0.35, 0.45, 0.55, 0.65, 0.8])
  for (const s of [0.1, 0.13, 0.16, 0.2, 0.25]) {
    await p.goto(`${BASE}/proto/showcase?layout=line&mode=material&view=front&yaw=305&froughness=${r}&strength=${s}`, { waitUntil: "networkidle" });
    await p.waitForFunction(() => window.__showcaseBench?.ready, null, { timeout: 60000 });
    await p.addStyleTag({ content: "nextjs-portal{display:none!important}" });
    await p.waitForTimeout(500);
    const { data, info } = await sharp(await p.screenshot({ clip: await p.locator("canvas").first().boundingBox() })).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const W = info.width;
    const m = bands.map(([a, c]) => { let sum = 0, n = 0; for (let y = Y0; y <= Y1; y++) for (let x = Math.floor(a); x < c; x++) { const i = (y * W + x) * 3; sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]; n++; } return sum / n; });
    let lit = 0, blown = 0;
    for (let y = Y0; y <= Y1; y++) for (let x = X0; x <= X1; x++) { const i = (y * W + x) * 3; const mx = Math.max(data[i], data[i + 1], data[i + 2]); if (mx > 30) { lit++; if (mx >= 250) blown++; } }
    rows.push({ r, s, l: m[0], mid: m[1], rt: m[2], blown: (100 * blown) / lit });
    console.log(`roughness ${r} strength ${s}: L ${m[0].toFixed(1)} · M ${m[1].toFixed(1)} · R ${m[2].toFixed(1)} · ends/middle ${(Math.min(m[0], m[2]) / m[1]).toFixed(2)} · blown ${((100 * blown) / lit).toFixed(1)}%`);
  }
const near = rows.filter((q) => Math.abs(q.mid - 39.3) <= 4 && q.blown < 1).sort((a, b) => Math.min(b.l, b.rt) / b.mid - Math.min(a.l, a.rt) / a.mid);
console.log("MIDDLE AT C-O-M LEVEL (39.3 ± 4), < 1% blown, the evenest first:", near.slice(0, 5).map((q) => `r ${q.r} s ${q.s} (L ${q.l.toFixed(1)} M ${q.mid.toFixed(1)} R ${q.rt.toFixed(1)}, ${(Math.min(q.l, q.rt) / q.mid).toFixed(2)})`).join(" | ") || "none");
await b.close();
