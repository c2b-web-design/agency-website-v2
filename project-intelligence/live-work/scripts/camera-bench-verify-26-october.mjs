/** THE CAMERA BENCH — R1, THE RECORDER — VERIFIED THROUGH A STUBBED PAD AND THE KEYBOARD (rewritten 26 October 2026 for
 *  R1; the plan `live-work/plan-camera-recorder-r1-26-october.md` v2.3 "Verification", the Architect's checks [A1]–[D2]).
 *  `/proto/camera` at 1920 × 1080, DPR 1, dev server. `navigator.getGamepads` is replaced by a FAKE standard-mapping pad the
 *  script drives; the bench's state is read from `window.__cameraBench` (every 0.1 s).
 *    node …/camera-bench-verify-26-october.mjs <base> <outDir>
 *  ⚠ NOT WATCHED: how the pad FEELS (Carl's hands only); a REAL pad's connection; the secure-page rule; production; real
 *  storage limits (the quota is simulated by a throwing setItem). The chain's arithmetic: `bench-chain-check-26-october.mjs`. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { tmpdir } from "node:os";

// the screenshot goes to the OS temp folder unless an OUT is given (it once defaulted to "." and left a PNG in the repo root)
const [BASE = "http://localhost:3000", OUT = tmpdir()] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await ctx.addInitScript(() => {
  window.__fakePad = null;
  navigator.getGamepads = () => [window.__fakePad];
});
const p = await ctx.newPage();
const errors = [];
p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
p.on("pageerror", (e) => errors.push(String(e)));
let pass = 0, fail = 0;
const check = (ok, what) => {
  console.log(`${ok ? "✔" : "✖"} ${what}`);
  if (ok) pass++;
  else fail++;
};
const state = () => p.evaluate(() => window.__cameraBench);
const wait = (ms) => p.waitForTimeout(ms);
const pad = (fn, arg) => p.evaluate(fn, arg);
const connect = () =>
  pad(() => {
    window.__fakePad = { id: "Fake Xbox pad (test stub)", connected: true, mapping: "standard", axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })) };
  });
const press = async (i) => {
  await pad((i) => (window.__fakePad.buttons[i] = { pressed: true, value: 1 }), i);
  await wait(150);
  await pad((i) => (window.__fakePad.buttons[i] = { pressed: false, value: 0 }), i);
  await wait(250);
};
const hold = (i, on) => pad(([i, on]) => (window.__fakePad.buttons[i] = { pressed: on, value: on ? 1 : 0 }), [i, on]);
const axes = (a) => pad((a) => (window.__fakePad.axes = a), a);
const metres = (s, dUnits) => (dUnits * s.d) / 100;
const A = 0, B = 1, X = 2, LB = 4, RB = 5, LT = 6, RT = 7, VIEW = 8, START = 9, UP = 12, DRIGHT = 15;
const btn = (label) => p.click(`button[aria-label="${label}"]`);
const count = async () => (await state()).clips.length;
/** scrub by the timeline's ruler (custom pointer handling, [C3]) to chain time T */
async function scrubTo(T) {
  const s = await state();
  const r = await p.$eval("[data-scrub-track]", (e) => {
    const b = e.getBoundingClientRect();
    return { x: b.left, y: b.top, w: b.width };
  });
  const span = Math.max(s.duration, 4) * 1.04;
  await p.mouse.click(r.x + (T / span) * r.w, r.y + 10);
  await wait(250);
}
const reload = async () => {
  await p.reload({ waitUntil: "networkidle" });
  await p.addStyleTag({ content: "nextjs-portal{display:none!important}" });
  await p.waitForSelector('[data-camera-bench="drawn"]', { timeout: 60000 });
  await wait(500);
};

await p.goto(`${BASE}/proto/camera`, { waitUntil: "networkidle" });
await p.evaluate(() => localStorage.clear());
await reload();
check(true, "the bench drew the arch (data-camera-bench=drawn)");
check((await p.getAttribute("[data-pad]", "data-pad")) === "none", "no pad → the HUD asks for a button press");
let s = await state();
check(Math.abs(s.pose.z - s.front.z) < 0.001 && s.atEnd && /Ready/.test(s.status), `starts at the default view, the chain empty: "${s.status}"`);

