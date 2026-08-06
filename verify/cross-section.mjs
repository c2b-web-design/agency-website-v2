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

import { mkdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const OUT = "verify/out";
mkdirSync(OUT, { recursive: true });

// ── The shipped constants, from answer-card-geometry.ts ─────────────────────
const RIM_TUBE_RADIUS = 2.0;
const BEVEL_RISE_RATIO = 0.8;
const BEVEL_RISE = RIM_TUBE_RADIUS * BEVEL_RISE_RATIO; // 1.6
const BEVEL_WIDTH = 3.0;
const CROWN_HEIGHT = 4.5;
// CROWN_PLATEAU_U (0.72) shapes the LONG axis only. This slice is taken on the
// short axis at u=0, where the plateau term is 1 by construction — so it is
// deliberately not used here rather than missing.
const FACE_TUCK_RATIO = 0.3125;
const FACE_SEAM_SINK = CROWN_HEIGHT + BEVEL_RISE * FACE_TUCK_RATIO;
const CARD_HEIGHT = 48;

const faceRecess = FACE_SEAM_SINK - CROWN_HEIGHT; // 0.5
const bevelInnerZ = BEVEL_RISE;
const faceApexZ = bevelInnerZ - faceRecess;
const faceBaseZ = faceApexZ - CROWN_HEIGHT;

const halfH = CARD_HEIGHT / 2; // 24
const rimPathY = halfH - RIM_TUBE_RADIUS; // tube centre-line
const faceInset = 2 * RIM_TUBE_RADIUS + BEVEL_WIDTH; // 7
const faceHalfH = halfH - faceInset; // 17

/** The crown, exactly as `crownZ` computes it on the short axis (u = 0). */
function crownZ(v) {
  const shortAxis = (1 + Math.cos(v * Math.PI)) / 2;
  return CROWN_HEIGHT * shortAxis;
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
const bevelStartY = rimPathY - RIM_TUBE_RADIUS; // where the tube ends
for (let i = 0; i <= 12; i++) {
  const t = i / 12;
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
console.log(`rim tube        centre y ${rimPathY.toFixed(2)}  radius ${RIM_TUBE_RADIUS}`);
console.log(`  apex          y ${rimPathY.toFixed(2)}  z ${RIM_TUBE_RADIUS.toFixed(2)}   <- highest point of the card`);
console.log(`  inner edge    y ${bevelStartY.toFixed(2)}  z 0.00`);
console.log(`\nbevel           rises ${BEVEL_RISE} over ${BEVEL_WIDTH} inward  (slopes UP toward the centre)`);
console.log(`  inner edge    y ${bevelEnd.y.toFixed(2)}  z ${bevelEnd.z.toFixed(2)}`);
console.log(`\nface            base plane z ${faceBaseZ.toFixed(2)}  crown ${CROWN_HEIGHT}`);
console.log(`  outer edge    y ${faceEdge.y.toFixed(2)}  z ${faceEdge.z.toFixed(2)}`);
console.log(`  apex          y 0.00  z ${faceApexZ.toFixed(2)}`);

console.log("\n── THE JUNCTION ──\n");
const dy = bevelEnd.y - faceEdge.y;
const dz = bevelEnd.z - faceEdge.z;
console.log(`bevel inner edge   (y ${bevelEnd.y.toFixed(2)}, z ${bevelEnd.z.toFixed(2)})`);
console.log(`face outer edge    (y ${faceEdge.y.toFixed(2)}, z ${faceEdge.z.toFixed(2)})`);
console.log(`\ngap                ${Math.hypot(dy, dz).toFixed(2)} units   (dy ${dy.toFixed(2)}, dz ${dz.toFixed(2)})`);
console.log("\n⚠ NOTHING IS MODELLED BETWEEN THOSE TWO POINTS. No wall, no fillet,");
console.log("  no return. The bevel stops and the face begins, with a step between");
console.log("  them that only the head-on orthographic view conceals.");

console.log("\n── PROUD OR RECESSED ──\n");
console.log(`rim apex   z ${RIM_TUBE_RADIUS.toFixed(2)}`);
console.log(`face apex  z ${faceApexZ.toFixed(2)}`);
console.log(
  `\nthe face sits ${(RIM_TUBE_RADIUS - faceApexZ).toFixed(2)} BELOW the rim's apex — recessed, not proud.`,
);
console.log("⚠ Carl's sketch has the crown standing ABOVE the rim so it can throw");
console.log("  light onto the other faces. That is the reverse of this.");

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

  <line x1="${be.x}" y1="${be.y}" x2="${fe.x}" y2="${fe.y}" stroke="#ff4d4d" stroke-width="2.5" stroke-dasharray="5 4"/>
  <circle cx="${be.x}" cy="${be.y}" r="4" fill="#ff4d4d"/>
  <circle cx="${fe.x}" cy="${fe.y}" r="4" fill="#ff4d4d"/>
  <text x="${be.x - 30}" y="${be.y - 16}" font-family="monospace" font-size="14" fill="#ff6b6b">THE GAP — nothing here</text>

  <circle cx="${rimApex.x}" cy="${rimApex.y}" r="3" fill="#7fd4ff"/>
  <circle cx="${faceApex.x}" cy="${faceApex.y}" r="3" fill="#9fe8a0"/>
  <line x1="${faceApex.x}" y1="${faceApex.y}" x2="${faceApex.x}" y2="${originY - RIM_TUBE_RADIUS * SZ}" stroke="#666" stroke-width="1" stroke-dasharray="3 3"/>
  <text x="${faceApex.x + 10}" y="${faceApex.y - 8}" font-family="monospace" font-size="13" fill="#9fe8a0">face apex z=${faceApexZ.toFixed(2)} — 0.9 BELOW the rim</text>

  <text x="24" y="${H - 58}" font-family="monospace" font-size="14" fill="#7fd4ff">rim (half-tube)</text>
  <text x="200" y="${H - 58}" font-family="monospace" font-size="14" fill="#ffc46b">bevel (slopes UP inward)</text>
  <text x="450" y="${H - 58}" font-family="monospace" font-size="14" fill="#9fe8a0">face (crown, recessed)</text>
  <text x="24" y="${H - 32}" font-family="monospace" font-size="14" fill="#ff6b6b">the gap — bevel inner edge to face outer edge: ${Math.hypot(dy, dz).toFixed(2)} units, unmodelled</text>
  <text x="24" y="${H - 10}" font-family="monospace" font-size="12" fill="#888">horizontal = distance inward from the card's top edge · vertical = z toward viewer</text>
</svg>`;

writeFileSync(`${OUT}/cross-section.svg`, svg);
await sharp(Buffer.from(svg)).png().toFile(`${OUT}/cross-section.png`);
console.log(`\ndrawing: ${OUT}/cross-section.png`);
