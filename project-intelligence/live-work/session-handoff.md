# Session Handoff — 25 August 2026. The first building work landed, inside a paused build.

**Read this first, then `project-intelligence/` as normal.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written** —
`live-work-protocol.md` §3a.

---

# ⛔⛔ TWO CONTROLS BLOCK BY DEFAULT. BOTH ARE THE CONTROL WORKING.

> ## 1. EDITS — `SCOPE GUARD: '<path>' is PERMANENTLY PROTECTED`
>
> Paths in `.claude/protected-files.json` (**25 of them**), locked on every `Edit`/`Write`/`NotebookEdit`.
> ⚠ **`CLAUDE.md`, `verify/proven.json` and `verify/run.mjs` are among them.** Unlocking needs Carl
> naming that exact path under `"unlocked"` in `live-work/chunk-scope.json`. Never a folder, never a
> glob. **Remove the unlock when done and re-verify the path locks again by observing a real denial.**
>
> ⚠ **`chunk-scope.json` DOES NOT EXIST — no unlocks are live.** Verified at session end.
> ⛔ **IT IS GITIGNORED, SO `git status` CAN NEVER CATCH ONE LEFT OPEN.** The closing denial is the
> only evidence that the lock came back. **Four unlock cycles ran this session; every one was closed
> and observed.**
>
> ## 2. VERIFY — `VERIFY FRONT DOOR: ... skips the verdict gate`
>
> **Calling a harness directly with `node` is DENIED on the Bash tool.** Use
> **`npm run verify -- <script.mjs>`**. ⚠ It fires on `node --check` too, and on a `grep` whose
> *search string* contains the verify path — a false positive, not a bug. Reword the search.

⛔ **A denial is not a bug. Do not diagnose it, and DO NOT ROUTE AROUND IT WITH A SHELL.**

---

# ⛔⛔ TWO ITEMS THE LAST HANDOFF CARRIED ARE CLOSED. DO NOT RE-RAISE THEM.

- ⛔ **THE CODEX CREDENTIAL IS RESOLVED.** Carl **signed out of all OpenAI sessions and deleted the
  Codex desktop app on 23 August 2026**, after that handoff was written. **Nothing is owed. It is not
  an open item and must not lead a session again.**
- ⛔ **THE WORKING-PROCESS SESSION HAPPENED — D-059 came out of it.** Carl's stated sequence
  (governance → the process session → he restarts building) has **its first two steps complete.**

⚠⚠ **AND BUILDING IS STILL PAUSED ANYWAY. CARL HAS NOT SAID THE WORD.** ⛔ **NO CHUNK IS
AUTHORISED, and that is the permanent arrangement, not a pause condition.** The gate being satisfied
is not the restart; only Carl saying so is, and he will be explicit.

---

# ⛔ THE HEADLINE — THE FIRST BUILDING WORK LANDED, INSIDE A PAUSED BUILD

**Because Carl authorised the touch specifically.** ⚠ **That is the shape to notice: a named,
scoped authorisation inside a standing pause — not the pause lifting.** The pause still covers new
building; this was one element, named by Carl, judged by his eye, and closed off again.

## D-060 — THE LOGO RUNS AT 40px TALL ON DARK PAGES

**Commit `ed8f03d`.** Status **APPROVED** — Carl's verdict on the 40px placement was *"good"*,
recorded **at that level and no higher.** ⛔ **Not PROVISIONAL, and not promoted.**

⛔ **40px IS THE HEIGHT. The width follows from the aspect ratio — 69.9px, from the 951x544 mark.**
⚠ **SET THE HEIGHT AND LET THE WIDTH FALL OUT. NEVER THE REVERSE.**

⚠ **It is the STANDARD SIZE FOR THE LOGO ON PAGES**, not a value local to the header.

### ⚠⚠ WHY, so nobody "corrects" it back

⛔ **CAP-HEIGHT MATCHING IS THE WRONG TARGET FOR THIS MARK.** The first pass derived **24px** by
matching the cap-height of the 12px `C2B` text it replaced. **Sound arithmetic on the wrong target**,
and Carl rejected it by eye as too small.

