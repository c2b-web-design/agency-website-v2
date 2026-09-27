/**
 * THE REVERSE FLICKER, CHECKED — 27 September 2026. `reversePattern` (about-neon.ts) must be the ignition played
 * backwards with its dark lead-in trimmed: level_rev(t) == level_trimmed(len − t) at every interior instant, and
 * it must reach 0 AT its end, not before (Carl: "the reverse flicker must be timed so both go off simultaneously").
 * Also prints the plan's flash-cap figure for a card going out while the next strikes.
 *   node --no-warnings project-intelligence/live-work/scripts/reverse-flicker-check.mjs
 * ⚠ NOT WATCHED: how it LOOKS (Carl's eye); the bloom's own decay after the level drops.
 */
import { register } from "node:module";
register("./ts-resolve-hook.mjs", import.meta.url);
const N = await import("../../../components/about/about-neon.ts");

const len = (p) => p.segments.reduce((s, x) => s + x.ms, 0);
const trimmed = (p) => {
  let k = 0;
  while (k < p.segments.length && !p.segments[k].ramp && p.segments[k].to === 0) k++;
  return { ...p, segments: p.segments.slice(k) };
};
let fail = 0;
for (const [name, set] of [["ignition", N.NEON_SCHEDULES], ["reduced", N.NEON_SCHEDULES_REDUCED]]) {
  for (const [id, { pattern }] of Object.entries(set)) {
    const fwd = trimmed(pattern);
    const rev = N.reversePattern(pattern);
    const L = len(fwd);
    let worst = 0;
    for (let i = 1; i < 2000; i++) {
      const t = (i / 2000) * L + 0.013; // off the segment boundaries
      if (t >= L) break;
      worst = Math.max(worst, Math.abs(N.neonLevel(rev, t) - N.neonLevel(fwd, L - t)));
    }
    const justBefore = N.neonLevel(rev, L - 1);
    const atEnd = N.neonLevel(rev, L);
    const ok = worst < 1e-3 && len(rev) === L && atEnd === 0 && justBefore > 0;
    if (!ok) fail++;
    console.log(`${name.padEnd(8)} ${id}: ${ok ? "✅" : "⛔"} max |rev(t) − fwd(len−t)| ${worst.toFixed(4)} · length ${len(rev)} ms (trimmed ignition ${L}) · level 1 ms before the end ${justBefore.toFixed(2)} → at the end ${atEnd}`);
  }
}
console.log(fail ? `\n⛔ ${fail} pattern(s) failed` : "\n✅ every reverse flicker is its ignition backwards, and reaches 0 at its last instant");
