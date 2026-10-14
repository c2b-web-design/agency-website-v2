# Structural note — §2's return rules, step 2 (14 October 2026)

**For Carl, to route to the Architect if he wishes.** CLAUDE.md §5a / §5b. Nothing is built yet.
Chunk scope: `about-s2-return-step2` — `neon-bloom.tsx`, `card-extrude.tsx`, `about-card-canvas.tsx`,
`app/about/page.tsx` (Carl, 14 October).

**Carl's design (13 October, D-088):** a 3 s linger in §3 re-arms §2 (§1's rules); passing through §3 from §4
(or a Roles jump) leaves §2 STATIC — neon off, cards empty, nothing animating; a restart control starts it, card
1's flicker first. **14 October:** *"The "restart" doesnt need an elaborate button. The user would of been in this
section previously, they just need a way of triggering the cards should they wish to."*

---

## 1. Why this is structural

- **State that survives a boundary it used to die at.** Today §2 has one transition (dark → playing, once per
  visit) and the sequence then runs for the life of the page. Step 2 gives §2 a play state that changes when
  the reader is in §3 and §4 — places the canvas cannot see.
- **A DOM control drives the three.js scene.** The button is HTML in the page. `ignite()` is inside the R3F tree.
  Something has to connect the two, and that's a new mechanism.
- **The one sequence clock (`sequenceRef`) gets reset.** Four consumers read it (§3 below).

## 2. The proposed shape

**Three states, ONE owner: `NeonBloom`.** It already owns `ignite()` (the only way a track starts) and the
trigger, so the state lives there too. No second source of truth.

| state | looks | what starts it |
|---|---|---|
| **FRESH** (as today before the first strike) | neon off, cards empty, desk mark unlit | the trigger (below) |
| **PLAYING** (as today) | the sequence, looping | — |
| **STATIC** | the same look as FRESH, plus the restart button | the button only |

