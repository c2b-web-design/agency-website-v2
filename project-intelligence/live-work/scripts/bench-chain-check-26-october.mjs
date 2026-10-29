/** THE RECORDER's TIMELINE, CHECKED WITHOUT A BROWSER. R1 (26 October 2026), REWRITTEN for T1a, CAMERA TRACKS (27 October;
 *  `live-work/plan-camera-tracks-t1a-27-october.md` v2, "Verification" 1). Node 25 runs `components/showcase/bench-chain.ts`
 *  with its types stripped (the Architect's [A9]: it imports nothing at runtime).
 *    node project-intelligence/live-work/scripts/bench-chain-check-26-october.mjs
 *  ⛔ R1 ITSELF IS THE REFERENCE: R1's `bench-chain.ts` is taken from git at `fb86684` (the R1 file, unchanged since R1's
 *  commit) and imported as it was — its `appendClip` / `punchIn` BUILD the R1 chains and its `poseAt` checks T1a's frozen
 *  `v1PoseAt`. Nothing of R1 is re-typed here.
 *  ⚠ NOT WATCHED: the bench's store, its UI, the pad, storage — the page harness does those; Carl's own chain — the bench
 *  checks it in his browser on the first load (`parityV1`) and shows the verdict. */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import vm from "node:vm";
import {
  EDGE_S, PROBE, Sampler, addTrack, chainEnd, clipPoseAt, deleteClips, emptyChain, gapsOf, helixFrom, joinsOf, migrateV1, parityV1,
  moveFromFile, parseChain, placeShape, poseAtT, poseInShape, recaptureStart, recordClip, replaceShape, shapeLength, shapeRefusal, sourceAt, startSpeed,
  takesAt, v1PoseAt, wrapDeg,
  MIN_CLIP_S, applyEdit, clipEnd, clipLength, isTrimmed, moveClip, setTrim, snapSpan, snapTargets, snapTime, sourceLength, trimClip,
} from "../../../components/showcase/bench-chain.ts";
const here = dirname(fileURLToPath(import.meta.url));

const tmp = mkdtempSync(join(tmpdir(), "bench-r1-"));
const r1File = join(tmp, "bench-chain-r1.ts");
writeFileSync(r1File, execFileSync("git", ["show", "fb86684:components/showcase/bench-chain.ts"]));
const R1 = await import(pathToFileURL(r1File).href);
rmSync(tmp, { recursive: true, force: true });

let pass = 0, fail = 0;
const check = (ok, what) => {
  console.log(`${ok ? "✔" : "✖"} ${what}`);
  if (ok) pass++;
  else fail++;
};
const pose = (x, yaw = 0) => ({ x, y: 0, z: 1, yaw, pitch: 0, fov: 30 });
/** samples of `secs` at 60 a second, x running a → b (as a recording makes them) */
function samples(secs, a = 0, b = 1) {
  const s = new Sampler(pose(a));
  const n = Math.round(secs * 60);
  for (let i = 1; i <= n; i++) s.step(1 / 60, pose(a + ((b - a) * i) / n));
  return s.finish(pose(b));
}
const r1clip = (id, cam, secs, a, b) => ({ id, cam, samples: samples(secs, a, b) });
const near = (p, q, tol = 1e-9) => p && q && ["x", "y", "z", "yaw", "pitch", "fov"].every((k) => Math.abs(p[k] - q[k]) <= tol);

// ── the sampler (unchanged from R1): a fixed rate on any display, one sample a frame at most, the hitch clamped
const feed = (hz, secs) => {
  const s = new Sampler(pose(0));
  for (let i = 0; i < Math.round(hz * secs); i++) s.step(1 / hz, pose(i));
  return s;
};
for (const hz of [144, 60]) {
  const n = feed(hz, 2).samples.length;
  check(Math.abs(n - 120) <= 1, `${hz} Hz for 2 s → ${n} samples (120 ± 1: the size does not follow the display)`);
}
{
  const s = feed(30, 2);
  const times = s.samples.map((x) => x[0]);
  const repeated = times.some((t, i) => i && t === times[i - 1]);
  check(Math.abs(s.samples.length - 60) <= 1 && !repeated, `30 Hz for 2 s → ${s.samples.length} samples (≈ 60), no two at the same time [C2]`);
  const h = new Sampler(pose(0));
  h.step(0.5, pose(1));
  check(Math.abs(h.length - 0.1) < 1e-9, `a 0.5 s frame advances the clip by ${h.length} s (the hitch, clamped at 0.1) [A9]`);
}

