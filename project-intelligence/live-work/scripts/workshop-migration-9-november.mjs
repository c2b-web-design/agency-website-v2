// ⛔ THE WORKSHOP's STEP 2 MIGRATION CHECK (9 November 2026, session 2; note v2.1, [R10-1], [R10-2]). Needs the dev server.
// 1. A fresh profile loads the bench: it places the Builder's take and saves a WORKSHOP chain. That chain is read back.
// 2. Its ARCH-world twin is made by hand (units up − 429.05…, zc + 16; nothing else touched) and planted, with an
//    arch-world camera (v1) and eye (v1), in a SECOND fresh profile — no workshop keys.
// 3. That profile loads the plain bench. PASS when: the loaded chain equals the workshop chain exactly (units included, the
//    same clips: the take NOT placed twice); the camera stands at the planted pose + (0, 429.05…, −16), its turn, tilt
//    and lens unchanged; the eye likewise (third person, `t`); the arch-world keys are still there, untouched.
// ⚠ NOT WATCHED: v1/v2 chains (their units are null and filled from the bench's measure — not planted here); the
//    refusal paths; Carl's real storage (this is a Playwright profile).
import { chromium } from "file:///C:/Users/Carl Buckley/agency-website-v2/node_modules/playwright/index.mjs";
const SHIFT = { y: 429.05184025084225, z: -16 };
const URL_ = "http://localhost:3000/proto/camera";
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"] });
const ok = (c, s) => (console.log(`${c ? "PASS" : "FAIL"}  ${s}`), c);
let all = true;

const c1 = await b.newContext({ viewport: { width: 1909, height: 934 } });
const p1 = await c1.newPage();
await p1.goto(URL_);
await p1.waitForSelector('[data-camera-bench="drawn"]', { timeout: 60000 });
await p1.waitForTimeout(2000);
const ws = await p1.evaluate(() => JSON.parse(localStorage.getItem("c2b-camera-bench-chain-v3-workshop") ?? "null"));
await c1.close();
all &&= ok(!!ws && ws.units && ws.clips.length > 0, `a fresh bench saved a workshop chain (${ws?.clips.length} clips, units ${JSON.stringify(ws?.units)})`);

const archChain = { ...ws, units: { ...ws.units, up: ws.units.up - SHIFT.y, zc: ws.units.zc - SHIFT.z } };
const cam = { x: 123, y: -200, z: 1500, yaw: 12, pitch: -7, fov: 40 };
const eye = { x: -300, y: 150, z: 4000, yaw: -20, pitch: -15, fov: 55 };
const c2 = await b.newContext({ viewport: { width: 1909, height: 934 } });
await c2.addInitScript(({ archChain, cam, eye }) => {
  if (sessionStorage.getItem("planted")) return;
  sessionStorage.setItem("planted", "1");
  localStorage.setItem("c2b-camera-bench-chain-v3", JSON.stringify(archChain));
  localStorage.setItem("c2b-camera-bench-camera-v1", JSON.stringify(cam));
  localStorage.setItem("c2b-camera-bench-eye-v1", JSON.stringify(eye));
}, { archChain, cam, eye });
const p2 = await c2.newPage();
await p2.goto(URL_);
await p2.waitForSelector('[data-camera-bench="drawn"]', { timeout: 60000 });
await p2.waitForTimeout(1500);
const got = await p2.evaluate(() => ({ chain: window.__cameraBench.chain, at: window.__cameraBench.at, fov: window.__cameraBench.fov, pose: window.__cameraBench.pose }));
const near = (a, b) => Math.abs(a - b) < 1e-9;
all &&= ok(JSON.stringify(got.chain.units) === JSON.stringify(ws.units), `the chain's units moved into the workshop: ${JSON.stringify(got.chain.units)}`);
all &&= ok(JSON.stringify(got.chain.clips) === JSON.stringify(ws.clips), `the clips identical to the workshop chain's (${got.chain.clips.length}; the take not placed twice)`);
all &&= ok(near(got.at.x, cam.x) && near(got.at.y, cam.y + SHIFT.y) && near(got.at.z, cam.z + SHIFT.z), `the camera moved: (${got.at.x}, ${got.at.y}, ${got.at.z}) from (${cam.x}, ${cam.y}, ${cam.z})`);
all &&= ok(near(got.fov, cam.fov), `the camera's lens unchanged (${got.fov})`);
await p2.keyboard.press("t");
await p2.waitForTimeout(800);
const e = await p2.evaluate(() => window.__cameraBench.eye);
all &&= ok(!!e && near(e.x, eye.x) && near(e.y, eye.y + SHIFT.y) && near(e.z, eye.z + SHIFT.z) && near(e.yaw, eye.yaw) && near(e.pitch, eye.pitch) && near(e.fov, eye.fov), `the eye moved: ${JSON.stringify(e)}`);
const kept = await p2.evaluate(() => ["c2b-camera-bench-chain-v3", "c2b-camera-bench-camera-v1", "c2b-camera-bench-eye-v1"].map((k) => localStorage.getItem(k)));
all &&= ok(kept[0] === JSON.stringify(archChain) && kept[1] === JSON.stringify(cam) && kept[2] === JSON.stringify(eye), "the arch-world keys kept, untouched");
await c2.close();
await b.close();
console.log(all ? "\nALL PASS" : "\nFAILURES ABOVE");
