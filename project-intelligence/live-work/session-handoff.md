# Session Handoff — 28 August 2026. The verify harness was repaired, and it now reports 0 proven.

**Read this first, then `project-intelligence/` as normal.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written** —
`live-work-protocol.md` §3a.

---

# ⛔⛔ START HERE: THE ONE THING OWED FROM LAST SESSION

⛔ **`verify/reveal-stall.mjs` HAS NOT BEEN RUN SINCE ITS OUTPUT WAS CHANGED.**

Nothing was listening on :3100 and standing up a production build was outside that chunk.

- **Expected:** `⚠ NO VERDICT DETECTED`, **exit 3**. ⛔ **That is CORRECT, not a new fault** — the
  script reports no verdict, it films. **Do not "fix" it back.**
- **How:** `rm -rf .next && npm run build`, then `npx next start -p 3100`, then
  `npm run verify -- reveal-stall.mjs 1`.

⚠⚠ **THIS IS THE ONLY CLAIM FROM LAST SESSION RESTING ON INFERENCE RATHER THAN OBSERVATION.**
Everything else was exercised. The verdict was confirmed as `none` by running the real
`classify()` against the real output literal — but the script itself was never launched.

---

# ⛔⛔ THE PROVEN LIST IS 0. NO HARNESS PASS IS ADMISSIBLE

⚠ **Read this before you trust any green from `verify/`.**

`verify/proven.json`'s `proven` array is **empty**. Its single entry was demoted (D-064).

- ⛔ **`verify/` cannot currently certify that anything is RIGHT.**
- ✅ **It can still tell you something went RED** — reds always pass through unchanged, proven or
  not. That is deliberate: *"an unproven instrument can still be right when it complains."*

⚠ **THIS IS THE TRUE STATE MADE VISIBLE, NOT A REGRESSION.** It was already true in substance;
the list merely disagreed. **Restore route: D-064** — two separate entries, `reveal-stall-measure.mjs`
first, each earned against current HEAD. ⛔ **Do not re-file the old credential.**

---

# WHAT LANDED — THREE COMMITS, ALL PUSHED TO `main`

⚠⚠ **EVERY PUSH TO `main` DEPLOYS TO VERCEL.** All three touch `verify/` only, which has no import
path into the app, so the deploys were no-ops. **That will not be true of the next chunk.**

| commit | what |
|---|---|
| `a374aa2` | **defect 3** — a flag in `argv[2]` made `RUNS` NaN |
| `301b605` | **defects 1 and 2** — a prose ⛔ read as a product failure |
| `843eee4` | **defect 4** + **D-064** — the credential described the wrong script |

## Defect 3 — the symptom was understated in the 27 August writeup

`Number(process.argv[2] ?? 3)`. Invoked as `one-context.mjs --falsify`, `argv[2]` was the *string*
`"--falsify"`, so `??` never reached the default.

⛔ **NaN DID NOT PRODUCE A BAD NUMBER — IT PRODUCED A SILENT NO-OP.** `1 <= NaN` is false, so the
loop never ran. **No browser, no page, nothing measured.** It then reached **both** verdicts:

- **falsify mode** → exit 1. ⛔ **A RED — the exact artefact a `proven.json` entry is filed from.**
- **normal mode** → fell through to the line-leading `✅` and exit 0. ⛔ **A GREEN**, masked only
  by the script being unproven. ⚠ **Fixing the parse without the guard would have ARMED it.**

**Fixed in `verify/lib/args.mjs` (new, shared).** ⚠ **`0` is not `NaN`** — the predicate is
*whole number ≥ 1*, not `Number.isNaN`. **Applied to the 3 acute files; 30 latent ones are fixed
as each is next touched.**

## Defects 1 and 2 — and what was deliberately NOT done

**`FAIL_MARK` matched any line-leading ⛔ *even on exit 0*.** ⚠⚠ **COMPLYING WITH
`context-rules.md` — declare your blind spots IN THE OUTPUT — IS WHAT TRIPPED IT.**

- **Defect 1 → `"disagree"`, a fourth outcome, exit 4.** Suppresses the pass **without
  manufacturing a red.** Checked *before* the proven/unproven split.
- **A `##VERDICT: PASS|FAIL|NONE` sentinel** was added. When present the markers are not consulted
  at all. ⚠ **DEFINED BUT UNEMITTED — untested in a real run.**
- ⛔ **Defect 2 was NOT fixed, and that is a ruling.** 38 harnesses print `✅` only mid-line and
  report `NO VERDICT` (exit 3) — **the fail-closed direction.** Loosening `PASS_MARK` was rejected
  on recorded evidence: an earlier looser pattern read a passing fixture as failed on the word
  *"drift"*. **Sentinel adoption rides on admission, not a 131-file sweep.**

---

# ⚠⚠ THE MOST TRANSFERABLE THING THIS SESSION — DEFECT 1 RECURRED THREE TIMES, INSIDE ITS OWN FIX

**Writing the replacement message for `reveal-stall.mjs` tripped the very defect being fixed.**

| attempt | what happened |
|---|---|
| the brief's wording | wrapped so **`fail` began a line** → `FAIL_MARK` matched → **`disagree`** |
| my first rewrap | put **`PASS` at a line start** → `PASS_MARK` matched → ⛔ **`pass`, a FALSE GREEN — worse** |
| final | no verdict word begins any line; **the file says so in its own text** |

