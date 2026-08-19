#!/usr/bin/env node
/**
 * verify/run.mjs — the verdict gate for the verify/ harness.
 *
 * Usage:  npm run verify -- <script.mjs> [args...]
 *         node verify/run.mjs <script.mjs> [args...]
 *         node verify/run.mjs --list
 *
 * WHY THIS EXISTS
 * ---------------
 * The expensive instrument failures in this project all failed toward a PASS.
 * `q5-stutter.mjs` read 0/3 CLEAN on a stall Carl could see. `one-context.mjs`
 * read 2/2 while a WebGL context was being created on every question. The
 * reveal instrument reported 0ms on a live freeze.
 *
 * A false alarm costs minutes and gets investigated. A FALSE PASS GETS BELIEVED.
 *
 * The standing rule — prove a harness goes RED before trusting it green — exists
 * in prose and is followed roughly one time in nine: 130 scripts, 15 with a
 * falsification mode, 9 declaring what they do not watch. Prose did not carry
 * it. This does, at the point where the verdict is read.
 *
 * WHAT IT DOES
 * ------------
 *   - Script's entry carries BOTH requirements: output passes through
 *     unchanged, and the script's declared blind spots are printed after the
 *     verdict. A proven instrument is still a narrow one.
 *   - Script is NOT in proven.json, OR is listed but MISSING EITHER
 *     REQUIREMENT: output passes through, but a PASS is SUPPRESSED and replaced
 *     with a NO VERDICT notice. The numbers still print.
 *   - A FAILURE from an unproven script passes through UNCHANGED. A red from an
 *     unproven instrument still means go and look — suppressing it would be the
 *     false-negative this gate exists to prevent.
 *
 * THE TWO REQUIREMENTS — being listed is NOT sufficient
 * ----------------------------------------------------
 *   1. "redRun"     — it was shown to go RED. It CAN fail.
 *   2. "emptyInput" — it was pointed at NOTHING and reported an ABSENCE.
 *
 * ⚠ THE SECOND IS INSTRUMENT DEFECT #12, THE QUIET ZERO. A harness reported a
 * zero, the zero read as a finding, and it manufactured a design decision out
 * of nothing — a decision INVISIBLE AFTERWARDS, because the thing avoided never
 * gets tried again. A false pass gets believed; A FALSE CONSTRAINT GETS
 * DESIGNED AROUND. Going red proves an instrument CAN MOVE; it does not prove
 * it was ever LOOKING AT ANYTHING.
 *
 * ⚠ AND IT CANNOT BE CHECKED HERE. This runner sees output text and an exit
 * code, and "0ms because nothing happened" is textually identical to "0ms
 * because I never measured anything". A textual detector was tried and failed
 * (see the classify() note below). So the requirement is enforced on the PROOF,
 * where it is a recorded fact — never on the output, where it is unknowable.
 * Full reasoning and the qualifying bar: verify/proven.json.
 *
 * ⛔ NOTHING IS BLOCKED. Every script still runs, and its raw output is still
 * shown. This gate governs what may be called EVIDENCE, not what may be run.
 *
 * WHAT IT CANNOT ENFORCE — stated so the gap is not mistaken for covered
 * ---------------------------------------------------------------------
 *   - ⚠ WHETHER A RED RUN IS STILL VALID. An entry records that a script went
 *     red once, against one build, on one date. The code under it has moved
 *     since. A stale proof reads exactly like a fresh one.
 *   - ⚠ IT DOES NOT STOP ANYONE RUNNING A SCRIPT DIRECTLY. `node verify/foo.mjs`
 *     bypasses this file completely and prints the raw verdict. As of
 *     923295b a PreToolUse hook (.claude/hooks/verify-front-door.js) denies
 *     that form on the Bash TOOL — but only there. A terminal, a CI step or a
 *     process spawned by another process still reaches the script directly.
 *   - ⚠ WHETHER AN EMPTY-INPUT CONTROL IS STILL VALID, OR WAS EVER HONEST. The
 *     entry records that someone pointed the script at nothing on one date and
 *     it said so. It cannot check that the input really was empty, that the
 *     absence report still fires, or that the run happened at all. Like the red
 *     run, it is a recorded claim — and it decays the same way.
 *   - ⚠ IT SAYS NOTHING ABOUT WHETHER A HARNESS MEASURES THE RIGHT THING. A
 *     script can go red on an injected defect and still watch the wrong
 *     channel: `q5-stutter.mjs` shared a wrong 700ms constant with the fix it
 *     was checking, and a harness sharing a constant with the fix cannot fail.
 *     Going red proves it CAN move. It does not prove it moves for the right
 *     reason.
 *   - ⚠ ITS VERDICT DETECTION IS TEXTUAL. It reads exit codes and looks for
 *     pass/fail markers in output. A script that reports a pass in wording it
 *     does not recognise will be treated as having no verdict to suppress.
 *   - It cannot tell a coupled value implemented as an overlay, a derived value
 *     that lost its source condition, or visual drift. Those stay with
 *     checkpoint review and with Carl.
 */

