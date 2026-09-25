// The four cards in the new room, from Carl's rulings of 25 September 2026, through the solved camera
// (camera-solve-25-september.md). Measured on the MASTER (4000 x 2250); drawn on the PLATE
// (office-image-3-edited.png, 3632 x 2048) by the D-095 mapping.
//
// Rulings: wall cards the SAME SIZE (the TV's outer frame); CA's left and CB's right equally far from the
// wall's edges (bookcase side, room corner); the gap centred on the wall; CB's bottom rim just above the
// chair back; the above card trim-to-trim on the cabinet front, area = one wall card; the floor card
// ~10 cm in FRONT of the credenza (NOT flush), parallel to it, superseded 25 Sept: above and floor cards are FOUR DOORS wide, centred on the wall centre line; the seesaw moves them apart if the floor card must go left.
// Edge positions below were read from brightness profiles (room-model-office3.mjs and this session's log).
import sharp from "file:///C:/Users/Carl%20Buckley/agency-website-v2/node_modules/sharp/lib/index.js";
const OUT = process.argv[2];
const GAP_RULE = process.argv[3] || "equal"; // "equal" (margin = gap) or "sketch" (gap = 0.8 x margin, Carl's rough diagram)
const CLEAR_MM = 10;     // CB bottom rim above the chair tip, at the wall
const FLOOR_OFF_MM = 30;  // (superseded below) 30 mm in front of the cabinet front still read too far out
const SKIRT_FACE_MM = 14, SKIRT_H_MM = 101; // the back wall's skirting, seen UNDER the floating cabinet: its face (floor line) and height (96–101 mm; right wall 102–105)
const FLOOR_D_MM = SKIRT_FACE_MM + SKIRT_H_MM; // Carl, 25 Sept: "the skirtings height is how far it should be from it"
// (retired) UNDER_CTR_MM = 20 — the floor card top 20 mm under the counter; superseded by the handle-height top
const DESK_MM = 750;      // ⚠ ASSUMED: the scale ruler

// ── camera (master frame)
const f = 2013.7, cx = 2000, cy = 1125, VB = [8065, 1240.6], VR = [1329.3, 1236.0];
const VV = [cx, cy - f / Math.tan(3.22 * Math.PI / 180)];
const sub = (a, b) => a.map((v, i) => v - b[i]), add = (a, b) => a.map((v, i) => v + b[i]), mul = (a, s) => a.map((v) => v * s);
const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0), unit = (a) => mul(a, 1 / Math.sqrt(dot(a, a)));
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const ray = (p) => [p[0] - cx, p[1] - cy, f], proj = (X) => [cx + f * X[0] / X[2], cy + f * X[1] / X[2]];
const dB = unit(ray(VB)), dR = unit(ray(VR)); let dUp = unit(cross(dB, dR)); if (dUp[1] > 0) dUp = mul(dUp, -1);
const Cc = unit(ray([2601.0, 1238.3]));
const onPlane = (p, n, P0) => mul(ray(p), dot(P0, n) / dot(ray(p), n));
const onBack = (p) => onPlane(p, dR, Cc), onRight = (p) => onPlane(p, dB, Cc);
const onLevel = (p, h) => mul(ray(p), h / dot(ray(p), dUp));
const U = (X) => dot(sub(X, Cc), dB), V = (X) => dot(X, dUp), D = (X) => -dot(sub(X, Cc), dR);
// world point from (u along the back wall from the corner, v height rel. eye, d in front of the back wall)
const P = (u, v, d) => add(add(add(Cc, mul(dB, u)), mul(dR, -d)), mul(dUp, v - V(Cc)));
const hl = (x, y) => (xx) => VB[1] + (y - VB[1]) / (x - VB[0]) * (xx - VB[0]);          // line through VB and (x,y)
const hr = (x, y) => (xx) => VR[1] + (y - VR[1]) / (x - VR[0]) * (xx - VR[0]);          // through VR
const vl = (x, y) => (yy) => VV[0] + (x - VV[0]) / (y - VV[1]) * (yy - VV[1]);          // vertical through VV
const meet = (h, v) => { let x = v(1000); for (let i = 0; i < 30; i++) x = v(h(x)); return [x, h(x)]; };
const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;

// ── measured features (master px), from profiles
const tvTop = hl(1200, 746), tvBot = hl(1350, 1275), tvL = vl(594, 1050), tvR = vl(1571.6, 820);
const floorR = hr(2950, 2013), deskR = hr(3350, 1566);
const ledBack = hl(1450, 590), cabTop = hl(1450, 205.5), trimBot = hl(1450, 501);
const ctrBack = hl(1350, 1515), ctrFront = hl(1350, 1558.5);
const bookcaseX = 524, chairTip = [2104, 1261]; // (retired: cubbyX = 2110, the old right-edge rule)
const sofRightPt = [3200, 275], sofRightWall = [3445, 330]; // the right run's end edge: front corner, and where it meets the wall

