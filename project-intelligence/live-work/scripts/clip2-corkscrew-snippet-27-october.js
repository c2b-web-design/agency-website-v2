// ⛔ RETIRED 27 October 2026 (session 2): computed moves are SHAPE CLIPS on the bench now (the Corkscrew panel, or the dev
// hook `window.__benchPlace`). Kept, unchanged below, as PARITY A's reference — `bench-chain-check` runs this file in Node's
// `vm` and the shape matches its baked samples to 0.0013 mm. ⚠ It writes the v2 key, which the v3 bench never reads again.
// CLIP 2 — the corkscrew (D-104), TAKE 2: the start eased (Carl: "It moves off too fast"). Paste into the console on
// /proto/camera. Adds ONE clip on clip 1's track, starting where clip 1 ends; REPLACES an earlier corkscrew clip in place.
// Backs up the chain first; never touches the v1 (R1) copy. Delete the clip on the bench to remove it.
(() => {
  const K = "c2b-camera-bench-chain-v2", BACKUP = K + "-backup-before-clip2-take2";
  const raw = localStorage.getItem(K);
  if (!raw) return console.log("CLIP 2: no recording found on this bench. Nothing changed.");
  const chain = JSON.parse(raw);
  const isOld = (c) => String(c.id).startsWith("clip2-corkscrew");
  const old = chain.clips.filter(isOld);
  chain.clips = chain.clips.filter((c) => !isOld(c));
  const u = window.__cameraBench && window.__cameraBench.units;
  if (!u) return console.log("CLIP 2: the bench is not ready. Wait for the arch, then paste again.");
  const { d, up, zc } = u;
  const end = (c) => c.start + c.out - c.in;
  const c1 = chain.clips.reduce((a, c) => (!a || end(c) > end(a) ? c : a), null);
  if (!c1) return console.log("CLIP 2: no clip 1 to start from. Nothing changed.");
  let s1 = c1.samples[0];
  for (const s of c1.samples) if (s[0] <= c1.out + 1e-9) s1 = s;
  // world cm (1 px = 1 cm) <-> the chain's units of d
  const p0 = { x: s1[1] * d, y: s1[2] * d + up, z: s1[3] * d + zc, yaw: s1[4], pitch: s1[5], fov: s1[6] };

  // ── the shape: the left leg's centre line; Carl's end pose (HUD -9.61 · 9.48 · in the letters' plane) ──
  const AX = -285.2, AZ = 0, FLOOR = -429.05;
  const R1 = 675.8, Y1 = FLOOR + 948;
  const PACE = 280; // cm/s along the path — clip 1's D-pad pace; timing not yet judged
  const AIM_S = 1; // the aim settles onto the column over the first second
  const b0 = Math.atan2(p0.z - AZ, p0.x - AX), r0 = Math.hypot(p0.x - AX, p0.z - AZ);
  const sweep = Math.PI + 4 * Math.PI - b0; // left first, to the OUTSIDE after two more laps (2¼ from the front)
  const at = (f) => {
    const b = b0 + sweep * f, r = r0 + (R1 - r0) * f;
    return { x: AX + r * Math.cos(b), y: p0.y + (Y1 - p0.y) * f, z: AZ + r * Math.sin(b), b };
  };
  // even pace: an arc-length table
  const N = 20000, cum = [0];
  let prev = at(0);
  for (let i = 1; i <= N; i++) { const q = at(i / N); cum.push(cum[i - 1] + Math.hypot(q.x - prev.x, q.y - prev.y, q.z - prev.z)); prev = q; }
  // ⛔ TAKE 2 — THE START EASED: from clip 1's OWN end speed (its last quarter second) up to PACE over RAMP_S, the speed
  // smoothstepped; the cruise and the path unchanged. s(t) = v1·t + (PACE − v1)·RAMP_S·(u³ − u⁴/2), u = t/RAMP_S.
  const RAMP_S = 3;
  const tail = c1.samples.filter((s) => s[0] >= s1[0] - 0.25 && s[0] <= s1[0]);
  const ta = tail[0], v1 = tail.length > 1 && s1[0] > ta[0] ? Math.min(PACE, (Math.hypot(s1[1] - ta[1], s1[2] - ta[2], s1[3] - ta[3]) * d) / (s1[0] - ta[0])) : 0;
  const L = cum[N];
  const sRamp = v1 * RAMP_S + (PACE - v1) * RAMP_S * 0.5;
  const T = L <= sRamp ? RAMP_S : RAMP_S + (L - sRamp) / PACE;
  const sOf = (t) => { if (t >= RAMP_S) return Math.min(L, sRamp + PACE * (t - RAMP_S)); const x = t / RAMP_S; return Math.min(L, v1 * t + (PACE - v1) * RAMP_S * (x * x * x - (x * x * x * x) / 2)); };
  const fAt = (s) => { let lo = 0, hi = N; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (cum[m] <= s) lo = m; else hi = m; } const k = cum[hi] > cum[lo] ? (s - cum[lo]) / (cum[hi] - cum[lo]) : 0; return (lo + k) / N; };
  // level, looking at the axis: three's YXZ yaw (0 looks along -z); unwrapped to sit next to clip 1's yaw
  const deg = (r) => (r * 180) / Math.PI;
  const aimYaw0 = 90 - deg(b0);
  const shift = Math.round((p0.yaw - aimYaw0) / 360) * 360;
  const ss = (x) => { const t = Math.min(1, Math.max(0, x)); return t * t * (3 - 2 * t); };
  const samples = [];
  const n = Math.ceil(T * 60);
  for (let k = 0; k <= n; k++) {
    const t = Math.min(k / 60, T);
    const q = at(fAt(sOf(t)));
    const aim = 90 - deg(q.b) + shift, w = ss(t / AIM_S);
    samples.push([t, q.x / d, (q.y - up) / d, (q.z - zc) / d, p0.yaw + (aim - p0.yaw) * w, p0.pitch * (1 - w), p0.fov]);
    if (t === T) break;
  }
  // clash check against the letters' boxes (measured 27 Oct on the bench; the slab |z| <= 16 cm)
  const BOX = [[-217,313,-117,427],[-118,310,-10,429],[7,310,98,427],[124,313,213,427],[-336,-429,-234,-310],[-340,-278,-231,-160],[-345,-128,-226,-14],[-285,16,-199,130],[-176,128,-69,242],[-45,157,49,270],[81,126,182,240],[212,23,287,136],[236,-128,345,-9],[239,-278,341,-160],[236,-429,345,-310]];
  const NAMES = "Y O U R C O M P A N Y L O G O".split(" ");
  let nearest = Infinity, who = "";
  for (const s of samples) {
    const x = s[1] * d, y = s[2] * d + up, z = s[3] * d + zc;
    if (Math.abs(z) > 16) continue;
    BOX.forEach((b, i) => { const dd = Math.hypot(Math.max(b[0] - x, 0, x - b[2]), Math.max(b[1] - y, 0, y - b[3])); if (dd < nearest) { nearest = dd; who = NAMES[i] + (i < 4 ? " (YOUR)" : ""); } });
  }
  const snapYaw = Math.abs(aimYaw0 + shift - p0.yaw), snapPitch = Math.abs(p0.pitch);
  if (!localStorage.getItem(BACKUP)) localStorage.setItem(BACKUP, raw); // the FIRST paste's state, kept across re-pastes
  chain.clips.push({ id: "clip2-corkscrew-" + Date.now().toString(36), cam: c1.cam, start: end(c1), order: old.length ? old[0].order : Math.max(...chain.clips.map((c) => c.order)) + 1, in: 0, out: T, samples });
  localStorage.setItem(K, JSON.stringify(chain));
  console.log(
    `CLIP 2 (take 2) ${old.length ? "REPLACED the earlier one" : "ADDED"} on Cam ${c1.cam} at ${end(c1).toFixed(2)} s — ${(L / 100).toFixed(1)} m, ${T.toFixed(1)} s, ${(deg(sweep) / 360).toFixed(2)} laps.\n` +
    `Start: from clip 1's end speed ${(v1 / 100).toFixed(2)} m/s up to ${PACE / 100} m/s over ${RAMP_S} s, then even.\n` +
    `From: ${(r0 / 100).toFixed(2)} m out, ${((p0.y - FLOOR) / 100).toFixed(2)} m up.  To: ${(R1 / 100).toFixed(2)} m out, ${((Y1 - FLOOR) / 100).toFixed(2)} m up.\n` +
    `Aim settled over ${AIM_S} s: ${snapYaw.toFixed(1)}° of turn, ${snapPitch.toFixed(1)}° of tilt.\n` +
    `Nearest letter where it crosses their plane: ${who} at ${(nearest / 100).toFixed(2)} m${nearest <= 0 ? "  ⚠ THROUGH IT" : ""}.\n` +
    `Backup: localStorage "${BACKUP}". Reloading…`,
  );
  setTimeout(() => location.reload(), 300);
})();