import { spawn } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PROVEN_FILE = path.join(HERE, "proven.json");

const BAR = "─".repeat(74);

// ── The proven list ─────────────────────────────────────────────────────────
// ⚠ FAIL LOUD, NOT OPEN. If the list cannot be read, EVERY script is treated as
// unproven and the reason is stated. Silently treating everything as proven
// would restore the exact defect this gate removes.
function loadProven() {
  if (!existsSync(PROVEN_FILE)) {
    return { ok: false, why: `not found at ${path.relative(process.cwd(), PROVEN_FILE)}`, entries: [] };
  }
  try {
    const parsed = JSON.parse(readFileSync(PROVEN_FILE, "utf8"));
    if (!Array.isArray(parsed.proven)) throw new Error(`no "proven" array`);
    return { ok: true, why: null, entries: parsed.proven };
  } catch (err) {
    return { ok: false, why: err && err.message ? err.message : String(err), entries: [] };
  }
}

// ── Verdict detection ───────────────────────────────────────────────────────
// THE EXIT CODE IS THE VERDICT. Non-zero is a failure; zero with a pass marker
// is a pass. Text is consulted only to find a pass marker on a zero exit.
//
// ⚠⚠ DO NOT SCAN FREE TEXT FOR DEFECT WORDS. The first version of this matched
// /DRIFT|STALL|RED|DEFECT/ anywhere in the output and classified a PASSING
// fixture as a failure, because its ordinary measurement line read
// "drift 0.4px (tolerance 1.5px)". In this codebase those words are the SUBJECT
// MATTER — they name what the harnesses measure — so their presence says
// nothing about the verdict. Caught by falsification case (b), which is exactly
// what that case is for.
//
// Only unambiguous verdict MARKERS count: the symbols this harness uses, and
// pass words anchored at the start of a line so a sentence about passing cannot
// be mistaken for a verdict.
const PASS_MARK = /(^|\n)\s*(✅|PASS(ED)?\b|CLEAN\b|GREEN\b)/i;
const FAIL_MARK = /(^|\n)\s*(⛔|❌|FAIL(ED|URE)?\b)/i;

function classify(exitCode, text) {
  if (exitCode !== 0) return "fail";      // the exit code is the verdict
  if (FAIL_MARK.test(text)) return "fail"; // printed a failure but exited 0
  if (PASS_MARK.test(text)) return "pass";
  return "none";
}

function banner(lines) {
  console.log("");
  console.log(BAR);
  for (const l of lines) console.log(l);
  console.log(BAR);
}

// ── Entry ───────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const proven = loadProven();

if (argv.length === 0 || argv[0] === "--help" || argv[0] === "-h") {
  console.log(`
verify/run.mjs — the verdict gate

  npm run verify -- <script.mjs> [args...]
  node verify/run.mjs --list

A script still RUNS and still prints its numbers whatever its status. Its PASS
is admissible only if its proven.json entry carries BOTH:
  redRun     — it was shown to go RED (it CAN fail)
  emptyInput — it was pointed at NOTHING and reported an ABSENCE
A FAILURE always passes through, proven or not.
`);
  process.exit(0);
}

if (argv[0] === "--list") {
  if (!proven.ok) {
    console.log(`⚠ proven.json could not be read (${proven.why}) — nothing is proven.`);
    process.exit(1);
  }
  const fully = proven.entries.filter((e) => !missingRequirement(e));
  console.log(`PROVEN INSTRUMENTS (${fully.length} of ${proven.entries.length} listed):\n`);
  for (const e of proven.entries) {
    const onDisk = existsSync(path.join(HERE, e.script));
    const gap = missingRequirement(e);
    console.log(`  ${!onDisk ? "⚠" : gap ? "⛔" : " "} ${e.script}`);
    console.log(`      red run     : ${e.redRun || "⛔ NONE RECORDED"}`);
    console.log(
      `      empty input : ${
        e.emptyInput && e.emptyInput.reported
          ? `${e.emptyInput.reported}${e.emptyInput.date ? ` (${e.emptyInput.date})` : ""}`
          : "⛔ NONE RECORDED"
      }`
    );
    console.log(`      record      : ${e.record}`);
    if (!onDisk) console.log(`      ⚠ LISTED BUT NOT ON DISK`);
    if (gap) {
      console.log(`      ⛔ NOT PROVEN — missing '${gap}'. Its pass is suppressed.`);
    }
  }
  process.exit(0);
}