⛔ **THE c AND THE b ARE OPEN LOOPS.** Measured: **only 38.4% of the mark's ink box is ink** — the
other **61.6% is background showing through the letterforms**, where the text it replaced was
**solid**. Equal cap-height therefore delivers a fraction of the visual weight, so **the mark must
run LARGER than the text it stands in for.**

⚠ **THE MARGIN WAS NOT THE PROBLEM.** Measured before resizing: **5.7% empty width, 9.6% empty
height**, with **hard edges** — alpha 0 → 255 in a single pixel on three sides. Cropping helped a
little; **the open-loop nature is the reason.**

⛔ **THE NAV GREW 61px → 81px AND THAT IS ACCEPTED.** Carl let it grow deliberately. **Not a cost to
be recovered. Do not shrink the mark to protect the old height.**

### ⛔ THE LIMIT: 40px ON DARK

**Every page is dark today and the standard assumes it.** ⚠ **On a light background the gold loses
contrast and the white specular highlights vanish entirely** — the mark carries **11,219 fully-opaque
pixels at luminance 255**, which read as metal on dark and as white-on-white on light.
⛔ **A LIGHT-BACKGROUND TREATMENT IS UNDECIDED AND D-060 DOES NOT COVER IT.**

### The asset

**`public/c2b-logo-mark.png` — 951x544, 865,999 bytes.** Extracted from
`brand-assets/logo/c2b-logo-gold-hero.svg`, cropped from its 991x584 frame **keeping 8px of breathing
room** rather than cutting to the ink. ⚠ **Verified non-destructive: opaque (137,956) and
partial-alpha (59,500) counts are IDENTICAL before and after** — only fully-transparent pixels went.
⛔ **ONE asset ships;** the uncropped frame was removed and 404s.

### Recorded as undecided, NOT as omissions

- ⛔ **Whether "Web Design" stays beside the mark at all — and if it does, IT WILL ALMOST CERTAINLY
  BE A 3D TEXT FONT.** That makes it **a lockup of two extruded objects in one material world**, not
  a metal mark beside flat grey text. ⚠ **THE CURRENT SPAN IS A PLACEHOLDER; its awkwardness at 40px
  is NOT evidence against the size.**
- Animation. Hover. Whether the orbital light catches the mark.

---

# ⚠⚠ TWO RECORD FINDINGS IN `hero-logo-transition-concept.md` — BOTH REPORTED, NEITHER FIXED

⛔ **A RECORD CORRECTION IS CARL'S.** Both were found by opening the artefacts, not by reading about
them.

1. ⛔ **THERE IS NO VECTOR MASTER.** `brand-assets/logo/c2b-logo-gold-hero.svg` is **a base64 PNG in
   an SVG wrapper** — counted directly: **one `<image>`, zero `<path>`, zero gradients**, and its own
   `<desc>` says so. ⚠ **The file states the Blender/Three.js pipeline depends on having a vector
   master. IT DOES NOT EXIST.** Any future 3D logo work planned against that record is planned
   against nothing.
2. ⛔ **THE PLATINUM-BLUE LOGO EXISTS.** The file states — from an **exhaustive 24 July search** —
   that none does and one must be created. ⚠ **Carl has it.**

---

# ⛔ CARL'S PLACEMENT RULING, 25 AUGUST 2026

| Section | Logo |
|---|---|
| Landing page | **GOLD** |
| Start page | **GOLD** — works with the ivory button |
| Client info page | **GOLD** — the gold rim |
| **Q+A** | ⛔ **PLATINUM-BLUE** — that section has a strong blue presence |

## ⚠ THE PLATINUM-BLUE ASSET IS NOT READY, AND KEYING IT IS NOT A BUILDER TASK

**As supplied: RGB, no alpha, 1448x1086, on a background that is NOT flat black** — **5 at top-left
rising to 15 at the bottom**, with a floor gradient. ⛔ **A THRESHOLD CUT WOULD LEAVE A VISIBLE
RECTANGLE.**

⚠ **IN PROGRESS IN DAVINCI RESOLVE — CARL IS KEYING IT HIMSELF.** ⛔ **Do not attempt it, and do not
offer to.** State as of this session:

