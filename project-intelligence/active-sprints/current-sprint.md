# Current Sprint — Sprint 2

---

## Sprint Goal

Build the homepage to a complete, production-quality state and begin the `/start` guided enquiry experience. Establish the visual and interaction foundation that the rest of the site will extend.

## Sprint Period

2026-05-23 → Open

---

## Completed

| Task | Output | Notes |
|---|---|---|
| Governance normalization | `context-rules.md`, `decisions.md`, `handoff-protocol.md` | Status vocabulary unified — `Active` replaced by `APPROVED` throughout |
| D-004 authority corrected | `decisions.md` D-004 DEPRECATED, D-010 added | Human Founder re-attributed as authority; history preserved |
| D-011 logged | `decisions.md` | Geist font loading pattern — `<html>` not `<body>` |
| Sprint 1 archived | `active-sprints/archive/sprint-1.md` | Archive structure created |
| Font variables applied to `<html>` | `app/layout.tsx` | Resolves R-001 F-001 — see D-011 |
| `--font-sans` circular reference fixed | `app/globals.css` | Resolves R-001 F-002 — `--font-heading` also corrected |
| Services section | `app/page.tsx` | D-012 service model: Premium Website Design, Website Transformation, Intelligent Enquiry Systems, Ongoing Growth & Improvement — 2-col card grid |
| Work/Proof section | `app/page.tsx` | D-013: agency website as first proof piece — 3-col card grid: Design Standard, Business Thinking, Modern Capability |
| Final CTA section | `app/page.tsx` | D-014: consultative closing invitation; links to `/start` |
| `/start` Stage 1 opening reveal | `components/enquiry/enquiry-opening.tsx`, `app/globals.css` | D-015: legato clip-path mask sequence; Begin button; ~11.5s phrase; full reduced-motion support |
| `/start` Stage 2 — Q5 guided question | `components/enquiry/enquiry-opening.tsx`, `app/globals.css` | D-016: multi-select cards, Q5 orientation cue, frosted glass card surface, "Next step" trigger |
| Q5 → Q4 transition design | `project-intelligence/decisions.md` | D-017: layered attention model, Q4 question and options, motion principles, open items documented |
| Wire "Next step" to Q4 | `components/enquiry/enquiry-opening.tsx`, `app/globals.css` | D-018: Q5 settles into compact memory summary; Q4 single-select enters with calm overlap; full reduced-motion support |
| Refine Q5 memory field + Q4 options | `components/enquiry/enquiry-opening.tsx`, `app/globals.css` | D-019: bounded quiet memory field (card echoes replace compact text); Q4 reduced to 5 options; three-layer hierarchy enforced with `.enquiry-context-faintest` |
| Q5 → Q4 handoff motion correction | `components/enquiry/enquiry-opening.tsx`, `app/globals.css` | D-020: per-element settling transitions + spatial recede; seamless DOM swap at 1200ms; static transform on memory field |
| Q5 → Q4 choreography correction | `components/enquiry/enquiry-opening.tsx`, `app/globals.css` | D-021: transform-origin: top center (eliminates DOM-swap jump); compact memory field (q5Selections only, no placeholders); Next step scrollIntoView with reduced-motion support |
| Persistent Q5 element + compact memory rail | `components/enquiry/enquiry-opening.tsx`, `app/globals.css` | D-022: persistent Q5 DOM node (no unmount/remount — eliminates snap); q5Phase state model; chip-style memory echoes (.enquiry-memory-chip, reusable pattern); opening context chain reaction; Q4 layout-first + block:nearest safety scroll |
| Shared corridor architecture | `components/enquiry/enquiry-opening.tsx`, `app/globals.css` | D-023: shared CSS variables for corridor depth; opening heading + Q5 + Q4 three-slot corridor proved and approved |
| Full Q5→Q1 corridor + completion state | `components/enquiry/enquiry-opening.tsx`, `app/globals.css` | D-024: all five questions complete; Q labels match question size at all depths; "Understood" completion handoff; Send button position; Begin/Next step/Send visibility consistent |
| Mobile nav | `components/layout/header.tsx` | Mobile header navigation and opening reveal refinements approved |
| Homepage + start flow QA polish | `app/page.tsx`, `components/enquiry/enquiry-opening.tsx` | Milestone commit 2152e6e — all sections and flow mechanics approved |
| Selected-card filament border | `components/enquiry/enquiry-opening.tsx`, `app/globals.css` | D-029: single SVG rect, pathLength="1", draw on select, hold completed border, fade on deselect. Muted Q-label gold. Approved Q5–Q1. See R-011. |
| `/about` scaffolding | `app/about/page.tsx` (new), `components/layout/site-header.tsx` (one line) | **D-066.** The dead `href="#"` is fixed; the page exists with four sections mirroring the landing page — the fourth a rendered **TBD** Carl authorised knowing it deploys. Mark gold and nailed: **left/top identical across `/`, `/start`, `/about` at 1440 AND 375**, centre spread 0.0058px h / 0.0000px v, measured **headed**. ⚠ **Scaffolding, not the About section.** ⛔ **No `SiteHeader` on `/about`** — the header question is Carl's next body of work. ⛔ **Invariant still UNASSERTED**; no harness added (`proven.json` is empty). Unlock opened and **closed with a verified denial**. |

