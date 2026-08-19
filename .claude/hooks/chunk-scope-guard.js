#!/usr/bin/env node
/**
 * chunk-scope-guard — PreToolUse hook, C2B Web Design
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

const fs = require("fs");
const path = require("path");

const SCOPE_FILE = path.join(
  __dirname, "..", "..",
  "project-intelligence", "live-work", "chunk-scope.json"
);

// The permanent list. Tracked, committed, always in force.
const PROTECTED_FILE = path.join(__dirname, "..", "protected-files.json");

const ALLOW = () => process.exit(0);

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

let raw = "";
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    ALLOW(); // unreadable payload is not the Builder's fault
  }

  const filePath = input?.tool_input?.file_path;
  if (!filePath) ALLOW(); // not a file edit

  const repoRoot = path.join(__dirname, "..", "..");
  const rel = path.relative(repoRoot, filePath).split(path.sep).join("/");

  // Never police files outside the repo, or the scope file itself.
  if (rel.startsWith("..")) ALLOW();
  if (rel === "project-intelligence/live-work/chunk-scope.json") ALLOW();

  const matches = (patterns) =>
    (patterns || []).some((p) => {
      if (p.endsWith("/")) return rel.startsWith(p);
      if (p.includes("*")) {
        const re = new RegExp(
          "^" + p.split("*").map((s) => s.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*") + "$"
        );
        return re.test(rel);
      }
      return rel === p;
    });

  // ── THE CHUNK SCOPE, loaded early so an "unlocked" entry can be honoured
  // against the PERMANENT list below. Absent or malformed leaves `scope` empty,
  // which is the original fail-open: no chunk scoped is a normal state.
  let scope = {};
  try {
    if (fs.existsSync(SCOPE_FILE)) {
      scope = JSON.parse(fs.readFileSync(SCOPE_FILE, "utf8")) || {};
    }
  } catch {
    scope = {}; // a malformed scope file must not block all work
  }

  // ── THE PERMANENT LIST — checked on EVERY invocation, scoped chunk or not.
  //
  // ⚠ THIS RUNS BEFORE ANY `scope.active === false` OR ABSENT-SCOPE EXIT.
  // Both of those are fail-open paths, and reaching one first would let the
  // permanent list be bypassed by deleting a gitignored scratch file or by
  // flipping one boolean inside it. Permanent means it does not depend on
  // live-work/ existing or saying anything in particular.
  let permanent;
  try {
    const parsed = JSON.parse(fs.readFileSync(PROTECTED_FILE, "utf8"));
    permanent = parsed && parsed.protected;
    if (!Array.isArray(permanent)) throw new Error("no 'protected' array");
  } catch (err) {
    // ⚠ FAIL LOUD. A silent allow here is the exact defect this list removes:
    // the hook would go on running, reporting nothing, protecting nothing.
    deny(
      `SCOPE GUARD: the permanent protected-files list could not be read, so ` +
      `NO edit can be allowed.\n\n` +
      `Expected: .claude/protected-files.json\n` +
      `Error:    ${err && err.message ? err.message : String(err)}\n\n` +
      `This hook denies every edit while that file is missing, unreadable or ` +
      `malformed. That is deliberate — a guard that silently stops guarding ` +
      `still reads as protection, which is worse than having none.\n\n` +
      `TO FIX: restore .claude/protected-files.json (it is tracked — ` +
      `\`git checkout .claude/protected-files.json\` recovers it) and check it ` +
      `parses as JSON with a "protected" array of paths. Then retry the edit.`
    );
  }

  // An explicit per-file unlock is the ONLY way past a permanent lock, and the
  // "unlocked" list is matched by exact path — never a folder, never a glob.
  const unlockedByName = (scope.unlocked || []).includes(rel);

  if (permanent.includes(rel) && !unlockedByName) {
    deny(
      `SCOPE GUARD: '${rel}' is PERMANENTLY PROTECTED.\n\n` +
      `It is listed in .claude/protected-files.json, which is in force at all ` +
      `times — independent of any chunk scope file, and whether or not a chunk ` +
      `is currently scoped.\n\n` +
      `Unlocking it requires CARL naming this specific file: ` +
      `'${rel}'. Never a folder, never a pattern, never "the enquiry files" — ` +
      `one named path, for one chunk.\n\n` +
      `Stop. Explain why the change is needed, state the risk, and ask Carl ` +
      `before editing (CLAUDE.md, "Approved layers").\n\n` +
      `If Carl authorises it, add exactly '${rel}' to "unlocked" in ` +
      `project-intelligence/live-work/chunk-scope.json.`
    );
  }

  // ── BELOW HERE: the original per-chunk behaviour, unchanged.
  if (scope.active === false) ALLOW();

  // Explicitly named approved-foundation files the chunk unlocked.
  if (matches(scope.unlocked)) ALLOW();

  if (matches(scope.protected)) {
    deny(
      `SCOPE GUARD: '${rel}' is an approved foundation layer and this chunk ` +
      `(${scope.chunk || "unnamed"}) did not unlock it.\n\n` +
      `Approved layers are locked unless Carl explicitly reopens them ` +
      `(CLAUDE.md). Stop, explain why the change is needed, state the risk, ` +
      `and ask Carl before editing.\n\n` +
      `If Carl authorises it, add the path to "unlocked" in ` +
      `live-work/chunk-scope.json.`
    );
  }

  if (Array.isArray(scope.files) && scope.files.length > 0 && !matches(scope.files)) {
    deny(
      `SCOPE GUARD: '${rel}' is outside the declared scope of chunk ` +
      `'${scope.chunk || "unnamed"}'.\n\n` +
      `In scope: ${scope.files.join(", ")}\n\n` +
      `A new need is a new chunk (handoff-protocol.md §2.5). Either finish ` +
      `this chunk first, or ask Carl to widen the scope — do not widen it ` +
      `yourself.`
    );
  }

  ALLOW();
});