await connect();
await wait(300);
check((await p.getAttribute("[data-pad]", "data-pad")) === "connected", "pad seen → the HUD says so");

// ── THE RIG (kept from chunk 1, with Carl's later rulings)
s = await state();
const z0 = s.pose.z;
await axes([0, -1, 0, 0]);
await wait(1000);
await axes([0, 0, 0, 0]);
await wait(800);
s = await state();
const walked = metres(s, z0 - s.pose.z);
check(Math.abs(walked - 1.4) < 0.3, `left stick forward walks ${walked.toFixed(2)} m for a 1 s full push (1.4 m/s)`);
const zA = s.pose.z;
await wait(600);
check(Math.abs((await state()).pose.z - zA) < 0.005, "released, it settles — no drift");
let q = (await state()).pose;
await axes([1, 0, 0, 0]);
await wait(800);
await axes([0, 0, 0, 0]);
await wait(500);
check(Math.abs((await state()).pose.x - q.x) < 1e-4, "left stick sideways does nothing");
const zDead = (await state()).pose.z;
await axes([0, 0.1, 0, 0]);
await wait(700);
await axes([0, 0, 0, 0]);
check(Math.abs((await state()).pose.z - zDead) < 0.002, "a stick resting at 0.1 is inside the dead zone");
q = (await state()).pose;
await axes([0, 0, 1, 0]);
await wait(1000);
await axes([0, 0, 0, 0]);
await wait(800);
s = await state();
check(Math.abs(metres(s, s.pose.x - q.x) - 1.4) < 0.3 && Math.abs(s.pose.yaw - q.yaw) < 0.01, `right stick right trucks ${metres(s, s.pose.x - q.x).toFixed(2)} m, facing unchanged`);
// ⛔ ONE JOB PER STICK (Carl, 27 October 2026: "the right stick should only move l+r using the l+r hemispheres") — a rough
// push up and to the right still trucks STRAIGHT: no tilt
q = (await state()).pose;
await axes([0, 0, 0.75, -0.65]);
await wait(800);
await axes([0, 0, 0, 0]);
await wait(800);
s = await state();
check(s.pose.x > q.x && Math.abs(s.pose.pitch - q.pitch) < 0.01 && Math.abs(s.pose.yaw - q.yaw) < 0.01, `right stick pushed up-and-right trucks ${metres(s, s.pose.x - q.x).toFixed(2)} m, no tilt (${(s.pose.pitch - q.pitch).toFixed(3)}°)`);
// ⛔ THE HELD LOOK: B + the right stick turns at 75°/s ([D2]: not × 1.5), the position unchanged, no truck
q = (await state()).pose;
await hold(B, true);
await axes([0, 0, 1, 0]);
await wait(1000);
await axes([0, 0, 0, 0]);
await hold(B, false);
await wait(800);
s = await state();
const turned = s.pose.yaw - q.yaw;
// the position "unchanged" within 2 cm: the last move's ease is still settling (a 2.6% tail after 0.8 s)
const turnMoved = Math.hypot(metres(s, s.pose.x - q.x), metres(s, s.pose.z - q.z));
check(turned < -55 && turned > -95 && turnMoved < 0.02, `B + right stick right 1 s turns right ${(-turned).toFixed(0)}° (75°/s, eased), no truck (${(turnMoved * 100).toFixed(1)} cm)`);
// the look takes the axis pushed MORE: mostly sideways turns with no tilt; mostly up tilts with no turn
q = (await state()).pose;
await hold(B, true);
await axes([0, 0, -0.9, -0.35]);
await wait(500);
await axes([0, 0, 0, 0]);
await hold(B, false);
await wait(800);
s = await state();
check(s.pose.yaw > q.yaw + 10 && Math.abs(s.pose.pitch - q.pitch) < 0.01, `B + right stick left-and-a-little-up turns left ${(s.pose.yaw - q.yaw).toFixed(0)}°, no tilt`);
// the turn's ease settled first (a 2.6% tail after 0.8 s still turns a fraction of a degree — it failed this check once)
await wait(1500);
q = (await state()).pose;
await hold(B, true);
await axes([0, 0, 0.3, -0.9]);
await wait(400);
await axes([0, 0, 0, 0]);
await hold(B, false);
await wait(800);
s = await state();
check(s.pose.pitch > q.pitch + 5 && Math.abs(s.pose.yaw - q.yaw) < 0.01, `B + right stick up-and-a-little-right tilts up ${(s.pose.pitch - q.pitch).toFixed(0)}°, no turn (${(s.pose.yaw - q.yaw).toFixed(4)}°)`);
// ⛔ THE D-PAD A MOVEMENT PAD (Carl: "Yes the Dpad should be a movement pad") — at TWICE walking pace ("make the speed 2x")
q = (await state()).pose;
await hold(UP, true);
await wait(1000);
await hold(UP, false);
await wait(800);
s = await state();
const dWalk = Math.hypot(metres(s, s.pose.x - q.x), metres(s, s.pose.z - q.z));
check(Math.abs(dWalk - 2.8) < 0.5 && Math.abs(s.pose.fov - q.fov) < 0.01, `D-pad up moves ${dWalk.toFixed(2)} m in 1 s (2.8 m/s, twice the stick), the lens unchanged`);
q = s.pose;
await hold(DRIGHT, true);
await wait(500);
await hold(DRIGHT, false);
await wait(800);
s = await state();
check(Math.abs(s.pose.yaw - q.yaw) < 0.01 && Math.hypot(s.pose.x - q.x, s.pose.z - q.z) > 0, "D-pad right slides, facing unchanged");
// [D2] the bumpers carry no speed: RB held with the left stick still walks at walking pace
q = (await state()).pose;
await hold(RB, true);
await axes([0, -1, 0, 0]);
await wait(1000);
await axes([0, 0, 0, 0]);
await hold(RB, false);
await wait(800);
s = await state();
const rbWalk = Math.hypot(metres(s, s.pose.x - q.x), metres(s, s.pose.z - q.z));
check(rbWalk > 1.1 && rbWalk < 1.75, `[D2] RB + left stick full forward moves ${rbWalk.toFixed(2)} m in 1 s — walking pace, not × 3`);
// ⛔ THE ZOOM ON THE BUMPERS (Carl: "The zoom you can put on the bumpers")
let fov0 = (await state()).pose.fov;
await hold(RB, true);
await wait(500);
await hold(RB, false);
await wait(400);
check((await state()).pose.fov < fov0 - 2, "RB lengthens the lens");
fov0 = (await state()).pose.fov;
await hold(LB, true);
await wait(500);
await hold(LB, false);
await wait(400);
check((await state()).pose.fov > fov0 + 2, "LB widens the lens");
// ⛔ THE TRIGGERS AT THE STICKS' PACE (Carl: "Change the triggers to the speed of the sticks.")
q = (await state()).pose;
await hold(RT, true);
await wait(1000);
await hold(RT, false);
await wait(800);
s = await state();
const rose = metres(s, s.pose.y - q.y);
check(Math.abs(rose - 1.4) < 0.3, `right trigger held 1 s rises ${rose.toFixed(2)} m (1.4 m/s)`);
// ⛔ THE FLOOR STOP (Carl: "The xamera should not be able to pass through the floor") — LT held far past it: the lens
// held 10 cm above the floor, read on the HUD's position (metres from ground zero)
const hudUp = () => p.evaluate(() => Number(document.body.innerText.match(/-?\d+\.\d\d · (-?\d+\.\d\d) · -?\d+\.\d\d/)?.[1]));
await hold(LT, true);
await wait(7000);
const low1 = (await state()).pose.y;
await wait(600);
const low2 = (await state()).pose.y;
await hold(LT, false);
await wait(400);
const up = await hudUp();
check(low1 === low2 && Math.abs(up - 0.1) < 0.005, `LT held 7 s stops at the floor stop: ${up.toFixed(2)} m up, held`);
await press(VIEW);
s = await state();
const atDefault = (q) => Math.abs(q.pose.z - q.front.z) < 0.001 && Math.abs(q.pose.x) < 0.001 && Math.abs(q.pose.yaw) < 0.01 && Math.abs(q.pose.fov - 30) < 0.01;
check(atDefault(s), "View returns to the default view");

