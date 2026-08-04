# Architect answer — the `c2b DESIGN` fade

**Received 4 August 2026, in response to `architect-question-lockup-fade.md`.**
**Saved by the Builder because the Architect's Write was disabled.**

⚠ **BOTH OPEN QUESTIONS HAVE ONE CAUSE, and it is not in `useLockupFade` or `useBackdropRedraw`.
Neither of those is broken.**

⚠ **THE ENTRANCE RUNS ON TWO DIFFERENT CLOCKS AND THE CODEBASE ASSUMES ONE.** That single fact
produces the late start (Q1), the two gaps (Q2), and **a third defect nobody has reported yet.**

---

## The arithmetic — it settles Q1 completely

From `answer-card-geometry.ts` (`:499`, `:591`, `:594`, `:603-608`, `:639-660`):

```
CARD_RISE_DURATION_MS            2000
CARD_RISE_GAP_MS                  560     round(2000 x 0.28)
CARD_RISE_LADDER_MS               650, 1210, 1770, 2330, 2890
LOCKUP_FADE_OVERLAPPED_DELAY_MS  4330     2890 + round(2000 x 0.72)
LOCKUP_FADE_DURATION_MS          2000
ENTRANCE_END_MS                  6330
```

Against the measured trace:

```
fade starts  +13187   ->  the entrance clock's zero is at  13187 - 4330 = +8857
fade ends    +15184   ->  predicted end  8857 + 6330       = +15187      (3ms out)
```

⚠ **BEAT SIX IS EXACTLY ON TIME RELATIVE TO ITS OWN CLOCK.** `useLockupFade` is correct to the
millisecond. **What is wrong is the assumption about where its clock starts.**

`useLockupFade`'s effect runs on `[active, …]` (`answer-card-backdrop.tsx:355`), and `active`
arrives from `CardScene`, which `AnswerCardCanvas` sets to `active && compiled && warm`
(`answer-card-canvas.tsx:1647`). `compiled` is the async precompile chain resolving. **The cards
mounted at +6913; `compiled` flipped at +8857. That 1944ms is the precompile**, and it is the
whole of the "unexplained" lateness.

⚠ **THE "~+5600ms" EXPECTATION CAME FROM APPLYING `ENTRANCE_END_MS`'s ANCHOR (Begin) TO THE
ENTRANCE ITSELF.** That is the same wrong model the bug below is made of — **one mistaken
assumption produced both the surprise and the defect.**

---

## Q2 — the gaps are the contact field, admitted by the guard that exists to prevent it

`enquiry-opening.tsx:667-675`:

```js
const activated = activatedAtRef.current;              // Date.now() at Begin
const untilChoreographyClears =
  Math.max(Q5_REVEAL_CLEAR_MS, ENTRANCE_END_MS) - (Date.now() - activated);
```

⚠ **`ENTRANCE_END_MS` IS MEASURED FROM BEGIN. THE ENTRANCE DOES NOT START AT BEGIN.** The guard
believes the six beats run +0 → +6330. They actually run **+8857 → +15187**. It is off by 8857ms,
so it releases the contact warm-up **~2.5 seconds before beat six has even begun**.

The contact canvas mounts at **+13248** — 202ms before the first gap at +13450. Context creation,
`useStudioEnvMap`'s PMREM and its compile are two blocking tasks: **exactly the 357ms + 224ms
signature.**

⚠ **AND THE LUMINANCE JUMP PROVES DROPPED FRAMES, NOT STEPPING.** The ramp is 16 → 119 over 2000ms
≈ 1.03 lum per 20ms step. **A jump of 21 is ~400ms of fade progress in one frame.**
`useLockupFade` is driven by `performance.now()`, so its value kept advancing while nothing
painted. **Theories 2, 3 and 4 were structurally incapable of being the cause** — a curve change, a
missing `invalidate`, or 3-decimal quantisation cannot produce a time-proportional jump.

⚠ **THE GUARD'S OWN COMMENT AT `:652-666` DESCRIBES THIS EXACT COLLISION AND CLAIMS TO HAVE FIXED
IT** — *"a third WebGL context created at +2362ms… squarely between card 2 and card 3."* **The
boundary was added; the anchor was never checked.** It moved the collision from the card ladder to
beat six.

---

## ⚠ A third defect, same root cause, not yet reported

`CARD_FIRST_ENTRANCE_MS` is `Q5_REVEAL_MS / 2 = 650`, implementing Carl's *"card 1 can begin its
appearance half way through the text reveal."* **That only holds if the card clock starts when the
reveal starts. It starts 1944ms later.**

```
phrase reveal    +6982 -> +8282      (midpoint +7632, what Carl asked for)
card 1 rise      +8857 + 650 = +9507  — 1225ms AFTER the reveal has finished
```

**An approved instruction is currently not being met, and the value implementing it is correct.**
Carl's call whether it matters before rollout.

