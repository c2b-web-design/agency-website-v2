/**
 * ⚠⚠ WHAT IS THE NEXT FREE D- AND R- NUMBER, AND DOES ANYTHING COLLIDE?
 *
 *   npm run verify -- entry-numbering.mjs
 *   INJECT=collision  npm run verify -- entry-numbering.mjs
 *   INJECT=gap        npm run verify -- entry-numbering.mjs
 *   INJECT=suffix     npm run verify -- entry-numbering.mjs
 *   INJECT=empty      npm run verify -- entry-numbering.mjs
 *
 * ══ THE DEFECT THIS EXISTS FOR ══
 *
 * On 22 August 2026 the review log was reported as stopping at **R-012**. It
 * stops at **R-018**, and **R-013 already existed** — the Next Step Button
 * material pass. The cause was a `tail` of a **reverse-chronological** file:
 * the last lines of `review-log.md` hold the LOWEST numbers, because R-001 is
 * at the bottom. A duplicate R-013 was nearly written.
 *
 * ⚠ THE ERROR HAPPENED WHILE **READING**, NOT WHILE WRITING. It was in Carl's
 * hands hours before any edit was attempted. That is why this is a script you
 * run before writing an entry, and **not** a hook: a `PreToolUse` hook fires at
 * the moment of the edit, which is downstream of where this mistake is made.
 *
 * ══ ⛔⛔ WHAT THIS DOES **NOT** WATCH — READ BEFORE QUOTING A RESULT ══
 *
 * ⛔ **THIS IS A NUMBERING CHECK, NOT A RECORD CHECK.**
 *
 * It does **NOT** watch whether an entry that SHOULD exist was written at all.
 * It reads the numbers that ARE on disk and says whether they are well-formed.
 * A verdict of "no collision" means the numbers are consistent. It does **NOT**
 * mean the record is complete, current, or true.
 *
 * ⚠ **THAT IS THE WRITE-BACK GAP (D-048) AND THIS SCRIPT DOES NOT TOUCH IT.**
 * Nothing here requires an authorisation or a verdict to reach the record when
 * Carl gives one. On 23 August 2026 four separate corrections went stale by the
 * pass that authorised them, every one of them correctly numbered. **This
 * script would have reported GREEN on all four.** It must not be read, cited,
 * or recorded as closing D-048.
 *
 * ⚠ It also does not watch: whether an entry's CONTENT is correct, whether a
 * status line agrees with the body four paragraphs below it (the D-046 defect,
 * which no cross-file sweep catches), whether an entry contradicts another, or
 * whether a number cited in prose elsewhere still points at the right entry.
 *
 * ══ THE THREE THINGS THAT MAKE IT CORRECT ══
 *
 * All three were established by measurement against this repo on 23 August 2026
 * and each one is load-bearing. Changing any of them re-introduces a real fault.
 *
 * **1. THE PATTERN IS END-ANCHORED:  ^## [DR]-\d{3}(?![-\w])**
 *
 * ⛔ The end-anchor is NOT optional. `open-defects.md` carries `## D-051-A11Y`
 * — a real heading and a legitimate naming convention. A bare `D-\d{3}` reads
 * it as a duplicate of D-051 and reports a collision that does not exist.
 *
 * **2. SCOPED TO THE TWO CANONICAL FILES ONLY.**
 *
 * `decisions.md` and `reviews/review-log.md`. Nothing else, ever.
 * ⚠ `live-work/session-handoff.md` currently carries THREE `## D-0xx` section
 * headings (D-056, D-046, D-048) as titles for entries that already exist —
 * and that file is REWRITTEN EVERY SESSION. A repo-wide scan would report
 * three collisions every single session, which is how a check becomes noise
 * and noise gets routed around.
 *
 * **3. SORT, NEVER TAIL — AND THE TWO FILES RUN IN OPPOSITE DIRECTIONS.**
 *
 * ⛔ Verified 23 August 2026:
 *     decisions.md    ASCENDS   — D-001 at line 26,  D-057 at line 2479
 *     review-log.md   DESCENDS  — R-019 at line 59,  R-001 at line 511
 *
 * ⚠ A SINGLE ORDERING RULE APPLIED TO BOTH WOULD FIRE CONSTANTLY ON ONE OF
 * THEM — and would encode the exact misreading this script exists to prevent.
 * Each file therefore declares its own expected direction, and the output
 * STATES that direction next to the number. **That line is worth more than the
 * number itself**: it is the thing that would have prevented the R-013 error.
 *
 * ══ WHAT IS A FAULT AND WHAT IS INFORMATION ══
 *
 * ⛔ **A COLLISION IS THE REAL FAULT** — two headings claiming one number.
 * That is the 22 August error class and the only condition that exits non-zero.
 *
 * ⚠ **A GAP WARNS, IT DOES NOT DENY.** Both sequences are currently dense —
 * D-001..D-057 and R-001..R-019, no gaps in 76 entries — so a skip is probably
 * a mistake. But a skip breaks nothing, and denying it would block a legitimate
 * reserve-a-number move. It is reported as information.
 *
 * ⚠ **OUT-OF-ORDER WARNS.** An entry filed against its file's declared
 * direction is worth seeing and is not a fault on its own.
 *
 * ══ THE FRONT DOOR ══
 *
 * ⛔ Run it through `npm run verify -- entry-numbering.mjs`. It has **NO
 * RECORDED RED RUN** and is deliberately NOT in `proven.json`, so the gate will
 * suppress its PASS and print NO VERDICT. **That is correct.** The numbers
 * still print, and they are useful for looking up a next free number. They are
 * not admissible as evidence of anything.
 */

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// ⛔ THE TWO CANONICAL FILES. Nothing else. See note 2 in the header — a
// repo-wide scan fires on session-handoff.md every session.
const SOURCES = [
  {
    prefix: "D",
    path: "project-intelligence/decisions.md",
    // ⚠ VERIFIED 23 August 2026: D-001 at line 26, D-057 at line 2479.
    direction: "ascending",
    directionNote: "oldest first — the newest entry is at the BOTTOM",
  },
  {
    prefix: "R",
    path: "project-intelligence/reviews/review-log.md",
    // ⚠ VERIFIED 23 August 2026: R-019 at line 59, R-001 at line 511.
    // ⛔ THIS IS THE FILE THAT CAUSED THE R-013 ERROR. A `tail` here shows the
    // LOWEST numbers, not the highest.
    direction: "descending",
    directionNote: "newest first — the newest entry is at the TOP",
  },
];

