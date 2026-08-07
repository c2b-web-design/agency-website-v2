/**
 * The card's cross-section, drawn as an outline. What the object ACTUALLY is.
 *
 * ⚠ THIS EXISTS BECAUSE A DESCRIBED OBJECT AND A BUILT OBJECT DIVERGED FOR
 * SEVERAL SESSIONS AND NOBODY COULD SEE IT. Carl, 5 August 2026, after sketching
 * the intended side view: *"I had assumed from my description that my geometry
 * idea was understood. Clearly not."* And the finding that followed: *"parts
 * dont exist and its difficult to tell whether something exists in total
 * darkness and no light can illuminate something that is not there."*
 *
 * ⚠ AN ENTIRE SESSION OF LIGHTING WORK WAS SPENT ON MISSING GEOMETRY. Light
 * level, direction, type, roughness, clearcoat, backlighting — all tuned against
 * a seam that is a VOID. Every measurement was honest and beside the point.
 *
 * ⚠ SO THE RULE THIS SCRIPT ENFORCES: draw the cross-section and LOOK at it
 * before building or tuning anything that depends on the form. Carl's pencil
 * sketch exposed in one glance what prose had failed to convey across several
 * sessions. **A drawing is cheaper than an approval given against the wrong
 * object.**
 *
 * ⚠ THE PROFILE MATHS IS COPIED FROM THE MESH BUILDERS VERBATIM — the rim's
 * half-tube (`answer-card-mesh.tsx:987-996`), the bevel's ramp (`:1025-1030`),
 * the crown (`crownZ`) and the z-placement (`:1064-1066`). ⚠ THAT MAKES THIS A
 * DIAGRAM OF THE FORMULAS, NOT AN INDEPENDENT CHECK OF THE MESH. It can show
 * that the SPECIFIED cross-section has a gap; it cannot catch a bug between
 * these formulas and the vertices three actually builds. Read it as "what the
 * geometry is designed to be".
 *
 *   node verify/cross-section.mjs
 */

import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import sharp from "sharp";

const OUT = "verify/out";
mkdirSync(OUT, { recursive: true });

// ── The shipped constants, READ FROM `answer-card-geometry.ts` ───────────────
//
// ⚠⚠ THEY USED TO BE COPIED HERE, AND ON 7 AUGUST 2026 THAT MADE THIS SCRIPT
// LIE ABOUT THE OBJECT IT EXISTS TO DESCRIBE. The cross-section was rebuilt on
// 5 August — bevel removed (`BEVEL_WIDTH` 3 -> 0), the face raised to start at
// the rim's base and finish 2.00 PROUD of its apex. This file still held the old
// literals, so it went on printing a 3-wide bevel and a **5.00-unit gap** in a
// card that no longer has either. It reported the pre-rebuild defect as though
// it were current, and a reader nearly concluded the rebuild had been lost.
//
// ⚠ THIS IS THE THIRD RECORDED INSTANCE OF THE SAME FAILURE. `verify/q5-stutter.mjs`
// reported 0/3 CLEAN on a visible defect because its window shared the wrong
// 700ms with the fix; `verify/opening-arm.mjs` carries a warning against exactly
// this and uses a RANGE check for the reason. **A harness holding its own copy
// of the value it checks cannot fail when that value moves.**
//
// ⚠ AND IT IS THE WORST FILE FOR IT TO HAPPEN IN. The handoff instructs "run
// this before trusting any geometry claim" — so the designated authority on the
// form was describing a card that had not existed for two days.
//
// Parsed rather than imported because this is a `.mjs` script and the source is
// TypeScript. The regex takes the DECLARED value of each `export const`; if a
// name is ever renamed or its literal becomes an expression, the read throws
// with the name rather than silently falling back to a stale default. **Failing
// loudly is the whole point — a default here would reintroduce the bug.**
const GEOM_SRC = readFileSync("components/enquiry/answer-card-geometry.ts", "utf8");
function geom(name) {
  const m = GEOM_SRC.match(new RegExp(`^export const ${name} = ([-\\d.]+);`, "m"));
  if (!m) {
    throw new Error(
      `cross-section.mjs: could not read '${name}' from answer-card-geometry.ts.\n` +
        `It was renamed, removed, or is no longer a plain numeric literal.\n` +
        `⚠ DO NOT hardcode a value here to get past this — that is the exact bug ` +
        `this read replaced. Fix the parse or the name.`,
    );
  }
  return Number(m[1]);
}

