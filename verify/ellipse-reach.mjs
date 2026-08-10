// How much of the traveller's light would the pill's crown, middle and bottom
// actually receive?
//
//   node verify/ellipse-reach.mjs
//
// ⚠ CARL'S QUESTION, 10 August 2026: *"the ellipse light is a certain distance
// from the cards, it is essentially in front. Because of this pill's geometry
// and the orbit, how much light would the pill's middle and bottom receive?"*
//
// ⚠⚠ PURE MATHS, NO BROWSER. The path function and the crown profile are both
// deterministic, so this needs no GPU and cannot be lied to by a rasteriser. It
// imports the REAL constants rather than restating them — this project has been
// burned three times by a harness holding its own stale copy of a value
// (`q5-stutter.mjs`'s 700ms, `cross-section.mjs`'s BEVEL_WIDTH,
// `opening-arm.mjs`'s viewport).
//
// ── WHAT IT COMPUTES ─────────────────────────────────────────────────────
//
// For each sample point across the pill's short axis (crown centre → bottom
// edge), and for every phase of the traveller's orbit:
//
//   irradiance  =  max(0, N · L) / d²          [Lambert + inverse square]
//
// N is the surface normal from `crownHeight`'s gradient; L is the unit vector to
// the traveller; d is the distance. `decay = 2` on the real light makes the 1/d²
// term exact rather than an approximation.
//
// ⚠ IT REPORTS THE **SWING** AS WELL AS THE PEAK, because that is the question
// the opal rig failed. `contact-field-light-rig.tsx` built true proximity
// driving, measured a **1.3x range**, and Carl REJECTED it as too flat to see.
// A peak with no swing is a light that does not read as moving.

// ⚠⚠ THE CONSTANTS ARE PARSED OUT OF THE SOURCE AT RUNTIME, NOT RETYPED HERE.
//
// `answer-card-glass.ts` cannot be imported directly: it pulls in
// `answer-card-geometry` without a file extension, which Node's ESM resolver
// rejects, and the repo has no bundler installed to flatten it.
//
// ⚠ THE OBVIOUS SHORTCUT — paste the numbers into this file — IS THE EXACT
// FAILURE THIS PROJECT HAS PAID FOR THREE TIMES: `q5-stutter.mjs` held its own
// stale 700ms, `cross-section.mjs` duplicated `BEVEL_WIDTH`, `opening-arm.mjs`
// pinned its own viewport. **A harness holding a copy of a value it is
// measuring against cannot detect a change to that value.** Reading the source
// text keeps one definition.
import { readFileSync } from "node:fs";

const glassSrc = readFileSync("components/enquiry/answer-card-glass.ts", "utf8");
const nextSrc = readFileSync("components/enquiry/nextstep-geometry.ts", "utf8");

/** Pull `export const NAME = <number>;` out of a source file. */
function num(src, name) {
  const m = src.match(new RegExp(`export const ${name}[^=]*=\\s*(-?[\\d.]+)`));
  if (!m) throw new Error(`could not read ${name} from source — has it been renamed?`);
  return Number(m[1]);
}
/** Pull `export const NAME: [number,number,number] = [a, b, c];` */
function vec3(src, name) {
  const m = src.match(new RegExp(`export const ${name}[^=]*=\\s*\\[([^\\]]+)\\]`));
  if (!m) throw new Error(`could not read ${name} from source`);
  return m[1].split(",").map((s) => Number(s.trim()));
}

const REST_TRAVEL_SEMI_MAJOR = num(glassSrc, "REST_TRAVEL_SEMI_MAJOR");
const REST_TRAVEL_SEMI_MINOR = num(glassSrc, "REST_TRAVEL_SEMI_MINOR");
const REST_TRAVEL_TILT_DEG = num(glassSrc, "REST_TRAVEL_TILT_DEG");
const REST_TRAVEL_DIAGONAL_DEG = num(glassSrc, "REST_TRAVEL_DIAGONAL_DEG");
const REST_TRAVEL_CENTRE = vec3(glassSrc, "REST_TRAVEL_CENTRE");

const NEXTSTEP_HEIGHT_PX = num(nextSrc, "NEXTSTEP_HEIGHT_PX");
const NEXTSTEP_CROWN_PX = num(nextSrc, "NEXTSTEP_CROWN_PX");
const NEXTSTEP_PLATEAU = num(nextSrc, "NEXTSTEP_PLATEAU");