// ── ⛔ THE MIGRATION, PROVEN AGAINST R1 ITSELF
/** R1 chains built BY R1's code: three clips; a punch-in mid-clip; a cut to Cam 2; a framing jump (a mismatch); odd lengths */
const r1Chains = (() => {
  const app = (ch, c) => R1.appendClip(ch, c);
  let a = R1.emptyChain();
  for (const c of [r1clip("a", 1, 2, 0, 1), r1clip("b", 1, 1.3, 1, 2), r1clip("c", 1, 2.15, 2, 3)]) a = app(a, c);
  let b = R1.punchIn(a, 1.0, r1clip("n", 1, 0.9, 7, 8)).chain;
  b = app(b, r1clip("d", 2, 1.7, 20, 21)); // a CUT
  b = app(b, r1clip("e", 2, 0.75, 30, 30.5)); // a MISMATCH (framing between clips)
  const c = R1.punchIn(b, R1.clipStarts(b)[3], r1clip("p", 2, 0.4, 40, 41)).chain; // a punch at a clip's very start
  return { "three clips": a, "a punch-in, a cut, a mismatch": b, "a punch at a clip's start": c };
})();
{
  const ch = r1Chains["a punch-in, a cut, a mismatch"];
  const dur = R1.chainDuration(ch);
  let same = true;
  for (let T = -0.5; T <= dur + 0.5; T += 0.0173) if (!near(v1PoseAt(ch.clips, T), R1.poseAt(ch, T), 0)) same = false;
  for (const B of R1.clipStarts(ch)) for (const T of [B, B - EDGE_S, B - PROBE, B + PROBE]) if (!near(v1PoseAt(ch.clips, T), R1.poseAt(ch, T), 0)) same = false;
  check(same, "T1a's frozen v1PoseAt equals R1's own poseAt (taken from git at fb86684) EXACTLY, at 400+ moments and every boundary");
}
for (const [name, ch] of Object.entries(r1Chains)) {
  const v2 = migrateV1(ch.clips);
  const p = parityV1(ch.clips, v2);
  check(p.ok, `PARITY, "${name}" (${ch.clips.length} clips): ${p.moments} moments (every sample, every boundary exactly and ± PROBE), largest difference ${p.maxDiff} (≤ 1e-9)`);
}
{
  const ch = r1Chains["a punch-in, a cut, a mismatch"];
  const v2 = migrateV1(ch.clips);
  const joins = joinsOf(v2, 1);
  check(joins.some((j) => j.kind === "cut") && joins.some((j) => j.kind === "mismatch" && j.metres > 1), `the migrated chain shows R1's cut and mismatch: ${joins.map((j) => j.kind).join(", ")}`);
  // [E1] the ± EDGE_S band: R1 rounds to the EARLIER clip, T1a to the LATER — BY DESIGN, asserted, not assumed
  const B = R1.clipStarts(ch)[4];
  const a = v1PoseAt(ch.clips, B - EDGE_S), b = poseAtT(v2, B - EDGE_S).pose;
  check(!near(a, b, 1e-6) && near(b, v1PoseAt(ch.clips, B)), `[E1] inside the band (B − EDGE_S) the rules DIFFER by design: R1 the earlier clip, T1a the later (x ${a.x.toFixed(3)} vs ${b.x.toFixed(3)})`);
  // ⛔ RED FIRST: a planted off-by-one start must FAIL the parity check
  const planted = { ...v2, clips: v2.clips.map((c, i) => (i === 2 ? { ...c, start: c.start + 1 / 60 } : c)) };
  const bad = parityV1(ch.clips, planted);
  check(!bad.ok, `a PLANTED fault (clip 3 started 1/60 s late) FAILS parity: largest difference ${bad.maxDiff.toFixed(4)}`);
  check(v2.tracks.join() === "1,2" && v2.clips.every((c, i) => c.order === i && c.in === 0), `the migrated tracks ${v2.tracks.join(", ")}; order = its place; shown whole`);
}

// ── PRECEDENCE, TAKES, RUN-ON, SOLO
const S = (secs, a, b) => samples(secs, a, b);
let ch = recordClip(emptyChain(), 1, 0, S(4, 0, 4), "A"); // Cam 1, 0–4 s, x 0 → 4
ch = recordClip(addTrack(ch), 2, 1, S(1, 50, 51), "B2"); // Cam 2 over 1–2 s
{
  check(sourceAt(ch, 1.5)?.id === "B2" && sourceAt(ch, 0.5)?.id === "A", "the TOP track plays: Cam 2 at 1.5 s, Cam 1 at 0.5 s");
  const p = poseAtT(ch, 2.5);
  check(p.clip?.id === "A" && Math.abs(p.pose.x - 2.5) < 1e-6, `after Cam 2 ends, Cam 1 RESUMES mid-move (x ${p.pose.x.toFixed(3)} at 2.5 s, untouched)`);
  const j = joinsOf(ch, 1);
  check(j.length === 2 && j.every((x) => x.kind === "cut") && Math.abs(j[0].t - 1) < 1e-9 && Math.abs(j[1].t - 2) < 1e-9, `two CUTS, at ${j.map((x) => x.t).join(" and ")} s`);
  check(Math.abs(clipPoseAt(ch.clips[0], 1.5).x - 1.5) < 1e-6, "SOLO: the covered Cam 1 clip's own pose at 1.5 s (precedence ignored)");
  const t = takesAt(ch, 1.5).map((c) => c.id).join(",");
  check(t === "B2,A", `[E4] the takes under 1.5 s, top first: ${t}`);
  const d = deleteClips(ch, new Set(["B2"]));
  check(sourceAt(d, 1.5)?.id === "A", "delete the Cam 2 clip → Cam 1 plays again (non-destructive)");
}
{
  let t = recordClip(emptyChain(), 1, 0, S(4, 0, 4), "A");
  t = recordClip(t, 1, 1, S(1, 9, 10), "N"); // a NEW TAKE on the same track
  check(sourceAt(t, 1.5)?.id === "N" && sourceAt(t, 2.5)?.id === "A" && t.clips[0].samples === t.clips.find((c) => c.id === "A").samples, "a new take on Cam 1 plays over the old; the old resumes after it, its samples untouched");
  const j = joinsOf(t, 1);
  check(j.length === 2 && j.every((x) => x.kind === "mismatch") && Math.abs(j[0].metres - 8) < 1e-6 && Math.abs(j[1].metres - 8) < 1e-6, `[C2] the take's START and END over the older take are MISMATCHES: ${j.map((x) => x.metres.toFixed(2) + " m").join(", ")} (from where the old one IS, mid-move)`);
}
{
  let t = recordClip(emptyChain(), 1, 0, S(2, 0, 2), "A");
  t = recordClip(t, 1, 3, S(2, 3, 5), "C"); // a gap 2–3 s
  check(JSON.stringify(gapsOf(t).map((g) => g.map((x) => +x.toFixed(6)))) === "[[2,3]]", `a GAP from 2 to 3 s: ${JSON.stringify(gapsOf(t))}`);
  check(joinsOf(t, 1).length === 0, "a GAP EDGE IS NOT A JOIN");
  const h = poseAtT(t, 2.5);
  check(h.gap && Math.abs(h.pose.x - 2) < 1e-9, `in the gap the LAST picture holds (x ${h.pose.x})`);
  const u = recordClip(emptyChain(), 1, 1, S(1, 7, 8), "L");
  const f = poseAtT(u, 0.5);
  check(f.gap && Math.abs(f.pose.x - 7) < 1e-9, `[C6] no picture before T → the FIRST after (x ${f.pose.x})`);
  const r = recordClip(t, 1, 1, S(3, 20, 23), "R"); // runs on INTO clip C
  check(sourceAt(r, 3.5)?.id === "R" && sourceAt(r, 4.5)?.id === "C" && gapsOf(r).length === 0, "a run-on into a clip COVERS it as a new take; the clip plays again after; the gap filled");
  check(Math.abs(chainEnd(r) - 5) < 1e-9, `the shot ends at the latest clip end (${chainEnd(r)} s)`);
}
{
  // half-open at a sum of sixtieths: the later clip owns the boundary, the earlier owns boundary − PROBE
  let t = recordClip(emptyChain(), 1, 0, S(1.3, 0, 1), "A");
  const B = t.clips[0].out;
  t = recordClip(t, 1, B, S(1, 5, 6), "B");
  check(sourceAt(t, B)?.id === "B" && sourceAt(t, B - PROBE)?.id === "A", `[C5] half-open at ${B} s (a sum of sixtieths): the later clip at B, the earlier at B − PROBE`);
  const z = recordClip(emptyChain(), 1, -0.5, S(1, 0, 1), "Z");
  check(z.clips[0].start === 0, "[C9] a start before 0 s is clamped to 0");
}

