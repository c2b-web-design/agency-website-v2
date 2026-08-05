# Run log — Step 4, the ordering inversion (card 1 at the reveal's midpoint)

**5 August 2026. Carl chose Step 4 over three alternatives, and restated the target:
*"card 1 should start halfway of the Q5 reveal."*** Follows `run-log-begin-stall-chunk1.md`.

⚠ **SCOPE BOUNDARY, STATED BECAUSE NOTHING ENFORCES IT.** `chunk-scope.json` is still deleted.
This chunk is Step 4 plus the card-1 anchor it resolves. **No approved visual layer was
touched** — the frosted glass (D-028), the filament border (D-029) and the corridor
(D-022/023/024) are untouched. The opening's *timing* changes; none of its *design* does.

---

## What was measured FIRST, before any code

**`verify/card-1-anchor.mjs`, 3 runs, headed, real GPU.** Carl's approved instruction — *"card 1
can begin its appearance half way through the text reveal"* — was still unmet after chunk 1:

| | before Step 4 |
|---|---:|
| precompile gap | 1203 / 768 / **791**ms |
| card 1 late by | 1203 / 768 / **791**ms |

**The two numbers are the same number.** `CARD_FIRST_ENTRANCE_MS` (650, and correct) counts from
the entrance clock, whose zero is when the precompile finishes — **not from the reveal's start.**
Card 1 was still arriving *after the reveal had already ended.*

⚠ **CHUNK 1 HAD ALREADY MORE THAN HALVED THE GAP** — ~1980ms on 4 August to 791ms — **and the
defect survived anyway**, because a proportional improvement to a gap that should not exist does
not close it. The record's hoped-for outcome (*"if the precompile drops to ~100ms the defect
repairs itself"*) did not happen at 791ms.

---

## The change

**The dependency is inverted.** The warm-up canvas no longer waits for a gap in the opening;
**the opening waits for the warm-up canvas.**

- `openingArmed` — false until the warm-up canvas reports `compiled`, then true for good.
- **The mask classes are withheld until it flips**, then applied together, so the
  600/2100/3600/7400 delays run from that moment intact and in proportion.
- **The warm-up canvas mounts with the opening**, unscheduled. `AnswerCardCanvas` gained an
  optional `onCompiled` prop to report readiness.
- **`OPENING_ARM_CEILING_MS = 4000`** — a backstop, so a page with no WebGL still opens.
- **Reduced motion arms immediately** — no animations to protect, and the opening must never be
  gated on WebGL for someone who will not see a reveal.

### What was DELETED, and the deletion is the fix

**`cardCanvasWarm`, its scheduling effect, and `OPENING_WARM_LEAD_MS` are gone.** That effect was
the mechanism behind all four failures — lead 900ms, lead 5200ms, gate on `beginActive`, gate on
`animationend`. **Nothing is scheduled any more, so nothing can be scheduled onto an animation.**

Both removed comment blocks are replaced by struck records rather than erased: three other comments
cite `OPENING_WARM_LEAD_MS` as where two failed attempts are written down.

---

## Result

| | before | **after** |
|---|---:|---:|
| precompile gap | 791ms | **139ms** |
| card 1 late by | 791ms | **139ms** |
| card 1 lands | after the reveal ENDED | **+997–1046ms, target +858–927** |
| warm-up compiles | during the opening's animations | **5–7.4s BEFORE Begin** |

**Card 1 now enters inside the reveal, ~120–140ms past its midpoint** — the overlap Carl designed,
where the eye is still travelling along the line as the first card arrives beneath it.

**`verify/opening-arm.mjs` — the gate is doing the work: 3/3 runs armed by the COMPILE**, at
+2349/1316/1300ms, within 2–9ms of the compile mark. **The backstop was never needed.** That script
exists specifically to catch the opposite, because it is how the previous design failed silently.

---

## ⚠ THE COST, AND IT IS ABOVE WHAT THE ARCHITECT BRACKETED

**The page now waits before the opening starts:**

```
cold   ~2.9s      warm   ~1.9s
```

⚠ **The Architect's bracket was *"~600ms is invisible; ~1.9s is a different conversation."* Cold is
2.9s — beyond the top of it.** Carl accepted the trade in principle before the number existed;
**this is the number, and it is his to accept or reject.** If it is too long, the lever the
Architect named is the PMREM env-map resolution (256 → 128 or 64), which is a **visual** change and
also his call.

---

## ⚠ TWO DEFECTS I INTRODUCED AND FIXED — both worth the record

### 1. The opening showed all its text, then wiped it in again