const scriptName = argv[0].replace(/^verify[\\/]/, "");
const scriptArgs = argv.slice(1);
const scriptPath = path.join(HERE, scriptName);

if (!existsSync(scriptPath)) {
  console.error(`⛔ RUNNER: '${scriptName}' does not exist in verify/.`);
  process.exit(2);
}

const listed = proven.ok
  ? proven.entries.find((e) => e.script === scriptName)
  : undefined;

// ── THE TWO REQUIREMENTS ─────────────────────────────────────────────────────
// An entry must carry BOTH to count as proven. Missing either is treated
// exactly as if the script were not listed at all — same suppression — but the
// message names WHICH requirement is unmet, because "unproven" and "proven for
// one thing and not the other" need different fixes.
//
// ⚠ THE EMPTY-INPUT CONTROL CANNOT BE CHECKED FROM OUTPUT. This runner sees
// text and an exit code, and "0ms because nothing happened" is textually
// identical to "0ms because I never measured anything". A textual detector was
// tried and failed — a classifier keyed on DRIFT/STALL matched an ordinary
// measurement line, because those words are this codebase's subject matter. So
// the requirement is enforced on the PROOF, where it is a recorded fact, not on
// the output, where it is unknowable.
function missingRequirement(e) {
  if (!e) return null;
  if (!e.redRun) return "redRun";
  const c = e.emptyInput;
  if (!c || !c.pointedAt || !c.reported) return "emptyInput";
  return null;
}

const unmet = missingRequirement(listed);
// A listed-but-incomplete entry is NOT proven. `entry` stays undefined so every
// downstream check follows the unproven path with no special-casing.
const entry = listed && !unmet ? listed : undefined;

// ⚠ A LIST ENTRY NAMING A SCRIPT THAT IS NOT ON DISK IS REPORTED, NOT SKIPPED.
// A proof pointing at nothing is a defect in the proof, and silence about it
// would let the list rot while still reading as authoritative.
const orphans = proven.ok
  ? proven.entries.filter((e) => !existsSync(path.join(HERE, e.script)))
  : [];
if (orphans.length > 0) {
  banner([
    `⚠ PROVEN.JSON NAMES ${orphans.length} SCRIPT(S) THAT DO NOT EXIST ON DISK:`,
    ...orphans.map((o) => `    ${o.script}   (record: ${o.record})`),
    ``,
    `  A proof pointing at a missing script is a defect in the list. It was`,
    `  renamed, moved or deleted, and its recorded red run no longer applies`,
    `  to anything. Fix the entry or remove it.`,
  ]);
}

if (!proven.ok) {
  banner([
    `⚠⚠ THE PROVEN LIST COULD NOT BE READ — EVERY SCRIPT IS UNPROVEN.`,
    ``,
    `  Expected : verify/proven.json`,
    `  Error    : ${proven.why}`,
    ``,
    `  No pass from any script is admissible while this stands. Restore the`,
    `  file (it is tracked — \`git checkout verify/proven.json\`) and check it`,
    `  parses as JSON with a "proven" array.`,
  ]);
}

// ── Run it ──────────────────────────────────────────────────────────────────
console.log(`▶ verify/${scriptName}${scriptArgs.length ? " " + scriptArgs.join(" ") : ""}`);
console.log(
  entry
    ? `  status: PROVEN — red ${entry.redRun}, empty-input ${entry.emptyInput.date || "recorded"} (${entry.record})`
    : unmet === "emptyInput"
    ? `  status: LISTED BUT NOT PROVEN — no empty-input control`
    : unmet === "redRun"
    ? `  status: LISTED BUT NOT PROVEN — no recorded red run`
    : `  status: NO RECORDED RED RUN`
);
console.log(BAR);

const child = spawn(process.execPath, [scriptPath, ...scriptArgs], {
  stdio: ["inherit", "pipe", "pipe"],
  env: process.env,
});

let combined = "";
child.stdout.on("data", (d) => {
  const s = d.toString();
  combined += s;
  process.stdout.write(s); // ⚠ ALWAYS pass the numbers through, verdict or not.
});
child.stderr.on("data", (d) => {
  const s = d.toString();
  combined += s;
  process.stderr.write(s);
});

