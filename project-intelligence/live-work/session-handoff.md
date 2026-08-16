# Session Handoff — 16 August 2026 (the boundary signal is PLANNED, not built)

**Read this first, then `project-intelligence/` as normal.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written** —
`live-work-protocol.md` §3a.

---

## ⚠⚠ FIRST THING NEXT SESSION

**Carl has a prompt saved with TWO AMENDMENTS to the boundary-signal plan.** He will paste it
at the start of the session. **Do not start building from the plan file until that prompt
arrives** — the amendments change it.

**The plan is at `C:\Users\Carl Buckley\.claude\plans\composed-sprouting-raccoon.md`.**
⚠ It is in the Claude plans directory, **not** in the repo — it is not committed and not
gitignored-scratch; it simply lives outside the tree. Read it before the amendments land.

---

## STATE

**Branch `fix/q5-stall-and-label-colour`. TREE CLEAN.**

**Remote and local level at `a8996b7`** — verified by `git ls-remote`, not by trusting push:

```
a8996b79ed53d41b01074307e25d58e6c9b1c4e8	refs/heads/fix/q5-stall-and-label-colour
```

⚠ **The plan file is NOT in that commit.** Nothing from the last planning turn is committed.

**Servers: none running.** Ports 3000 and 3100 both confirmed free, no node processes.

---

## THIS SESSION — 4 commits

```
1f720b6  the fault is the CARD-1 ENTRANCE DELAY, not a 1→2 gap compression
bcde727  two inline SUPERSEDED pointers beside the old name
96421ea  SUPERSEDED pointer on the card-2 mechanism paragraph
a8996b7  both dev traces carry per-card AND per-question identity
```

---

## ✅ CLOSED THIS SESSION

### 1. The cold run — cold is NOT the trigger

20 invocations, fresh server, **fresh browser AND fresh on-disk GPU profile per run** (the
harness `mkdtemp`s and `rmSync`s a profile per invocation, so 20 separate calls = 20 destroyed
shader caches). **2/20 compressed, or 1/19 excluding a compile-contaminated run 1.**

Three samples now: **40%, 0%, 10%.** ⚠ **Rate still unestablished.** 18 consecutive
cache-destroyed runs produced textbook-clean ladders.

### 2. ⚠ THE FAULT WAS MISNAMED FOR A WEEK — corrected in the record

**"The 1→2 gap compresses" is the wrong frame.** The NEAR end moves: card 1 arrives late,
card 2 arrives on time, and the gap is what is left. **Short form: the card-1 entrance delay.**

Run 20 (the clean failure): card 1 **+958** (194ms late) while card 3 (+1901) and card 5
(+3019) sit **1ms and 2ms** outside the clean band. **The tail does not move.**

⚠ **Why it survived a week: `card-1-anchor.mjs` measures every beat's offset FROM CARD 1.**
The origin sits on the thing that moves, so a displacement of card 1 can only ever present as
a gap. **SECOND time this harness's frame changed the apparent shape of this same fault.**

Record: `ladder-compression-samples-16-august.md`, corrected at the top with four inline
SUPERSEDED pointers below. ⚠ **Nothing was deleted** — the misread is part of the record.

### 3. Both dev traces now carry per-card AND per-question identity (`a8996b7`)

- **One shared accessor** `questionIdentity()`, called from four sites. ⚠ **It carries its own
  try/catch** — `:4026`/`:4177` sit inside try/catch, the beat site does not and is on the
  animation's hot path.
- **Substituted at both precedent sites**, verified like-for-like.
- ⚠ **NOT substituted at the modetrace `q` field** — that site emits the sentinel `"?"`, not
  `""`, and two consumers key on it. The accessor supplies the read; the sentinel stays.
- **Blank-key counter** `window.__traceIdentitySkips`.
- **All four injections shown RED before the green was accepted.**

⚠⚠ **A REGRESSION I CAUSED AND CAUGHT MID-BUILD.** The twin was first written as
`card-beat-${delayMs}-${q}`. Five dependents select with `startsWith("card-beat-")` then
`Number(name.replace(...))` — it parsed to **NaN** and `card-1-anchor.mjs` went ⛔ BROKEN on a
healthy run. **Prefix is now `card-qbeat-`.** *"Additive" is a claim about the CONSUMERS, not
the code.*

---

## ⚠⚠ OPTION B IS NO LONGER HYPOTHETICAL

**The skip counter reads 4 on EVERY page load — flag off included.** The two canvas marks are
not flag-gated, so the accessor runs regardless. **The DOM read is failing in normal
operation, not just at the corridor boundary.**

`questionIdentity()` returns `""` for the whole corridor move because
`enquiry-opening.tsx:1797` only pushes the `depth: 0` phrase when `!corridorMoving` — **during
a move `.enquiry-pdepth-0` is not in the DOM at all.**

**Option B lands inside the boundary-signal plan as one function body change**, exactly as the
`a8996b7` plan predicted.

---

## THE PLAN AWAITING AMENDMENTS — items 2 + 4, one decision, three landings

