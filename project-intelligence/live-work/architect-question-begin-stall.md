# Architect question — the Begin button stall

**Written 5 August 2026 by the Builder, for Carl to route to the Architect.**

**Carl's instruction, this session: *"Begin button stall is still there. It needs to be fixed."***
It is item 1 of the three he set for this session, and his handoff directed that it come here
before any code is touched.

**Why this is a consultation and not an edit.** Four Builder attempts have moved this symptom
without removing it, and the fourth broke the cards outright — reverted at `8e562ed`, on Carl's
call: *"the cards do not come on. lets leave, youre making the problem worse."* Two Architect
consultations on 4 August each solved in one pass what the Builder had failed at repeatedly — six
theories on the opening stutter, four on the lockup fade. **This is the same shape a third time.**

Repo: `main`, head `d2be6b5`, clean and pushed. Three 0.185.1.

---

## The symptom

Cold load of `/start`, measured before Begin is pressed:

```
warm-up canvas mounts   +8096ms
641ms blocking task     +8193ms      <- lands on the Begin reveal
6 dropped frames, 4 long tasks >50ms
```

The Begin reveal is `enquiry-mask-reveal-radial`, **5000ms from a 7400ms delay**
(`app/globals.css:185`), so it animates 7400 → 12400ms. The 641ms task lands squarely inside it.

⚠ **These numbers are from 4 August and have not been re-measured today.** Carl confirms the stall
is still visible by eye. If the Architect's reasoning depends on the exact figures, they should be
re-taken — this project's own rule is that a recorded measurement is a claim about the present.

---

## The mechanism, read out of the code today

**Two separate warm-ups exist, for two different canvases.** The one in question is the card
warm-up.

**`enquiry-opening.tsx:494-552`** — `cardCanvasWarm` state, gated on `beginActive`:

```js
if (!beginActive) return;
timerId = window.setTimeout(() => {
  idleId = window.requestIdleCallback(() => setCardCanvasWarm(true), { timeout: 6000 });
}, OPENING_WARM_LEAD_MS);          // 600ms  (:150)
```

**`enquiry-opening.tsx:1204-1220`** — what that state mounts:

```jsx
{stage === "opening" && cardCanvasWarm && (
  <div aria-hidden style={{ position:"absolute", width:576, height:104, visibility:"hidden" }}>
    <AnswerCardCanvas active={false} warm />
  </div>
)}
```

⚠ **`beginActive` is set at the Begin mask's `animationstart` — i.e. at 7400ms, the moment the
reveal BEGINS.** So the warm-up is gated to start 600ms into a 5000ms animation, then waits for an
idle callback that a busy thread will not grant, and the 6000ms backstop fires it anyway. **The
warm-up is scheduled, by construction, into the middle of the Begin reveal.**

### ⚠ One correction to the handoff's framing

The handoff describes the warm-up as landing on the reveal by accident. **It does not — the gate
places it there.** `beginActive` was chosen deliberately, and the comment at `:505` explains why:
two fixed leads (900ms, then 5200ms) both landed inside the opening, so the author switched from a
DURATION to a STATE. That reasoning is sound and the file has learned it three times (`:718`).

**The flaw is that the chosen state is the start of the last animation rather than its end.** It is
the correct instinct pointed at the wrong edge.

---

## What has been tried, and what each attempt tells us

| attempt | result |
|---|---|
| fixed lead of 900ms | 920ms task on the text reveals |
| fixed lead of 5200ms | moved to +7194ms — still mid-choreography |
| gate on `beginActive` (current) | moved onto the Begin reveal |
| gate on `animationend` | **stall gone, CARDS GONE** — reverted `8e562ed` |

⚠ **The fourth attempt is the informative one.** Gating on `animationend` removed the stall — 6
dropped frames to 3, the 641ms task gone — and the cards never appeared. The probe reported *"the
warm-up canvas now never mounts"* and the entrance running **6 seconds earlier**. Both were
symptoms of the gate never opening, and both were written up at the time as possible improvements.

