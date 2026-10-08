# Session Handoff — 8 October 2026, session 2 (end). THE JOURNEY RUNS END TO END ON PLAIN `/about`. NEXT: THE SCROLL MECHANISM — CARL'S ANSWER.

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written.**
**The full record is D-088's session-2 entries at the END of `decisions.md` (the last 8 bullets) and R-038.**

---

## ⛔ WHERE THINGS STAND

**Pushed, all three Vercel projects GREEN:** `07ad729` (the mark on plain `/about`, the fall at 85 mm left, §3's
placeholder), `a7f512e` (the Vercel fix), `d9060bf` (§3: the canvas into §3, the drop, the wipe), `bad959b` (the crossing,
the light, the growth, legato, speed 0.9). ⚠ **Uncommitted:** this session's records (`decisions.md`, `review-log.md`,
`current-sprint.md`) and this handoff (force-added). Commit when Carl says.
Lint `1 problem (1 error, 0 warnings)`; `tsc` clean. Dev server STOPPED at session end.

**The journey on plain `/about` today (time-driven loop, ~12 s at master speed 0.9):** standing 85 mm left on the desk
→ face plant → teeter → simulated fall → strikes the bin's rim (350 ms; the GROWTH starts) → flat back slaps across the
rim (488 ms) → LEGATO rebound: rise, finish the somersault oblique at the top, a second flip losing momentum while
drifting left, ending halfway to face-on (gold → blue crossing over face-down → end of flip 2; the light rises with the
blue share) → drops from rest into §3, onto the blue logo in the white player placeholder, wiped at its top border.
Switches: `?markslow=` (0.1 = snail's pace), `?flipspeed=`, `?flipcurve=`, `?flip2face=`, `?markenvblue=`,
`?markgrow=0`, `?markdrop=0`, `?markfall=0..1` (hold a point), `?markplay=start|fall|corner|somersault`, `?mark=0`.

## ⛔⛔ NEXT SESSION — THE AGREED SUBJECT: THE SCROLL MECHANISM

**Decided by Carl:** the scroll is tied to the WHOLE mechanism, reversible — *"If they scroll partway and stop and the
logo comes with them they are going to realise."* Time-triggered playback and the Builder's hybrid are RAISED AND NOT
CHOSEN. Also: arriving by Roles → the tie starts there, the logo FADES IN on card one's strike; arriving by scroll → the
§1→§2 wipe already reveals it; release when the logo is in the player.

⛔ **CARL'S OPEN ANSWER (he will bring it):** does the page HOLD while the scroll drives the logo (readers move it, see
it, go back to reading — the Builder's recommendation) or move with it (the existing one screen, no change)? His steer
already given: *"Your reccomendation seems solid though except we wont be able to lengthen the image. We will have space
before Sect 3."* → the runway is NOT a longer pinned room image; it is SPACE BEFORE §3. ⚠ Its form is undesigned — ASK:
how tall, what it shows, and whether the room stays pinned over it or scrolls away. Any change to the stage or page
lengths is structural (§5a/§5b) — Carl's override from this session covered "work in Sect. 3"; confirm scope.
Inside it, the Builder's proposals (not yet approved): split the scroll between phases IN PROPORTION TO THE TUNED
TIMINGS (a steady scroll replays the legato), and SMOOTH the wheel (the mark chases the scroll target with a short lag).

### ⛔ CARL'S IDEA, RAISED AT THE END — THE WOBBLE (to discuss; NOT decided, NOT built)

Carl's thinking: *"A user will probably press "roles" We may have to tie it to when a user makes a more substantial
movement of the scroll. If they see theres some info to digest are they more likely to have their hand on the mouse.
What if they scroll up to put the top card centre screen?"* His clue: *"Does the user know that our logo is animated? For
all intents and purposes its just sat on the desk."* Then: *"Our logo cant jump (yet) but it can wobble!"* He has a
rough idea of his own and is still thinking it through — **bring HIS version first; do not lead with the Builder's.**

- **The clue's consequence (Builder):** nobody knows it is animated, so DOING NOTHING COSTS NOTHING — until it moves it is
  furniture; the trigger can be conservative; the FIRST movement is the reveal; once it has moved, scroll-tied rewinding
  makes sense to the reader.
- **The wobble (Builder's reading of it):** a small scroll NUDGES it — it rocks and settles on its base: the reader learns
  it is alive without the journey starting, and goes back to reading. ⛔ **The threshold is the object's own TIPPING
  POINT, not an invented number:** at 227.9 mm (centre of mass ~97 mm up, ~9 mm behind the front-bottom edge) it tips
  FORWARD past ~5°; its back edge is ~8 mm behind the centre of mass, so ~4.5° BACKWARD. A nudge under that wobbles; a
  substantial scroll past it tips it onto its face — the face plant we already have — and the journey begins.
  ⚠ Figures from the 8 October measurement (uniform density, the volume centroid) — RE-MEASURE before building.
- **The eventualities a plan must cover (Builder's list, given to Carl):** (1) Roles then reading — fidgety scrolls
  both ways (→ wobbles); (2) scrolling UP to centre the top card — ⚠ that also runs the approved room wipe BACKWARDS
  (D-092; already open in the sprint file: "scroll-up fades it again") — the mark could rock backward; (3) arriving by
  scrolling from §1 without stopping — a big push may tip it at once; (4) big jumps — Space / Page Down, trackpad
  momentum, the **Examples** nav link straight to §3 (lands with the journey complete); (5) scrolling back up after it
  started, or after it is in the player; (6) touch (deferred to mastering), reload mid-page (scroll restored — the mark
  must derive where it should be), window resize.

## ⚠ OPEN — WITH OWNERS

- **Carl:** the scroll mechanism (above); §3's four boxes and which holds the player (the drop's target is measured live
  from `#examples-player-target`, so it follows); the growth (not yet judged — large in the room by the end of flip 2;
  passes into the rim ~140 ms); the blue reading dark over §3's black; the final speed; carried — the gold's paleness,
  the stem's corners, A13, the flat back's finish, R-028 numbering.
- **Builder:** the canvas's cost (~2× pixels every frame) is NOT measured; `card-extrude.tsx`'s `canvasOnScreen` still
  reads the canvas height (only with text-on-landing off); the reflection map gives the mark nothing (from session 1).
- **Housekeeping:** the scratchpad clean-build copy is deleted; `chunk-scope.json` still lists the pass-1 chunk with
  this session's additions (`about-neon.ts` — now LOCKED, `.gitignore`).

## ⚠ STANDING / CORRECTIONS THIS SESSION

- ⛔ **"Can you…?" is a QUESTION** — answer how, then wait (memory saved): the growth was built uninvited and reverted.
  "We will work it out" means together, later.
- ⛔ **Before every push: build a CLEAN checkout** (`git checkout-index -a -f --prefix=<scratch>/` + `npm ci` once).
  A local build passed for five days while Vercel failed on an untracked imported PNG.
- **Locking a file** (`.claude/protected-files.json`) is refused to the Builder by auto mode as self-modification —
  correctly. Carl runs the edit in VS Code's terminal (the `!` prefix does NOT run commands in the VS Code extension).
- `git add` of `live-work/scripts/` needs `-f`; a plain add in the same command stages NOTHING.
- GitHub's anonymous status API allows 60 requests an hour — a long history walk exhausts it; a rate-limited empty
  answer is NOT a Vercel result. The live site (`agency-website-v2-awjv.vercel.app`) is a second witness.
- After any rejected command, check the file: one this session HAD reached `about-neon.ts`.

---

*Written 8 October 2026, session 2, end. Replaces session 1's handoff of the same day.*
