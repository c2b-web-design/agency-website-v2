/**
 * ⚠⚠ THE REVEAL-RATIO READ — SHARED BY THE INSTRUMENT AND BY ITS PERTURBATION
 * CONTROL, DELIBERATELY.
 *
 * The control asks *"does attaching this read change what it measures?"* If the
 * control ran a different read from the instrument, it would answer that
 * question about code nobody ships. **One function, both callers.**
 *
 * ══ WHAT IT READS, AND WHAT IT REFUSES TO DO ══
 *
 * ⚠ IT TOUCHES NO PAGE GLOBAL. No `Object.defineProperty`, no wrapping, no
 * proxying, no monkey-patching of `performance.mark`. **That is the specific
 * mechanism that failed on 17 August**, when a probe wrapped `__revealStart` in
 * an accessor and a live, reproducible defect stopped reproducing for four
 * consecutive runs — then reproduced instantly once the instrumentation came
 * off. Fifth blind instrument in three days, in this exact area.
 *
 * ⚠ NO PER-FRAME POLL. The ratio needs two timestamps per question, not a
 * progress curve. This sidesteps the unmeasured-cost problem in the reveal
 * instrument spec §6 rather than inheriting it — `getComputedStyle` on an
 * animating property is a forced-recalc candidate and is NOT used here.
 *
 * ⚠ READ AT REST, after the question's ladder has completed — never during the
 * wipe it measures.
 *
 * ══ THE ANIMATION LOOKUP ══
 *
 * ⚠ MATCHED BY NAME, NEVER BY INDEX. `getAnimations()[0]` is order-dependent; a
 * transition on this element would hand back the wrong clock. The component's
 * own anchor does exactly this and the harness must not be laxer than the code
 * it checks.
 *
 * ⚠ THE DURATION COMES FROM `getTiming()`, NEVER FROM A LITERAL. A typed 1300 is
 * correct today at every width and stops being correct the moment
 * `Q5_REVEAL_MS` is tuned — and it is marked PROVISIONAL under D-035. The
 * stronger reason is `q5-stutter.mjs`, which took its window from the fix's own
 * constant and reported 0/3 CLEAN on a defect Carl could plainly see.
 */

/** Evaluated in the page. Returns the reveal's window and this question's beats. */
export const READ_REVEAL = () => {
  const el = document.querySelector(".enquiry-q-text-reveal");
  const anim = el
    ?.getAnimations?.()
    .find((a) => a.animationName === "enquiry-mask-reveal-horizontal");

  const q = window.__activeQ ?? null;
  const key = q === null ? null : `Q${q}`;

  // ⚠ THE QUESTION-KEYED TWIN, `card-qbeat-<rung>-Q<n>` (a8996b7). The bare
  // `card-beat-<rung>` marks carry NO question and cannot be attributed after a
  // step — reading those would report Q5's ladder at every question, which is
  // the exact defect that trace identity was added to remove.
  const beats = performance
    .getEntriesByType("mark")
    .filter((m) => key && m.name.startsWith("card-qbeat-") && m.name.endsWith(`-${key}`))
    .map((m) => ({
      name: m.name,
      rung: Number(m.name.replace("card-qbeat-", "").replace(`-${key}`, "")),
      t: m.startTime,
    }))
    .sort((a, b) => a.rung - b.rung);

  return {
    q,
    revealElPresent: !!el,
    revealStart: anim && typeof anim.startTime === "number" ? anim.startTime : null,
    revealDuration: anim ? Number(anim.effect.getTiming().duration) : null,
    animationName: anim ? anim.animationName : null,
    beats,
  };
};

/**
 * The ratio: where card 1 lands inside the reveal's envelope, as a percentage.
 *
 * ⚠ THE RATIO IS THE HEADLINE, NOT THE MILLISECONDS. Carl's instruction is
 * relational — card 1 at the reveal's MIDPOINT — and `CARD_FIRST_ENTRANCE_MS` is
 * `Q5_REVEAL_MS / 2` precisely because of that. A ratio survives a retune; 650ms
 * does not. Absolute figures are reported BESIDE it, never instead of it.
 *
 * Returns `null` when it cannot be computed, and the caller must treat that as a
 * FAILURE rather than as 0% — a missing reveal and a reveal at position zero are
 * not the same finding.
 */
export function ratioOf(reading, firstRungMs) {
  if (!reading || reading.revealStart === null || !reading.revealDuration) return null;
  const first = reading.beats.find((b) => b.rung === firstRungMs);
  if (!first) return null;
  return {
    intoRevealMs: first.t - reading.revealStart,
    pct: ((first.t - reading.revealStart) / reading.revealDuration) * 100,
  };
}
