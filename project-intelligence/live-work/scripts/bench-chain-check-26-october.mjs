/** THE RECORDER's CHAIN, CHECKED WITHOUT A BROWSER (R1, 26 October 2026; the plan v2.3 "Verification"). Node 25 runs
 *  `components/showcase/bench-chain.ts` with its types stripped (the Architect's [A9]: it imports nothing at runtime).
 *    node project-intelligence/live-work/scripts/bench-chain-check-26-october.mjs
 *  ⚠ NOT WATCHED: the bench's store, its UI, the pad — the page harness (`camera-bench-verify-26-october.mjs`) does those. */
import {
  Sampler, appendClip, chainDuration, clipLength, deleteClips, emptyChain, joinKind, locate, parseChain, poseAt, punchIn,
} from "../../../components/showcase/bench-chain.ts";

let pass = 0, fail = 0;
const check = (ok, what) => {
  console.log(`${ok ? "✔" : "✖"} ${what}`);
  if (ok) pass++;
  else fail++;
};
const pose = (x, yaw = 0) => ({ x, y: 0, z: 1, yaw, pitch: 0, fov: 30 });
/** a clip of `secs` at 60 a second, x running a → b */
function clip(id, cam, secs, a = 0, b = 1) {
  const s = new Sampler(pose(a));
  const n = Math.round(secs * 60);
  for (let i = 1; i <= n; i++) s.step(1 / 60, pose(a + ((b - a) * i) / n));
  return { id, cam, samples: s.finish(pose(b)) };
}

// ── the sampler: a fixed rate on any display, one sample a frame at most, the hitch clamped
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
}
{
  const s = new Sampler(pose(0));
  s.step(0.5, pose(1));
  check(Math.abs(s.length - 0.1) < 1e-9, `a 0.5 s frame advances the clip by ${s.length} s (the hitch, clamped at 0.1) [A9]`);
}

// ── punch-in, delete, joins
const base = () => appendClip(appendClip(appendClip(emptyChain(), clip("a", 1, 2, 0, 1)), clip("b", 1, 2, 1, 2)), clip("c", 1, 2, 2, 3));
{
  const r = punchIn(base(), 1.0, clip("n", 1, 1, 9, 9));
  const ids = r.chain.clips.map((c) => c.id).join(",");
  check(ids === "a,n,b,c" && r.index === 1, `a punch-in mid-clip 1 → ${ids}: the new clip after it, LATER CLIPS KEPT`);
  check(Math.abs(clipLength(r.chain.clips[0]) - 1.0) < 1e-9, `…clip 1 cut at 1.0 s, its tail dropped (length ${clipLength(r.chain.clips[0]).toFixed(3)} s)`);
}
{
  const r = punchIn(base(), 2.0, clip("n", 1, 1));
  const ids = r.chain.clips.map((c) => c.id).join(",");
  check(ids === "a,n,c", `a punch at clip 2's very START → ${ids}: clip 2 removed, never kept empty [A5]`);
}
{
  const r = punchIn(appendClip(appendClip(emptyChain(), clip("a", 1, 2)), clip("b", 2, 2)), 1.0, clip("n", 1, 1));
  check(r.chain.clips[r.index].cam === 1, `punching into a Cam 1 clip with Cam 2 after it records on Cam ${r.chain.clips[r.index].cam} (the store passes it; here it is kept) [A1]`);
}
{
  const c = deleteClips(base(), new Set(["b"]));
  check(c.clips.map((x) => x.id).join(",") === "a,c" && Math.abs(chainDuration(c) - 4) < 1e-9, `delete clip 2 → ${c.clips.map((x) => x.id).join(",")}, 4 s (numbering is the order: 1, 2)`);
}
{
  const ch = appendClip(appendClip(emptyChain(), clip("a", 1, 2, 0, 1)), clip("b", 1, 2, 5, 6));
  const p = poseAt(ch, 2.0);
  check(Math.abs(p.x - 5) < 1e-9 && locate(ch, 2.0).index === 1, `at the join the pose is the NEXT clip's first (x ${p.x.toFixed(6)}; was 1 at the end of clip 1) — a jump, never a blend`);
  const j = joinKind(ch.clips[0], ch.clips[1], 2);
  check(j.kind === "mismatch" && Math.abs(j.metres - 8) < 1e-9, `a same-camera join is a MISMATCH of ${j.metres} m (4 d × 2 m/d)`);
  const cut = joinKind(ch.clips[0], { ...ch.clips[1], cam: 2 }, 2);
  check(cut.kind === "cut", "a camera change is a CUT [A5]");
}

// ── parseChain: refusals in words; unknown optional fields accepted
{
  const good = JSON.parse(JSON.stringify(base()));
  check("chain" in parseChain(good), "a saved chain reads back");
  check("chain" in parseChain({ ...good, refined: { future: true }, somethingNew: 1 }), "an unknown optional field is ACCEPTED (R2 cannot lock out R1's takes) [A2]");
  const bad = [
    [{ ...good, kind: "x" }, "kind"],
    [{ ...good, version: 2 }, "version"],
    [{ ...good, clips: [{ id: "a", cam: 1, samples: [[0, 1, 2]] }] }, "shape"],
  ];
  for (const [b, what] of bad) {
    const r = parseChain(b);
    check("refusal" in r && r.refusal.length > 5, `a wrong ${what} is refused: "${r.refusal}"`);
  }
}

console.log(`\nVERDICT ${fail ? "✖" : "✔"} ${pass}/${pass + fail}`);
console.log("⚠ NOT WATCHED: the store, the UI, the pad, storage — the page harness does those.");
process.exitCode = fail ? 1 : 0;
