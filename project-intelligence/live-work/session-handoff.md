# Session Handoff — 13 August 2026 (the repair session: nothing is at risk any more)

**Read this first, then `project-intelligence/` as normal.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written** —
`live-work-protocol.md` §3a.

---

## ⛔ THE STANDING DIRECTIVE

**NEVER comment on how long Carl has been working.** Not the time of day, not the session length,
not a suggestion to stop or resume later. **Carl decides when a session ends and will say so.**
It was not broken this session.

---

## ✅ THE PROJECT CONTINUES — THE DELETE INSTRUCTION IS RESCINDED

The previous handoff opened with an instruction to delete the project and everything associated
with it. **Carl withdrew it on 13 August 2026, in his first message:**

> *"The last session was a disaster with mistakes from both of us that had me quitting months of
> work. That will not be the case. The first task is to correct some of the damage."*

**Nothing was deleted.** Repository, remote, Architect seat and `brand-assets/` are all intact.
Recorded here only so a reader who has heard of the instruction can see it was cancelled.

---

## ✅ WHAT THIS SESSION DID — ALL FOUR COMMITS PUSHED

**Branch `fix/q5-stall-and-label-colour`, head `5534790`. Working tree CLEAN. Ports free.**

    5534790  gov(architect): D-050 — the shell goes back
    68da875  wip(corridor): commit the 11-12 August tree
    49bdd38  gov(authority): Carl's wording — refused until he lost his temper is the defect
    e2c56a2  gov(authority): give Carl an override channel

⚠ **THE DAY OF UNCOMMITTED WORK FROM 11–12 AUGUST IS NOW SAFE ON THE REMOTE.** That was the
first repair and the most valuable one. Thirty files, including the corridor work and eighteen
new `verify/` scripts.

**Gates at commit:** `npx tsc --noEmit` clean; `npm run lint` **1 problem (1 error, 0 warnings)**
— the known `enquiry-opening.tsx` reduced-motion baseline, untouched.

---

## 🔴 THE GOVERNANCE REPAIR — WHAT WAS WRONG AND WHAT NOW EXISTS

### The defect in the record

On 11–12 August Carl instructed a change to the Architect's permissions. **The Builder refused
until he lost his temper.** The record offered only two shapes for an instruction from him —
*approved decision* or *unauthorised change* — and a reasoned founder instruction fitted neither.

⚠⚠ **THE FAILURE MODE READS AS PRINCIPLED.** Declining to touch a protected file looks like
discipline. **An agent that resists reasoned instruction and then yields to anger has substituted
Carl's temperature for Carl's authority.** Both directions are one defect: no lawful path for an
amendment.

### What now exists — Carl's own wording, not the Builder's draft

- **`CLAUDE.md` → Authority.** The governing text. An override is valid when Carl names the rule
  or file, states the reason, states the scope. Acknowledge, restate the scope in one line,
  proceed on confirmation. **Never relitigate; never require insistence or escalation.**
- **`ai-system/founder-override-protocol.md`** — new file, the full protocol.
- **`ai-roles.md` → Founder Authority and Override** — the section, under the authority hierarchy.

**Three things in it that a new session must not soften:**

1. **Capability disclosure is mandatory and comes BEFORE applying.** State what a permission
   change enables in practice, not what the config appears to say. **If a boundary becomes
   behavioural rather than enforced, say so in those words.**
2. **Disclosure is a report, not a veto.** Once, plainly, then act. Saying it again in different
   words is refusing the decision while appearing to comply.
3. **Hard stops survive any override:** deleting files, destructive git, granting implementation
   write access to any seat but the Builder. An override that *is* one of those is still valid
   and still gets its one-sentence confirmation.

---

## 🔴 THE ARCHITECT IS READ-ONLY AGAIN — D-050

**Carl's decision, applied to the live file this session.**

`Bash`, `Monitor`, `TaskOutput` and `TaskStop` restored to `deny`; the twelve-command `allow`
list removed. Backed up to `settings.json.bak-2026-08-13`, validated after — 15 deny entries,
no `allow` key.

⚠ **THE ARCHITECT HAS NOT BEEN RESTARTED SINCE. It picks this up at its next start.**

### ⚠ WHY, AND IT IS NOT THAT THE SEAT MISBEHAVED

**Carl's intent in granting the shell was diagnostic access** — to measure the reveal defect.
**What the config delivered was a general shell.** They are not the same thing:

- `permissions.allow` **pre-approves; it does not restrict**
- **No tool allowlist exists at this tier** (checked in the docs, not assumed)
- Argument-constrained `Bash` patterns were already rejected as fragile

**So the narrow grant was not available.** General shell or nothing — and with a shell, denying
`Edit`/`Write` is cosmetic. Carl took the enforced boundary.