// ── parseChain: v3 round trip; v2 and v1 migrated; refusals in words; unknown optional fields accepted
{
  const good = JSON.parse(JSON.stringify({ ...ch, units: { d: 2287.49, up: 0, zc: 16 } }));
  const r = parseChain(good);
  check("chain" in r && r.from === 3 && r.migrated === null && r.chain.clips.length === 2 && r.chain.units?.d === 2287.49, "a saved v3 chain reads back, its units with it");
  const v1 = JSON.parse(JSON.stringify(r1Chains["three clips"]));
  const m = parseChain(v1);
  check("chain" in m && m.from === 1 && m.migrated?.length === 3 && m.chain.version === 3 && m.chain.units === null, "a v1 (R1) chain is MIGRATED to v3 (units null until the first measured frame), its R1 clips returned for the parity check");
  check("chain" in parseChain({ ...good, refined: { future: true }, somethingNew: 1 }), "an unknown optional field is ACCEPTED [A2]");
  // ⛔ v2 → v3: R1's verdict carried UNCHANGED as migrations[0] (its persistent line survives), the step appended
  const r1Verdict = { from: 1, moments: 12, maxDiff: 0.5, ok: false };
  const v2 = { ...good, version: 2, migration: r1Verdict };
  delete v2.units;
  delete v2.migrations;
  const k2 = parseChain(JSON.parse(JSON.stringify(v2)));
  check(
    "chain" in k2 && k2.from === 2 && k2.chain.units === null && JSON.stringify(k2.chain.migrations[0]) === JSON.stringify(r1Verdict) && k2.chain.migrations[1]?.from === 2 && k2.chain.migrations[1].clips === 2,
    `[E2] v2 → v3: R1's verdict carried byte-for-byte as migrations[0], the step appended: ${"chain" in k2 ? JSON.stringify(k2.chain.migrations) : k2.refusal}`,
  );
  const back = "chain" in k2 ? parseChain(JSON.parse(JSON.stringify(k2.chain))) : null;
  check(back && "chain" in back && JSON.stringify(back.chain.migrations) === JSON.stringify(k2.chain.migrations), "both verdicts survive a v3 save and read (a differences line outlives a reload)");
  const c0 = good.clips[0];
  const bad = [
    [{ ...good, kind: "x" }, "kind"],
    [{ ...good, version: 4 }, "version"],
    [{ ...good, units: { d: 0, up: 0, zc: 0 } }, "units"],
    [{ ...good, clips: [{ ...c0, samples: [[0, 1, 2]] }] }, "sample shape"],
    [{ ...good, clips: [{ ...c0, cam: 9 }] }, "camera (not a track)"],
    [{ ...good, clips: [{ ...c0, out: c0.out + 5 }] }, "in / out"],
    [{ ...good, clips: [c0, { ...good.clips[1], order: c0.order }] }, "repeated take order"],
    [{ ...good, clips: [{ ...c0, start: -1 }] }, "start before 0"],
    [{ ...good, tracks: [1, 1] }, "track list"],
  ];
  for (const [b, what] of bad) {
    const x = parseChain(b);
    check("refusal" in x && x.refusal.length > 5, `a wrong ${what} is refused: "${x.refusal}"`);
  }
}

// ── ⛔ SHAPE CLIPS (the plan `plan-shape-clips-27-october.md` v2.1, Step 1)
const D = 2287.490381354744, UP = 0, ZC = 16; // the bench's measure, read from the running page 27 October
const U = (x, y, z) => [x / D, (y - UP) / D, (z - ZC) / D];
const AX = -285.2, AZ = 0, FLOOR = -429.05; // the snippet's constants (cm)
/** take 2's stand-in clip 1, as tested in Playwright: 21 m out / 4 m up → face on to the C, 2 m from the face, 10 cm up,
 *  DECELERATING to rest (6.8 s at 60 a second) */
const clip1Samples = Array.from({ length: 409 }, (_, k) => {
  const f = 1 - (1 - k / 408) ** 2;
  return [k / 60, ...U(-285.2 * f, -429.05 + 400 + (10 - 400) * f, 16 + 2100 + (200 - 2100) * f), 0, 0, 30];
});
const v2Of = (clips) => ({ kind: "c2b-camera-chain", version: 2, tracks: [1], clips, refined: null, comp: null });

