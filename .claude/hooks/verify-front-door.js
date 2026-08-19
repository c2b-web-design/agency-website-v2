#!/usr/bin/env node
/**
 * verify-front-door — PreToolUse hook on Bash, C2B Web Design.
 * THE LAUNCHER. The logic lives in ./verify-front-door-match.js.
 *
 * Denies any command that runs a verify/ harness directly, and names the
 * compliant form instead:  npm run verify -- <script.mjs>
 *
 * WHY THIS IS A HOOK AND NOT A REMINDER
 * -------------------------------------
 * verify/run.mjs is the verdict gate. It suppresses a PASS from a harness with
 * no recorded red run, because every expensive instrument failure in this
 * project failed toward a pass: q5-stutter.mjs read 0/3 CLEAN on a stall Carl
 * could see; one-context.mjs read 2/2 while a WebGL context was created on
 * every question.
 *
 * But `node verify/x.mjs` skips the gate completely and prints the raw verdict
 * — and it is SHORTER TO TYPE than the compliant route. A control that can be
 * declined by typing less is not a control; it is a suggestion with a cost
 * attached to obeying it. 128 of 130 scripts have no recorded red run, so 128
 * scripts could print an unearned pass by taking the shorter path.
 *
 * The runner already says of itself: "IT DOES NOT STOP ANYONE RUNNING A SCRIPT
 * DIRECTLY ... a convention with a reminder attached, not a mechanism." This
 * file is the mechanism. An agent asked to prefer a route is an intention; a
 * condition that fires is a mechanism (principle P-A).
 *
 * ⚠ WHY THIS CANNOT DEADLOCK THE RUNNER — verified before this was written
 * -----------------------------------------------------------------------
 * verify/run.mjs launches its child as:
 *
 *     spawn(process.execPath, [scriptPath, ...scriptArgs], { ... })
 *
 * `shell` is NOT set, so it defaults to false: Node execs the binary directly
 * with an argv array, with no cmd.exe or sh in between. That child is an
 * ordinary OS process, not a Bash tool call, so this hook never fires for it.
 * A PreToolUse hook fires only on a tool invocation by the agent. Once
 * `npm run verify` is running, everything it spawns is outside the harness's
 * view entirely.
 *
 * ⛔ IF run.mjs IS EVER CHANGED TO `shell: true`, RE-CHECK THIS. It would still
 * not deadlock — the spawned shell is still not a Bash TOOL call — but the
 * reasoning above would no longer be the reason, and a claim whose reason has
 * moved is the failure mode this project keeps finding.
 *
 * ⚠⚠ WHY THERE ARE TWO FILES — found by falsification, case (d)
 * --------------------------------------------------------------
 * The first version was ONE file and FAILED OPEN. A syntax error in it made
 * node die in the module loader at exit 1, which the harness treats as a
 * NON-BLOCKING error, and the verify command RAN. Wrapping the body in
 * try/catch does not fix it: A FILE CANNOT CATCH ITS OWN PARSE ERROR — the
 * code never runs.
 *
 * So the matcher lives in a SEPARATE module, loaded here inside a try/catch. A
 * parse error there is a runtime error here, and this file blocks. This file
 * stays small and stable; edits belong in the matcher.
 *
 * ⚠ THE EXIT CODE IS THE ONLY THING THAT BLOCKS. Proved by test, not assumed:
 *     exit 0 + deny JSON on stdout  → denied, with the reason shown
 *     exit 0 + no JSON              → ALLOWED
 *     exit 2                        → BLOCKED, stderr shown as the reason
 *     any other non-zero (1, crash) → ALLOWED, error reported but not blocking
 *
 * ⚠ ON AN INTERNAL ERROR THIS HOOK DENIES verify/ COMMANDS ONLY, AND LETS
 * EVERYTHING ELSE THROUGH. Carl's decision, 19 August 2026. The reason is the
 * recovery path: a TOTAL fail-closed would block every Bash command, so the
 * only way to repair this file would be the Edit tool — and this file is on
 * the permanent protected list, so that repair would itself need Carl's unlock,
 * in a session where nothing can run. THAT IS A TRAP, NOT A STOP, and a control
 * that traps people gets switched off. The narrow version still closes the hole
 * it exists to close: an unearned pass cannot be printed through this hook,
 * broken or working.
 *
 * ⚠ THE COST OF NARROWNESS, STATED PLAINLY: when the matcher has failed,
 * classification is exactly what is unavailable, so the fallback re-detects
 * "verify" with a crude substring test that cannot throw. It is coarser than
 * the real matcher and will both OVER-block (a command merely mentioning
 * verify/) and UNDER-block (an exotic form the substring misses). That is the
 * accepted trade against the trap.
 *
 * ⚠ WHAT STILL FAILS OPEN, UNAVOIDABLY:
 *   - ⛔ A SYNTAX ERROR IN *THIS* FILE. It is the outermost frame; nothing can
 *     catch it. Mitigation is that it is short enough to read at a glance, on
 *     the permanent protected list, and tracked — a reviewer, not a mechanism.
 *   - If this file is DELETED, or settings.json stops registering it, nothing
 *     runs and nothing blocks. A hook cannot defend its own existence.
 *
 * WHAT IT ALLOWS, DELIBERATELY
 * ----------------------------
 *   - `npm run verify -- <script>`  — the compliant front door.
 *   - `npm run verify:shot` / `verify:responsive` — declared package.json entry
 *     points. They bypass the verdict gate, and that is a REAL GAP, recorded
 *     here rather than quietly closed: these are capture tools, not verdict
 *     harnesses, and blocking a documented npm script would break the build's
 *     own vocabulary.
 *   - `node verify/run.mjs <script>` — the runner itself IS the gate. Invoking
 *     it directly is the same route by a longer name, not a bypass.
 *   - Reading, listing, searching: cat/head/sed -n/grep/ls/wc against verify/.
 *     This hook governs EXECUTION, not inspection.
 *   - Everything outside verify/.
 *
 * WHAT IT CANNOT ENFORCE — stated so the gap is not mistaken for covered
 * ---------------------------------------------------------------------
 *   - ⚠ IT SEES ONLY Bash TOOL CALLS. Anything run outside the tool — a
 *     terminal Carl opens himself, an npm script that shells out, a CI step, a
 *     process spawned by another process — never reaches this hook. Its reach
 *     is the agent's own hands, nothing else.
 *   - ⚠ IT MATCHES THE COMMAND STRING, SO AN UNUSUAL FORM MAY SLIP PAST. This
 *     is pattern matching over text, not interception of process creation. A
 *     command that reaches a harness by a route this file does not recognise
 *     will be ALLOWED. Known-unmatched forms, tested and true as of writing:
 *       · a variable holding the path            — S=verify/x.mjs; node $S
 *       · command substitution                   — node $(echo verify/x.mjs)
 *       · a copy made first                      — cp verify/x.mjs /tmp/y.mjs
 *                                                  && node /tmp/y.mjs
 *       · an interpreter this list does not name
 *       · a shell script or Makefile that runs it internally
 *     ⛔ DO NOT READ THAT LIST AS AN INSTRUCTION SET. It is written down
 *     because an unstated gap gets mistaken for coverage — the same reason the
 *     scope guard names the shell as its own hole. Using one of these to reach
 *     a harness is declining the control deliberately, which is the one thing
 *     it cannot stop and the one thing the diff will show.
 *   - ⚠ IT SAYS NOTHING ABOUT WHETHER THE HARNESS IS ANY GOOD. It routes the
 *     call through the verdict gate. The gate checks for a recorded red run —
 *     not whether that run is still valid, and not whether the script watches
 *     the right channel at all.
 *   - It cannot tell an honest measurement from a misleading one. That stays
 *     with checkpoint review and with Carl.
 */