- Timeline set to **1448x1086 so nothing scales**.
- Fusion: **Fusion Clip 1 → LumaKeyer1 → MediaOut1**. **Luminance, Low 0.004, High 0.3.**
  ⚠ **The mark solidified at those values.**
- ⛔ **NOT FINISHED: the Alpha view still shows GREY IN THE BACKGROUND** — the key is not clean.
- ⚠ **The floor reflection is partly keyed and still a faint band.** **Carl has not ruled on keeping
  or removing it.**

⚠ **WHEN IT IS DONE:** the export **must carry alpha** — **PNG-with-alpha, TIFF or EXR.**
⛔ **NOT JPEG.** And ⛔ **CHECK IT ON MID-GREY, NOT BLACK** — a fringe or a leftover rectangle is
invisible on black, which is exactly how a bad key ships.

---

# STILL OPEN

- ⛔ **D-048's PROPAGATION HALF — five recorded instances, still no holder.** A correction lands in
  one file while its source stands unmarked. **D-058 answers the other half; this half does not.**
- **`components/enquiry-opening.md`** — describes the **primary component of `/start`**, **reads as
  current**, stops at **D-033**. The whole D-046 → D-056 layer is absent; **two contradicting "Known
  Issues" sections** disagreeing on F-007.
- **The 758ms attribution** — contested in `decisions.md` (D-046, D-048) and `current-sprint.md`,
  adjudicated in neither. ⚠ **The 13 August finding disputes the MECHANISM, not just the magnitude:**
  both halves reproduce (106ms vs 1353ms) but disabling the disk cache costs 53ms *with* the warm-up
  and **nothing at all without it.** ⛔ **The gap is real; the explanation is what is disputed.**
- **`ai-roles.md:448`** — footer still reads `Last updated: 2026-08-13`.
- ⚠ **`live-work-protocol.md` §3b does not name `evidence/`.** It cites the finding, not the path.
  **Carl's call.**
- ⚠ **The `<img>` lint warning, and whether `next/image` is wanted.** `@next/next/no-img-element`,
  one warning, **deliberately left**. A loader and optimisation behaviour is a conversation for when
  the logo work continues — **not something to slip in with a decision entry.**