/** ⛔ PARITY A — THE SNIPPET FILE RUN UNCHANGED (as `v1PoseAt` keeps R1's arithmetic): its baked samples are the reference */
function runSnippet(clips) {
  const src = readFileSync(join(here, "clip2-corkscrew-snippet-27-october.js"), "utf8");
  const store = new Map([["c2b-camera-bench-chain-v2", JSON.stringify(v2Of(clips))]]);
  const ctx = {
    localStorage: { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)) },
    window: { __cameraBench: { units: { d: D, up: UP, zc: ZC } } },
    location: { reload() {} },
    setTimeout() {},
    console: { log() {} },
  };
  vm.runInNewContext(src, ctx);
  return JSON.parse(store.get("c2b-camera-bench-chain-v2")).clips.find((c) => String(c.id).startsWith("clip2-corkscrew"));
}
/** the shape for clip 2 BY THE BENCH's OWN RULES from clip 1's end, ⛔ its END from the snippet's constants (5π, R1, Y1) */
function shapeForClip2(chain, pace = 280 / D) {
  const c1 = chain.clips[0];
  const T = c1.start + c1.out - c1.in;
  const at = clipPoseAt(c1, T);
  const { v0 } = startSpeed(chain, T, at, pace, D);
  const [ex, ey, ez] = U(AX - 675.8, FLOOR + 948, AZ);
  const axis = U(AX, 0, AZ);
  return helixFrom({ start: at, end: { x: ex, y: ey, z: ez, yaw: 0, pitch: 0, fov: 30 }, axisX: axis[0], axisZ: axis[2], laps: 2, dir: 1, v0, pace, rampS: 3, aimS: 1 });
}
{
  const baked = runSnippet([{ id: "c1", cam: 1, start: 0, order: 0, in: 0, out: clip1Samples.at(-1)[0], samples: clip1Samples }]);
  const parsed = parseChain(v2Of([{ id: "c1", cam: 1, start: 0, order: 0, in: 0, out: clip1Samples.at(-1)[0], samples: clip1Samples }]));
  const shape = shapeForClip2(parsed.chain);
  const cmp = (s) => {
    let mm = 0, dg = 0;
    for (const x of baked.samples) {
      const q = poseInShape(s, x[0]);
      mm = Math.max(mm, Math.hypot(q.x - x[1], q.y - x[2], q.z - x[3]) * D * 10);
      dg = Math.max(dg, Math.abs(wrapDeg(q.yaw - x[4])), Math.abs(q.pitch - x[5]), Math.abs(q.fov - x[6]));
    }
    return { mm, dg };
  };
  const p = cmp(shape);
  check(Math.abs(shape.theta1 - 5 * Math.PI) < 1e-12, `the end angle by "End here"'s rule from the snippet's end: θ1 = ${(shape.theta1 / Math.PI).toFixed(12)}π (5π: 2¼ laps from face-on, left first)`);
  check(p.mm <= 0.01 && p.dg <= 0.001, `⛔ PARITY A — the shape against the snippet's ${baked.samples.length} baked samples (the file run unchanged): position ${p.mm.toFixed(5)} mm (≤ 0.01), aim ${p.dg.toExponential(2)}° (≤ 0.001)`);
  check(Math.abs(shapeLength(shape) - baked.out) < 1e-6, `the length: ${shapeLength(shape).toFixed(9)} s against the snippet's ${baked.out.toFixed(9)} s (within 1e-6)`);
  const planted = cmp({ ...shape, pace: shape.pace * 1.01 });
  check(planted.mm > 0.01, `RED FIRST: a planted pace +1 % FAILS parity (${planted.mm.toFixed(2)} mm)`);
  // the closed form against a fine chord sum
  let L = 0;
  const span = shape.theta1 - shape.theta0, k = (shape.r1 - shape.r0) / span, h = (shape.y1 - shape.y0) / span;
  const P = (phi) => [shape.axisX + (shape.r0 + k * phi) * Math.cos(shape.theta0 + phi), shape.y0 + h * phi, shape.axisZ + (shape.r0 + k * phi) * Math.sin(shape.theta0 + phi)];
  let a = P(0);
  for (let i = 1; i <= 200000; i++) {
    const b = P((span * i) / 200000);
    L += Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    a = b;
  }
  const even = { ...shape, rampS: 0, v0: shape.pace };
  check(Math.abs(shapeLength(even) * even.pace - L) * D * 10 < 0.001, `the closed-form length ${(shapeLength(even) * even.pace * D / 100).toFixed(4)} m against a 200,000-chord sum: ${(Math.abs(shapeLength(even) * even.pace - L) * D * 10).toExponential(2)} mm`);
  const s0 = poseInShape(shape, 0), sEnd = poseInShape(shape, shapeLength(shape));
  check(Math.hypot(s0.x - clip1Samples.at(-1)[1], s0.y - clip1Samples.at(-1)[2], s0.z - clip1Samples.at(-1)[3]) * D < 1e-9 && s0.yaw === 0, "the shape STARTS exactly where clip 1 ends (no jump at the join)");
  const endHud = { right: (sEnd.x * D) / 100, up: (sEnd.y * D + UP - FLOOR) / 100 };
  check(Math.abs(endHud.right + 9.61) < 0.005 && Math.abs(endHud.up - 9.48) < 0.005 && Math.abs(wrapDeg(sEnd.yaw + 90)) < 1e-9, `the END is Carl's pose: ${endHud.right.toFixed(3)} m right, ${endHud.up.toFixed(3)} m up, looking right (yaw ${sEnd.yaw.toFixed(1)}°)`);
  // the shape on the tracks
  const withShape = placeShape(parsed.chain, 1, parsed.chain.clips[0].out, shape, "S");
  const mid = parsed.chain.clips[0].out + 10;
  check(sourceAt(withShape, mid)?.id === "S" && Math.abs(clipPoseAt(withShape.clips[1], mid).x - poseInShape(shape, 10).x) < 1e-15, "a placed shape PLAYS: sourceAt finds it, clipPoseAt asks the shape");
  check(joinsOf(withShape, D / 100).every((j) => j.kind !== "mismatch" || (j.metres < 1e-9 && j.degrees < 1e-9)), "no mismatch at the join into the shape");
  const over = placeShape(recordClip(emptyChain(), 1, 0, S(30, 0, 1), "R"), 1, 2, shape, "S2");
  check(sourceAt(over, 5)?.id === "S2" && sourceAt(over, 2 + shapeLength(shape) + 1)?.id === "R", "a shape over a recorded clip is the NEWER TAKE on top; the recording resumes after it");
  const longer = replaceShape(withShape, "S", { ...shape, pace: shape.pace / 2 });
  check(longer.clips[1].out > withShape.clips[1].out && longer.clips[1].order === withShape.clips[1].order && longer.clips[1].start === withShape.clips[1].start, `an edit RE-DERIVES the length (${withShape.clips[1].out.toFixed(1)} → ${longer.clips[1].out.toFixed(1)} s), id, start and take order kept`);
  check(sourceAt(deleteClips(withShape, new Set(["S"])), mid) === null, "a deleted shape leaves a gap");
  // v3 round trip with a shape; refusals
  const saved = parseChain(JSON.parse(JSON.stringify({ ...withShape, units: { d: D, up: UP, zc: ZC } })));
  check("chain" in saved && saved.chain.clips[1].shape?.theta1 === shape.theta1 && saved.chain.clips[1].samples === undefined, "a shape clip survives a save and a read, as its numbers");
  const sc = JSON.parse(JSON.stringify(withShape.clips[1]));
  for (const [b, what] of [
    [{ ...withShape, clips: [withShape.clips[0], { ...sc, samples: clip1Samples }] }, "clip with BOTH sources"],
    [{ ...withShape, version: 2, clips: [withShape.clips[0], sc] }, "shape in a version 2 chain"],
    [{ ...withShape, clips: [withShape.clips[0], { ...sc, shape: { ...sc.shape, r1: 0 } }] }, "radius of 0 (the camera on the axis)"],
    [{ ...withShape, clips: [withShape.clips[0], { ...sc, shape: { ...sc.shape, v0: sc.shape.pace * 2 } }] }, "start speed above the pace"],
    [{ ...withShape, clips: [withShape.clips[0], { ...sc, shape: { ...sc.shape, theta1: sc.shape.theta0 } }] }, "shape that goes nowhere"],
  ]) {
    const x = parseChain(b);
    check("refusal" in x && x.refusal.length > 5, `a ${what} is refused: "${x.refusal}"`);
  }
  check(shapeRefusal({ ...shape, pace: 0 }) !== null && shapeRefusal(shape) === null, "the shape check refuses a zero pace and accepts the corkscrew");
}
{
  // ⛔ the constant-radius branch, and a radius change just above its threshold: both agree with a chord sum
  for (const dr of [0, 1e-8, 1e-6]) {
    const s = { kind: "helix", axisX: 0, axisZ: 0, theta0: 0, theta1: 4 * Math.PI, r0: 0.1, r1: 0.1 + dr, y0: 0, y1: 0.3, fov: 30, yaw0: 90, pitch0: 0, aimS: 0, pace: 0.1, v0: 0.1, rampS: 0 };
    let L = 0, a = [0.1, 0, 0];
    for (let i = 1; i <= 200000; i++) {
      const phi = (4 * Math.PI * i) / 200000, r = 0.1 + (dr * phi) / (4 * Math.PI);
      const b = [r * Math.cos(phi), (0.3 * phi) / (4 * Math.PI), r * Math.sin(phi)];
      L += Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
      a = b;
    }
    check(Math.abs(shapeLength(s) * 0.1 - L) * D * 10 < 0.001, `radius change ${dr} d-units: length within ${(Math.abs(shapeLength(s) * 0.1 - L) * D * 10).toExponential(1)} mm of a chord sum (the constant-radius branch below 4e-7)`);
  }
}
{
  // ⛔ the ±180° jump: a re-captured start just across it gains or loses NO lap; "End here" right first at θ ≈ π
  const base = helixFrom({ start: { x: -0.1, y: 0, z: 0.0001, yaw: 0, pitch: 0, fov: 30 }, end: { x: 0.1, y: 0.3, z: 0, yaw: 0, pitch: 0, fov: 30 }, axisX: 0, axisZ: 0, laps: 2, dir: 1, v0: 0, pace: 0.1, rampS: 3, aimS: 1 });
  const again = recaptureStart(base, { x: -0.1, y: 0, z: -0.0001, yaw: 0, pitch: 0, fov: 30 }, 0);
  check(Math.abs(again.theta1 - again.theta0 - (base.theta1 - base.theta0)) < 0.01, `a start re-captured across ±180° keeps its laps: ${((base.theta1 - base.theta0) / (2 * Math.PI)).toFixed(3)} → ${((again.theta1 - again.theta0) / (2 * Math.PI)).toFixed(3)} laps`);
  const right = helixFrom({ start: { x: 0, y: 0, z: 0.1, yaw: 0, pitch: 0, fov: 30 }, end: { x: -0.1, y: 0.3, z: 0.000003, yaw: 0, pitch: 0, fov: 30 }, axisX: 0, axisZ: 0, laps: 2, dir: -1, v0: 0, pace: 0.1, rampS: 3, aimS: 1 });
  const laps = (right.theta0 - right.theta1) / (2 * Math.PI);
  check(right.theta1 < right.theta0 && laps > 2 && laps < 3, `"End here" RIGHT FIRST with the end on the atan2 jump: ${laps.toFixed(4)} laps the other way (2 to 3)`);
}
{
  // ⛔ v0: in a gap 0; a re-framed start 0 (and said); at a parked clip end the clip's own speed
  const g = recordClip(emptyChain(), 1, 0, S(2, 0, 2), "A");
  check(startSpeed(g, 3, { x: 2, y: 0, z: 1, yaw: 0, pitch: 0, fov: 30 }, 5, D).v0 === 0, "v0 in a GAP is 0");
  const off = startSpeed(g, 2, { x: 2.001, y: 0, z: 1, yaw: 0, pitch: 0, fov: 30 }, 5, D);
  check(off.v0 === 0 && !!off.why, `a start RE-FRAMED after parking (2.3 cm off): v0 0 — "${off.why}"`);
  const on = startSpeed(g, 2, clipPoseAt(g.clips[0], 2), 5, D);
  check(Math.abs(on.v0 - 1) < 1e-6 && on.why === null, `at a parked clip end: the clip's own speed (${on.v0.toFixed(6)} units/s, its 1 unit/s)`);
  // joins across whole turns read 0°
  let t = recordClip(emptyChain(), 1, 0, [[0, 0, 0, 1, 0, 0, 30], [1, 1, 0, 1, 720, 0, 30]], "A");
  t = recordClip(t, 1, 1, [[0, 1, 0, 1, 0, 0, 30], [1, 2, 0, 1, 0, 0, 30]], "B");
  const j = joinsOf(t, 1)[0];
  check(j?.kind === "mismatch" && j.degrees < 1e-9, `a join across 720° of yaw reads ${j?.degrees}° (wrapped)`);
}

