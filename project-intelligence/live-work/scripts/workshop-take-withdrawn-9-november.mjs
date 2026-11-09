// ⛔ THE BUILDER's TAKE WITHDRAWN (9 November 2026, session 2; Carl: "on the bench is the barrel roll. it shouldnt be
// there"). Builds, under Node (bench-chain.ts imported with its types stripped), a WORKSHOP chain holding the Builder's
// Vader clip (`builder-v4`, take 4's numbers in the workshop's world) beside one of "Carl's" recorded clips, plants it in a
// fresh profile, loads the bench (BUILDER_TAKE is null). PASS when: the Builder's clip is gone; Carl's clip is there,
// byte-identical; the units unchanged; a reload does NOT bring the take back. NEGATIVE CONTROL: the same chain with the
// take clip renamed to a non-builder id must keep BOTH (the withdrawal keys on the Builder's ids, not on "a barrel").
// ⚠ NOT WATCHED: the withdrawal during a drag or recording (it waits; not exercised), Carl's real storage.
import { chromium } from "file:///C:/Users/Carl Buckley/agency-website-v2/node_modules/playwright/index.mjs";
import { emptyChain, placeShape, recordClip, Sampler } from "../../../components/showcase/bench-chain.ts";

const units = { d: 2287.490381354744, up: 429.05184025084225, zc: 0 };
const toU = (w) => [w[0] / units.d, (w[1] - units.up) / units.d, (w[2] - units.zc) / units.d];
const from = [0, 429.05184025084225, -16 + 2287.490381354744];
const to = [0, 429.05184025084225, -816];
const frac = (from[2] - 600) / (from[2] - to[2]), frac0 = (from[2] - 1714) / (from[2] - to[2]);
const shape = { kind: "barrel", from: toU(from), to: toU(to), turns: 2, radius: 120 / units.d, spiralStart: frac0, rollEase: 0.4, spiralEnd: frac, fov: 30, pace: 280 / units.d, v0: 0, rampS: 2, landS: 2.5 };
const s = new Sampler({ x: 0.1, y: 0, z: 1, yaw: 0, pitch: 0, fov: 30 });
for (let i = 1; i <= 120; i++) s.step(1 / 60, { x: 0.1 + i / 1200, y: 0, z: 1, yaw: 0, pitch: 0, fov: 30 });
let chain = { ...emptyChain(), units };
chain = recordClip(chain, 1, 20, s.finish({ x: 0.2, y: 0, z: 1, yaw: 0, pitch: 0, fov: 30 }), "carl-1");
const withTake = placeShape(chain, 1, 0, shape, "builder-v4");
const renamed = placeShape(chain, 1, 0, shape, "carl-barrel");

const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"] });
let all = true;
const ok = (c, m) => (console.log(`${c ? "PASS" : "FAIL"}  ${m}`), (all &&= !!c));
async function load(planted) {
  const ctx = await b.newContext({ viewport: { width: 1909, height: 934 } });
  await ctx.addInitScript((c) => {
    if (sessionStorage.getItem("planted")) return;
    sessionStorage.setItem("planted", "1");
    localStorage.setItem("c2b-camera-bench-chain-v3-workshop", c);
  }, JSON.stringify(planted));
  const p = await ctx.newPage();
  const read = async () => {
    await p.waitForSelector('[data-camera-bench="drawn"]', { timeout: 60000 });
    await p.waitForTimeout(1500);
    return p.evaluate(() => ({ chain: window.__cameraBench.chain, saved: JSON.parse(localStorage.getItem("c2b-camera-bench-chain-v3-workshop") ?? "null"), status: document.body.innerText.match(/The Builder's take was withdrawn[^\n]*/)?.[0] ?? null }));
  };
  await p.goto("http://localhost:3000/proto/camera");
  const first = await read();
  await p.reload();
  const second = await read();
  await ctx.close();
  return { first, second };
}
const carl = JSON.stringify(chain.clips.find((c) => c.id === "carl-1"));
{
  const { first, second } = await load(withTake);
  ok(withTake.clips.length === 2, `planted: the Builder's clip and Carl's (${withTake.clips.map((c) => c.id).join(", ")})`);
  ok(!first.chain.clips.some((c) => c.id.startsWith("builder-")), `the Builder's clip withdrawn (left: ${first.chain.clips.map((c) => c.id).join(", ")})`);
  ok(JSON.stringify(first.chain.clips.find((c) => c.id === "carl-1")) === carl, "Carl's clip there, byte-identical");
  ok(JSON.stringify(first.chain.units) === JSON.stringify(units), "the units unchanged");
  ok(!!first.status, `said so: "${first.status}"`);
  ok(!second.chain.clips.some((c) => c.id.startsWith("builder-")) && second.chain.clips.length === 1, "after a reload the take does NOT come back");
  ok(!!second.saved && !second.saved.clips.some((c) => c.id.startsWith("builder-")), "the saved chain holds no Builder's clip");
}
{
  const { first } = await load(renamed);
  ok(first.chain.clips.length === 2 && first.chain.clips.some((c) => c.id === "carl-barrel"), "NEGATIVE CONTROL: a barrel under one of Carl's ids is KEPT (both clips there)");
}
await b.close();
console.log(all ? "\nALL PASS" : "\nFAILURES ABOVE");
