/** THE THIRD-PERSON VIEW — VERIFIED (the plan `plan-third-person-view-29-october.md` v1.2, Step 5, checks 1–10 and 12–15;
 *  check 11 is `third-person-baseline-29-october.mjs`). `/proto/camera`, dev server, headed Chromium with the GPU flags, a
 *  stubbed pad and the keyboard; the bench's state from `window.__cameraBench`.
 *    node …/third-person-verify-29-october.mjs <base> <outDir>
 *  A seeded chain: Cam 1 A 0–6 s; Cam 2 B 2–5 s ON TOP; a NEWER Cam 1 take N cutting in at 3–4 s; a barrel V on Cam 1 at
 *  8 s. ⚠ NOT WATCHED: how flying the eye FEELS (Carl's hands); a client film; the `frameAll` fallback with no scene box
 *  (the box exists by the first frame, so a harness cannot reach it); the path LINES' pixels (their data is checked). */
import { chromium } from "playwright";
import sharp from "sharp";
import * as THREE from "three";
import { mkdirSync } from "node:fs";
import { tmpdir } from "node:os";

const BC = await import(new URL("../../../components/showcase/bench-chain.ts", import.meta.url).href);
const [BASE = "http://localhost:3000", OUT = tmpdir()] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
let pass = 0, fail = 0;
const check = (ok, what) => {
  console.log(`${ok ? "✔" : "✖"} ${what}`);
  if (ok) pass++;
  else fail++;
};
const CAM = "c2b-camera-bench-camera-v1", EYE = "c2b-camera-bench-eye-v1";
const samples = (secs, a, b) => {
  const n = Math.round(secs * 60);
  return Array.from({ length: n + 1 }, (_, i) => [i / 60, a + ((b - a) * i) / n, 0.05 * (i / n), 1 - 0.2 * (i / n), 4 * (i / n), -2 * (i / n), 30]);
};
const clip = (id, cam, start, order, secs, a, b) => ({ id, cam, start, order, in: 0, out: samples(secs, a, b).at(-1)[0], samples: samples(secs, a, b) });
const BARREL = { kind: "barrel", from: [0, 0, 1], to: [0, 0, -0.5], turns: 2, radius: 0.05, spiralStart: 0.2, rollEase: 0.4, spiralEnd: 0.8, fov: 30, pace: 0.1, v0: 0, rampS: 1, landS: 1 };
const CHAIN = JSON.stringify({ kind: "c2b-camera-chain", version: 3, tracks: [1, 2], units: null, refined: null, comp: null, migrations: [],
  clips: [clip("A", 1, 0, 0, 6, 0, 0.3), clip("B", 2, 2, 1, 3, -0.2, -0.1), clip("N", 1, 3, 2, 1, 0.1, 0.12),
    { id: "V", cam: 1, start: 8, order: 3, in: 0, out: BC.shapeLength(BARREL), shape: BARREL }] });
const near = (p, q, tol = 1e-6) => !!p && !!q && ["x", "y", "z", "yaw", "pitch"].every((k) => Math.abs(p[k] - q[k]) <= tol);