⛔ **WHILE VERDICTS ARE INFERRED FROM PROSE, WRITING ENGLISH NEAR A HARNESS IS A HAZARD.**
⚠ **This is the strongest argument for the sentinel.** The honest declaration for that script is
**`##VERDICT: NONE`** — a one-line follow-up, `reveal-stall.mjs` is unprotected.

⚠ **AND IT IS WHY THE BRIEF'S PREDICTED RESULT WAS WRONG.** The Architect's brief said the new
text would yield `NO VERDICT DETECTED`. **As written it did not.** ⛔ **Verify a predicted verdict
by running the real `classify()` against the real output — do not trust the prediction.**

---

# ⚠ CORRECTIONS MADE TO THE RECORD

- ⛔ **Defect 3 was NOT a `run.mjs` defect.** Both the 27 August handoff and its writeup filed it
  there. The cause was `one-context.mjs:97`, **which is not protected** — so it needed **no unlock
  at all.** `verify-runner-defects-27-august.md` now carries a correction header.
- ⚠ **The 27 August writeup called defect 3 a cosmetic `NaN`.** It was a silent no-op reaching
  both verdicts. Corrected in the same header.

---

# ⚠ ENVIRONMENT — NEW TRAPS FOUND THIS SESSION

- ⚠⚠ **`Edit`/`Write` CONVERT FILES TO CRLF.** `one-context.mjs` and `card-position.mjs` were
  flipped whole-file. ⛔ **`core.autocrlf=true` normalised it on staging so nothing bad was
  committed — but that is a CONFIG SETTING, not a check.** Verify staged blobs with
  `git cat-file blob $(git rev-parse :path)` before committing.
- ⚠⚠ **NOT EVERY `.md` HERE IS CRLF.** The 27 August handoff said "every `.md` is CRLF".
  **`verify-runner-defects-27-august.md` is LF.** ⛔ **Check each file individually.**
- ⚠ **The front-door hook blocks `node --check verify/*.mjs`** — it pattern-matches the text, not
  the intent, so there is **no clean way to syntax-check a harness.** It also fires on a `grep`
  whose *pattern string* contains `node verify/...`. **Do not route around it.**
- ⚠ **`chunk-scope.json` narrowing is real and bites.** With a `files` array set, writing a test
  fixture into `verify/` was **denied** — which is the mechanism working.

---

# STILL OPEN — CARRIED, NOT ADDRESSED THIS SESSION

- ⛔ **D-048's PROPAGATION HALF — five recorded instances, still no holder.**
- **`components/enquiry-opening.md`** — reads as current, stops at **D-033**; the whole
  D-046 → D-056 layer is absent, with **two contradicting "Known Issues" sections.**
- **The 758ms attribution** — contested in `decisions.md` (D-046, D-048) and `current-sprint.md`,
  adjudicated in neither. ⚠ **The dispute is about the MECHANISM, not the magnitude.**
- **`ai-roles.md:448`** — footer still reads `Last updated: 2026-08-13`.
- ⚠ **`live-work-protocol.md` §3b does not name `evidence/`.**
- ⚠ **The `<img>` lint warning — THREE instances, one per mark.** The `next/image` conversation is
  still not had. **D-060 left it open deliberately.**
- **Three unexamined Codex artefacts:** four PNGs at `~/.codex/generated_images/019fb2e1-…`;
  `Documents\Codex` (66,526 files); `codex-pasted-text-archive` + `memories_1.sqlite`.

---

# ⛔ THE NEXT SUBJECT: THE `/about` PAGE — STILL NOT AUTHORISED

**Carl's order of 27 August was: verify runner first, THEN `/about`.** ⛔ **The runner is done.**

⚠⚠ **BUT "NO CHUNK IS AUTHORISED" IS UNCHANGED AND DID NOT LIFT WITH THE PAUSE.** It is the
permanent arrangement. ⛔ **The runner being finished does not authorise `/about`** — Carl
authorises it, and he researches with the Strategist and the Architect first, then puts the
Builder in **PLAN MODE**.

**The brainstorm, the "show don't tell" intent and the four parts are recorded in full in the
27 August handoff's own record — and the gate is unchanged:**

- **`app/about/page.tsx` — EDITABLE.** The route does not exist; creating it touches nothing.
- ⛔ **`components/layout/site-header.tsx` — PROTECTED.** Changing `href="#"` → `/about` needs
  Carl to name that exact path under `"unlocked"` in `live-work/chunk-scope.json`.
- **A two-part job with a gate in the middle.**

---

## STATE AT SESSION END

- **Working tree clean. `main` = `843eee4`, fully pushed.**
- **Lint: 1 error, 4 warnings — the known baseline, unchanged.** `tsc --noEmit` clean.
- ⛔ **NO UNLOCK IS LIVE.** `chunk-scope.json` deleted; **both locks re-verified by observing a
  REAL DENIAL**, not by assumption.
- **Nothing running on :3100.**

---

*28 August 2026. **Four defects fixed across three commits. The harness that guards every other
harness was itself reaching both verdicts from zero measurement — and the fix for it tripped the
defect it was fixing, twice, before it was written correctly.***