const MATCHER = "./verify-front-door-match.js";

/**
 * ⚠ LAST-RESORT DETECTOR, duplicated from the matcher ON PURPOSE.
 *
 * It must work when the matcher could not be loaded at all, so it cannot come
 * FROM the matcher. Deliberately primitive — plain string ops, nothing that can
 * throw. ⚠ This project's harness-lies class is usually a DUPLICATED CONSTANT;
 * this duplication is different in kind: it is a fallback that must survive the
 * absence of the thing it duplicates, and it is intentionally cruder, not a
 * second copy of the same judgement.
 */
function looksLikeVerify(command) {
  try {
    if (typeof command !== "string") return true; // cannot tell → block
    const c = command.toLowerCase();
    return c.indexOf("verify/") !== -1 || c.indexOf("verify\\") !== -1;
  } catch {
    return true; // cannot tell → block
  }
}

/**
 * NARROW fail-closed: block ONLY verify/ commands, let everything else run.
 * Exit 2 is the ONLY code the harness treats as blocking.
 */
function failClosedNarrow(command, reason) {
  if (!looksLikeVerify(command)) process.exit(0);
  try {
    process.stderr.write(reason + "\n");
  } catch {
    /* stderr itself failed; the exit code still blocks */
  }
  process.exit(2);
}