/**
 * ⚠ A TRANSCRIPTION OF `crownHeight` FROM `nextstep-geometry.ts`, AND THE ONLY
 * ONE IN THIS FILE. It is checked against the source's own text below, so a
 * change to the real profile fails loudly here instead of being measured wrong.
 */
function crownHeight(t) {
  const a = Math.abs(t);
  if (a <= NEXTSTEP_PLATEAU) return NEXTSTEP_CROWN_PX;
  const u = (a - NEXTSTEP_PLATEAU) / (1 - NEXTSTEP_PLATEAU);
  return NEXTSTEP_CROWN_PX * ((1 + Math.cos(u * Math.PI)) / 2);
}
// ⚠ THE GUARD: if the real profile stops being a raised cosine — which is
// exactly what adding the reference's double-band inflection would do — this
// harness's model is stale and it must not report numbers.
if (!/1 \+ Math\.cos\(u \* Math\.PI\)/.test(nextSrc)) {
  console.error(`\n⚠⚠ ABORTING — \`crownHeight\` in nextstep-geometry.ts is no longer the`);
  console.error(`   raised cosine this harness models. Update the transcription above`);
  console.error(`   before trusting any number it prints.\n`);
  process.exit(1);
}

/** ⚠ A TRANSCRIPTION of `restTravelPoint`, guarded the same way below. */
function restTravelPoint(t) {
  const a = ((((t % 1) + 1) % 1) * Math.PI * 2) + Math.PI;
  const cosA = Math.cos(a);
  const sinA = Math.sin(a);
  const along = cosA * REST_TRAVEL_SEMI_MAJOR;
  const across = sinA * REST_TRAVEL_SEMI_MINOR;
  const th = (REST_TRAVEL_DIAGONAL_DEG * Math.PI) / 180;
  const dx = Math.cos(th);
  const dy = Math.sin(th);
  const tilt = (REST_TRAVEL_TILT_DEG * Math.PI) / 180;
  const acrossY = Math.sin(tilt);
  const acrossZ = Math.cos(tilt);
  return [
    REST_TRAVEL_CENTRE[0] + dx * along - dy * across * acrossY,
    REST_TRAVEL_CENTRE[1] + dy * along + dx * across * acrossY,
    REST_TRAVEL_CENTRE[2] - across * acrossZ,
  ];
}
if (!/REST_TRAVEL_CENTRE\[2\] - across \* acrossZ/.test(glassSrc)) {
  console.error(`\n⚠⚠ ABORTING — \`restTravelPoint\` has changed shape. Re-check the`);
  console.error(`   transcription in this harness before trusting it.\n`);
  process.exit(1);
}

// ── Where the button sits, in the grid's world frame ──────────────────────
//
// ⚠ MEASURED FROM THE LIVE DOM by `verify/button-vs-cards.mjs`, not derived:
// the grid is 576x104 and the button's box centre sits 20px below the grid's
// bottom edge. The card canvas's world origin is the GRID CENTRE with +y up, so
// the button's centre is at y = -(104/2 + 20 + 41/2) = -92.5.
const GRID_H = 104;
const GAP_BELOW = 20;
const BUTTON_CY = -(GRID_H / 2 + GAP_BELOW + NEXTSTEP_HEIGHT_PX / 2);

console.log(`\nthe traveller's ellipse`);
console.log(`  semi-major ${REST_TRAVEL_SEMI_MAJOR}   semi-minor ${REST_TRAVEL_SEMI_MINOR}`);
console.log(`  centre (${REST_TRAVEL_CENTRE.join(", ")})   tilt ${REST_TRAVEL_TILT_DEG}°   diagonal ${REST_TRAVEL_DIAGONAL_DEG}°`);
console.log(`\nthe button`);
console.log(`  centre y ${BUTTON_CY.toFixed(1)} (grid centre = 0, +y up)`);
console.log(`  crown ${NEXTSTEP_CROWN_PX} tall, plateau ${NEXTSTEP_PLATEAU}, half-height ${NEXTSTEP_HEIGHT_PX / 2}\n`);