const RIM_TUBE_RADIUS = geom("RIM_TUBE_RADIUS");
const BEVEL_RISE_RATIO = geom("BEVEL_RISE_RATIO");
const BEVEL_RISE = RIM_TUBE_RADIUS * BEVEL_RISE_RATIO;
const BEVEL_WIDTH = geom("BEVEL_WIDTH");
// ⚠ `CROWN_HEIGHT` IS DELIBERATELY NOT READ. It was the old model's hand-held
// crown height; the rebuild derives the rise from where the face must start and
// where its apex must land (`FACE_CROWN_RISE` below), so the two now disagree —
// 4.5 against an actual 4.0. Reading it here would draw a crown 0.5 too tall.
//
// CROWN_PLATEAU_U (0.72) shapes the LONG axis only. This slice is taken on the
// short axis at u=0, where the plateau term is 1 by construction — so it is
// deliberately not used here rather than missing.
const CARD_HEIGHT = geom("CARD_HEIGHT_PX");

// ── The face's Z placement, on the REBUILT model ─────────────────────────────
//
// ⚠ THE OLD MODEL IS GONE, NOT PARAMETERISED. It placed the face by sinking it
// below the bevel's inner edge (`FACE_SEAM_SINK` = CROWN_HEIGHT + BEVEL_RISE *
// FACE_TUCK_RATIO), which is what produced the floating dome and the void
// beneath it. `FACE_SEAM_SINK` still exists in the source but is explicitly
// marked superseded and *"nothing in the answer card reads this"* — so reading
// it here would redraw the defect.
//
// The face now rises from `FACE_RISE_FROM` (z = 0, the tube's BASE) and climbs
// to `RIM_TUBE_RADIUS + FACE_PROUD_OF_RIM`. `FACE_CROWN_RISE` is that difference,
// derived in the source so the two cannot drift.
const FACE_RISE_FROM = geom("FACE_RISE_FROM");
const FACE_PROUD_OF_RIM = geom("FACE_PROUD_OF_RIM");
const FACE_CROWN_RISE = RIM_TUBE_RADIUS + FACE_PROUD_OF_RIM - FACE_RISE_FROM;

const faceBaseZ = FACE_RISE_FROM;
const faceApexZ = FACE_RISE_FROM + FACE_CROWN_RISE;

const halfH = CARD_HEIGHT / 2; // 24
const rimPathY = halfH - RIM_TUBE_RADIUS; // tube centre-line
const faceInset = 2 * RIM_TUBE_RADIUS + BEVEL_WIDTH; // 7
const faceHalfH = halfH - faceInset; // 17

/**
 * The crown, on the short axis (u = 0).
 *
 * ⚠ SCALED BY `FACE_CROWN_RISE`, NOT `CROWN_HEIGHT`. The rebuild derives the
 * crown's height from where the face must START and where its apex must LAND
 * (`RIM_TUBE_RADIUS + FACE_PROUD_OF_RIM - FACE_RISE_FROM`), so `CROWN_HEIGHT`
 * is no longer the amount the face actually rises. Using it here would draw a
 * 4.5-unit crown on a face that climbs 4.0.
 */
function crownZ(v) {
  const shortAxis = (1 + Math.cos(v * Math.PI)) / 2;
  return FACE_CROWN_RISE * shortAxis;
}

// ── Trace the outline from the top edge inward to the centre ────────────────
const pts = [];

// RIM — a half-tube swept about the path point at y = rimPathY.
// theta 0 is outermost, theta pi is innermost; forward = sin(theta) * r.
for (let i = 0; i <= 40; i++) {
  const theta = (i / 40) * Math.PI;
  pts.push({
    part: "rim",
    y: rimPathY + Math.cos(theta) * RIM_TUBE_RADIUS,
    z: Math.sin(theta) * RIM_TUBE_RADIUS,
  });
}