// ── the room
const vFloor = mean([2800, 2950, 3100].map((x) => V(onRight([x, floorR(x)]))));
const vDesk = mean([3350, 3500, 3650].map((x) => V(onRight([x, deskR(x)]))));
const MM = DESK_MM / (vDesk - vFloor);
const mm = (u) => (u * MM).toFixed(0);
const vLed = mean([800, 1400, 2000].map((x) => V(onBack([x, ledBack(x)]))));
const cabDepth = mean([900, 1300, 1700].map((x) => D(onLevel([x, trimBot(x)], vLed))));
// cross-check the depth from the right run's end edge (front corner vs the wall point, at the LED height)
const endFront = onLevel(sofRightPt, V(onRight(sofRightWall)));
const cabDepthR = -dot(sub(endFront, Cc), dB);
const vCtr = mean([1300, 1350, 1400].map((x) => V(onBack([x, ctrBack(x)]))));
const ctrDepth = mean([1300, 1350, 1400].map((x) => D(onLevel([x, ctrFront(x)], vCtr))));
const tv = { TL: onBack(meet(tvTop, tvL)), TR: onBack(meet(tvTop, tvR)), BL: onBack(meet(tvBot, tvL)), BR: onBack(meet(tvBot, tvR)) };
const tvW = mean([U(tv.TR) - U(tv.TL), U(tv.BR) - U(tv.BL)]), tvH = mean([V(tv.TL) - V(tv.BL), V(tv.TR) - V(tv.BR)]);
const uWallL = U(onBack([bookcaseX, 1000])), uWallR = 0;
const cabTopV = mean([1100, 1450, 1800].map((x) => V(onLevel([x, cabTop(x)], 0) && onPlane([x, cabTop(x)], dR, P(0, 0, cabDepth)))));
const trimBotV = mean([1100, 1450, 1800].map((x) => V(onPlane([x, trimBot(x)], dR, P(0, 0, cabDepth)))));

console.log(`SCALE: desk ${DESK_MM} mm (ASSUMED) = ${(vDesk - vFloor).toFixed(4)} units → 1 unit = ${MM.toFixed(0)} mm`);
console.log(`  eye height ${mm(-vFloor)} mm   | TV outer frame ${mm(tvW)} x ${mm(tvH)} mm (aspect ${(tvW / tvH).toFixed(3)})`);
console.log(`  LED height ${mm(vLed - vFloor)} mm above floor | cabinet depth ${mm(cabDepth)} mm (back run) vs ${mm(cabDepthR)} mm (right run's end edge)`);
console.log(`  cabinet front: top ${mm(cabTopV - vFloor)} mm, trim bottom ${mm(trimBotV - vFloor)} mm → height ${mm(cabTopV - trimBotV)} mm`);
console.log(`  counter height ${mm(vCtr - vFloor)} mm, front ${mm(ctrDepth)} mm off the wall`);
console.log(`  back wall, bookcase to corner: ${mm(uWallR - uWallL)} mm`);

// ── wall cards
const w = tvW, h = tvH;
const free = (uWallR - uWallL) - 2 * w;
const margin = GAP_RULE === "sketch" ? free / 2.8 : free / 3, gap = free - 2 * margin;
const uCA0 = uWallL + margin, uCB0 = uCA0 + w + gap;
const vChairWall = V(onBack(chairTip));
const vBot = vChairWall + CLEAR_MM / MM, vTop = vBot + h;
console.log(`\nWALL CARDS (${GAP_RULE}): ${mm(w)} x ${mm(h)} mm each; margins ${mm(margin)} mm, gap ${mm(gap)} mm`);
console.log(`  chair tip on the wall at ${mm(vChairWall - vFloor)} mm; card bottoms ${mm(vBot - vFloor)} mm, tops ${mm(vTop - vFloor)} mm above the floor`);
console.log(`  TV was ${mm(V(tv.BL) - vFloor)}–${mm(V(tv.TL) - vFloor)} mm: the cards sit ${mm(vBot - V(tv.BL))} mm higher`);
const chairU = U(onBack(chairTip));
console.log(`  chair tip at u ${mm(chairU)} mm; CB spans u ${mm(uCB0)}..${mm(uCB0 + w)} → ${chairU > uCB0 && chairU < uCB0 + w ? "INSIDE CB (the rule binds)" : "OUTSIDE CB"}`);
const CA = [[uCA0, vTop, 0], [uCA0 + w, vTop, 0], [uCA0 + w, vBot, 0], [uCA0, vBot, 0]];
const CB = [[uCB0, vTop, 0], [uCB0 + w, vTop, 0], [uCB0 + w, vBot, 0], [uCB0, vBot, 0]];

