# Session Handoff — 10 August 2026

**Written at the end of the resting-light session.**

**Read this first, then `project-intelligence/` as normal.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written** —
`live-work-protocol.md` §3a.

---

## ⛔ THE STANDING DIRECTIVE

**NEVER comment on how long Carl has been working.** Not the time of day, not the session
length, not a suggestion to stop or resume later. **Carl decides when a session ends and will
say so.** It was not broken this session.

---

## STATE OF THE TREE

**Clean. Everything is committed.** Head is `7b056c2` — *"the traveller is a spotlight on a
tilted ring, and the cone turns with it"*, 8 files, +1900/−116.

`npx tsc --noEmit` clean. Lint at the recorded baseline: **1 problem (1 error, 0 warnings)** —
the known `enquiry-opening.tsx` reduced-motion effect, untouched. Dev server on :3000.

⚠ **`chunk-scope.json` is ABSENT, and the previous handoff called this "still deleted" for
five days running. It was never committed** — `git log --all -- chunk-scope.json` returns
nothing. It is an opt-in file, and fail-open is the hook's documented design
(`.claude/hooks/chunk-scope-guard.js` lines 31–37). **There is nothing to restore.** Write one
when a chunk is scoped; otherwise this is the resting state, not a fault.

---

## ✅ APPROVED BY CARL'S EYE

**The resting light** — *"thats a lot better, lets bag it and tag it before the gremlins move
in."* Committed at `7b056c2`.

**The Q5 stutter fix**, earlier — *"it looks pretty clean"* (86ms, down from 584ms).

**The answer text on the card** — *"That looks great!"*

⚠⚠ **THAT LAST QUOTE APPROVES THE TEXT, NOT THE MATERIAL, AND THE PREVIOUS HANDOFF GOT IT
WRONG.** It recorded *"The satin card with its label — Thats looks great!"*, and this session
read that as approval of the satin FACE. Carl corrected it: *"when the card was approved with
the answer text fixed i used the phrase 'that looks great!'"* — then clarified the broader
point: *"the card in general was approved. If it had dark edges i would of flagged it."*

**So: the card as a whole is approved. Its sheen, anisotropy and body colour were never
separately locked** — and the Builder spent a round of measurement working around a
constraint that did not exist.

⚠ **THE TRANSFERABLE LESSON: RECORD WHAT THE PRAISE WAS POINTING AT, NOT WHAT WAS ON SCREEN
WHEN IT WAS SAID.** A quote widened by one noun becomes a lock nobody agreed to, and the next
session cannot tell the difference because it reads as verified.

---

## 🔴 START HERE — THE FLOATING FACES. IT IS A REGRESSION, NOT A MATERIAL PROPERTY

**Carl, on the current cards:** *"the cards face look like they are floating. It reads black at
the edges."*

⚠⚠ **AND HE ESTABLISHED IT IS A REGRESSION, WHICH IS THE MOST USEFUL FACT AVAILABLE:** *"the
card in general was approved. If it had dark edges i would of flagged it."* **So something
between the approved card and now introduced this.** Do not treat it as a material to be tuned
until that has been looked for.

### What was measured, so it is not re-measured

`verify/face-drivers.mjs`, real GPU, traveller off:

    face, static rig at FULL   57.8
    face, static rig at ZERO   44.4     <- 77% survives with NO lights at all
    face, static rig x2        69.7

**The whole key + fill + ambient rig is worth 13 luminance points out of 58.** The rest is the
baked albedo plus the sheen lobe, neither of which varies with surface angle — so the crown
cannot shade toward its edges.

⚠ **THE BODY COLOUR IS NOT THE MAIN CONTRIBUTOR, THOUGH IT LOOKS LIKE THE OBVIOUS SUSPECT.**
`SATIN_COLOR` is luminance 15.5 while the unlit floor measures 41.7 — the gap is the sheen
(`SATIN_SHEEN_COLOR` is luminance 149, scaled by nothing).

### Two fixes tried and reverted — do not retry either without new evidence

| tried | predicted | measured | verdict |
|---|---|---|---|
| fill 0.35 → 0.8 (Carl: *"you might want to use 2"* lights) | swing 3.06x → 1.83x | face 56 → **58** | reverted |
| `SATIN_COLOR` halved to `#061027` (Carl: *"Darken the baked body"*) | floor ~22 | floor **41.7** | reverted |