// BEVEL — a straight ramp running inward and FORWARD from the tube's inner side.
//
// ⚠ AT `BEVEL_WIDTH = 0` THIS EMITS A SINGLE DEGENERATE POINT AT THE TUBE'S
// BASE, WHICH IS CORRECT AND IS THE POINT. The bevel was removed on 5 August;
// the loop is kept so a restored bevel draws again without editing this script,
// and so the junction arithmetic below has a well-defined "inner edge" to
// measure from in both models. It is not dead code and it is not a stub.
const bevelStartY = rimPathY - RIM_TUBE_RADIUS; // where the tube ends
const bevelSteps = BEVEL_WIDTH > 0 ? 12 : 0;
for (let i = 0; i <= bevelSteps; i++) {
  const t = bevelSteps === 0 ? 0 : i / bevelSteps;
  pts.push({
    part: "bevel",
    y: bevelStartY - t * BEVEL_WIDTH,
    z: t * BEVEL_RISE,
  });
}

// FACE — the crowned surface, on its own base plane.
for (let i = 0; i <= 60; i++) {
  const v = i / 60; // 0 at the face's edge, 1 at its centre... in card space:
  const y = faceHalfH * (1 - v);
  // crownZ takes v where the cosine spans the half-height.
  pts.push({ part: "face", y, z: faceBaseZ + crownZ(1 - v) });
}

// ── Report the junction ─────────────────────────────────────────────────────
const bevelEnd = pts.filter((p) => p.part === "bevel").at(-1);
const faceEdge = pts.filter((p) => p.part === "face")[0];

console.log("── THE CROSS-SECTION AS BUILT ──\n");
console.log("  (constants read live from components/enquiry/answer-card-geometry.ts)\n");
console.log(`rim tube        centre y ${rimPathY.toFixed(2)}  radius ${RIM_TUBE_RADIUS}`);
console.log(`  apex          y ${rimPathY.toFixed(2)}  z ${RIM_TUBE_RADIUS.toFixed(2)}`);
console.log(`  inner edge    y ${bevelStartY.toFixed(2)}  z 0.00   <- the tube's BASE`);
if (BEVEL_WIDTH > 0) {
  console.log(`\nbevel           rises ${BEVEL_RISE} over ${BEVEL_WIDTH} inward  (slopes UP toward the centre)`);
  console.log(`  inner edge    y ${bevelEnd.y.toFixed(2)}  z ${bevelEnd.z.toFixed(2)}`);
} else {
  console.log(`\nbevel           REMOVED (BEVEL_WIDTH = 0)`);
  console.log(`                the face rises straight from the rim's base`);
}
console.log(`\nface            rises from z ${faceBaseZ.toFixed(2)}  crown rise ${FACE_CROWN_RISE.toFixed(2)}`);
console.log(`  outer edge    y ${faceEdge.y.toFixed(2)}  z ${faceEdge.z.toFixed(2)}`);
console.log(`  apex          y 0.00  z ${faceApexZ.toFixed(2)}`);

// ── The junction, COMPUTED ──────────────────────────────────────────────────
//
// ⚠ THE VERDICT IS DERIVED, NOT WRITTEN DOWN. This block used to print "NOTHING
// IS MODELLED BETWEEN THOSE TWO POINTS" unconditionally — true of the old model,
// and still printed verbatim for two days after the gap was closed. A conclusion
// hardcoded next to the numbers that are supposed to justify it is not a
// measurement.
console.log("\n── THE JUNCTION ──\n");
const dy = bevelEnd.y - faceEdge.y;
const dz = bevelEnd.z - faceEdge.z;
const gap = Math.hypot(dy, dz);
const inner = BEVEL_WIDTH > 0 ? "bevel inner edge" : "rim base       ";
console.log(`${inner}   (y ${bevelEnd.y.toFixed(2)}, z ${bevelEnd.z.toFixed(2)})`);
console.log(`face outer edge    (y ${faceEdge.y.toFixed(2)}, z ${faceEdge.z.toFixed(2)})`);
console.log(`\ngap                ${gap.toFixed(2)} units   (dy ${dy.toFixed(2)}, dz ${dz.toFixed(2)})`);
if (gap > 0.01) {
  console.log("\n⚠ NOTHING IS MODELLED BETWEEN THOSE TWO POINTS. No wall, no fillet,");
  console.log("  no return — a step that only the head-on orthographic view conceals.");
  console.log("  THIS IS THE DEFECT FOUND ON 5 AUGUST. It should read 0.00.");
} else {
  console.log("\n✅ CONTINUOUS. The face meets the rim with no step — one form, no seam.");
}

