/**
 * verify/lib/args.mjs — positional argument parsing and the zero-run guard.
 *
 * WHY THIS EXISTS
 * ---------------
 * `const RUNS = Number(process.argv[2] ?? 3)` appears in 33 scripts in this
 * folder. It is wrong in a specific and quiet way: when the script is invoked
 * with a FLAG in the first position — `one-context.mjs --falsify` — argv[2] is
 * the STRING "--falsify", which is not undefined, so `??` never reaches the
 * default, and Number("--falsify") is NaN.
 *
 * ⚠⚠ NaN DOES NOT PRODUCE A BAD NUMBER. IT PRODUCES A SILENT NO-OP.
 * `for (let run = 1; run <= NaN; run++)` never executes its body. No browser is
 * launched, no page is loaded, nothing is measured. The runs array stays empty
 * and every count downstream reads NaN.
 *
 * ⛔ AND ON one-context.mjs THAT REACHED BOTH VERDICTS, WRONGLY, BY TWO ROUTES:
 *
 *   FALSIFY MODE — the pass condition is inverted (`bad === RUNS`, every run
 *   must fail). With bad=0 and RUNS=NaN that is false, so the script exits 1.
 *   ⛔ A RED. And a red from falsify mode is precisely the artefact a
 *   proven.json entry is filed from — a manufactured proof that the instrument
 *   can go red, produced by a script that never opened a browser.
 *
 *   NORMAL MODE — the `bad > 0` failure branch is skipped, so the script falls
 *   through to its line-leading `✅ VERDICT` and exits 0. ⛔ A CLEAN PASS,
 *   matched by run.mjs's PASS_MARK, from a script that measured nothing.
 *
 * ⚠ THE SECOND IS CURRENTLY MASKED, NOT ABSENT. one-context.mjs is not in
 * proven.json, so run.mjs suppresses its pass. Filing the entry REMOVES that
 * mask. Fixing the parse without this guard therefore arms the worse path:
 * the guard must land first, and it must be impossible to skip.
 *
 * ⚠ 0 IS NOT NaN. `Number.isNaN(RUNS)` alone misses `one-context.mjs 0`, which
 * collapses identically — same empty loop, same false green. The predicate has
 * to be "a whole number of at least 1", not "not NaN".
 *
 * THE CORRECT PARSE ALREADY EXISTED IN THIS FOLDER and was never propagated:
 * `reveal-stall-measure.mjs:135` guards with
 * `process.argv[2] && !process.argv[2].startsWith("--")`. Thirty-three
 * hand-written copies is how thirty come out right and three come out subtly
 * wrong — which is exactly what the 27 August survey found.
 *
 * ⚠ WHAT THIS MODULE IS NOT
 * -------------------------
 * It is not a general argument parser and must not grow into one. It does one
 * job: get the positional arguments out from among the flags, and refuse to
 * continue when the resulting count cannot describe a real run.
 *
 * ⚠ IT IS NOT AN emptyInput CONTROL. A guard that prints NO RUNS EXECUTED
 * looks like a ready-made absence-report for every runs-based harness. It is
 * not one yet. proven.json requires a control to be EXERCISED and WRITTEN UP,
 * not merely to exist — a capability is not a run.
 */

/**
 * Positional arguments, with flags and their values removed.
 *
 * ⚠ FLAGS THAT TAKE A VALUE MUST BE DECLARED, or their value is mistaken for a
 * positional. `card-position.mjs --save baseline` would otherwise report
 * "baseline" as the width. Pass those flag names in `valueFlags`.
 *
 * @param {string[]} argv       Typically process.argv.slice(2).
 * @param {string[]} valueFlags Flags whose NEXT argument is their value.
 */
export function positionals(argv, valueFlags = []) {
  const out = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      // Skip the flag, and its value too when the flag takes one.
      if (valueFlags.includes(a)) i += 1;
      continue;
    }
    out.push(a);
  }
  return out;
}

/**
 * Parse a positional whole-number argument and REFUSE to continue if it cannot
 * describe a real run.
 *
 * ⚠⚠ THIS EXITS THE PROCESS. That is the point. Returning a sentinel would put
 * the decision back in the caller, which is the arrangement that produced the
 * defect — every caller has to remember, and one of them will not.
 *
 * ⛔ IT MUST BE CALLED BEFORE ANY MODE LOGIC. The message deliberately carries
 * no falsify framing, no pass wording and no fail wording, so it cannot be read
 * as any verdict in any mode. classify() in run.mjs collapses every non-zero
 * exit to "fail", so the EXIT CODE cannot carry this distinction through the
 * front door — exit 2 and exit 1 both render as "⛔ FAILURE". The TEXT is what
 * protects whoever is deciding whether to file a proof; the code is for direct
 * callers and CI.
 *
 * @param {string|undefined} raw   The positional argument as typed.
 * @param {number}           dflt  Value when the argument is absent.
 * @param {object}           opts  { name, usage, min }
 * @returns {number} A validated whole number >= min.
 */
export function wholeNumberArg(raw, dflt, opts = {}) {
  const { name = "run count", usage = null, min = 1 } = opts;
  const value = Number(raw ?? dflt);

  if (!Number.isInteger(value) || value < min) {
    console.error(`
⛔ NO RUNS EXECUTED — bad ${name}: ${JSON.stringify(raw)} → ${value}
${usage ? `  Usage: ${usage}\n` : ""}  Expected a whole number >= ${min}.

  Nothing was measured and no browser was launched.
  ⛔ THIS IS NOT A VERDICT — not a pass, not a failure, and above all NOT a
     falsification. Do not file a proof from this run.
`);
    process.exit(2);
  }
  return value;
}