// ⛔ THE END-ANCHOR IS LOAD-BEARING. Without (?![-\w]), `## D-051-A11Y` in
// open-defects.md reads as a duplicate of D-051. See note 1 in the header.
//
// ⚠ Both canonical files are CRLF. `\r` is stripped per line before matching
// rather than tolerated in the pattern, so a `$` anchor is never needed and
// cannot silently fail on the line terminator.
const HEADING = /^## ([DR])-(\d{3})(?![-\w])/;

const INJECT = process.env.INJECT || "";

/** Read one source and return its headings in FILE ORDER. */
function scan(src) {
  const abs = join(REPO, src.path);
  if (!existsSync(abs)) return { missing: true, entries: [] };

  const lines = readFileSync(abs, "utf8").split("\n");
  const entries = [];

  lines.forEach((raw, i) => {
    // ⚠ CRLF: strip the terminator before matching. Both files are CRLF.
    const line = raw.replace(/\r$/, "");
    const m = line.match(HEADING);
    if (!m) return;
    // Only this file's own prefix. A `## R-` heading inside decisions.md is
    // not a decision and must not enter the D sequence.
    if (m[1] !== src.prefix) return;
    entries.push({ num: Number(m[2]), raw: m[0], line: i + 1 });
  });

  return { missing: false, entries };
}

/**
 * ⚠ FALSIFICATION. Injects a fault into the SCANNED RESULT, never into the
 * canonical files on disk. `INJECT=empty` is the empty-input control: it
 * reports an ABSENCE rather than a confident zero.
 */
