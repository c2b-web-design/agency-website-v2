#!/usr/bin/env node
/**
 * chunk-scope-guard — PreToolUse hook, C2B Web Design.
 * THE LAUNCHER. The logic lives in ./chunk-scope-guard-match.js.
 *
 * Denies file edits that fall outside the current chunk's declared scope.
 *
 * WHY THIS IS A HOOK AND NOT AN INSTRUCTION
 * -----------------------------------------
 * The retired Drift Sentinel asked an agent to watch for drift. It sat at
 * STATUS: STOP while work was being submitted for review. An agent asked to
 * watch is an intention; a condition that fires is a mechanism (principle P-A,
 * workflow-redesign-research.md). This runs in the harness, before the tool
 * call, and the Builder cannot decline it.
 *
 * WHAT IT ENFORCES
 * ----------------
 * Only the mechanical third of the drift-condition list in
 * ai-system/live-work-protocol.md §8:
 *   - editing a file on the PERMANENT protected list (.claude/protected-files.json)
 *   - editing a file outside the chunk's declared scope
 *   - editing an approved-foundation file the chunk did not name
 *
 * TWO LISTS, TWO DIFFERENT LIFETIMES
 * ----------------------------------
 *   1. .claude/protected-files.json — TRACKED, committed, always in force.
 *      Checked on every invocation whether or not a chunk is scoped.
 *      Overridden only by an explicit "unlocked" entry naming that exact file.
 *   2. project-intelligence/live-work/chunk-scope.json — per chunk, optional,
 *      gitignored scratch. Unchanged by this addition, including its fail-open.
 *
 * The permanent list exists because list 2 could not carry permanent
 * protection: live-work/ is gitignored, so nothing in it survives as a record,
 * and its protection depended on someone REMEMBERING to write a scope file at
 * the start of every chunk. A remembered step is the failure mode this project
 * is removing (principle P-A). Before this list existed the hook was live,
 * correct, and protecting nothing, because chunk-scope.json was absent.
 *
 * FAIL-LOUD ON THE PERMANENT LIST, FAIL-OPEN ON THE CHUNK SCOPE
 * ------------------------------------------------------------
 * If .claude/protected-files.json is missing, unreadable or malformed, EVERY
 * edit is DENIED with an explanation. A control that silently stops controlling
 * is worse than no control, because it still reads as protection. The chunk
 * scope file keeps its original fail-open: absent means no chunk is scoped,
 * which is a normal state, not a broken one.
 *
 * ⚠⚠ WHY THERE ARE TWO FILES — MEASURED, 19 August 2026
 * ------------------------------------------------------
 * This guard was ONE file and FAILED OPEN. Measured, not inferred: with a
 * syntax error appended, an Edit to `lib/utils.ts` — a permanently protected
 * path DENIED ninety seconds earlier in the same session — LANDED ON DISK.
 * All 19 protected paths were writable while the guard still appeared
 * installed, printing a stack trace nobody had to read.
 *
 * ⚠ A HOOK BLOCKS ONLY BY EXITING 2. Proved by test, not assumed:
 *     exit 0 + deny JSON on stdout  → denied, with the reason shown
 *     exit 0 + no JSON              → ALLOWED
 *     exit 2                        → BLOCKED, stderr shown as the reason
 *     any other non-zero (1, crash) → ALLOWED, error reported but not blocking
 *
 * A syntax error exits 1. And a try/catch around the body does NOT fix it:
 * A FILE CANNOT CATCH ITS OWN PARSE ERROR — node dies in the module loader
 * (`wrapSafe`) before the first line executes. That was tried on the verify
 * front door and falsified.
 *
 * So the matcher is a SEPARATE module, loaded here inside a try/catch. A parse
 * error there is a runtime error here, and this file exits 2. This file stays
 * small and stable; edits belong in the matcher.
 *
 * ⚠⚠ FAIL-CLOSED HERE IS TOTAL, NOT NARROW — AND THAT DIFFERS FROM THE VERIFY
 * FRONT DOOR ON PURPOSE
 * ---------------------------------------------------------------------------
 * On ANY internal error this hook denies EVERY edit, not just edits to
 * protected paths.
 *
 * The verify front door fails closed NARROWLY, because it guards `Bash`: a
 * total block there would stop every shell command, and the only repair route
 * would be the Edit tool against a file on the permanent protected list —
 * needing an unlock in a session where nothing can run. That is a trap, and a
 * control that traps people gets switched off.
 *
 * ⚠ THIS HOOK HAS NO SUCH TRAP. It guards Edit/Write/NotebookEdit and NOT Bash.
 * If it breaks, editing stops but THE SHELL STILL WORKS, so recovery is one
 * ordinary command — `git checkout .claude/hooks/` — with no unlock and no
 * permission needed. The escape hatch is outside the thing that broke.
 *
 * So there is no reason to be clever about which edits to deny. A guard that
 * cannot read its own rules does not know which paths are protected, and
 * guessing is exactly the failure that lets a protected file through. It denies
 * everything and says how to fix it.
 *
 * ⚠ WHAT STILL FAILS OPEN, UNAVOIDABLY:
 *   - ⛔ A SYNTAX ERROR IN *THIS* FILE. It is the outermost frame; nothing can
 *     catch it. Mitigation is that it is short enough to read at a glance, on
 *     the permanent protected list, and tracked — a reviewer, not a mechanism.
 *   - If this file is DELETED, or settings.json stops registering it, nothing
 *     runs and nothing blocks. A hook cannot defend its own existence.
 *
 * WHAT IT CANNOT ENFORCE — stated so the gap is not mistaken for covered
 * ------------------------------------------------------------------------
 *   - a coupled value implemented as an independent overlay
 *   - a derived value that lost its source behaviour's condition
 *     (the 24 July reduced-motion defect was exactly this, and no path
 *      check would ever have caught it)
 *   - visual drift from the intended result
 *   - ⚠ ANY WRITE THAT IS NOT Edit/Write/NotebookEdit. The hook is registered
 *     on those three tools only. `Bash` writes by redirect, `sed -i`, `mv`,
 *     `cp` and `rm` never reach it — the same behavioural-not-enforced
 *     boundary recorded for the Architect seat in
 *     ai-system/architect-settings.reference.json.md. A protected file can
 *     still be overwritten from a shell.
 *   - ⚠ A SHELL WRITE, INCLUDING ONE TO ITS OWN LIST. The hook is registered on
 *     Edit/Write/NotebookEdit only, so .claude/protected-files.json now
 *     protects itself on that path — it lists itself, and changing it requires
 *     an unlock naming that exact file, so removing an entry to reach the file
 *     it defended is no longer a legal edit. That closes the ordinary edit
 *     path and NOT the shell: `Bash` redirect, `sed -i`, `mv`, `cp` and `rm`
 *     bypass the hook entirely and can still rewrite or delete the list and
 *     everything on it. The same behavioural-not-enforced boundary recorded
 *     for the Architect seat in
 *     ai-system/architect-settings.reference.json.md. What catches a shell
 *     write is the diff, because the file is tracked — a reviewer, not a
 *     mechanism. Do not read the lock as tamper-proofing.
 *   - ⚠ A FILE NOBODY ADDED. Protection is per named path. A new file, or a
 *     renamed one, is unprotected until someone lists it.
 * Those need judgement and stay with checkpoint review and with Carl.
 */