// ── RECORDING (Carl: "A should start the tracking of the movement and pressing it again should stop it")
await press(A);
check((await state()).mode === "rec", "A starts a recording");
await axes([0, -1, 0, 0]);
await wait(2000);
// the stick released AS A stops — the camera still moving at walking pace: the HALT must stop it there
await axes([0, 0, 0, 0]);
await press(A);
await wait(300);
s = await state();
check(s.clips.length === 1 && s.clips[0].len > 1.6 && s.clips[0].len < 2.6 && s.atEnd, `A stops → clip 1, ${s.clips[0]?.len.toFixed(2)} s, at the end: "${s.status}"`);
await wait(600); // the halt: the camera must not coast on after the stop
await press(A);
await axes([0, 0, 1, 0]);
await wait(800);
await axes([0, 0, 0, 0]);
await press(A);
await wait(300);
s = await state();
const join =await p.$$eval("[data-join]", (e) => e.map((x) => `${x.dataset.join}:${x.textContent}`));
check(s.clips.length === 2 && join.length === 0, `A again → clip 2 from where clip 1 STOPPED (no seam shown: ${JSON.stringify(join)})`);
// framing BETWEEN clips (Carl: "An opportunity to frame the shot") → a deliberate mismatch, shown
await axes([0, -1, 0, 0]);
await wait(900);
await axes([0, 0, 0, 0]);
await wait(600);
await press(A);
await wait(500);
await press(A);
await wait(300);
const seams = await p.$$eval("[data-join]", (e) => e.map((x) => `${x.dataset.join}:${x.textContent}`));
check((await count()) === 3 && seams.some((t) => t.startsWith("mismatch")), `framing between clips → clip 3, its join SHOWN: ${JSON.stringify(seams)}`);

