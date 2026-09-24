/**
 * Build `public/fonts/geist-regular.typeface.json` — Geist Regular in the
 * typeface format three's `FontLoader` / `TextGeometry` extrude from. D-094.
 *
 *   node scripts/build-geist-typeface.mjs <path/to/Geist-Regular.ttf>
 *
 * ⛔ SOURCE: VERCEL'S OWN STATIC Geist-Regular.ttf, from the `geist` npm package
 * (v1.7.2, `dist/fonts/geist-sans/Geist-Regular.ttf`; `npm pack geist` and
 * extract — it is NOT a project dependency). Font version 1.800. Geist is ©
 * Vercel, SIL Open Font License 1.1 — the licence travels with the font's own
 * name table, kept in the output's `original_font_information`.
 *
 * ⚠⚠ *Corrected in place, 24 September 2026 (session 2):* the source WAS Google
 * Fonts' "static" Geist 400
 *   https://fonts.gstatic.com/s/geist/v5/gyBhhwUxId8gMGYQMKR3pzfaWI_RnOM4nQ.ttf
 * which is an INSTANCE of the variable font and KEEPS OVERLAPPING OUTLINES. Three
 * triangulates each contour on its own, so a self-crossing one fills wrongly:
 * CA's "H" rendered with a solid wedge. Of the 41 glyphs the copy uses, 10 had
 * self-crossing contours (h n a u r p m H B F); Vercel's file has NONE, and its
 * advances are IDENTICAL for every character the copy uses (same version, 1.800),
 * so the setting does not move. ⛔ Do not go back to the Google Fonts TTF.
 * ⚠ Nothing checks a future source for overlaps — unasserted; the check that
 * found this lives in the run log (`run-log-four-static-24-september.md`).
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