---

## Sprint 2 Closed — Milestone 2152e6e

Sprint 2 is complete. All success criteria met. Milestone commit: **2152e6e** (2026-06-14).

**Closed criteria:**
1. Homepage production-quality at all breakpoints — complete
2. `/start` Stage 1 opening reveal approved — complete
3. `/start` Stage 2 Q5 guided question approved — complete
4. Q4 transition designed, approved, and implemented — complete
5. Mobile navbar resolved — complete
6. Full Q5→Q1 corridor + completion state — complete (exceeded original scope)

---

## Current work

## ⛔ BUILDING HAS RESTARTED — 27 August 2026. THE PAUSE IS LIFTED

**Carl, 27 August 2026, stated explicitly and confirmed when restated back.** Ruling recorded
as **D-061**.

The pause stood from **25 July 2026** and was reaffirmed on 21 August. It is ended by the only
thing that could end it: **Carl saying so.** The exit condition ran in its stated sequence and
completed — governance work, then the working-process session (**D-059** came out of it), then
the explicit restart.

### ⛔⛔ WHAT DID NOT LIFT WITH IT

⛔ **"NO CHUNK IS AUTHORISED" IS UNCHANGED. It was never part of the pause.**

It is **the permanent arrangement, not a pause condition** — it does not expire and it is not
dated. **No chunk is ever authorised until Carl authorises one**, and that is as true now that
building has restarted as it was before.

⚠ **THE FAILURE MODE THIS GUARDS AGAINST IS SPECIFIC:** reading *"building has restarted"* as
*"therefore I may begin building"*. ⛔ **It does not follow.** The pause governed **whether**
new building could happen at all; the chunk rule governs **what** may be built and **when it
may start.** **Two separate controls. Only one moved.**

### The verify runner — FOUR DEFECTS FIXED, 28 August 2026

**The first item of the session on Carl's ruling of 27 August, and the pre-condition for
trusting anything `verify/` says.** Three commits, all pushed to `main`.

| commit | defect | file |
|---|---|---|
| `a374aa2` | **3** — a flag in `argv[2]` made `RUNS` NaN | `verify/lib/args.mjs` (new) + 3 harnesses |
| `301b605` | **1 and 2** — a prose ⛔ read as a product failure | `verify/run.mjs` |
| `843eee4` | **4** — the proven credential described the wrong script | `verify/proven.json`, `reveal-stall.mjs` |

⚠ **Reasoning: D-064** (defect 4) and the commit messages. Not repeated here.

**Defect 3 — `Number(process.argv[2] ?? 3)`.** Invoked as `one-context.mjs --falsify`, `argv[2]`
was the *string* `"--falsify"`, so `??` never reached the default. ⛔ **NaN did not produce a bad
number — it produced a SILENT NO-OP:** `1 <= NaN` is false, so the loop never ran. No browser, no
measurement. It then reached **both** verdicts wrongly — a red in falsify mode (the artefact a
proof is filed from) and a **green** in normal mode. Guard lands before the parse, exits 2.

