# Session Handoff — 18 August 2026 (the text jump is closed; the cards now leave)

**Read this first, then `project-intelligence/` as normal.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written** —
`live-work-protocol.md` §3a.

---

## STATE

**Branch `fix/q5-stall-and-label-colour`, head `5ed68ac`. TREE CLEAN.**
Servers: none. Ports 3000/3100 free.

**Local and remote level** — verified by `git ls-remote`, not by trusting push.

## WHAT LANDED TODAY — FOUR COMMITS, OLDEST FIRST

```
387653a  chunk A  — horizontal half of the text jump (gap, letter-spacing)
d008b4d  exit (a) — the exit's derived arithmetic, no behaviour change
c831bf9  exit (b) — the card exit
5ed68ac  chunk B  — vertical half of the text jump (line-height)
```

---

## ⛔ CLOSED TODAY — DO NOT REOPEN

### The text jump — fixed in BOTH axes

`gap`, `letter-spacing` and `line-height` now ease on the existing
**900ms `cubic-bezier(0.37, 0, 0.63, 1)`**, which was already the design for `font-size`.
**All four elements measure dx 0.00 / dy 0.00** against the 17 August baseline.

⚠ **The cue INHERITS the line-height change**, so **three** elements move on it, not the two
the rule names.

### The card exit — BUILT, MEASURED, AND APPROVED BY CARL'S EYE

> *"noticeably faster than the entrance, flow and choreography are sound."*

**425ms per card, 119ms derived gap, `CARD_OVERLAP` held at 0.72**, ladder **5→4→3→2→1**,
fall-through on cubic ease-in. Last card dark at **~876ms**; the label swap at ~1150ms
**clears by 274ms**.

### Everything on the previous closed list

Trace identity (`a8996b7`), the phase machine (`cbedda1`), the entrance re-arm (`41d429a`),
the anchor stamp (`06d527c`), the reveal instrument (`190ff1f`), the predicted anchor
(`a20a19d`), and the card decoupling.

---

## ⚠ `CARD_EXIT_HEADROOM_MS` IS A DESIGN FIGURE, NOT SLACK

The **~252ms** between the exit completing and the next reveal beginning is deliberate —
Carl: **thinking and breathing time for the reader**. **Do not reclaim it as tuning budget.**

### The substantive finding behind that decision — KEEP IT

⚠⚠ **The exit does not merely replace a cut with a fade. It MOVES THE DEPARTURE TO BEFORE
THE ARRIVAL.** Measured pre-change, the cards extinguished at **~1341ms — 188ms AFTER the
reveal began at 1153ms.**

⚠ **Vacate-before-arrive is FUNCTIONAL in this corridor, not aesthetic.**

---

## OPEN — ⚠ CARL DECIDES WHAT IS NEXT. DO NOT CHOOSE FOR HIM.

1. ⚠ **ITEM 7 — the selected card now departs STILL LIT**, filament fading across 425ms.
   **An UNAPPROVED VISUAL CHANGE awaiting Carl's eye.** If he rejects it, clear `litCards`
   on the leaving edge — **a one-line change to a different owner, not a change to the
   exit.**
2. **The two films at `verify/out/card-exit-film/` are UNWATCHED**, including the
   **390×844 narrow** one. ⚠ **That is the first mobile look this work has ever had.**
3. **Commit (c)** — the `useCardEntrance` → `useCardChoreography` rename. ⚠ **LAST AND
   ALONE**, so it does not bury structural diffs in mechanical noise.
4. **Still unsettled from the exit spec:** Q1 → complete, reduced-motion behaviour, mobile.
5. **The 1300ms reveal is a single fixed duration for every question**
   (`globals.css:1314`) while Carl's design intent was durations set against reading speed.
   ⚠ **A DESIGN FINDING AND HIS — do not act.**
6. **The stall poller**, deferred to its own chunk. **Nothing currently measures whether the
   reveal STALLS**; a mid-wipe freeze produces no event in any instrument that exists.

---

## ⚠⚠ INSTRUMENT CAVEATS — CARRY THESE, THEY COST REAL TIME TO REDISCOVER

