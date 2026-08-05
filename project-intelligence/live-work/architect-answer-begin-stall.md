# Architect answer — the Begin button stall

**Received 5 August 2026, in response to `architect-question-begin-stall.md`.**

⚠ **TRANSCRIBED BY THE BUILDER, because the Architect's Write was disabled this session.** The
Builder is an interested party in its own review: **if this file and the Architect's own window
ever differ, the Architect's window is the authority.** Recorded per `handoff-protocol.md` §2.5.

Read out of the code at `d2be6b5`. **Nothing here was measured**; the one claim that must be is
isolated in Step 2. Line numbers are as of that head.

---

## The short answer

1. **Q1 — option D is right, but not first, and possibly not needed.** Measure before
   restructuring; there's a real chance the fix is a deletion.
2. **Q2 — there is no coupling to understand. One flag is doing two jobs.** It's a wiring defect,
   one line wide.
3. **Q3 — there is no correct edge.** The opening animates continuously 600→12400ms. Every edge
   inside it is inside an animation.
4. **Q4 — yes, one run settles it.**

---

## Q2 first, because everything is blocked behind it

**`cardCanvasWarm` is not the warm-up's mount gate. It is the warm-up's mount gate AND the `warm`
prop on the real Q5 canvas:**

- `enquiry-opening.tsx:1204` — `{stage === "opening" && cardCanvasWarm && (…<AnswerCardCanvas warm />)}`
- `enquiry-opening.tsx:960` — `<AnswerCardCanvas active={isActive} warm={cardCanvasWarm} … />` ← **here**

And on the receiving side:

- `answer-card-canvas.tsx:1779` — `const entranceRunning = active && compiled && warm;`
- `answer-card-canvas.tsx:1856` — `<CardScene … mayCompile={warm} />`
- `answer-card-canvas.tsx:1770` — `markWarm` is what sets `compiled`

So `cardCanvasWarm === false` means, for the real canvas: `mayCompile` false → `useScenePrecompile`
returns early → `onWarm` never fires → `compiled` never true → `entranceRunning` false on two terms
→ `CardScene` gets `active={false}` → **the cards never enter.**

### That is the whole of attempt 4, and it was not a trade-off

The `animationend` listener sits on `.enquiry-button-mask`, inside the `stage === "opening"` branch
(`:1222`). The reveal runs 7400→12400ms and Begin becomes pressable at 7400ms (`setBeginActive` at
`animationstart`, `:1254-1263`). **Any user who presses Begin during those five seconds destroys the
element before its `animationend` fires.** The gate never opens again for the session.

The probe's two findings were one finding: *"the warm-up canvas never mounts"* is `:1204` failing,
and the *"entrance 6 seconds earlier"* was a beat being timed that never ran.

⚠ **Attempt 4 did not reveal a hidden dependency. It revealed a gate whose opening event is
destroyed by the user action it waits behind. Don't understand this coupling — remove it.**

**One thing worked and should be recorded:** `ENTRANCE_ANCHOR_CEILING_MS` (`:165`) is why only the
cards were lost and not the contact field too. The comment at `:156` — *"a state gate is never the
only exit"* — predicted exactly this.

---

## Q3 — why four attempts moved the symptom and none removed it

Straight off `globals.css:165-186`:

| element | delay | duration | window |
|---|---|---|---|
| heading line 1 | 600 | 2100 | 600 → 2700 |
| heading line 2 | 2100 | 2100 | 2100 → 4200 |
| subtext | 3600 | 4200 | 3600 → 7800 |
| Begin reveal | 7400 | 5000 | 7400 → 12400 |

**The opening animates without a break from 600ms to 12400ms.** The comment at
`enquiry-opening.tsx:486` — *"a large, genuinely idle window"* — **is false**, and the file already
records that it's false at `:142`. The two contradict each other, and the effect is written against
the wrong one. This is why `requestIdleCallback` has never fired on idle and every backstop has
fired unguarded: **the backstop isn't a backstop here, it's the only path.**

**The only animation-free window on the page is 0 → 600ms.**

> **A blocking task BEFORE an animation starts DELAYS it. A blocking task DURING an animation
> STUTTERS it.**

900ms picked the heading, 5200ms picked the subtext, `beginActive` picked the Begin reveal. **Each
attempt only chose which animation to stutter.** `beginActive` was the right instinct at the wrong
edge — and the timeline adds that **there was no right edge available.**

---

## What to do, in order

### Step 1 — unhook the real canvas. Alone, and commit it.

`enquiry-opening.tsx:960` — **drop `warm={cardCanvasWarm}`**. The prop defaults to `true`
(`answer-card-canvas.tsx:1610`), so that's the whole edit.

**Safe, not a weakening:** the real canvas only mounts inside the phrase band, gated on
`stage !== "opening"` (`:1087`) — it does not exist until after Begin, so the choreography `warm`
was protecting is already over. And on every normal path the flag is already true when it mounts.
**Leave the `warm` prop and `mayCompile` on the component** — that's the seam option D uses; this
changes the caller, not the contract.

**It buys:** the cards can never again be hostage to warm-up scheduling. Attempt 4's failure mode is
gone permanently and every later experiment becomes safe to run. ⚠ **It does not fix the stall —
don't report it as the fix.**

### Step 2 — the instrument (Q4)

**The one unverified claim holding up every decision: that the warm-up buys the real canvas
anything.** The per-canvas-context reasoning is sound, but *"only the binary cache crosses"* is not
*"the binary cache is worth 641ms"*, and that has never been tested.