**An entrance that gets dramatically faster because a dependency stopped happening is a defect
report, not a win.** That misreading is recorded as a correction; it is not the question here.

**The question it raises IS the question here:** why does the entrance depend on the warm-up at
all? A warm-up whose only job is to populate a driver cache should be removable without the cards
disappearing. **That it is not means the coupling is real and undocumented.**

---

## The Builder's read, offered for correction

**The four symptoms may be one root cause.** The discarded warm-up canvas, the ~1.9s precompile,
the card-1 anchor lateness and this stall all resolve to: **a second WebGL context that must be
built somewhere, and every "somewhere" is inside an animation.** The opening is ~11.5s of
continuous CSS choreography, so there is no genuinely idle gap for `requestIdleCallback` to find —
which is why every backstop timeout has fired unguarded.

⚠ **And the warm-up may be warming nothing.** Measured 4 August: the warm-up canvas UNMOUNTS at
+6902ms and the real Q5 canvas MOUNTS at +6913ms. **A WebGL context is per-canvas** — programs,
PMREM and the transmission target all die with it. The replacement rebuilds them from scratch, at
exactly the moment the lockup begins its fade. If that is right, **the warm-up's only cross-context
benefit is ANGLE's binary cache** (the Architect's own observation, opening-stutter answer §3), and
every fix aimed at making the warm-up better was aimed at the wrong object.

---

## What is being asked

1. **Is the option-D restructure the right fix here** — one canvas instead of two, mounted early
   and revealed late, the pattern the contact layer already uses at `enquiry-opening.tsx:1104`?
   The prior answer noted: *"The objection at `:1111` is true of MOVING the node, not of rendering
   it once at a stable position and placing it with CSS."*

2. **If yes — what makes the cards depend on the warm-up?** The `animationend` attempt says the
   entrance is gated on something the warm-up sets. That coupling must be understood before the
   two canvases are collapsed into one, or the restructure reproduces the same failure at a
   larger blast radius.

3. **If no — is there a correct edge to gate on?** `animationend` at 12400ms is after the reveal
   but the cards are due before that; `animationstart` is where the damage is.

4. **Is there an instrument that would settle this in one run**, in the style of the
   `linkProgram`/`getUniforms` gap probe from the opening-stutter answer?

---

## Constraints the answer must respect

- ⚠ **The `FilamentLight`s must stay in the always-visible outer group.** Lights are gathered with
  `traverseVisible` and `numPointLights` is in the program cache key. Move one into a hidden group
  and every program warmed by the two-state precompile becomes the wrong variant — silently.
- ⚠ **The warm-up canvas must keep a real measured size**, never `display:none` or a zero box: the
  canvas maps one world unit to one CSS pixel from its measured size (`:1189`).
- **Approved layers are locked** — the frosted glass material (D-028), the filament border (D-029),
  the corridor and memory rail (D-022/023/024). This is a timing and mounting problem; **no
  approved visual layer should change to solve it.**
- **The card choreography requires the cards to exist during the phrase** (Carl's walk: card 1 at
  the reveal's midpoint), so "defer it again" is not available — `:479`.
- ⚠ **`chunk-scope.json` is still deleted; the repo is fail-open.** No mechanical scope enforcement
  is in place for whatever chunk follows from this answer.

---

## Files the answer will most likely touch

- `components/enquiry/enquiry-opening.tsx` — `:150` `OPENING_WARM_LEAD_MS`, `:494-552` the warm
  gate, `:1204-1220` the warm-up mount
- `components/enquiry/answer-card-canvas.tsx` — `useScenePrecompile`, `useLocalEnvMap`
- `app/globals.css:185` — the 7400ms/5000ms Begin reveal

## Prior answers not to be re-derived

- `live-work/architect-answer-opening-stutter.md` — the two-variant compile, `fromScene`'s fourth
  argument being the far plane, option D
- `live-work/architect-answer-lockup-fade.md`
- `live-work/references/card-1-anchor.md` — item 2 of Carl's order, downstream of this one

---

*Written by the Builder. The Architect's own window is the authority on the answer; if this
question has misstated the mechanism, the correction is more useful than the answer.*