- **PLAYING / FRESH → STATIC: on reaching §4** (§4 covering ≥ 60% of the window — §3's threshold). It goes static
  *there*, off screen, so the reader coming back up never sees a lit card go out.
- **STATIC / PLAYING → FRESH: a 3 s linger in §3** (`#examples` ≥ 60% of the window for 3 s; resets if the
  reader leaves first; a hidden tab doesn't count).
- **STATIC → PLAYING: the button** → `ignite()`, the same call as today. The cards are already empty, so "reset,
  then ignite" is just `ignite()`. The sequence runs from its start: CA's flicker first, then the text, then CB.
- **Unchanged:** §2 → §3 and back within 3 s, or into the runway and back: the sequence runs on (Step 1's rule).

**The trigger, both directions — DECISION A (recommended):** `roomWipeClearsCA(canvas) && wallCardsInView(canvas)`.
- From §1 the wall is in view from landing (the room is behind §1), so the wipe governs. **No change to the
  approved path.**
- From below, the wipe reads fully opaque everywhere under §2's top (`roomWipe` is derived from `#roles`; above
  the window it reads p = 1). So the wall coming into view governs. That's your 23 September trigger (*"when the
  wall cards come into full view"*), already in the code.
- ⚠ **This fixes a pre-existing fault, MEASURED today** (`live-work/scripts/about-s2-unseen-strike-probe.mjs`):
  a page opened at `#examples` ignites §2 at 1.6 s, and at `#start` at 1.0 s **with the room canvas off screen**.
  That's the trigger reading true below §2, with nobody looking. With A, a reader arriving at §4 first gets §2's
  first ignition when they reach it, not a sequence already part-played.

**The restart control — DECISION B:** a plain HTML `<button>`, small, text only, low contrast. It sits at the
bottom centre of §2, appears only in STATIC, and goes away on press. Keyboard focusable. Proposed label: **"Restart"**
(your word). ⚠ The `#roles` block is held empty of visible copy on purpose (the wall's negative space). The
button sits below the cards and only shows in STATIC, but its place is yours.
- No canvas, no WebGL (§5a worked cases 1 and 2).

**The bridge from button to `ignite()` — DECISION C (recommended):** a small exported subscribe/notify object in
`neon-bloom.tsx`, the `lib/room-warm.ts` pattern. `NeonBloom` writes the state and registers its restart. The
button (a client component exported from `about-card-canvas.tsx`, placed in `page.tsx`'s §2) reads the state and
calls restart. Rejected:
- **A `window` CustomEvent:** an untyped coupling that's invisible to a reader.
- **React context through `RoomStage`:** it relies on R3F's context bridge, and the button would have to sit
  inside the sticky stage.
- **A new `lib/s2-play.ts`:** cleanest, the same as `room-warm.ts`, but it's outside the authorised files. It's
  yours to name if you prefer it.

**Desk mark — DECISION D (recommended): UNLIT in FRESH and STATIC, brought up again with CA on restart.** It
follows the clock, as on first arrival. Your own reading (10 October): *"A light is being shone on the team by the
info dump and also the logo."* The alternative is to keep it lit once lit, which needs a second clock for the mark.

## 3. What depends on the current behaviour (§5b)

1. **`sequenceRef` — read by four things.**
   - **The cards' text** (`card-extrude.tsx`). ⚠ With the clock null, the frame **returns early WITHOUT hiding its
     lines**, so they would freeze mid-word. STATIC needs an explicit hide.
   - **The desk mark's light** (null → unlit, D).
   - **The wobble's pose** (null → none).
   - **The wobble's wake timer** (polls every 100 ms while null; after a reset, a timer set on the old clock can
     wake late, which is harmless while the text animates and asks for frames anyway).
   - **The tracks themselves.**
   - Resetting means `clock.started = false` and `sequenceRef = null`, then one frame to write it.
2. **"Once per visit — do not re-arm on scroll-back"** (Carl, 23 September). **Amended by your 13 October design**:
   it re-arms only after the 3 s linger, and passing through gives STATIC. Recorded as an amendment in
   `decisions.md`, with a forward-pointer on the original comment.
3. **Step 1 (nothing drawn off screen):** unchanged. Step 1's track write still runs off screen, so the levels are
   already 0 by the first frame back. Entering STATIC asks for one frame so that write happens. ⚠ **To assert,
   not assume:** the first frame back in STATIC shows no lit rim and no text.
4. **Option A (`room-warm`) and the precompile:** independent of the sequence. No program changes between lit and
   unlit. Unaffected.
5. **The `ignite()` watchdog:** the button and the re-armed trigger both go through `ignite()`. Covered.
6. **`?reignite=`, `?neon=full|off|freeze|none`:** the return rules apply in plain ignite mode only. The tools
   keep their behaviour.
7. **Instrument marks:** a restart adds a second `neon:ignite`. The scripts read `[0]`, the first, so they're
   unaffected.
8. **Reduced motion:** a restart uses the same schedules.
9. **The desk mark's journey and scroll tie:** position-driven, independent of the clock. Unchanged. Only its light
   is clock-driven (D).
10. **The deep-link strike** (above): changed by A, and the change is intended.

**Not watched / not known:** Carl's Chrome; phones; a slow scroll from §4 to §2 vs a jump (both will be measured).

## 3a. Carl's answers (14 October 2026) and what they change

- **A — taken:** *"i take your recommendation."*
- **B — the control is ON CARD 1:** *"A plain button should be on card 1 saying "click to restart". It can then
  disappear as the neon ignites."*
- **C — answered by B:** *"Putting the button on Card 1 makes sense because you are literallt clicking the location
  that starts the process."* ⛔ **The bridge simplifies.** The button now lives in `AboutCardCanvas`, the component
  that already owns `sequenceRef`, positioned in the plate's own coordinate space over CA's projected outline
  (`ROOM_CARD_GUIDES.CA`). So the bridge is the `sequenceRef` pattern: a ref passed to `NeonBloom` (its restart)
  plus a state callback (show/hide). **No module store, no new file, no `page.tsx` placement.**
- **D — the mark stays in the player:** *"After the first visit to sect 2 the logo is in the video player as a user
  navigates to Sect 3. It has done its job and should not be there if a user returns. Once its in the video player
  it stays there."* ✔ **Already true since 10 October** (`DESK_MARK_TIE`, the latch, R-041): the desk is empty on
  return for the page view. No change to the journey.

**Two consequences, both structural (§5a/§5b):**

1. **The mark's light must not follow §2's reset.** `crossing.light` reads `sequenceRef` on every frame, including
   while the mark is latched in the player. A reset to null would put it back to its unlit share (0.1), so the mark
   would go dark in the player. **Proposed:** `DeskMark` keeps the FIRST strike time it sees and never lets go of it,
   so once lit it stays lit for the page view. The wobble reads the same held time. It only plays at play time 0,
   on the desk, so it never runs once the mark has latched.
2. **The button must be clickable, and today it would NOT be.** The stage is `sticky … pointer-events-none`, and
   the `#roles` section and the runway (both later siblings, `relative`) paint OVER it. A button inside the stage
   is under their boxes, so the clicks go to them. That's **the 14 August worked case** (five cards unclickable,
   every instrument green). **Proposed:** `pointer-events-none` on `#roles` and on the runway div (`page.tsx`). Both
   are empty on purpose (`#roles` is held clear of copy; the runway is `aria-hidden`). §5b: neither holds anything
   selectable or clickable, so nothing else depends on them catching the pointer. ⚠ **Asserted, not assumed:** the
   verification asks `document.elementFromPoint` at the button's centre and fails loudly if it isn't the button.
   - Rejected: the button in `#roles` (`page.tsx`). `#roles` scrolls through the runway while the stage stays
     pinned, so a button there drifts off CA.
   - Rejected: a 3D click on CA's mesh (a raycast). That's a new input path into the canvas for one plain button.

**Presentation choice, stated:** the button goes on the IGNITION FRAME (the frame CA's track starts), not on the
click. If an ignition were delayed, it stays until the strike. No fade, because Carl asked for plain. The label is
Carl's words exactly: **click to restart**.

## 4. Verification planned

A Playwright script, frames at each step:
- top → §2 strikes as today
- §4 → back: STATIC, no rim, no text, button shown
- press: CA's flicker first, then the text
- §3 linger 3 s → back: strikes on arrival
- §3 for 2 s → back: still playing
- opened at `#start` → scroll up: first ignition on arrival

Plus lint (the baseline: 1 error, 0 warnings), `tsc` and a cold load.
