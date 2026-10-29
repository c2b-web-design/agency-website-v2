/** FILM 04 — THE CAMERA BENCH, THIRD PERSON (29 October 2026, R-098). Carl's own run, re-staged from his saved bench: the
 *  Vader move played IN THE CAMERA, then the switch to third person (his eye: placed near the camera), the same move played
 *  again from outside — the camera's body travelling its path, the PiP top left showing what it sees. `/proto/camera` at
 *  1920 × 1080, DPR 1, dev server, badge hidden, the pad stubbed (nothing but the keyboard drives it).
 *    node …/film04-camera-bench-29-october.mjs <base> <outDir> <name> <stateDir>
 *  <stateDir> holds Carl's saved `c2b-camera-bench-{chain-v3,camera-v1,eye-v1}` as JSON (read from his Chrome's storage).
 *  Playwright's WebM; convert to 1080p30 CFR for Resolve. Every beat's time is logged for the shot list.
 *  ⚠ NOT WATCHED: whether it is good (Carl's eye); a dev server's frame pacing is not production's. */
import { chromium } from "playwright";
import { mkdirSync, readFileSync, renameSync } from "node:fs";

const [BASE = "http://localhost:3000", OUT = ".", NAME = "camera-bench", STATE = "."] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const read = (k) => readFileSync(`${STATE}/http_localhost_3000__${k}.json`, "utf8");
const KEYS = Object.fromEntries(["c2b-camera-bench-chain-v3", "c2b-camera-bench-camera-v1", "c2b-camera-bench-eye-v1"].map((k) => [k, read(k)]));
const MOVE = JSON.parse(KEYS["c2b-camera-bench-chain-v3"]).clips[0];
const LEN = MOVE.out - MOVE.in;

const VP = { width: 1920, height: 1080 };
const b = await chromium.launch({ headless: false, args: ["--enable-gpu", "--use-angle=default", "--ignore-gpu-blocklist"] });
// the state goes in BEFORE the first load, so the first frame is already Carl's bench
const setup = await b.newContext({ viewport: VP, deviceScaleFactor: 1 });
const s0 = await setup.newPage();
await s0.goto(`${BASE}/proto/camera`, { waitUntil: "networkidle" });
const storage = await setup.storageState();
await setup.close();
const origin = new URL(BASE).origin;
storage.origins = [{ origin, localStorage: Object.entries(KEYS).map(([name, value]) => ({ name, value })) }];
const ctx = await b.newContext({ viewport: VP, deviceScaleFactor: 1, storageState: storage, recordVideo: { dir: OUT, size: VP } });
await ctx.addInitScript(() => {
  navigator.getGamepads = () => [null];
});
const p = await ctx.newPage();
const errors = [];
p.on("pageerror", (e) => errors.push(String(e)));
const t0 = Date.now();
const at = () => ((Date.now() - t0) / 1000).toFixed(2);
const log = (m) => console.log(`${at().padStart(6)} s  ${m}`);
const st = () => p.evaluate(() => JSON.parse(JSON.stringify(window.__cameraBench)));
const playThrough = async (label) => {
  await p.keyboard.press("KeyP");
  const w0 = Date.now();
  log(`${label}: play`);
  // the snapshot is 10 Hz: see the play begin before waiting for it to end
  await p.waitForFunction(() => window.__cameraBench.mode === "play", null, { timeout: 3000, polling: 20 });
  await p.waitForFunction(() => window.__cameraBench.mode !== "play", null, { timeout: (LEN + 10) * 1000, polling: 100 });
  const wall = (Date.now() - w0) / 1000;
  log(`${label}: ends (${wall.toFixed(2)} s on the clock for a ${LEN.toFixed(2)} s move)`);
};

await p.goto(`${BASE}/proto/camera`, { waitUntil: "networkidle" });
await p.addStyleTag({ content: "nextjs-portal{display:none!important}" });
await p.waitForSelector('[data-camera-bench="drawn"]', { timeout: 60000 });
let s = await st();
const eye = JSON.parse(KEYS["c2b-camera-bench-eye-v1"]);
if (s.clips.length !== 1 || s.clips[0].id !== MOVE.id) throw new Error(`the bench is not Carl's: ${JSON.stringify(s.clips)}`);
log(`loaded: ${s.clips[0].id}, ${LEN.toFixed(2)} s; view ${s.view}`);
await p.keyboard.press("Home");
await p.waitForTimeout(2500);

// 1. IN THE CAMERA
await playThrough("first person");
await p.waitForTimeout(1500);

// 2. STEP OUT: back to the start, then third person from Carl's eye
await p.keyboard.press("Home");
await p.waitForTimeout(800);
await p.keyboard.press("KeyT");
await p.waitForTimeout(300);
s = await st();
const eyeOk = s.eye && ["x", "y", "z", "yaw", "pitch"].every((k) => Math.abs(s.eye[k] - eye[k]) < 1e-6);
log(`third person: view ${s.view}; the eye ${eyeOk ? "IS Carl's" : `MOVED ${JSON.stringify(s.eye)}`}`);
await p.waitForTimeout(3000);

// 3. THE SAME MOVE FROM OUTSIDE
await playThrough("third person");
await p.waitForTimeout(2500);

// 4. BACK INTO THE CAMERA
await p.keyboard.press("KeyT");
await p.waitForTimeout(300);
log(`back to first person: view ${(await st()).view}`);
await p.waitForTimeout(1700);

const v = p.video();
await ctx.close();
renameSync(await v.path(), `${OUT}/${NAME}.webm`);
log(`→ ${OUT}/${NAME}.webm`);
console.log(errors.length ? `⚠ page errors: ${errors.join(" | ")}` : "page errors: none");
await b.close();
