/**
 * THE ORBIT — Carl's design, 25 September 2026: two spot lights on ONE fixed ellipse in front of the
 * cards, starting together at mirror points (CA's top-left, CB's bottom-right), both travelling the same
 * way round; each light's aim turns so it sweeps across the card it passes.
 *
 * Asks, for a candidate (aim pull k, cone, depths): does EVERY card get lit, WHEN, and at what angle?
 * Room mm: u along the back wall, v up from the floor, w out from the wall. Cards face +w.
 *
 *   node project-intelligence/live-work/scripts/orbit-design.mjs [k] [coneDeg] [wMin] [wMax] [bottomFrac]
 */
const [k = 0.55, coneDeg = 40, wMin = 200, wMax = 700, bottomFrac = 0.6] = process.argv.slice(2).map(Number);

const CARDS = {
  CA: { uLeft: -3115.2, bottom: 1107.0, off: 17.7, w: 1331.8, h: 805.1 },
  CB: { uLeft: -1557.6, bottom: 1107.0, off: 17.7, w: 1331.8, h: 805.1 },
  CS: { uLeft: -2501.5, bottom: 2163.8, off: 410.6, w: 1662.0, h: 422.7 },
  CD: { uLeft: -2352.2, bottom: 0, off: 115.0, w: 1284.5, h: 546.9 },
};
const centre = (c) => [c.uLeft + c.w / 2, c.bottom + c.h / 2, c.off];

const C = [(CARDS.CA.uLeft + CARDS.CB.uLeft + CARDS.CB.w) / 2, CARDS.CA.bottom + CARDS.CA.h / 2];
const du = CARDS.CA.uLeft - C[0], dv = CARDS.CA.bottom + CARDS.CA.h - C[1];
const b = C[1] - CARDS.CD.h * bottomFrac;
const a = Math.abs(du) / Math.sqrt(1 - (dv / b) ** 2);
const phi0 = Math.atan2(dv / b, du / a);
console.log(`centre u ${C[0].toFixed(0)} v ${C[1].toFixed(0)} · a ${a.toFixed(0)} b ${b.toFixed(0)} · top v ${(C[1] + b).toFixed(0)} bottom v ${(C[1] - b).toFixed(0)} · left u ${(C[0] - a).toFixed(0)} right u ${(C[0] + a).toFixed(0)} · start φ ${(phi0 * 180 / Math.PI).toFixed(1)}°`);

const pos = (phi) => [C[0] + a * Math.cos(phi), C[1] + b * Math.sin(phi), wMin + (wMax - wMin) * Math.sin(phi - phi0) ** 2];
/* AIM: k < 0 → the proximity-weighted centre of the cards (power -k): the light looks at the card it is
   passing, blending smoothly between cards. k >= 0 → the orbit centre pulled by k (the first rule). */
const aim = (P) => {
  if (k >= 0) return [C[0] + k * (P[0] - C[0]), C[1] + k * (P[1] - C[1]), 0];
  let sw = 0; const acc = [0, 0, 0];
  for (const c of Object.values(CARDS)) {
    const cc = centre(c); const wgt = 1 / Math.max(norm(sub(cc, P)), 1) ** -k;
    sw += wgt; cc.forEach((x, i) => (acc[i] += wgt * x));
  }
  return acc.map((x) => x / sw);
};
const sub = (p, q) => p.map((x, i) => x - q[i]);
const norm = (v) => Math.hypot(...v);
const dot = (p, q) => p.reduce((s, x, i) => s + x * q[i], 0);
const cone = (coneDeg * Math.PI) / 180;

const STEPS = 72; // per full lap
const rows = [];
for (let i = 0; i < STEPS; i++) {
  const t = i / STEPS; // fraction of a full lap
  const row = { t, lit: {} };
  for (const L of [0, 1]) {
    const phi = phi0 + Math.PI * L + 2 * Math.PI * t;
    const P = pos(phi);
    const T = aim(P);
    const axis = sub(T, P);
    for (const [id, c] of Object.entries(CARDS)) {
      const cc = centre(c);
      const toCard = sub(cc, P);
      const ang = Math.acos(dot(axis, toCard) / (norm(axis) * norm(toCard)));
      const ndl = -toCard[2] / norm(toCard); // card normal +w; light must be in front
      if (ang < cone && ndl > 0) {
        const irr = ((norm(axis) / 1000) ** 2 / (norm(toCard) / 1000) ** 2) * ndl; // exposure 1 at the aim point
        (row.lit[id] ??= []).push(`L${L + 1} ${ndl.toFixed(2)}/${irr.toFixed(2)}`);
      }
    }
  }
  rows.push(row);
}
console.log(`k ${k} · cone ${coneDeg}° · w ${wMin}–${wMax} · lap in ${STEPS} steps. Cell = light N·L/irradiance at the card centre.`);
for (const r of rows) {
  if (r.t * STEPS % 3) continue;
  const cell = (id) => (r.lit[id] ?? ["·"]).join(" ").padEnd(26);
  console.log(`${(r.t * 100).toFixed(0).padStart(3)}%  CA ${cell("CA")} CB ${cell("CB")} CS ${cell("CS")} CD ${cell("CD")}`);
}
for (const id of Object.keys(CARDS)) {
  const n = rows.filter((r) => r.lit[id]).length;
  console.log(`${id}: lit ${((100 * n) / STEPS).toFixed(0)}% of the lap`);
}

/* ── THE LULLS — Carl: "there is a point when between cards theres hardly anything going on. It can be
   reversed, given an element of randomness." Activity = the brightest card at each moment (either light);
   the lulls are its local minima — where a reversal is invisible, because nothing is lit to see it turn. */
const FINE = 720;
const activity = [];
for (let i = 0; i < FINE; i++) {
  const t = i / FINE;
  let best = 0;
  for (const L of [0, 1]) {
    const P = pos(phi0 + Math.PI * L + 2 * Math.PI * t);
    const T = aim(P);
    const axis = sub(T, P);
    for (const c of Object.values(CARDS)) {
      const toCard = sub(centre(c), P);
      const ang = Math.acos(dot(axis, toCard) / (norm(axis) * norm(toCard)));
      const ndl = -toCard[2] / norm(toCard);
      if (ang < cone && ndl > 0) best = Math.max(best, ((norm(axis) / 1000) ** 2 / (norm(toCard) / 1000) ** 2) * ndl);
    }
  }
  activity.push(best);
}
const peak = Math.max(...activity);
const minima = activity
  .map((v, i) => ({ i, v }))
  .filter(({ i, v }) => v < activity[(i + FINE - 1) % FINE] && v <= activity[(i + 1) % FINE]);
console.log(`\nactivity: peak ${peak.toFixed(2)} · local minima (lap %, level):`);
for (const m of minima) console.log(`  ${((100 * m.i) / FINE).toFixed(1)}%  ${m.v.toFixed(3)}  (${((100 * m.v) / peak).toFixed(0)}% of peak)`);