- Instrument **the real Q5 canvas only**: `performance.mark` at the `Canvas` `onCreated` (`:1841`)
  and inside `markWarm` (`:1770`). **Mount → compiled is the number.**
- **A:** warm-up as today. **B:** `:1204` block commented out. ⚠ **B is only safe after Step 1.**
- ⚠ **Cold GPU profile every run — fresh `--user-data-dir`.** ANGLE's program cache is on disk and
  persists. Otherwise both arms are warm and **the test cannot fail** — exactly the trap in the
  session's own lesson.
- **Headed, `--enable-gpu`, print the renderer string.** Three runs per arm. Also record whether the
  641ms task appears at all in B, and where frames drop.

**B ≈ A** → the warm-up buys nothing → **Step 3a**. **B materially worse** → the cache is real →
**Step 3b**. Capture the real canvas's cold setup cost while you're there; Step 4 needs it.

### Step 3a — if it buys nothing: delete it

Remove `:1204-1220`, the `cardCanvasWarm` state and effect (`:494-552`), and
`OPENING_WARM_LEAD_MS` (`:150`). Nothing left to schedule, so the stall has nowhere to occur.
⚠ **Expect the first-run Q5 "W+h" stutter to get more visible** — that's the honest trade, and
Step 4 pays it off. **Don't ship 3a alone and call the stall fixed.**

### Step 3b — if it buys something: option D, and its real shape

- **Mount in the region that already survives every stage** — the block holding the contact layer
  (`:1136`) and today's warm-up (`:1204`), both outside the `stage === "opening" ? … :` ternary at
  `:1222`. The contact layer already depends on this; **it's proven, not assumed.**
- Both shells give a containing block: `.enquiry-shell-active` is `position: relative`
  (`globals.css:208`) and `.enquiry-shell-opening`'s transform (`:198`) establishes one in its own
  right.
- ⚠ **The placement problem is real.** The canvas is `left:0/top:0` inside `.enquiry-answer-grid`,
  inside `.enquiry-phrase-extras` — `position:absolute; top: calc(100% + 1rem)` of the active phrase
  (`globals.css:1833`). Its screen position derives from the phrase's height, which differs per
  question and moves with the corridor. A canvas parked in the shell needs that offset as a
  transform, measured from the grid's rect and re-applied when the corridor settles. **This is
  option D's entire cost — plan it before touching anything.**
- ⚠ **Translate, never resize.** `protoCanvasBox()` returns a constant `GRID_WIDTH_PX` ×
  `GRID_HEIGHT_PX` at 0,0 (`answer-card-geometry.ts:417-429`) — it does not measure its parent.
  **That constant box is what makes D safe:** the world-unit mapping is independent of where the
  node hangs, provided it is translated and never resized. Hide with `visibility`, never
  `display:none`. The Builder's constraint 2 is correct, **and this is why it's satisfiable.**
- ⚠ **The `FilamentLight` constraint isn't engaged** — D doesn't touch the scene graph. It becomes
  engaged the moment someone hides the card group instead of the wrapper. **Don't.**
- **It buys:** one context, no rebuild at +6913ms, and `compiled` already true when Q5 arrives, so
  `entranceRunning` flips the instant `active` does — **item 2, the card-1 anchor, resolves as a
  consequence rather than as its own chunk.** That's the strongest argument for D and worth putting
  to Carl in those terms.

### Step 4 — the ordering inversion. This is the actual fix.

A compile still has to happen somewhere, and every "somewhere" in 600–12400 is an animation.

> **Invert the dependency. The warm-up waits for the choreography and always loses, because there is
> no gap. The choreography should wait for the compile.**

Hold the opening's animated classes off until the canvas reports `compiled`, then apply them. The
600/2100/3600/7400 delays run from that moment, **intact and in proportion**, onto a thread with
nothing left to do.

- **Backstop it** — if the compile never reports, the classes go on anyway.
- ⚠ **Reduced motion bypasses it entirely** (`globals.css:188-195`) — no animations to protect.
- ⚠ **Not as a fixed delay before applying the classes.** That's a duration answering a state
  question, wrong three times already.

⚠ **The trade is Carl's, not the Builder's.** It exchanges *"the opening stutters"* for *"the
opening starts later on a cold load"* — near zero warm, and whatever Step 2 measured cold. **Show
him the number first:** ~600ms is invisible; ~1.9s is a different conversation and he may want the
PMREM resolution reopened instead. **Bracket it; don't choose.**

---

## On the Builder's read

**Confirmed** — the four symptoms are one root cause, and every fix aimed at making the warm-up
better was aimed at the wrong object.

⚠ **One correction, the useful kind. The Builder had it the wrong way round:** it treated the
warm-up's uselessness as probable and its coupling to the cards as mysterious. **The coupling is a
one-line wiring defect; the uselessness is the open empirical question.** Step 1 fixes the first,
Step 2 answers the second.

---

## Chunk boundaries

1. **Steps 1 + 2** — unhook and measure. No visual change, no design decision. **Report numbers
   before proposing 3a or 3b.**
2. **3a or 3b** — decided by the numbers.
3. **Step 4** — only after Carl has seen the cold delay and chosen.

⚠ **`chunk-scope.json` is still deleted; nothing enforces this mechanically — state the boundary in
the run log.**

⚠ **Do not run Step 2 before Step 1 lands.** Condition B without the unhook is attempt 4 again, with
the same cardless page and the same misleading *"entrance got faster"* reading.