function inject(mode, src, result) {
  if (!mode) return result;
  const e = result.entries;

  if (mode === "collision" && e.length > 1) {
    const dup = { ...e[e.length - 1] };
    dup.num = e[e.length - 2].num; // claim a number already taken
    dup.raw = `## ${src.prefix}-${String(dup.num).padStart(3, "0")}`;
    dup.line = dup.line + 1;
    return { ...result, entries: [...e, dup], injected: mode };
  }

  if (mode === "gap" && e.length > 0) {
    // ⚠ CAUGHT DURING FALSIFICATION, 23 August 2026, AND WORTH KEEPING.
    // The first version bumped `e[e.length - 1]` — the last entry in FILE
    // ORDER. In review-log.md, which DESCENDS, that is R-001, and +2 made it
    // R-003, colliding with the real R-003. The injector reproduced the exact
    // direction bug the script exists to prevent, and reported a COLLISION
    // where a GAP was intended.
    // ⛔ The fix is to find the HIGHEST number, never the last line. Same rule
    // the script itself follows: SORT, NEVER TAIL.
    const idx = e.reduce((best, cur, i) => (cur.num > e[best].num ? i : best), 0);
    const top = { ...e[idx] };
    top.num = top.num + 2; // skip one
    top.raw = `## ${src.prefix}-${String(top.num).padStart(3, "0")}`;
    const copy = [...e];
    copy[idx] = top;
    return { ...result, entries: copy, injected: mode };
  }

  if (mode === "empty") {
    return { missing: false, entries: [], injected: mode };
  }

  if (mode === "suffix") {
    // The D-051-A11Y case, placed INSIDE a canonical file so the test is real
    // rather than relying on open-defects.md being out of scope anyway.
    return { ...result, injected: mode, suffixProbe: true };
  }

  return result;
}

const out = [];
const say = (s = "") => out.push(s);

say("");
say("══ ENTRY NUMBERING — next free D- and R- number ══");
if (INJECT) say(`   ⚠ INJECT=${INJECT} — FALSIFICATION RUN, not a real reading.`);
say("");

let collisions = 0;
let unreadable = 0;