**Both were reasonable and both were measuring the wrong surface.** A hand-calculated Lambert
model does not describe `MeshPhysicalMaterial` with sheen and anisotropy live.

### Where to look next

**`git log` the card material back to the approved state and diff it**, rather than tuning
forward. The regression is in there. `verify/card-edge.mjs` profiles a card's edge but did NOT
distinguish approved-HEAD from current — both read face 56, cliff 5px — **so that harness does
not detect this defect and must not be used to certify a fix.**

---

## WHAT THE RESTING LIGHT IS NOW — approved, committed, and the reasoning worth keeping

### The light model

⚠ **IT WAS A PointLight AT `decay = 0`, AND THAT WAS SELF-CANCELLING.** The comment said *"the
bow only means something if distance does"*; decay 0 removes distance from the falloff. **This
is why six earlier attempts read as flat, and why `?travint=6` — seven times the default —
changed nothing.** Now a `SpotLight` at `decay = 2` with a real target object, copied from the
approved contact field on Carl's instruction: *"change from a point light. Ref client info
section."*

### The ring — every value derived from a reference Carl gave

    semi-major 303    the bends sit just outside cards 1 and 3
    semi-minor 150    the front arc passes through card 4
    diagonal   -3     balances the left and right arrivals
    tilt       23.5   Saturn at opposition, frame 4/15/2012 — "the closest"
    centre     y=40   both bends graze the top row's outer corners

⚠ **MEASURING HIS SKETCH'S PIXELS FAILED TWICE.** It requires assuming a scale, and the assumed
grid width was wrong — producing semi-major 352 and 470, both too big. **The card edges are
known exactly; anchor to those.** Carl, twice: *"The diagram is not a guide, its accurate."*

⚠ **THE VISIBLE HALF IS THE LOWER ARC, IN FRONT.** His annotated diagram labels the upper arc
*"back = speed up"* and the lower *"front = slower"*. An earlier build had it inverted.

### The cone turns — keyframed, and Carl named the method

*"can the light be turned itself? so while top left its pointing right. in the middle pointing
at all the faces... While bottom right pointing left."* and *"if i were doing this in Fusion in
DaVinci Resolve i would keyframe it and use easing."*

**A fixed aim point caused an asymmetry he spotted before it was measured** — *"it has an
effect on cards 1,4+5 but hardly any effect on cards 2+3."* Per-card swing was 48.4 (card 5)
against 4.0 (card 2); it is now **9.9–19.2 across all five**.

### ⚠⚠ THE EXIT BUG — THREE ATTEMPTS, TWO WRONG THEORIES, AND THE LESSON IS THE METHOD

Carl reported the light *"shoots off"* leaving card 3, and repeated it after two failed fixes.

| attempt | theory | outcome |
|---|---|---|
| 1 | handover too late → moved it to 0.44 | **cut the glint at 95% of peak** |
| 2 | pass too short → 13500ms + a 150ms bend hold | glint restored, still shoots off |
| 3 | **captured the moment frame by frame** | found it |

**The cause:** in the last two seconds the light moved **nine units** while the AIM raced from
+190 to −300. The cone turned away while the light was still on card 3, so the highlight **died
in place on the word "enquiries"** instead of travelling off the edge.

⚠ **IT WAS NEVER A CLOCK PROBLEM, AND BOTH CLOCK FIXES ARE STILL IN THE CODE** —
`REST_TRAVEL_MS` 13500 and the 150ms hold were compensating for a fault that no longer exists.
**They can safely come down if the pass now feels slow.**

⚠ **AND THE AIM CANNOT LEAD PAST THE LIGHT'S OWN X.** A first correction used 560 and the
highlight vanished entirely — every sampled frame returned an identical 39.61, a frozen image.
The light ends the pass at x=303; the angle to card 3 jumps from 9° at aim 250 to 73° at aim
300. **250 is the limit.**

⚠ **THE METHOD IS THE POINT: Carl said *"take a series of snapshots, youll be able to see what
i mean."* Two rounds of reasoning had failed; the filmstrip found it immediately.**
`verify/card3-exit.mjs`.

### Timing

