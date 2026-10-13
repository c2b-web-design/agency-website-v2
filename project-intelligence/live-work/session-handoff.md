# Session Handoff — 13 October 2026 (end). THE GOLD `Start a conversation` BUTTON IS LIVE ON `/about` §4. NEXT: STEP 2 OF §2's RETURN RULES, THEN THE MOCK CONVERSATION.

⛔ **READ THIS FIRST, THEN `project-intelligence/` AS NORMAL.** Chat history is not canonical (D-006).
**Delete this file at the end of the session that reads it, once its replacement is written.**
**The full record: D-088's 13 October entries at the END of `decisions.md` (from "THE THIRD MEMBER OF THE BUTTON FAMILY: GOLD"); R-047 – R-051 (`reviews/review-log.md`).**

---

## ⛔ WHERE THINGS STAND

**Committed and pushed `b9f19ba`** (Carl: *"Looks great. Commit and push"*, R-051), after a clean-checkout build. ⚠ ONE LINE IS NOT COMMITTED: the last bullet of `decisions.md` (the record of `b9f19ba` itself) — commit it with the next change. This handoff is force-added (staged), not committed.

**What is on the site now:**
- **`/about` §4: the gold button** — the family's third member: the desk mark's gold as paint (#FFE39E, metalness 1, roughness 0.4) under the clay's lamps + the teal's moving lamp; words AND letter sides #1E1E24; **2×, 381.1 × 82** (the teal's height); §4's text scaled as the home `#contact` (h2 48, p 20, `max-w-4xl`, button `mt-18`). One component for both buttons: `FamilyButton` in `components/home/whoweare-button.tsx` (`MEMBERS`; the file keeps its first member's name).
- **Both buttons load as themselves (the cold-load fix):** each paints a STILL of its own first frame from the first paint (`public/buttons/<member>-rest@{1,2}x.png`) and the live canvas takes over on the identical frame (pixel-proven). ⛔ **Re-run `live-work/scripts/family-button-stills.mjs` after ANY change to a button's look, geometry, label or size.**
- **The desk mark's geometry builds in a Web Worker** (`components/about/desk-mark.worker.ts`; inline fallback).
- **The room draws nothing while its canvas is off screen** (`neon-bloom.tsx`) — the cause of the gold button's stutter at §4 (a GPU-shared running cost, not loading). Off screen it **precompiles** its shaders (`compileAsync`), and — **Carl's option A** — does ONE hidden full render once the desk mark is in; the gold button waits on its still for that (`lib/room-warm.ts`, the one coupling; 6 s backstop). `shadows` "soft" → "percentage" (three 0.185 already drew PCF).
- Dev server RUNNING on :3000 (PID 3204 at start) — stop it by PID tree and confirm the port free if a checkpoint opens.

## ⛔⛔ NEXT SESSION — IN THIS ORDER (Carl: *"The mock convo will be in the next session. We will implement Step 2 first though."*)

**1. STEP 2 — §2's RETURN RULES (designed by Carl, 13 October; not built).** Step 1 (off when out of sight) is built. Step 2:
- **Lingering in §3 = 3 s** (Carl: *"3s it is"*): §3 covering ≥ ~60% of the window for 3 s re-arms §2 — **§1's rules**: the ignition fires again when the wipe clears CA. The timer resets if the reader leaves §3 first. (A video pressed in §3 also re-arms/stops — later, the player is a placeholder.)
- **Passing through §3 from §4 to §2 (or a Roles jump)** → §2 **STATIC: neon OFF, cards EMPTY, nothing animating**, re-armed in the background.
- **A "start" or "restart" control** activates it — *"doesnt have to be on the desk"*; on press the FIRST thing is **card 1's neon flicker**, then the text reveal and card 2 *"in the normal way"* (the existing sequence from its start). ⚠ The control is a NEW ELEMENT — its own brainstorm, then mesh → material → light; Carl decides its place and form. Step 2's logic can be built before it (a temporary trigger), Carl's call.
- **The sequence, measured** (`about-s2-sequence-look.mjs`): CA strikes 0 s → text 2.4 s → CB 23.9 s → CD 49.5 s → CA out 56.2 s → CS 66.9 s → CB out 84.4 s → CA again 85.3 s (loop ~85 s). **Restart = the cards reset, then the SAME `ignite()`** (`neon-bloom.tsx` — the only way a track starts). ⚠ §5a/§5b: state that now survives a boundary (the static / re-armed state) and the text's clock — enumerate what depends on the current behaviour before building.
- New chunk scope needed (`live-work/chunk-scope.json` is still on `about-room-warm` — replace it; Carl names the files).

**2. THE MOCK CONVERSATION for the film** (`C:\Users\Carl Buckley\Videos\C2B Films\01 Who we are button\01 Discussion\`, EMPTY). Carl opens with what we are doing and a brainstorm; **the Builder answers ONLY about the TEAL button** (as decided 2 Sept → 12 Oct: D-088's entries — three.js with existing geometry; filmed by stage; Next step's profile, wider; teal #1FB2C4 from `brand-assets/images.jpg`; one moving light + a global light; height 41; the family). It ends where Plan mode would begin (Step 2's footage exists). **The Builder takes 2–3 screenshots** of the chat panel into `01 Discussion/` — a PowerShell `CopyFromScreen` of the 1920 × 1080 screen works (tested); crop the explorer/taskbar; write the reply, THEN capture. No em dashes in those replies (they may become stills).

## ⚠ OPEN — WITH OWNERS

- **Carl:** the restart control's form and place; the gold/teal "approved" wording (R-050/R-051 recorded as "looking good"/"looks great", not "approved"); the desk mark arriving ~2.7 s after load (a fast Roles jump sees CA strike before the mark — pre-existing, reported); the three stills of 13 Oct 12:37 in the film's `06 On the page/` + 3 `shot-list.md` lines (verification frames from `whoweare-home-verify-roll.mjs`, not takes — keep or remove?).
- **Builder:** one unexplained 133 ms frame in 1 of 3 direct-`#start` runs (no main-thread task — GPU-side); a ~240 ms freeze on a DIRECT `#start` load was covered by option A (the button waits) — re-measure if anything changes; older `/about` scripts using `networkidle` will time out (below).

## ⚠ STANDING / CORRECTIONS THIS SESSION

- ⛔ **WHAT IS APPROVED IS WHAT LOADS** (Carl: *"otherwise im approving under false pretenses"*). Before asking for any visual approval, show a COLD LOAD (a fresh refresh, and production) and report the time to the final look. Memory: `feedback_approval_includes_the_cold_load`.
- ⛔ **"No plan" for the gold button** (*"we have the teal button as reference"*) — passes still each approved by eye. Structure (§5a) still went to Carl: the second canvas, the worker, the room off screen, option A.
- **`/about` never reaches Playwright's `networkidle` now** (the worker is terminated after answering; the test browser never sees its request end). Open `/about` with `waitUntil: "load"`.
- **Lint covers `live-work/scripts/`** — `const cv = this` trips `no-this-alias`; use the WebGL context's own `c.canvas`.
- **Git Bash rewrites a `/about#start` argument into a Windows path** — prefix `MSYS_NO_PATHCONV=1`.
- **Builder slips this session:** a bench variable named `side` (taken) broke `/proto/button` for a minute; the first stills were 1 px short (a screenshot clip rounds — read the canvas's own pixels); step 1 caused a 1.6 s scroll-up freeze on a direct `#start` load (fixed by precompile + option A); reported "one still" in the film folder when it was three.
- Carl's design principle, his words: *"the staggered sequence"* hides loading — card 1's stutter covers the text's preparation; `/start`'s opening waits for its compile (`openingArmed`).

---

*Written 13 October 2026, end of session. Replaces the 12 October session-2 handoff.*
