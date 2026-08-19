/**
 * chunk-scope-guard-match — the matcher for the chunk scope guard.
 *
 * ⚠ THIS FILE IS LOADED BY .claude/hooks/chunk-scope-guard.js, WHICH IS THE
 * LAUNCHER REGISTERED IN settings.json. IT IS NOT A HOOK ITSELF.
 *
 * WHY THE SPLIT — MEASURED, 19 August 2026
 * ----------------------------------------
 * The guard was ONE file and FAILED OPEN. Measured, not inferred: with a syntax
 * error appended, an Edit to `lib/utils.ts` — a permanently protected path that
 * had been DENIED ninety seconds earlier — LANDED ON DISK. All 19 protected
 * paths were writable while the guard still appeared installed.
 *
 * A hook blocks ONLY by exiting 2. A syntax error exits 1, which the harness
 * treats as a NON-BLOCKING error. And a try/catch around the body does not help:
 * A FILE CANNOT CATCH ITS OWN PARSE ERROR — node dies in the module loader
 * (`wrapSafe`) before the first line runs.
 *
 * So the logic lives here, loaded by the launcher inside a try/catch. A parse
 * error HERE is a RUNTIME error THERE, and the launcher exits 2.
 *
 * ⚠ EVERY BEHAVIOUR BELOW IS CARRIED OVER UNCHANGED from the single-file guard.
 * The split was to make failure safe, NOT to change what the guard decides. The
 * two fail-open paths that remain (an unreadable payload, a non-file tool call)
 * are original and deliberate, and are marked where they occur.
 *
 * WHAT IT ENFORCES, WHAT IT CANNOT, AND THE SHELL HOLE: see the launcher's
 * header. Read that file first.
 */

const fs = require("fs");
const path = require("path");

const SCOPE_FILE = path.join(
  __dirname, "..", "..",
  "project-intelligence", "live-work", "chunk-scope.json"
);

// The permanent list. Tracked, committed, always in force.
const PROTECTED_FILE = path.join(__dirname, "..", "protected-files.json");

/**
 * Decide what to do with one Edit/Write/NotebookEdit call.
 *
 * @param {object} input the parsed hook payload
 * @returns {{action: "allow"} | {action: "deny", reason: string}}
 */
function decide(input) {
  const filePath = input && input.tool_input && input.tool_input.file_path;

  // ⚠ ORIGINAL FAIL-OPEN, DELIBERATE: not a file edit, so not this hook's
  // business. Carried over unchanged.
  if (!filePath) return { action: "allow" };

  const repoRoot = path.join(__dirname, "..", "..");
  const rel = path.relative(repoRoot, filePath).split(path.sep).join("/");

  // Never police files outside the repo, or the scope file itself.
  if (rel.startsWith("..")) return { action: "allow" };
  if (rel === "project-intelligence/live-work/chunk-scope.json") {
    return { action: "allow" };
  }

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
    return {
      action: "deny",
      reason:
        `SCOPE GUARD: the permanent protected-files list could not be read, so ` +
        `NO edit can be allowed.\n\n` +
        `Expected: .claude/protected-files.json\n` +
        `Error:    ${err && err.message ? err.message : String(err)}\n\n` +
        `This hook denies every edit while that file is missing, unreadable or ` +
        `malformed. That is deliberate — a guard that silently stops guarding ` +
        `still reads as protection, which is worse than having none.\n\n` +
        `TO FIX: restore .claude/protected-files.json (it is tracked — ` +
        `\`git checkout .claude/protected-files.json\` recovers it) and check it ` +
        `parses as JSON with a "protected" array of paths. Then retry the edit.`,
    };
  }

  // An explicit per-file unlock is the ONLY way past a permanent lock, and the
  // "unlocked" list is matched by exact path — never a folder, never a glob.
  const unlockedByName = (scope.unlocked || []).includes(rel);

  if (permanent.includes(rel) && !unlockedByName) {
    return {
      action: "deny",
      reason:
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
        `project-intelligence/live-work/chunk-scope.json.`,
    };
  }

  // ── BELOW HERE: the original per-chunk behaviour, unchanged.
  if (scope.active === false) return { action: "allow" };

  // Explicitly named approved-foundation files the chunk unlocked.
  if (matches(scope.unlocked)) return { action: "allow" };

  if (matches(scope.protected)) {
    return {
      action: "deny",
      reason:
        `SCOPE GUARD: '${rel}' is an approved foundation layer and this chunk ` +
        `(${scope.chunk || "unnamed"}) did not unlock it.\n\n` +
        `Approved layers are locked unless Carl explicitly reopens them ` +
        `(CLAUDE.md). Stop, explain why the change is needed, state the risk, ` +
        `and ask Carl before editing.\n\n` +
        `If Carl authorises it, add the path to "unlocked" in ` +
        `live-work/chunk-scope.json.`,
    };
  }

  if (Array.isArray(scope.files) && scope.files.length > 0 && !matches(scope.files)) {
    return {
      action: "deny",
      reason:
        `SCOPE GUARD: '${rel}' is outside the declared scope of chunk ` +
        `'${scope.chunk || "unnamed"}'.\n\n` +
        `In scope: ${scope.files.join(", ")}\n\n` +
        `A new need is a new chunk (handoff-protocol.md §2.5). Either finish ` +
        `this chunk first, or ask Carl to widen the scope — do not widen it ` +
        `yourself.`,
    };
  }

  return { action: "allow" };
}

module.exports = { decide };