for (const src of SOURCES) {
  let result = scan(src);

  // ⚠ The suffix probe proves the end-anchor inside a canonical file, which is
  // the only place it matters. It is a pattern test, not a data injection.
  let suffixLine = null;
  if (INJECT === "suffix") {
    const probes = [
      `## ${src.prefix}-051-A11Y — answer text is not in the accessibility tree`,
      `## ${src.prefix}-051 — a real heading that MUST match`,
    ];
    const matched = probes.map((p) => {
      const m = p.match(HEADING);
      return { p, hit: m ? m[0] : null };
    });
    suffixLine = matched;
  }

  result = inject(INJECT, src, result);

  say(`── ${src.prefix}: ${src.path}`);

  if (result.missing) {
    unreadable++;
    say(`   ⛔ FILE NOT FOUND. No numbers could be read.`);
    say(`      This is an ABSENCE, not a zero — nothing was measured.`);
    say("");
    continue;
  }

  // ⛔ SORT, NEVER TAIL. The file order is kept separately for the direction
  // check; every number question is answered from the SORTED list.
  const fileOrder = result.entries.map((e) => e.num);
  const sorted = [...result.entries].sort((a, b) => a.num - b.num);
  const nums = sorted.map((e) => e.num);

  if (nums.length === 0) {
    // ⚠⚠ THE QUIET ZERO, INSTRUMENT DEFECT #12. Caught on this script's own
    // empty-input control, 23 August 2026: it printed this absence and then
    // exited 0 with ✅ PASS, because "no headings" produced "no collisions".
    // ⛔ A zero meaning "I looked and saw nothing wrong" and a zero meaning "I
    // never read anything" ARE THE SAME CHARACTERS ON SCREEN. An unreadable
    // source is counted as unreadable so no verdict can be issued from it.
    unreadable++;
    say(`   ⛔ NO HEADINGS MATCHED. This is an ABSENCE, not "zero entries".`);
    say(`      Either the file is empty of entries or the heading format moved.`);
    say(`      Pattern: ${HEADING}`);
    say(`      ⚠ NO NEXT-FREE NUMBER CAN BE GIVEN FOR ${src.prefix}-. Do not read`);
    say(`        the absence of a collision here as a clean result.`);
    say("");
    if (suffixLine) reportSuffix(suffixLine);
    continue;
  }

  const highest = nums[nums.length - 1];
  const lowest = nums[0];
  const next = highest + 1;

  // ⚠ THE DIRECTION LINE. This is the thing that would have prevented R-013.
  const expected = src.direction;
  const actualAsc = fileOrder.every((n, i) => i === 0 || n >= fileOrder[i - 1]);
  const actualDesc = fileOrder.every((n, i) => i === 0 || n <= fileOrder[i - 1]);
  const actual = actualAsc ? "ascending" : actualDesc ? "descending" : "mixed";

  say(`   DIRECTION: ${expected.toUpperCase()} — ${src.directionNote}`);
  if (expected === "descending") {
    // ⚠ NOT a line-leading ⛔ ON PURPOSE. run.mjs classifies any line whose
    // first non-whitespace character is ⛔ as a FAILURE marker, even on exit 0.
    // Caught 23 August 2026: this warning made a clean run print "⛔ FAILURE".
    // The symbol is kept mid-line, where it emphasises without being a verdict.
    say(`   ⚠⚠ A \`tail\` OF THIS FILE SHOWS THE **LOWEST** NUMBERS — ⛔ never tail it.`);
    say(`      This is the file that caused the 22 August R-013 error.`);
  }
  say(
    `   Read from a SORTED list of ${nums.length} headings, never from file order.`
  );
  say("");
  say(`   HIGHEST : ${src.prefix}-${String(highest).padStart(3, "0")}`);
  say(`   NEXT FREE: ${src.prefix}-${String(next).padStart(3, "0")}   ← use this`);
  say(`   Range   : ${src.prefix}-${String(lowest).padStart(3, "0")} .. ${src.prefix}-${String(highest).padStart(3, "0")}  (${nums.length} entries)`);
  say("");

  // ── COLLISIONS — ⛔ THE ONLY REAL FAULT.
  const seen = new Map();
  const dupes = [];
  for (const e of sorted) {
    if (seen.has(e.num)) dupes.push({ num: e.num, lines: [seen.get(e.num), e.line] });
    else seen.set(e.num, e.line);
  }

  if (dupes.length) {
    collisions += dupes.length;
    say(`   ⛔ COLLISION — ${dupes.length} number(s) claimed twice. THIS IS THE FAULT.`);
    for (const d of dupes) {
      say(
        `      ${src.prefix}-${String(d.num).padStart(3, "0")} appears at lines ${d.lines.join(" and ")}`
      );
    }
    say(`      Two entries cannot share one number. Fix before writing.`);
    say("");
  } else {
    say(`   ✅ No collisions in ${nums.length} entries.`);
  }

  // ── GAPS — ⚠ WARN ONLY. A skip breaks nothing.
  const gaps = [];
  for (let n = lowest; n < highest; n++) if (!seen.has(n)) gaps.push(n);

  if (gaps.length) {
    say(
      `   ⚠ GAP — ${gaps.length} unused number(s): ${gaps
        .map((n) => src.prefix + "-" + String(n).padStart(3, "0"))
        .join(", ")}`
    );
    say(`      INFORMATION, NOT A FAULT. A skip breaks nothing and may be a`);
    say(`      deliberate reserve-a-number. Both sequences were dense on`);
    say(`      23 August 2026, so a new gap is more likely a mistake than not.`);
  } else {
    say(`   ✅ Dense — no gaps between ${src.prefix}-${String(lowest).padStart(3, "0")} and ${src.prefix}-${String(highest).padStart(3, "0")}.`);
  }

  // ── ORDER — ⚠ WARN ONLY, and against THIS FILE'S OWN DIRECTION.
  if (actual !== expected && actual !== "mixed") {
    say(`   ⚠ ORDER — file reads ${actual}, expected ${expected}.`);
    say(`      Information. Check the file has not been reordered wholesale.`);
  } else if (actual === "mixed") {
    const misfiled = [];
    fileOrder.forEach((n, i) => {
      if (i === 0) return;
      const prev = fileOrder[i - 1];
      if (expected === "ascending" && n < prev) misfiled.push(n);
      if (expected === "descending" && n > prev) misfiled.push(n);
    });
    say(
      `   ⚠ ORDER — ${misfiled.length} entr${misfiled.length === 1 ? "y" : "ies"} filed against the ${expected} order: ` +
        misfiled.map((n) => src.prefix + "-" + String(n).padStart(3, "0")).join(", ")
    );
    say(`      Information, not a fault. The SORTED numbers above still stand.`);
  } else {
    say(`   ✅ Order matches the declared ${expected} direction.`);
  }

  say("");
  if (suffixLine) reportSuffix(suffixLine);
}