**Withholding a mask class does not hold its element — it COMPLETES it.** The heading and subtext's
base state is unmasked, fully-visible text, which is the animation's **end** state. The first
version of Step 4 returned `undefined`, so the opening displayed everything at once, sat there ~2
seconds, then wiped it in from the left.

⚠ **EVERY TIMING WAS CORRECT WHILE THAT WAS HAPPENING.** The arm fired on the compile 3/3, card 1
sat at the midpoint, the gate did exactly what it was asked. **A screenshot at +500ms is what found
it.** A measurement of *when* something starts says nothing about *what is on screen before it
does.*

**Fixed** with `.enquiry-opening-held`, which asserts the keyframe's `from` state — fully clipped,
`opacity: 0` — so the text waits invisible and the animation joins it seamlessly.

⚠ **AND THE BEGIN MASK NEEDED THE OPPOSITE TREATMENT.** Its base rule already carries
`clip-path: circle(0%)`, so withholding *its* class would have made the button visible and
clickable from the first frame. It keeps its class and takes `--held`, which only kills the
animation. **Two elements, two opposite fixes, because their base states are opposite.**

### 2. The harness reported a working gate as broken — twice

- **Negative reveal times.** Since Step 4 the warm-up compiles *before* Begin, and both canvases
  emitted the same `card-canvas-created` mark — so the harness read "reveal start" off the wrong
  canvas and printed `+-6244ms` with a 7127ms lateness. **Fixed by giving the two canvases distinct
  mark names** (`warmup-canvas-*` vs `card-canvas-*`).
- **"0/3 armed by COMPILE"** on a gate that was working perfectly. The classifier compared the
  heading's `animationstart` against the compile mark — but the heading starts **600ms later**,
  because its own class carries that delay. The arming moment is `headingAt - 600`.

> **Both times the instrument disagreed with the code and the instrument was wrong. Reading the raw
> numbers — compile at +1199, heading at +1813, a clean 614ms apart in every run — is what caught
> it.** The session's standing lesson, landing on the harness twice in one day.

---

## Gates

- `npx tsc --noEmit` — **clean**
- `npm run lint` — **`1 problem (1 error, 0 warnings)`**, the recorded baseline

## Files changed

- `components/enquiry/enquiry-opening.tsx` — `openingArmed`, `armOpening`, `openingMask`;
  `OPENING_ARM_CEILING_MS` added; `cardCanvasWarm` + its effect + `OPENING_WARM_LEAD_MS` deleted;
  warm-up canvas mounts unscheduled and reports via `onCompiled`
- `components/enquiry/answer-card-canvas.tsx` — `onCompiled` prop; distinct mark names per canvas
- `app/globals.css` — `.enquiry-opening-held`, `.enquiry-button-mask--held`
- `verify/card-1-anchor.mjs`, `verify/opening-arm.mjs` — new

**Not committed.**

---

## ⚠ Open — and Step 3a's status has CHANGED

⚠ **DO NOT DELETE THE WARM-UP CANVAS.** Step 3a was authorised in principle by chunk 1's numbers,
which showed the warm-up as a 329ms net cost. **Step 4 has made it load-bearing:** it is now what
arms the opening. Deleting it would leave only the 4000ms backstop, and every visitor would wait
the full ceiling. **The measurement that justified 3a was taken under the old architecture and no
longer describes this one.**

**Still Carl's to judge:**

- **The ~2.9s cold wait.** Above the Architect's bracket. The env-map lever is available and visual.

---

## ✅ CARD 1 — APPROVED BY CARL, 5 August 2026

> *"139ms might seem a long time for AI Or Cmdr Data. To the human eye such mardins are tolerable.
> Its good, still keeping with the flow."*

**The anchor is settled. Do not chase the remaining 139ms.**

⚠ **AND THE REASON MATTERS MORE THAN THE VERDICT.** 139ms is ~8 frames at 60fps, ~10% past the
midpoint of a 1300ms reveal. **What Carl specified was a RELATIONSHIP between two things in
motion** — the card arriving while the eye is still travelling along the line — **not a timestamp.**
A relationship is satisfied by proximity; a timestamp is not.

**Closing the last 139ms would mean re-anchoring beat one to the reveal's start instead of the
entrance clock** — a new coupling, for a difference no one can see. **This project already holds
that trap on record:** a measurable change the eye cannot perceive means the metric has stopped
tracking what is being judged (`answer-card-canvas.tsx`, on why `thickness`/`ior` are not exposed
in the rig).

**The generalisation, for the next timing argument:** when a value is judged by eye against moving
reference, the tolerance is the human one, and precision past it is cost without benefit.