// ── The orbit's extent, so we know how close it ever gets ─────────────────
let loY = Infinity, hiY = -Infinity, loZ = Infinity, hiZ = -Infinity;
for (let i = 0; i < 2000; i++) {
  const [, y, z] = restTravelPoint(i / 2000);
  loY = Math.min(loY, y); hiY = Math.max(hiY, y);
  loZ = Math.min(loZ, z); hiZ = Math.max(hiZ, z);
}
console.log(`orbit extent   y ${loY.toFixed(0)} .. ${hiY.toFixed(0)}     z ${loZ.toFixed(0)} .. ${hiZ.toFixed(0)}`);
console.log(`  the pill's crown sits at z = ${NEXTSTEP_CROWN_PX}, y = ${BUTTON_CY.toFixed(0)}`);
console.log(`  so the orbit's LOWEST point is ${(loY - BUTTON_CY).toFixed(0)} units ABOVE the button.\n`);

/**
 * The surface normal at a point across the pill's short axis.
 *
 * `t` runs -1 (bottom edge) .. 0 (crown centre) .. +1 (top edge). The pill is a
 * height field, so the normal is the gradient of `crownHeight` — the same
 * central-difference the mesh builder uses, in the y/z plane.
 */
function normalAt(t) {
  const r = NEXTSTEP_HEIGHT_PX / 2;
  const e = 0.01;
  const dz = (crownHeight(Math.min(1, t + e)) - crownHeight(Math.max(-1, t - e))) / (2 * e * r);
  // N = normalise(0, -dz/dy, 1) in the y-z plane.
  const len = Math.hypot(dz, 1);
  return { y: -dz / len, z: 1 / len };
}

const SAMPLES = [
  { name: "crown centre", t: 0.0 },
  { name: "upper shoulder", t: 0.45 },
  { name: "top edge", t: 0.9 },
  { name: "lower shoulder", t: -0.45 },
  { name: "bottom edge", t: -0.9 },
];

console.log(`irradiance across the pill, over a full orbit`);
console.log(`(Lambert x inverse-square, relative — the crown's peak is 1.00)\n`);
console.log(`  point              peak     min      swing    lit for`);

const PHASES = 720;
const rows = [];
for (const s of SAMPLES) {
  const n = normalAt(s.t);
  // The sample's world position: y offset across the pill, z the crown height.
  const py = BUTTON_CY + s.t * (NEXTSTEP_HEIGHT_PX / 2);
  const pz = crownHeight(s.t);

  let peak = 0, min = Infinity, litPhases = 0;
  for (let i = 0; i < PHASES; i++) {
    const [lx, ly, lz] = restTravelPoint(i / PHASES);
    const vx = lx - 0, vy = ly - py, vz = lz - pz;
    const d = Math.hypot(vx, vy, vz);
    const ndotl = (n.y * vy + n.z * vz) / d;
    const irr = ndotl > 0 ? ndotl / (d * d) : 0;
    if (irr > 0) litPhases++;
    peak = Math.max(peak, irr);
    min = Math.min(min, irr);
  }
  rows.push({ ...s, peak, min, lit: litPhases / PHASES });
}

const crownPeak = rows[0].peak;
for (const r of rows) {
  const rel = r.peak / crownPeak;
  const relMin = r.min / crownPeak;
  const swing = r.min > 1e-12 ? r.peak / r.min : Infinity;
  console.log(
    `  ${r.name.padEnd(16)} ${rel.toFixed(3).padStart(6)}  ${relMin.toFixed(3).padStart(6)}   ` +
      `${(Number.isFinite(swing) ? swing.toFixed(1) + "x" : "inf").padStart(7)}   ${(r.lit * 100).toFixed(0)}% of orbit`,
  );
}

console.log(`\n⚠ THE SWING IS THE NUMBER THAT DECIDES IT, NOT THE PEAK.`);
console.log(`  \`contact-field-light-rig.tsx\` built true proximity driving for the opal,`);
console.log(`  measured a 1.3x range, and Carl REJECTED it as too flat to see. A surface`);
console.log(`  that is always lit and never changes does not read as metal under a moving`);
console.log(`  light — it reads as a painted gradient.\n`);

// ── Does the orbit ever get BELOW the button? ─────────────────────────────
console.log(`can the traveller ever light the pill's UNDERSIDE?`);
if (loY > BUTTON_CY) {
  console.log(`  NO. The orbit's lowest point (y ${loY.toFixed(0)}) is entirely above the`);
  console.log(`  button (y ${BUTTON_CY.toFixed(0)}). Every downward-facing normal on the pill —`);
  console.log(`  the whole lower half below the crown — faces AWAY from the light for the`);
  console.log(`  entire orbit and receives nothing from it at any phase.`);
} else {
  console.log(`  YES — the orbit dips to y ${loY.toFixed(0)}, below the button's ${BUTTON_CY.toFixed(0)}.`);
}
