# Structural Decision Note — the card canvas's host, position and lifetime

**14 August 2026. Builder → Carl → Architect.** Format: `ai-system/structural-decision-gate.md`.
**Nothing is built from this note until Carl says so.**

⚠ **This note is retrospective, and that is itself the finding.** The structure it describes is
already built and committed (`1e031cd`, `62b9e5e`). Under §5a it should have stopped for review
*before* it was built. It did not, and the two faults §5b predicts — both from today — are the
result. The note is written now because the decision is still live: **`62b9e5e` reverts cleanly
in isolation** (verified), so this is a real choice, not a fait accompli.

---

## 1. What structure is being introduced or changed

**A single `position: fixed` canvas host, mounted once outside the phrase shell, replacing a
canvas that lived inside each question's `.enquiry-answer-grid`.**

Three separable properties changed at once, and they are worth naming separately because Carl may
want different answers for each:

| | before | after |
|---|---|---|
| **parent** | inside `.enquiry-answer-grid`, inside the keyed phrase | sibling of the shell, `position: fixed` |
| **lifetime** | destroyed and rebuilt per question | mounted once, never unmounts |
| **position source** | inherited from its parent, free | measured from the grid's rect, per frame while moving |

---

## 2. What alternatives exist, and why they were rejected

**A. Keep the canvas inside the phrase (status quo ante).** Rejected before my involvement — the
per-question compile cost is what Stage 2 exists to remove. ⚠ **But note what it bought**: paint
order, hit-testing, selection-state clearing and corridor motion were all correct *for free*. It
is the only option with no unlisted dependencies, because nothing was moved.

**B. Shared host, `position: absolute` inside the shell.** Rejected: both shells carry
`transform: translateY(...)`, and a transformed ancestor becomes the containing block for a fixed
element. This is recorded in the host's own comment and is sound.

**C. Shared host following the on-screen grid per frame (built, `62b9e5e`).** Chosen by Carl on
14 August specifically to avoid reimplementing the easing. ⚠ **Now confirmed limited** — §5.

**D. Shared host, cards hidden during the corridor move.** This is what `1e031cd` actually did,
by accident rather than intent (`activeCardsVisible` carried `!corridorMoving`). Measured as 48
changed paint-order probe points: the cards vanish for ~900ms, four times per walk. Rejected as a
visible regression against approved corridor motion.

**E. Two contexts — one parked, one per question.** Not seriously considered, and should be
recorded as rejected: it is the warm-up canvas mistake again, which §5a exists to prevent.

---

## 3. What currently depends on the present structure

⚠⚠ **THE HEADLINE: I DID NOT ENUMERATE THIS BEFORE BUILDING, AND EVERY ITEM MARKED ⛔ BELOW
BROKE.** Both were provided by DOM nesting and neither was written down anywhere.

| what the old nesting provided | by what mechanism | status |
|---|---|---|
| ⛔ **Cards receive pointer events** | painted after the shell in DOM order | **BROKE** — all five cards dead on `1e031cd`. Fixed by `z-index: 1`. |
| ⛔ **Selection state clears per question** | canvas destroyed with the keyed phrase, `litCards` died with it | **BROKE** — `litCards` now survives; previous answer stays highlighted. **UNFIXED.** |
| ⚠ **Cards travel with the receding phrase** | child of the animated element | **PARTIAL** — restored up the travel, discontinuous at the return (§5). |
| ⚠ **Cards present during the move** | rendered as part of the phrase | broke in `1e031cd`, restored in `62b9e5e` by splitting `activeCardsVisible`. |
| ✅ Position, size, 1-unit-to-1-px mapping | grid's own box | preserved — 0.5px at three widths, 336/336 paint-order points. |
| ✅ One context across five questions | — | improved; this is the point of the change. 2/2. |
| ❓ **Entrance ladder timing per question** | fresh mount re-ran the ladder | **NOT ENUMERATED, NOT MEASURED.** `entranceAnnounced` latches once, so the ladder now runs once for the session rather than per question. Whether that is correct is unknown. **This is check 5, still outstanding.** |
| ❓ **Anything else in `AnswerCardCanvas` that assumed a fresh mount** | — | **I cannot enumerate this.** The component is ~4200 lines with substantial internal state. `litCards` is the one I found *by Carl seeing it*. **Stating this as the finding, per §5b: I do not know what else survives now.** |

---

## 4. What becomes true that was not true before

- One WebGL context serves all five questions; the per-question compile is gone.
- The canvas outlives every question. **All internal state in `AnswerCardCanvas` is now
  session-scoped rather than question-scoped, by default, for everything — not only `litCards`.**
- The host's position is a *derived* value with its own update path, so it can now be wrong in
  ways it previously could not (stale, lagging, or measured from the wrong element).
- There are now **two sources of truth for where the cards are**: the grid element's layout, and
  the host's committed `hostRect`. They agree only as fast as React commits — measured at exactly
  one frame behind, ~1.7px during the move.
- The cards can paint over the shell (`z-index: 1`), which was previously impossible.

## 5. What becomes impossible to observe

⚠ **The question boundary is no longer visible to the canvas.** Previously "a new question" was a
mount — unmissable, and self-clearing. Now nothing in `AnswerCardCanvas` observes the transition
at all; `labels` changes as a prop and everything else persists silently. **A future state bug of
the `litCards` kind will present as a visual oddity with no event to hook a breakpoint to.**

⚠ **No element makes the corridor round trip.** Measured, pre-host, nodes stamped:

    N1  Q5 grid + canvas N2   492.78 -> 434.79   57.99px up, then DESTROYED
    N4  Q4 grid + canvas N5   492.78 -> 492.78   0.00px travel

Confirmed by `isConnected`. Pre-host never *followed* anything — the canvas was destroyed with
the old grid and recreated with the new one. **So "follow the element the browser animates" has no
element to follow across the boundary**, and the host snaps 58px in one frame (~280ms held at the
top, single-frame jump at t=1200). **This is a property of the route, not a bug in it.**

---

## THE DECISION CARL FACES

The z-index half is settled and not in question. Three live items:

**(i) The corridor return.** Accept the one-frame snap at the boundary; or have the host bridge
the gap itself — which is the hand-driven animation D-046 forbids; or option (c), revert
`62b9e5e` and take a different route entirely.

**(ii) The persisting highlight — UNFIXED, and the clearer defect.** A visitor sees their previous
answer still lit on a question they have not answered. Measured across a real walk: `00000`,
`01000`, `10000`, `01000`, `10000`. Pre-host reads `00000` on arrival. **This is a lifetime
consequence, not a positioning one, and it needs its own decision about where selection state
should live.**

**(iii) Whether the whole host is the right structure**, now that the enumeration in §3 exists
and shows two ⛔ and two ❓. That is the question §5a would have asked in the first place.

*Verification is not approval. Carl decides; the Architect reports findings.*
