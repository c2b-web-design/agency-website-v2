# Session Handoff — 18 August 2026 (the stall has an instrument, and the freeze varies 16x)

**Read this first, then `project-intelligence/` as normal.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written** —
`live-work-protocol.md` §3a.

---

# ⚠⚠ THE NEXT SESSION'S FIRST TASK IS AN EXPERIMENT THAT MUST FIT IN ONE SESSION

**The `NextStepMeshButton` experiment (below) CANNOT SPAN A SESSION BOUNDARY.** Both arms
must be measured back to back, on builds made minutes apart. **If there is not room for
both arms today, do something else — half the experiment is worth nothing.** The reason is
in *THE SECOND CONSTRAINT* below and it is not negotiable.

---

## STATE

**Branch `fix/q5-stall-and-label-colour`, head `3cecf5e`. TREE CLEAN.**
Servers: none. Ports 3000/3100 free.

## WHAT LANDED TODAY — ELEVEN COMMITS, OLDEST FIRST

```
387653a  chunk A  — horizontal half of the text jump
d008b4d  exit (a) — the exit's derived arithmetic
c831bf9  exit (b) — the card exit
5ed68ac  chunk B  — vertical half of the text jump
266e3c9  (the handoff this one replaces)
54fea01  the reveal stall instrument + the 16x finding
7f15345  the wipe comment — wrong property AND wrong thread
98429af  step 5 — the warm-up canvas deleted
f058854  the three gaps step 5 opened, closed
00e4629  the mark-name collision fixed
3cecf5e  ?nobtnmesh=1 — the treatment arm, BUILT BUT NOT MEASURED
```

---

## ⛔ CLOSED TODAY — DO NOT REOPEN

### The text jump — fixed in BOTH axes

`gap`, `letter-spacing` and `line-height` ease on the existing 900ms
`cubic-bezier(0.37, 0, 0.63, 1)`. All four elements measure dx 0.00 / dy 0.00.
⚠ **The cue INHERITS the line-height change** — three elements move, not two.

### The card exit — APPROVED BY CARL'S EYE, ON FILM

> *"noticeably faster than the entrance, flow and choreography are sound."*
> *"timing and flow are good."*

**425ms per card, 119ms derived gap, `CARD_OVERLAP` 0.72, ladder 5→4→3→2→1.**

⚠⚠ **ITEM 7 IS APPROVED AND CLOSED — the selected card departs STILL LIT**, filament
fading across the 425ms. **Carl approved it on film.** ⛔ **It is no longer an open item;
do not "fix" it.**

**The 252ms quiet stretch is approved.** `CARD_EXIT_HEADROOM_MS` is a DESIGN FIGURE —
Carl: thinking and breathing time. ⛔ **Not tuning budget.**

⚠ **The exit MOVES THE DEPARTURE TO BEFORE THE ARRIVAL.** Pre-change the cards
extinguished at ~1341ms, **188ms AFTER** the reveal began at 1153ms. Vacate-before-arrive
is **functional**, not aesthetic.

---

# ⚠⚠⚠ THE HEADLINE FINDING OF THE DAY — ABOVE EVERYTHING ELSE ABOUT THE STALL

> ## **THE FREEZE VARIES 40ms TO 640ms ON ONE BUILD, IN ONE SESSION, ON ONE MACHINE,
> ## WITH NOTHING CHANGED BETWEEN RUNS.**
>
> **Median 200ms. 7/8 runs. ⚠ THE MEDIAN IS NOT THE FINDING — THE SPREAD IS.**

### ⚠⚠ WHAT THIS DOES TO EVERY FIGURE ON THE RECORD

**Every prior measurement is a single run or three cold samples:**

| Figure | Date | Basis |
|---|---|---|
| ~720ms | 14 Aug | **one run** |
| ~400ms | 16 Aug | **one run** |
| 626ms | 10 Aug | **one run** |
| 81/80/119/117/294/303ms | 13 Aug | **three cold samples per arm** |

⚠ **A SINGLE RUN ON ONE BUILD COULD HAVE RETURNED 40ms OR 640ms.** Any two single runs
can differ 16x with no cause but chance.

- ⛔ **The 13 August bisect is marked NOT SAFE in place** (banner at the top of
  `q5-stall-bisect-13-august.md`). **Its staircase may well be real; three cold samples
  per arm cannot carry it against this spread.** Superseded, not rewritten — **anyone
  citing the bisect must cite the banner with it.**