---

## The fix

### A. The guard must wait for a STATE, not a duration — the primary change

⚠ **THIS FILE HAS ALREADY LEARNED THIS TWICE** (`OPENING_WARM_LEAD_MS`, `:136-140`: *"A duration
cannot answer 'has the opening finished'; only the opening can."*). **The card entrance is the
third case.**

1. In `AnswerCardCanvas`, when `active && compiled && warm` first becomes true, call a new optional
   `onEntranceStart` prop.
2. In `enquiry-opening.tsx`, record it: `cardEntranceStartedAtRef.current = Date.now()`.
3. In `warmWhenSafe`, replace the `activatedAtRef` computation with:

```js
const entranceStarted = cardEntranceStartedAtRef.current;
if (!reducedMotion) {
  if (entranceStarted === null) {
    // ⚠ NOT STARTED IS NOT CLEAR. Reschedule; do not fall through.
    timerId = window.setTimeout(warmWhenSafe, 500);
    return;
  }
  const untilClear = ENTRANCE_END_MS - (Date.now() - entranceStarted);
  if (untilClear > 0) { timerId = window.setTimeout(warmWhenSafe, untilClear); return; }
}
```

⚠ **THE `null` BRANCH IS THE LOAD-BEARING HALF.** At +6330 the entrance has not started; **"not
started" must mean WAIT, not CLEAR.** Getting that backwards reproduces the current bug exactly.

⚠ **AND IT NEEDS A BACKSTOP, OR IT WILL HANG THE CONTACT FIELD FOREVER.** The card canvas does not
mount below 1280px (`PROTO_MIN_VIEWPORT_PX`) and does not animate under reduced motion — on those
paths `onEntranceStart` never fires. **Keep the existing Begin-relative computation as an outer
ceiling.** Do not let the state gate be the only exit.

⚠ **DO NOT "FIX" THIS BY RAISING `ENTRANCE_END_MS`.** The offset is not a constant — it contains
shader compile time, which differs cold from warm and **will shrink when the first consultation's
fix A+B lands.** A recalibrated number is guaranteed to go stale, and this file records that
happening twice already.

### B. Re-measure the mount → `compiled` gap after the stutter fix

The 1944ms gap is the precompile. If fix A+B drops it to ~100ms, beat six moves ~1.8s earlier and
card 1 lands near the reveal's midpoint again — **the third defect above may repair itself.
Measure before doing anything about it.**

Also: the contact field uses the same `useStudioEnvMap` + PMREM pattern, so the
`fromScene(…, { size: 64 })` finding very likely applies there too. **Separate scope.**

### C. The curve — yes, but after the gaps

`useLockupFade:328` is linear. Every other entrance on this card is eased — `useCardEntrance` uses
`1 - (1-t)³`, `CardLighting` uses smoothstep. **Matching the cards is literally what Carl asked
for:** *"The cards fade in at a certain speed, the text should do the same."* Use the same cubic
ease-out. **Cosmetic beside the gaps — do it second.**

### D. Optional, only if the fade still looks fragile

`useBackdropRedraw` repaints the entire canvas and re-uploads the texture every frame — ~100 full
redraws plus ~100 uploads **for what is one global multiplier**. Not the cause of the gaps, but it
is **why the fade has no headroom**.

⚠ **AND THE OBVIOUS SHORTCUT IS WRONG.** Driving `material.color` toward black is not equivalent:
`mixColour` lerps toward `GROUND_COLOR` `#101010`, so at fade 0 the lockup **matches the ground**.
A colour multiply would take it to black — **a visible dark silhouette where there should be
nothing.** The correct version is an `onBeforeCompile` mixing the texel toward the ground colour.

⚠ **BUT THAT ADDS A CUSTOM PROGRAM, AND IT NEEDS WARMING IN BOTH `toneMapping` STATES OR IT PUTS A
NEW BLOCKING LINK INSIDE THE TRANSMISSION PASS.**

---

## ⚠ On the diagnosis

**The instrument that would have found this in one step is already in the code and switched off:**
`?beattrace=1` marks `lockup-beat-6` and `card-beat-*`. Dumping those relative to Begin gives the
entrance's real anchor immediately, and the guard's assumption is one subtraction away.

⚠ **FOUR THEORIES WERE GENERATED ABOUT THE MECHANISM OF A FADE BEFORE ITS START TIME HAD BEEN READ
OFF THE INSTRUMENT BUILT FOR EXACTLY THAT.**

⚠ **AND THE PROBE FAILURE IS THE SAME SHAPE AS THEORY 6 YESTERDAY:** the observation window was
derived from constants, **and the constants were the thing under suspicion.** When a timing is
wrong, **no window computed from that timing can contain the evidence.** Sample from the first
paint to the last and find the event, rather than deciding where to look first.
