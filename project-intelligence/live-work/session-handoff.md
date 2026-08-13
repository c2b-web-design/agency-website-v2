# Session Handoff — 11–12 August 2026 (the misstep was found; the fix worked and broke the layout)

---

## ✅ THE DELETE INSTRUCTION IS RESCINDED — 13 August 2026

**Carl, 13 August 2026:** *"The last session was a disaster with mistakes from both of us that
had me quitting months of work. That will not be the case. The first task is to correct some of
the damage."*

**The project continues.** The 12 August instruction to delete the project and all associated
files is **withdrawn and must not be acted on.** Nothing was deleted; the repository, the
remote, the Architect seat and `brand-assets/` are all intact.

⚠ **Retained here only so a future reader who has heard of the instruction can see it was
cancelled** — not as a live item.

---

**Read this first, then `project-intelligence/` as normal.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written** —
`live-work-protocol.md` §3a.

---

## ⛔ THE STANDING DIRECTIVE

**NEVER comment on how long Carl has been working.** Not the time of day, not the session length,
not a suggestion to stop or resume later. **Carl decides when a session ends and will say so.**
It was not broken this session.

---

## 🔴 READ THIS BEFORE YOU MEASURE ANYTHING

**Carl's judgement of this session, in his words:**

> *"This is what i hear. i know the problem, oh its not that. Wait, its definately this, oh, the
> tool i built is wrong. Ah, now ive got it. Do you know what happens in the real world if an
> employee works like that."*

**And the standing correction that came out of it:**

> **The pattern is that the Builder trusted numbers over Carl's eye.** Every time they
> disagreed this session, **Carl was right.** Including when he tested `:3100` and found the
> numbers meaningless, and when he looked at the shared host and saw a broken layout that three
> green instruments had just passed.

⚠ **WHEN CARL REPORTS SOMETHING VISUAL, THAT IS THE SPECIFICATION — NOT A HYPOTHESIS TO TEST.**
The measurement's only job after that is to find the cause of *the thing he named*. **If a
harness says "nothing is wrong", the harness is finished and wrong.** That inversion happened
repeatedly today and it is the single most expensive habit in this project.

⚠ **AND MARK GUESSES AS GUESSES OUT LOUD.** Four hypotheses were presented with the same
confidence as the eventual finding, so Carl had no way to tell knowing from guessing.

---

## 🔴 THE DEFECT, LOCATED — AND THE FIX THAT ALMOST WORKED

### What Carl sees

> *"Q5 reveals. i chose card 1. Pressed next step and then Q5 as it moved up into position
> stuttered."* … *"its not a noticeable stutter, it doesnt look smooth in comparison to the text
> and subtext at the beginning of the start page."* … *"a noticable pause after the first word.
> Not as bad as a stutter, but its there. After this pause the rest of the reveal is even. Its
> like watching a runner who makes a misstep."* … **and on every question, not just Q5.**

### The cause, measured by the Architect (12 August)

Q5's phrase is 310px wiped over 1300ms linear — **~78 frames at 60Hz. Measured 60, 70, 69.**

    word edges:   What 17%   brought 45%   you 59%   here 75%   today? 100%
    run 1  canvas created +170ms (13%) → compiled +526ms (40%)  → 117ms freeze at 41%
    run 2  canvas created  +96ms  (7%) → compiled +288ms (22%)  → 117ms freeze at 24%
    run 3  canvas created  +93ms  (7%) → compiled +289ms (22%)  → 117ms freeze at 26%

⚠⚠ **THE FREEZE TRACKS THE SHADER COMPILE.** Not a fixed point in the wipe — wherever the card
canvas finishes. It always lands between "What" and "brought", **exactly one word in**, because
the compile finishes 290–530ms into a wipe whose first word clears at 221ms.

⚠ **AND IT IS IN THE GPU PROCESS, NOT THE MAIN THREAD.** CDP trace:
`CommandBuffer::Flush` / `GpuChannel::ExecuteDeferredRequest`, four blocks ~164ms, **renderer
idle.** That is why every main-thread instrument called the page healthy — and why moving the
wipe to a composited property was the wrong target twice.

**The control clears the technique:** the heading and subtext use the SAME
`enquiry-mask-reveal-horizontal` keyframes on the same page and deliver 112–251 frames cleanly.
**The moment is guilty, not the mechanism.**

Full analysis: `live-work/architect-analysis-wipe-misstep.md`.

### ✅ THE SHARED HOST WORKED — AND WAS REVERTED

**Built, measured, reverted in the same hour. The mechanism is proven; the implementation is not.**