// ── ⛔ THE GLIDE and the MOVE FILE (`structural-note-glide-and-open-27-october.md`; Carl: "Approved, build it")
{
  const file = JSON.parse(readFileSync(join(here, "..", "moves", "your-company-take-1.move.json"), "utf8"));
  const units = { d: D, up: UP, zc: ZC };
  // Carl's start, roughly: beyond YOUR's left end, a little higher than before, in the letters' plane, looking right
  const cam = { x: -961 / D, y: (560 - UP) / D, z: (5 - ZC) / D, yaw: -90, pitch: 0, fov: 30 };
  const m = moveFromFile(file, cam, units);
  check("shape" in m && m.shape.kind === "glide" && m.shape.points.length === 6, `the move file reads: "${m.name ?? m.refusal}", a glide of ${"shape" in m ? m.shape.points.length : 0} waypoints from the CAMERA`);
  const g = m.shape;
  const T = shapeLength(g);
  const s0 = poseInShape(g, 0), sT = poseInShape(g, T);
  check(Math.hypot(s0.x - cam.x, s0.y - cam.y, s0.z - cam.z) < 1e-12 && s0.yaw === -90 && s0.pitch === 0, "it STARTS exactly where the camera is, aimed as the camera is (no jump)");
  const endW = [sT.x * D, sT.y * D + UP, sT.z * D + ZC];
  check(Math.hypot(endW[0] + 285.2, endW[1] + 419, endW[2] - 216) < 1e-6 && Math.abs(wrapDeg(sT.yaw)) < 1e-6 && Math.abs(sT.pitch) < 1e-6, `it LANDS at the C's base face on: (${endW.map((v) => v.toFixed(2)).join(", ")}) cm, yaw ${sT.yaw.toFixed(4)}°, pitch ${sT.pitch.toFixed(4)}°`);
  // the length: the quadrature against an independent 200,000-chord sum of the same spline (sampled through poseInShape's
  // own knots is circular — so the chord sum walks the spline by its knot parameter, from first principles here)
  const P = [g.points[0].map((v, i) => 2 * v - g.points[1][i]), ...g.points, g.points.at(-1).map((v, i) => 2 * v - g.points.at(-2)[i])];
  const cr = (p0, p1, p2, p3, t) => {
    const dd = (a, b) => Math.sqrt(Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]));
    const t1 = dd(p0, p1), t2 = t1 + dd(p1, p2), t3 = t2 + dd(p2, p3), u = t1 + (t2 - t1) * t;
    const L = (a, b, ta, tb) => a.map((v, i) => v + (b[i] - v) * ((u - ta) / (tb - ta)));
    const a1 = L(p0, p1, 0, t1), a2 = L(p1, p2, t1, t2), a3 = L(p2, p3, t2, t3);
    return L(L(a1, a2, 0, t2), L(a2, a3, t1, t3), t1, t2);
  };
  let chord = 0;
  for (let i = 0; i < g.points.length - 1; i++) {
    let a = cr(P[i], P[i + 1], P[i + 2], P[i + 3], 0);
    for (let k = 1; k <= 40000; k++) {
      const b = cr(P[i], P[i + 1], P[i + 2], P[i + 3], k / 40000);
      chord += Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
      a = b;
    }
  }
  const even = { ...g, rampS: 0, landS: 0, v0: g.pace };
  const Lq = shapeLength(even) * even.pace;
  check(Math.abs(Lq - chord) * D * 10 < 0.01, `the glide's length by Gauss–Legendre ${(Lq * D / 100).toFixed(4)} m against an independent 200,000-chord sum: ${(Math.abs(Lq - chord) * D * 10).toExponential(2)} mm`);
  // the clock: at rest at both ends, the pace in the middle
  const spd = (t, h = 0.01) => { const a = poseInShape(g, t - h), b = poseInShape(g, t + h); return (Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z) * D) / (200 * h); };
  check(spd(0.02, 0.01) < 0.01 && spd(T - 0.02, 0.01) < 0.01 && Math.abs(spd(T / 2) - 1.8) < 0.005, `the clock: ${spd(0.02, 0.01).toFixed(4)} m/s leaving, ${spd(T / 2).toFixed(3)} m/s mid-move (1.8), ${spd(T - 0.02, 0.01).toFixed(4)} m/s landing — ${T.toFixed(1)} s in all`);
  // the aim never jumps: the largest change of yaw between two 1/60 s moments
  let jump = 0;
  for (let t = 1 / 60; t <= T; t += 1 / 60) jump = Math.max(jump, Math.abs(wrapDeg(poseInShape(g, t).yaw - poseInShape(g, t - 1 / 60).yaw)));
  check(jump < 1, `the aim turns smoothly: at most ${jump.toFixed(3)}° in a 1/60 s frame`);
  // placed, saved, read back as numbers; a glide over a recording is the newer take
  const placed = placeShape(recordClip(emptyChain(), 1, 0, S(2, 0, 1), "R"), 1, 2, g, "G");
  const back = parseChain(JSON.parse(JSON.stringify({ ...placed, units })));
  check("chain" in back && back.chain.clips[1].shape?.kind === "glide" && Math.abs(clipPoseAt(back.chain.clips[1], 2 + T / 3).x - poseInShape(g, T / 3).x) < 1e-15, "a glide clip plays, survives a save and a read as its numbers");
  check(recaptureStart(g, { ...cam, x: cam.x + 0.01 }, 0).points[0][0] === cam.x + 0.01 && recaptureStart(g, cam, 0).points[5] === g.points[5], "Start here moves only the first waypoint; the rest kept");
  for (const [bad, what] of [
    [{ ...g, looks: g.looks.slice(1) }, "look-at points not one per waypoint"],
    [{ ...g, points: [g.points[0], g.points[0], ...g.points.slice(2)] }, "two waypoints at the same point"],
    [{ ...g, pace: 1000 / D, rampS: 10, landS: 10 }, "glide too short for its eases"],
    [{ ...g, looks: g.looks.map((p, i) => (i === 3 ? g.points[3] : p)) }, "camera passing through its own look-at point"],
    // the last look-at point BEHIND where the move started looking (it starts looking +x, ends looking −x): 180° round
    [{ ...g, looks: g.looks.map((p, i) => (i === 5 ? [g.points[5][0] - 1000 / D, g.points[5][1], g.points[5][2]] : p)) }, "aim turning half a turn from its start"],
  ]) {
    const r = shapeRefusal(bad);
    check(typeof r === "string" && r.length > 5, `a ${what} is refused: "${r}"`);
  }
  check("refusal" in moveFromFile({ ...file, start: "somewhere" }, cam, units) && "refusal" in moveFromFile({ kind: "x" }, cam, units), "a move file not starting at the camera, or not a move file, is refused");
  // ⛔ the helix untouched by the glide's clock: Parity A still holds (re-checked above, unchanged)
}