const MATCHER = "./chunk-scope-guard-match.js";

/**
 * Deny the edit, stating the reason.
 * ⚠ Exit 2 is the ONLY code the harness treats as blocking — exit 1 and any
 * crash are NON-BLOCKING and let the edit through. That is the whole reason
 * this launcher exists.
 */
function block(reason) {
  try {
    process.stderr.write(reason + "\n");
  } catch {
    /* stderr itself failed; the exit code still blocks */
  }
  process.exit(2);
}

/**
 * The ordinary, well-formed denial: a deny decision on a ZERO exit. Used when
 * the guard is working and has decided the edit is not allowed.
 */
function deny(reason) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: reason,
    },
  }));
  process.exit(0);
}

const ALLOW = () => process.exit(0);

function fixHint(err) {
  return (
    `Error: ${err && err.message ? err.message : String(err)}\n\n` +
    `⚠ THIS GUARD FAILS CLOSED — EVERY edit is denied while it is broken, not ` +
    `just edits to protected paths. A guard that cannot read its own rules ` +
    `does not know which paths are protected, and guessing is the failure that ` +
    `lets a protected file through.\n\n` +
    `THE SHELL STILL WORKS — this hook guards Edit/Write only, so recovery is ` +
    `one ordinary command and needs no unlock:\n` +
    `  git checkout .claude/hooks/chunk-scope-guard.js\n` +
    `  git checkout .claude/hooks/chunk-scope-guard-match.js\n` +
    `Check both parse (\`node --check <file>\`) and that .claude/settings.json ` +
    `still registers the launcher on the Edit|Write|NotebookEdit matcher. ` +
    `Then tell Carl.`
  );
}

let raw = "";

process.stdin.on("error", (err) =>
  block(
    `SCOPE GUARD: could not read the hook payload from stdin, so this edit ` +
      `could not be checked and is BLOCKED.\n\n` + fixHint(err)
  )
);

process.stdin.on("data", (c) => (raw += c));

process.stdin.on("end", () => {
  try {
    // ⚠ THE POINT OF THE SPLIT: a parse error in the matcher lands HERE, as a
    // catchable runtime error, instead of killing the process at exit 1.
    const matcher = require(MATCHER);

    if (!matcher || typeof matcher.decide !== "function") {
      block(
        `SCOPE GUARD: the matcher module did not export decide(), so this edit ` +
          `could not be checked and is BLOCKED.\n\n` +
          fixHint(new Error(`${MATCHER} exports were missing or malformed`))
      );
      return;
    }

    let input;
    try {
      input = JSON.parse(raw);
    } catch {
      // ⚠ ORIGINAL FAIL-OPEN, CARRIED OVER DELIBERATELY: an unreadable payload
      // is not the Builder's fault, and this predates the split. It is a real
      // gap — recorded here rather than quietly changed, because widening the
      // guard's behaviour is not what this chunk was authorised to do.
      ALLOW();
      return;
    }

    const verdict = matcher.decide(input);

    if (verdict && verdict.action === "allow") ALLOW();

    if (verdict && verdict.action === "deny" && typeof verdict.reason === "string") {
      deny(verdict.reason);
      return;
    }

    // The matcher returned something unrecognised. Do not guess.
    block(
      `SCOPE GUARD: the matcher returned an unrecognised result, so this edit ` +
        `could not be checked and is BLOCKED.\n\n` +
        fixHint(new Error("decide() returned an unexpected value"))
    );
  } catch (err) {
    // ⚠ ANY failure — including a SYNTAX ERROR in the matcher module — blocks
    // EVERY edit. This is the fix for the fail-open measured on 19 August 2026.
    block(
      `SCOPE GUARD: the guard itself failed, so this edit could not be checked ` +
        `and is BLOCKED.\n\n` + fixHint(err)
    );
  }
});