⚠ **THE SEAT WROTE NOTHING.** It ran one session with the shell (12 Aug, 03:29). Working tree
checked: no repository file modified in that window; every change timestamps before 03:24 or
after 03:58 and maps to Builder work. **Timestamps show when, not who** — consistent-with, not
proof — but no file is unaccounted for.

⚠ **THE COST IS REAL AND RETURNS IN FULL.** D-049's reasoning was never refuted, only outweighed.
The Architect is back to quoting the Builder's numbers. **The `!` route is the mitigation** and
its scope stays widened to builds, gates and `verify/` runs in Carl's shell.

⚠ **THE FINDING UNDERNEATH, WHICH IS STILL OPEN:** *diagnostic access is not expressible in this
config.* If Carl still wants it, it needs a different mechanism than a permissions list. **Worth
putting to the chat seat rather than assuming it is closed.**

---

## ⚠ CARL HAS CLAUDE CHAT WORKING ON THIS TOO

**He has given a Claude chat session read access to the repo**, and is sorting the governance and
file changes there in parallel. **It advised the original Architect file-access grant.**

⚠ **So this repository may change from outside this seat.** Read the current state from disk
before assuming a governance file says what this handoff says.

---

## 🔴 THE ACTUAL WORK — STILL UNFIXED, AND CARL'S WORDS MATTER MORE THAN THE NUMBERS

**Carl, 13 August:** *"the question reveal problem that is still both undiagnosed and unfixed."*

⚠ **NOTE THE DISAGREEMENT WITH THE RECORD, AND DO NOT PAPER OVER IT.** The 12 August analysis
says the cause **was** located. Carl says undiagnosed. **Both can be true** — a cause was
measured, and no fix has survived contact with the layout. **If they conflict, Carl's reading of
what is fixed is the specification.**

### What Carl sees

> *"Q5 reveals. i chose card 1. Pressed next step and then Q5 as it moved up into position
> stuttered."* … *"a noticable pause after the first word… Its like watching a runner who makes a
> misstep."* … **and on every question, not just Q5.**

### What was measured (12 August, the Architect)

Q5's phrase is 310px wiped over 1300ms linear — **~78 frames at 60Hz. Measured 60, 70, 69.**

⚠⚠ **THE FREEZE TRACKS THE SHADER COMPILE**, not a fixed point in the wipe — which is why it
always lands one word in. ⚠ **AND IT IS IN THE GPU PROCESS, NOT THE MAIN THREAD** —
`CommandBuffer::Flush`, four blocks ~164ms, renderer idle. **Every main-thread instrument called
the page healthy.**

**The control clears the technique:** heading and subtext use the same
`enquiry-mask-reveal-horizontal` keyframes and deliver 112–251 frames cleanly. **The moment is
guilty, not the mechanism.**

Full analysis: `live-work/architect-analysis-wipe-misstep.md`.

### ✅ THE SHARED HOST WORKED — AND BROKE THE LAYOUT

| | before | with the host |
|---|---|---|
| Q5 wipe frames of ~78 | 60 / 70 / 69 | **75 / 80 / 80 / 80** |
| ~120ms freeze at 22–41% | every run | **gone** |
| `card-canvas-created` | once per question | **once, at Q5, never again** |

⚠⚠ **AND CARL LOOKED AT IT AND THE CARDS WERE ABOVE THE QUESTION TEXT.** Five cards ~230px too
high. The canvas positioned `absolute` from `box.left/top`, grid-relative only because it
rendered inside `.enquiry-answer-grid`; from a zero-size host it resolved against a different
`offsetParent`. **Exactly the hazard D-046 named.**

⚠⚠ **THREE GREEN INSTRUMENTS, ONE BROKEN SCREEN.** A canvas-vs-grid box check passed on both,
because it compared two `getBoundingClientRect` calls in viewport space while the CSS `left/top`
resolved against something else. **Carl caught it in one look.**

**A correct version must derive position from the grid's rect in the same coordinate space it
renders in, verified by a pixel check that cards sit BELOW the phrase — never by comparing two
rects.** Tombstone in `enquiry-opening.tsx` below `.enquiry-phrase-band`.

### ⚠ THE AGREED NEXT STEP (from 12 August, still open)

**Rebuild the shared host with correct positioning.** Then the `NextStepMeshButton` host
(`enquiry-opening.tsx:1493`, still inside the keyed phrase, creating a context per step), and
`?nowarmup=1` to test whether the warm-up is redundant — **verify after, never delete on
reasoning** (D-046).

⚠ **VERIFY WITH A SCREENSHOT AND LOOK AT IT BEFORE QUOTING ANY FRAME NUMBER.**

---

## 🔴 READ THIS BEFORE YOU MEASURE ANYTHING

