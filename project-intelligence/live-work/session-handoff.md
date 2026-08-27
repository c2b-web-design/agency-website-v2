# Session Handoff — 27 August 2026. Building restarted, and the logo journey went in.

**Read this first, then `project-intelligence/` as normal.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written** —
`live-work-protocol.md` §3a.

---

# ⛔⛔ START HERE: THE VERIFY RUNNER IS BROKEN AND CARL PARKED IT FOR THIS SESSION

⛔ **CARL'S RULING, 27 August: *"At the start of the next session we will fix it."*** ⚠ **This is
the first item, not a background note.**

## ⛔ THE ORDER AND THE ROUTE, SET BY CARL AT SESSION END

⛔ **VERIFY RUNNER FIRST, THEN THE `/about` SECTION.** Not the other way round.

⚠ **CARL RESEARCHES FIRST — with the Strategist (Claude Projects) and the Architect — and will
then put the Builder in PLAN MODE.** ⛔ **DO NOT START BUILDING EITHER ITEM ON SESSION OPEN.**

⛔ **THE PLAN MUST NAME EVERY PROTECTED FILE IT TOUCHES.** Carl's explicit expectation: they are
named **in the plan**, not discovered mid-build. **The plan is then run by the Architect** —
`handoff-protocol.md` §2.5.

**Known in advance, so the plan can name them rather than find them:**

| item | protected path | why |
|---|---|---|
| verify runner | **`verify/run.mjs`** | `FAIL_MARK` / `PASS_MARK` / `classify()` |
| verify runner | **`verify/proven.json`** | only if harness ADMISSION is in scope |
| `/about` | **`components/layout/site-header.tsx`** | the one-line `href="#"` → `/about` |

⚠ **`app/about/page.tsx` IS NOT PROTECTED** — the page is free to create; only the nav link is
gated. ⚠ **And fixing the runner's DETECTION is separable from making `one-context.mjs`
ADMISSIBLE** — `--falsify`'s NaN blocks the latter regardless, so they may be two chunks.

---

**Full diagnosis, already written up: `live-work/verify-runner-defects-27-august.md`.** Read it
rather than re-deriving. In short — three defects:

1. ⛔ **`run.mjs` reads a documented limitation as a FAILURE.** `FAIL_MARK` matches **any line
   starting with ⛔**, and `classify()` applies it **even when the script exits 0**.
   ⚠⚠ **THE IRONY IS THE POINT: `context-rules.md` REQUIRES every harness to declare what it does
   NOT watch, in its output. Complying with that rule is what trips the detector.**
2. ⛔ **`PASS_MARK` only matches at line start**, so a harness printing `run 1   ✅ ONE CONTEXT`
   has **no detectable pass at all**. ⚠ **Not surveyed: how many other harnesses print ✅ mid-line.**
3. ⛔ **`--falsify` reports `NaN run(s)`.** Pre-existing, verified with the fix stashed.
   ⚠⚠ **This one blocks a ROUTE:** falsify is how a harness proves it *can* go red, which is what
   `proven.json` admission requires. **While it is broken, no harness can become admissible.**

⚠ **`verify/one-context.mjs` IS ALREADY FIXED at the harness level — commit `37043aa`.** The
runner behaviour is untouched.
⛔ **THE REAL FIX NEEDS A PROTECTED-PATH UNLOCK: `verify/run.mjs`, and `verify/proven.json` too.**
Carl names each exact path under `"unlocked"` in `live-work/chunk-scope.json` — never a folder,
never a glob — and the unlock is removed and re-verified by observing a real denial.
**Carl has said this may go to the Architect; the diagnosis above is what to hand over.**

---

# ⛔ BUILDING HAS RESTARTED — D-061

**Carl, 27 August, explicit and confirmed when restated back.** The pause that stood from
25 July is lifted. The exit condition completed in sequence: governance work → the
working-process session (D-059) → Carl's explicit restart.

⛔⛔ **"NO CHUNK IS AUTHORISED" DID NOT LIFT WITH IT.** It was never part of the pause — it is the
permanent arrangement, undated, and it stays true now that building has restarted.
⚠ **THE FAILURE MODE THIS GUARDS AGAINST:** reading *"building has restarted"* as *"therefore I
may begin building."* ⛔ **It does not follow. Two separate controls; only one moved.**