function fixHint(err) {
  return (
    `Error: ${err && err.message ? err.message : String(err)}\n\n` +
    `This guard fails CLOSED for verify/ commands by design: it may fail, but ` +
    `it may not fail quietly open. A broken guard that still looks installed ` +
    `is worse than no guard, because it reads as protection. Commands ` +
    `unrelated to verify/ are unaffected, so the session is NOT locked out ` +
    `while this is repaired.\n\n` +
    `TO FIX: both hook files are tracked —\n` +
    `  git checkout .claude/hooks/verify-front-door.js\n` +
    `  git checkout .claude/hooks/verify-front-door-match.js\n` +
    `Check both parse (\`node --check <file>\`) and that .claude/settings.json ` +
    `still registers the launcher on the Bash matcher. Then tell Carl.`
  );
}

let raw = "";

process.stdin.on("error", () =>
  failClosedNarrow(
    raw,
    `VERIFY FRONT DOOR: could not read the hook payload from stdin, so this ` +
      `command could not be checked and is BLOCKED.\n\n` +
      `This guard fails CLOSED for verify/ commands by design. Commands ` +
      `unrelated to verify/ are unaffected.\n\n` +
      `TO FIX: re-run the command. If it persists, check the two hook files ` +
      `and their registration in .claude/settings.json, then tell Carl.`
  )
);

process.stdin.on("data", (c) => (raw += c));

process.stdin.on("end", () => {
  // Recover the command as early as possible, so the fail-closed path can
  // consult it even if everything after this throws.
  let command = "";
  try {
    command = JSON.parse(raw).tool_input.command || "";
  } catch {
    command = typeof raw === "string" ? raw : ""; // crude, but only ever
                                                  // substring-tested
  }

  try {
    // ⚠ THE POINT OF THE SPLIT: a parse error in the matcher lands HERE, as a
    // catchable runtime error, instead of killing the process at exit 1.
    const matcher = require(MATCHER);

    if (!matcher || typeof matcher.findOffence !== "function") {
      failClosedNarrow(
        command,
        `VERIFY FRONT DOOR: the matcher module did not export findOffence(), ` +
          `so this command could not be checked and is BLOCKED.\n\n` +
          fixHint(new Error(`${MATCHER} exports were missing or malformed`))
      );
      return;
    }

    let input;
    try {
      input = JSON.parse(raw);
    } catch {
      failClosedNarrow(
        command,
        `VERIFY FRONT DOOR: the hook payload was not valid JSON, so this ` +
          `command could not be checked and is BLOCKED.\n\n` +
          `A guard that cannot see the command must not pretend the command ` +
          `is fine. Commands unrelated to verify/ are unaffected.\n\n` +
          `TO FIX: re-run the command. If it persists, the harness payload ` +
          `format may have changed — check the hook files and tell Carl.`
      );
      return;
    }

    const cmd = input && input.tool_input && input.tool_input.command;

    // No command string means this is not something this hook governs.
    if (typeof cmd !== "string" || !cmd.trim()) process.exit(0);

    const hit = matcher.findOffence(cmd);

    if (hit === null) process.exit(0); // allowed

    if (!hit || typeof hit.script !== "string") {
      failClosedNarrow(
        cmd,
        `VERIFY FRONT DOOR: the matcher returned an unrecognised result, so ` +
          `this command could not be checked and is BLOCKED.\n\n` +
          fixHint(new Error("findOffence() returned an unexpected value"))
      );
      return;
    }

    // A real offence: the ordinary, well-formed denial path — deny JSON on a
    // ZERO exit.
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "deny",
          permissionDecisionReason: matcher.denialMessage(hit),
        },
      })
    );
    process.exit(0);
  } catch (err) {
    // ⚠ ANY failure — including a SYNTAX ERROR in the matcher module — blocks
    // verify/ commands. This is the case (d) fix.
    failClosedNarrow(
      command,
      `VERIFY FRONT DOOR: the guard itself failed, so this command could not ` +
        `be checked and is BLOCKED.\n\n` +
        fixHint(err)
    );
  }
});