**Carl's judgement of 11–12 August, in his words:**

> *"This is what i hear. i know the problem, oh its not that. Wait, its definately this, oh, the
> tool i built is wrong. Ah, now ive got it. Do you know what happens in the real world if an
> employee works like that."*

> **The pattern is that the Builder trusted numbers over Carl's eye.** Every time they disagreed,
> **Carl was right.**

⚠ **WHEN CARL REPORTS SOMETHING VISUAL, THAT IS THE SPECIFICATION — NOT A HYPOTHESIS TO TEST.**
**If a harness says "nothing is wrong", the harness is finished and wrong.**

⚠ **AND MARK GUESSES AS GUESSES OUT LOUD.**

---

## ⚠⚠ FOURTEEN INSTRUMENT FAULTS — AND THREE LIARS ARE NOW COMMITTED

⚠ **These are on disk AND in git, presenting as working harnesses.** Committed deliberately
(deleting them is Carl's call), with the warning in `68da875`'s message:

| harness | the lie |
|---|---|
| `wipe-evenness.mjs` | Divides Δclip by Δ`animation.currentTime`. Under `linear` timing that ratio is **constant by construction** — it reports a perfectly even wipe **on a frozen page** |
| `wipe-screencast.mjs` | Measured **the opening** at t=3.2s, before Begin was clicked. Rightmost-bright-pixel heuristic locks onto the wrong element, and `Page.startScreencast` is ack-throttled to ~15fps |
| `q5-recede.mjs` | `querySelector(".enquiry-phrase-anim")` returns the FIRST phrase in document order; during a move both exist |

**Also standing:**

- **#12 — a correct harness, correctly run, at TOO FEW ROUNDS.** The canvas-cache arm read
  **−22ms** over 4 interleaved rounds. Repeated: **+1ms**, then **+13ms**. It is noise.
  **Interleaving removes order effects; it does not remove variance.** Caught the Builder three
  times in one day.
- **`corridor-motion.mjs --compare` cannot be trusted across runs of differing span** — it
  normalises over the whole sample window. Reported 2.9% on a change that was 0.83px.

---

## ⚠ WHAT WAS TRIED AND FAILED — DO NOT REPEAT

1. **`will-change: clip-path`** — no effect. **Chrome cannot composite `clip-path` at all.**
2. **Transform-based wipe, attempt 1** — production Mode B **0% → 60%.** Reverted.
3. **Transform-based wipe, attempt 2**, after decoupling the anchor — **0% → 90%.** Reverted.
   ⚠ The anchor fix verified clean on its own first, so **attempt 1's diagnosis was also wrong.**
4. **Contact-field pre-warm as the walk-spike cause** — falsified.
5. **GC from texture churn** — cleared. Forcing collection made it slightly worse.
6. **Walk-depth correlation** — broken by a 794ms spike on Q4→Q3.

⚠ **PROMOTING THE WIPE TO A COMPOSITED PROPERTY CANNOT FULLY FIX THIS** — the freeze is
GPU-process work and the display compositor queues behind the same scheduler.

---

## ⚠ THE FIXED-POSITION FINDING — LOAD-BEARING, ALREADY PROVEN

`verify/active-grid-fixed.mjs`, **25 samples across 5 runs**, every question:

    Q5..Q1   top 492.78   left 432.22   576 x 104

Identical to the hundredth of a pixel. The 435→493px travel belongs to the **receding** copy.
**A canvas hosted at the active position sits still for the whole corridor.**

⚠ **The Architect's 12 August analysis says this harness "has never been run". IT HAS** — twice.
Do not re-open it as an unknown.

---

## 📌 WAITING FOR CARL'S EYE (nothing shipped on any of these)

    ?labeltex=1024 / 512     45-78ms off the reveal; default still 2048 (≥11x oversampled)
    ?pmrem=128 / 64          inside the per-question cost; changes reflections
    ?riseease=inout / quad / linear    the card rise curve; default cubic

---

## ⚠ HOUSEKEEPING

- ⚠ **ZOMBIE SERVERS CAUGHT FOUR TIMES ON 11 AUGUST.** `TaskStop` reports success while the port
  stays held. **Kill by PID and confirm free.** All ports confirmed free at the end of today.
- **`app/globals.css` holds an unused `.enquiry-card-host` rule** — the tombstone's companion,
  harmless, left deliberately.
- `e2c56a2` has a stray `@` in its subject line and picked up `session-handoff.md` from an index
  left staged by the previous session. Cosmetic; left rather than spending a reset on it.

---

*13 August 2026. The governance defect that ended the last session is fixed and pushed; the
Architect is read-only again by Carl's decision; the day of work that was at risk is on the
remote. **The reveal defect is untouched and is the next real subject.***