// ── T1a: A NEW TAKE OVER A CLIP — A always records at the playhead; nothing is destroyed (Carl: Overwrite "Drop it")
await scrubTo(1.0);
s = await state();
check(s.mode === "fly" && !s.atEnd && Math.abs(s.T - 1.0) < 0.15, `scrubbed into clip 1 at ${s.T.toFixed(2)} s, parked`);
check(/new take over clip 1/.test(s.status), `the status says what A will do before it is pressed: "${s.status}"`);
const ids0 = s.clips.map((c) => c.id);
const old1 = JSON.stringify(s.chain.clips.find((c) => c.id === ids0[0]).samples);
const T1 = s.T;
await press(A);
await axes([0, 0, 1, 0]);
await wait(600);
await axes([0, 0, 0, 0]);
await press(A);
await wait(300);
s = await state();
const take = s.chain.clips.reduce((m, c) => (c.order > m.order ? c : m));
check(
  s.clips.length === 4 && take.cam === 1 && Math.abs(take.start - T1) < 1e-6 && JSON.stringify(s.chain.clips.find((c) => c.id === ids0[0]).samples) === old1,
  `A records a NEW TAKE at the playhead (${take.start.toFixed(2)} s); clip 1 KEPT, its samples untouched`,
);
const takeEnd = take.start + (take.out - take.in);
await scrubTo(takeEnd + 0.15);
s = await state();
check(s.source === ids0[0], `after the take ends (${takeEnd.toFixed(2)} s) the OLD take plays again`);
const mism = await p.$$eval('[data-join="mismatch"]', (e) => e.length);
check(mism >= 2, `[C2] the take's start and end over the older take are shown as MISMATCHES (${mism})`);
// [E4] the covered take reachable WITHOUT deleting: the inspector lists both takes under the playhead
await scrubTo(take.start + 0.2);
s = await state();
check(s.takes[0] === take.id && s.takes.includes(ids0[0]), `[E4] under the playhead: ${s.takes.length} takes, the new one plays`);
await p.click(`[data-take="${ids0[0]}"]`);
await wait(250);
check((await state()).selection.join() === ids0[0], "[E4] the COVERED take selected from the inspector, nothing deleted");