// ── floor card: stands on the floor, FLOOR_OFF in front of the cabinet front; the same height as the above card
const DOOR_MM = 415.5; // gap-centre to gap-centre, door-gaps-office3.mjs (412-419 across five doors)
const DOORS = +(process.argv[4] || 4), SHIFT_MM = +(process.argv[5] || 0); // floor card LEFT by SHIFT, above card RIGHT by the same (the seesaw)
const area = w * h; void area;
const dFloorCard = FLOOR_D_MM / MM; void FLOOR_OFF_MM;
const fw = DOORS * DOOR_MM / MM; let fh; // height set below = the above card (Carl: "same height as above")
const uCentre0 = (uWallL + uWallR) / 2;
// Carl, 25 Sept: the floor card LEFT so its left edge lines up with the cubby console (PS4) left edge in the picture: x 977.5 at y 1858 (front face)
const ALIGN = process.argv[6] ? process.argv[6].split(",").map(Number) : null;
const uAlign = ALIGN ? U(onPlane(ALIGN, dR, P(0, 0, dFloorCard))) : null;
const uF0 = ALIGN ? uAlign : uCentre0 - fw / 2 - SHIFT_MM / MM, uF1 = uF0 + fw;
const ABOVE_SHIFT_MM = +(process.argv[7] || 0); // the above card RIGHT (the seesaw) — separate from the floor card now
// ── above card: trim to trim on the cabinet front, area = one wall card, seesaw about the wall centre
const uCentre = uCentre0, s = uCentre - (uF0 + uF1) / 2, sA = ABOVE_SHIFT_MM / MM;
const ah = cabTopV - trimBotV; fh = ah; const aw = DOORS * DOOR_MM / MM, uA0 = uCentre + sA - aw / 2;
const AB = [[uA0, cabTopV, cabDepth], [uA0 + aw, cabTopV, cabDepth], [uA0 + aw, trimBotV, cabDepth], [uA0, trimBotV, cabDepth]];
// Carl, 25 Sept: the floor card TALLER — its top level with the top drawer handle IN THE PICTURE — and the LEFT edge in, keeping the
// above card's AREA; the right edge stays. Handle centre line on the master: (1545, 1628) (the middle stack, x 1495–1595).
const HANDLE = process.argv[8] ? process.argv[8].split(",").map(Number) : null;
let uF0f = uF0;
if (HANDLE) { fh = V(onPlane(HANDLE, dR, P(0, 0, dFloorCard))) - vFloor; uF0f = uF1 - (aw * ah) / fh; }
const fwf = uF1 - uF0f;
const FL = [[uF0f, vFloor + fh, dFloorCard], [uF1, vFloor + fh, dFloorCard], [uF1, vFloor, dFloorCard], [uF0f, vFloor, dFloorCard]];
console.log(`FLOOR CARD (final): ${mm(fwf)} x ${mm(fh)} mm — area ${(fwf * fh * MM * MM / 1e6).toFixed(4)} m² vs the above card ${(aw * ah * MM * MM / 1e6).toFixed(4)} m²; left edge moved in ${mm(uF0f - uF0)} mm`);
console.log(`\nFLOOR CARD: ${mm(fw)} x ${mm(fh)} mm, ${SKIRT_H_MM} mm in front of the skirting face (${mm(dFloorCard)} mm off the wall; the cabinet front is ${mm(ctrDepth)}, its underside ~310 mm) (${DOORS} doors, centred on the wall centre line then SHIFT_MM left); centre ${mm(s)} mm LEFT of the wall centre`);
console.log(`ABOVE CARD: ${mm(aw)} x ${mm(ah)} mm (${DOORS} doors) on the cabinet front (${mm(cabDepth)} mm off the wall); centre ${mm(sA)} mm RIGHT of the wall centre (the seesaw)`);
  // chair clearance: the u, on the floor card plane, of chair points that fall inside the card
  { const onCard = (p) => onPlane(p, dR, P(0, 0, dFloorCard)); const pts = { "back rail": [2122, 1600], "lower back": [2140, 1750], "seat frame": [2160, 1850], "column": [2180, 1950], "leg top": [2160, 1990], "leg": [2100, 2030], "caster": [2060, 2040] };
    const q = FL.map(([u, v, d]) => proj(P(u, v, d))); // master px, TL TR BR BL
    const inside = ([x, y]) => { let s0 = 0; for (let i = 0; i < 4; i++) { const a = q[i], b = q[(i + 1) % 4]; const c = (b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0]); if (c !== 0) { if (s0 === 0) s0 = Math.sign(c); else if (Math.sign(c) !== s0) return false; } } return true; };
    let need = -Infinity;
    for (const [k, p] of Object.entries(pts)) { const up = U(onCard(p)); const inRows = p[1] >= Math.min(q[0][1], q[1][1]) - 0 && p[1] <= Math.max(q[2][1], q[3][1]); const hit = inside(p); if (hit) need = Math.max(need, uF1 - up); console.log(`  chair ${k.padEnd(10)} (${p}) ${hit ? "INSIDE the card" : "outside"}${inRows ? `; in its rows, needs the right edge ${mm(uF1 - up)} mm further left` : "; above or below the card"}`); }
    console.log(`  ⇒ to clear the chair, shift the floor card LEFT by ≥ ${need === -Infinity ? 0 : mm(need)} mm (and the above card RIGHT by the same)`); }