- ⚠ **The 10-vs-13 August contradiction about the hover work is now ONE OF TWO candidate
  explanations** — the other being two draws from this distribution. **The mixed-tree
  guess was never tested. Neither is established.**
- ⚠⚠ **ANY FUTURE CLAIM ABOUT THIS STALL NEEDS A DISTRIBUTION, NOT A NUMBER.
  EIGHT RUNS IS THE WORKING FLOOR.**

---

# ⚠⚠ THE SECOND CONSTRAINT, EQUALLY BINDING — A STORED BASELINE IS NOT A CONTROL

**The identical unmodified commit `f058854` measured `mount → compiled` at **1252ms** in
one session and **1450ms** in another.** ⚠ **~200ms of between-session drift — larger than
differences this project has treated as results.**

> ### ⛔ ARMS MUST BE MEASURED BACK TO BACK IN ONE SESSION, ON BUILDS MADE MINUTES APART.
> **Re-measure the baseline. Never recall it.** This is why the next experiment must not
> span a session boundary.

**How it was caught:** the mark-name fix appeared to move the median 1252 → 1520ms. The
pre-fix commit was rebuilt and re-measured **in the same session** and read 1450ms — so
the fix was exonerated **by a control, not by an argument.** The three arms measured
back-to-back that session agreed within ~80ms; the outlier was the *earlier session's*
figure.

⚠ **Corrected in the record:** the claim that 1252ms agreed with Stage 1's 1353ms "within
8%" is **withdrawn as stated**. Stage 1's 1353ms was **ONE ARM**; that pass measured six
runs. **A single number landing inside a distribution is not two measurements agreeing.**

---

## TWO NEGATIVES — RECORD AS NARROWING, NOT AS FAILURES

### 1. Step 5 (`98429af`, KEPT) — the warm-up canvas is NOT the cause

```
  linked programs   17/17  →  17/11
  freeze median     200ms  →  220ms      (unchanged within noise)
  freeze present     7/8   →   7/8
```

> ⚠⚠ **EVIDENCE AGAINST PROGRAM-LINK *COUNT* AS THE DRIVER** — the implicit theory behind
> the whole shared-host rebuild. Removing an entire redundant context and six of seventeen
> post-Begin links moved the freeze not at all.

- ⛔ **Does NOT exonerate the GPU process.** The freeze is still GPU-side, renderer idle
  (`CommandBuffer::Flush`, ~164ms in four blocks). **Link count is one mechanism within
  that.**
- ⛔ **Does NOT make step 5 a failure.** Its own benefit is real and is a **DIFFERENT
  QUANTITY**: `mount → compiled` moved 106ms → ~1250–1450ms, paid before Begin on a normal
  run. **Whether that trade is right is Carl's design judgement.**

### 2. Arming is healthy post-deletion — and the fallback is ALIVE

- **Ready gate 6/6 cold runs**, median ~400ms. Compile path correctly gone. Backstop 0/6.
- ⚠ **THE BACKSTOP WAS FORCED, NOT ASSUMED:** `document.fonts.ready` stubbed to a promise
  that never settles → **armed by `backstop` at ~4220ms, Begin present.** So if the ready
  gate ever fails the page is **slow, not broken.**
- **Reduced motion completes and arms** by its own named source.

---

## ⚠⚠ INSTRUMENT STATE — CARRY ALL OF IT

- ⚠⚠ **`verify/reveal-stall.mjs` MEASURES THE VIDEO TRACK, NOT COMPUTED STYLE.
  DO NOT CHANGE THE CHANNEL.** Chromium does not composite `clip-path`, but the defect is
  **GPU-side** — main thread **2.3ms busy of 210ms** while the GPU saturates. **A
  `getComputedStyle` poller reads INTENT and stays green straight through the freeze.**
- ⚠ **It now ACCUMULATES into timestamped directories.** ⛔ **DO NOT REINTRODUCE THE
  `rmSync`.** It destroyed the **640ms film**, which is **unrecoverable** — a fresh capture
  is a different run on a different day. `REVEAL_STALL_BATCH=<name>` names a batch; the
  measure script reads the newest, or a path.
- ⚠ **Q5's reveal begins ~7.8s AFTER Begin, NOT ~2.5s.** A short window films the opening
  and concludes the stall is gone. **This has happened.**
- ⛔ **NO MD5 for static frames** — f201–f208 had **eight different hashes with ZERO pixel
  difference.** Byte plateaus **under-report**; they are a floor, not a bound.