// ── CAMERA TRACKS: Cam 2 on top PLAYS over Cam 1 (Resolve's A / B roll); a CUT; non-destructive
await p.click(`[data-take="${ids0[0]}"]`); // clear the selection
await btn("Add a camera track");
await wait(250);
s = await state();
check(s.tracks.join() === "1,2" && s.armedCam === 2, `Add a camera track → tracks ${s.tracks.join(", ")}, Cam ${s.armedCam} armed`);
await scrubTo(0.4);
s = await state();
check(/over Cam 1's clip 1: Cam 2 will play there/.test(s.status), `the status before A: "${s.status}"`);
await press(A);
await axes([0, 0, -1, 0]);
await wait(500);
await axes([0, 0, 0, 0]);
await press(A);
await wait(300);
s = await state();
const cam2 = s.chain.clips.find((c) => c.cam === 2);
check(!!cam2 && Math.abs(cam2.start - s.chain.clips.find((c) => c.id === ids0[0]).start - 0.4) < 0.15, `A on Cam 2 → a Cam 2 clip at ${cam2?.start.toFixed(2)} s`);
await scrubTo(cam2.start + 0.15);
s = await state();
check(s.source === cam2.id && s.takes.includes(ids0[0]), "Cam 2 PLAYS where it has a clip; Cam 1's clip is still there under it");
const cuts = await p.$$eval('[data-join="cut"]', (e) => e.length);
check(cuts >= 2, `the switches to and from Cam 2 are CUTS (${cuts})`);
// Start: cycles the arm; does nothing while recording ([C10]); "under Cam 2" said before A
await press(START);
await wait(250);
s = await state();
check(s.armedCam === 1 && /under Cam 2 \(Cam 2 plays there\)/.test(s.status), `Start cycles the arm to Cam 1; the status: "${s.status}"`);
await press(A);
await press(START);
await wait(250);
s = await state();
check(s.mode === "rec" && s.armedCam === 1 && /Start does nothing while recording/.test(s.status), `[C10] Start while recording does nothing: "${s.status}"`);
await press(A);
await wait(300);
await press(START);
await wait(200);
check((await state()).armedCam === 2, "Start again → Cam 2 (bottom → top → bottom)");
// SOLO (Carl: "The clip solo"): the covered Cam 1 clip plays ITS OWN moves, not Cam 2's
const poseOf = (clip, T) => {
  const local = Math.min(clip.out, Math.max(clip.in, clip.in + (T - clip.start)));
  const sm = clip.samples;
  const k = sm.findIndex((x) => x[0] >= local);
  if (k <= 0) return sm[k < 0 ? sm.length - 1 : 0];
  const a = sm[k - 1], b2 = sm[k], f = (local - a[0]) / (b2[0] - a[0]);
  return a.map((v, i) => v + (b2[i] - v) * f);
};
// clip 1 is COVERED at its centre (by the new take, then Cam 2): it is selected through the inspector ([E4]), never by a
// click on the row, which lands on whatever is on top
await scrubTo(cam2.start + 0.15);
await p.click(`[data-take="${ids0[0]}"]`);
await wait(250);
check((await state()).selection.join() === ids0[0], "the covered clip 1 selected from the inspector");
await press(X);
await wait(450);
s = await state();
const c1 = s.chain.clips.find((c) => c.id === ids0[0]);
const want = poseOf(c1, s.T);
check(s.mode === "play" && /solo/.test(s.status) && Math.abs(want[1] - s.pose.x) < 0.02 && Math.abs(want[3] - s.pose.z) < 0.02, `a selected, COVERED clip plays SOLO: its own pose at ${s.T.toFixed(2)} s (x ${s.pose.x.toFixed(3)} ≈ ${want[1].toFixed(3)})`);
await press(X);
// delete every Cam 2 clip → Cam 1 plays there again
// the Cam 2 row holds only Cam 2 clips: the first click REPLACES the selection, the rest add to it
for (const [i, c] of s.chain.clips.filter((k) => k.cam === 2).sort((a, b) => b.order - a.order).entries()) {
  await p.click(`[data-clip-id="${c.id}"]`, { modifiers: i ? ["Shift"] : [] });
}
await wait(250);
s = await state();
const sel2 = s.selection.slice();
await p.keyboard.press("Delete");
await wait(300);
await scrubTo(cam2.start + 0.15);
s = await state();
check(sel2.length >= 1 && s.chain.clips.every((c) => c.cam === 1) && s.source !== null && s.chain.clips.find((c) => c.id === s.source)?.cam === 1, "delete the Cam 2 clips → Cam 1 plays there again (non-destructive)");

// ── GAPS: nothing ripples — delete a middle clip and its time is a GAP, which HOLDS the last picture
await p.click(`[data-clip-id="${ids0[1]}"]`, { force: true });
s = await state();
const gone = s.chain.clips.find((c) => c.id === ids0[1]);
await p.keyboard.press("Delete");
await wait(300);
s = await state();
const gapEls = await p.$$eval("[data-gap]", (e) => e.map((x) => x.dataset.gap));
check(gapEls.length === 1 && s.chain.clips.find((c) => c.id === ids0[2]).start > gone.start, `delete clip 2 → a GAP (${gapEls.join()}); the clips after it do not move`);
await scrubTo(gone.start + 0.2);
const g1 = await state();
await scrubTo(gone.start + gone.out - 0.2);
const g2 = await state();
check(g1.gap && g2.gap && Math.abs(g1.pose.x - g2.pose.x) < 1e-9 && Math.abs(g1.pose.z - g2.pose.z) < 1e-9 && /in a gap/.test(g1.status), `in the gap the picture HOLDS (the same pose at two moments); "${g1.status}"`);

// ── WHILE RECORDING: everything else disabled ([A5])
await p.keyboard.press("End");
await press(A);
await wait(200);
const dis = await p.$$eval('[data-transport] button[disabled]', (e) => e.map((x) => x.getAttribute("aria-label")));
check(["Play", "To the start", "To the end", "Add a camera track", "Delete the selected clips"].every((l) => dis.includes(l)), `while recording these are disabled: ${dis.join(", ")}`);
const Trec = (await state()).T;
await scrubTo(0.5);
await p.click('[data-clip="1"]', { force: true }).catch(() => {});
s = await state();
check(s.mode === "rec" && Math.abs(s.T - Trec) < 1e-6 && !s.selection.length, "while recording a scrub and a clip click do nothing");
// [B2] View while recording stops it FIRST — no jump recorded inside a clip
await axes([0, -1, 0, 0]);
await wait(500);
await axes([0, 0, 0, 0]); // released as View is pressed: the camera still moving, the recording still running
await press(VIEW);
await wait(300);
s = await state();
let fastest = 0;
for (const c of s.chain.clips)
  for (let i = 1; i < c.samples.length; i++) {
    const [t0, x0, y0, z0] = c.samples[i - 1], [t1, x1, y1, z1] = c.samples[i];
    if (t1 > t0) fastest = Math.max(fastest, metres(s, Math.hypot(x1 - x0, y1 - y0, z1 - z0)) / (t1 - t0));
  }
check(s.mode === "fly" && /default view/.test(s.status) && atDefault(s), `[B2] View during a recording → "${s.status}", at the default`);
check(fastest < 25, `[B2] no clip holds a step faster than 25 m/s (fastest ${fastest.toFixed(2)} m/s) [C1]`);

// ── [A6] the pad lost mid-recording; a hidden tab
await press(A);
await wait(300);
await pad(() => (window.__fakePad = null));
await wait(400);
s = await state();
check(s.mode === "fly" && /controller disconnected/.test(s.status), `[A6] the pad lost mid-recording stops it: "${s.status}"`);
await connect();
await wait(300);
await p.keyboard.press("Space");
await wait(300);
await p.evaluate(() => {
  Object.defineProperty(document, "hidden", { value: true, configurable: true });
  document.dispatchEvent(new Event("visibilitychange"));
});
await wait(200);
s = await state();
check(s.mode === "fly" && /tab was hidden/.test(s.status), `a hidden tab stops a recording: "${s.status}"`);
await p.evaluate(() => {
  Object.defineProperty(document, "hidden", { value: false, configurable: true });
});

// ── [A3] a drag on bare picture turns the camera; a click on every overlay control does not
await press(VIEW);
const pic = await p.$eval("[data-drag-surface]", (e) => {
  const b = e.getBoundingClientRect();
  return { x: b.left + b.width * 0.5, y: b.top + b.height * 0.35 };
});
let yaw0 = (await state()).pose.yaw;
await p.mouse.move(pic.x, pic.y);
await p.mouse.down();
await p.mouse.move(pic.x + 120, pic.y, { steps: 6 });
await p.mouse.up();
await wait(300);
check(Math.abs((await state()).pose.yaw - yaw0) > 5, "a drag on bare picture turns the camera");
yaw0 = (await state()).pose.yaw;
for (const sel of ['button[aria-label="Controls"]', 'button[aria-label="Controls"]', 'button[aria-label="Scene information"]', 'button[aria-label="Floor grid"]', 'button[aria-label="Floor grid"]', 'button[aria-label="Scene information"]', 'button[aria-label="Add a camera track"]', 'button[aria-label="Add a camera track"]']) {
  await p.click(sel);
  await wait(80);
}
await wait(300);
check(Math.abs((await state()).pose.yaw - yaw0) < 1e-6, "clicks on the HUD, drawers and transport (no drag-surface parent) move no camera");

// ── [A4] [B3] Space / Enter never fire twice
let n2 = await count();
await btn("Add a camera track");
await btn("Add a camera track");
await p.keyboard.press("Space");
await wait(300);
check((await state()).mode === "rec", "after a mouse click on a transport button, Space RECORDS");
await p.keyboard.press("Space");
await wait(300);
check((await count()) === n2 + 1, "…exactly one recording (one clip)");
n2 = await count();
await p.keyboard.press("End");
// the NEWEST take (always on top of its row): clip 1 is covered by newer takes by now
const newest = (await state()).chain.clips.reduce((m, c) => (c.order > m.order ? c : m));
await p.click(`[data-clip-id="${newest.id}"]`);
await wait(250); // the store publishes its state every 0.1 s
const selAfterClick = (await state()).selection.length;
await p.keyboard.press("Space");
await wait(300);
const recAfterClip = (await state()).mode === "rec";
await p.keyboard.press("Space");
await wait(300);
const nAfterClip = await count();
check(selAfterClick === 1 && recAfterClip && nAfterClip === n2 + 1, `[B3] after clicking a CLIP, Space records exactly once (selected ${selAfterClick}, recording ${recAfterClip}, clips ${n2} → ${nAfterClip})`);
n2 = await count();
await p.click('button[aria-label="Scene information"]');
await p.click('button[aria-label="Floor grid"]');
await p.click('button[aria-label="Floor grid"]');
await p.keyboard.press("Space");
await wait(300);
check((await state()).mode === "rec", "[B3] after clicking the GRID toggle, Space records");
await p.keyboard.press("Space");
await wait(300);
await p.click('button[aria-label="Scene information"]');
n2 = await count();
await p.focus('button[aria-label="Controls"]'); // as Tab would
await p.keyboard.press("Space");
await wait(300);
s = await state();
check(s.mode === "fly" && (await p.$("[data-drawer=help]")) !== null, "a FOCUSED control (by Tab): Space presses THAT control, no recording");
await p.keyboard.press("Enter");
await wait(300);
check((await state()).mode === "fly" && (await p.$("[data-drawer=help]")) === null && (await count()) === n2, "…and Enter the same");
await p.evaluate(() => document.activeElement?.blur());

// ── a failed save is SHOWN; a reload keeps the chain
await p.evaluate(() => {
  window.__setItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function () {
    throw new DOMException("quota", "QuotaExceededError");
  };
});
await p.keyboard.press("End");
await p.keyboard.press("Space");
await wait(300);
await p.keyboard.press("Space");
await wait(400);
const saveErr = await p.$eval("[data-save-error]", (e) => e.textContent).catch(() => null);
check(!!saveErr && /Not saved/.test(saveErr), `a save that fails is SHOWN: "${saveErr}"`);
await p.evaluate(() => (Storage.prototype.setItem = window.__setItem));
await p.keyboard.press("End");
await p.keyboard.press("Space");
await wait(300);
await p.keyboard.press("Space");
await wait(400);
check((await p.$("[data-save-error]")) === null, "…and clears on the next good save");
const nSaved = await count();
await reload();
check((await count()) === nSaved, `a reload keeps the chain (${nSaved} clips)`);

// ── THE MIGRATION (T1a): R1's chain carried over, PROVEN in the page, v1 never touched (Carl: "Only when I say so")
const V1 = "c2b-camera-bench-chain-v1", V2 = "c2b-camera-bench-chain-v2";
const v1Samples = (secs, a, b) => {
  const n = Math.round(secs * 60);
  return Array.from({ length: n + 1 }, (_, i) => [i / 60, a + ((b - a) * i) / n, 0, 1, 0, 0, 30]);
};
const v1json = JSON.stringify({
  kind: "c2b-camera-chain",
  version: 1,
  clips: [
    { id: "r1a", cam: 1, samples: v1Samples(1.5, 0, 0.2) },
    { id: "r1b", cam: 2, samples: v1Samples(1.0, 0.5, 0.6) },
  ],
  refined: null,
  comp: null,
});
const keys = () => p.evaluate(([a, b]) => ({ v1: localStorage.getItem(a), v2: localStorage.getItem(b), refused: localStorage.getItem(`${b}-refused`) }), [V1, V2]);
const seed = (entries, flags = []) =>
  p.evaluate(
    ([e, f]) => {
      localStorage.clear();
      sessionStorage.clear();
      for (const [k, v] of e) localStorage.setItem(k, v);
      for (const k of f) sessionStorage.setItem(k, "1");
    },
    [entries, flags],
  );
const carryLine = () => p.$eval("[data-carry]", (e) => ({ kind: e.dataset.carry, text: e.textContent })).catch(() => null);
const saveLine = () => p.$eval("[data-save-error]", (e) => e.textContent).catch(() => null);
// ⚠ HARNESS-ONLY SWITCHES (read before the page's scripts): fail the v2 write; force the parity "differences" path —
// valid R1 data cannot reach it (proven in Node: the migration is R1's own arithmetic), so [E2] has no other way in
await p.addInitScript(([v2key]) => {
  if (sessionStorage.getItem("t1a-failSave")) {
    const orig = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
      if (k === v2key) throw new DOMException("quota", "QuotaExceededError");
      return orig.call(this, k, v);
    };
  }
  if (sessionStorage.getItem("t1a-forceDiff")) window.__cameraBenchParityTol = -1;
}, [V2]);
await seed([[V1, v1json]]);
await reload();
s = await state();
let k = await keys();
let cl = await carryLine();
check(s.tracks.join() === "1,2" && s.clips.length === 2 && cl?.kind === "identical" && /identical/.test(cl.text), `an R1 chain CARRIED OVER: tracks ${s.tracks.join(", ")}, ${s.clips.length} clips; "${cl?.text}"`);
check(k.v1 === v1json && JSON.parse(k.v2).migration?.ok === true, "v1 BYTE-IDENTICAL; v2 written with the parity verdict");
await seed([[V1, v1json]], ["t1a-failSave"]);
await reload();
s = await state();
k = await keys();
check(/Not saved/.test((await saveLine()) ?? "") && s.clips.length === 2 && k.v2 === null && k.v1 === v1json, `a v2 write that fails during the carry-over is SHOWN; the bench runs in memory; v1 kept: "${await saveLine()}"`);
// [E2] the parity FAILS (forced): v2 STILL written, new work saved, the differences line SURVIVES a reload
await seed([[V1, v1json]], ["t1a-forceDiff"]);
await reload();
cl = await carryLine();
k = await keys();
check(cl?.kind === "differences" && JSON.parse(k.v2).migration?.ok === false, `[E2] a parity failure (forced): "${cl?.text}"; v2 written`);
await p.evaluate(() => sessionStorage.clear());
await p.keyboard.press("End");
await p.keyboard.press("Space");
await wait(400);
await p.keyboard.press("Space");
await wait(400);
await reload();
s = await state();
k = await keys();
cl = await carryLine();
check(s.clips.length === 3 && k.v1 === v1json && cl?.kind === "differences", `[E2] …a take recorded, reloaded: ${s.clips.length} clips kept, v1 byte-identical, the differences line still showing`);
// [E3] an UNREADABLE v2 beside a valid v1: the bench starts EMPTY, says so, NEVER falls back to v1
await seed([[V1, v1json], [V2, "{not json"]]);
await reload();
s = await state();
k = await keys();
const e3 = (await saveLine()) ?? "";
check(s.clips.length === 0 && /could not be read/.test(e3) && e3.includes(`${V2}-refused`) && e3.includes(V1), `[E3] an unreadable v2: the bench EMPTY, "${e3}"`);
check(k.v1 === v1json && k.v2 === "{not json" && k.refused === "{not json", "[E3] …both keys byte-identical; the unreadable v2 kept aside");
await seed([]);

await p.screenshot({ path: `${OUT}/camera-bench-t1a.png` });
check(errors.length === 0, `no console errors${errors.length ? ": " + errors.slice(0, 3).join(" | ") : ""}`);
console.log(`\nVERDICT ${fail ? "✖" : "✔"} ${pass}/${pass + fail}`);
console.log("⚠ NOT WATCHED: how the pad FEELS (Carl's hands only); a real pad's connection; the secure-page rule; production; real storage limits.");
await b.close();