console.log(`  wall centre u ${mm(uCentre)} mm; above card spans u ${mm(uA0)}..${mm(uA0 + aw)} vs the wall ${mm(uWallL)}..0`);

// ── to the plate
const toPlate = ([x, y]) => [(x - 0.2) / 1.1011, (y - 4.8) / 1.09445];
const cards = { CA, CB, above: AB, floor: FL };
console.log("\nCORNERS on the PLATE (3632 x 2048), TL TR BR BL — px and fractions:");
const quads = {};
for (const [k, c] of Object.entries(cards)) {
  const q = c.map(([u, v, d]) => toPlate(proj(P(u, v, d)))); quads[k] = q;
  console.log(`  ${k.padEnd(6)} ${q.map(([x, y]) => `(${x.toFixed(1)}, ${y.toFixed(1)})`).join(" ")}`);
  console.log(`  ${"".padEnd(6)} ${q.map(([x, y]) => `(${(x / 3632).toFixed(5)}, ${(y / 2048).toFixed(5)})`).join(" ")}`);
}
const chairPlate = toPlate(chairTip), cbBotAtChair = (() => { const [a, b] = [quads.CB[3], quads.CB[2]]; return a[1] + (b[1] - a[1]) * (chairPlate[0] - a[0]) / (b[0] - a[0]); })();
console.log(`  CB's bottom edge above the chair tip on the plate: ${(chairPlate[1] - cbBotAtChair).toFixed(1)} px`);

if (OUT) {
  const PW = 3632, PH = 2048;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${PW}" height="${PH}">`;
  const col = { CA: "#00e5ff", CB: "#00e5ff", above: "#ff4fd8", floor: "#ffe14f" };
  for (const [k, q] of Object.entries(quads)) svg += `<polygon points="${q.map((p) => p.join(",")).join(" ")}" fill="${col[k]}" fill-opacity="0.12" stroke="${col[k]}" stroke-width="5"/><text x="${q[0][0] + 14}" y="${q[0][1] + 52}" font-size="44" font-family="sans-serif" fill="${col[k]}">${k}</text>`;
  // the wall centre line (vertical through VV), and the chair tip
  const cT = toPlate(proj(P(uCentre, V(Cc) + 0.6, 0))), cBm = toPlate(proj(P(uCentre, vFloor, 0)));
  svg += `<line x1="${cT[0]}" y1="${cT[1]}" x2="${cBm[0]}" y2="${cBm[1]}" stroke="#ffffff" stroke-width="3" stroke-dasharray="18 12" opacity="0.8"/>`;
  svg += `<circle cx="${chairPlate[0]}" cy="${chairPlate[1]}" r="10" fill="#ff3030"/>`;
  svg += `</svg>`;
  const buf = await sharp("C:/Users/Carl Buckley/agency-website-v2/brand-assets/office-image-3-edited.png").composite([{ input: Buffer.from(svg) }]).jpeg({ quality: 88 }).toBuffer();
  await sharp(buf).resize(2000).toFile(OUT);
  console.log(`overlay -> ${OUT}`);
}

