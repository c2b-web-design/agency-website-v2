/**
 * Build `public/fonts/geist-regular.typeface.json` — Geist Regular in the
 * typeface format three's `FontLoader` / `TextGeometry` extrude from. D-094.
 *
 *   node scripts/build-geist-typeface.mjs <path/to/Geist-Regular.ttf>
 *
 * ⚠ SOURCE: Google Fonts' static Geist 400 TTF, the same family `next/font/google`
 * serves the site (as woff2). Fetched 24 September 2026 from
 *   https://fonts.gstatic.com/s/geist/v5/gyBhhwUxId8gMGYQMKR3pzfaWI_RnOM4nQ.ttf
 * (the URL the Google Fonts CSS API returns for `family=Geist:wght@400` to a
 * non-woff2 client). Geist is © Vercel, SIL Open Font License 1.1 — the licence
 * travels with the font's own name table, which is kept in the output's
 * `original_font_information`.
 *
 * ⚠ WHY A CONVERTED FILE AND NOT THE SITE'S WOFF2: three extrudes from glyph
 * OUTLINES, and there is no woff2 decoder in this project. `opentype.js`
 * (already installed, inside `three-stdlib`) reads TTF.
 *
 * ⚠ SUBSET: only the characters the /about card copy uses, plus printable ASCII,
 * so an edit to the copy rarely needs a rebuild. ⛔ If a new character is added to
 * `components/about/about-card-copy.ts` that is not here, `card-extrude.tsx` logs
 * it loudly and the glyph is missing — re-run this script.
 */
import fs from "node:fs";
import { TTFLoader } from "three-stdlib";

const src = process.argv[2];
if (!src || !fs.existsSync(src)) {
  console.error("usage: node scripts/build-geist-typeface.mjs <Geist-Regular.ttf>");
  process.exit(2);
}

const buf = fs.readFileSync(src);
const json = new TTFLoader().parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));

const copy = fs.readFileSync("components/about/about-card-copy.ts", "utf8");
const bodies = [...copy.matchAll(/body: "([^"]*)"/g)].map((m) => m[1]).join("");
const keep = new Set([...bodies]);
for (let c = 32; c < 127; c++) keep.add(String.fromCharCode(c));

const missing = [...keep].filter((c) => !json.glyphs[c]);
json.glyphs = Object.fromEntries(Object.entries(json.glyphs).filter(([c]) => keep.has(c)));

fs.mkdirSync("public/fonts", { recursive: true });
const out = "public/fonts/geist-regular.typeface.json";
fs.writeFileSync(out, JSON.stringify(json));
console.log(
  `${out}: ${Object.keys(json.glyphs).length} glyphs, ${(fs.statSync(out).size / 1024).toFixed(1)} KiB, ` +
    `family "${json.familyName}", resolution ${json.resolution}` +
    (missing.length ? ` — ⛔ NOT IN THE FONT: ${JSON.stringify(missing)}` : ""),
);
