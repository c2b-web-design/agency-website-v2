/** THE CAMERA BENCH — R1, THE RECORDER — VERIFIED THROUGH A STUBBED PAD AND THE KEYBOARD (rewritten 26 October 2026 for
 *  R1; the plan `live-work/plan-camera-recorder-r1-26-october.md` v2.3 "Verification", the Architect's checks [A1]–[D2]).
 *  `/proto/camera` at 1920 × 1080, DPR 1, dev server. `navigator.getGamepads` is replaced by a FAKE standard-mapping pad the
 *  script drives; the bench's state is read from `window.__cameraBench` (every 0.1 s).
 *    node …/camera-bench-verify-26-october.mjs <base> <outDir>
 *  ⚠ NOT WATCHED: how the pad FEELS (Carl's hands only); a REAL pad's connection; the secure-page rule; production; real
 *  storage limits (the quota is simulated by a throwing setItem). The chain's arithmetic: `bench-chain-check-26-october.mjs`. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const [BASE = "http://localhost:3000", OUT = "."] = process.argv.slice(2);
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
const A = 0, B = 1, X = 2, LB = 4, RB = 5, LT = 6, RT = 7, VIEW = 8, UP = 12, DRIGHT = 15;
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

// ── INSIDE THE CHAIN: A alone does nothing; OVERWRITE then A punches in
await scrubTo(1.0);
s = await state();
check(s.mode === "fly" && !s.atEnd && Math.abs(s.T - 1.0) < 0.15, `scrubbed into clip 1 at ${s.T.toFixed(2)} s, parked`);
await press(A);
s = await state();
check(s.clips.length === 3 && s.mode === "fly" && /Overwrite/.test(s.status), `inside the chain A ALONE does nothing: "${s.status}"`);
const ids0 = s.clips.map((c) => c.id);
await btn("Overwrite: arm a punch-in");
await wait(200);
check((await state()).armed.overwrite && /Overwrite armed/.test((await state()).status), "Overwrite arms it (the status says so)");
await press(A);
await wait(400);
await press(A);
await wait(300);
s = await state();
check(s.clips.length === 4 && s.clips[0].id === ids0[0] && s.clips[0].len < 1.2 && s.clips[2].id === ids0[1] && s.clips[3].id === ids0[2], `OVERWRITE + A → clip 1 cut (${s.clips[0].len.toFixed(2)} s), the new clip 2, the old 2 and 3 now 3 and 4`);
check(!s.atEnd && !s.armed.overwrite, "[B1] the punch-in's stop is NOT at the end (clips follow); Overwrite disarmed");
await press(A);
s = await state();
check(s.clips.length === 4 && s.mode === "fly" && /Overwrite/.test(s.status), `[B1] a third A does nothing: "${s.status}"`);

// ── NEW CAMERA → a cut; [A1] a punch-in keeps the punched clip's camera
await p.keyboard.press("End");
await wait(200);
await btn("New camera for the next clip");
await press(A);
await wait(500);
await press(A);
await wait(300);
s = await state();
check(s.clips[4]?.cam === 2 && (await p.$$eval('[data-join="cut"]', (e) => e.length)) === 1, `New camera → clip 5 on Cam ${s.clips[4]?.cam}, its join a CUT`);
const starts = (cl) => cl.reduce((a, c, i) => (a.push(i ? a[i - 1] + cl[i - 1].len : 0), a), []);
const st = starts(s.clips);
await scrubTo(st[3] + s.clips[3].len / 2);
await btn("Overwrite: arm a punch-in");
await press(A);
await wait(400);
await press(A);
await wait(300);
s = await state();
check(s.clips[4]?.cam === 1 && s.clips[5]?.cam === 2, `[A1] a punch into a Cam 1 clip with Cam 2 after it records on Cam ${s.clips[4]?.cam}`);

// ── PLAY: the chain; a stick stops it and parks; [B4] a selection's play parks inside
await press(X);
await wait(300);
check((await state()).mode === "play", "X plays the chain");
await axes([0, -1, 0, 0]);
await wait(300);
await axes([0, 0, 0, 0]);
s = await state();
check(s.mode === "fly" && !s.atEnd, "a stick during play STOPS it and parks");
await p.click('[data-clip="1"]');
await press(X);
await wait(1800);
s = await state();
check(s.mode === "fly" && !s.atEnd, `[B4] playing a selection of clip 1 ends parked INSIDE (T ${s.T.toFixed(2)})`);
const n0 = s.clips.length;
await press(A);
check((await count()) === n0 && (await state()).mode === "fly", "[B4] …so A alone does nothing");

// ── DELETE: select + Delete renumbers; [B5] deleting the clips after T with T at the new end → A records
await p.click('[data-clip="2"]'); // selection: clip 2 only (a click without shift replaces)
s = await state();
const keep = s.clips.filter((_, i) => i !== 1).map((c) => c.id);
await p.keyboard.press("Delete");
await wait(300);
s = await state();
check(s.clips.length === n0 - 1 && s.clips.map((c) => c.id).join() === keep.join() && s.clips.every((c, i) => c.n === i + 1), `select + Delete → ${s.clips.length} clips, numbered 1–${s.clips.length}`);
await p.keyboard.press("End");
await p.keyboard.press("Comma"); // T at the last clip's start = the new end once it goes
await wait(200);
await p.click(`[data-clip="${s.clips.length}"]`);
await p.keyboard.press("Delete");
await wait(300);
s = await state();
check(s.atEnd && Math.abs(s.T - s.duration) < 1e-6, `[B5] the last clip deleted with T at the new end → at the end (T ${s.T.toFixed(2)} = ${s.duration.toFixed(2)})`);
const n1 = s.clips.length;
await press(A);
await wait(300);
await press(A);
await wait(300);
check((await count()) === n1 + 1, "[B5] …and A records");

// ── WHILE RECORDING: everything else disabled ([A5])
await press(A);
await wait(200);
const dis = await p.$$eval('[data-transport] button[disabled]', (e) => e.map((x) => x.getAttribute("aria-label")));
check(["Play", "To the start", "To the end", "New camera for the next clip", "Overwrite: arm a punch-in", "Delete the selected clips"].every((l) => dis.includes(l)), `while recording these are disabled: ${dis.join(", ")}`);
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
for (const sel of ['button[aria-label="Controls"]', 'button[aria-label="Controls"]', 'button[aria-label="Scene information"]', 'button[aria-label="Floor grid"]', 'button[aria-label="Floor grid"]', 'button[aria-label="Scene information"]', 'button[aria-label="New camera for the next clip"]', 'button[aria-label="New camera for the next clip"]']) {
  await p.click(sel);
  await wait(80);
}
await wait(300);
check(Math.abs((await state()).pose.yaw - yaw0) < 1e-6, "clicks on the HUD, drawers and transport (no drag-surface parent) move no camera");

// ── [A4] [B3] Space / Enter never fire twice
let n2 = await count();
await btn("New camera for the next clip");
await btn("New camera for the next clip");
await p.keyboard.press("Space");
await wait(300);
check((await state()).mode === "rec", "after a mouse click on a transport button, Space RECORDS");
await p.keyboard.press("Space");
await wait(300);
check((await count()) === n2 + 1, "…exactly one recording (one clip)");
n2 = await count();
await p.keyboard.press("End");
await p.click('[data-clip="1"]');
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

await p.screenshot({ path: `${OUT}/camera-bench-r1.png` });
check(errors.length === 0, `no console errors${errors.length ? ": " + errors.slice(0, 3).join(" | ") : ""}`);
console.log(`\nVERDICT ${fail ? "✖" : "✔"} ${pass}/${pass + fail}`);
console.log("⚠ NOT WATCHED: how the pad FEELS (Carl's hands only); a real pad's connection; the secure-page rule; production; real storage limits.");
await b.close();