// ── Proud or recessed, COMPUTED ─────────────────────────────────────────────
console.log("\n── PROUD OR RECESSED ──\n");
const proud = faceApexZ - RIM_TUBE_RADIUS;
console.log(`rim apex   z ${RIM_TUBE_RADIUS.toFixed(2)}`);
console.log(`face apex  z ${faceApexZ.toFixed(2)}`);
if (proud > 0) {
  console.log(`\n✅ the face stands ${proud.toFixed(2)} PROUD of the rim's apex.`);
  console.log("  Carl: *\"the highest part of the convex face should sit above the");
  console.log("  rim to have effect on the other faces.\"* It is the frontmost point.");
} else {
  console.log(`\n⚠ the face sits ${(-proud).toFixed(2)} BELOW the rim's apex — recessed, not proud.`);
  console.log("  ⚠ Carl's sketch has the crown standing ABOVE the rim so it can throw");
  console.log("    light onto the other faces. That is the reverse of this.");
}

// ── The tilt guard ──────────────────────────────────────────────────────────
//
// ⚠ THE CHECK THAT CAUGHT A VALUE THAT LOOKED FINE. Removing the bevel made the
// face WIDER, so the same rise spread over a longer run is a SHALLOWER curve:
// `FACE_PROUD_OF_RIM` 1.0 produced 13.3°, under the 16° floor, while looking
// perfectly reasonable. Two safe changes interacting. The contact field's crown
// had a 5.67° maximum tilt and Carl read it off the render instantly — *"those
// faces look flat."* Lambert shading needs the angle; where physics has a
// threshold, the number must be right.
const maxTilt = (() => {
  const face = pts.filter((p) => p.part === "face");
  let m = 0;
  for (let i = 1; i < face.length; i++) {
    const a = face[i - 1];
    const b = face[i];
    const t = Math.abs(Math.atan2(b.z - a.z, Math.abs(b.y - a.y)) * (180 / Math.PI));
    if (t > m) m = t;
  }
  return m;
})();
console.log("\n── FACE TILT ──\n");
console.log(`maximum surface tilt   ${maxTilt.toFixed(1)}°   (floor: 16.0°)`);
console.log(
  maxTilt >= 16
    ? "✅ clear of MIN_FACE_TILT_DEGREES — the curve can show itself under Lambert shading."
    : "⚠ BELOW THE FLOOR. The face is too flat to read as curved, whatever the lighting.",
);

// ── Draw it ─────────────────────────────────────────────────────────────────
const W = 1000;
const H = 460;
const SX = 17; // world units -> px
const SZ = 17;
const originX = 80;
const originY = 330;

const px = (p) => ({
  x: originX + (halfH - p.y) * SX,
  y: originY - p.z * SZ,
});

