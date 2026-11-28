# The Architect's review of the answers (28 November 2026)

Reviews `architect-answers-probe-review-28-november.md`. Routed by Carl (pasted), with his word on the race fix and the
`chrome://gpu` line: *"Yes to both."*

## Verdict
All four answers stand. The screencast cause is properly isolated; side by side's case is weaker than assumed. The race fix
first.

## 1. The screencast: settled
One variable at a time was the right test (8.84 → 14.12 s; each compile ~4.8 → 7–9 s); D-101's wording is backed. The
earlier review was wrong to treat headless/headed as a confound (the films were headless too); whether HEADED timings differ
is answered by the headed run.
- **For Carl:** when he judges a cold load by eye, his own screen RECORDER should be OFF, or he judges a slower page than a
  visitor gets.
- **A lesson:** never time from a filmed run. Record it where measurement method lives (the tool's header, the measurement
  protocol) — Carl's call where.

## 2. Side by side is a case for consistency, not speed
Side won rounds 1, 4, 5, lost 2 and 3 by 0.07–0.11 s; the warm-up ended sooner every round, but base's swap and touchdown
margins were already safe (+2.98 / +3.94 s), so ending sooner buys nothing the opening needs. The tail gain rests on one
paired sample. Side's case: possibly a shorter worst case, against a small repeatable cost at the logo's moment.

## 3. ⚠ The ~0.1 s cost: the Builder's explanation does not fit
On a return visit the warm-up is done at 2.5–3.0 s, the logo due ~8.4 s: no chain is running 5.5 s later. So the cost is at
the logo's FIRST DRAW or in something the per-object gather leaves behind (unverified: a per-object `compileAsync` may set
up a different render context than the draw uses). What matters: a DELAY before the first draw (invisible) or a LONG FRAME
at it (a visible hitch as the fade begins — ruled out by "Nothing in the hero may read as a glitch"). Before side by side is
planned: a read-only probe on return visits — the fade's first-draw frame length, base vs side; any pipeline or binding
created on that frame. Needs the temporary probe build: Carl's word first.

## 4. The revised position
- **Base (as committed):** a real candidate — median cold lateness ~0.2 s above the floor; risk the occasional slow load.
- **Side by side:** not planned until the ~0.1 s is explained (a long frame → out; a delay → in the running for
  consistency).
- **Split gate, overlapping:** not measured; only if Carl sees a lag with base.
- **A′, B, C, D:** held, declined, held, closed.
- Telling base and side apart on the tail needs ~10 more paired rounds (base and side only), if it comes to that.

## 5. §3.2: settled for the logo, open for the rest (the full-story check, §3.1)

## Order
1. Fix the race (Carl's word: given). 2. The headed unfilmed cold run. 3. Carl watches cold loads of BASE in his own
Chrome, headed, the RECORDER OFF: no lag → stop (base stands; side, the split gate and A′ closed). 4. Only with a lag: the
first-draw probe, the full-story check, the paired rounds; choose side or an overlapping split gate. 5. Carl: `chrome://gpu`;
where the "never time from a filmed run" lesson is recorded.
