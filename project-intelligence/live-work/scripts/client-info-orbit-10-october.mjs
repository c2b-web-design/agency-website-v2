/** THE CLIENT INFO ORBIT, DRAWN (10 October 2026) — Carl: "i want you to see the lights orbit". The rig draws nothing
 *  and is a locked file, so its path is EVALUATED here: `fieldPlacements` imported from the real module; `orbitFrame`,
 *  `orbitPosition`, `orbitPhase`, `aimPoint` and the relay copied VERBATIM from contact-field-light-rig.tsx at HEAD
 *  (9c3ff88) with their constants. ⚠ A COPY: if the rig changes, this goes stale — compare before trusting it.
 *  The layer size is read from the running page (the field's canvas at 1412 × 700). Writes the samples as JSON. */
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import { fieldPlacements } from "../../../components/enquiry/contact-field-geometry.ts";
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const p = await (await b.newContext({ viewport: { width: 1412, height: 700 } })).newPage();
await p.goto("http://localhost:3000/start?skip=1", { waitUntil: "networkidle" });
await p.waitForTimeout(9000);
const layer = await p.evaluate(() => { const c = [...document.querySelectorAll("canvas")].sort((a, b) => b.clientWidth * b.clientHeight - a.clientWidth * a.clientHeight)[0]; const r = c.getBoundingClientRect(); return { w: c.clientWidth, h: c.clientHeight, x: r.x, y: r.y }; });
await b.close();
// ── copied from the rig ──
const EDGE_STANDOFF = 200, ORBIT_SEMI_MINOR = 400, ORBIT_DEPTH = 400, FACE_EXIT = 0.42, FACE_ENTER = 0.86, BEHIND_SPEED = 6.0;
const LAP_MS = 10000, RELAY_TRIGGER = 0.5694, AIM_REACH = 620, AIM_DIP = 96, HANDOFF_MS = 320;
function orbitFrame(pl) { const b1 = pl[0], b4 = pl[3]; const aim1 = { x: b1.x - b1.width / 2, y: b1.y }, aim4 = { x: b4.x + b4.width / 2, y: b4.y };
  const dx = aim4.x - aim1.x, dy = aim4.y - aim1.y, span = Math.hypot(dx, dy), ux = dx / span, uy = dy / span;
  const end1 = { x: aim1.x - ux * EDGE_STANDOFF, y: aim1.y - uy * EDGE_STANDOFF }, end4 = { x: aim4.x + ux * EDGE_STANDOFF, y: aim4.y + uy * EDGE_STANDOFF };
  return { cx: (end1.x + end4.x) / 2, cy: (end1.y + end4.y) / 2, semiMajor: Math.hypot(end4.x - end1.x, end4.y - end1.y) / 2, ux, uy, px: -uy, py: ux }; }
function orbitPosition(t, f) { const a = t * Math.PI * 2; const along = Math.cos(a) * f.semiMajor, across = Math.sin(a) * ORBIT_SEMI_MINOR;
  return [f.cx + f.ux * along + f.px * across, f.cy + f.uy * along + f.py * across, Math.sin(a) * ORBIT_DEPTH]; }
function orbitPhase(ms) { const rateAt = (t) => { const ease = (u) => u * u * (3 - 2 * u); if (t <= FACE_EXIT || t >= FACE_ENTER) return 1;
    const mid = (FACE_EXIT + FACE_ENTER) / 2, half = (FACE_ENTER - FACE_EXIT) / 2, k = 1 - Math.abs(t - mid) / half; return 1 + (BEHIND_SPEED - 1) * ease(Math.max(0, Math.min(1, k))); };
  const N = 512, dt = 1 / N; let total = 0; const cum = [0]; for (let i = 0; i < N; i++) { total += dt / rateAt((i + 0.5) * dt); cum.push(total); }
  const target = ((ms % LAP_MS) / LAP_MS) * total; let lo = 0, hi = N; while (lo < hi) { const m = (lo + hi) >> 1; if (cum[m] < target) lo = m + 1; else hi = m; }
  const i = Math.max(1, lo), sp = cum[i] - cum[i - 1] || 1e-9; return Math.min(1, ((i - 1) + (target - cum[i - 1]) / sp) * dt); }
function aimPoint(t, f) { const a = t * Math.PI * 2, along = -Math.cos(a) * AIM_REACH, across = -Math.sin(a) * AIM_DIP; return [f.cx + f.ux * along + f.px * across, f.cy + f.uy * along + f.py * across, 0]; }
function gainAt(cycle) { const ease = (u) => u * u * (3 - 2 * u), t = cycle / LAP_MS, h = HANDOFF_MS / LAP_MS; return ease(Math.min(1, Math.min(t / h, (1 - t) / h))); }
// ── sampled ──
const pl = fieldPlacements(layer.w, layer.h), f = orbitFrame(pl);
const samples = [];
for (let ms = 0; ms < LAP_MS; ms += 100) {
  const legs = [0, RELAY_TRIGGER * LAP_MS].map((off) => { const cycle = (((ms + off) % LAP_MS) + LAP_MS) % LAP_MS, ph = orbitPhase(cycle); return { phase: ph, pos: orbitPosition(ph, f), aim: aimPoint(ph, f), gain: gainAt(cycle) }; });
  samples.push({ ms, A: legs[0], B: legs[1] });
}
writeFileSync("project-intelligence/live-work/screenshots/client-info-light-10-october/orbit.json", JSON.stringify({ layer, boxes: pl, frame: f, samples }, null, 1));
console.log("layer", layer, "| frame", { cx: f.cx.toFixed(1), cy: f.cy.toFixed(1), semiMajor: f.semiMajor.toFixed(1) }, "| samples", samples.length);