---

# WHAT LANDED — EIGHT COMMITS, ALL PUSHED TO `main`

⚠⚠ **`main` IS NOW THE LIVE BRANCH AND IT MOVES.** `fix/q5-stall-and-label-colour` was **170
commits ahead** and had become the trunk in practice; it was merged and pushed on Carl's
instruction. ⛔ **EVERY PUSH TO `main` NOW DEPLOYS TO VERCEL.** That was harmless while `main` was
frozen at 10 August. It is not now.

| commit | what |
|---|---|
| `5c6eb1f` | **D-061** — building restarts |
| `79796eb` | the gold mark on `/start` + `scrollbar-gutter: stable` site-wide |
| `bbb99ba` | **D-062** + the blue mark cropped, reflection removed |
| `47f0ce3` | the nail — gold→blue |
| `37043aa` | the `one-context.mjs` fix |
| `5ff93c7` | blue→gold at the completion fade |
| `8adf9c8` | the radial edge replaces the crossfade |
| `851fde7` | **D-063** + `current-sprint.md` rewritten |

## The logo journey, APPROVED by Carl's eye

| Section | Mark | Changes on |
|---|---|---|
| Opening | **Gold** | — |
| Q+A | **Platinum-blue** | the Begin press |
| Client info | **Gold** | the start of the completion fade |

⛔ **NO NEW TIMING EXISTS.** 1300ms is `Q5_REVEAL_CLEAR_MS`. Both changes ride
`enterActive()` and `enterComplete()`, which already fired on the right beats.
**Full reasoning: D-062 and D-063. Do not re-derive it.**

---

# ⚠⚠ THE BLIND SPOT — CARL'S EYE FOUND EVERY DEFECT, AND THE INSTRUMENTS AGREED IT WAS FINE

⛔ **THIS IS THE MOST TRANSFERABLE THING IN THIS HANDOFF.**

| what a measurement said | what Carl saw |
|---|---|
| "logo pixel-identical, done" | ⛔ **the header was rendering WHITE** — the check measured geometry and never asked what was behind it |
| `#0a0a0a` matches the page | ⛔ *"a different shade of black"* — **a flat colour cannot match a gradient** running rgb(20,20,20)→rgb(8,8,8) |
| headless: **0.00px** difference | ⛔ **7.35px in a real browser** — headless has no scrollbar, so the defect was invisible **by construction** |
| the crossfade looks still | ⛔ *"reload and you see the tiniest movement"* — **a 0.28px error the fade was hiding and a HARD CUT exposed** |
| two golds agree to 0.006px | ⛔ **checking in PAIRS missed that the blue was 0.36px out.** Carl: *"All 3 must be harmonised."* |

⚠⚠ **AND THE SCREENSHOT PIPELINE ITSELF LIED REPEATEDLY.** A hand-rolled PNG decoder reported
**`1,255,255` for a near-black background**; another pass was polluted by the landing page's
**"Web Design" text, which `/start` does not have**, producing a phantom 12px difference.
⛔ **THE DOM RECT PLUS EACH ASSET'S LETTERFORM BOX AS A FRACTION OF ITS FRAME IS THE MEASUREMENT
THAT HELD UP.** Prefer it over screenshot analysis.

---

# ⛔ THREE UNASSERTED DEPENDENCIES — NOTHING IN CODE CHECKS THESE

1. **1300ms against `Q5_REVEAL_CLEAR_MS`.** Re-time the phrase reveal and the logo does not follow.
2. **The 1341ms margin against the field cascade's 3600ms first delay.** Re-time the cascade and
   the logo could still be changing when box 1's **gold rim** arrives — silently.
3. **The `MARK` letterform fractions in `app/start/page.tsx`.** ⛔ **Stale the moment either PNG is
   re-exported or re-cropped.** Re-measure; do not assume.

---

# ⚠ CORRECTIONS MADE TO THE RECORD THIS SESSION

- ⛔ **CLIENT INFO IS A SECTION, NOT A PAGE.** It is the **`complete` stage on `/start`** — the
  four-box contact field. ⚠ **The record's *"client information page not yet built"* refers to
  something else, and reading it as this section produced a wrong answer mid-session.**