**Defects 1 and 2 — `FAIL_MARK` matched any line-leading ⛔ even on exit 0.** ⚠⚠ **Complying with
`context-rules.md` — declare your blind spots IN THE OUTPUT — is what tripped it.** Now returns a
fourth outcome, **`"disagree"`** (exit 4), which suppresses the pass without manufacturing a red.
A **`##VERDICT:` sentinel** was added so a harness can declare its result instead of having it
inferred. ⛔ **Defect 2 deliberately NOT fixed** — the 38 harnesses printing `✅` mid-line fail
*closed*, and sentinel adoption rides on admission rather than a 131-file sweep.

**Defect 4 — `proven.json`'s one entry named `reveal-stall.mjs`, which FILMS.** Every arm of the
proof came from `reveal-stall-measure.mjs`. **Demoted, not re-filed** — full reasoning in D-064.

### ⛔⛔ THE PROVEN LIST IS 0. NO HARNESS PASS IS ADMISSIBLE

⚠ **This is the true state made visible, not a regression.** `verify/` can still tell you
something went **red** — reds always pass through unchanged. ⛔ **It cannot currently certify that
anything is right.** Restore route: **D-064**, `reveal-stall-measure.mjs` first.

### ✔ VERIFIED ON A LIVE BUILD — nothing is owed

⛔ **`reveal-stall.mjs` WAS RUN** against a clean production build on :3100 (build
`iOsmvS1MD1SxA1PjrhCFd`, ANGLE / AMD Radeon, 1440x900). **Result exactly as predicted:
`⚠ NO VERDICT DETECTED`, exit 3.** ⛔ **Correct, not a fault — the script films, it does not
report a verdict. Do not "fix" it back.**

⚠⚠ **THE WHOLE CHAIN WAS EXERCISED.** `reveal-stall-measure.mjs` was then run on that film and
behaved correctly as the measuring pass — a real `── DISTRIBUTION, 1 of 1 runs ──`, freeze found
at **200ms (bounded 200-240)**, blind-spot caveat printed, exit **1**, passed through unsuppressed
as a red from an unproven instrument.

⚠ **That is defect 4 shown corrected from BOTH ENDS in one run.** The filming pass now yields no
verdict; the measuring pass produces the real one. **Before the fix it was exactly backwards.**

- **The `##VERDICT:` sentinel is defined but unemitted** — untested in a real run. The honest
  one-line follow-up is `##VERDICT: NONE` in `reveal-stall.mjs` (unprotected).

⚠ **Both protected-path unlocks were closed and RE-VERIFIED BY OBSERVING A REAL DENIAL** —
`verify/run.mjs` and `verify/proven.json`. `chunk-scope.json` is deleted; no unlock is live.

---

### The logo work — DONE on `/start`, 27 August 2026

**The gold mark is top-left on the landing page and on `/start`, and on `/start` it changes
colour by section: gold → blue → gold.** Approved by Carl's eye on a running production build.

⚠ **Reasoning, measurements and the rejected alternatives: `decisions.md` D-062 and D-063.**
Not repeated here.

| Section | Mark | Changes on |
|---|---|---|
| Opening | Gold | — |
| Q+A | Platinum-blue | the Begin press |
| Client info | Gold | the start of the completion fade |

- **D-062** — the mark alone on `/start` (no header, no nav, no text), and
  `scrollbar-gutter: stable` site-wide, which is what made the two pages agree.
- **D-063** — the colour journey, the nail, the radial edge, and the easing that was built and
  rejected on measurement.
- **The blue asset shipped:** `public/c2b-logo-blue-mark.png`, cropped from Carl's DaVinci
  Resolve key with the floor reflection removed. Source committed alongside at
  `brand-assets/logo/`.

⚠ **THE STRUCTURAL QUESTION D-061 FLAGGED NEVER AROSE, AND THAT IS WHY.** Extending
`SiteHeader` beyond the landing page would have been structural — but ⛔ **the header is not
used on `/start` at all.** Carl's instruction narrowed to the mark alone, so only
`app/start/page.tsx` was touched. **No protected path was unlocked and none needed to be.**