// ── ⛔ T1b, TRIM AND MOVE (the plan `plan-trim-and-move-t1b-29-october.md` v1.4, "Checks")
{
  // A: 4 s of x 0 → 4 on Cam 1 at 0; B: 2 s on Cam 1 at 6; C: 3 s on Cam 2 at 1
  const ch = recordClip(recordClip(recordClip(emptyChain(), 1, 0, S(4, 0, 4), "A"), 1, 6, S(2, 10, 12), "B"), 2, 1, S(3, 20, 23), "C");
  const A = (c) => c.clips.find((k) => k.id === "A");
  // the tail
  const t1 = trimClip(ch, "A", "tail", 2.5);
  check(Math.abs(A(t1).out - 2.5) < 1e-12 && A(t1).start === 0 && A(t1).in === 0, `a TAIL trim to 2.5 s: out ${A(t1).out}, start and in fixed`);
  check(Math.abs(A(trimClip(t1, "A", "tail", 99)).out - sourceLength(A(ch))) < 1e-12, "a tail dragged past the source stops at the source's length (non-destructive: the footage returns)");
  check(Math.abs(clipEnd(A(trimClip(ch, "A", "tail", -5))) - MIN_CLIP_S) < 1e-12, "a tail dragged before the start leaves 1/60 s [C9]");
  {
    const noC = (c) => deleteClips(c, new Set(["C"]));
    check(sourceAt(noC(t1), 3) === null && sourceAt(noC(t1), 2)?.id === "A" && near(poseAtT(noC(t1), 2)?.pose, poseAtT(noC(ch), 2)?.pose),
      "after a tail trim the kept part plays unchanged; past the cut A no longer plays (a gap)");
  }
  // the head: start and in by ONE shared amount; every kept frame stays at its timeline time
  const h1 = trimClip(ch, "A", "head", 1.5);
  let same = true;
  for (let T = 1.5; T < 4 - 1e-6; T += 1 / 120) same &&= near(clipPoseAt(A(h1), T), clipPoseAt(A(ch), T));
  check(Math.abs(A(h1).start - 1.5) < 1e-12 && Math.abs(A(h1).in - 1.5) < 1e-12 && same, "a HEAD trim to 1.5 s: start and in move together; every kept frame at its timeline time (≤ 1e-9)");
  // ⛔ past BOTH limits ([R10]): a clip whose start (2) is past its in (0.5) runs out of IN first; one whose in (3) is past its start (1) runs out of START first
  for (const [st, inn, what] of [[2, 0.5, "in runs out first"], [1, 3, "start runs out first"]]) {
    const base = { ...ch, clips: [{ ...A(ch), start: st, in: inn }] };
    const c0 = base.clips[0];
    const back = trimClip(base, "A", "head", -50).clips[0];
    let kept = true;
    for (let T = back.start; T < clipEnd(back) - 1e-6; T += 1 / 120) if (T >= c0.start) kept &&= near(clipPoseAt(back, T), clipPoseAt(c0, T));
    const shift = Math.min(inn, st);
    check(Math.abs(back.start - (st - shift)) < 1e-12 && Math.abs(back.in - (inn - shift)) < 1e-12 && back.start >= 0 && back.in >= 0 && kept,
      `a head dragged past BOTH limits (${what}): start ${back.start}, in ${back.in}; every frame that was there is still at its time`);
  }
  check(Math.abs(clipLength(A(trimClip(ch, "A", "head", 99))) - MIN_CLIP_S) < 1e-12, "a head dragged past the end leaves 1/60 s [C9]");
  // move
  const m1 = moveClip(ch, "A", 10);
  check(A(m1).start === 10 && A(m1).order === A(ch).order && near(clipPoseAt(A(m1), 11), clipPoseAt(A(ch), 1)), "a MOVE into empty space: start 10, poses shifted by exactly the move, order KEPT");
  const m2 = moveClip(ch, "A", 4.5);
  const top = Math.max(...ch.clips.filter((k) => k.id !== "A").map((k) => k.order)) + 1;
  check(A(m2).order === top && sourceAt(m2, 6.5)?.id === "A", `a move ONTO another clip on its track comes to the TOP (order ${A(m2).order}); A plays where they overlap`);
  check(moveClip(m2, "A", 4.6).clips.find((k) => k.id === "A").order === A(m2).order, "moved again while on top: its order is NOT bumped again, and never lowered");
  check(moveClip(ch, "A", 0.01) === ch && moveClip(ch, "A", -3) === ch, "under one frame (or clamped to where it is): the SAME chain object (nothing saved, nothing promoted)");
  check(moveClip(ch, "C", 5).clips.find((k) => k.id === "C").order === ch.clips.find((k) => k.id === "C").order, "a clip over a clip on ANOTHER track keeps its order (precedence by track stands)");
  // applyEdit: idempotent; a missing id changes nothing
  const e = { id: "A", kind: "tail", T: 2.5 };
  const once = applyEdit(ch, e);
  const mv = { id: "A", kind: "move", T: 4.5 }, movedOnce = applyEdit(ch, mv);
  check(applyEdit(once, e) === once && applyEdit(movedOnce, mv) === movedOnce, "an edit applied to a chain it is already committed to (trim AND move): the SAME chain object (T absolute)");
  check(applyEdit(ch, { id: "gone", kind: "move", T: 3 }) === ch, "a missing id (deleted or replaced under the drag): the chain unchanged");
  // isTrimmed / replaceShape / setTrim
  const hx = helixFrom({ start: { x: -0.1, y: 0, z: 0.0001, yaw: 0, pitch: 0, fov: 30 }, end: { x: 0.1, y: 0.3, z: 0, yaw: 0, pitch: 0, fov: 30 }, axisX: 0, axisZ: 0, laps: 2, dir: 1, v0: 0, pace: 0.1, rampS: 3, aimS: 1 });
  const L = shapeLength(hx);
  const sh = placeShape(emptyChain(), 1, 0, hx, "H");
  const H = (c) => c.clips.find((k) => k.id === "H");
  check(!isTrimmed(H(sh)) && isTrimmed(H(trimClip(sh, "H", "tail", L / 2))) && isTrimmed(H(trimClip(sh, "H", "head", 1))), "isTrimmed: whole no; tail-trimmed yes; HEAD-only trimmed yes (review 3 [5])");
  check(!isTrimmed(H(trimClip(trimClip(sh, "H", "tail", L / 2), "H", "tail", L + 5))), "a tail dragged back to full counts as UNTRIMMED [R11]");
  const cut = trimClip(sh, "H", "tail", L / 2);
  const slower = replaceShape(cut, "H", { ...hx, pace: hx.pace / 2 });
  check(Math.abs(H(slower).out - L / 2) < 1e-12, `Keep the trim: a trimmed shape's numbers edited (pace halved) keeps out ${H(slower).out.toFixed(3)} s`);
  const shorter = replaceShape(cut, "H", { ...hx, pace: hx.pace * 4 });
  check(Math.abs(H(shorter).out - shapeLength({ ...hx, pace: hx.pace * 4 })) < 1e-12, "a trim longer than the new move clamps to the new length");
  check(Math.abs(H(replaceShape(sh, "H", { ...hx, pace: hx.pace / 2 })).out - shapeLength({ ...hx, pace: hx.pace / 2 })) < 1e-12, "an UNTRIMMED shape still follows its new length");
  const carried = setTrim(placeShape(emptyChain(), 1, 0, hx, "H"), "H", 1, L / 2);
  check(H(carried).in === 1 && Math.abs(H(carried).out - L / 2) < 1e-12 && setTrim(sh, "H", 0, 999).clips[0].out === L, "setTrim carries in and out; out clamped to the source");
  // snapping
  const tg = snapTargets(ch, "B", 2.2);
  // clip ends are sums of sixtieths (4 s ends at 3.99999…), so "has" within 1e-9
  const has = (v) => tg.some((t) => Math.abs(t - v) < 1e-9);
  check(has(0) && has(2.2) && has(4) && has(1) && !has(6) && !has(8), "snap targets: 0, the PRESS's playhead, the OTHER clips' edges; never the dragged clip's own (B's 6 and 8) [R5]");
  check(snapTime(2.15, tg, 0.1).T === 2.2 && snapTime(2.5, tg, 0.1).to === null, "snapTime: within the tolerance it locks; outside it is left");
  const sp = snapSpan(5, 2, [0, 7.04], 0.1);
  check(Math.abs(sp.T - 5.04) < 1e-12 && sp.to === 7.04, `a move snaps on its END too: start 5 + 2 s → end on 7.04 → start ${sp.T}`);
}

console.log(`\nVERDICT ${fail ? "✖" : "✔"} ${pass}/${pass + fail}`);
console.log("⚠ NOT WATCHED: the store, the UI, the pad, storage — the page harness does those; Carl's own take 2 (Parity B, dropped by Carl 27 October: the data was a test).");
process.exitCode = fail ? 1 : 0;
