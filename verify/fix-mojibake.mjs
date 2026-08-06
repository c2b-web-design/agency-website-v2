/**
 * Repair UTF-8 text that was read as CP1252 and written back out.
 *
 * ⚠ SELF-INFLICTED, 6 August 2026. Two `Set-Content` rewrites were used for
 * small edits to `answer-card-canvas.tsx` instead of the Edit tool, and
 * PowerShell re-encoded the whole file: 226 `⚠` became `âš `, em-dashes became
 * `â€"`, and curly quotes became `â€™`. The code still compiled, which is what
 * makes it dangerous — the damage is confined to comments and reads as noise
 * rather than as an error.
 *
 * ⚠ THE LESSON: never pipe a source file through a shell rewrite for an edit the
 * Edit tool can make. The shell has no obligation to preserve encoding.
 *
 * The corruption is a pure byte-level round-trip, so it reverses exactly:
 * re-encode the string as CP1252 bytes, then decode those bytes as UTF-8.
 *
 *   node verify/fix-mojibake.mjs <file> [--write]
 */

import { readFileSync, writeFileSync } from "node:fs";

const file = process.argv[2];
const write = process.argv.includes("--write");
if (!file) {
  console.error("usage: node verify/fix-mojibake.mjs <file> [--write]");
  process.exit(1);
}

const text = readFileSync(file, "utf8");

// CP1252 differs from Latin-1 only in 0x80–0x9F, where it maps 27 printable
// characters. Inverting that table is what makes the round-trip exact.
const CP1252_HIGH = {
  0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84, 0x2026: 0x85,
  0x2020: 0x86, 0x2021: 0x87, 0x02c6: 0x88, 0x2030: 0x89, 0x0160: 0x8a,
  0x2039: 0x8b, 0x0152: 0x8c, 0x017d: 0x8e, 0x2018: 0x91, 0x2019: 0x92,
  0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97,
  0x02dc: 0x98, 0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b, 0x0153: 0x9c,
  0x017e: 0x9e, 0x0178: 0x9f,
};

/**
 * ⚠ ONLY GENUINE MOJIBAKE IS REVERSED, AND THE FIRST VERSION GOT THIS WRONG.
 *
 * A whole-file round-trip also mangles text written AFTER the corruption — this
 * file's own later comments contained valid em-dashes and a degree sign, and
 * reversing them produced six replacement characters. The guard caught it, but
 * the lesson is that "undo the encoding" is not safe on a file that has since
 * been edited.
 *
 * So the repair is scoped to runs that START with the mojibake marker `â` (or a
 * lone `Â`), which is what every corrupted sequence begins with. Text outside
 * those runs is copied verbatim and cannot be damaged.
 */
const MOJIBAKE_RUN = /[âÂ][-ÿ€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ]{1,2}/g;

let runs = 0;
const repaired = text.replace(MOJIBAKE_RUN, (seq) => {
  const bytes = [];
  for (const ch of seq) {
    const cp = ch.codePointAt(0);
    bytes.push(cp < 0x100 ? cp : (CP1252_HIGH[cp] ?? cp));
  }
  const decoded = Buffer.from(bytes).toString("utf8");
  // If the run does not decode cleanly it was not mojibake — leave it alone.
  if (decoded.includes("�")) return seq;
  runs++;
  return decoded;
});

const unmappable = runs;

const before = (text.match(/â/g) || []).length;
const after = (repaired.match(/â/g) || []).length;
const warnBefore = (text.match(/⚠/g) || []).length;
const warnAfter = (repaired.match(/⚠/g) || []).length;

console.log(`file            ${file}`);
console.log(`mojibake 'â'    ${before}  ->  ${after}`);
console.log(`warning '⚠'     ${warnBefore}  ->  ${warnAfter}`);
console.log(`runs repaired   ${unmappable}`);

if (repaired.includes("�")) {
  console.log("\n⚠ REPLACEMENT CHARACTER PRESENT — the repair is not clean. NOT writing.");
  process.exit(1);
}

if (write) {
  writeFileSync(file, repaired, "utf8");
  console.log("\nwritten.");
} else {
  console.log("\ndry run — pass --write to apply.");
}