⛔ **CLIENT INFO IS A SECTION, NOT A PAGE — corrected 27 August.** It is the `complete` stage on
`/start`: the four-box contact field. ⚠ **The record's "client information page not yet built"
refers to something else, and reading it as this section produced a wrong answer during the
session.**

### ⚠ Still open on the logo

- **The return to gold exists only on `/start`.** Whether a standalone client info page ever
  carries its own logo is undecided.
- **Three unasserted dependencies**, all stated in code and in D-063: the 1300ms against
  `Q5_REVEAL_CLEAR_MS`; the 1341ms margin against the field cascade's 3600ms first delay; and
  the `MARK` letterform fractions, which go stale the moment either PNG is re-exported.
- ⚠ **`app/page.tsx`, `app/layout.tsx` and `components/layout/site-header.tsx` remain PROTECTED
  PATHS.** Any future logo work touching the landing page's header still needs Carl to name the
  exact path under `"unlocked"` in `live-work/chunk-scope.json`.

**Also queued:** **four-box geometry in Three.js, on the client info page** — where sustained
work resumes.

---

### Superseded — the pause entry, preserved for its reasoning

> **BUILDING IS PAUSED — reaffirmed by Carl on 21 August 2026.** Original instruction
> 25 July 2026. ⛔ **New building restarts only when Carl says so explicitly, and he will be
> explicit.**
>
> **What the pause covers: NEW BUILDING ONLY.**
>
> **What it does not cover** — these have continued throughout and do not need the pause lifted:
>
> - governance work
> - tooling
> - documentation corrections
> - fixes to existing faults
>
> ⚠ **RECENT COMMITS ARE NOT EVIDENCE THAT THE PAUSE HAS LAPSED.** Commits have continued to
> land under approved decisions without contradicting it, because **the work they carry is
> governance, documentation, tooling or fixes to existing faults — none of which the pause
> covers.** **This file's former silence on scope is what made that look like a conflict.** Do
> not read commit activity as a restart.
>
> **The exit condition, in sequence:** the remaining governance work → a session on how Carl's
> working process with the Architect and the Builder can be improved → **Carl explicitly restarts
> building.** Not before, and not in any other order.

⚠ **Kept, not deleted.** The scope distinction it draws — that governance, tooling, docs and
fixes were never paused — is the reasoning that let work continue lawfully for a month, and it
is why the commit record does not contradict the pause.

---

### Answer card exit — DONE. Built 18 August 2026, approved 23 August

**The cards leave as a compressed reversal of their arrival.** Built **2026-08-18** —
`d008b4d`, `c831bf9`, `387653a`. Live since.

**Approved by Carl on 23 August 2026**, by eye on the running product: *"I am more than happy
with how it turned out."*

⚠ **Reasoning, mechanism and figures: `decisions.md` D-056. Review: R-019.** Not repeated here.

⚠ **It was built before it was recorded** — the spec said not authorised to build, the work went
in two days later, and no entry existed for five days. **The work is fine; the record was the
fault.** Second instance of the write-back gap at **D-048** — ⛔ **not closed by these entries.**

---

### Begin button, 7.4-second delay — CLOSED by D-055, 21 August 2026. NOT repaired

⛔ **THE GATING IS THE INTENDED DESIGN.** Carl walked a clean production build on 21 August
2026 and ruled that the Begin button is not meant to be immediately clickable. **Approved —
do not unweld it, do not decouple the hit target from the mask, and do not shorten the delay
to make the button available earlier.** Any of those is a change to approved work and needs
Carl.

⚠ **YOU WILL SEE THE DELAY IF YOU LOAD THE PAGE. That is the design working, not evidence
that this entry is stale.** The gate lifts at **+7711ms desktop** and **+10259ms mobile**,
measured 21 August 2026 on a clean production build.

**Ruling: `decisions.md` D-055. Mechanism and measurements:
`live-work/enquiry-opening-timing-reference.md`.** Not re-argued here.

#### ⚠⚠ CORRECTED 21 August 2026 — this entry said "RESOLVED". NOTHING WAS EVER FIXED

**It read:** *"~~Begin button, 7.4-second delay~~ — RESOLVED before 28 July 2026"*, and below
it, *"Carl confirmed on 28 July that this was fixed in an earlier session."*