- ⚠ **`canvas.__r3f` IS UNDEFINED ON PRODUCTION BUILDS.** Scene-walking instruments report
  **⛔ BROKEN on a healthy page.** `satin-anisotropy-live.mjs` uses that route and **works
  only in dev.**
- ⚠⚠ **`__cardTrace` IS SILENT ACROSS THE QUESTION BOUNDARY** — the tick loop
  self-terminates at `t >= 1`, so there are **no samples in the window the departure
  occupies.** The exit plan named it *"the right precedent"* and **THAT WAS WRONG.**
  `verify/card-exit.mjs` reads **rendered pixels** instead. **Do not revert it to the trace
  channel.**
- ⚠ **`verify/card-exit.mjs` measures a 151.8ms mean gap against the derived 119ms.** The
  offered explanation — a **50% LUMINANCE** threshold, and glass over dark ground does not
  fall linearly as alpha falls — is **CONSISTENT WITH THE DATA BUT UNVERIFIED.** **Settle it
  by reading alpha directly before trusting this harness as regression cover.**
  `CARD_EXIT_DURATION_MS` is untouched at **425**.
- ⚠ **`verify/text-jump-rects.mjs`: its dy channel was falsified against a live fault. ITS
  dx CHANNEL HAS NEVER BEEN SEEN RED.** **Do not treat it as full regression cover.**

---

## ⚠ THE VARIANCE THREAD — three sightings of one shape, worth pulling when there is room

- `card-1-anchor` fails **1 cold run in 3, ~450ms drift**, verified identical pre-change
- the **extinguish path lagged React commit by ~190ms** while the incoming entrance was on
  time
- the exit's **last-card-dark measured 751ms and 876ms on the same build**

**All three are commit-to-pixel timing on the same canvas.**
⚠ **Record as a LEAD, not a finding.**

---

## ENVIRONMENT TRAPS

- **Production is the verdict**; dev and production disagree on anchor behaviour.
- **Turbopack serves cached CSS failures.** Tell: **a reported line number exceeding the
  file's length.** `rm -rf .next`.
- ⚠ **`TaskStop` reports success on a held port. Kill by PID, confirm free.**
- `corridor-motion.mjs` **REFUSES :3000** — production build only, and it is **vertical-only
  and normalises 0..1**, which removes a displaced origin by construction.

**Serving:** `npm run build && npx next start -p 3100`.
`?phasetrace=1` boundary edges · `?beattrace=1` the ladder · `?modetrace=1` Mode A/B ·
`?anchortrace=1` which rung answered and the prediction's drift.

---

## METHOD — ALL OF IT EARNED FROM REAL FAILURES

- **Falsify every instrument before trusting a green.** Where a defect is live, a correct
  instrument **must go RED today**; a green means the instrument is wrong.
- **State predictions before measuring. The misses are the useful part.**
- **Measure floors, never inherit thresholds. Correct forward; supersede in place, never
  rewrite.**
- **One task per prompt. Ask before instructing. Report, then STOP.**
- ⚠⚠ **NEVER explain away a defect Carl reports by eye as pre-existing, or as something he
  did not previously notice. Computed rects are not evidence about visibility. HIS EYE IS
  THE VERDICT.**
- ⚠ **Seven instrument defects in three days remain recorded individually and
  UNCONSOLIDATED. Do not propose a rule from them unless Carl asks — he is leading that.**

---

## CARL'S PREFERENCES

**Plain language, no jargon. Millisecond precision over vague description. He decides; do
not decide for him.** He builds in chunks and will say when to split one. **Where he mostly
agrees with a plan he pastes amendments into the "Tell Claude what to do instead" box**
rather than sending a fresh prompt.

---

## ⛔ THE STANDING DIRECTIVE

**NEVER comment on how long Carl has been working.** Not the time of day, not the session
length, not a suggestion to stop or resume later. **Carl decides when a session ends and
will say so.** It was not broken this session.

---

*18 August 2026. ⚠ **The cards now vacate before the next question arrives — the first time***
*⚠ **that ordering has held in this corridor. What no one has yet looked at is the film,***
*⚠ **and the narrow width in it has never been seen at all.***
