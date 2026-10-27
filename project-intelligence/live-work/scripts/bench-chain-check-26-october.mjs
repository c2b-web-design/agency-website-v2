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
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import {
  EDGE_S, PROBE, Sampler, addTrack, chainEnd, clipPoseAt, deleteClips, emptyChain, gapsOf, joinsOf, migrateV1, parityV1, parseChain,
  poseAtT, recordClip, sourceAt, takesAt, v1PoseAt,
} from "../../../components/showcase/bench-chain.ts";

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

// ── parseChain: v2 round trip; v1 migrated; refusals in words; unknown optional fields accepted
{
  const good = JSON.parse(JSON.stringify(ch));
  const r = parseChain(good);
  check("chain" in r && r.migrated === null && r.chain.clips.length === 2, "a saved v2 chain reads back");
  const v1 = JSON.parse(JSON.stringify(r1Chains["three clips"]));
  const m = parseChain(v1);
  check("chain" in m && m.migrated?.length === 3 && m.chain.version === 2, "a v1 (R1) chain is MIGRATED, its R1 clips returned for the parity check");
  check("chain" in parseChain({ ...good, refined: { future: true }, somethingNew: 1 }), "an unknown optional field is ACCEPTED [A2]");
  const kept = parseChain({ ...good, migration: { from: 1, moments: 12, maxDiff: 0.5, ok: false } });
  check("chain" in kept && kept.chain.migration?.ok === false && kept.chain.migration.maxDiff === 0.5, "[E2] the carry-over's verdict survives a save and a read (a differences line outlives a reload)");
  const c0 = good.clips[0];
  const bad = [
    [{ ...good, kind: "x" }, "kind"],
    [{ ...good, version: 3 }, "version"],
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

console.log(`\nVERDICT ${fail ? "✖" : "✔"} ${pass}/${pass + fail}`);
console.log("⚠ NOT WATCHED: the store, the UI, the pad, storage — the page harness does those; Carl's own chain — checked in his browser on the first load.");
process.exitCode = fail ? 1 : 0;