⛔ **NO FIX WAS EVER MADE.** What happened on 28 July was **Carl looking at the button and
being satisfied with it** — the same ruling he made on 21 August, **misfiled as a fix.**

**The history this entry exists to keep, and it stands:** the Day 3 handoff and this file both
listed the delay as the first job when building resumed, and **the Builder began working from
it before Carl caught the error.** `enquiry-opening.tsx:259` and the 7400ms delay at
`globals.css:185` still exist and still gate `beginActive` on the mask's `animationstart`, so
**reading the code alone would have confirmed the record rather than corrected it.**

⚠⚠ **BUT THE 28 JULY DIAGNOSIS OF *WHY* WAS ITSELF WRONG.** It concluded the record was stale
about a **fix**. The record was stale about a **classification** — reading the code confirmed
the defect *because the mechanism is real and still there*, not because the record had decayed.

> ### ⚠ A SATISFACTION IS NOT A FIX — AND FILING ONE AS THE OTHER IS WHY THIS ITEM RETURNED TWICE.
> **"Fixed" is a claim about the build.** It decays, and anyone can refute it by loading the
> page and still seeing the delay — which is how the item came back on 19 August 2026.
> **"Approved" is a design decision.** Observing the delay *confirms* it.

### ⚠ Q5 stutter — RETURNED 9 August 2026. Largely fixed again; the 30 July EVIDENCE was void

> **Carl, 9 August:** *"Q5 stuttered half way through its reveal on first run."*
> **Commit `3a7cf1f`.** Measured on the real GPU, cold: a **~580ms freeze at +114–203ms**
> after Begin, inside a 1300ms wipe that starts at +60ms — 40 of an expected 78 frames.
>
> **Cause:** the warm-up canvas renders only while `stage === "opening"`, the real Q5 canvas
> only after it. **Mutually exclusive** — so Begin destroyed the warm WebGL context in the same
> commit that created the real one, and the real one rebuilt everything from scratch. **Shader
> compilation was not the cost** (0.2–0.5ms inside the reveal); Three.js CPU-side
> initialisation was. Fixed with a 900ms overlap on the warm node's lifetime; `stage` flips
> exactly when it always did.
>
> | | before | after |
> |---|---:|---:|
> | Worst frame gap, cold | 584ms | **86ms** |
> | Worst frame gap, warm | 591ms | **73ms** |
> | Frames of ~78 | 40 | **76** |
>
> ⚠ **NOT ELIMINATED.** ~70ms still lands in the wipe, above the ~50ms visible threshold.
> Removing it needs a canvas host that never unmounts — a restructure of approved layout,
> deliberately not attempted. **Carl by eye: *"it looks pretty clean"*.**
>
> ⚠ **AND DELETING THE WARM-UP WOULD HAVE MADE IT TWICE AS BAD.** The obvious reading — a
> WebGL context is per-canvas and dies with the node, so the warm-up buys nothing — is
> **refuted by measurement**. `verify/warmup-value.mjs`, 3 runs per arm, cold GPU profile
> each: mount→compiled is **161ms with** the warm-up and **919ms without**. ANGLE's on-disk
> binary shader cache survives the context's death and is worth ~758ms.

#### ⚠⚠ THE PARAGRAPH ABOVE IS SUPERSEDED — it reads as standing guidance and is not

**Two separate things overtook it, on two different dates, for two different reasons. They
are recorded apart on purpose.**

**1. The instruction — overtaken 18 August 2026.** ⛔ **The warm-up canvas WAS deleted**, in
commit **`98429af`**, whose own message reads *"the second context is gone, the freeze is
not"*. The second WebGL context and the redundant second link of all 17 programs went; **the
freeze survived the deletion** — median unmoved. It was run as a measured experiment, not as
a fix. **Full record, including the prediction written before the measurement:
`live-work/step5-warmup-deletion-18-august.md`.** ⚠ **Nothing here says whether deleting it
was right.** That is not what this records.

