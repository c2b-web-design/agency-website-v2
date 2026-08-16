# The stray `*/` — a comment written to prevent a silent regression CAUSED one

**Found 16 August 2026.** Entered the tree in `664085a` (15 August). Fixed in `a8cee4b`.

---

## WHAT IT WAS

`app/globals.css:1848` closed a comment early:

```css
   the value to that depth dims the outgoing set WITHOUT touching the active
   question's cards at depth 0. */          ←  STRAY. The note continues below.
   ⚠⚠ SPECIFICITY IS LOAD-BEARING BETWEEN THESE TWO RULES AND THEY MUST NOT BE
   REORDERED OR RE-SCOPED CASUALLY. The 0.78 rule is `.enquiry-pdepth-1
   ...
   never fade out at all.** */
```

Lines 1849–1856 were therefore **not a comment**. The parser read
`⚠⚠ SPECIFICITY IS LOAD-BEARING…` as a selector and failed on the first internal space:

```
Expected identifier in class selector, got WhiteSpace(" ")
```

The trailing `*/` at :1856 then closed a comment that was no longer open — leaving the
file with an unmatched close (`comment balance: -1`), which is how it was located.

⚠ **THE COMMENT THAT BROKE THE RULE WAS THE COMMENT WRITTEN TO PROTECT IT.** The prose
explains that `.enquiry-pdepth-1 .enquiry-phrase-extras` (0,2,0) must not be reordered or
re-scoped, because the outgoing cards would otherwise pin at 0.78 and never fade. That
note is the thing that ate the rule.

---

## ⚠⚠ WHAT IT COST — THE RULE WAS SILENTLY DROPPED

**The malformed selector consumed the rule that followed it.** Verified in the built CSS
at `664085a`:

```
$ grep -c "\.78"  →  1
.enquiry-pdepth-1 .enquiry-phrase-travel{opacity:.78;bottom:3.625rem}
```

**That is the only `0.78` in the stylesheet.** `.enquiry-pdepth-1 .enquiry-phrase-extras
{ opacity: 0.78 }` **is absent from the production build.** The `-out` fade rule survived
(`opacity:0; transition:opacity .9s linear`), because it sits after the recovery point.

So item 2 of the split — *"the 0.78 extras dimming, restored as a STATED value"* — was
written, committed, and **never actually applied.** The extras departed from 1.0, not 0.78.
The one thing the split set out to state explicitly rather than inherit is the one thing
that did not land.

---

## ⚠⚠ NEITHER GATE CATCHES IT — THIS IS A HOLE, NOT A ONE-OFF

**`npx tsc --noEmit` and `npm run lint` do not parse CSS.** Both were run on 15 August and
both reported their expected results — tsc clean exit 0, lint the one known baseline error.
**Both passed over a file that could not serve in dev and silently lost a declaration in
production.**

The session handoff recorded those two green results as the tree's verification status.
They were accurate about what they measure and **irrelevant to this defect.** Nothing in
the standing gate set reads `globals.css` at all.

⚠ **AND THE BUILD DOES NOT CATCH IT EITHER — THIS IS THE IMPORTANT PART.**

```
$ npm run build      (at 664085a, stray present)
Found 1 warning while optimizing generated CSS:
  ⚠⚠ SPECIFICITY IS LOAD-BEARING ...
  ^-- Expected identifier in class selector, got WhiteSpace(" ")
✓ Compiled successfully in 5.5s
✓ Generating static pages (7/7)
```

**Exit 0. A successful build.** Production downgrades the parse failure to a *warning*,
drops the offending rule, and ships. Dev throws and serves **500**.

⚠ **So the two environments disagree, and the stricter one is dev.** A green
`npm run build` is NOT evidence that the CSS is well-formed. Anyone treating build success
as the gate would ship a stylesheet with rules silently missing.

**Minimum viable gate:** a CSS comment-balance check, or reading the build's CSS warnings
as errors rather than scrolling past them. The warning WAS printed. It was not acted on.

---

## WHAT THE BUILD TEST PROVED — AND WHAT IT DID NOT SETTLE

The test run today: `git stash`, `npm run build` at `664085a` exactly as committed,
`git stash pop`.

**The pre-registered reasoning was:** if the build FAILS, no build could have succeeded
with the stray present, so it must have entered after the last good build and
`664085a`'s verification stands.

⚠ **THAT BRANCH DID NOT FIRE. The build SUCCEEDED.** So the exonerating argument is
unavailable — a green build proves nothing about whether the stray was present, because
a green build happens either way.

**Therefore the second branch applies: the runtime behaviour is what matters, and dev
serves 500 with the stray present.**

### What this means for `664085a`'s verification claim

`664085a` records:

> Verified: cards hold position (Carl, by eye); all five clickable across a full walk;
> paint-order 336/336 identical; easing intact, cubic-bezier confirmed in computed style.
> Mid-corridor grid top 493 where it was 493->480 pre-split.

⚠ **THE CLAIM IS NOT DISPROVEN, AND IT IS NOT CONFIRMED.** Both readings remain open on
the evidence gathered so far:

1. **The verification stands.** The measurements were taken against a dev server holding
   a good compile from before the stray was typed. Turbopack demonstrably serves a cached
   result across edits — observed directly today, where it kept reporting
   `globals.css:2645` on a 2094-line file and never recompiled until `.next` was cleared.
   A server warm from before the stray would keep rendering a correct page.
2. **The verification is in doubt.** If the stray was present in the compile Carl looked
   at, `/start` was 500 and there was nothing to see.

**Reading 1 is the more likely** — Carl reported seeing cards, a rail and a corridor walk,
which a 500 page cannot show, and the harnesses (`card-interaction.mjs`, `paint-order.mjs`)
returned per-element geometry that a 500 page cannot produce. **Those results are hard to
obtain from a broken page.**

⚠ **BUT "likely" IS NOT "verified", AND THIS FILE WILL NOT LAUNDER IT INTO ONE.** The
distinguishing evidence — the BUILD_ID of the compile those measurements ran against —
was not recorded at the time and cannot be recovered now. **The honest statement is that
the visual and geometric verification almost certainly holds, and cannot be proven to.**

### ⚠ WHAT IS DEFINITELY WRONG IN THE RECORD, REGARDLESS

Independent of the above, **one claim in `664085a` is false and provably so:**

> Also: extras dimming restored explicitly at 0.78 (specificity is load-bearing, see comment)

**It was not restored.** The rule never reached the stylesheet. This is not a doubt about
verification method — it is a verified-false statement in a commit message, and it is
recorded here as such.

**History is not rewritten.** `664085a` stands as committed; the correction lives in
`a8cee4b` and in this file. A commit message is a record of what was believed at the time,
and the discipline is to correct it forward, not to edit the past.

---

## THE LESSON

**A load-bearing comment is executable text.** This project writes long, emphatic comments
precisely because the numbers in them are load-bearing — and that volume of prose inside a
`.css` file is itself a surface area for syntax faults. The longer the note, the more
likely a delimiter goes astray, and **the failure is silent in production.**

Related and already recorded:
- `reference_harness_sharing_a_constant_with_the_fix` — an instrument that cannot fail
- `reference_measure_before_hypothesis` — a plausible cause that measured false

**New here:** *a gate that does not read the file cannot vouch for it, and a green build
is not a well-formed stylesheet.*

---

*16 August 2026. The stray is fixed and the 0.78 rule now reaches the stylesheet.*
*⚠ The extras dimming has never actually run — it is applied for the first time at `a8cee4b`,*
*and has therefore never been seen by eye. It is unverified, not restored.*