- ⛔ **No screenshot-per-sample harness** (~84ms/capture on the animation's own thread).
- ⛔ **`canvas.__r3f` IS UNDEFINED ON PRODUCTION BUILDS** — scene-walking instruments report
  BROKEN on a healthy page.
- ⚠ **Marks are now unconditional `card-canvas-created` / `card-canvas-compiled`.**
  **13 readers updated**; all carry a header note that **14–18 August figures are
  NAME-AMBIGUOUS**. ✅ **Stage 1 (`4c7a20e`, 13 Aug) is VERIFIED unaffected** — it predates
  the shared host (`1e031cd`, 14 Aug), and its two canvases were mutually exclusive in time
  and wrote different names.
- ⚠ **`__cardTrace` IS SILENT ACROSS THE QUESTION BOUNDARY** — the tick loop self-terminates
  at `t >= 1`. `verify/card-exit.mjs` reads **rendered pixels**. **Do not revert it.**

### ⚠⚠ TEN INSTRUMENT DEFECTS IN FIVE DAYS — recorded individually, UNCONSOLIDATED

⛔ **Carl leads any rule drawn from these. Do not propose one.**

⚠ **But the pattern has teeth, and it is worth carrying: THE EXPENSIVE ONES ALL FAILED
TOWARD A PASS.**

- `q5-stutter.mjs` — **0/3 CLEAN on a visible stall** (700ms window inside a 1300ms wipe)
- `one-context.mjs` — **2/2** while a context was created **per question step**
- the reveal window's **version 3 — 0ms, "no freeze"** on a live, filmed freeze

> **A false alarm gets investigated. A false pass gets believed.**

**A defect rate that high in the measuring apparatus is itself a measurement**, and it
bears on how much weight any single green verdict can carry here.

---

# ⚠ NEXT SESSION'S FIRST TASK — THE `NextStepMeshButton` EXPERIMENT. NOT STARTED.

**The candidate:** it sits inside the keyed phrase, destroyed and rebuilt every question.
**8 contexts across a five-question walk; ~67ms in `CommandBufferProxyImpl::Initialize`;
3 canvases remain after Begin.** ⚠ **Nothing has ever counted it** — `one-context.mjs`
watches the card host only, and **its own header says the shared-host work was measured
against a harness that could not see this.**

### ✅ THE TREATMENT ARM IS BUILT AND VERIFIED — `3cecf5e`, `?nobtnmesh=1`

⛔ **DIAGNOSTIC ONLY. IT MUST NOT SHIP.** Delete the flag if the experiment is not run.

```
  BASELINE    webgl contexts 3  [other, BUTTON, other]
  TREATMENT   webgl contexts 2  [other, other]

  button box    116x41 @ 662,617   IDENTICAL both arms
  question box  310x31 @ 589,445   IDENTICAL both arms   <- the reveal is untouched
```

### ⚠⚠ A MEASUREMENT MADE TODAY THAT CHANGES THE PREDICTION — READ BEFORE PREDICTING

**The framing was: "the freeze is at Q5, which follows the BEGIN CLICK, not a corridor
step, while the context churn happens at question boundaries."** ⚠ **That is true and it
is not the whole picture.**

`renderPhrase` builds a button for **EVERY question INCLUDING Q5**, and its canvas mounts
on `box &&` — after `ResizeObserver` measures — **independently of `active`**. Measured on
4 of 4 runs:

> ## **Q5's button context is created +54 to +65ms AFTER Q5's reveal begins — INSIDE the 1300ms wipe.**

⚠ **So the candidate is plausible for a reason the per-step framing does not capture.**
**Whoever predicts must address this, not the churn-at-boundaries story alone.**

### The method — mandatory

- ⚠ **STATE THE PREDICTION FIRST, NARROW ENOUGH TO BE WRONG. Median AND freeze rate out
  of 8.** ⛔ **A 120ms band against a 720ms spread is UNFALSIFIABLE, not correct** — that
  was the step 5 prediction's failure and it is on the record as such.
- **If the honest expectation is "no change", PREDICT THAT.** A negative predicted in
  advance is worth more than one discovered.
- **8 runs per arm minimum, production, cold. BOTH ARMS BACK TO BACK IN ONE SESSION.
  Baseline re-measured, never recalled.**
- ⚠ **Extract frames and LOOK at ≥1 freeze per arm.** **Every wrong version of this
  instrument was caught that way and NONE by reading output.**
- ⛔ **Overlapping ranges mean NO CONCLUSION. Say so if that is what you get.**
- ⚠ **A lower median is not a result** against a spread that reaches 640ms.

---

## ALSO OPEN

- ⚠ **Reduced-motion exposure:** Begin clickable ~2s before the cards compile. **Pre-existing**,
  but the deletion removed the canvas that filled that window. **CARL'S DESIGN CALL, not a
  defect yet.**
- **Whether ~1250–1450ms of pre-Begin compile is an acceptable price for one context.** Carl's.
- **Commit (c)** — the `useCardEntrance` → `useCardChoreography` rename. ⚠ **LAST AND ALONE.**
- **Mobile:** the 390×844 narrow film exists at `verify/out/card-exit-film/` and is **UNWATCHED**.
  **Q1 → complete and reduced-motion exit still unsettled.**
- ⚠ **The 1300ms reveal is one fixed duration for every question** (`globals.css:1315`) against
  Carl's reading-speed intent. **A DESIGN FINDING AND HIS — do not act.**
- ⚠ **`verify/text-jump-rects.mjs`:** dy channel falsified; **DX CHANNEL NEVER SEEN RED.**
  **Not full regression cover.**
- ⚠ **`verify/card-exit.mjs`:** the **151.8ms vs 119ms** gap is explained by a **50% LUMINANCE**
  threshold but **UNVERIFIED**. **Read alpha directly before trusting it as regression cover.**
- **The mark-name collision's history:** every `mount → compiled` figure from **14–18 August**
  rests on a `[0]` read nothing guaranteed. **Not overturned; flagged.**

### Artefacts preserved (SHA256-verified, force-added)

```
project-intelligence/live-work/screenshots/
  q5-reveal-stall-18aug-tail-40ms.webm          baseline tail
  q5-reveal-stall-18aug-median-200ms.webm       baseline median
  q5-reveal-stall-18aug-tail-240ms.webm         baseline tail
  q5-reveal-stall-18aug-step5-tail-80ms.webm    post-step-5 tail
  q5-reveal-stall-18aug-step5-tail-800ms.webm   post-step-5 tail
```
⛔ **The 640ms film is GONE and cannot be recovered.**
Film batches: `verify/out/reveal-stall/2026-08-18-step5-post-deletion/` (scratch).

---

## METHOD — ALL OF IT EARNED FROM REAL FAILURES

- **Falsify every instrument before trusting a green.** Where a defect is live, a correct
  instrument **must go RED today**; a green means the instrument is wrong.
- **State predictions before measuring. The misses are the useful part.**
- **Measure floors, never inherit thresholds. Correct forward; supersede in place, never
  rewrite.**
- **One task per prompt. Ask before instructing. Report, then STOP.**
- ⚠⚠ **NEVER explain away a defect Carl reports by eye as pre-existing, or as something he
  did not previously notice. Computed measurements are not evidence about visibility.
  HIS EYE IS THE VERDICT.**
- ⚠ **A workaround in one consumer is not a fix.** The mark collision was found on 14 August,
  written into `one-context.mjs`'s header, worked around there — and **left in the product
  for four days** while every other reader inherited it.

## CARL'S PREFERENCES

**Plain language, no jargon. Millisecond precision over vague description. He decides; do
not decide for him.** He builds in chunks and will say when to split one. **Where he mostly
agrees with a plan he pastes amendments into the "Tell Claude what to do instead" box**
rather than sending a fresh prompt.

## ENVIRONMENT TRAPS

- **Production is the verdict**; dev and production disagree.
- **Turbopack serves cached CSS failures.** Tell: a reported line number exceeding the
  file's length. `rm -rf .next`.
- ⚠ **`TaskStop` reports success on a held port. Kill by PID, confirm free.**
- `corridor-motion.mjs` **REFUSES :3000** — production only, **vertical-only and normalised
  0..1**, which removes a displaced origin by construction.

**Serving:** `npm run build && npx next start -p 3100`.
`?phasetrace=1` boundary edges · `?beattrace=1` the ladder · `?modetrace=1` Mode A/B ·
`?anchortrace=1` the anchor's rung and drift · `?nobtnmesh=1` **the button-mesh treatment arm**.

---

## ⛔ THE STANDING DIRECTIVE

**NEVER comment on how long Carl has been working.** Not the time of day, not the session
length, not a suggestion to stop or resume later. **Carl decides when a session ends and
will say so.** It was not broken this session.

---

*18 August 2026. ⚠ **The reveal finally has a stall instrument, and its first act was to show***
*⚠ **that one build can return 40ms or 640ms with nothing changed. Two candidates are now***
*⚠ **eliminated and the field is narrower. The button is the next one, and it must be***
*⚠⚠ **measured in a single sitting or not at all.***