- ⛔ **The structural question D-061 flagged NEVER AROSE.** Extending `SiteHeader` would have been
  structural — but **the header is not used on `/start` at all.** Only `app/start/page.tsx` was
  touched; **no protected path was unlocked and none needed to be.**
- ⚠ **Easing was requested, built, measured and REJECTED.** Carl's reasoning was sound but aimed at
  a 150% dead zone the radius change to 75% had already removed. **Every curve made the ink
  crossing shorter: 75% linear 976ms vs 631ms for 150% eased.** ⛔ **Recorded in D-063 so the next
  session does not re-derive it and reach the opposite conclusion.**

---

# CARL'S BRAINSTORM — THE `/about` PAGE. NOT AUTHORISED, NOT A CHUNK

⚠ **Recorded here rather than in `current-sprint.md` because D-038 keeps future work out of this
repo.** This is a live idea Carl was developing at session end, not a commitment.

⛔ **THE CONCRETE DEFECT THAT PROMPTED IT: `About` is `href="#"` in `site-header.tsx`.**
`Services`, `Work` and `Contact` all point at real sections (`#services`, `#work`, `#contact`).
⚠ **`#` jumps to the top of the page, so it reads as BROKEN, not inert.**

**Carl's intent: one page, four related parts — About / me / the company / modern websites / the
process.** ⛔ **NOT what we can do for you — that is documented elsewhere. This is HOW we are going
to do it.** Read in sequence it is one argument, not four topics.

**The "modern websites" part is where the live examples live.** Carl's insight: clients
*"don't know what to ask for, or are they a decade behind"* — their reference points are
competitors' templates, so they cannot name the current ceiling. ⚠ **Plain language is the rule:**
not Three.js geometry but *"a wireframe like is used in video games with a material put on it and
lit with an invisible orbital light."*

- **"Show don't tell"** — a basis and starting point for conversation and discovery.
- **Bespoke should mean exactly that.** *"You want average — go to WordPress or something similar."*
- ⚠ **The "built with AI = slop" objection.** Carl's position: the association is mostly a HUMAN
  failure, and the site itself is the rebuttal. ⚠ **Flagged for Carl's decision, not settled:
  naming the objection can install it in a visitor who had not thought of it. Bespoke-vs-average
  does the same job without raising the word.**
- ⚠ **Noted tension, unresolved:** one page carries two registers — three largely prose parts, and
  one that wants live interactive demos.
- ⚠ **Placeholders are acceptable.** Carl: *"we may create the page and put placeholders there
  while the idea is developed. That would mean all the landing page header subjects have
  functionality and meaning."*

## ⛔ IF IT IS AUTHORISED: THE PAGE IS FREE, THE LINK IS NOT

- **`app/about/page.tsx` — EDITABLE.** The route does not exist; creating it touches nothing
  protected.
- ⛔ **`components/layout/site-header.tsx` — PROTECTED.** Changing `href="#"` to `/about` needs
  Carl to name that exact path under `"unlocked"` in `live-work/chunk-scope.json`.
- **So it is a two-part job with a gate in the middle.**

---

# STILL OPEN — CARRIED FROM THE 25 AUGUST HANDOFF, NOT ADDRESSED

- ⛔ **D-048's PROPAGATION HALF — five recorded instances, still no holder.**
- **`components/enquiry-opening.md`** — describes the primary component of `/start`, **reads as
  current**, stops at **D-033**. The whole D-046 → D-056 layer is absent; **two contradicting
  "Known Issues" sections** disagreeing on F-007.
- **The 758ms attribution** — contested in `decisions.md` (D-046, D-048) and `current-sprint.md`,
  adjudicated in neither. ⚠ **The dispute is about the MECHANISM, not the magnitude.**
- **`ai-roles.md:448`** — footer still reads `Last updated: 2026-08-13`.
- ⚠ **`live-work-protocol.md` §3b does not name `evidence/`.** It cites the finding, not the path.
- ⚠ **The `<img>` lint warning — now THREE instances, one per mark.** Same rule D-060
  deliberately left open. **The `next/image` conversation is still not had.**