13500ms visible · **150ms hold at the bottom-right bend** · 350ms behind. Carl's split:
*"instead of the time on the back being 500ms, make it 350ms, but add the 150ms to the bottom
right."*

⚠ **THE HOLD CREEPS, IT DOES NOT FREEZE.** Returning a constant phase would stall the light dead
— the fault `REST_EASE_FLOOR` exists to prevent, after a plain smootherstep once drove the
velocity to 3.8e-12 at both bends. It advances at the pass's own arrival velocity.

### One definition of the path

`restTravelPoint` is called by the light, the helper AND the intensity derivation. **The old
helper built its own straight segments while the light followed a bowed path** — so the marker
Carl was asked to judge the arc by was drawing a different arc. Eighth instance of this
project's harness-lies class.

---

## THE THREE STATES — Carl's model

| state | spec |
|---|---|
| **Resting** | ✅ **DONE AND APPROVED**, `7b056c2` |
| **Hover** | the answer text becomes **teal** — the rail system's colour — gentle transition |
| **Selected** | filament warms off → amber → **stops halfway between amber and red** |

⚠ **THE TEXT CANNOT TAKE A TINT FROM LIGHT ALONE.** Measured (`verify/label-lit.mjs`): the
glyphs sit at luminance 208, so a warm light shifts them only 5 points. **A colour change needs
the texture redrawn, OR the glyph luminance dropped so light can tint it.** Carl's call.

---

## Still open, unchanged

- **Card 2 is the weakest at swing 9.9.** It is centre-row and never gets the close corner-pass
  the outer cards get. None of this session's geometry fixes reach it; it needs its own idea.
- **`GLASS_CLEARCOAT` = 0, inert.** The grid that dismissed it ran on the OLD geometry.
- **The ground plane** — three attempts, stashed as `ground-gradient-attempt-7aug`.
- **~2.4MB of three + fiber loads eagerly.** `next/dynamic` flagged, not done.
- ⚠ **SHADOW.** Sixth session parked.
- **~70ms of Q5 stutter remains** — needs the shared-canvas host (route A), not authorised.
- ⚠ **ACCESSIBILITY DEBT:** the answer text is a texture, not in the a11y tree. Mandatory to fix
  when these become real controls.

---

## How to look at it

```
npm run dev
http://localhost:3000/start                       the corridor
http://localhost:3000/start?lighthelpers=1        the ring's full path + a ball on the light
http://localhost:3000/start?noglobal=1            static rig off — the traveller alone
http://localhost:3000/start?cardrig=1             [7] satin tightness, [a] smear, [s] sheen,
                                                  [9] light, [p] power, [z] height, [0] print
```

⚠ **`?sag=` AND `?fwd=` ARE DEAD DIALS.** They belonged to the old bent-curve model. Turning
them now does nothing — the ring is defined by semi-major/semi-minor/tilt/diagonal/centre.

⚠ **`?travint=` CHANGED MEANING.** It was a raw intensity on a decay-0 point light (default
0.9); it is now the brightness DELIVERED at nearest approach (default 1.6), scaled internally
by the measured distance squared. **Old values do not transfer.**

⚠ **MEASURE HEADED, WITH `--enable-gpu`, AND PRINT THE RENDERER.** Confirmed real:
`ANGLE (AMD Radeon(TM) Graphics, D3D11)`.

**New harnesses this session:** `rest-vs-field.mjs` (both rigs, one run, same GPU),
`per-card-reach.mjs` (per-card swing — the one that quantified the asymmetry),
`card3-exit.mjs` (**the filmstrip that found the exit bug**), `face-drivers.mjs` (what actually
lights the face), `card-edge.mjs` (⚠ does NOT detect the floating defect — see above),
`spot-wired.mjs`.

⚠ **ONE HARNESS WAS WRITTEN AND DELETED RATHER THAN CITED.** `face-lobes.mjs` tried to isolate
sheen from anisotropy through the rig's keyboard dials and returned **identical deltas (17.93)
for three different dials** — the keys stopped reaching the rig after the first press.
Identical results from different inputs is a lying harness. It was thrown away, not reported.

---

*10 August 2026. The resting light is approved and committed. The next subject is the floating
faces — and the most valuable thing known about them is Carl's own observation that the
approved card did not have them, which makes it a regression to find rather than a material to
tune.*