**2. The ~758ms figure — contested since 13 August 2026, and SEPARATELY.** The attribution to
ANGLE's on-disk cache is disputed by
`live-work/q5-stage1-resolution-and-cache-13-august.md` **§FINDING 2**, which puts the disk
cache's actual worth at **~53ms**. ⚠ **Contested, not settled — and not adjudicated here.
That is Carl's.**

⚠ **THE MEASUREMENT ITSELF STANDS AND IS DELIBERATELY NOT DELETED.** 161ms with / 919ms
without was really measured, and the reasoning is worth keeping. **What changed is that the
paragraph reads as a live instruction — "must not be deleted" — to a reader who will never
reach the commit that deleted it.** `live-work/` is gitignored and no rule requires reading it.

### ⚠⚠ THE 30 JULY "RESOLVED" ENTRY BELOW CITED EVIDENCE THAT NEVER TOUCHED A GPU

**`verify/q5-stutter.mjs` launched headless until 9 August 2026.** Bare `chromium.launch()`,
while fourteen other harnesses in `verify/` launch headed with `--enable-gpu` and print the
renderer string. **Headless Chromium silently substitutes SwiftShader**, which compiles all 120
shaders on the CPU — measured as a flat ~2000ms freeze, *identical on cold and warm runs*.

⚠ **So the "0/3 CLEAN, worst gap 18–36ms" table below describes a software rasteriser, not
Carl's machine. It is not evidence and must not be cited.** The `Q5_REVEAL_CLEAR_MS` 700→1300
correction it accompanied is still believed correct — it is derived from `.enquiry-q-text-reveal`
and was verified by Carl's eye — but it was never verified against a GPU.

**A second, independent defect in the same file:** its overlap assertion was
`firstCtx.at <= Q5_REVEAL_MS`, and `at` is clamped at t=0 (set just before the Begin click). A
context created *before* Begin therefore reported +0ms and tripped the flag. On 9 August it
printed **OVERLAP on all three runs while shader time inside the reveal was 0.5 / 0.2 / 0.0ms** —
the flag said guilty while the quantity it exists to detect was zero.

Both fixed in `3a7cf1f`. **This is the fifth and sixth recorded instance of this project's
harness-lies class**, after `q5-stutter.mjs`'s own 700ms window (30 July), `cross-section.mjs`'s
duplicated `BEVEL_WIDTH` and `opening-arm.mjs` running only at 1440px (both 7 August).

⚠ **AND THE CLASS HAS NOW BROADENED TWICE.** The first three were harnesses holding a stale
**copy of a value**. These two are different failures wearing the same coat:

| | the lie |
|---|---|
| **Wrong environment** | headless has no GPU, so a GPU defect is invisible by construction |
| **Wrong assertion** | the flag fired on a *pre-existing* context — a **false positive**, which sends the next session hunting a suspect the numbers had already cleared |

⚠ **A SEVENTH WAS CAUGHT THE SAME DAY, BEFORE IT COULD MISLEAD ANYONE — and how it was caught
is the transferable part.** `verify/approved-timings.mjs` was run **twice on identical code** as
a deliberate no-change control *before* being trusted. It reported four opening rows "SHIFTED"
by +74–92ms; the cause was its own t=0, measured from page load, which varies with server
warmth and font loading. Re-anchored to the opening's first reveal, the control now returns
22ms worst.

⚠ **RUN EVERY NEW HARNESS AS A NO-CHANGE CONTROL BEFORE TRUSTING IT.** A harness that reports
drift on unchanged code cannot certify a change — and had that control been skipped, an
ordinary boot-time wobble would have been read as the fix breaking Carl's constraint.

### Superseded — the 30 July entry, preserved for its reasoning, NOT for its numbers