const br = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
const errors = [];
async function page({ dpr = 1, helpers } = {}) {
  const ctx = await br.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: dpr });
  await ctx.addInitScript((h) => {
    window.__fakePad = null;
    window.__benchNoBuilderTake = true;
    if (h) window.__benchHelpers = h;
    navigator.getGamepads = () => [window.__fakePad];
  }, helpers ?? null);
  const p = await ctx.newPage();
  p.on("pageerror", (e) => errors.push(String(e)));
  p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await p.goto(`${BASE}/proto/camera`, { waitUntil: "networkidle" });
  return p;
}
async function fresh(p, keys = {}) {
  await p.evaluate(([c, k]) => {
    localStorage.clear();
    localStorage.setItem("c2b-camera-bench-chain-v3", c);
    for (const [a, b] of Object.entries(k)) localStorage.setItem(a, b);
  }, [CHAIN, keys]);
  await p.reload({ waitUntil: "networkidle" });
  await p.addStyleTag({ content: "nextjs-portal{display:none!important}" });
  await p.waitForSelector('[data-camera-bench="drawn"]', { timeout: 60000 });
  await p.waitForTimeout(800);
}
// the 10 Hz snapshot (its live readers are functions, which JSON drops)
const state = (p) => p.evaluate(() => JSON.parse(JSON.stringify(window.__cameraBench)));
const wait = (p, ms) => p.waitForTimeout(ms);
const connect = (p) => p.evaluate(() => {
  window.__fakePad = { id: "Fake pad", connected: true, mapping: "standard", axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })) };
});
const press = async (p, i) => {
  await p.evaluate((i) => (window.__fakePad.buttons[i] = { pressed: true, value: 1 }), i);
  await wait(p, 120);
  await p.evaluate((i) => (window.__fakePad.buttons[i] = { pressed: false, value: 0 }), i);
  await wait(p, 200);
};
const axes = (p, a) => p.evaluate((a) => (window.__fakePad.axes = a), a);
const X = 2, RS = 11;
async function scrubTo(p, T) {
  const s = await state(p);
  const r = await p.$eval("[data-scrub-track]", (e) => { const b = e.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width }; });
  await p.mouse.click(r.x + (T / (Math.max(s.duration, 4) * 1.04)) * r.w, r.y + 10);
  await wait(p, 400);
}
const T_KEY = async (p) => { await p.keyboard.press("KeyT"); await wait(p, 400); };
const arm = async (p, cam) => { await p.click(`button[aria-label="Arm Cam ${cam}"]`); await wait(p, 200); };
const box = (p, sel) => p.$eval(sel, (e) => { const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
const camKey = (p) => p.evaluate((k) => localStorage.getItem(k), CAM);
/** ⛔ THE SITE's ROOT ZOOM (D-097: above 1412 px the root is zoomed; every canvas is in LAYOUT px). The bench draws, scissors
 *  and places its labels in layout px; a screenshot and `getBoundingClientRect` are in on-screen px. So: the zoom factor,
 *  and the PiP's crop from `PIP` (16 layout px in, a quarter of the picture) converted to on-screen px. */
const zoomOf = (p) => p.$eval("[data-drag-surface]", (e) => e.getBoundingClientRect().width / e.offsetWidth);
async function pipClip(p) {
  const pic = await box(p, "[data-drag-surface]"), z = await zoomOf(p);
  return { x: pic.x + 16 * z, y: pic.y + 16 * z, width: pic.w / 4, height: pic.h / 4 };
}
/** clear the selection: a click on bare row space (Cam 2's row at 7 s, empty) */
async function clearSelection(p) {
  const s = await state(p), r = await box(p, '[data-track="2"]'), t = await box(p, "[data-scrub-track]");
  await p.mouse.click(t.x + (7 / (Math.max(s.duration, 4) * 1.04)) * t.w, r.y + r.h / 2);
  await wait(p, 200);
}
const trackPose = (s, cam, T) => BC.trackPoseAt(s.chain, cam, T)?.pose;

// ── 1–8, 12–15 at DPR 1
const p = await page();
await fresh(p);
await connect(p);
let s = await state(p);
check(s.view === "first", "the bench loads in FIRST person");
// 1. on, the eye framing everything; off
await T_KEY(p);
s = await state(p);
{
  const pic = await box(p, "[data-drag-surface]");
  const cam = new THREE.PerspectiveCamera(s.eye.fov, pic.w / pic.h, 1, s.d * 60);
  cam.position.set(s.eye.x, s.eye.y, s.eye.z);
  cam.rotation.set((s.eye.pitch * Math.PI) / 180, (s.eye.yaw * Math.PI) / 180, 0, "YXZ");
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  const pts = [...s.helpers.map((h) => new THREE.Vector3(h.x, h.y, h.z)), new THREE.Vector3(0, s.units.up, s.units.zc)];
  const inside = pts.every((v) => { const q = v.clone().project(cam); return Math.abs(q.x) <= 1 && Math.abs(q.y) <= 1 && q.z > -1 && q.z < 1; });
  check(s.view === "third" && !!s.eye && /Third person/.test(s.status) && inside, `T ON: third person, the eye framing every camera and the arch inside its view ("${s.status}")`);
}
await T_KEY(p);
check((await state(p)).view === "first", "T OFF: first person");
// 2. the pad's RS toggles; refused while recording; ignored mid-drag
await press(p, RS);
const rsOn = (await state(p)).view;
await press(p, RS);
check(rsOn === "third" && (await state(p)).view === "first", "the RIGHT-STICK CLICK toggles third person on and off");
await p.keyboard.press("Space");
await wait(p, 400);
await T_KEY(p);
s = await state(p);
check(s.mode === "rec" && s.view === "first" && /Stop first/.test(s.status), `refused while RECORDING: "${s.status}"`);
await p.keyboard.press("Space");
await wait(p, 400);
await fresh(p);
await connect(p);
{
  const b = await box(p, '[data-clip-id="B"]');
  await p.mouse.move(b.x + b.w - 3, b.y + b.h / 2);
  await p.mouse.down();
  await p.mouse.move(b.x + b.w - 40, b.y + b.h / 2, { steps: 4 });
  await wait(p, 200);
  await p.keyboard.press("KeyT");
  await wait(p, 300);
  s = await state(p);
  await p.keyboard.press("Escape");
  await p.mouse.up();
  await wait(p, 300);
  check(s.editing && s.view === "first", "T ignored MID-DRAG (the twelfth gate)");
}
// 3. third person never moves the rig: a fly, a play (flying the eye does not stop it), a scrub, a trim drag
{
  const rig0 = (await state(p)).pose, key0 = await camKey(p);
  await T_KEY(p);
  const eye0 = (await state(p)).eye;
  await axes(p, [0, -1, 0, 0]);
  await wait(p, 800);
  await axes(p, [0, 0, 0, 0]);
  await wait(p, 300);
  s = await state(p);
  const flew = Math.hypot(s.eye.x - eye0.x, s.eye.y - eye0.y, s.eye.z - eye0.z);
  check(flew > 50 && near(s.pose, rig0, 1e-9), `the pad flies the EYE (${(flew / 100).toFixed(2)} m); the RIG unmoved`);
  await press(p, X);
  await axes(p, [0, -1, 0, 0]);
  await wait(p, 500);
  await axes(p, [0, 0, 0, 0]);
  s = await state(p);
  check(s.mode === "play" && near(s.pose, rig0, 1e-9), "flying the eye during X does NOT stop playback; the rig unmoved by the play");
  await press(p, X);
  await scrubTo(p, 1.5);
  check(near((await state(p)).pose, rig0, 1e-9), "a SCRUB in third person: the rig unmoved");
  const a = await box(p, '[data-clip-id="A"]');
  await p.mouse.move(a.x + a.w - 3, a.y + a.h / 2);
  await p.mouse.down();
  await p.mouse.move(a.x + a.w - 60, a.y + a.h / 2, { steps: 5 });
  await wait(p, 300);
  s = await state(p);
  const A = s.chain.clips.find((c) => c.id === "A");
  const want = BC.clipPoseAt({ ...A, out: A.in + (s.editing.edgeT - A.start) }, s.editing.edgeT);
  check(near(s.pip, want, 1e-6) && near(s.pose, rig0, 1e-9), `during a TRIM DRAG the PiP = the drag's picture (the edge's frame at ${s.editing.edgeT.toFixed(2)} s); the rig unmoved`);
  await p.keyboard.press("Escape");
  await p.mouse.up();
  await wait(p, 300);
  check((await camKey(p)) === key0, "CAMERA_KEY unchanged through all of it");
  // 4. A refused in third person
  await p.keyboard.press("Space");
  await wait(p, 300);
  s = await state(p);
  check(s.mode !== "rec" && /right-stick click or T/.test(s.status), `A REFUSED in third person: "${s.status}"`);
}
// 5. the PiP shows the ARMED camera — Cam 1 armed under a playing Cam 2
await arm(p, 1);
await scrubTo(p, 2.5);
s = await state(p);
check(s.source === "B" && near(s.pip, trackPose(s, 1, s.T)) && !near(s.pip, trackPose(s, 2, s.T)), `the PiP shows the ARMED Cam 1 at ${s.T.toFixed(2)} s, though Cam 2 plays there`);
// 6. switching off HOLDS Cam 1 — still, then mid-play
await T_KEY(p);
await wait(p, 1000);
s = await state(p);
check(s.view === "first" && s.source === "B" && near(s.pose, trackPose(s, 1, s.T)), "switch OFF (still): the camera HOLDS Cam 1 over 60+ frames, though Cam 2 plays there");
await T_KEY(p);
await scrubTo(p, 2.1);
await press(p, X);
await wait(p, 600);
await T_KEY(p);
await wait(p, 1000);
s = await state(p);
check(s.view === "first" && s.mode === "fly" && near(s.pose, trackPose(s, 1, s.T)), `switch OFF MID-PLAY: play stopped at ${s.T.toFixed(2)} s, the camera HOLDS Cam 1`);
// 7. a SOLO of the covered take A (N covers it at 3–4 s)
await T_KEY(p);
{
  await clearSelection(p); // A is still selected from check 3's drag: a click would DESELECT it
  const a = await box(p, '[data-clip-id="A"]');
  await p.mouse.click(a.x + 20, a.y + a.h / 2);
  await wait(p, 300);
  await press(p, X);
  await p.waitForFunction(() => window.__cameraBench.T > 3.25 && window.__cameraBench.T < 3.8, null, { timeout: 8000 });
  s = await state(p);
  const A = s.chain.clips.find((c) => c.id === "A");
  check(/solo/.test(s.pipLabel) && near(s.pip, BC.clipPoseAt(A, s.T), 1e-3) && !near(s.pip, trackPose(s, 1, s.T), 1e-3), `a SOLO of the COVERED take: the PiP rides A (not N) at ${s.T.toFixed(2)} s, "${s.pipLabel}"`);
  await T_KEY(p);
  await wait(p, 500);
  s = await state(p);
  check(s.view === "first" && near(s.pose, BC.clipPoseAt(A, s.T), 1e-3) && !near(s.pose, trackPose(s, 1, s.T), 1e-3), "switch OFF mid-solo lands on the SOLOED take (the pose taken before the stop)");
  await p.mouse.click(a.x + 20, a.y + a.h / 2);
  await wait(p, 200);
}
// 8. switch off mid-barrel KEEPS the roll until a fly input
{
  let tr = 0, best = 1e9;
  for (let t = 1; t < BC.shapeLength(BARREL) - 1; t += 0.05) {
    const r = ((BC.poseInShape(BARREL, t).roll % 360) + 360) % 360;
    if (Math.abs(r - 90) < best) {
      best = Math.abs(r - 90);
      tr = t;
    }
  }
  await T_KEY(p);
  await scrubTo(p, 8 + tr);
  s = await state(p);
  const want = s.pip?.roll ?? 0;
  await T_KEY(p);
  await wait(p, 600);
  s = await state(p);
  const kept = s.roll;
  await axes(p, [0, -1, 0, 0]);
  await wait(p, 300);
  await axes(p, [0, 0, 0, 0]);
  s = await state(p);
  check(Math.abs(want) > 20 && Math.abs(kept - want) < 1e-6 && s.roll === 0, `switch OFF mid-BARREL keeps the roll (${kept.toFixed(1)}°) until a fly input (then ${s.roll}°)`);
}
// 12. the labels track the bodies — the SAME frame, during play
await T_KEY(p);
await scrubTo(p, 0.5);
await press(p, X);
{
  let worst = 0, seen = 0;
  for (let i = 0; i < 6; i++) {
    await wait(p, 250);
    const r = await p.evaluate(() => {
      // LAYOUT px (the bench's own units under the root zoom), not on-screen px
      const s = window.__cameraBench, pic = document.querySelector("[data-drag-surface]");
      const labels = [...document.querySelectorAll("[data-cam-label]")].map((e) => ({ cam: Number(e.dataset.camLabel), shown: e.style.display !== "none", t: e.style.transform }));
      return { helpers: JSON.parse(JSON.stringify(s.helpersNow())), eye: JSON.parse(JSON.stringify(s.eyeNow())), labels, w: pic.offsetWidth, h: pic.offsetHeight, d: s.d };
    });
    const cam = new THREE.PerspectiveCamera(r.eye.fov, r.w / r.h, 1, r.d * 60);
    cam.position.set(r.eye.x, r.eye.y, r.eye.z);
    cam.rotation.set((r.eye.pitch * Math.PI) / 180, (r.eye.yaw * Math.PI) / 180, 0, "YXZ");
    cam.updateMatrixWorld();
    cam.updateProjectionMatrix();
    for (const l of r.labels.filter((x) => x.shown)) {
      const h = r.helpers.find((k) => k.cam === l.cam);
      const q = new THREE.Vector3(h.x, h.y, h.z).project(cam);
      const [lx, ly] = l.t.match(/-?[\d.]+/g).map(Number);
      worst = Math.max(worst, Math.hypot(lx - (((q.x + 1) / 2) * r.w + 10), ly - (((1 - q.y) / 2) * r.h - 10)));
      seen++;
    }
  }
  check(seen >= 6 && worst < 0.5, `the LABELS sit on their bodies in the same frame during play: ${seen} readings, worst ${worst.toFixed(3)} px`);
}
await press(p, X);
// 13. the grid fades round the camera of each draw
{
  await wait(p, 300);
  const g = await p.evaluate(() => ({ log: window.__benchGrid, eye: { ...window.__cameraBench.eyeNow() }, at: window.__cameraBench.at }));
  const eyeE = g.log.filter((x) => x.who === "eye"), shotE = g.log.filter((x) => x.who === "shot");
  const ok = eyeE.length && shotE.length && eyeE.every((x) => Math.abs(x.at[0] - g.eye.x) < 1e-3 && Math.abs(x.at[2] - g.eye.z) < 1e-3) && shotE.every((x) => Math.abs(x.at[0] - g.at.x) < 1e-3 && Math.abs(x.at[2] - g.at.z) < 1e-3);
  check(!!ok, `the GRID's fade centre set per draw: ${eyeE.length} eye draws at the EYE's floor point, ${shotE.length} PiP draws at the SHOT camera's`);
}
// 14. a path does not span a take's cut-in (the data the page draws: `trackPath`, Step 1)
{
  s = await state(p);
  const segs = BC.trackPath(s.chain, 1);
  const step = Math.max(...segs.flatMap((seg) => seg.slice(1).map((q, i) => Math.hypot(q.x - seg[i].x, q.z - seg[i].z))));
  check(step < 0.02, `Cam 1's path breaks at N's cut-in: the largest step inside a stretch ${step.toFixed(4)} (the jump is ~0.1)`);
}
// 15. the HUD reads the PiP's camera; the eye remembered
{
  s = await state(p);
  const u = s.chainUnits, w = { x: s.pip.x * u.d, y: u.up + s.pip.y * u.d, z: u.zc + s.pip.z * u.d };
  check(Math.abs(s.at.x - w.x) < 1e-6 && Math.abs(s.at.z - w.z) < 1e-6 && (await p.$("[data-hud-third]")) !== null, "the HUD reads the PiP's CAMERA in third person");
  const eyeBefore = s.eye;
  await p.reload({ waitUntil: "networkidle" });
  await p.waitForSelector('[data-camera-bench="drawn"]', { timeout: 60000 });
  await wait(p, 600);
  await T_KEY(p);
  check(near((await state(p)).eye, eyeBefore, 1e-6), "the EYE remembered across a reload");
}
await p.screenshot({ path: `${OUT}/third-person-verify.png` });
await p.context().close();

// ── 9. no helper pixel in first person or in the PiP; 10. the PiP's framing = the first-person view of the same camera —
//    each at a pixel ratio of 1 AND 2 (the plan review's [1]: a ratio of 1 cannot see a doubled scale)
const fixedEye = JSON.stringify({ x: -1700, y: 1500, z: 3700, yaw: -35, pitch: -25, fov: 50 });
async function shot(p, sel, clip) {
  const buf = clip ? await p.screenshot({ clip }) : await p.locator(sel).screenshot();
  return sharp(buf).removeAlpha().raw().toBuffer({ resolveWithObject: true });
}
const pixelsDiffer = (a, b) => { let n = 0; for (let i = 0; i < a.data.length; i += 3) if (a.data[i] !== b.data[i] || a.data[i + 1] !== b.data[i + 1] || a.data[i + 2] !== b.data[i + 2]) n++; return n; };
for (const dpr of [1, 2]) {
  const grab = {};
  for (const mode of ["loud", "off"]) {
    const q = await page({ dpr, helpers: mode });
    await fresh(q, { [EYE]: fixedEye });
    await scrubTo(q, 2.5);
    await q.addStyleTag({ content: "[data-overlay]{display:none!important}" });
    await wait(q, 400);
    grab[`${mode}-first`] = await shot(q, "[data-drag-surface] canvas");
    await q.keyboard.press("KeyT");
    await wait(q, 800);
    grab[`${mode}-pip`] = await shot(q, null, await pipClip(q));
    grab[`${mode}-third`] = await shot(q, "[data-drag-surface] canvas");
    await q.context().close();
  }
  const dFirst = pixelsDiffer(grab["loud-first"], grab["off-first"]), dPip = pixelsDiffer(grab["loud-pip"], grab["off-pip"]), dThird = pixelsDiffer(grab["loud-third"], grab["off-third"]);
  check(dThird > 100 && dFirst === 0 && dPip === 0, `DPR ${dpr}: NO HELPER PIXEL in first person (${dFirst}) or the PiP (${dPip}); the loud helpers DO show in the eye's view (${dThird} px — the check can see them)`);

  // 10. framing, grid OFF: the PiP (Cam 1 armed) against the first-person view of Cam 1 after switching off, downscaled
  const q = await page({ dpr });
  await fresh(q, { [EYE]: fixedEye });
  await q.click('button[aria-label="Scene information"]');
  await q.click('button[aria-label="Floor grid"]');
  await q.click('button[aria-label="Scene information"]');
  await arm(q, 1);
  await scrubTo(q, 2.5);
  await q.keyboard.press("KeyT");
  await wait(q, 800);
  await q.addStyleTag({ content: "[data-overlay]{display:none!important}" });
  const pipImg = await shot(q, null, await pipClip(q));
  await q.keyboard.press("KeyT");
  await wait(q, 800);
  const first = await sharp(await q.locator("[data-drag-surface] canvas").screenshot()).removeAlpha().resize(pipImg.info.width, pipImg.info.height, { fit: "fill" }).raw().toBuffer({ resolveWithObject: true });
  // the NEGATIVE CONTROL: the same PiP against the first-person view of the WRONG camera (Cam 2) must fail the mark
  await arm(q, 2);
  await q.keyboard.press("KeyT");
  await wait(q, 500);
  await q.keyboard.press("KeyT");
  await wait(q, 800);
  const wrong = await sharp(await q.locator("[data-drag-surface] canvas").screenshot()).removeAlpha().resize(pipImg.info.width, pipImg.info.height, { fit: "fill" }).raw().toBuffer({ resolveWithObject: true });
  const mad = (a, b) => { let t = 0; for (let i = 0; i < a.data.length; i++) t += Math.abs(a.data[i] - b.data[i]); return t / a.data.length; };
  const mRight = mad(pipImg, first), mWrong = mad(pipImg, wrong);
  // the evidence, saved: the PiP, the right camera and the wrong one, all at the PiP's size
  const png = (img, name) => sharp(img.data, { raw: { width: img.info.width, height: img.info.height, channels: 3 } }).png().toFile(`${OUT}/framing-dpr${dpr}-${name}.png`);
  await Promise.all([png(pipImg, "pip"), png(first, "first-cam1"), png(wrong, "first-cam2-wrong")]);
  check(mRight <= 8 && mWrong > 8, `DPR ${dpr}: the PiP's FRAMING = first person of the same camera: mean difference ${mRight.toFixed(2)} / 255 (mark ≤ 8); the WRONG camera ${mWrong.toFixed(2)} (must exceed 8 — the check can fail)`);
  await q.context().close();
}

check(errors.length === 0, `no console errors${errors.length ? ": " + errors.slice(0, 3).join(" | ") : ""}`);
console.log(`\nVERDICT ${fail ? "✖" : "✔"} ${pass}/${pass + fail}`);
console.log("⚠ NOT WATCHED: how flying the eye feels (Carl's hands); a client film; the frameAll fallback with no scene box; the path lines' pixels (their data is checked).");
await br.close();
process.exitCode = fail ? 1 : 0;
