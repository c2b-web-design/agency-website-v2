/**
 * Check a font's outlines for OVERLAPS before three.js extrudes them — film 4's showcase, pass 1 (D-088, 22 October 2026).
 *
 *   node scripts/check-typeface-overlaps.mjs <typeface.json | font.ttf> [--curve=12] [--ascii] [--expect=hnaurpmHBF]
 *
 * ⛔ WHY: three triangulates each glyph's contours as it finds them. A contour that crosses ITSELF fills wrongly (the
 * `/about` cards' "H", 24 September 2026), and contours that cross EACH OTHER leave walls inside the letter. Variable-font
 * instances (Google Fonts' "static" Geist, for one) keep overlapping outlines; foundry statics usually do not. Both font
 * converters recorded this as unasserted (`scripts/build-geist-typeface.mjs`,
 * `live-work/scripts/build-geist-semibold-typeface.mjs`). This is the assertion, and it fails loudly.
 *
 * ⛔ IT CHECKS WHAT THREE TRIANGULATES: the typeface JSON's ROUNDED outlines, read by three's own `Font.generateShapes`
 * at scale 1 (JSON units), each contour flattened by `extractPoints(curveSegments)` exactly as `ExtrudeGeometry` does.
 * A `.ttf` is converted in memory by `TTFLoader` first (the converters' route), so the red run checks the same thing.
 *
 * TOLERANCE: two segments count as CROSSING when each one's ends lie on opposite sides of the other's line AND at least
 * one of those ends is more than 1 JSON unit away from it. A touch (an end ON the line) is not counted, nor a graze
 * shallower than 1 unit both ways — outlines meet at shared points legitimately.
 * ⚠ *Corrected in place, 22 October 2026:* the first version required BOTH ends beyond 1 unit. Its red run then missed
 * h, r and B in Google Fonts' Geist: the h's arch starts 14 units inside the stem, but the flattened point nearest the
 * stem's edge landed 0.9 units from it, so a real crossing was discarded. A tolerance must not depend on where the
 * flattening happens to put a point.
 *
 * ⚠ NOT WATCHED (printed with every verdict): a contour lying wholly inside another with no crossing (a duplicate or
 * nested stroke); glyphs drawn from components the converter did not flatten; any curveSegments but the one given.
 *
 * Exit: 0 when no glyph is flagged; 1 when any is. With `--expect=<chars>` (a RED RUN on a known-bad font): 0 only when
 * EVERY expected character is among those flagged — it may flag more.
 */
import fs from "node:fs";
import path from "node:path";
import { Font } from "three/examples/jsm/loaders/FontLoader.js";
import { TTFLoader } from "three-stdlib";

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
const opt = (k) => args.find((a) => a.startsWith(`--${k}=`))?.split("=").slice(1).join("=");
const curve = Number(opt("curve") ?? 12);
const asciiOnly = args.includes("--ascii");
const expect = opt("expect");
const TOL = 1;

if (!file || !fs.existsSync(file)) {
  console.error("usage: node scripts/check-typeface-overlaps.mjs <typeface.json | font.ttf> [--curve=12] [--ascii] [--expect=chars]");
  process.exit(2);
}

let data;
if (/\.(ttf|otf)$/i.test(file)) {
  const buf = fs.readFileSync(file);
  data = new TTFLoader().parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
} else {
  data = JSON.parse(fs.readFileSync(file, "utf8"));
}
const font = new Font(data);

/** Signed distance of p from the line through a→b (0 for a degenerate segment). */
function side(a, b, p) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  return len === 0 ? 0 : (dx * (p.y - a.y) - dy * (p.x - a.x)) / len;
}
/** A proper crossing, deeper than the tolerance on at least one end, both ways. */
function crosses(a, b, c, d) {
  const d1 = side(a, b, c), d2 = side(a, b, d), d3 = side(c, d, a), d4 = side(c, d, b);
  return d1 * d2 < 0 && Math.max(Math.abs(d1), Math.abs(d2)) > TOL && d3 * d4 < 0 && Math.max(Math.abs(d3), Math.abs(d4)) > TOL;
}
/** A contour's closed segment list, the duplicate closing point dropped. */
function segments(pts) {
  const p = pts.length > 1 && pts[0].equals(pts[pts.length - 1]) ? pts.slice(0, -1) : pts;
  return p.map((q, i) => [q, p[(i + 1) % p.length]]);
}

const chars = Object.keys(data.glyphs).filter((c) => !asciiOnly || (c.length === 1 && c.charCodeAt(0) >= 32 && c.charCodeAt(0) < 127));
const flagged = [];
let contoursChecked = 0;
for (const ch of chars) {
  if (!data.glyphs[ch].o) continue;
  // generateShapes(text, size): scale = size / resolution, so size = resolution reads the JSON's own units.
  const contours = [];
  for (const shape of font.generateShapes(ch, data.resolution)) {
    const { shape: outer, holes } = shape.extractPoints(curve);
    contours.push(outer, ...holes);
  }
  contoursChecked += contours.length;
  const segs = contours.map(segments);
  let self = 0, between = 0;
  for (let c = 0; c < segs.length; c++) {
    const s = segs[c];
    for (let i = 0; i < s.length; i++)
      for (let j = i + 2; j < s.length; j++) {
        if (i === 0 && j === s.length - 1) continue; // neighbours across the closing point
        if (crosses(s[i][0], s[i][1], s[j][0], s[j][1])) self++;
      }
    for (let e = c + 1; e < segs.length; e++)
      for (const [a, b] of s) for (const [p, q] of segs[e]) if (crosses(a, b, p, q)) between++;
  }
  if (self || between) flagged.push({ ch, contours: contours.length, self, between });
}

const name = path.basename(file);
console.log(`${name}: ${chars.length} glyphs, ${contoursChecked} contours, flattened at curveSegments ${curve}, tolerance ${TOL} JSON unit`);
for (const f of flagged) console.log(`  ⛔ "${f.ch}"  ${f.contours} contours · ${f.self} self-crossing · ${f.between} between contours`);
console.log("  ⚠ NOT WATCHED: a contour wholly inside another with no crossing; components left unflattened; other curveSegments.");

if (expect !== undefined) {
  const named = new Set(flagged.map((f) => f.ch));
  const missed = [...expect].filter((c) => !named.has(c));
  if (missed.length) {
    console.log(`⛔ RED RUN FAILED: expected ${JSON.stringify(expect)} all flagged; NOT flagged: ${JSON.stringify(missed.join(""))}`);
    process.exit(1);
  }
  console.log(`✅ RED RUN: all of ${JSON.stringify(expect)} flagged (${flagged.length} glyphs in all) — the check sees a known-bad font.`);
  process.exit(0);
}
if (flagged.length) {
  console.log(`⛔ ${flagged.length} GLYPH(S) OVERLAP — do not extrude this font as it is.`);
  process.exit(1);
}
console.log(`✅ NO OVERLAPS in ${chars.length} glyphs.`);