> **The 29 July fix (`a6f84fb`) was incomplete — right cause, wrong boundary.** Completed
> 30 July. **Full record: `live-work/q5-stutter-diagnosis.md`.**
>
> **Two animations start on Begin and are not the same length:** `.enquiry-q5-block` is a
> **700ms** opacity fade; `.enquiry-q-text-reveal` is the **1300ms** wipe that reveals the
> phrase. The guard was derived from the 700ms fade. **700ms is ~54% through a 1300ms wipe**, so
> the Three.js work was pushed out of the first 700ms and into the remaining 600ms.
>
> **Carl caught it by eye:** the stutter had *moved* from the "Wh" of "What" to the "h" of
> "here". ⚠ **A moved symptom is not a fixed symptom — where it lands tells you where the work
> landed.**
>
> ⚠ **And `verify/q5-stutter.mjs` reported 0/3 CLEAN while the defect was visible**, because its
> window was the same wrong 700ms. **The harness and the fix shared one assumption, so the check
> confirmed the bug.** "Measure first" was followed and still gave a false pass, because the
> instrument carried the error. **A harness derived from the same constant as the fix is not an
> independent check.**
>
> **Fix:** `Q5_REVEAL_CLEAR_MS` 700 → **1300**, read off `.enquiry-q-text-reveal`; harness
> window likewise. No logic changed, no approved visual layer touched.
>
> | Measured across the full 1300ms phrase, 3/3 runs | 700ms | **1300ms** |
> |---|---:|---:|
> | WebGL context created | +825–841ms | **+1438–1446ms** |
> | WebGL ms inside the phrase | present | **0.0ms** |
> | Worst frame gap | 81ms | **18–36ms** |
>
> Reduced motion still correct — `.enquiry-q-text-reveal` is disabled under
> `prefers-reduced-motion` (globals.css:1420), verified 30 July.

**Superseded entry, preserved — the incomplete 29 July fix:**

### Q5 stutter — CAUSE MEASURED, FIX APPLIED 29 July 2026. Awaiting Carl's eye

> **Commit `a6f84fb`.** Full record: `live-work/q5-stutter-diagnosis.md`. Harness:
> `verify/q5-stutter.mjs`.
>
> **The hypothesis below was half wrong, and the half that was wrong is the interesting
> part.** The pre-warm *is* the cause. **Shader compilation is not** — measured at **0.1ms**
> inside the reveal, with all GPU API work totalling **0.1ms**. The cost is Three.js's
> CPU-side initialisation: **`onFirstUse` at 55.4ms**, plus geometry construction —
> **~197ms** landing at +200–500ms inside a 700ms fade.
>
> **It reproduced on a production build too** (81ms worst gap vs 113ms dev), so "only a
> dev-server artefact" is ruled out.
>
> **Fix:** one guard — `Q5_REVEAL_CLEAR_MS = 700`, read off `.enquiry-q5-block`'s existing
> declaration — mirroring the `CHOREOGRAPHY_CLEAR_MS` guard that already protects
> completion. The pre-warm predates Three.js being on the page, so it guarded the stage its
> author knew about and not this one.
>
> | Production, 3 runs | Before | After |
> |---|---:|---:|
> | Worst frame gap in reveal | 81ms | **18–19ms** |
> | Frames of ~42 | 35–38 | **42/42/42** |
> | WebGL inside reveal | 3/3 | **0/3** |
>
> Reduced motion **+143ms** — correctly does not wait. Completion still protected: canvas
> warm at **+820ms** on a fastest-possible run.
>
> ⚠ **Not approved.** Numbers are clean; Carl has not judged it by eye, and Rule 9 makes
> rendered output the truth for visual work.

**Original entry, preserved — the record of what was believed before it was measured:**

### ⚠ Q5 stutter — REAL, intermittent, OPEN. Deferred by Carl, not resolved

**Symptom:** a stutter as the first question's text appears — Carl described the "W" and "h"
of the Q5 phrase arriving raggedly.

**Confirmed intermittent, and the pattern is the useful part.** Observed across two sessions
on 28 July:

| Attempt | Result |
|---|---|
| First load, degraded dev server | stutter |
| Fresh server, first load | **stutter** |
| Fresh server, 2nd and 3rd loads | clean |

**It favours the first load after a server start, then stops.** That pattern is evidence, and
it points away from the earlier dev-server-degradation theory as a *complete* explanation —
a fresh, healthy server still produced it once.

⚠ **Nothing has been fixed.** No code changed across any of these observations. Do not read
the later clean runs as a resolution.

**The leading hypothesis, untested:** the WebGL pre-warm. `requestIdleCallback` schedules
shader compilation into an idle gap, but a **2000ms fallback fires it regardless** of whether
the thread is free. On a cold first load — nothing cached, Turbopack compiling, shaders not
yet in the driver cache — that work is at its most expensive and most likely to land on Q5.
Subsequent loads hit warm caches, which fits "first load only" exactly.