function reportSuffix(matched) {
  say(`   ── END-ANCHOR PROBE (INJECT=suffix) ──`);
  say(`      Pattern: ${HEADING}`);
  for (const m of matched) {
    const verdict = m.hit ? `MATCHED as "${m.hit}"` : `NOT MATCHED  ← correct`;
    // ⚠ "··" not "⛔": a line-leading ⛔ is a FAILURE marker to run.mjs and
    // would make this passing probe classify as a failure. Same trap as above.
    say(`      ${m.hit ? "  " : "··"} ${JSON.stringify(m.p.slice(0, 46))}`);
    say(`         → ${verdict}`);
  }
  say(`      ⚠ The suffixed heading MUST NOT match. Without (?![-\\w]) it reads`);
  say(`        as a duplicate of the bare number and reports a false collision.`);
  say("");
}

// ══ THE BLIND-SPOT DECLARATION — ⛔ NEXT TO THE NUMBERS, PER THE HARNESS RULE.
// ⚠ Leading "──" not "⛔": see the note above — a line-leading ⛔ is a verdict
// marker to run.mjs and would classify every run as a FAILURE.
say("── ⚠⚠ WHAT THIS DOES NOT WATCH — ⛔ READ BEFORE QUOTING A RESULT ──");
say("   THIS IS A NUMBERING CHECK, NOT A RECORD CHECK.");
say("   It does NOT watch whether an entry that SHOULD exist was written at all.");
say("   ⚠ That is the WRITE-BACK GAP (D-048) and this script DOES NOT TOUCH IT.");
say("     On 23 August 2026 four corrections went stale by the pass that");
say("     authorised them — every one correctly numbered. This script would");
say("     have reported GREEN on all four. It does not close D-048.");
say("   It also does not watch: entry CONTENT, a status line contradicting its");
say("   own body (the D-046 defect), contradictions between entries, or whether");
say("   a D-/R- number cited in prose elsewhere still points at the right entry.");
say("   ⚠ Scope is TWO FILES. Headings anywhere else are invisible to it.");
say("");

if (unreadable) {
  say(`⛔ ${unreadable} of ${SOURCES.length} source(s) yielded NO NUMBERS —`);
  say(`   missing, or present but matching no heading.`);
  say(`   NO VERDICT IS POSSIBLE — this is an ABSENCE, not a clean result.`);
  say(`   ⚠ "No collisions" from a source that was never read is a FALSE PASS.`);
  say("");
  console.log(out.join("\n"));
  process.exit(1);
}

if (collisions) {
  say(`⛔ FAIL — ${collisions} collision(s). A number is claimed twice.`);
  say(`   This is the 22 August R-013 error class and the only real fault here.`);
  say("");
  console.log(out.join("\n"));
  process.exit(1);
}

say(`✅ PASS — no collisions. Next free numbers are above.`);
say(`   ⚠ Read the DIRECTION line before trusting any number you looked up`);
say(`     by hand. review-log.md descends; a tail of it shows the LOWEST.`);
say("");
console.log(out.join("\n"));
process.exit(0);