- **Three unexamined Codex artefacts:** the four PNGs at `~/.codex/generated_images/019fb2e1-…`
  (30 July, card/button material studies, **never in the 24 July salvage's scope**);
  `Documents\Codex` (66,526 files, 10 dated session dirs); and `codex-pasted-text-archive` +
  `memories_1.sqlite`, **possibly briefs Carl pasted in.**

---

## ENVIRONMENT TRAPS

- ⚠⚠ **GIT BASH `ls -l` REPORTS WRONG FILE SIZES IN THIS REPO.** It gave **197,609 bytes for a
  925,545-byte file** — and the same wrong number for a different file, so it is not a one-off.
  **Node, PowerShell and the HTTP response all agree with each other; `ls -l` does not.**
  ⛔ **Never take a file size from `ls -l` here.** Use `node -e "...statSync..."`.
- ⚠⚠ **A LAZY `useState` INITIALISER SILENTLY SERVED THE WRONG VALUE THROUGH HYDRATION.** On a
  **statically prerendered** page React keeps the server value and discards the initialiser's result.
  It was **lint-clean and looked right**; the page's own `window.location.search` carried the correct
  parameter the whole time while the rendered size ignored it. ⛔ **Caught by measuring the rendered
  output, not by reading the code.** `useSyncExternalStore` is the shape that is both correct and
  lint-clean.
- ⚠⚠ **AUTO MODE MAY STEER TOWARD `Bash` FOR FILE EDITS. ⛔ BOTH HOOKS FIRE ON TOOL CALLS ONLY**, so
  `sed -i`, redirects, `mv`, `cp`, `rm` and heredocs **bypass the scope guard entirely on all 25
  protected paths.** ⛔ **READ through Bash freely; MODIFY through `Edit`/`Write` ONLY.**
- **Production is the verdict**; dev and production disagree. `npm run build && npx next start -p 3100`.
- ⚠ **A SERVER CAN OUTLIVE ITS SOURCE.** `rm -rf .next` and rebuild when a probe has been in.
  **Confirm the serving process is YOUNGER than `.next`** — compare process creation time against
  `stat -c %y .next`. Done four times this session.
- ⚠ **Playwright's pointer stays where the last action left it.** Park it (`mouse.move(10,10)`).
- ⚠ **Playwright resolves from the repo, not the scratchpad** — a script written to the scratchpad
  cannot `import 'playwright'`. Run it with the repo as cwd via `node --input-type=module -e`.
- ⚠ **Card hover is DOM divs (`[data-testid="answer-card-hover-N"]`), not the canvas.**
- ⚠ **`TaskStop` reports success on a held port. Kill by PID, confirm free** — LISTENING only;
  `TIME_WAIT` is not a held port.
- ⛔ **`canvas.__r3f` IS UNDEFINED ON PRODUCTION BUILDS.**
- ⚠ **No backticks in comments inside the shader template literals** — it closes the string.
  **And no backticks inside a Bash `grep` pattern** — the shell eats them and the command dies with
  an unmatched-backtick parse error.
- **Bash heredoc patches have silently no-opped and stripped regex backslashes.** ⛔ **Grep the file
  after every scripted edit.**
- ⚠⚠ **A HEREDOC APPENDS LF INTO A CRLF FILE.** Every `.md` here is CRLF. Normalise after appending.
  **`decisions.md` was 2,754 CRLF / 0 bare LF before this session's entry and 2,802 / 0 after** —
  check, do not assume.
- ⚠⚠ **`tail` ON A REVERSE-CHRONOLOGICAL FILE SHOWS THE OLDEST ENTRIES.** `review-log.md` runs newest
  first. **Sort, do not tail** — or run `npm run verify -- entry-numbering.mjs`.
- ⚠ **`run.mjs` CLASSIFIES ANY LINE STARTING WITH ⛔ AS A FAILURE MARKER, even on exit 0.** Keep an
  explanatory ⛔ mid-line.
- ⚠⚠ **`git worktree remove` CAN FAIL ON "Filename too long"** under `node_modules`. ⛔ **Re-check disk.**
- ⚠⚠ **`jq` IS NOT INSTALLED, and NEITHER IS `python`.** Use `node -e`. A parse "error" may be that.
- ⚠ **Node resolves `/tmp` as `C:\tmp`; Bash does not.** Pipe through stdin, or use a Windows path.
  **`$TMPDIR` is not set in this shell** — write scratch files by absolute path.
- ⚠⚠ **The `before-5af5709` films are under gitignored `verify/out/` and are NOT BACKED UP.**
- ⚠ **Nothing is running on 3100.** Killed by PID at session end; no `node.exe` left; connection
  refused, confirmed by request rather than by the process table.

---

# ⚠⚠ THE BLIND SPOT — READ THIS BEFORE TRUSTING A NUMBER

## ⛔ EVERY FINDING THIS SESSION CAME FROM MEASURING, NOT FROM READING.

**Not one came from reasoning about the code or trusting a record:**

| what was believed | what measuring showed |
|---|---|
| `app/layout.tsx` renders the site header | **it renders `{children}` and nothing else** — the header is imported by `app/page.tsx` alone, so it is **homepage-only, not site-wide** |
| the SVG is the vector master | **one `<image>`, zero paths** — a base64 PNG in a wrapper |
| the transparent margin made the logo read small | **5.7% / 9.6%** — the **open loops (38.4% ink)** were the reason |
| the `?logo=` switch worked | **`?logo=40` rendered 32px** — lint-clean, looked right, silently wrong |
| the file was 197,609 bytes | **925,545** — Git Bash `ls -l` lies here |

⚠ **The header trace is the one to note: an Architect prediction named two protected paths and both
WERE protected — but the premise attached to them was wrong at source.** Being right about the
answer is not being right about the reason. **That disagreement is exactly what D-059 §1 says the
two independent lists exist to surface.**

⛔ **TREAT ARCHITECT FIGURES AND PATHS AS PREDICTIONS AND CHECK THEIR SOURCE.**

---

*25 August 2026. **Two commits. The working-process rulings, and the first building work — one
element, named by Carl, judged by his eye, inside a build that is still paused.***
