/**
 * verify-front-door-match — the matcher for the verify front door.
 *
 * ⚠ THIS FILE IS LOADED BY .claude/hooks/verify-front-door.js, WHICH IS THE
 * LAUNCHER REGISTERED IN settings.json. IT IS NOT A HOOK ITSELF.
 *
 * WHY THE SPLIT — found by falsification, 19 August 2026, case (d)
 * ---------------------------------------------------------------
 * A single-file hook CANNOT FAIL CLOSED on a syntax error in itself. Proved:
 * a malformed hook dies in Node's module loader (`wrapSafe`) at exit 1, before
 * one line of its own code runs, and the harness treats exit 1 as a
 * NON-BLOCKING error — so the verify command RAN. Wrapping the body in
 * try/catch does not help: A FILE CANNOT CATCH ITS OWN PARSE ERROR.
 *
 * So the guard is two files. The launcher is tiny, stable and rarely touched;
 * this file holds all the logic and is where future edits land. A parse error
 * HERE is a RUNTIME error THERE, inside the launcher's try/catch, which blocks.
 *
 * ⚠ THE LAUNCHER ITSELF STILL FAILS OPEN IF IT IS MALFORMED. Nothing can catch
 * that — it is the outermost frame. The mitigation is that it is small enough
 * to read at a glance, on the permanent protected list, and tracked, so a
 * change to it shows in a diff. That is a reviewer, not a mechanism.
 *
 * Everything this guard does, allows, and cannot enforce is documented in the
 * launcher's header. Read that file first.
 */

/**
 * ⚠ THE CRUDE FALLBACK TEST. Used ONLY when the real matcher could not run.
 *
 * Deliberately primitive: plain string operations, no require, no regex
 * construction, nothing that can throw. It answers one question — does this
 * command look like it touches verify/ at all — and errs toward blocking.
 * It is NOT the matcher and must never be used as one.
 */
function looksLikeVerifyCommand(command) {
  try {
    if (typeof command !== "string") return true; // cannot tell → block
    const c = command.toLowerCase();
    return c.indexOf("verify/") !== -1 || c.indexOf("verify\\") !== -1;
  } catch {
    return true; // cannot tell → block
  }
}

/**
 * Does this command EXECUTE a verify/ script?
 *
 * @returns {null | {segment: string, script: string}} null = allow
 */
function findOffence(command) {
  const path = require("path");

  // Interpreters that could execute a harness. `node` covers the overwhelming
  // majority; the rest are named so swapping interpreter is not a free bypass.
  const INTERPRETERS =
    "(?:node|nodejs|node\\.exe|npx\\s+tsx|tsx|ts-node|bun|deno\\s+run)";

  // A path landing inside verify/ — bare, ./-prefixed, or absolute (POSIX or
  // Windows, either slash).
  const VERIFY_PATH =
    "(?:[.\\/\\\\]*|[A-Za-z]:[\\/\\\\]|(?:[^\\s;|&]*[\\/\\\\])?)" +
    "verify[\\/\\\\]" +
    "([^\\s;|&\"']+)";

  // The runner itself is the gate, not a bypass around it.
  const IS_RUNNER = /^run\.mjs$/i;

  // Commands that only READ a file are not execution. This hook governs
  // running a harness, not looking at one — blocking `cat verify/x.mjs` would
  // obstruct the reading that precedes every honest fix.
  const READ_ONLY =
    /^\s*(?:cat|head|tail|less|more|sed\s+-n|grep|rg|ls|dir|wc|file|stat|find|awk|cut|sort|uniq|diff|git)\b/;

  // `npm run verify` in any form is the compliant route, whatever follows.
  if (/\bnpm\s+run\s+verify\b/i.test(command)) return null;

  // Split compound commands so a harness behind && or a pipe is still seen.
  const segments = command
    .split(/(?:\|\||&&|[;\n|&])/g)
    .map((s) => s.trim())
    .filter(Boolean);

  const viaInterpreter = new RegExp(
    "(?:^|\\s)" + INTERPRETERS + "\\s+(?:--?[\\w-]+(?:=\\S+)?\\s+)*" + VERIFY_PATH,
    "i"
  );
  const direct = new RegExp(
    "(?:^|\\s)(?:\\.?[\\/\\\\]|[A-Za-z]:[\\/\\\\])\\S*verify[\\/\\\\]([^\\s;|&\"']+)",
    "i"
  );

  for (const segment of segments) {
    if (READ_ONLY.test(segment)) continue;
    for (const re of [viaInterpreter, direct]) {
      const m = segment.match(re);
      if (!m) continue;
      const script = path.basename((m[1] || "").replace(/[\\/]+$/, ""));
      if (!script) continue;
      if (IS_RUNNER.test(script)) return null; // the runner IS the front door
      return { segment, script };
    }
  }
  return null;
}

function denialMessage(hit) {
  return (
    `VERIFY FRONT DOOR: this command runs a verify/ harness directly, which ` +
    `skips the verdict gate.\n\n` +
    `Command : ${hit.segment}\n` +
    `Script  : verify/${hit.script}\n\n` +
    `USE INSTEAD:\n\n    npm run verify -- ${hit.script}\n\n` +
    `WHY: verify/run.mjs suppresses a PASS from a harness with no recorded ` +
    `red run. Only 2 of 130 scripts have one, so most passes are not ` +
    `admissible as evidence — and running the script directly prints the raw ` +
    `verdict as though it were. Every expensive instrument failure in this ` +
    `project failed toward a PASS: q5-stutter.mjs read 0/3 CLEAN on a stall ` +
    `Carl could see; one-context.mjs read 2/2 while a WebGL context was ` +
    `created on every question.\n\n` +
    `NOTHING IS BLOCKED FROM RUNNING. The gate still runs the script and ` +
    `still prints every number. It governs what may be called EVIDENCE. A ` +
    `FAILURE always passes through unchanged — a red from an unproven ` +
    `instrument still means go and look.\n\n` +
    `If the front door is genuinely wrong for this call, stop and ask Carl. ` +
    `Do not route around it.`
  );
}

module.exports = { findOffence, denialMessage, looksLikeVerifyCommand };
