/**
 * Build `public/fonts/geist-semibold.typeface.json` — Geist SemiBold (600) in the typeface format three's
 * `FontLoader` / `TextGeometry` extrude from. D-088, 12 October 2026: the `Who we are` button's label, extruded
 * (Carl: *"Lets extrude the text slightly. Make it Three js"*); the button family's box rule is 14px / 600.
 *
 *   node project-intelligence/live-work/scripts/build-geist-semibold-typeface.mjs <path/to/Geist-SemiBold.ttf>
 *
 * ⛔ THE SAME METHOD AS `scripts/build-geist-typeface.mjs` (Regular, D-094), and the same SOURCE RULE: Vercel's own
 * static TTF from the `geist` npm package v1.7.2 (`dist/fonts/geist-sans/Geist-SemiBold.ttf`; `npm pack geist@1.7.2`,
 * extracted — not a project dependency). ⛔ NOT Google Fonts' static instances, which keep the variable font's
 * overlapping outlines (they filled the cards' "H" wrongly). Checked 12 October for the label's glyphs (W h o w e a r):
 * no self-crossing contours. Geist is © Vercel, SIL OFL 1.1 — the licence travels in the output's
 * `original_font_information`.
 *
 * SUBSET: printable ASCII — the family's labels ("Who we are", "Next step", "Send", "Start a conversation") are all
 * ASCII. A non-ASCII label needs a rebuild; the build reports any character the font lacks.
 */
import fs from "node:fs";
import { TTFLoader } from "three-stdlib";

const src = process.argv[2];
if (!src || !fs.existsSync(src)) {
  console.error("usage: node …/build-geist-semibold-typeface.mjs <Geist-SemiBold.ttf>");
  process.exit(2);
}
const buf = fs.readFileSync(src);
const json = new TTFLoader().parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
const keep = new Set();
for (let c = 32; c < 127; c++) keep.add(String.fromCharCode(c));
const missing = [...keep].filter((c) => !json.glyphs[c]);
json.glyphs = Object.fromEntries(Object.entries(json.glyphs).filter(([c]) => keep.has(c)));
const out = "public/fonts/geist-semibold.typeface.json";
fs.writeFileSync(out, JSON.stringify(json));
console.log(
  `${out}: ${Object.keys(json.glyphs).length} glyphs, ${(fs.statSync(out).size / 1024).toFixed(1)} KiB, ` +
    `family "${json.familyName}", resolution ${json.resolution}` +
    (missing.length ? ` — ⛔ NOT IN THE FONT: ${JSON.stringify(missing)}` : ""),
);
