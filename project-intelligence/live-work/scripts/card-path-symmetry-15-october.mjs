/** THE CARD OUTLINE IS MIRROR-IDENTICAL — asserted on the REAL source (15 October 2026; Carl: "it is symmetrical, make them
 *  identical"). Extracts `sampleRoundedRectPath` and its two constants from `answer-card-mesh.tsx` as TEXT, transpiles it
 *  with the project's TypeScript and runs it at the card's size — no copy of the logic to drift.
 *  Asserts: every point has its mirror in x (−x, y, −nx, ny) and in y (x, −y, nx, −ny) to 1e-9; a point ON each of the 8
 *  arc/straight joins; every normal unit length; no two consecutive points coincide. A PLANTED asymmetry must fail.
 *  ⚠ NOT WATCHED: the triangulation's diagonal (it runs one way round the loop, so mirrored quads split oppositely — the
 *  vertices and normals are identical, the interpolation inside a quad is not); the lighting (top-left key: by design). */
import { readFileSync } from "node:fs";
import ts from "typescript";
const src = readFileSync("components/enquiry/answer-card-mesh.tsx", "utf8");
const grab = (re) => { const m = src.match(re); if (!m) throw new Error("not found: " + re); return m[0]; };
// The function's own text: from its signature to the line that closes it (a "}" at column 0) — line-ending agnostic
// (the source is CRLF; a first version searched for "\n * Half-width…" and read half the file).
const from = src.indexOf("function sampleRoundedRectPath(");
const close = src.slice(from).search(/\r?\n}\r?\n/);
if (from < 0 || close < 0) throw new Error("sampleRoundedRectPath not found");
const fn = src.slice(from, from + close) + "\n}";
const code = [grab(/const PATH_CORNER_STEPS = [^;]+;/), grab(/const PATH_STRAIGHT_STEP = [^;]+;/), "type PathPoint = { x: number; y: number; nx: number; ny: number };", fn, "export { sampleRoundedRectPath };"].join("\n");
const js = ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText;
const mod = await import("data:text/javascript;base64," + Buffer.from(js).toString("base64"));
const geo = readFileSync("components/enquiry/answer-card-geometry.ts", "utf8");
const num = (k) => Number(geo.match(new RegExp(`export const ${k} = ([0-9.]+);`))[1]);
const W = num("CARD_WIDTH_PX"), H = num("CARD_HEIGHT_PX"), R = num("CARD_RADIUS_PX");
function check(pts, label) {
  const eps = 1e-9, has = (q) => pts.some((p) => Math.abs(p.x - q.x) < eps && Math.abs(p.y - q.y) < eps && Math.abs(p.nx - q.nx) < eps && Math.abs(p.ny - q.ny) < eps);
  const fails = [];
  const mx = pts.filter((p) => !has({ x: -p.x, y: p.y, nx: -p.nx, ny: p.ny })).length; if (mx) fails.push(`${mx} without an x-mirror`);
  const my = pts.filter((p) => !has({ x: p.x, y: -p.y, nx: p.nx, ny: -p.ny })).length; if (my) fails.push(`${my} without a y-mirror`);
  const hw = W / 2, hh = H / 2;
  const joins = [[hw, hh - R], [hw - R, hh], [-hw + R, hh], [-hw, hh - R], [-hw, -hh + R], [-hw + R, -hh], [hw - R, -hh], [hw, -hh + R]];
  const missing = joins.filter(([x, y]) => !pts.some((p) => Math.abs(p.x - x) < eps && Math.abs(p.y - y) < eps)).length; if (missing) fails.push(`${missing}/8 joins without a point`);
  const badN = pts.filter((p) => Math.abs(Math.hypot(p.nx, p.ny) - 1) > 1e-9).length; if (badN) fails.push(`${badN} normals not unit`);
  const dup = pts.filter((p, i) => { const q = pts[(i + 1) % pts.length]; return Math.hypot(p.x - q.x, p.y - q.y) < 1e-6; }).length; if (dup) fails.push(`${dup} coincident neighbours`);
  console.log(`${fails.length ? "⛔" : "✅"} ${label}: ${pts.length} points${fails.length ? " — " + fails.join("; ") : " — mirror-identical in x and y, a point on all 8 joins"}`);
  return fails.length === 0;
}
const pts = mod.sampleRoundedRectPath(W, H, R);
const ok = check(pts, `the card ${W} × ${H}, r ${R}`);
const planted = pts.map((p, i) => (i === 5 ? { ...p, x: p.x + 0.01 } : p));
const caught = !check(planted, "CONTROL (one point moved 0.01 px — must FAIL)");
console.log(ok && caught ? "✅ VERDICT: symmetric; the control was caught" : "⛔ VERDICT: FAILED");
console.log("⚠ NOT WATCHED: the triangulation's diagonal direction; the lighting (asymmetric by design).");