**This is a hypothesis and must be measured before it is believed.** This project has already
been burned once by a plausible cause on this very page: Three.js was blamed for the opening
delay and measured innocent — 0 WebGL contexts during the opening. The rule stands: measure
first.

**How to measure it:** a `verify/` script that loads `/start` **cold** (fresh context, cache
disabled), presses Begin, and captures long tasks and frame gaps across the Q5 reveal, plus
the timestamp of WebGL context creation. The question it must answer is whether shader
compilation overlaps the Q5 phrase animation. Run it repeatedly — a fault that appears once
per server start needs more than one sample.

**Status:** deferred on Carl's instruction, 28 July 2026 — *"We will have to get to the bottom
of this, for now it can wait."*

---

## At site completion — the workshop/template separation

**Recorded 30 July 2026 on Carl's instruction, to be implemented at completion. Not now.**

**Full record: `live-work/references/workshop-template-and-client-delivery.md`.**

Carl's intent: the template is a **permanent workshop** holding tools, ethos and methodology.
Site code — C2B's own as well as a client's — is packaged and shipped out, leaving the workshop
free. A new client means an identical workshop copied alongside, running in parallel.

⚠ **`.gitignore` cannot achieve this.** It governs future commits, not existing history.
**83 of this repo's 144 commits touch `project-intelligence/`**, so a clone delivers them all
while the working tree looks clean. The record explains the mechanism and the three safe routes.

**Direction decided 30 July 2026:** the C2B site code is extracted out into a new repo of its
own; **what remains, keeping this repo's 144 commits, is the workshop.** The workshop holds the
history worth consulting — methodology, decisions, corrections. Open Question 3 in the record.

**Question 3a also decided:** the workshop keeps the C2B site's source in its *history*, and
every client workshop copies that. **Carl accepts it.** Not a client-exposure risk — the
delivered repo is a fresh `git init` with no ancestry, so there is no history to mine — and it
does not grow with each client.

⚠ **Two beliefs recorded alongside that decision must not be inherited:** git history leaks
**complete** files, not fragments, and `git log` fluency cannot be assumed absent in a
non-AI developer. The decision holds because exposure is **zero**, not because partial exposure
is survivable. **The real trade-secret risk is the extraction step**, not history — Question 3a
in the record.

**Nothing here is authorised and nothing changes about current work.** Its only bearing on the
build: extraction gets harder as site code and reusable scaffolding entangle — `app/globals.css`
is already 2,012 lines of both.

---

## Future work — deliberately not recorded here

**Carl keeps the future-work record outside this repository**, for the site and for the
wider business. This is a standing policy, applied 28 July 2026.

**Do not reconstruct it here, do not treat its absence as a gap, and do not plan against
it.** A session that reads these files should see current and previous work only. When a
future direction becomes current scope, Carl introduces it as a chunk with its own brief.

**One constraint survives because it protects built work:** the hero's right-side space is
**intentionally empty and must not be filled** without a brief from Carl — D-026.

---

## Blockers

*None.*

---

*Last updated: 2026-08-28 — **four defects fixed in the verify harness** (`a374aa2`, `301b605`,
`843eee4`), recorded above and in **D-064**. ⛔ **The proven list is 0 — no harness pass is
admissible.** ✔ **Verified end-to-end on a live production build — nothing is owed.***

*Previously: 2026-08-27 (second pass) — **the logo work landed and is APPROVED**: D-062 places
the mark on `/start`, D-063 records the gold → blue → gold journey, the nail, and the radial edge.
The "next body of work" section is replaced by what was actually built. ⛔ **Client info is a
SECTION — the `complete` stage on `/start` — not a page.***

*Earlier the same day: **building restarted on Carl's explicit ruling (D-061)**; the pause
entry is superseded and preserved, not deleted. "No chunk is authorised" is unchanged and did not
lift with the pause.*

*Previously: 2026-07-28 — future-work items removed on Carl's instruction; next two steps
recorded. Sprint 2 closed at milestone commit 2152e6e.*