child.on("close", (code) => {
  const exitCode = code === null ? 1 : code;
  const verdict = classify(exitCode, combined);

  if (entry) {
    // Proven: the verdict stands as the script reported it.
    banner([
      `✓ VERDICT STANDS — ${scriptName} has a recorded red run (${entry.redRun}).`,
      ``,
      `  ⚠ WHAT THIS SCRIPT DOES NOT WATCH:`,
      ...(entry.blindSpots || ["    (none declared — treat the scope as unknown)"]).map(
        (b) => `    · ${b}`
      ),
      ``,
      `  Proved it CAN go red. Not that it watches the right thing.`,
      `  Record: ${entry.record}`,
    ]);
    process.exit(exitCode);
  }

  // Unproven.
  if (verdict === "fail") {
    // ⚠ A RED FROM AN UNPROVEN INSTRUMENT STILL MEANS GO AND LOOK.
    banner([
      `⛔ FAILURE — passed through unchanged.`,
      ``,
      `  ${scriptName} has no recorded red run, but this is a FAILURE and a`,
      `  failure is not suppressed. An unproven instrument can still be right`,
      `  when it complains. Go and look.`,
    ]);
    process.exit(exitCode);
  }

  if (verdict === "pass") {
    // ⚠ A LISTED ENTRY MISSING THE EMPTY-INPUT CONTROL GETS ITS OWN MESSAGE.
    // "never shown to fail" and "shown to fail, never shown to be looking at
    // anything" are different defects and need different runs to fix.
    if (unmet === "emptyInput") {
      banner([
        `⚠ NO VERDICT — ${scriptName} is listed in proven.json but has NO`,
        `  EMPTY-INPUT CONTROL. Its numbers are below; its pass is not`,
        `  admissible as evidence.`,
        ``,
        `  ⛔ THE PASS ABOVE HAS BEEN SUPPRESSED. This script HAS a recorded red`,
        `  run${listed && listed.redRun ? ` (${listed.redRun})` : ``}, so it can fail. Nothing on record shows what it says`,
        `  when there is NOTHING TO SEE.`,
        ``,
        `  ⚠ THE QUIET ZERO — instrument defect #12. A zero meaning "I looked`,
        `  and saw nothing happen" and a zero meaning "I never measured`,
        `  anything" are THE SAME CHARACTERS ON SCREEN. A false pass gets`,
        `  believed; a FALSE CONSTRAINT GETS DESIGNED AROUND, and that decision`,
        `  is invisible afterwards, because the thing avoided never gets tried`,
        `  again.`,
        ``,
        `  TO MAKE IT ADMISSIBLE: point this script at something that genuinely`,
        `  contains nothing — an empty crop, a selector matching no element, a`,
        `  run with no samples. It must report an ABSENCE ("NO REVEAL FOUND",`,
        `  "NOTHING RESOLVED"). ⛔ A ZERO VALUE DOES NOT QUALIFY: "0ms" from an`,
        `  empty input is the defect itself, not the control. Write the run up`,
        `  in project-intelligence/ and add an "emptyInput" block to its entry.`,
        ``,
        `  Worked example: verify/proven.json → reveal-stall.mjs.`,
      ]);
      process.exit(3);
    }

    banner([
      `⚠ NO VERDICT — this script has no recorded red run. Its numbers are`,
      `  below; its pass is not admissible as evidence.`,
      ``,
      `  ⛔ THE PASS ABOVE HAS BEEN SUPPRESSED. A harness that has never been`,
      `  seen to fail has not been shown capable of failing, and every`,
      `  expensive instrument defect in this project failed toward a PASS.`,
      ``,
      `  TO MAKE IT ADMISSIBLE: run it against a build carrying the defect it`,
      `  claims to catch, confirm it goes RED, revert, confirm it goes green,`,
      `  write the run up in project-intelligence/, and add it to`,
      `  verify/proven.json with that record — INCLUDING an "emptyInput" block.`,
      `  Both are required: that it CAN fail, and that it knows when it is`,
      `  looking at nothing.`,
    ]);
    // ⚠ Exit non-zero so a suppressed pass cannot be consumed as a pass by
    // anything reading the exit code (CI, a chained &&, a wrapper script).
    process.exit(3);
  }

  banner([
    `⚠ NO VERDICT DETECTED, and ${scriptName} has no recorded red run.`,
    ``,
    `  Nothing in the output matched a pass or a failure. Read the numbers`,
    `  above yourself — this gate has nothing to add.`,
  ]);
  process.exit(exitCode === 0 ? 3 : exitCode);
});