// ── EXPORT for the scene (components/about/about-room.ts): room constants + card specs in mm, and a
// transcription check through three.js's camera convention (camera at the origin, pitch about X, -Z forward).
if (process.env.EXPORT) {
  const th = Math.atan((cy - 1238.3) / f) * -1; // pitch UP, radians (camera looks up by th)
  const toCam3 = (X) => [X[0], -X[1], -X[2]];
  const rotX = (v, a) => [v[0], v[1] * Math.cos(a) - v[2] * Math.sin(a), v[1] * Math.sin(a) + v[2] * Math.cos(a)];
  const toWorld = (X) => rotX(toCam3(X), th); // solver camera coords -> three world (units: solver)
  const dBw = toWorld(dB), dRw = toWorld(dR), upW = toWorld(dUp), Cw = toWorld(Cc);
  const eyeMm = -vFloor * MM;
  const Cfl = Cw.map((v, i) => v + upW[i] * (vFloor - V(Cc))); // the room corner AT THE FLOOR, in world
  const yaw = Math.atan2(-dBw[2], dBw[0]); // local +X -> dB under a Y rotation
  console.log("\nEXPORT:");
  console.log(JSON.stringify({
    pitchUpDeg: th * 180 / Math.PI, yawDeg: yaw * 180 / Math.PI,
    dBw: dBw.map((v) => +v.toFixed(6)), dRw: dRw.map((v) => +v.toFixed(6)), upW: upW.map((v) => +v.toFixed(6)),
    cornerFloorMm: Cfl.map((v) => +(v * MM).toFixed(2)), eyeMm: +eyeMm.toFixed(1), mmPerSolverUnit: +MM.toFixed(2),
    cards: {
      CA: { uLeftMm: +(uCA0 * MM).toFixed(1), bottomMm: +((vBot - vFloor) * MM).toFixed(1), offWallMm: 0, widthMm: +(w * MM).toFixed(1), heightMm: +(h * MM).toFixed(1) },
      CB: { uLeftMm: +(uCB0 * MM).toFixed(1), bottomMm: +((vBot - vFloor) * MM).toFixed(1), offWallMm: 0, widthMm: +(w * MM).toFixed(1), heightMm: +(h * MM).toFixed(1) },
      CS: { uLeftMm: +(uA0 * MM).toFixed(1), bottomMm: +((trimBotV - vFloor) * MM).toFixed(1), offWallMm: +(cabDepth * MM).toFixed(1), widthMm: +(aw * MM).toFixed(1), heightMm: +(ah * MM).toFixed(1) },
      CD: { uLeftMm: +(uF0f * MM).toFixed(1), bottomMm: 0, offWallMm: +(dFloorCard * MM).toFixed(1), widthMm: +((uF1 - uF0f) * MM).toFixed(1), heightMm: +(fh * MM).toFixed(1) },
    },
  }, null, 1));
  // transcription check: rebuild CA's TL corner from the exported mm numbers the way the scene will
  const PW = 2560, PH = 1435, fPlate = f / (3999.2 / 2560), vfov = 2 * Math.atan((PH / 2) / fPlate);
  const worldFromRoom = (uMm, hMm, dMm) => { const s = 1 / MM; return [0, 1, 2].map((i) => Cfl[i] + dBw[i] * uMm * s - dRw[i] * dMm * s + upW[i] * hMm * s); };
  const toPlate2560 = (Wp) => { const c = rotX(Wp, -th); const x = c[0] / -c[2], y = c[1] / -c[2]; const tv = Math.tan(vfov / 2), aspect = PW / PH; return [(x / (tv * aspect) + 1) / 2 * PW + (PW / 2 - (cx - 0.2) / (3999.2 / 2560)) * 0, (1 - y / tv) / 2 * PH]; };
  const chk = [["CA TL", worldFromRoom(uCA0 * MM, (vTop - vFloor) * MM, 0), quads.CA[0]], ["CD BR", worldFromRoom(uF1 * MM, 0, dFloorCard * MM), toPlate(proj(P(uF1, vFloor, dFloorCard)))]];
  for (const [k, Wp, q] of chk) { const p = toPlate2560(Wp); const q2560 = [q[0] * 2560 / 3632 * (3632 / (3999.2 / 1.1011)) , 0]; void q2560; const exp = [q[0] * 2560 / 3632, q[1] * 1435 / 2048]; console.log(`check ${k}: scene path (${p[0].toFixed(2)}, ${p[1].toFixed(2)}) vs overlay path (${exp[0].toFixed(2)}, ${exp[1].toFixed(2)}) on the 2560x1435 plate`); }
  console.log(`plate 2560x1435: f ${fPlate.toFixed(2)} px, vFOV ${(vfov * 180 / Math.PI).toFixed(3)} deg, aspect ${(PW / PH).toFixed(5)}`);
}
