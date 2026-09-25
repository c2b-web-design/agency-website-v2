/**
 * THE NEON IGNITION — every rise, and the most in any second. 25 September 2026 (third session), after the wall
 * pair gained a flicker in its grow (Carl: "As it grows can you put another flicker in?"). Imports the REAL
 * schedules and the REAL checker from `about-neon.ts` — the same function the module runs at load.
 *   node --no-warnings project-intelligence/live-work/scripts/neon-flash-check.mjs
 * ⚠ NOT WATCHED: how it LOOKS (Carl's eye, moving); the area argument (WCAG) the cap stands in for.
 */
import { register } from "node:module";
register("./ts-resolve-hook.mjs", import.meta.url);
const { NEON_SCHEDULES, NEON_SCHEDULES_REDUCED, NEON_SEQUENCE_MS, maxRisesPerSecond, RISE_MIN, FLASH_CAP } = await import(
  "../../../components/about/about-neon.ts"
);

for (const [id, { pattern, startMs }] of Object.entries(NEON_SCHEDULES)) {
  let t = startMs, prev = 0;
  const rises = [];
  for (const s of pattern.segments) { if (s.to - prev >= RISE_MIN) rises.push(t); t += s.ms; prev = s.to; }
  console.log(`${id.toUpperCase()}  start ${String(startMs).padStart(4)}  rises ${rises.join("  ")}  holds from ${t}`);
}
console.log(`\nsequence holds by ${NEON_SEQUENCE_MS} ms`);
console.log(`most rises in any second — ignition ${maxRisesPerSecond(Object.values(NEON_SCHEDULES))} · reduced-motion ${maxRisesPerSecond(Object.values(NEON_SCHEDULES_REDUCED))}  (authored to ≤2; cap ${FLASH_CAP})`);