- **Three unexamined Codex artefacts:** four PNGs at `~/.codex/generated_images/019fb2e1-…`;
  `Documents\Codex` (66,526 files); `codex-pasted-text-archive` + `memories_1.sqlite`.
- ⚠ **No `review-log.md` entry was filed for the logo work.** **D-057 makes that optional, not
  required** — flagged for Carl rather than treated as a gap.

## ⛔ TWO ITEMS FROM THE 25 AUGUST HANDOFF ARE NOW CLOSED

- ⛔ **The Codex credential — resolved 23 August.** Nothing is owed. **Do not re-raise it.**
- ⛔ **The platinum-blue key — DONE.** Carl finished it in DaVinci Resolve; it is cropped, the
  floor reflection is removed, and it ships as `public/c2b-logo-blue-mark.png`. **The source is
  committed at `brand-assets/logo/c2b-logo-blue-mark00086514.png`.**

---

## ENVIRONMENT TRAPS

- ⚠⚠ **A BACKTICK IN A BASH HEREDOC TRIGGERS COMMAND SUBSTITUTION AND SILENTLY EATS CONTENT.**
  It removed `` `current-sprint.md` `` from a line of D-062 mid-write. ⛔ **Caught by grepping
  after the write.** **For markdown with backticks: write the body with the `Write` tool and
  append it with `node`, normalising to CRLF.** That is how D-063 went in cleanly.
- ⚠⚠ **EVERY `.md` HERE IS CRLF. Check before and after: `decisions.md` was 2950/0 before D-063
  and 3063/0 after.** A heredoc appends bare LF.
- ⚠⚠ **REAL MOUSE CLICKS, NOT SYNTHETIC EVENTS, TO WALK THE CORRIDOR.** The Next step button is
  `pointer-events: none` until a card is genuinely selected, so a dispatched `pointerdown` on a
  card does not register and the walk silently never advances — it reports `Next step` five times
  and never reaches `Understood`. **Use `page.mouse.click(x, y)` at the element's centre.**
- ⚠ **The Begin hit target is `button.enquiry-begin-hit`** — a SIBLING of `.enquiry-button-mask`,
  not a child. Clicking the mask does nothing.
- ⚠⚠ **A REBUILD KILLS THE SERVER AND IT STAYS DOWN UNTIL RESTARTED.** Carl saw this as an
  outage mid-session. `rm -rf .next && npm run build` then `npx next start -p 3100` again.
- **Production is the verdict**; dev and production disagree.
- ⚠ **A server can outlive its source.** Confirm the process is YOUNGER than `.next`.
- ⚠⚠ **HEADLESS CANNOT SEE SCROLLBAR-SENSITIVE GEOMETRY.** It has no scrollbar, so both pages
  measured x=112 and agreed while the real browser showed 7.35px. **Verify headed.**
- ⚠ **Playwright resolves from the repo, not the scratchpad** — run with the repo as cwd via
  `node --input-type=module -e`.
- ⚠ **Playwright's pointer stays where the last action left it.** Park it (`mouse.move(10,10)`).
- ⚠⚠ **`jq` IS NOT INSTALLED, and NEITHER IS `python`.** Use `node -e`.
- ⚠⚠ **GIT BASH `ls -l` REPORTS WRONG FILE SIZES IN THIS REPO.** Use `node -e "...statSync..."`.
- ⚠⚠ **AUTO MODE MAY STEER TOWARD `Bash` FOR FILE EDITS. ⛔ BOTH HOOKS FIRE ON TOOL CALLS ONLY**,
  so `sed -i`, redirects and heredocs **bypass the scope guard on all 25 protected paths.**
  ⛔ **READ through Bash freely; MODIFY through `Edit`/`Write` ONLY.**
- ⚠ **`chunk-scope.json` DOES NOT EXIST — no unlocks are live.** ⛔ **IT IS GITIGNORED, so
  `git status` can never catch one left open.** The closing denial is the only evidence.
- ⚠ **Nothing is running on 3100 at session end** unless Carl left it up deliberately.

---

*27 August 2026. **Eight commits. Building restarted, the logo journey went in gold → blue → gold
on a radial edge nailed to one point, and every defect in it was found by Carl's eye while the
instruments read green.***