| | before | with the host |
|---|---|---|
| Q5 wipe frames of ~78 | 60 / 70 / 69 | **75 / 80 / 80 / 80** |
| ~120ms freeze at 22–41% | every run | **gone — nothing past 13% in 3 of 4 runs** |
| `card-canvas-created` | once per question | **once, at Q5, never again** |

⚠⚠ **AND CARL LOOKED AT IT AND THE CARDS WERE ABOVE THE QUESTION TEXT.** Five cards ~230px too
high, sitting over the corridor. Screenshot at `?modetrace=1`.

**The cause:** the canvas positions `absolute` from `box.left/top`, which were grid-relative only
because it rendered INSIDE `.enquiry-answer-grid`. From a zero-size host the offset must be
measured, and it resolved against a different `offsetParent`. **Exactly the hazard D-046 named.**

⚠⚠ **THREE GREEN INSTRUMENTS, ONE BROKEN SCREEN.** `active-grid-fixed.mjs` passed (it measures
the grid `<div>`, which never moved). The wipe harness passed (frames genuinely were delivered).
A canvas-vs-grid box check passed at 432/493/576 on both — **because it compared two
`getBoundingClientRect` calls in viewport space while the CSS `left/top` resolved against
something else.** Carl caught it in one look.

**What a correct version needs:** the canvas must derive position from the grid's rect **in the
same coordinate space it renders in**, verified by a pixel check that the cards sit BELOW the
phrase — never by comparing two rects. A tombstone in `enquiry-opening.tsx` below
`.enquiry-phrase-band` records this in full.

### ⚠ TWO MOUNT SITES REMAIN, AND ONE IS THE NEXT JOB

`NextStepMeshButton` (`enquiry-opening.tsx:1493`) is **still inside the keyed phrase**, so it
creates a context per step — contexts still climbed 4→8 across a walk with the card host in
place. The card canvas was fixed; the button was not.

---

## ⚠ THE FIXED-POSITION FINDING — LOAD-BEARING, AND ALREADY PROVEN

**The constraint that blocked D-048 for three days does not apply.** `verify/active-grid-fixed.mjs`,
**25 samples across 5 runs**, every question:

    Q5..Q1   top 492.78   left 432.22   576 x 104

Identical to the hundredth of a pixel. The 435→493px travel belongs to the **receding** copy —
`enquiry-opening.tsx` withholds the active phrase entirely while `corridorMoving`. **A canvas
hosted at the active position sits still for the whole corridor; there is no easing to reproduce.**

⚠ **THE ARCHITECT'S 12 AUGUST ANALYSIS SAYS THIS HARNESS "HAS NEVER BEEN RUN". IT HAS** — twice,
02:46 and 03:30. Do not re-open it as an unknown.

---

## ✅ WHAT LANDED AND VERIFIED (all uncommitted)

- **Traveller gated on `animating`** — five glass cards were rendering at 60fps inside a
  `visibility: hidden` box for the entire ~12s opening, and two canvases rendered through every
  move. Ladder and motion gates held.
- **`prewarmLabelCanvases`** — paints the next question's labels during the corridor dwell.
- **Ladder anchor decoupled** from the CSS animation name (`onAnimationStart` publishes
  `__revealStart`). Verified 0% Mode B across 90 samples on its own.
- **Per-question compile marks**, `?modetrace=1`, `?labeltex=`, `?pmrem=`, `?riseease=` — all
  defaults unchanged.
- **Stale comments corrected**: the 2048 oversample justification (it measured the grid, not the
  face), the `frameloop="demand"` claim, the PMREM "open defect" heading.

### D-049 — the Architect now has `Bash`

Carl's decision, after four requests. `Bash`, `Monitor`, `TaskOutput`, `TaskStop` removed from
deny; twelve measurement commands pre-approved. **`Edit`/`Write`/`NotebookEdit` still denied —
and with a shell that is cosmetic**, so the write boundary is now discipline
(`architect-role.md` §2). Live file backed up, reference reconciled, no drift.
**⚠ THE ARCHITECT MUST RESTART TO PICK IT UP.**

---

## ⚠⚠ FOURTEEN INSTRUMENT FAULTS. FOUR ARE NEW TODAY.

