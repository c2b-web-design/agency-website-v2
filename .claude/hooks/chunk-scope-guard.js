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
 *   - editing a file outside the chunk's declared scope
 *   - editing an approved-foundation file the chunk did not name
 *
 * WHAT IT CANNOT ENFORCE — stated so the gap is not mistaken for covered
 * ------------------------------------------------------------------------
 *   - a coupled value implemented as an independent overlay
 *   - a derived value that lost its source behaviour's condition
 *     (the 24 July reduced-motion defect was exactly this, and no path
 *      check would ever have caught it)
 *   - visual drift from the intended result
 * Those need judgement and stay with checkpoint review and with Carl.
 *
 * FAIL-OPEN, DELIBERATELY
 * -----------------------
 * With no scope file present the hook allows everything. Scope enforcement is
 * opt-in per chunk: Carl or the Architect writes the scope file when a chunk
 * starts. A hook that blocked by default would make every unscoped session
 * unusable, and an unusable control gets disabled — which is worse than one
 * that is honestly narrow.
 */

const fs = require("fs");
const path = require("path");

const SCOPE_FILE = path.join(
  __dirname, "..", "..",
  "project-intelligence", "live-work", "chunk-scope.json"
);

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

  let scope;
  try {
    if (!fs.existsSync(SCOPE_FILE)) ALLOW(); // no chunk scoped — opt-in
    scope = JSON.parse(fs.readFileSync(SCOPE_FILE, "utf8"));
  } catch {
    ALLOW(); // a malformed scope file must not block all work
  }

  if (scope.active === false) ALLOW();

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
