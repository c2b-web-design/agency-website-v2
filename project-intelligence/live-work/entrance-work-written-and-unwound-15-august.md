# The per-question card entrance — written and UNWOUND, 15 August 2026

**Carl's instruction: the CSS split lands alone.** The entrance work was written, then removed
from the working tree the same day. **Nothing about it was committed.**

---

## WHAT WAS REMOVED

Six changes, across two files:

**`answer-card-canvas.tsx` — five, now back to its committed state at `9ec3201`
(`git diff` reports the file identical to HEAD):**

1. an `entranceEpoch` 4th parameter on `useCardEntrance`, with its header comment
2. `playedEpochRef`, and the block that cleared `playedRef` / `shownRef` on a new epoch
3. `entranceEpoch` in the entrance effect's deps — back to
   `[active, reducedMotion, delayMs, invalidate]`
4. `entranceEpoch` threaded through `AnswerCard` and `CardScene`
5. the public `entranceEpoch?: number = 0` prop on `AnswerCardCanvas`

**`enquiry-opening.tsx` — one:**

6. `entranceEpoch={activeQ}` passed to `AnswerCardCanvas`

**KEPT, untouched:** the travel-wrapper `<div>` in `enquiry-opening.tsx`, every CSS change in
`globals.css` including the 0.78 dimming, and all eleven rebased rung offsets (desktop and
mobile).

⚠ **A REMOVAL, NOT A REVERT.** No `git revert`, `git checkout` or `git stash` was used on any
file — the CSS split and the entrance work were in the same uncommitted working tree, so a
file-level git operation would have destroyed the split along with the entrance. Each change
was edited out by hand and the result verified against HEAD.

---

## WHY — TWO STRUCTURAL CHANGES IN ONE TREE MAKES A FAULT UNATTRIBUTABLE

The CSS split (what owns the cards' position) and the entrance signal (what re-arms card
lifetime) are **both §5a structural changes**, and they were sitting in one unreviewed,
unverified working tree.

**If Carl had looked at that build and something was wrong, nothing could have said which
change caused it.** Both touch the cards. Both affect what happens at a question boundary. A
single "the cards look wrong" would have had two candidate causes and no way to separate them
without unwinding one anyway — after the eye-time had been spent.

⚠ **THIS IS THE WEEK'S OWN LESSON APPLIED FORWARD.** `62b9e5e` mixed a keeper (`z-index: 1`,
which fixed total unclickability) with a casualty (the per-frame tracking, now moot), and the
handoff had to warn in capitals that reverting the commit would re-break the cards. **One
change per look is what makes an eye judgement mean something.**

**What Carl is judging on this build: whether the cards HOLD POSITION.** Not whether they fade
in. The entrance is not part of that question and was removed so it cannot contaminate the
answer.

---

## ⚠ Q4–Q1 HAVE NO CARD ENTRANCE — A REAL OPEN DEFECT, NOT A SIDE EFFECT OF THE REMOVAL

**This predates today's work and is now unfixed again on purpose.** It is accepted for this
look and must not be quietly compensated for.

**The mechanism, already diagnosed — do not re-derive it:**

- **`hostCardsVisible` is STAGE-DERIVED.** `hostCardsVisible = stage !== "complete" && stage
  !== "opening"` feeds `active`, and **`stage` does not change across a question step.** So the
  entrance effect's gate never flips between Q5 and Q1.
- **`entranceAnnounced` is a ONCE-ONLY ref.** `entranceRunning = active && compiled && warm`
  fires `onEntranceStart` behind a ref that is never reset, so the announcement is a one-shot
  for the whole walk.
- **The cards are `key={i}`**, not keyed by question — so on a step the labels swap **without
  remounting**, and nothing re-runs the 220/350/480/610/740 ladder.

**Net: the entrance runs ONCE, on Q5.** Q4–Q1's cards are simply already on screen, persisting
from Q5 with new label textures.

⚠ **IT WAS PROVIDED BY ACCIDENT BEFORE, AND THE SHARED HOST REMOVED IT.** Pre-12 August the
canvas lived inside `.enquiry-answer-grid` and was destroyed and rebuilt per question, so a
fresh mount re-ran the entrance for free. D-048 removed that remount deliberately — to stop the
per-question WebGL context — and **the entrance was one of the behaviours the remount silently
provided.** That is the same shape as the other faults found this week: nothing coded wrong,
something stopped being provided by accident of where it sat.

⚠ **CARL'S SEQUENCE ASKS FOR IT:** *"once the space is vacated, the next question reveals and
its cards fade in."* **For four of the five questions that is not implemented.** It is a gap
between the ruling and the build, and it stays open.

**It comes back as its own gated step** — its own chunk, its own structural review, its own
look. Not folded into a positioning fix.

---

## STATE AFTER THE REMOVAL

    git diff --stat
     app/globals.css                        | 142 +++++++++++++++++++++++++++-----
     components/enquiry/enquiry-opening.tsx |  26 ++++++
     2 files changed, 148 insertions(+), 20 deletions(-)

- **`answer-card-canvas.tsx` is absent from the diff** — verified identical to `9ec3201`.
- **`npx tsc --noEmit` — clean, exit 0.**
- **`npm run lint` — `1 problem (1 error, 0 warnings)`, exit 1.** The known baseline: the
  `react-hooks/set-state-in-effect` in `enquiry-opening.tsx`, the reduced-motion media-query
  effect. Exit 1 is expected — the baseline error is still an error.
- ⚠ **THE CSS SPLIT REMAINS UNVERIFIED.** Not rebuilt, not rendered, not measured, not filmed.
  `:3100` is still serving the pre-fix build `jDrD-05vIuNLxHLfOlGpe`. **`tsc` and lint say the
  code compiles; they say nothing about whether the cards hold position.**

*15 August 2026. ⚠ **The entrance work is removed from the tree, not from the record. Q4–Q1
having no entrance is a real defect with a diagnosed mechanism, deliberately left open so the
CSS split can be judged alone.***