const poly = (part, colour) => {
  const d = pts
    .filter((p) => p.part === part)
    .map((p, i) => {
      const q = px(p);
      return `${i === 0 ? "M" : "L"} ${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
    })
    .join(" ");
  return `<path d="${d}" fill="none" stroke="${colour}" stroke-width="2.5"/>`;
};

const be = px(bevelEnd);
const fe = px(faceEdge);
const rimApex = px({ y: rimPathY, z: RIM_TUBE_RADIUS });
const faceApex = px({ y: 0, z: faceApexZ });

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="100%" height="100%" fill="#111"/>
  <text x="24" y="34" font-family="monospace" font-size="17" fill="#fff">CARD CROSS-SECTION AS BUILT — top edge to centre</text>

  <line x1="${originX - 20}" y1="${originY}" x2="${W - 40}" y2="${originY}" stroke="#333" stroke-width="1"/>
  <text x="${W - 120}" y="${originY + 20}" font-family="monospace" font-size="12" fill="#666">z = 0</text>

  <line x1="${originX - 20}" y1="${originY - RIM_TUBE_RADIUS * SZ}" x2="${W - 40}" y2="${originY - RIM_TUBE_RADIUS * SZ}" stroke="#553" stroke-width="1" stroke-dasharray="4 4"/>
  <text x="${W - 190}" y="${originY - RIM_TUBE_RADIUS * SZ - 6}" font-family="monospace" font-size="12" fill="#aa8">rim apex z=2.0</text>

  ${poly("rim", "#7fd4ff")}
  ${poly("bevel", "#ffc46b")}
  ${poly("face", "#9fe8a0")}

  ${
    gap > 0.01
      ? `<line x1="${be.x}" y1="${be.y}" x2="${fe.x}" y2="${fe.y}" stroke="#ff4d4d" stroke-width="2.5" stroke-dasharray="5 4"/>
  <circle cx="${be.x}" cy="${be.y}" r="4" fill="#ff4d4d"/>
  <circle cx="${fe.x}" cy="${fe.y}" r="4" fill="#ff4d4d"/>
  <text x="${be.x - 30}" y="${be.y - 16}" font-family="monospace" font-size="14" fill="#ff6b6b">THE GAP — nothing here</text>`
      : `<circle cx="${fe.x}" cy="${fe.y}" r="4" fill="#7fe8a0"/>
  <text x="${fe.x - 40}" y="${fe.y + 24}" font-family="monospace" font-size="13" fill="#7fe8a0">rim meets face — no seam</text>`
  }

  <circle cx="${rimApex.x}" cy="${rimApex.y}" r="3" fill="#7fd4ff"/>
  <circle cx="${faceApex.x}" cy="${faceApex.y}" r="3" fill="#9fe8a0"/>
  <line x1="${faceApex.x}" y1="${faceApex.y}" x2="${faceApex.x}" y2="${originY - RIM_TUBE_RADIUS * SZ}" stroke="#666" stroke-width="1" stroke-dasharray="3 3"/>
  <text x="${faceApex.x + 10}" y="${faceApex.y - 8}" font-family="monospace" font-size="13" fill="#9fe8a0">face apex z=${faceApexZ.toFixed(2)} — ${
    proud > 0 ? `${proud.toFixed(2)} PROUD of the rim` : `${(-proud).toFixed(2)} BELOW the rim`
  }</text>

  <text x="24" y="${H - 58}" font-family="monospace" font-size="14" fill="#7fd4ff">rim (half-tube)</text>
  ${
    BEVEL_WIDTH > 0
      ? `<text x="200" y="${H - 58}" font-family="monospace" font-size="14" fill="#ffc46b">bevel (slopes UP inward)</text>`
      : `<text x="200" y="${H - 58}" font-family="monospace" font-size="14" fill="#666">bevel (removed)</text>`
  }
  <text x="450" y="${H - 58}" font-family="monospace" font-size="14" fill="#9fe8a0">face (crown, ${proud > 0 ? "proud" : "recessed"})</text>
  <text x="24" y="${H - 32}" font-family="monospace" font-size="14" fill="${gap > 0.01 ? "#ff6b6b" : "#7fe8a0"}">${
    gap > 0.01
      ? `the gap — inner edge to face outer edge: ${gap.toFixed(2)} units, unmodelled`
      : `continuous — one form from rim to apex, face ${proud.toFixed(2)} proud, max tilt ${maxTilt.toFixed(1)}°`
  }</text>
  <text x="24" y="${H - 10}" font-family="monospace" font-size="12" fill="#888">horizontal = distance inward from the card's top edge · vertical = z toward viewer</text>
</svg>`;

writeFileSync(`${OUT}/cross-section.svg`, svg);
await sharp(Buffer.from(svg)).png().toFile(`${OUT}/cross-section.png`);
console.log(`\ndrawing: ${OUT}/cross-section.png`);