**Carl chose option 3: restructure `handleNextStep` into an explicit phase machine.**

**Three phases:** `settled` / `leaving` (t=0, drives the exit) / `arriving` (t=1150, re-arms
the entrance). **`corridorMoving` derived from the phase, not stored separately** — so its 8
reads keep working and there is no second source of truth. **One accessor, both edges.**

**Three gated steps:** ① phase machine + its instrument, **nothing animates**; ② entrance
re-arm (item 2); ③ the exit (item 4).

⚠ **Amendments already given in the rejected turn (carry them forward):** the phase machine
**publishes its transitions and is falsified in the same chunk**; **one accessor for both
edges**; and **three things to establish before any number becomes a comment.**

### ⚠ THE ARITHMETIC WAS WRONG IN MY OWN DIALOG — corrected

I wrote that a ~1060ms exit "finishes just as the space vacates." **It does not.** From source:
recession **900ms** (`globals.css:1659`), extras fade **900ms** (`:1887`), step timeout
**1150ms** (`enquiry-opening.tsx:1386`), exit ladder **~1060ms candidate**.

**A 1060ms exit from t=0 ends at t=1060 — 160ms AFTER the space vacates, 90ms before the
entrance.** ⚠ **The margin is 90ms, not zero.** None of these is a measurement; **no number
here goes into a comment or a harness constant before it is measured on a real run.**

---

## ⚠ OPEN ITEMS, LARGEST FIRST

### 1. The boundary signal — PLANNED, NOT BUILT. Awaiting Carl's two amendments.

### 2. ⚠ `verify/trace-identity.mjs` ENCODES THE CURRENT DEFECT

**It asserts Q4 entries are ABSENT. Correct today; WRONG the moment item 2 lands.**
**The assertion INVERTS in the same commit that makes Q4 produce beats** — it is not deleted.
The negative control ("Q5 survives the step intact") carries over unchanged. ⚠ **Its header
sentence "Q4 having no beat is the correct result" must not survive that change silently.**

### 3. ⚠ THE 0.78 DIMMING HAS STILL NEVER BEEN SEEN BY EYE

It reached a stylesheet first at `a8cee4b`. Outgoing cards depart at **0.78 now, 1.0 before.**
⚠ **It blocks three of the seven exit items** — #6 (does it fight the WebGL exit), #1 (curves),
#3 (compression). **Items 2, 4, 5, 7 do not depend on it.** Costs one walk.

### 4. Carl settles the seven open items in `card-exit-spec-16-august.md`

Recommendations are in the plan file. ⚠ **The trap stands: `.enquiry-phrase-extras-out`
(900ms CSS) NEVER touches the WebGL cards.** Today the cards have **no exit at all** — only
the DOM box fades. **A replacement, not a retiming.**

### 5. ⚠ A CONSEQUENCE CARL HAS NOT BEEN OFFERED

`entranceAnnounced` never resetting means the **label prewarm never runs for Q3, Q2 or Q1**.
**Step 2 would incidentally fix it** — so Step 2 changes *when GPU work happens for three
questions*, a performance change riding inside an animation fix. **Name it before it lands.**
This is the shape of §5a worked case 1.

### 6. The reveal is UNPROFILED (item 3) — independent, untouched

Spec written, not built: `reveal-instrument-spec-16-august.md`. The stall still reproduces.

### 7. Mobile has never been LOOKED AT. Rects yes, pixels no.

---

## ⚠ FIVE INSTANCES OF THE MEASUREMENT-TRUST PATTERN — STILL CARL'S

Tabulated in `ladder-compression-samples-16-august.md`. ⚠ **A SECOND OCCURRENCE OF INSTANCE 5
was found this session** (the card-1 frame-of-reference misread) and is recorded there as a
second occurrence, **not a sixth instance.**

⚠⚠ **CARL IS HOLDING THESE FOR A GOVERNANCE REVIEW. Do not act on them, do not consolidate
them, do not propose a rule.**

---

## SERVING

`npm run dev -- -p 3100`. ⚠ **Next 16 refuses a second dev server for the same directory** —
it reports the holding PID and exits 1. Kill by PID and confirm the port free.
⚠ **`entrance-fade.mjs` and `label-with-card.mjs` hardcode `:3000`** and ignore
`VERIFY_BASE_URL`. ⚠ **`entrance-fade.mjs` currently fails on a PRE-EXISTING strict-mode
selector ambiguity** — confirmed identical on a stashed pre-change tree, not caused by
`a8996b7`.

---

## ⛔ THE STANDING DIRECTIVE

**NEVER comment on how long Carl has been working.** Not the time of day, not the session
length, not a suggestion to stop or resume later. **Carl decides when a session ends and will
say so.** It was not broken this session.

---

*16 August 2026. ⚠ **The instruments now say which question they are talking about. What is***
*⚠ **still missing is the thing the SYSTEM uses to know — and that is planned, amended twice,***
*⚠ **and awaiting Carl's saved prompt.***