| # | the lie |
|---|---|
| 12 | **A correct harness, correctly run, at TOO FEW ROUNDS.** The canvas-cache arm read **−22ms** over 4 interleaved rounds — clean, decisive, would have shipped as a fix. Repeated: **+1ms**, then **+13ms**. It is noise. **Interleaving removes order effects; it does not remove variance.** Caught the Builder three times in one day. |
| 13 | `wipe-evenness.mjs` divides Δclip by Δ`animation.currentTime`. Under `linear` timing that ratio is **constant by construction** — it would report a perfectly even wipe **on a frozen page.** |
| 14 | `wipe-screencast.mjs` measured **the opening**, at t=3.2s, before Begin was clicked — an 88px "travel" at x≈1281 for a phrase 310px wide at x=589. Its rightmost-bright-pixel heuristic locks onto the wrong element, and `Page.startScreencast` is ack-throttled to ~15fps so it cannot resolve a dropped frame anyway. |
| — | **`q5-recede.mjs` is broken and known-broken.** `querySelector(".enquiry-phrase-anim")` returns the FIRST phrase in document order; during a move both exist. Instrument fault #11 repeating. |

⚠ **13, 14 AND `q5-recede.mjs` ARE STILL ON DISK PRESENTING AS WORKING HARNESSES.**

⚠ **AND `corridor-motion.mjs --compare` CANNOT BE TRUSTED ACROSS RUNS OF DIFFERING SPAN** — it
normalises over the whole sample window. It reported 2.9% on a change that was 0.83px when
aligned on the move itself. Instrument fault #10 recurring in the same harness.

---

## ⚠ WHAT WAS TRIED AND FAILED — DO NOT REPEAT

1. **`will-change: clip-path`** — no effect. **Chrome cannot composite `clip-path` at all.**
2. **Transform-based wipe, attempt 1** — production Mode B **0% → 60%.** Reverted.
3. **Transform-based wipe, attempt 2**, after decoupling the anchor — **0% → 90%.** Reverted.
   ⚠ The anchor fix verified clean on its own first, so **the diagnosis of attempt 1's failure
   was also wrong.**
4. **Contact-field pre-warm as the walk-spike cause** — falsified. Created at Begin+~5340ms
   deterministically; spikes land at +10046 to +14978ms.
5. **GC from texture churn** — cleared. Forcing collection made it slightly worse.
6. **Walk-depth correlation** — broken by a 794ms spike on Q4→Q3.

⚠ **AND PROMOTING THE WIPE TO A COMPOSITED PROPERTY CANNOT FULLY FIX THIS** — the freeze is
GPU-process work and the display compositor queues behind the same scheduler.

---

## STATE OF THE TREE

**Branch `fix/q5-stall-and-label-colour`, head `0f2d4d0`, NOTHING COMMITTED.**

Modified: `CLAUDE.md`, `app/globals.css`, `answer-card-canvas.tsx`, `answer-card-mesh.tsx`,
`contact-field-canvas.tsx`, `enquiry-opening.tsx`, `verify/transition-cost.mjs`, and six
governance files.

⚠ **`app/globals.css` HAS ONLY THE `.enquiry-card-host` RULE ADDED** — both failed wipe rewrites
were reverted with `git checkout`. The rule is now unused; harmless, and left as the tombstone's
companion.

`npx tsc --noEmit` **clean**. `npm run lint` **1 problem (1 error, 0 warnings)** — the known
`enquiry-opening.tsx` baseline error, untouched.

**All servers stopped; ports 3000, 3001 and 3100 confirmed free.**

⚠ **ZOMBIE SERVERS CAUGHT FOUR TIMES TODAY.** `TaskStop` reports success while the port stays
held. **Kill by PID and confirm free.**

---

## 📌 WAITING FOR CARL'S EYE (nothing shipped on any of these)

    ?labeltex=1024 / 512     45-78ms off the reveal; default still 2048 (≥11x oversampled)
    ?pmrem=128 / 64          inside the per-question cost; changes reflections
    ?riseease=inout / quad / linear    the card rise curve; default cubic

---

## ⚠ THE AGREED NEXT STEP

**Rebuild the shared host with correct positioning.** The mechanism is proven — 75–80 frames of
78, freeze gone. What failed was one coordinate-space error, and the tombstone in
`enquiry-opening.tsx` says what a correct version needs.

⚠ **VERIFY IT WITH A PIXEL CHECK — CARDS BELOW THE PHRASE — BEFORE QUOTING ANY FRAME NUMBER.**
Three green instruments passed a visibly broken layout today. **Screenshot it and look.**

Then: the `NextStepMeshButton` host, and `?nowarmup=1` to test whether the warm-up is redundant
once a host that never unmounts exists (**verify after, never delete on reasoning** — D-046
records that the obvious reading was refuted by measurement).

---

*12 August 2026. The defect is located and the fix is proven in principle. It has not landed.
Carl's decision on whether this project continues is open, and the honest summary is that a
correct diagnosis arrived from outside and the Builder broke the layout implementing it.*
